/**
 * AIEC学习系统 - Zeabur云端部署入口文件
 * 
 * 功能:
 * 1. 启动后端API服务 (端口3000)
 * 2. 提供前端静态文件服务
 * 3. 处理SPA路由
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
require('dotenv').config();

// 引入后端路由
const aiRoutes = require('./backend/routes/ai');
const authRoutes = require('./backend/routes/auth');
const leaderboardRoutes = require('./backend/routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据库初始化
async function initializeDatabase() {
    // 首先检查持久化存储是否可用
    const persistentDataPath = '/data';
    let usePersistentStorage = false;
    
    try {
        if (fs.existsSync(persistentDataPath)) {
            fs.accessSync(persistentDataPath, fs.constants.W_OK);
            usePersistentStorage = true;
            console.log('✅ 持久化存储可用: /data');
        } else {
            console.log('⚠️  持久化存储路径不存在: /data');
        }
    } catch (err) {
        console.log('⚠️  持久化存储不可写:', err.message);
    }
    
    // 根据持久化存储可用性选择数据库路径
    let dbPath;
    if (usePersistentStorage && process.env.DATABASE_PATH) {
        dbPath = process.env.DATABASE_PATH;
        console.log('🎯 使用持久化数据库路径');
    } else {
        dbPath = path.join(__dirname, 'backend/database/aiec_users.db');
        console.log('⚠️  回退到本地数据库路径（数据将在重新部署时丢失）');
    }
    
    const dbDir = path.dirname(dbPath);
    
    console.log(`📍 数据库路径: ${dbPath}`);
    
    // 确保数据库目录存在
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 数据库目录已创建: ${dbDir}`);
    } else {
        console.log(`📁 数据库目录已存在: ${dbDir}`);
    }
    
    // 检查数据库文件是否已存在
    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`📊 发现现有数据库文件，大小: ${stats.size} bytes，修改时间: ${stats.mtime}`);
    } else {
        console.log(`📊 数据库文件不存在，将创建新数据库`);
    }
    
    // 检查目录权限
    try {
        fs.accessSync(dbDir, fs.constants.W_OK);
        console.log(`✅ 数据库目录可写: ${dbDir}`);
    } catch (err) {
        console.error(`❌ 数据库目录权限问题: ${err.message}`);
    }
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ 数据库连接失败:', err);
                reject(err);
                return;
            }
            
            console.log('✅ 数据库连接成功');
            
            // 创建用户表（包含password字段）
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    department TEXT,
                    position TEXT,
                    password TEXT NOT NULL,
                    avatar TEXT DEFAULT 'default.png',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    status TEXT DEFAULT 'active'
                )
            `;
            
            // 创建学习记录表
            const createLearningRecordsTable = `
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
            
            // 创建习惯进度表
            const createHabitProgressTable = `
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
            
            // 依次创建表
            db.serialize(() => {
                db.run(createUsersTable, (err) => {
                    if (err) {
                        console.error('❌ 创建用户表失败:', err);
                        reject(err);
                        return;
                    }
                    
                    // 检查表是否已存在数据
                    db.get("SELECT COUNT(*) as count FROM users", [], (countErr, row) => {
                        if (countErr) {
                            console.log('✅ 用户表创建成功（新表）');
                        } else if (row.count > 0) {
                            console.log(`✅ 用户表确认存在，包含 ${row.count} 个用户`);
                        } else {
                            console.log('✅ 用户表创建成功（空表）');
                        }
                    });
                });
                
                db.run(createLearningRecordsTable, (err) => {
                    if (err) {
                        console.error('❌ 创建学习记录表失败:', err);
                    } else {
                        console.log('✅ 学习记录表创建成功');
                    }
                });
                
                db.run(createHabitProgressTable, (err) => {
                    if (err) {
                        console.error('❌ 创建习惯进度表失败:', err);
                    } else {
                        console.log('✅ 习惯进度表创建成功');
                    }
                });
            });
            
            db.close((err) => {
                if (err) {
                    console.error('❌ 关闭数据库失败:', err);
                    reject(err);
                } else {
                    console.log('🎉 数据库初始化完成');
                    resolve();
                }
            });
        });
    });
}

// 中间件配置
app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AIEC 七个习惯学习系统运行正常',
        timestamp: new Date().toISOString(),
        version: '2.1.0'
    });
});

// API路由
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', leaderboardRoutes);

// 静态文件服务 (前端)
app.use(express.static(path.join(__dirname, 'frontend')));

// SPA路由处理 - 所有非API请求返回index.html
app.get('*', (req, res) => {
    // 如果是API请求但没有匹配的路由，返回404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // 其他所有请求返回前端应用
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ 
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
    });
});

// 启动服务器
async function startServer() {
    try {
        // 初始化数据库
        await initializeDatabase();
        
        // 启动Express服务器
        app.listen(PORT, () => {
            console.log(`🚀 AIEC学习系统启动成功`);
            console.log(`📍 服务地址: http://localhost:${PORT}`);
            console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 API文档: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}

// 启动服务器
startServer();

module.exports = app;