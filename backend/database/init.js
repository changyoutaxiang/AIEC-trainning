/**
 * AIEC 用户数据库初始化脚本
 * 
 * 功能：
 * 1. 创建用户表 (users)
 * 2. 创建学习记录表 (learning_records)
 * 3. 创建习惯进度表 (habit_progress)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'aiec_users.db');

// 创建数据库连接
function createDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('数据库连接失败:', err.message);
                reject(err);
            } else {
                console.log('✅ 数据库连接成功');
                resolve(db);
            }
        });
    });
}

// 创建用户表
function createUsersTable(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                department TEXT,
                position TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                status TEXT DEFAULT 'active'
            )
        `;
        
        db.run(sql, (err) => {
            if (err) {
                console.error('创建用户表失败:', err.message);
                reject(err);
            } else {
                console.log('✅ 用户表创建成功');
                resolve();
            }
        });
    });
}

// 创建学习记录表
function createLearningRecordsTable(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS learning_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                habit_id INTEGER NOT NULL,
                unit_id TEXT,
                exercise_type TEXT NOT NULL,
                exercise_id TEXT NOT NULL,
                user_response TEXT,
                ai_evaluation TEXT,
                score INTEGER,
                completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;
        
        db.run(sql, (err) => {
            if (err) {
                console.error('创建学习记录表失败:', err.message);
                reject(err);
            } else {
                console.log('✅ 学习记录表创建成功');
                resolve();
            }
        });
    });
}

// 创建习惯进度表
function createHabitProgressTable(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS habit_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                habit_id INTEGER NOT NULL,
                unit_id TEXT,
                progress_data TEXT,
                completion_percentage INTEGER DEFAULT 0,
                last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, habit_id, unit_id)
            )
        `;
        
        db.run(sql, (err) => {
            if (err) {
                console.error('创建习惯进度表失败:', err.message);
                reject(err);
            } else {
                console.log('✅ 习惯进度表创建成功');
                resolve();
            }
        });
    });
}

// 初始化数据库
async function initDatabase() {
    try {
        const db = await createDatabase();
        
        await createUsersTable(db);
        await createLearningRecordsTable(db);
        await createHabitProgressTable(db);
        
        console.log('🎉 数据库初始化完成！');
        console.log(`📍 数据库位置: ${DB_PATH}`);
        
        // 关闭数据库连接
        db.close((err) => {
            if (err) {
                console.error('关闭数据库连接失败:', err.message);
            } else {
                console.log('📊 数据库连接已关闭');
            }
        });
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    }
}

// 导出数据库路径和初始化函数
module.exports = {
    DB_PATH,
    initDatabase,
    createDatabase
};

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
    initDatabase();
}