module.exports = {
  apps: [{
    name: 'transform',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'  // 允许从任何网络接口访问
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // 如果需要在特定端口启动，可以取消下面的注释
    // env_production: {
    //   PORT: 3000,
    //   HOSTNAME: '0.0.0.0'
    // }
  }]
};

