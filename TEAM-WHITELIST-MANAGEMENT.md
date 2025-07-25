# 👥 AIEC学习系统 - 团队白名单管理指南

**文档更新时间**: 2025年7月25日 16:00  
**当前白名单状态**: 12/20 用户  
**系统状态**: 云端运行正常

---

## 📋 当前白名单概况

### ✅ 已授权团队成员 (12人):
1. **wangdong@company.com** 👑 (管理员)
2. example1@company.com
3. example2@company.com  
4. example3@company.com
5. **wangdong@51talk.com** (项目负责人)
6. **fuxiaoyi@51talk.com** (团队成员)
7. colleague1@51talk.com (示例成员)
8. manager@51talk.com (示例管理者)
9. hr@51talk.com (示例HR)
10. **zhangsan@51talk.com** (新增团队成员)
11. **lisi@51talk.com** (新增团队成员)
12. **wangwu@51talk.com** (新增团队成员)

### 📊 白名单统计:
- **总容量**: 20个用户
- **已使用**: 12个用户 (60%)
- **剩余容量**: 8个用户
- **51talk域名用户**: 6人
- **管理员数量**: 1人

---

## 🛠️ 白名单管理工具

### 工具1: 单个邮箱管理 (manage-whitelist.js)
**位置**: `backend/scripts/manage-whitelist.js`

#### 基础操作:
```bash
# 查看白名单
node backend/scripts/manage-whitelist.js list

# 添加邮箱
node backend/scripts/manage-whitelist.js add newuser@51talk.com

# 移除邮箱
node backend/scripts/manage-whitelist.js remove olduser@51talk.com

# 检查邮箱状态
node backend/scripts/manage-whitelist.js check user@51talk.com
```

### 工具2: 批量管理工具 (batch-whitelist.js) ⭐**推荐**
**位置**: `backend/scripts/batch-whitelist.js`

#### 批量添加多个邮箱:
```bash
# 一次添加多个邮箱
node backend/scripts/batch-whitelist.js add email1@51talk.com email2@51talk.com email3@51talk.com

# 批量移除
node backend/scripts/batch-whitelist.js remove email1@51talk.com email2@51talk.com
```

#### 从文件批量导入:
```bash
# 1. 创建邮箱列表模板
node backend/scripts/batch-whitelist.js template

# 2. 编辑 emails-template.txt 文件

# 3. 批量导入
node backend/scripts/batch-whitelist.js import emails-template.txt
```

#### 文件格式示例 (emails-template.txt):
```
# AIEC团队邮箱白名单
# 技术团队
dev1@51talk.com
dev2@51talk.com

# 产品团队  
pm1@51talk.com
pm2@51talk.com

# 运营团队
ops1@51talk.com
ops2@51talk.com
```

---

## 🔄 完整添加流程

### 标准操作流程 (3步完成):

#### 步骤1: 添加邮箱到白名单
```bash
# 方式A: 单个添加
node backend/scripts/manage-whitelist.js add newuser@51talk.com

# 方式B: 批量添加 (推荐)
node backend/scripts/batch-whitelist.js add user1@51talk.com user2@51talk.com user3@51talk.com

# 方式C: 文件导入 (大量用户)
node backend/scripts/batch-whitelist.js import team-emails.txt
```

#### 步骤2: 提交更改到云端
```bash
# 提交白名单更新
git add backend/config/authorized-users.json
git commit -m "添加团队成员到白名单: 具体邮箱列表"
git push origin deployment
```

#### 步骤3: 云端部署生效
```bash
# 在Zeabur控制台:
# 1. 进入项目 → 点击 "Redeploy"
# 2. 等待部署完成 (1-2分钟)
# 3. 新用户即可注册使用
```

---

## 📧 团队邀请模板

### 个人邀请邮件模板:
```
Subject: 邀请您使用AIEC七个习惯学习系统

Hi [姓名],

邀请您体验我们团队的AI驱动学习系统！

🚀 访问地址: https://你的域名.zeabur.app
📧 注册邮箱: [具体邮箱]@51talk.com
🔐 密码设置: 任意6位数字

✨ 系统特色:
• 完整的七个习惯培训体系
• AI个性化评估和反馈
• 实战练习和案例分析
• 学习进度自动追踪

注册后即可开始您的高效能学习之旅！

王东
```

