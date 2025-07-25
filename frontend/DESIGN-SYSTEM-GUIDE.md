# AIEC 设计系统使用指南

## 概述

AIEC 设计系统是为"七个习惯学习系统"量身定制的统一设计语言。基于苹果风格的设计理念，提供了完整的设计令牌、组件库和工具类系统。

## 文件结构

```
frontend/css/
├── design-tokens.css    # 设计令牌（颜色、字体、间距等）
├── components.css       # 组件样式（按钮、表单、卡片等）
├── utilities.css        # 工具类（间距、颜色、布局等）
├── main.css            # 主样式文件（整合所有样式）
└── style.css           # 原有样式文件（向后兼容）
```

## 快速开始

### 1. 引入样式文件

在 HTML 页面中引入主样式文件：

```html
<link rel="stylesheet" href="css/main.css">
```

### 2. 使用设计令牌

设计令牌定义了系统的基础设计元素：

```css
/* 使用颜色令牌 */
.my-element {
  color: var(--color-primary-500);
  background-color: var(--color-bg-primary);
}

/* 使用间距令牌 */
.my-container {
  padding: var(--spacing-6);
  margin: var(--spacing-4);
}

/* 使用字体令牌 */
.my-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}
```

## 组件使用指南

### 按钮组件

#### 基础用法

```html
<!-- 主要按钮 -->
<button class="btn btn-primary">开始学习</button>

<!-- 次要按钮 -->
<button class="btn btn-secondary">取消</button>

<!-- 轮廓按钮 -->
<button class="btn btn-outline">更多选项</button>
```

#### 尺寸变体

```html
<button class="btn btn-primary btn-xs">超小</button>
<button class="btn btn-primary btn-sm">小型</button>
<button class="btn btn-primary">默认</button>
<button class="btn btn-primary btn-lg">大型</button>
<button class="btn btn-primary btn-xl">超大</button>
```

#### 状态变体

```html
<button class="btn btn-success">成功</button>
<button class="btn btn-warning">警告</button>
<button class="btn btn-error">错误</button>
<button class="btn btn-primary loading">加载中</button>
<button class="btn btn-primary" disabled>禁用</button>
```

### 表单组件

#### 基础表单

```html
<div class="form-group">
  <label class="form-label required">用户名</label>
  <input type="text" class="form-input" placeholder="请输入用户名">
  <div class="form-text">用户名不能包含特殊字符</div>
</div>

<div class="form-group">
  <label class="form-label">描述</label>
  <textarea class="form-textarea" placeholder="请输入描述..."></textarea>
</div>
```

#### 表单验证

```html
<!-- 成功状态 -->
<input type="text" class="form-input is-valid" value="正确输入">
<div class="form-success">输入正确！</div>

<!-- 错误状态 -->
<input type="text" class="form-input is-invalid" value="错误输入">
<div class="form-error">请输入有效的信息</div>
```

#### 复选框和单选框

```html
<!-- 复选框 -->
<div class="form-check">
  <input type="checkbox" class="form-check-input" id="agree">
  <label class="form-check-label" for="agree">我同意条款</label>
</div>

<!-- 开关 -->
<div class="form-check form-switch">
  <input type="checkbox" class="form-check-input" id="notifications">
  <label class="form-check-label" for="notifications">接收通知</label>
</div>
```

### 卡片组件

#### 基础卡片

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">卡片标题</h3>
    <p class="card-subtitle">副标题</p>
  </div>
  <div class="card-body">
    <p class="card-text">卡片内容...</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary btn-sm">操作</button>
  </div>
</div>
```

#### 卡片变体

```html
<!-- 提升卡片 -->
<div class="card card-elevated">...</div>

<!-- 轮廓卡片 -->
<div class="card card-outlined">...</div>

<!-- 填充卡片 -->
<div class="card card-filled">...</div>
```

#### 习惯卡片（特殊样式）

```html
<div class="card habit-card">
  <div class="card-body">
    <div class="habit-number">1</div>
    <h3 class="card-title">积极主动</h3>
    <p class="card-text">习惯描述...</p>
    <div class="habit-progress">
      <div class="habit-progress-bar" style="width: 75%"></div>
    </div>
    <button class="btn btn-primary btn-sm">开始学习</button>
  </div>
</div>
```

### 布局组件

#### 容器系统

```html
<!-- 响应式容器 -->
<div class="container">内容</div>

<!-- 固定宽度容器 -->
<div class="container-lg">内容</div>

