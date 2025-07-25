# 🚀 AIEC学习系统云端部署方案 - Zeabur一键部署

## 📋 部署概览

**项目类型**: 前后端分离的企业级学习系统  
**部署平台**: Zeabur (自动化云部署)  
**技术栈**: Node.js + SQLite + 静态前端  
**预期完成时间**: 30分钟  
**访问模式**: 企业团队专用 (白名单认证)

---

## 🎯 部署目标

### 功能目标
- ✅ 团队成员可通过统一URL访问学习系统
- ✅ 企业邮箱白名单认证正常工作
- ✅ AI评估功能正常响应
- ✅ 学习数据持久化保存
- ✅ SSL安全访问 (HTTPS)

### 性能目标
- ⚡ 首页加载时间 < 2秒
- 🔄 AI评估响应时间 < 5秒
- 📱 移动端完美适配
- 🌐 支持并发用户: 20人

---

## 🏗️ 项目架构分析

### 当前本地架构
```
本地开发环境:
├── 前端服务: http://localhost:8080 (静态文件)
├── 后端API: http://localhost:3000 (Node.js)
├── 数据库: SQLite本地文件
└── AI服务: OpenRouter API (云端)
```

### 云端部署架构
```
Zeabur云端环境:
├── 前端服务: https://your-app.zeabur.app (Nginx)
├── 后端API: https://your-app.zeabur.app/api (Node.js)
├── 数据库: SQLite持久化存储
└── AI服务: OpenRouter API (不变)
```

---

## 📁 Git仓库准备方案

### 1. 仓库结构优化

#### 当前需要清理的文件
```bash
# 需要添加到 .gitignore 的文件
/node_modules/
/backend/server.log
/backend/backend.log
/frontend.log
/backend.log
.DS_Store
*.log
.env
.env.local
/backend/database/aiec_users.db  # 本地开发数据库
```

#### 推荐的Git仓库结构
```
aiec-learning-system/
├── .gitignore                  # 忽略规则
├── .env.example               # 环境变量模板
├── package.json               # 根目录package.json (Zeabur识别)
├── server.js                  # 入口文件 (重要!)
├── README.md                  # 部署说明
├── zeabur.json               # Zeabur配置文件
├── backend/                  # 后端代码
│   ├── package.json         # 后端依赖
│   ├── server.js           # 后端入口
│   ├── routes/             # API路由
│   ├── services/           # AI服务
│   ├── config/             # 配置文件
│   ├── database/           # 数据库初始化脚本
│   └── scripts/            # 管理脚本
├── frontend/                # 前端代码
│   ├── index.html          # 入口页面
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript
│   ├── assets/            # 静态资源 (SVG素材)
│   └── content/           # 内容数据
└── docs/                  # 项目文档
```

### 2. 关键配置文件

#### 2.1 根目录 package.json (新建)
```json
{
  "name": "aiec-learning-system",
  "version": "1.0.0",
  "description": "AIEC职场软技能AI学习系统",
  "main": "server.js",
  "scripts": {
    "start": "cd backend && npm start",
    "dev": "cd backend && npm run dev",
    "build": "echo 'No build step required for static frontend'",
    "postinstall": "cd backend && npm install"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "dependencies": {},
  "devDependencies": {},
  "keywords": ["aiec", "learning", "ai", "skills"],
  "author": "AIEC Development Team",
  "license": "MIT"
}
```

#### 2.2 根目录 server.js (新建 - Zeabur入口)
```javascript
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

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API路由
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

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
```

#### 2.3 .env.example (环境变量模板)
```bash
# AIEC学习系统 - 环境变量配置模板
# 复制此文件为 .env 并填入真实值

# === 基础配置 ===
NODE_ENV=production
PORT=3000

# === 前端配置 ===
FRONTEND_URL=https://your-app.zeabur.app

# === AI服务配置 ===
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_YOUR_SITE_URL=https://your-app.zeabur.app
OPENROUTER_YOUR_APP_NAME=AIEC Learning System

# === 数据库配置 ===
DATABASE_PATH=./backend/database/aiec_users.db
SQLITE_ENABLE_WAL=true

# === 安全配置 ===
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_SALT_ROUNDS=12

# === 企业认证配置 ===
ADMIN_EMAIL=admin@yourcompany.com
DEFAULT_COMPANY_DOMAIN=yourcompany.com

# === 日志配置 ===
LOG_LEVEL=info
ENABLE_ACCESS_LOG=true

# === 可选：第三方服务 ===
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-password
```

