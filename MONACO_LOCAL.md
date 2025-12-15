# Monaco Editor 本地化配置

## 问题说明

Monaco Editor 默认从 CDN (`https://cdn.jsdelivr.net/npm/monaco-editor@0.25.2/min/vs/loader.js`) 加载文件。如果网络环境无法访问 CDN，会导致编辑器无法加载。

## 解决方案

已配置 Monaco Editor 使用本地文件，所有文件会在构建时复制到 `public/monaco-editor/` 目录。

## 配置说明

### 1. 依赖安装

已添加 `monaco-editor` 包到 `package.json`：

```json
{
  "dependencies": {
    "monaco-editor": "^0.25.2"
  }
}
```

安装依赖：
```bash
yarn install
# 或
npm install
```

### 2. 自动复制脚本

创建了 `scripts/copy-monaco.js` 脚本，会在构建时自动将 Monaco Editor 文件从 `node_modules` 复制到 `public/monaco-editor/`。

### 3. 配置加载路径

在 `pages/_app.tsx` 中配置了 loader 使用本地路径：

```typescript
import { loader } from "@monaco-editor/react";

if (typeof window !== "undefined") {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  loader.config({
    paths: {
      vs: `${basePath}/monaco-editor/min/vs`
    }
  });
}
```

### 4. 构建脚本更新

构建脚本已自动包含复制步骤：

- `yarn build:static` - 会自动复制 Monaco Editor 文件
- `./build-static.sh` - 会自动复制 Monaco Editor 文件
- `./build-static-subdir.sh` - 会自动复制 Monaco Editor 文件

## 使用方法

### 正常构建

```bash
# 方式1: 使用脚本（推荐）
./build-static.sh

# 方式2: 手动构建
yarn copy-monaco
yarn build:static
```

### 子目录部署

```bash
./build-static-subdir.sh /temp/download/transform/out
```

构建完成后，Monaco Editor 文件会在：
- `public/monaco-editor/min/vs/` - 开发环境
- `out/monaco-editor/min/vs/` - 构建输出（静态文件）

## 文件结构

构建后的目录结构：
```
out/
├── monaco-editor/
│   └── min/
│       └── vs/
│           ├── loader.js
│           ├── editor/
│           ├── base/
│           └── ...
├── _next/
└── ...
```

## 验证

构建后，检查以下内容：

1. **文件是否存在**：
   ```bash
   ls -la out/monaco-editor/min/vs/loader.js
   ```

2. **浏览器网络请求**：
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 应该看到请求 `/monaco-editor/min/vs/loader.js`（本地路径）
   - 不应该看到请求 `cdn.jsdelivr.net`

3. **编辑器功能**：
   - 打开任意页面，编辑器应该正常加载
   - 代码高亮、自动补全等功能应该正常工作

## 故障排查

### 问题：编辑器仍然从 CDN 加载

**原因**：可能没有运行 `copy-monaco` 脚本或构建脚本没有包含复制步骤。

**解决**：
```bash
# 手动复制
yarn copy-monaco

# 然后重新构建
yarn build:static
```

### 问题：404 错误，找不到 Monaco Editor 文件

**原因**：文件路径配置不正确或文件未复制。

**解决**：
1. 检查文件是否存在：`ls -la public/monaco-editor/min/vs/`
2. 检查 `basePath` 配置是否正确
3. 重新运行 `yarn copy-monaco`

### 问题：构建时找不到 monaco-editor

**原因**：`monaco-editor` 包未安装。

**解决**：
```bash
yarn install
# 或
npm install
```

## 注意事项

1. **文件大小**：Monaco Editor 文件较大（约 10-20MB），会增加构建产物大小
2. **首次加载**：使用本地文件后，首次加载可能稍慢，但后续会使用浏览器缓存
3. **更新版本**：如果更新 `monaco-editor` 版本，需要重新运行 `copy-monaco` 脚本

## 优势

✅ 完全离线可用，不依赖外部 CDN  
✅ 不受网络环境影响  
✅ 可以自定义 Monaco Editor 配置  
✅ 更好的安全性和隐私保护

