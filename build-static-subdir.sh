#!/bin/bash

# Transform 静态导出构建脚本（子目录版本）
# 用于在子目录下部署，例如：http://127.0.0.1/temp/download/transform/out/

set -e

# 从命令行参数或环境变量读取 basePath
if [ -n "$1" ]; then
    BASE_PATH="$1"
elif [ -n "$NEXT_PUBLIC_BASE_PATH" ]; then
    BASE_PATH="$NEXT_PUBLIC_BASE_PATH"
else
    echo "❌ 错误: 请指定 basePath"
    echo ""
    echo "使用方法:"
    echo "  ./build-static-subdir.sh /temp/download/transform/out"
    echo "  或"
    echo "  export NEXT_PUBLIC_BASE_PATH=/temp/download/transform/out"
    echo "  ./build-static-subdir.sh"
    exit 1
fi

echo "🚀 开始构建静态文件（子目录版本）..."
echo "📌 Base Path: $BASE_PATH"

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "📌 检测到 Node.js 版本: $(node -v)"

# Node.js 17+ 需要 --openssl-legacy-provider 标志
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

# 设置 basePath 环境变量
export NEXT_PUBLIC_BASE_PATH="$BASE_PATH"

# 忽略引擎检查（仅在 Node.js 18+ 时）
if [ "$NODE_VERSION" -ge 18 ]; then
    export YARN_IGNORE_ENGINES=true
fi

# 构建静态文件
echo "🔨 构建静态版本..."
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
    echo "🌐 部署路径: http://127.0.0.1$BASE_PATH/"
    echo ""
    echo "💡 部署说明:"
    echo "   1. 将 out 目录的内容复制到服务器的对应路径"
    echo "   2. 确保服务器配置正确，例如 Nginx:"
    echo "      location $BASE_PATH {"
    echo "        try_files \$uri \$uri/ $BASE_PATH/index.html;"
    echo "      }"
    echo ""
    echo "🌐 本地测试方式："
    echo "   方式1: cd out && python3 -m http.server 8000"
    echo "   然后访问: http://localhost:8000$BASE_PATH/"
    echo ""
else
    echo "❌ 构建失败，未找到 out 目录"
    exit 1
fi