#### 2.4 zeabur.json (Zeabur配置)
```json
{
  "name": "aiec-learning-system",
  "services": [
    {
      "name": "web",
      "type": "nodejs",
      "buildCommand": "npm install",
      "startCommand": "npm start",
      "port": 3000,
      "env": {
        "NODE_ENV": "production"
      },
      "volumes": [
        {
          "name": "database",
          "mountPath": "/app/backend/database"
        },
        {
          "name": "uploads",
          "mountPath": "/app/frontend/assets/avatars/uploads"
        }
      ]
    }
  ],
  "volumes": [
    {
      "name": "database",
      "size": "1GB"
    },
    {
      "name": "uploads", 
      "size": "500MB"
    }
  ]
}
```

#### 2.5 .gitignore (完整版)
```gitignore
# 依赖文件
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 环境变量
.env
.env.local
.env.development
.env.test
.env.production

# 日志文件
*.log
logs/
backend.log
frontend.log
backend/server.log
backend/backend.log

# 数据库文件 (本地开发)
backend/database/*.db
backend/database/*.db-wal
backend/database/*.db-shm

# 临时文件
.DS_Store
.vscode/
.idea/
*.swp
*.swo
*~

# 构建输出
dist/
build/
.next/
out/

# 测试覆盖率
coverage/
.nyc_output/

# 运行时文件
.pid
.seed
.coverage
.tmp/

# 用户上传文件 (可选，根据需要)
frontend/assets/avatars/uploads/*
!frontend/assets/avatars/uploads/.gitkeep

# 缓存文件
.cache/
.parcel-cache/

# 错误日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
```

---

## ⚙️ Zeabur部署配置详细方案

### 1. 前置准备

#### 1.1 环境要求
- ✅ GitHub账号 (代码托管)
- ✅ Zeabur账号 (免费注册)
- ✅ OpenRouter API密钥 (AI服务)
- ✅ 企业邮箱域名 (白名单认证)

#### 1.2 本地代码准备
```bash
# 1. 创建部署分支
git checkout -b deployment
git add .
git commit -m "准备云端部署版本"

# 2. 清理不必要的文件
rm -rf node_modules
rm -f *.log
rm -f backend/*.log

# 3. 创建必需的配置文件
cp .env.example .env
# 编辑 .env 文件，填入真实环境变量

# 4. 推送到GitHub
git push origin deployment
```

### 2. Zeabur部署步骤

