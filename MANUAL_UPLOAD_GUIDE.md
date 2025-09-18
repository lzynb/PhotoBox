# 手动上传指南

由于自动化上传脚本可能遇到权限或配置问题，请按照以下步骤手动上传文件：

## 🎯 目标
将修复后的 `out` 目录中的文件上传到腾讯云COS，解决 `blocked:mixed-content` 错误。

## 📋 需要上传的文件

### 1. 主要HTML文件（必须上传）
- `out/index.html` → `index.html`
- `out/search.html` → `search.html` 
- `out/background.html` → `background.html`
- `out/resize.html` → `resize.html`
- `out/404.html` → `404.html`

### 2. 静态资源文件（重要）
- `out/_next/static/css/5d5aed3d93c3ac30.css` → `_next/static/css/5d5aed3d93c3ac30.css`
- `out/_next/static/chunks/webpack-a6204057fce9933e.js` → `_next/static/chunks/webpack-a6204057fce9933e.js`
- `out/_next/static/chunks/455-0754377670bff338.js` → `_next/static/chunks/455-0754377670bff338.js`
- `out/_next/static/chunks/main-app-5ad276b5077f7fb5.js` → `_next/static/chunks/main-app-5ad276b5077f7fb5.js`
- `out/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js` → `_next/static/chunks/polyfills-c67a75d1b6f99dc8.js`

### 3. 页面特定文件
- `out/_next/static/chunks/app/search/page-7f91e293e38e00a9.js` → `_next/static/chunks/app/search/page-7f91e293e38e00a9.js`
- `out/_next/static/chunks/app/background/page-641e871fa294c3c5.js` → `_next/static/chunks/app/background/page-641e871fa294c3c5.js`

## 🚀 上传方法

### 方法1：使用腾讯云控制台（推荐）

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/cos
   - 选择存储桶：`photobox-static-1300931050`

2. **删除旧文件**
   - 在文件列表中删除以下文件：
     - `index.html`
     - `search.html`
     - `background.html`
     - `resize.html`
     - `404.html`
     - `_next` 目录（如果存在）

3. **上传新文件**
   - 点击"上传文件"
   - 选择 `out` 目录中的所有文件
   - 保持目录结构不变
   - 等待上传完成

### 方法2：使用腾讯云CLI

如果CLI配置正确，可以逐个上传：

```bash
# 上传HTML文件
tccli cos put-object --bucket photobox-static-1300931050 --key index.html --body out/index.html --region ap-guangzhou
tccli cos put-object --bucket photobox-static-1300931050 --key search.html --body out/search.html --region ap-guangzhou
tccli cos put-object --bucket photobox-static-1300931050 --key background.html --body out/background.html --region ap-guangzhou
tccli cos put-object --bucket photobox-static-1300931050 --key resize.html --body out/resize.html --region ap-guangzhou
tccli cos put-object --bucket photobox-static-1300931050 --key 404.html --body out/404.html --region ap-guangzhou

# 上传CSS文件
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/css/5d5aed3d93c3ac30.css --body "out/_next/static/css/5d5aed3d93c3ac30.css" --region ap-guangzhou

# 上传主要JS文件
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/webpack-a6204057fce9933e.js --body "out/_next/static/chunks/webpack-a6204057fce9933e.js" --region ap-guangzhou
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/455-0754377670bff338.js --body "out/_next/static/chunks/455-0754377670bff338.js" --region ap-guangzhou
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/main-app-5ad276b5077f7fb5.js --body "out/_next/static/chunks/main-app-5ad276b5077f7fb5.js" --region ap-guangzhou
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/polyfills-c67a75d1b6f99dc8.js --body "out/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js" --region ap-guangzhou

# 上传页面特定JS文件
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/app/search/page-7f91e293e38e00a9.js --body "out/_next/static/chunks/app/search/page-7f91e293e38e00a9.js" --region ap-guangzhou
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/app/background/page-641e871fa294c3c5.js --body "out/_next/static/chunks/app/background/page-641e871fa294c3c5.js" --region ap-guangzhou
```

## ✅ 验证上传结果

上传完成后，访问您的网站：
- **网站地址**: https://photobox-static-1300931050.cos-website.ap-guangzhou.myqcloud.com

### 测试步骤：
1. 访问首页，确认页面正常加载
2. 点击"图片关键字检索"，测试OCR功能
3. 点击"证件照换底色"，测试背景移除功能
4. 打开浏览器开发者工具，检查控制台是否有 `blocked:mixed-content` 错误

## 🔧 如果仍有问题

如果上传后仍有 `blocked:mixed-content` 错误：

1. **检查HTML文件内容**
   - 确认HTML文件包含：`window.NEXT_PUBLIC_TENCENT_API_URL = 'https://1300931050-izxeco6na5.ap-guangzhou.tencentscf.com';`

2. **清除浏览器缓存**
   - 按 `Ctrl+F5` 强制刷新
   - 或清除浏览器缓存

3. **检查云函数CORS配置**
   - 确认云函数支持跨域请求
   - 确认API地址使用HTTPS

## 📞 需要帮助？

如果遇到问题，请提供：
1. 浏览器控制台的错误信息
2. 上传过程中的错误信息
3. 网站访问的具体问题描述