#!/bin/bash

# Transform 生产环境启动脚本

set -e

echo "🚀 开始部署 Transform 到生产环境..."

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" != "16" ]; then
    echo "❌ 错误: 需要 Node.js 16.x，当前版本: $(node -v)"
    echo "请使用 nvm 安装 Node.js 16: nvm install 16 && nvm use 16"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    yarn install
else
    echo "✅ 依赖已安装"
fi

# 构建项目
echo "🔨 构建生产版本..."
yarn build

# 检查 PM2 是否安装
if command -v pm2 &> /dev/null; then
    echo "✅ 检测到 PM2，使用 PM2 启动..."
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动应用
    pm2 start ecosystem.config.js
    
    echo ""
    echo "✅ 应用已启动！"
    echo ""
    echo "📊 查看状态: pm2 list"
    echo "📝 查看日志: pm2 logs transform"
    echo "🔄 重启应用: pm2 restart transform"
    echo "🛑 停止应用: pm2 stop transform"
    echo ""
    echo "🌐 访问地址: http://localhost:3000"
    echo "   或访问: http://$(hostname -I | awk '{print $1}'):3000"
else
    echo "⚠️  未检测到 PM2，使用普通模式启动..."
    echo "💡 建议安装 PM2 以获得更好的生产体验: npm install -g pm2"
    echo ""
    echo "🚀 启动应用..."
    yarn start
fi

