#!/bin/bash
# AIEC学习系统启动脚本

echo "🔧 检查并安装后端依赖..."
cd backend && npm install
cd ..

echo "🚀 启动AIEC学习系统..."
node server.js