# 子目录部署指南

## 快速开始

### 方式1：使用子目录构建脚本（推荐）

```bash
./build-static-subdir.sh /temp/download/transform/out
```

### 方式2：使用环境变量

```bash
export NEXT_PUBLIC_BASE_PATH=/temp/download/transform/out
./build-static.sh
```

## 详细说明

### 1. 构建步骤

```bash
# 设置 basePath（你的子目录路径）
export NEXT_PUBLIC_BASE_PATH=/temp/download/transform/out

# 构建
./build-static.sh
```

或者直接使用子目录脚本：

```bash
./build-static-subdir.sh /temp/download/transform/out
```

### 2. 部署

构建完成后，将 `out` 目录的内容复制到服务器的对应路径：

```bash
# 示例：复制到服务器
scp -r out/* user@server:/var/www/html/temp/download/transform/out/
```

### 3. 服务器配置

#### Nginx 配置示例

**重要**：必须包含 `$uri.html` 来处理 Next.js 静态导出的路由刷新问题！

```nginx
location /temp/download/transform/out {
    alias /var/www/html/temp/download/transform/out;
    index index.html;
    
    # 关键配置：处理 Next.js 静态导出的路由刷新问题
    # 1. 尝试直接访问的文件（如 /js-object-to-json）
    # 2. 尝试作为目录访问（如 /js-object-to-json/）
    # 3. 尝试添加 .html 后缀（如 /js-object-to-json.html）← 这个很重要！
    # 4. 最后回退到 index.html
    try_files $uri $uri/ $uri.html /temp/download/transform/out/index.html;
    
    # 静态资源缓存（Next.js 资源）
    location ~* ^/temp/download/transform/out/_next/static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 其他静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webmanifest)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML 文件不缓存（开发时）
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

**完整配置示例**：见项目根目录的 `nginx-subdirectory.conf` 文件。

#### Apache 配置示例

在 `out` 目录创建 `.htaccess`：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /temp/download/transform/out/
  
  # 处理路由
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /temp/download/transform/out/index.html [L]
</IfModule>
```

### 4. 验证部署

访问你的网站：
```
http://127.0.0.1/temp/download/transform/out/
```

点击链接应该能正常跳转，例如：
```
http://127.0.0.1/temp/download/transform/out/js-object-to-json
```

## 注意事项

1. **basePath 必须以 `/` 开头，不能以 `/` 结尾**
   - ✅ 正确：`/temp/download/transform/out`
   - ❌ 错误：`temp/download/transform/out`（缺少前导斜杠）
   - ❌ 错误：`/temp/download/transform/out/`（末尾不能有斜杠）

2. **路径必须与实际部署路径一致**
   - 如果部署在 `/temp/download/transform/out/`，basePath 必须是 `/temp/download/transform/out`

3. **重新构建**
   - 每次更改 basePath 都需要重新构建
   - 构建前清理旧的构建文件：`rm -rf .next out`

## 常见问题

### Q: 链接跳转到根路径怎么办？
A: 确保设置了正确的 `NEXT_PUBLIC_BASE_PATH` 环境变量，并重新构建。

### Q: 静态资源 404？
A: 检查服务器配置，确保 `/_next/static` 路径正确映射。

### Q: 首页可以打开，但点击链接后 404？
A: 检查服务器的路由重写配置（try_files 或 RewriteRule）。

### Q: 从首页点击链接可以进入页面，但刷新页面后 404？
A: **这是 Nginx 配置问题**，需要在 `try_files` 中添加 `$uri.html`：
```nginx
try_files $uri $uri/ $uri.html /temp/download/transform/out/index.html;
```
这样当访问 `/temp/download/transform/out/js-object-to-json` 时，Nginx 会尝试查找 `js-object-to-json.html` 文件。

## 示例：完整部署流程

```bash
# 1. 构建（使用子目录路径）
./build-static-subdir.sh /temp/download/transform/out

# 2. 复制到服务器
scp -r out/* user@server:/var/www/html/temp/download/transform/out/

# 3. 配置服务器（见上方 Nginx/Apache 配置）

# 4. 访问测试
curl http://127.0.0.1/temp/download/transform/out/
```