<!-- 全宽容器 -->
<div class="container-fluid">内容</div>
```

#### 栅格系统

```html
<div class="row">
  <div class="col-12">全宽</div>
</div>

<div class="row">
  <div class="col-6">左半</div>
  <div class="col-6">右半</div>
</div>

<div class="row">
  <div class="col-4">1/3</div>
  <div class="col-4">1/3</div>
  <div class="col-4">1/3</div>
</div>
```

## 工具类系统

### 间距工具类

```html
<!-- 外边距 -->
<div class="m-4">四周外边距</div>
<div class="mt-6">上外边距</div>
<div class="mx-auto">水平居中</div>

<!-- 内边距 -->
<div class="p-6">四周内边距</div>
<div class="py-4">垂直内边距</div>
<div class="px-8">水平内边距</div>
```

### 文本工具类

```html
<div class="text-lg font-bold text-center">大号居中粗体文本</div>
<div class="text-sm text-secondary">小号次要文本</div>
<div class="text-blue">蓝色文本</div>
```

### 布局工具类

```html
<!-- Flexbox -->
<div class="flex items-center justify-between">
  <div>左侧内容</div>
  <div>右侧内容</div>
</div>

<!-- 显示/隐藏 -->
<div class="hidden">隐藏元素</div>
<div class="block">显示为块级元素</div>

<!-- 间隙 -->
<div class="flex gap-4">
  <div>项目1</div>
  <div>项目2</div>
</div>
```

## 最佳实践

### 1. 使用设计令牌

始终优先使用设计令牌而不是硬编码值：

```css
/* ✅ 推荐 */
.my-component {
  color: var(--color-text-primary);
  padding: var(--spacing-4);
}

/* ❌ 不推荐 */
.my-component {
  color: #1f2937;
  padding: 16px;
}
```

### 2. 组件优先

优先使用现有组件，避免重复造轮子：

```html
<!-- ✅ 推荐 - 使用组件类 -->
<button class="btn btn-primary">提交</button>

<!-- ❌ 不推荐 - 自定义样式 -->
<button style="background: blue; padding: 12px; border-radius: 8px;">提交</button>
```

### 3. 语义化命名

使用语义化的类名，便于理解和维护：

```html
<!-- ✅ 推荐 -->
<div class="card habit-card">
  <h3 class="card-title">积极主动</h3>
</div>

<!-- ❌ 不推荐 -->
<div class="blue-box">
  <h3 class="big-text">积极主动</h3>
</div>
```

### 4. 响应式设计

使用工具类实现响应式布局：

```html
<div class="flex flex-col md:flex-row gap-4">
  <div class="w-full md:w-1/2">左侧内容</div>
  <div class="w-full md:w-1/2">右侧内容</div>
</div>
```

## 自定义扩展

### 添加新的设计令牌

在 `design-tokens.css` 中添加：

```css
:root {
  /* 自定义颜色 */
  --color-custom-primary: #your-color;
  
  /* 自定义间距 */
  --spacing-custom: 2.5rem;
}
```

### 创建新组件

在 `components.css` 中添加：

```css
.my-component {
  /* 使用设计令牌 */
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    padding: var(--spacing-2);
  }
}
```

## 浏览器兼容性

设计系统支持以下浏览器：

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 维护指南

### 版本更新

1. 更新设计令牌时，确保向后兼容
2. 新增组件时，提供完整的文档和示例
3. 定期检查和优化CSS文件大小

### 性能优化

1. 使用CSS变量提高运行时性能
2. 避免深层嵌套选择器
3. 合理使用@import减少HTTP请求

## 故障排除

### 常见问题

**Q: 样式没有生效？**
A: 检查是否正确引入了 `main.css` 文件，确保路径正确。

**Q: 设计令牌变量显示为空？**
A: 确保 `design-tokens.css` 被正确加载，检查CSS变量语法。

**Q: 响应式布局不工作？**
A: 检查HTML中是否包含viewport meta标签：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 调试工具

1. 使用浏览器开发者工具检查CSS变量值
2. 启用调试网格辅助线（在CSS中取消注释 `.debug-grid`）
3. 检查控制台是否有CSS错误

## 更新日志

### v1.0.0 (当前版本)
- 初始版本发布
- 完整的设计令牌系统
- 按钮、表单、卡片、布局组件
- 工具类系统
- 响应式设计支持

---

如有问题或建议，请联系开发团队。