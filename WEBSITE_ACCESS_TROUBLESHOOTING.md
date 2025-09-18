# 网站访问问题排查指南

## 🚨 问题：无法访问网站

您的网站地址应该是：**https://photobox-frontend-1300931050.cos-website.ap-guangzhou.myqcloud.com**

## 🔍 常见问题及解决方案

### 1. 存储桶不存在或名称错误
**症状**：404错误或"存储桶不存在"
**解决方案**：
- 确认存储桶名称：`photobox-frontend-1300931050`
- 确认区域：`ap-guangzhou`
- 检查腾讯云控制台中存储桶是否存在

### 2. 静态网站托管未启用
**症状**：访问时下载文件或显示错误
**解决方案**：
1. 登录腾讯云控制台：https://console.cloud.tencent.com/cos
2. 选择存储桶：`photobox-frontend-1300931050`
3. 点击左侧菜单 **"基础配置"** → **"静态网站"**
4. 点击 **"编辑"** 按钮
5. 配置：
   - **索引文档**：`index.html`
   - **错误文档**：`404.html`
6. 点击 **"保存"**

### 3. 存储桶权限问题
**症状**：403权限错误
**解决方案**：
1. 在存储桶页面，点击 **"权限管理"**
2. 点击 **"编辑"**
3. 选择 **"公有读私有写"**
4. 点击 **"保存"**

### 4. 文件未上传或路径错误
**症状**：404错误或空白页面
**解决方案**：
1. 检查文件是否在存储桶根目录
2. 确认 `index.html` 文件存在
3. 重新上传 `out` 目录中的所有文件

### 5. 使用了错误的URL
**症状**：无法访问
**解决方案**：
- ✅ 正确地址：`https://photobox-frontend-1300931050.cos-website.ap-guangzhou.myqcloud.com`
- ❌ 错误地址：`https://photobox-frontend-1300931050.cos.ap-guangzhou.myqcloud.com`

## 🛠️ 手动配置步骤

### 步骤1：检查存储桶
1. 访问：https://console.cloud.tencent.com/cos
2. 确认存储桶 `photobox-frontend-1300931050` 存在
3. 确认区域为 `ap-guangzhou`

### 步骤2：配置静态网站托管
1. 选择存储桶 → **"基础配置"** → **"静态网站"**
2. 点击 **"编辑"**
3. 设置：
   ```
   索引文档：index.html
   错误文档：404.html
   ```
4. 保存配置

### 步骤3：设置权限
1. 选择存储桶 → **"权限管理"**
2. 设置为 **"公有读私有写"**

### 步骤4：上传文件
1. 删除存储桶中的旧文件
2. 上传 `out` 目录中的所有文件
3. 确保文件在根目录，不在子文件夹中

### 步骤5：测试访问
访问：https://photobox-frontend-1300931050.cos-website.ap-guangzhou.myqcloud.com

## 🔧 使用CLI命令配置

如果控制台配置有问题，可以使用CLI命令：

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

# 3. 上传文件
tccli cos put-object --bucket photobox-frontend-1300931050 --key index.html --body out/index.html --region ap-guangzhou --content-type "text/html; charset=utf-8"
```

## ✅ 验证配置

### 检查静态网站配置
```bash
tccli cos get-bucket-website --bucket photobox-frontend-1300931050 --region ap-guangzhou
```

### 检查存储桶权限
```bash
tccli cos get-bucket-acl --bucket photobox-frontend-1300931050 --region ap-guangzhou
```

### 检查文件列表
```bash
tccli cos list-objects --bucket photobox-frontend-1300931050 --region ap-guangzhou
```

## 🎯 关键检查点

1. **存储桶名称**：`photobox-frontend-1300931050`
2. **区域**：`ap-guangzhou`
3. **静态网站托管**：已启用
4. **索引文档**：`index.html`
5. **存储桶权限**：公有读私有写
6. **文件位置**：存储桶根目录
7. **访问地址**：使用 `.cos-website.` 域名

## 📞 如果仍有问题

请提供以下信息：
1. 具体的错误信息
2. 浏览器控制台的错误
3. 存储桶配置截图
4. 文件列表截图

## 🌐 正确的访问地址

**https://photobox-frontend-1300931050.cos-website.ap-guangzhou.myqcloud.com**

请确保使用这个完整的地址，包含 `.cos-website.` 部分。

