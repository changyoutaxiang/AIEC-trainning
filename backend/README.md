# AIEC职场软技能AI反馈系统 - 后端

> 基于Node.js + Express + OpenRouter API的智能职场技能评分系统

## 🚀 快速开始

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 环境配置
复制环境变量示例文件：
```bash
cp env.example .env
```

编辑 `.env` 文件，添加你的OpenRouter API密钥：
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. 启动服务器
```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:3000` 启动

## 📚 API文档

### 健康检查
```
GET /api/health
```

响应示例：
```json
{
  "success": true,
  "message": "AIEC AI反馈系统运行正常",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

### AI评分接口
```
POST /api/ai/evaluate
```

请求体：
```json
{
  "skillId": "closed-loop",
  "step": 1,
  "userAnswer": "收到，我会在下午完成",
  "scenarioContext": {
    "background": "团队项目协作场景",
    "task": "领导安排紧急任务"
  }
}
```

响应示例：
```json
{
  "success": true,
  "data": {
    "totalScore": 85,
    "dimensions": {
      "timeliness": 22,
      "completeness": 20,
      "professionalism": 21,
      "proactiveness": 22
    },
    "feedback": "您的回答显示了良好的沟通意识...",
    "suggestions": [
      "建议1：在回复中加入具体的时间承诺",
      "建议2：可以主动询问是否有其他需要澄清的地方"
    ],
    "expertAnswer": "收到！我会在今天下午3点前完成..."
  }
}
```

## 🛠️ 技术栈

- **框架**: Express.js 4.18+
- **AI API**: OpenRouter (支持Claude、GPT等模型)
- **开发工具**: Nodemon
- **环境管理**: dotenv

## 📁 项目结构

```
backend/
├── package.json          # 项目依赖管理
├── server.js            # 主服务器文件
├── routes/
│   └── ai.js           # AI评分路由
├── utils/
│   └── aiPrompts.js    # AI Prompt模板
├── .env                # 环境变量（需自创建）
└── env.example         # 环境变量示例
```

## 🔧 开发说明

### 环境变量配置
- `PORT`: 服务器端口（默认3000）
- `OPENROUTER_API_KEY`: OpenRouter API密钥（必填）
- `DEFAULT_AI_MODEL`: AI模型选择（默认claude-3-sonnet）
- `FRONTEND_URL`: 前端URL（CORS配置）

### 支持的技能类型
- `closed-loop`: 闭环响应技能（已实现）
- 更多技能类型待扩展...

## 🚀 部署到Zeabur

1. 将代码推送到Git仓库
2. 在Zeabur中导入项目
3. 配置环境变量
4. 一键部署

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :3000
   # 杀死进程
   kill -9 <PID>
   ```

2. **API密钥错误**
   - 确认`.env`文件存在且格式正确
   - 验证OpenRouter API密钥有效性

3. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   npm cache clean --force
   npm install
   ```

### 调试模式
设置环境变量启用详细日志：
```bash
export NODE_ENV=development
export LOG_LEVEL=debug
``` 