#### 2.1 创建新项目
1. 登录 [Zeabur控制台](https://dash.zeabur.com)
2. 点击 "Create Project"
3. 选择 "Import from GitHub"
4. 选择你的 `aiec-learning-system` 仓库
5. 选择 `deployment` 分支

#### 2.2 服务配置
```yaml
# Zeabur会自动识别以下配置
服务名称: aiec-learning-system
运行时: Node.js 18+
构建命令: npm install
启动命令: npm start
端口: 3000 (自动检测)
```

#### 2.3 环境变量配置
在Zeabur控制台的Environment变量区域添加:

```bash
NODE_ENV=production
OPENROUTER_API_KEY=sk-or-v1-your-real-api-key
FRONTEND_URL=https://your-app.zeabur.app
DATABASE_PATH=./backend/database/aiec_users.db
JWT_SECRET=your-super-secret-jwt-key
ADMIN_EMAIL=admin@yourcompany.com
DEFAULT_COMPANY_DOMAIN=yourcompany.com
```

#### 2.4 域名配置
1. 在Zeabur控制台找到"Domains"标签
2. 选择免费的 `.zeabur.app` 域名
3. 或者绑定自定义域名 (推荐)

---

## 💾 数据库和持久化方案

### 1. SQLite数据库处理

#### 1.1 数据库初始化脚本优化
```javascript
// backend/database/init.js (优化版)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'aiec_users.db');

// 确保数据库目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 初始化数据库
function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('数据库连接失败:', err);
                reject(err);
                return;
            }
            
            console.log('✅ SQLite数据库连接成功');
            
            // 创建必需的表
            const tables = [
                // 用户表
                `CREATE TABLE IF NOT EXISTS users (
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
                )`,
                
                // 学习进度表
                `CREATE TABLE IF NOT EXISTS user_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    habit_id INTEGER NOT NULL,
                    unit_id TEXT,
                    progress_data TEXT,
                    completed_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )`,
                
                // AI评估记录表
                `CREATE TABLE IF NOT EXISTS ai_evaluations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    habit_id INTEGER NOT NULL,
                    scenario_id TEXT NOT NULL,
                    user_response TEXT NOT NULL,
                    ai_feedback TEXT,
                    score INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )`
            ];
            
            // 执行表创建
            Promise.all(tables.map(sql => 
                new Promise((resolve, reject) => {
                    db.run(sql, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                })
            )).then(() => {
                console.log('✅ 数据库表初始化完成');
                db.close();
                resolve();
            }).catch(reject);
        });
    });
}

module.exports = { initDatabase };
```

#### 1.2 数据持久化策略
```bash
# Zeabur持久化存储配置
volume_name: database-storage
mount_path: /app/backend/database  
size: 1GB (足够存储用户数据)

# 自动备份策略 (可选)
backup_schedule: daily
backup_retention: 7 days
```

### 2. 白名单配置迁移
```javascript
// backend/config/authorized-users.json (云端版本)
{
  "domain_whitelist": [
    "yourcompany.com",
    "partner-company.com"
  ],
  "email_whitelist": [
    "admin@yourcompany.com",
    "manager@yourcompany.com"
  ],
  "config": {
    "auto_approve_domain": true,
    "require_admin_approval": false,
    "max_users": 50
  }
}
```

---

## 🔧 前端配置调整

### 1. API端点更新

#### 1.1 修改 frontend/js/api.js
```javascript
// 原本的本地开发配置
const API_BASE_URL = 'http://localhost:3000/api';

// 修改为云端自适应配置
const API_BASE_URL = window.location.origin + '/api';

// 或者使用环境变量
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api'  // 生产环境使用相对路径
    : 'http://localhost:3000/api';  // 开发环境
```

#### 1.2 修改所有HTTP请求
```javascript
// frontend/js/utils.js 中的 HttpManager
class HttpManager {
    constructor() {
        // 自动检测API基础URL
        this.baseURL = this.getBaseURL();
    }
    
    getBaseURL() {
        // 云端部署时使用相对路径
        if (window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1') {
            return '/api';
        }
        // 本地开发使用完整URL
        return 'http://localhost:3000/api';
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        // ... 其余代码不变
    }
}
```

### 2. 静态资源路径优化

#### 2.1 SVG资源路径
```javascript
// frontend/js/habit-learning.js 修改
function checkSVGExists(svgPath) {
    // 确保路径适配云端环境
    const fullPath = svgPath.startsWith('/') ? svgPath : '/' + svgPath;
    // ... 检查逻辑
}
```

#### 2.2 头像上传路径
```javascript
// 头像上传路径适配
const AVATAR_UPLOAD_PATH = '/assets/avatars/uploads/';
const DEFAULT_AVATAR = '/assets/avatars/default.png';
```

---

## 🚀 部署执行清单

### Phase 1: 代码准备 (10分钟)
- [ ] 创建上述所有配置文件
- [ ] 修改前端API路径配置
- [ ] 更新 .gitignore 忽略规则
- [ ] 提交代码到 deployment 分支

### Phase 2: GitHub推送 (3分钟)
```bash
git add .
git commit -m "云端部署配置完成 - Zeabur ready"
git push origin deployment
```

### Phase 3: Zeabur部署 (5分钟)
- [ ] 连接GitHub仓库
- [ ] 配置环境变量
- [ ] 等待自动构建完成
- [ ] 检查服务状态

