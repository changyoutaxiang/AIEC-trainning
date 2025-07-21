#!/bin/bash

# AIEC 七个习惯系统 - 开发环境启动脚本

echo "🚀 启动 AIEC 七个习惯学习系统..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python 3，请先安装 Python 3"
    exit 1
fi

echo "📦 检查后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "🔄 安装后端依赖..."
    npm install
fi

echo "🔧 启动后端服务器..."
# 在后台启动后端服务器
npm start &
BACKEND_PID=$!

# 等待后端服务器启动
echo "⏳ 等待后端服务器启动..."
sleep 3

# 检查后端服务是否正常
if curl -s http://localhost:3000/api/ai/health > /dev/null; then
    echo "✅ 后端服务器启动成功 (http://localhost:3000)"
else
    echo "❌ 后端服务器启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "🌐 启动前端服务器..."
cd ../frontend

# 在后台启动前端服务器
python3 -m http.server 8080 &
FRONTEND_PID=$!

# 等待前端服务器启动
sleep 2

echo ""
echo "🎉 系统启动成功！"
echo ""
echo "📱 前端地址: http://localhost:8080"
echo "   - 主页: http://localhost:8080/index.html"
echo "   - 习惯学习: http://localhost:8080/habit-learning.html"
echo "   - 测试页面: http://localhost:8080/test-practice.html"
echo ""
echo "🔧 后端API: http://localhost:3000"
echo "   - API文档: http://localhost:3000/api/ai/health"
echo ""
echo "💡 使用说明:"
echo "   1. 在浏览器中打开 http://localhost:8080"
echo "   2. 进入习惯学习页面体验完整功能"
echo "   3. 可以在test-practice.html测试AI评估功能"
echo ""
echo "⭐ 按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 所有服务已停止'; exit 0" INT

# 保持脚本运行
wait 