#!/usr/bin/env node

/**
 * 复制 Monaco Editor 文件到 public 目录
 * 用于静态导出时使用本地文件而不是 CDN
 */

const fs = require('fs');
const path = require('path');

const monacoSourcePath = path.join(__dirname, '../node_modules/monaco-editor/min/vs');
const publicMonacoPath = path.join(__dirname, '../public/monaco-editor/min/vs');

// 检查源目录是否存在
if (!fs.existsSync(monacoSourcePath)) {
  console.error('❌ 错误: 找不到 monaco-editor 文件');
  console.error(`   路径: ${monacoSourcePath}`);
  console.error('   请先运行: yarn install 或 npm install');
  process.exit(1);
}

// 创建目标目录
const publicMonacoDir = path.dirname(publicMonacoPath);
if (!fs.existsSync(publicMonacoDir)) {
  fs.mkdirSync(publicMonacoDir, { recursive: true });
}

// 复制文件的递归函数
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(
        path.join(src, file),
        path.join(dest, file)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('📦 复制 Monaco Editor 文件到 public 目录...');
console.log(`   源: ${monacoSourcePath}`);
console.log(`   目标: ${publicMonacoPath}`);

try {
  // 如果目标目录已存在，先删除
  if (fs.existsSync(publicMonacoPath)) {
    fs.rmSync(publicMonacoPath, { recursive: true, force: true });
  }
  
  // 复制文件
  copyRecursive(monacoSourcePath, publicMonacoPath);
  
  console.log('✅ Monaco Editor 文件复制成功！');
} catch (error) {
  console.error('❌ 复制失败:', error.message);
  process.exit(1);
}

