#!/bin/bash

# Transform 静态导出构建脚本

set -e

echo "🚀 开始构建静态文件..."

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "📌 检测到 Node.js 版本: $(node -v)"

# Node.js 17+ 需要 --openssl-legacy-provider 标志
# 但不能通过 NODE_OPTIONS 设置，需要直接传递给 node 命令
if [ "$NODE_VERSION" -ge 17 ]; then
    echo "⚠️  检测到 Node.js 17+，将使用 --openssl-legacy-provider 标志"
    USE_LEGACY_PROVIDER=true
else
    echo "✅ Node.js 16.x，无需特殊标志"
    USE_LEGACY_PROVIDER=false
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    yarn install --ignore-engines
else
    echo "✅ 依赖已安装"
fi

# 清理旧的构建文件
if [ -d "out" ]; then
    echo "🧹 清理旧的构建文件..."
    rm -rf out
fi

if [ -d ".next" ]; then
    echo "🧹 清理旧的 .next 目录..."
    rm -rf .next
fi

# 复制 Monaco Editor 文件到 public 目录
echo "📦 复制 Monaco Editor 文件到本地..."
yarn copy-monaco

# 构建静态文件
echo "🔨 构建静态版本..."

# 检查是否设置了 basePath
if [ -n "$NEXT_PUBLIC_BASE_PATH" ]; then
    echo "📌 使用自定义 basePath: $NEXT_PUBLIC_BASE_PATH"
else
    echo "📌 使用默认路径（根路径）"
    echo "   提示: 如需部署到子目录，设置环境变量:"
    echo "   export NEXT_PUBLIC_BASE_PATH=/your/subdirectory/path"
fi

# 忽略引擎检查（仅在 Node.js 18+ 时）
if [ "$NODE_VERSION" -ge 18 ]; then
    export YARN_IGNORE_ENGINES=true
fi

# 根据 Node.js 版本选择构建命令
if [ "$USE_LEGACY_PROVIDER" = true ]; then
    echo "   使用 legacy OpenSSL provider..."
    node --openssl-legacy-provider node_modules/.bin/next build && node --openssl-legacy-provider node_modules/.bin/next export
else
    echo "   使用标准构建命令..."
    yarn build:static
fi

if [ -d "out" ]; then
    echo ""
    echo "✅ 构建成功！静态文件已生成在 'out' 目录"
    echo ""
    echo "📁 输出目录: $(pwd)/out"
    echo ""
    echo "🌐 本地测试方式："
    echo "   方式1: cd out && python3 -m http.server 8000"
    echo "   方式2: cd out && npx http-server -p 8000"
    echo "   方式3: cd out && npx serve -p 8000"
    echo ""
    echo "📖 更多部署方式请查看 STATIC_EXPORT.md"
else
    echo "❌ 构建失败，未找到 out 目录"
    exit 1
fi

