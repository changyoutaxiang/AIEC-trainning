# Git 版本管理工作流程

## 🌳 分支结构

```
main (生产环境 - 对应云端部署)
├── deployment (当前部署分支)
├── development (开发主分支 - 本地测试环境)
│   ├── feature/optimization-a1-db-pool
│   ├── feature/optimization-a2-api-standard  
│   ├── feature/optimization-b1-loading
│   └── feature/optimization-[编号]-[简述]
└── hotfix/* (紧急修复分支)
```

## 🔄 开发工作流程

### 阶段1: 创建功能分支
```bash
# 确保在development分支
git checkout development

# 创建新的功能分支
git checkout -b feature/optimization-a1-db-pool

# 或者使用简化命名
git checkout -b opt-a1-db-pool
```

### 阶段2: 本地开发
```bash
# 在功能分支进行开发
# ... 开发代码 ...

# 提交代码
git add .
git commit -m "feat: 实现数据库连接池优化

- 添加数据库连接池配置
- 优化数据库连接复用
- 提升查询性能30-50%

🧪 测试项目:
- [x] 数据库连接稳定性测试
- [x] 并发连接测试  
- [x] 性能基准测试
- [x] 回归测试

📊 影响范围: backend/server.js, backend/routes/*.js"
```

### 阶段3: 本地测试
```bash
# 启动本地服务进行测试
npm start

# 或使用开发模式
npm run dev

# 运行测试脚本（如果有）
npm test
```

### 阶段4: 合并到development
```bash
# 切换到development分支
git checkout development

# 合并功能分支
git merge feature/optimization-a1-db-pool

# 本地集成测试
npm start
# 测试所有功能是否正常...

# 删除已合并的功能分支（可选）
git branch -d feature/optimization-a1-db-pool
```

### 阶段5: 推送到云端测试
```bash
# 推送development分支到远程
git push origin development

# 在云端环境验证功能...
```

### 阶段6: 合并到主分支
```bash
# 功能验证通过后，合并到main分支
git checkout main
git merge development

# 推送到云端部署
git push origin main
```

## 📝 提交信息规范

### 提交类型
- `feat`: 新功能
- `fix`: 修复bug
- `perf`: 性能优化
- `style`: 样式调整
- `refactor`: 代码重构
- `docs`: 文档更新
- `test`: 测试相关

### 提交格式
```
<类型>: <简短描述>

<详细描述>

🧪 测试项目:
- [x] 已完成的测试项目
- [ ] 待完成的测试项目

📊 影响范围: <涉及的文件或模块>
```

### 示例
```bash
git commit -m "perf: 优化前端资源加载性能

- CSS文件分割按需加载
- 图片资源压缩优化
- JavaScript模块懒加载

🧪 测试项目:
- [x] 页面加载速度测试
- [x] 不同网络环境测试
- [x] 移动端兼容性测试

📊 影响范围: frontend/css/, frontend/js/, frontend/assets/"
```

## 🚀 快速命令集合

### 日常开发命令
```bash
# 创建并切换到新功能分支
alias new-opt="git checkout development && git checkout -b"

# 示例: new-opt feature/opt-a1-db-pool

# 快速提交
alias quick-commit="git add . && git commit"

# 切换到development并合并当前分支
function merge-to-dev() {
    current_branch=$(git branch --show-current)
    git checkout development
    git merge $current_branch
    echo "✅ 已合并 $current_branch 到 development"
}

# 推送到云端测试
alias push-test="git push origin development"

# 部署到生产环境
function deploy-prod() {
    git checkout main
    git merge development
    git push origin main
    echo "🚀 已部署到生产环境"
}
```

### 一键测试脚本
```bash
#!/bin/bash
# test-optimization.sh

echo "🧪 开始本地测试..."

# 检查语法错误
echo "1. 检查语法..."
npm run lint 2>/dev/null || echo "⚠️  请手动检查语法"

# 启动服务
echo "2. 启动服务..."
npm start &
SERVER_PID=$!

# 等待服务启动
sleep 5

# 基础健康检查
echo "3. 健康检查..."
curl -f http://localhost:3000/api/health || echo "❌ 健康检查失败"

# 停止服务
kill $SERVER_PID

echo "✅ 本地测试完成"
```

## 📋 测试检查清单模板

### 每次优化必检项目
```markdown
## 🧪 测试检查清单 - [优化项目名称]

### 功能测试
- [ ] 现有功能正常工作
- [ ] 新功能按预期工作
- [ ] 错误处理正确
- [ ] 边界条件测试

### 性能测试
- [ ] 响应时间测试
- [ ] 内存使用测试
- [ ] 并发访问测试
- [ ] 资源加载测试

### 兼容性测试
- [ ] Chrome浏览器
- [ ] Firefox浏览器
- [ ] Safari浏览器
- [ ] 移动端浏览器

### 集成测试
- [ ] 数据库操作正常
- [ ] API接口正常
- [ ] 前后端通信正常
- [ ] 第三方服务正常

### 用户体验测试
- [ ] 页面加载速度
- [ ] 交互响应速度
- [ ] 视觉效果正确
- [ ] 无障碍性检查
```

## 🆘 紧急回滚流程

### 发现问题时
```bash
# 1. 立即回滚到上一个稳定版本
git checkout main
git reset --hard HEAD~1  # 回滚到上一个提交

# 2. 推送回滚
git push --force origin main

# 3. 创建hotfix分支修复问题
git checkout -b hotfix/emergency-fix

# 4. 修复问题后直接合并到main
git checkout main
git merge hotfix/emergency-fix
git push origin main
```

## 📊 版本标记

### 使用标签标记重要版本
```bash
# 标记稳定版本
git tag -a v2.1.0 -m "版本 2.1.0 - 数据库连接池优化"
git push origin v2.1.0

# 标记优化完成版本
git tag -a v2.2.0 -m "版本 2.2.0 - UI/UX优化完成"
git push origin v2.2.0
```

---

**使用建议**: 
1. 每个优化项目都创建独立的功能分支
2. 本地测试通过后再推送到development
3. development测试稳定后再合并到main
4. 重要节点创建版本标签
5. 保持提交信息的清晰和规范