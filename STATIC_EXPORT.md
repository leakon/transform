# 静态导出部署指南

本项目已配置为支持静态导出，可以生成纯静态文件，无需 Node.js 服务器即可运行。

## 📋 目录
1. [构建静态文件](#构建静态文件)
2. [部署方式](#部署方式)
3. [注意事项](#注意事项)
4. [功能限制](#功能限制)

---

## 构建静态文件

### 快速开始

```bash
# 1. 安装依赖
yarn install
# 或
npm install

# 2. 构建静态文件（推荐使用脚本，会自动检测 Node.js 版本）
./build-static.sh

# 或手动构建：
# Node.js 16.x:
yarn build:static

# Node.js 17+:
yarn build:static:legacy
```

**注意**：
- **推荐使用 `./build-static.sh`**：脚本会自动检测 Node.js 版本并选择正确的构建方式
- Node.js 16.x：使用标准构建命令
- Node.js 17+：需要使用 `--openssl-legacy-provider` 标志（脚本会自动处理）

构建完成后，静态文件会生成在 `out` 目录中。

### 验证构建

构建成功后，你应该看到类似输出：
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Export successful. Files written to out
```

---

## 部署方式

### 方式一：使用静态文件服务器（最简单）

#### 1. 使用 Python（如果已安装）
```bash
cd out
python3 -m http.server 8000
```
访问：http://localhost:8000

#### 2. 使用 Node.js http-server
```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
cd out
http-server -p 8000
```
访问：http://localhost:8000

#### 3. 使用 serve
```bash
# 安装 serve
npm install -g serve

# 启动服务器
serve out -p 8000
```
访问：http://localhost:8000

### 方式二：部署到子目录（如 `/temp/download/transform/out/`）

#### 1. 使用子目录构建脚本（推荐）
```bash
# 方式1: 使用脚本参数
./build-static-subdir.sh /temp/download/transform/out

# 方式2: 使用环境变量
export NEXT_PUBLIC_BASE_PATH=/temp/download/transform/out
./build-static.sh
```

#### 2. 手动设置环境变量构建
```bash
export NEXT_PUBLIC_BASE_PATH=/temp/download/transform/out
yarn build:static
```

#### 3. 部署说明
- 构建完成后，将 `out` 目录的内容复制到服务器的对应路径
- 确保服务器配置正确（见下方 Nginx 配置示例）

**Nginx 配置示例：**
```nginx
location /temp/download/transform/out {
    alias /path/to/out;
    index index.html;
    
    # 关键：必须包含 $uri.html 来处理刷新问题！
    # Next.js 静态导出会生成 js-object-to-json.html 文件
    try_files $uri $uri/ $uri.html /temp/download/transform/out/index.html;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**重要提示**：如果遇到"点击链接可以进入，但刷新后 404"的问题，检查 `try_files` 是否包含 `$uri.html`！

### 方式三：部署到 GitHub Pages

#### 1. 使用子目录构建脚本
```bash
./build-static-subdir.sh /your-repo-name
```

#### 2. 构建并推送
```bash
yarn build
git add out
git commit -m "Deploy static site"
git subtree push --prefix out origin gh-pages
```

#### 3. 在 GitHub 仓库设置中启用 GitHub Pages
- Settings > Pages > Source: 选择 `gh-pages` 分支

### 方式四：部署到 Netlify

#### 1. 创建 `netlify.toml`
```toml
[build]
  command = "yarn build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. 推送代码到 Git 仓库
Netlify 会自动检测并部署。

### 方式五：部署到 Vercel

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 部署
```bash
yarn build
vercel --prod
```

### 方式六：部署到 Nginx（根路径）

#### 1. 复制文件到服务器
```bash
scp -r out/* user@server:/var/www/html/
```

#### 2. 配置 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /_next/static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 方式七：部署到 Apache

#### 1. 复制文件到服务器
```bash
scp -r out/* user@server:/var/www/html/
```

#### 2. 创建 `.htaccess` 文件
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 注意事项

### 0. Monaco Editor 本地化

Monaco Editor 已配置为使用本地文件而不是 CDN。构建时会自动将 Monaco Editor 文件复制到 `public/monaco-editor/` 目录。

**重要**：首次构建前需要安装依赖：
```bash
yarn install
```

构建脚本会自动处理 Monaco Editor 文件的复制，无需手动操作。

更多信息请查看 `MONACO_LOCAL.md`。

### 1. 路径问题
- **根路径部署**：直接使用 `./build-static.sh` 构建
- **子目录部署**：使用 `./build-static-subdir.sh /your/path` 构建
- `basePath` 通过环境变量 `NEXT_PUBLIC_BASE_PATH` 配置，无需修改代码

### 2. 环境变量
- 静态导出不支持服务器端环境变量
- 客户端环境变量需要在构建时注入（使用 `NEXT_PUBLIC_` 前缀）

### 3. API 路由
- 静态导出不支持 Next.js API 路由
- 所有 API 调用已改为客户端转换（见 `utils/clientTransformers.ts`）

### 4. 动态路由
- 静态导出会为所有页面生成静态 HTML
- 确保所有路由都是静态的

---

## 功能限制

### ✅ 已支持的功能
以下功能已改为客户端实现，在静态版本中可用：
- ✅ HTML to Pug
- ✅ Flow to JavaScript
- ✅ TypeScript to JavaScript
- ✅ TypeScript to Flow
- ✅ Flow to TypeScript
- ✅ Flow to TypeScript Declaration
- ✅ TypeScript to TypeScript Declaration
- ✅ JSON Schema to OpenAPI Schema

### ❌ 不支持的功能
以下功能需要服务器端处理，静态版本中**不可用**：
- ❌ TypeScript to JSON Schema
- ❌ TypeScript to Zod

这些功能在静态版本中会显示错误提示。

---

## 文件结构

构建后的 `out` 目录结构：
```
out/
├── index.html
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   └── ...
│   └── ...
├── [各种页面]/
│   └── index.html
└── ...
```

---

## 故障排查

### 构建失败
1. 检查 Node.js 版本是否为 16.x
2. 清除缓存重新构建：
   ```bash
   rm -rf .next out node_modules
   yarn install
   yarn build
   ```

### 页面 404
- 确保服务器配置了正确的重写规则（见上方 Nginx/Apache 配置）
- 检查 `basePath` 配置是否正确

### 转换功能不工作
- 检查浏览器控制台是否有错误
- 确保相关库已正确加载
- 某些功能需要较大的 JavaScript 包，首次加载可能较慢

---

## 性能优化建议

1. **启用 Gzip/Brotli 压缩**（在服务器配置中）
2. **使用 CDN** 加速静态资源
3. **启用 HTTP/2**
4. **配置缓存策略**（见上方 Nginx 配置示例）

---

## 总结

静态导出版本的优势：
- ✅ 无需 Node.js 服务器
- ✅ 可以部署到任何静态文件托管服务
- ✅ 更快的加载速度（CDN 友好）
- ✅ 更低的服务器成本

限制：
- ❌ 部分功能不可用（需要服务器端处理）
- ❌ 不支持动态 API 路由
- ❌ 需要重新构建才能更新内容

---

## 快速命令参考

```bash
# 构建静态文件
yarn build

# 本地测试（使用 Python）
cd out && python3 -m http.server 8000

# 本地测试（使用 http-server）
cd out && http-server -p 8000

# 部署到 GitHub Pages
git subtree push --prefix out origin gh-pages
```

