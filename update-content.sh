#!/bin/bash

# AIEC 内容更新工具
# 用于将MD文件的修改同步到JSON文件

echo "🎯 AIEC 内容更新工具"
echo "==================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 进入工具目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查工具文件是否存在
if [ ! -f "tools/update-scenarios.js" ]; then
    echo "❌ 错误: 找不到更新工具，请检查文件结构"
    exit 1
fi

echo "📝 正在同步场景内容..."
echo ""

# 运行场景更新工具
node tools/update-scenarios.js

echo ""
echo "✅ 内容更新完成！"
echo ""
echo "📖 使用说明："
echo "1. 修改MD文件: 内容生产专用文件夹/习惯一：积极主动/训练单元 1.1：积极主动 _ 训练单元1.1：责任感 (Ownership).md"
echo "2. 运行此脚本: ./update-content.sh"
echo "3. 刷新浏览器查看更新效果"
echo ""
echo "🔗 测试链接: http://localhost:8000/habit-learning.html?habit=1"