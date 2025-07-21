/**
 * AIEC 七个习惯系统 - 配置管理
 * 
 * 统一管理环境变量和应用配置
 */

require('dotenv').config();

const config = {
    // 应用基础配置
    app: {
        name: process.env.APP_NAME || 'AIEC 七个习惯学习系统',
        version: process.env.APP_VERSION || '1.0.0',
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT) || 3000,
        host: process.env.HOST || 'localhost'
    },

    // OpenRouter API 配置
    openRouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
        model: process.env.DEFAULT_AI_MODEL || 'openai/gpt-4.1',
        // API 调用配置
        timeout: 30000, // 30秒超时
        maxRetries: 3,
        retryDelay: 1000, // 1秒重试延迟
        headers: {
            'HTTP-Referer': 'https://aiec-habits.zeabur.app', // 替换为您的域名
            'X-Title': 'AIEC-Seven-Habits-Learning-System'
        }
    },

    // CORS 配置
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    },

    // 日志配置
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
};

// 验证必要配置
function validateConfig() {
    const required = ['OPENROUTER_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// 开发环境下验证配置
if (config.app.nodeEnv === 'development') {
    try {
        validateConfig();
        console.log('✅ 配置验证通过');
    } catch (error) {
        console.error('❌ 配置验证失败:', error.message);
        console.log('请检查您的 .env 文件是否包含所有必要的环境变量');
    }
}

module.exports = config; 