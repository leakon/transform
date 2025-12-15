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

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 启动应用
CMD ["yarn", "start"]

