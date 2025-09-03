#!/bin/bash

echo "🔧 修复Node.js版本兼容性问题..."
echo

echo "📋 当前Node.js版本:"
node --version
echo

echo "🚨 Next.js版本降级到13.5.11以兼容Node.js 18.4.0..."
echo

echo "🧹 清理缓存和依赖..."
npm cache clean --force
rm -rf node_modules package-lock.json
echo

echo "📦 重新安装依赖..."
npm install
echo

echo "✅ 修复完成！"
echo "🚀 现在可以运行: npm run dev"
echo
