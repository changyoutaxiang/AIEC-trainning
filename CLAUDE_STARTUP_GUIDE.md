# 🚀 Claude Code 启动指南

## 📋 每次启动必读文件清单

### 🔑 核心项目信息（必发）
```
请首先阅读以下文件了解项目全貌：
- /Users/wangdong/Desktop/新人修行/DEVELOPMENT_PROGRESS.md
- /Users/wangdong/Desktop/新人修行/docs/archive/项目优化方案详细文档.md
```

### 📊 当前状态速览
```
项目状态：七个习惯学习系统 - 100% 完成
完成度：4/7 个习惯（习惯1-4已完成）
最新完成：习惯四「双赢思维」（2025-07-22）
```

---

## 🎯 快速启动文件包

### Phase 1: 核心功能验证（5分钟）
```bash
# 快速验证系统状态
1. 前端：/frontend/habit-learning.html?habit=1
2. 后端：http://localhost:3000/api/ai/health
3. 认证：/frontend/login.html
```

### Phase 2: 内容体系（技术核心）
```
必读技术文件：
├── 内容数据库：/frontend/content/seven_habits.json
├── 设计系统：/frontend/css/design-tokens.css
├── 学习逻辑：/frontend/js/habit-learning.js
└── AI集成：/backend/services/aiService.js
```

### Phase 3: 企业级认证
```
企业功能文件：
├── 认证系统：/backend/routes/auth.js
├── 用户管理：/backend/scripts/manage-whitelist.js
├── 数据库：/backend/database/aiec_users.db
└── 配置：/backend/config/authorized-users.json
```

---

## 📁 按角色分类的必读文件

### 👨‍💻 开发者视角
```
架构文件：
├── 项目根目录：/Users/wangdong/Desktop/新人修行/CLAUDE.md
├── 优化计划：OPTIMIZATION-PLAN.md
├── 技术文档：SVG-INTEGRATION-GUIDE.md
└── 内容更新：CONTENT-UPDATE-GUIDE.md
```

### 📈 产品经理视角
```
业务文件：
├── 功能清单：/内容生产专用文件夹/培训模块内容生产标准作业程序 (SOP).md
├── 用户故事：DEVELOPMENT_PROGRESS.md（里程碑部分）
├── 价值主张：习惯四完成总结（文档末尾）
└── 扩展计划：文档中"下一阶段开发规划"
```

### 🔧 运维视角
```
系统文件：
├── 启动脚本：start-dev.sh
├── 日志文件：backend.log / frontend.log
├── 配置模板：backend/env.example
└── 测试页面：test-habit-X.html（每个习惯专用）
```

---

## 🚀 3分钟快速上手流程

### 1. 系统启动（30秒）
```bash
cd /Users/wangdong/Desktop/新人修行
./start-dev.sh
```

### 2. 功能验证（90秒）
```
浏览器访问：
1. http://localhost:8080/login.html（注册/登录）
2. http://localhost:8080/habit-learning.html?habit=1（习惯一完整体验）
3. http://localhost:8080/test-habit-4.html（最新习惯四测试）
```

### 3. AI功能测试（60秒）
```
测试内容：
- 实战练习提交
- AI评估响应
- 学习进度保存
- SVG可视化展示
```

---

## 📊 项目价值一句话总结

> **"从个人效能到团队协作的完整AI驱动软技能培训系统，已完成4/7习惯，具备企业级认证能力"**

---

## 🔍 关键检查点

### 每次启动请确认：
- [ ] 习惯1-4学习体验完整可用
- [ ] AI评估功能正常响应
- [ ] 企业认证系统运行稳定
- [ ] 最新习惯四SVG可视化正常

### 快速问题定位：
```bash
# 检查服务状态
curl http://localhost:3000/api/ai/health
# 检查文件完整性
ls -la frontend/assets/concept-visuals/habit_4/
```

---

*最后更新：2025-07-25*
*项目状态：习惯1-4完成，5-7开发中，企业级认证已就绪*