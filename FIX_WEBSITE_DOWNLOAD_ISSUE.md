# 修复网站下载HTML文件问题

## 🚨 问题描述
访问网站时，浏览器下载HTML文件而不是显示网页内容。

## 🔍 问题原因
这通常是由以下原因造成的：
1. **MIME类型配置错误** - HTML文件被识别为下载文件
2. **静态网站托管未启用** - COS没有配置为静态网站托管
3. **Content-Type头缺失** - 文件上传时没有设置正确的Content-Type

## 🛠️ 解决方案

### 方法1：使用腾讯云控制台（推荐）

#### 1. 启用静态网站托管
1. 登录腾讯云控制台：https://console.cloud.tencent.com/cos
2. 选择存储桶：`photobox-static-1300931050`
3. 点击左侧菜单 **"基础配置"** → **"静态网站"**
4. 点击 **"编辑"** 按钮
5. 配置如下：
   - **索引文档**：`index.html`
   - **错误文档**：`404.html`
   - **重定向规则**：留空
6. 点击 **"保存"**

#### 2. 设置文件权限
1. 在存储桶页面，点击 **"权限管理"**
2. 确保 **"公有读私有写"** 权限已开启
3. 如果没有，点击 **"编辑"** 并选择 **"公有读私有写"**

#### 3. 重新上传文件（设置正确的Content-Type）
1. 在文件列表中，选择所有HTML文件
2. 点击 **"删除"** 删除旧文件
3. 点击 **"上传文件"**
4. 选择 `out` 目录中的所有文件
5. **重要**：在上传时，确保文件类型正确识别：
   - `.html` 文件 → `text/html`
   - `.css` 文件 → `text/css`
   - `.js` 文件 → `application/javascript`

### 方法2：使用CLI命令

运行以下命令：

```bash
# 1. 配置静态网站托管
tccli cos put-bucket-website --bucket photobox-static-1300931050 --region ap-guangzhou --website-configuration '{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "404.html"
    }
}'

# 2. 重新上传HTML文件（带正确的Content-Type）
tccli cos put-object --bucket photobox-static-1300931050 --key index.html --body out/index.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

tccli cos put-object --bucket photobox-static-1300931050 --key search.html --body out/search.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

tccli cos put-object --bucket photobox-static-1300931050 --key background.html --body out/background.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

tccli cos put-object --bucket photobox-static-1300931050 --key resize.html --body out/resize.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

tccli cos put-object --bucket photobox-static-1300931050 --key 404.html --body out/404.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

# 3. 上传CSS文件
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/css/5d5aed3d93c3ac30.css --body "out/_next/static/css/5d5aed3d93c3ac30.css" --region ap-guangzhou --content-type "text/css"

# 4. 上传JavaScript文件
tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/webpack-a6204057fce9933e.js --body "out/_next/static/chunks/webpack-a6204057fce9933e.js" --region ap-guangzhou --content-type "application/javascript"

tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/455-0754377670bff338.js --body "out/_next/static/chunks/455-0754377670bff338.js" --region ap-guangzhou --content-type "application/javascript"

tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/main-app-5ad276b5077f7fb5.js --body "out/_next/static/chunks/main-app-5ad276b5077f7fb5.js" --region ap-guangzhou --content-type "application/javascript"

tccli cos put-object --bucket photobox-static-1300931050 --key _next/static/chunks/polyfills-c67a75d1b6f99dc8.js --body "out/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js" --region ap-guangzhou --content-type "application/javascript"
```

### 方法3：运行自动修复脚本

```bash
.\fix-cos-mime-types.bat
```

## ✅ 验证步骤

1. **检查静态网站托管配置**
   - 访问：https://console.cloud.tencent.com/cos
   - 选择存储桶 → 基础配置 → 静态网站
   - 确认索引文档设置为 `index.html`

2. **测试网站访问**
   - 访问：https://photobox-static-1300931050.cos-website.ap-guangzhou.myqcloud.com
   - 应该显示网页内容，而不是下载文件

3. **检查浏览器开发者工具**
   - 按 F12 打开开发者工具
   - 查看 Network 标签页
   - 确认 HTML 文件的 Content-Type 是 `text/html`

## 🔧 如果仍有问题

### 检查清单：
- [ ] 静态网站托管已启用
- [ ] 索引文档设置为 `index.html`
- [ ] 存储桶权限为"公有读私有写"
- [ ] HTML文件上传时设置了正确的Content-Type
- [ ] 所有静态资源文件都已上传

### 常见问题：
1. **仍然下载文件** → 检查Content-Type是否正确设置
2. **404错误** → 检查索引文档配置
3. **权限错误** → 检查存储桶权限设置
4. **样式不加载** → 检查CSS文件是否正确上传

## 📞 需要帮助？

如果问题仍然存在，请提供：
1. 浏览器控制台的错误信息
2. 存储桶的权限配置截图
3. 静态网站托管配置截图

