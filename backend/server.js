/**
 * AIEC职场软技能学习系统 - 后端服务器
 * 
 * 功能：
 * 1. Express服务器搭建
 * 2. CORS跨域配置  
 * 3. 静态文件服务
 * 4. 错误处理中间件
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 中间件配置
 */

// CORS跨域配置
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5500', // VS Code Live Server
        'http://127.0.0.1:5500',
        'http://localhost:8080', // Python HTTP Server
        'http://127.0.0.1:8080',
        process.env.FRONTEND_URL
    ].filter(Boolean), // 过滤掉undefined值
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));

// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

/**
 * 路由配置
 */

// 导入路由模块
const aiRoutes = require('./routes/ai');

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AIEC 七个习惯学习系统运行正常',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// AI相关路由
app.use('/api/ai', aiRoutes);

// 静态文件服务 - 为前端提供服务
app.use(express.static(path.join(__dirname, '../frontend')));

// 根路径重定向到前端
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/**
 * 错误处理中间件
 */

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `API路径 ${req.path} 不存在`,
        timestamp: new Date().toISOString()
    });
});

// 全局错误处理
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    
    // 开发环境显示详细错误信息
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || '服务器内部错误',
        ...(isDevelopment && { 
            stack: error.stack,
            details: error 
        })
    });
});

/**
 * 服务器启动
 */
app.listen(PORT, () => {
    console.log('🚀 AIEC 七个习惯学习系统启动成功！');
    console.log(`📍 服务器地址: http://localhost:${PORT}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log('📝 API文档:');
    console.log('   - 健康检查: GET /api/health');
    console.log('---');
});

// 优雅关闭处理
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在优雅关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在优雅关闭服务器...');
    process.exit(0);
});

module.exports = app; 