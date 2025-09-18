# COS静态网站托管配置完整指南

## 🚨 问题：访问网址仍然下载HTML文件

这个问题通常是由于COS静态网站托管配置不正确导致的。

## 🔍 问题诊断

### 1. 检查静态网站托管是否启用
- 访问：https://console.cloud.tencent.com/cos
- 选择存储桶：`photobox-frontend-1300931050`
- 点击左侧菜单 **"基础配置"** → **"静态网站"**
- 检查是否显示配置信息

### 2. 检查存储桶权限
- 在存储桶页面，点击 **"权限管理"**
- 确保权限设置为 **"公有读私有写"**

## 🛠️ 完整解决方案

### 方法1：使用腾讯云控制台（推荐）

#### 步骤1：启用静态网站托管
1. 登录腾讯云控制台：https://console.cloud.tencent.com/cos
2. 选择存储桶：`photobox-frontend-1300931050`
3. 点击左侧菜单 **"基础配置"** → **"静态网站"**
4. 点击 **"编辑"** 按钮
5. 配置如下：
   ```
   索引文档：index.html
   错误文档：404.html
   重定向规则：留空
   ```
6. 点击 **"保存"**

#### 步骤2：设置存储桶权限
1. 在存储桶页面，点击 **"权限管理"**
2. 点击 **"编辑"**
3. 选择 **"公有读私有写"**
4. 点击 **"保存"**

#### 步骤3：重新上传文件
1. 在文件列表中，删除所有HTML文件
2. 点击 **"上传文件"**
3. 选择 `out` 目录中的所有文件
4. **重要**：确保文件类型正确识别

#### 步骤4：验证配置
1. 访问：https://photobox-frontend-1300931050.cos-website.ap-guangzhou.myqcloud.com
2. 应该显示网页内容，而不是下载文件

### 方法2：使用CLI命令

```bash
# 1. 配置静态网站托管
tccli cos put-bucket-website --bucket photobox-frontend-1300931050 --region ap-guangzhou --website-configuration '{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "404.html"
    }
}'

# 2. 设置存储桶权限
tccli cos put-bucket-acl --bucket photobox-frontend-1300931050 --region ap-guangzhou --acl public-read

# 3. 重新上传HTML文件（带正确的Content-Type）
tccli cos put-object --bucket photobox-frontend-1300931050 --key index.html --body out/index.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

tccli cos put-object --bucket photobox-frontend-1300931050 --key search.html --body out/search.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

tccli cos put-object --bucket photobox-frontend-1300931050 --key background.html --body out/background.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

tccli cos put-object --bucket photobox-frontend-1300931050 --key resize.html --body out/resize.html --region ap-guangzhou --content-type "text/html; charset=utf-8"

tccli cos put-object --bucket photobox-frontend-1300931050 --key 404.html --body out/404.html --region ap-guangzhou --content-type "text/html; charset=utf-8"
```

### 方法3：运行自动修复脚本

```bash
.\fix-correct-bucket.bat
```

## 🔧 常见问题解决

### 问题1：仍然下载文件
**解决方案：**
1. 清除浏览器缓存（Ctrl+F5）
2. 检查静态网站托管是否启用
3. 确认索引文档设置为 `index.html`
4. 检查文件Content-Type是否正确

### 问题2：404错误
**解决方案：**
1. 检查索引文档配置
2. 确认 `index.html` 文件存在
3. 检查文件路径是否正确

### 问题3：权限错误
**解决方案：**
1. 检查存储桶权限是否为"公有读私有写"
2. 确认API密钥权限足够
3. 检查存储桶策略配置

### 问题4：样式不加载
**解决方案：**
1. 检查CSS文件是否正确上传
2. 确认文件路径正确
3. 检查CORS配置

## ✅ 验证步骤

### 1. 检查静态网站配置
```bash
tccli cos get-bucket-website --bucket photobox-frontend-1300931050 --region ap-guangzhou
```

### 2. 检查存储桶权限
```bash
tccli cos get-bucket-acl --bucket photobox-frontend-1300931050 --region ap-guangzhou
```

### 3. 测试文件访问
```bash
tccli cos head-object --bucket photobox-frontend-1300931050 --key index.html --region ap-guangzhou
```

### 4. 访问网站
- 网址：https://photobox-frontend-1300931050.cos-website.ap-guangzhou.myqcloud.com
- 应该显示网页内容，而不是下载文件

## 🎯 关键配置点

1. **静态网站托管**：必须启用
2. **索引文档**：必须设置为 `index.html`
3. **存储桶权限**：必须是"公有读私有写"
4. **Content-Type**：HTML文件必须是 `text/html; charset=utf-8`
5. **文件路径**：确保文件在存储桶根目录

## 📞 如果仍有问题

请提供以下信息：
1. 浏览器控制台的错误信息
2. 存储桶权限配置截图
3. 静态网站托管配置截图
4. 文件列表截图
