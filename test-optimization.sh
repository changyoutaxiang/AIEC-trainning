#!/bin/bash

# AIEC 系统优化测试脚本
# 用于本地测试每个优化项目

echo "🧪 AIEC 系统优化测试开始..."
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查当前分支
current_branch=$(git branch --show-current)
echo -e "${BLUE}当前分支: $current_branch${NC}"
echo ""

# 1. 语法检查
echo -e "${YELLOW}1. 检查JavaScript语法...${NC}"
if command -v node &> /dev/null; then
    # 检查主要JS文件语法
    for file in frontend/js/*.js backend/*.js backend/routes/*.js; do
        if [ -f "$file" ]; then
            node -c "$file" 2>/dev/null
            if [ $? -eq 0 ]; then
                echo -e "  ${GREEN}✓${NC} $file"
            else
                echo -e "  ${RED}✗${NC} $file 语法错误"
            fi
        fi
    done
else
    echo -e "  ${YELLOW}⚠️  Node.js 未安装，跳过语法检查${NC}"
fi
echo ""

# 2. 端口检查
echo -e "${YELLOW}2. 检查端口占用...${NC}"
PORT=3000
if lsof -i :$PORT &> /dev/null; then
    echo -e "  ${YELLOW}⚠️  端口 $PORT 已被占用${NC}"
    echo "  请先停止现有服务: lsof -ti :$PORT | xargs kill"
else
    echo -e "  ${GREEN}✓${NC} 端口 $PORT 可用"
fi
echo ""

# 3. 依赖检查
echo -e "${YELLOW}3. 检查项目依赖...${NC}"
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo -e "  ${GREEN}✓${NC} 根目录依赖已安装"
    else
        echo -e "  ${RED}✗${NC} 根目录依赖未安装"
        echo "  运行: npm install"
    fi
fi

if [ -f "backend/package.json" ]; then
    if [ -d "backend/node_modules" ]; then
        echo -e "  ${GREEN}✓${NC} 后端依赖已安装"
    else
        echo -e "  ${RED}✗${NC} 后端依赖未安装"
        echo "  运行: cd backend && npm install"
    fi
fi
echo ""

# 4. 数据库检查
echo -e "${YELLOW}4. 检查数据库状态...${NC}"
if [ -f "backend/database/aiec_users.db" ]; then
    echo -e "  ${GREEN}✓${NC} 数据库文件存在"
    
    # 检查数据库大小
    db_size=$(ls -lh backend/database/aiec_users.db | awk '{print $5}')
    echo "  数据库大小: $db_size"
else
    echo -e "  ${YELLOW}⚠️  数据库文件不存在${NC}"
    echo "  需要初始化数据库: cd backend && node database/init.js"
fi
echo ""

# 5. 启动服务测试
echo -e "${YELLOW}5. 启动服务并进行基础测试...${NC}"

# 检查端口是否被占用
if lsof -i :$PORT &> /dev/null; then
    echo -e "  ${RED}✗${NC} 端口 $PORT 被占用，跳过服务测试"
else
    echo "  启动服务器..."
    
    # 启动服务器（后台运行）
    cd backend && npm start > ../test.log 2>&1 &
    SERVER_PID=$!
    cd ..
    
    # 等待服务启动
    echo "  等待服务启动..."
    sleep 8
    
    # 检查服务是否成功启动
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} 服务器启动成功 (PID: $SERVER_PID)"
        
        # 健康检查
        echo "  进行健康检查..."
        if curl -f -s http://localhost:$PORT/api/health > /dev/null; then
            echo -e "  ${GREEN}✓${NC} 健康检查通过"
            
            # 获取健康检查响应
            health_response=$(curl -s http://localhost:$PORT/api/health)
            echo "  响应: $health_response"
        else
            echo -e "  ${RED}✗${NC} 健康检查失败"
        fi
        
        # 停止服务器
        echo "  停止测试服务器..."
        kill $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
        echo -e "  ${GREEN}✓${NC} 服务器已停止"
        
    else
        echo -e "  ${RED}✗${NC} 服务器启动失败"
        echo "  查看日志: cat test.log"
    fi
fi
echo ""

# 6. 文件完整性检查
echo -e "${YELLOW}6. 检查关键文件完整性...${NC}"

# 检查后端关键文件
backend_files=(
    "backend/server.js"
    "backend/routes/auth.js"
    "backend/routes/ai.js"
    "backend/routes/leaderboard.js"
    "backend/database/init.js"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file 缺失"
    fi
done

# 检查前端关键文件
frontend_files=(
    "frontend/index.html"
    "frontend/css/main.css"
    "frontend/js/app.js"
    "frontend/js/utils.js"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file 缺失"
    fi
done
echo ""

# 7. Git状态检查
echo -e "${YELLOW}7. Git状态检查...${NC}"
git_status=$(git status --porcelain)
if [ -z "$git_status" ]; then
    echo -e "  ${GREEN}✓${NC} 工作区干净"
else
    echo -e "  ${YELLOW}⚠️  有未提交的更改:${NC}"
    git status --short | sed 's/^/    /'
fi
echo ""

# 清理临时文件
if [ -f "test.log" ]; then
    rm test.log
fi

echo "================================"
echo -e "${BLUE}🎉 测试完成！${NC}"
echo ""
echo -e "${YELLOW}下一步操作建议:${NC}"
echo "1. 如有错误，请先修复后再继续"
echo "2. 测试通过后，可以开始具体的优化开发"
echo "3. 每完成一个优化，重新运行此脚本测试"
echo ""
echo -e "${BLUE}快速命令:${NC}"
echo "  启动开发服务: npm run dev"
echo "  查看Git状态: git status"
echo "  创建功能分支: git checkout -b feature/optimization-[编号]-[简述]"