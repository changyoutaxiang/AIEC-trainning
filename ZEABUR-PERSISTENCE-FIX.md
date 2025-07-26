# 🔧 Zeabur持久化存储修复指南

## 🚨 问题确认
部署日志显示持久化存储卷**没有正确挂载**到 `/data` 路径：
- ❌ 每次部署都显示"数据库目录已创建"
- ❌ 用户数据在重新部署时丢失
- ❌ `/data` 路径不存在或不可写

## 🛠️ 修复步骤

### 第1步：检查Zeabur控制台的Volumes配置

1. **登录Zeabur控制台**
2. **选择项目** → **Settings** → **Volumes**
3. **确认以下配置**：
   ```
   Volume Name: persistent-data
   Size: 2GB
   Status: Active ✅
   ```

### 第2步：检查服务配置中的Volume挂载

在 **Services** → **你的服务** → **Settings** → **Volumes** 中确认：
```
Volume: persistent-data
Mount Path: /data
Status: Mounted ✅
```

### 第3步：如果Volumes不存在，创建新Volume

1. **点击 "Add Volume"**
2. **设置**：
   - Name: `persistent-data`
   - Size: `2GB`
3. **保存并等待创建完成**

### 第4步：挂载Volume到服务

1. **进入服务设置**
2. **找到 "Volumes" 部分**
3. **添加挂载**：
   - Volume: `persistent-data`
   - Mount Path: `/data`
4. **保存配置**

### 第5步：重新部署验证

重新部署后，应该看到：
```
✅ 持久化存储可用: /data
🎯 使用持久化数据库路径
📍 数据库路径: /data/database/aiec_users.db
```

## 🔍 故障排除

### 如果仍然看到"持久化存储路径不存在"

**可能原因1：Volume创建失败**
- 检查Zeabur控制台是否有错误信息
- 尝试删除并重新创建Volume

**可能原因2：挂载路径错误**
- 确认Mount Path exactly是 `/data`（不是 `data` 或 `/data/`）

**可能原因3：服务重启问题**
- 在修改Volume配置后，必须重新部署服务
- 不是重启，而是完整的重新部署

### 临时解决方案

如果持久化存储暂时无法工作，系统会自动回退到本地存储：
```
⚠️  回退到本地数据库路径（数据将在重新部署时丢失）
```

这样至少可以确保应用正常运行，但数据不会持久化。

## ✅ 验证成功的标志

修复成功后，重新部署应该看到：
1. `✅ 持久化存储可用: /data`
2. `🎯 使用持久化数据库路径`
3. 用户可以注册并在重新部署后正常登录
4. 学习记录在重新部署后保留

## 📞 如果问题仍然存在

请检查：
1. Zeabur账户是否有足够的存储配额
2. 服务所在的区域是否支持持久化存储
3. 联系Zeabur技术支持获取帮助