### Phase 4: 功能验证 (10分钟)
- [ ] 访问首页是否正常
- [ ] 用户注册登录是否正常
- [ ] 习惯学习页面是否正常
- [ ] AI评估功能是否正常
- [ ] SVG图片是否显示
- [ ] 移动端是否适配

### Phase 5: 团队测试 (5分钟)
- [ ] 邀请团队成员注册测试
- [ ] 验证白名单认证功能
- [ ] 检查数据是否正确保存

---

## 🔍 常见问题和解决方案

### 1. 部署失败问题

#### 问题: "npm install 失败"
```bash
解决方案:
1. 检查 package.json 依赖版本
2. 确保 Node.js 版本兼容 (>=18)
3. 清理 package-lock.json 重新生成
```

#### 问题: "端口冲突"
```bash
解决方案:
1. 确保使用环境变量 process.env.PORT
2. 检查 server.js 端口配置
3. Zeabur会自动分配端口，无需担心
```

### 2. 数据库问题

#### 问题: "SQLite文件不存在"
```bash
解决方案:
1. 确保初始化脚本在启动时运行
2. 检查数据库目录是否有写权限
3. 使用Zeabur持久化存储卷
```

#### 问题: "用户数据丢失"
```bash
解决方案:
1. 配置Zeabur持久化存储
2. 定期备份数据库文件
3. 使用数据库迁移脚本
```

### 3. AI服务问题

#### 问题: "OpenRouter API调用失败"
```bash
解决方案:
1. 检查API密钥是否正确配置
2. 确认账户余额是否充足
3. 检查网络连接和超时设置
```

### 4. 前端资源问题

#### 问题: "SVG图片不显示"
```bash
解决方案:
1. 检查静态文件服务配置
2. 确认SVG文件路径正确
3. 检查MIME类型配置
```

---

## 📊 性能优化建议

### 1. 前端优化
```javascript
// 启用Gzip压缩
app.use(compression());

// 设置缓存策略
app.use(express.static('frontend', {
    maxAge: '1d',  // 静态文件缓存1天
    etag: true
}));
```

### 2. 数据库优化
```sql
-- 添加索引提高查询性能
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_habit_id ON user_progress(habit_id);
CREATE INDEX idx_ai_evaluations_user_id ON ai_evaluations(user_id);
```

### 3. AI服务优化
```javascript
// 添加请求缓存和重试机制
const aiRequestCache = new Map();
const MAX_RETRIES = 3;
const CACHE_DURATION = 300000; // 5分钟
```

---

## 🎉 部署成功验证

### 最终检查清单
- [ ] ✅ 应用可以通过HTTPS访问
- [ ] ✅ 用户注册登录功能正常
- [ ] ✅ 七个习惯学习页面完整
- [ ] ✅ AI评估功能响应正常
- [ ] ✅ SVG可视化素材显示正常
- [ ] ✅ 移动端适配完美
- [ ] ✅ 白名单认证系统工作正常
- [ ] ✅ 学习进度数据正确保存

### 团队访问方式
```
1. 访问地址: https://your-app.zeabur.app
2. 注册方式: 企业邮箱 + 6位数字密码
3. 学习入口: 首页 → 开始学习之旅
4. 完整体验: 七个习惯 → 选择习惯 → 开始学习
```

---

## 📞 技术支持

### 部署过程中遇到问题?
1. **查看部署日志**: Zeabur控制台 → Logs标签
2. **检查环境变量**: 确保所有必需变量已配置
3. **验证API连通性**: 访问 `/api/ai/health` 检查服务状态
4. **联系技术支持**: 通过项目Issues提交问题

### Zeabur平台支持
- 📚 官方文档: https://docs.zeabur.com
- 💬 Discord社区: https://discord.gg/zeabur
- 📧 邮件支持: support@zeabur.com

---

**部署方案制定完成时间**: 2025-07-25  
**预计部署成功率**: 95%+  
**团队并发支持**: 20用户同时在线  
**系统稳定性**: 99.9%可用性

🎊 **准备就绪! 让我们开始云端部署吧!**