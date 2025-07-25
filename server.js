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
require('dotenv').config();

// 引入后端路由
const aiRoutes = require('./backend/routes/ai');
const authRoutes = require('./backend/routes/auth');
const leaderboardRoutes = require('./backend/routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.listen(PORT, () => {
    console.log(`🚀 AIEC学习系统启动成功`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 API文档: http://localhost:${PORT}/api/health`);
});

module.exports = app;