### 团队群发邮件模板:
```
Subject: AIEC团队学习系统上线 - 邀请大家体验

Hi 团队,

很高兴向大家介绍我们全新的AIEC七个习惯学习系统！

🎯 系统价值:
基于Stephen Covey经典著作《高效能人士的七个习惯》，结合AI技术打造的个性化学习平台。

🚀 访问方式:
• 网址: https://你的域名.zeabur.app
• 使用企业邮箱注册 (@51talk.com)
• 设置6位数字密码即可开始

📚 学习内容:
• 习惯一: 积极主动 
• 习惯二: 以终为始
• 习惯三: 要事第一
• 习惯四: 双赢思维
• 习惯五: 知彼解己
• 习惯六: 统合综效
• 习惯七: 不断更新

💡 独特亮点:
• AI智能评估，提供个性化改进建议
• 实战模拟，职场场景深度练习
• 可视化图表，概念理解更直观
• 完整进度追踪，学习效果可衡量

期待大家的参与和反馈！

王东
```

---

## 🔐 白名单安全管理

### 安全原则:
1. **最小权限**: 只授权真正需要使用的团队成员
2. **定期审查**: 建议每月检查一次白名单状态  
3. **离职清理**: 及时移除离职员工邮箱
4. **邮箱验证**: 确保邮箱地址格式正确且有效

### 管理员权限:
- **当前管理员**: wangdong@company.com
- **管理员能力**: 
  - 添加/移除白名单成员
  - 查看所有用户学习数据
  - 系统配置管理

### 容量管理:
- **当前设置**: 最大20个用户
- **扩容方法**: 修改 `authorized-users.json` 中的 `maxUsersLimit`
- **建议容量**: 根据团队实际大小设定，避免过度开放

---

## 📊 用户注册和使用状态

### 注册流程:
1. **访问系统** → https://你的域名.zeabur.app
2. **点击注册** → 企业邮箱注册入口
3. **填写信息** → 邮箱、姓名、部门、职位
4. **设置密码** → 6位数字密码
5. **开始学习** → 选择习惯开始学习之旅

### 当前使用情况:
- **已注册用户**: 待统计 (可通过数据库查询)
- **活跃用户**: 待统计
- **学习完成度**: 待统计
- **平均学习时长**: 待统计

### 用户支持:
- **技术问题**: 联系王东 (wangdong@51talk.com)
- **内容问题**: 查看系统内置帮助文档
- **账号问题**: 检查邮箱是否在白名单中

---

## 🛠️ 故障排查指南

### 常见问题:

#### 问题1: 用户无法注册
**症状**: 提示"邮箱未授权"
**解决**: 
1. 检查邮箱是否在白名单中
2. 确认邮箱格式正确 (@51talk.com)
3. 确认云端已部署最新白名单

#### 问题2: 添加白名单后不生效
**症状**: 新添加的邮箱仍无法注册
**解决**:
1. 确认已执行 `git push origin deployment`
2. 在Zeabur重新部署
3. 等待部署完成 (1-2分钟)

#### 问题3: 批量添加脚本报错
**症状**: 脚本执行失败
**解决**:
1. 检查脚本权限: `chmod +x backend/scripts/batch-whitelist.js`
2. 检查邮箱格式是否正确
3. 检查文件路径是否存在

---

## 📈 下一步计划

### 短期优化 (1-2周):
- [ ] 添加更多51talk团队成员到白名单
- [ ] 收集用户使用反馈
- [ ] 监控系统使用数据
- [ ] 优化邀请和注册流程

### 中期改进 (1个月):
- [ ] 开发白名单管理后台界面
- [ ] 实现邮箱验证功能
- [ ] 添加用户使用统计报告
- [ ] 支持部门级白名单管理

### 长期规划 (3个月):
- [ ] 支持多企业域名
- [ ] 集成企业SSO单点登录
- [ ] 实现白名单自助申请流程
- [ ] 添加用户行为分析功能

---

## 📞 技术支持联系方式

### 白名单管理相关:
- **主要负责人**: 王东
- **邮箱**: wangdong@51talk.com
- **紧急联系**: 可通过企业内部沟通渠道

### 系统技术支持:
- **GitHub仓库**: https://github.com/changyoutaxiang/AIEC-trainning
- **部署平台**: Zeabur云端自动化部署
- **监控状态**: 7×24小时云端监控

### 用户使用支持:
- **系统访问**: https://你的域名.zeabur.app
- **使用手册**: 系统内置帮助文档
- **学习指导**: 每个习惯都有详细的学习指南

---

**文档维护**: 本文档会随着系统更新和团队变化持续更新  
**版本记录**: v1.0 (2025-07-25) - 初始版本，包含基础白名单管理功能