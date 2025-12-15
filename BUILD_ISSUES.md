# 构建问题说明

## ✅ 已修复的问题

1. **TypeScript 编译错误** - 未使用的参数问题已修复
2. **导入错误** - `jsonSchemaToOpenApiSchema` 的导入方式已修复
3. **Node.js 18 兼容性** - 添加了 `--openssl-legacy-provider` 标志

## ⚠️ 当前遇到的问题

### Node.js 版本兼容性

项目要求 Node.js 16.x，但当前环境是 Node.js 18.x。虽然可以使用 `--ignore-engines` 和 `--openssl-legacy-provider` 绕过，但可能会遇到其他兼容性问题。

### 推荐解决方案

#### 方案1：使用 Node.js 16（推荐）

```bash
# 使用 nvm 切换到 Node.js 16
nvm install 16
nvm use 16

# 然后重新构建
./build-static.sh
```

#### 方案2：修改 package.json（临时方案）

如果必须使用 Node.js 18，可以临时修改 `package.json`：

```json
{
  "engines": {
    "node": ">=16.x"
  }
}
```

然后运行：
```bash
export NODE_OPTIONS="--openssl-legacy-provider"
yarn build
```

#### 方案3：使用 Docker（最稳定）

```bash
docker run -it --rm -v $(pwd):/app -w /app node:16-alpine sh
# 在容器内
yarn install
yarn build
```

## 📝 构建命令总结

如果使用 Node.js 16：
```bash
./build-static.sh
```

如果使用 Node.js 18：
```bash
export NODE_OPTIONS="--openssl-legacy-provider"
export YARN_IGNORE_ENGINES=true
yarn build
```

## 🔍 其他可能的问题

如果构建时遇到页面找不到的错误，可能是：
1. 某些页面文件有语法错误
2. 动态导入在静态导出时有问题
3. Worker 文件加载问题

可以尝试：
1. 清理缓存：`rm -rf .next out node_modules/.cache`
2. 重新安装依赖：`rm -rf node_modules && yarn install`
3. 检查具体报错的页面文件

