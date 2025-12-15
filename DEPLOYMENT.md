# 生产环境部署指南

## 📋 目录
1. [前置要求](#前置要求)
2. [构建步骤](#构建步骤)
3. [服务器配置](#服务器配置)
4. [浏览器访问](#浏览器访问)
5. [部署方式](#部署方式)

---

## 前置要求

### 系统要求
- **Node.js**: 16.x（项目要求，见 `package.json`）
- **包管理器**: yarn 或 npm
- **操作系统**: Linux、macOS 或 Windows

### 检查 Node.js 版本
```bash
node -v
# 应该显示 v16.x.x
```

如果版本不对，请安装 Node.js 16.x：
- 使用 [nvm](https://github.com/nvm-sh/nvm): `nvm install 16 && nvm use 16`
- 或从 [Node.js 官网](https://nodejs.org/)下载

---

## 构建步骤

### 1. 安装依赖
```bash
yarn install
# 或
npm install
```

### 2. 构建生产版本
```bash
yarn build
# 或
npm run build
```

构建完成后，会在项目根目录生成 `.next` 文件夹，包含优化后的生产文件。

### 3. 验证构建
构建成功后，你应该看到类似输出：
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## 服务器配置

### 方式一：使用 Next.js 内置服务器（推荐用于简单部署）

#### 启动生产服务器
```bash
yarn start
# 或
npm start
```

默认情况下，服务器会在 **http://localhost:3000** 启动。

#### 自定义端口
```bash
PORT=8080 yarn start
# 或
PORT=8080 npm start
```

#### 自定义主机
```bash
HOSTNAME=0.0.0.0 PORT=3000 yarn start
```

`0.0.0.0` 允许从任何网络接口访问（适合服务器部署）。

---

### 方式二：使用 PM2（推荐用于生产环境）

PM2 是一个 Node.js 进程管理器，提供自动重启、日志管理等功能。

#### 1. 安装 PM2
```bash
npm install -g pm2
# 或
yarn global add pm2
```

#### 2. 创建 PM2 配置文件 `ecosystem.config.js`
```javascript
module.exports = {
  apps: [{
    name: 'transform',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/path/to/transform-master', // 修改为你的项目路径
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

#### 3. 启动应用
```bash
pm2 start ecosystem.config.js
```

#### 4. 常用 PM2 命令
```bash
pm2 list              # 查看运行中的应用
pm2 logs transform    # 查看日志
pm2 restart transform # 重启应用
pm2 stop transform    # 停止应用
pm2 delete transform  # 删除应用
pm2 save              # 保存当前进程列表
pm2 startup           # 设置开机自启
```

---

### 方式三：使用 Nginx 反向代理（推荐用于生产环境）

#### 1. 安装 Nginx
**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
```

**macOS:**
```bash
brew install nginx
```

#### 2. 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/transform`（Linux）或 `/usr/local/etc/nginx/servers/transform`（macOS）：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名或 IP

    # 如果需要 HTTPS，取消下面的注释并配置 SSL
    # listen 443 ssl;
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存（可选）
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. 启用配置（Linux）
```bash
sudo ln -s /etc/nginx/sites-available/transform /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

#### 4. 启动 Next.js 应用
确保 Next.js 应用在后台运行（使用 PM2 或 systemd）：
```bash
pm2 start ecosystem.config.js
```

---

### 方式四：使用 Docker（推荐用于容器化部署）

#### 1. 创建 `Dockerfile`
```dockerfile
FROM node:16-alpine

WORKDIR /app

# 复制 package 文件
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建应用
RUN yarn build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["yarn", "start"]
```

#### 2. 创建 `.dockerignore`
```
node_modules
.next
.git
*.md
.env.local
```

#### 3. 构建和运行
```bash
# 构建镜像
docker build -t transform-app .

# 运行容器
docker run -d -p 3000:3000 --name transform transform-app

# 查看日志
docker logs -f transform
```

#### 4. 使用 Docker Compose（可选）

创建 `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

---

## 浏览器访问

### 本地访问
如果服务器运行在本地：
- 打开浏览器访问：**http://localhost:3000**

### 局域网访问
如果服务器运行在局域网内：
1. 确保服务器监听 `0.0.0.0`：
   ```bash
   HOSTNAME=0.0.0.0 PORT=3000 yarn start
   ```
2. 查找服务器 IP 地址：
   ```bash
   # Linux/macOS
   ifconfig
   # 或
   ip addr show
   
   # Windows
   ipconfig
   ```
3. 在同一局域网的其他设备访问：**http://服务器IP:3000**

### 公网访问
如果服务器有公网 IP：

#### 1. 配置防火墙
**Ubuntu/Debian (UFW):**
```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

**CentOS/RHEL (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

**macOS:**
在系统偏好设置 > 安全性与隐私 > 防火墙中配置

#### 2. 使用域名（推荐）
- 配置 DNS 解析，将域名指向服务器 IP
- 使用 Nginx 反向代理（见上方配置）
- 访问：**http://your-domain.com**

#### 3. 直接访问 IP
- 访问：**http://服务器公网IP:3000**

---

## 部署方式

### 快速测试部署
```bash
# 1. 安装依赖
yarn install

# 2. 构建
yarn build

# 3. 启动（前台运行，用于测试）
yarn start
```

### 生产环境部署（使用 PM2）
```bash
# 1. 安装依赖
yarn install

# 2. 构建
yarn build

# 3. 使用 PM2 启动
pm2 start ecosystem.config.js

# 4. 设置开机自启
pm2 save
pm2 startup
```

### 使用 systemd（Linux 服务器）
创建 `/etc/systemd/system/transform.service`:
```ini
[Unit]
Description=Transform Next.js App
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/transform-master
ExecStart=/usr/bin/yarn start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable transform
sudo systemctl start transform
sudo systemctl status transform
```

---

## 故障排查

### 端口被占用
```bash
# 查找占用 3000 端口的进程
lsof -i :3000
# 或
netstat -tulpn | grep 3000

# 杀死进程
kill -9 <PID>
```

### 构建失败
- 检查 Node.js 版本是否为 16.x
- 清除缓存重新构建：
  ```bash
  rm -rf .next node_modules
  yarn install
  yarn build
  ```

### 无法访问
1. 检查防火墙设置
2. 检查服务器是否正在运行：`pm2 list` 或 `ps aux | grep node`
3. 检查日志：`pm2 logs transform` 或 `docker logs transform`
4. 检查端口是否正确监听：`netstat -tulpn | grep 3000`

### 性能优化
- 使用 Nginx 反向代理并启用缓存
- 使用 CDN 加速静态资源
- 启用 Gzip 压缩（Nginx 默认启用）
- 使用 PM2 集群模式（需要修改配置）

---

## 安全建议

1. **使用 HTTPS**：配置 SSL 证书（Let's Encrypt 免费）
2. **防火墙**：只开放必要端口
3. **更新依赖**：定期运行 `yarn upgrade`
4. **环境变量**：敏感信息使用环境变量，不要硬编码
5. **限制访问**：使用 Nginx 限制 IP 访问（如需要）

---

## 总结

最简单的部署流程：
```bash
yarn install && yarn build && yarn start
```

生产环境推荐流程：
```bash
yarn install && yarn build && pm2 start ecosystem.config.js
```

访问地址：
- 本地：http://localhost:3000
- 局域网：http://服务器IP:3000
- 公网：http://your-domain.com（配置 Nginx 后）

