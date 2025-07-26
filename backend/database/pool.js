/**
 * 数据库连接池管理模块
 * 
 * 功能：
 * 1. 创建和管理SQLite数据库连接池
 * 2. 提供连接获取和释放方法
 * 3. 优化数据库连接复用，提升性能
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabasePool {
    constructor(options = {}) {
        this.dbPath = options.dbPath || process.env.DATABASE_PATH || path.join(__dirname, 'aiec_users.db');
        this.maxConnections = options.maxConnections || 10;
        this.timeout = options.timeout || 30000; // 30秒超时
        
        // 连接池存储
        this.availableConnections = [];
        this.busyConnections = [];
        this.waitingQueue = [];
        
        console.log(`🔗 初始化数据库连接池`);
        console.log(`📊 最大连接数: ${this.maxConnections}`);
        console.log(`🕐 连接超时: ${this.timeout}ms`);
        console.log(`📍 数据库路径: ${this.dbPath}`);
    }

    /**
     * 创建新的数据库连接
     */
    createConnection() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ 数据库连接创建失败:', err.message);
                    reject(err);
                } else {
                    // 为连接添加标识和创建时间
                    db._poolId = Date.now() + Math.random();
                    db._createdAt = Date.now();
                    console.log(`✅ 创建数据库连接: ${db._poolId}`);
                    resolve(db);
                }
            });
        });
    }

    /**
     * 获取数据库连接
     */
    async getConnection() {
        return new Promise(async (resolve, reject) => {
            // 如果有可用连接，直接返回
            if (this.availableConnections.length > 0) {
                const connection = this.availableConnections.pop();
                this.busyConnections.push(connection);
                console.log(`🔄 复用数据库连接: ${connection._poolId}`);
                resolve(connection);
                return;
            }

            // 如果未达到最大连接数，创建新连接
            if (this.getTotalConnections() < this.maxConnections) {
                try {
                    const connection = await this.createConnection();
                    this.busyConnections.push(connection);
                    resolve(connection);
                    return;
                } catch (error) {
                    reject(error);
                    return;
                }
            }

            // 如果连接池已满，加入等待队列
            const timeoutId = setTimeout(() => {
                const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
                if (index !== -1) {
                    this.waitingQueue.splice(index, 1);
                    reject(new Error('获取数据库连接超时'));
                }
            }, this.timeout);

            this.waitingQueue.push({
                resolve,
                reject,
                timeoutId
            });

            console.log(`⏳ 连接池已满，加入等待队列 (队列长度: ${this.waitingQueue.length})`);
        });
    }

    /**
     * 释放数据库连接
     */
    releaseConnection(connection) {
        if (!connection || !connection._poolId) {
            console.warn('⚠️ 尝试释放无效的数据库连接');
            return;
        }

        // 从忙碌连接中移除
        const busyIndex = this.busyConnections.findIndex(conn => conn._poolId === connection._poolId);
        if (busyIndex !== -1) {
            this.busyConnections.splice(busyIndex, 1);
        }

        // 检查是否有等待的请求
        if (this.waitingQueue.length > 0) {
            const waiting = this.waitingQueue.shift();
            clearTimeout(waiting.timeoutId);
            this.busyConnections.push(connection);
            waiting.resolve(connection);
            console.log(`🔄 将连接分配给等待的请求: ${connection._poolId}`);
        } else {
            // 放回可用连接池
            this.availableConnections.push(connection);
            console.log(`📤 释放数据库连接: ${connection._poolId}`);
        }
    }

    /**
     * 获取连接池状态
     */
    getStatus() {
        return {
            available: this.availableConnections.length,
            busy: this.busyConnections.length,
            waiting: this.waitingQueue.length,
            total: this.getTotalConnections(),
            maxConnections: this.maxConnections
        };
    }

    /**
     * 获取总连接数
     */
    getTotalConnections() {
        return this.availableConnections.length + this.busyConnections.length;
    }

    /**
     * 执行数据库查询（自动管理连接）
     */
    async query(sql, params = []) {
        let connection = null;
        try {
            connection = await this.getConnection();
            
            return new Promise((resolve, reject) => {
                const method = sql.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';
                
                connection[method](sql, params, function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        // 对于 INSERT/UPDATE/DELETE，返回变化信息
                        if (method === 'run') {
                            resolve({
                                lastID: this.lastID,
                                changes: this.changes
                            });
                        } else {
                            resolve(result);
                        }
                    }
                });
            });
        } finally {
            if (connection) {
                this.releaseConnection(connection);
            }
        }
    }

    /**
     * 执行单行查询
     */
    async get(sql, params = []) {
        let connection = null;
        try {
            connection = await this.getConnection();
            
            return new Promise((resolve, reject) => {
                connection.get(sql, params, (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        } finally {
            if (connection) {
                this.releaseConnection(connection);
            }
        }
    }

    /**
     * 关闭连接池
     */
    async close() {
        console.log('🔒 正在关闭数据库连接池...');
        
        // 清理等待队列
        this.waitingQueue.forEach(waiting => {
            clearTimeout(waiting.timeoutId);
            waiting.reject(new Error('连接池正在关闭'));
        });
        this.waitingQueue = [];

        // 关闭所有连接
        const allConnections = [...this.availableConnections, ...this.busyConnections];
        
        for (const connection of allConnections) {
            try {
                connection.close();
                console.log(`🔒 关闭数据库连接: ${connection._poolId}`);
            } catch (error) {
                console.error(`❌ 关闭连接失败: ${connection._poolId}`, error);
            }
        }

        this.availableConnections = [];
        this.busyConnections = [];
        
        console.log('✅ 数据库连接池已关闭');
    }

    /**
     * 打印连接池状态（调试用）
     */
    printStatus() {
        const status = this.getStatus();
        console.log('📊 数据库连接池状态:');
        console.log(`   可用连接: ${status.available}`);
        console.log(`   忙碌连接: ${status.busy}`);
        console.log(`   等待队列: ${status.waiting}`);
        console.log(`   总连接数: ${status.total}/${status.maxConnections}`);
    }
}

// 创建全局连接池实例
const dbPool = new DatabasePool({
    maxConnections: 10,
    timeout: 30000
});

// 导出连接池实例和类
module.exports = {
    dbPool,
    DatabasePool
};