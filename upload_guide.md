# 📤 前端文件上传指南

## 🎯 目标
将修改后的前端文件上传到腾讯云COS存储桶，替换旧版本。

## 📁 需要上传的文件

### 主要HTML文件
```
out/
├── index.html          # 主页
├── background.html     # 背景移除页面  
├── search.html         # 图片搜索页面
├── resize.html         # 图片调整页面
└── 404.html           # 错误页面
```

### 静态资源文件
```
out/_next/
├── static/
│   ├── chunks/        # JavaScript文件
│   └── css/           # CSS样式文件
└── g0CLnBVUxXPY8Wx_2fbGv/  # 构建文件
```

## 🚀 上传方法

### 方法一：使用腾讯云控制台（推荐）

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/cos
   - 进入对象存储COS

2. **找到您的存储桶**
   - 点击存储桶名称进入

3. **上传文件**
   - 点击"上传文件"或"上传文件夹"
   - 选择 `out` 目录
   - 上传所有文件到存储桶根目录

4. **确认上传**
   - 检查文件是否完整上传
   - 确认文件路径正确

### 方法二：使用腾讯云CLI

```bash
# 安装腾讯云CLI（如果未安装）
# https://cloud.tencent.com/document/product/440/34011

# 配置CLI
tccli configure

# 上传文件
tccli cos put-object --bucket your-bucket-name --region ap-beijing --key "index.html" --body "out/index.html"
```

### 方法三：使用提供的脚本

```bash
# Windows
.\upload_files.bat

# PowerShell  
.\upload_files.ps1

# Python（需要配置密钥）
python upload_to_cos.py
```

## ⚠️ 重要注意事项

### 1. 文件覆盖
- 上传时会覆盖存储桶中的同名文件
- 确保备份重要数据（如果需要）

### 2. 文件路径
- 所有文件应上传到存储桶的**根目录**
- 不要创建子目录（除非必要）

### 3. 权限设置
- 确保静态文件设置为**公有读**
- 检查访问权限配置

### 4. 缓存清理
- 上传后可能需要清理CDN缓存
- 等待几分钟让更改生效

## 🔍 验证上传

### 1. 检查文件列表
在COS控制台确认以下文件已上传：
- ✅ index.html
- ✅ background.html  
- ✅ search.html
- ✅ resize.html
- ✅ 404.html
- ✅ _next/ 目录及所有子文件

### 2. 测试访问
访问您的静态网站地址，测试：
- ✅ 主页能正常加载
- ✅ 各个功能页面能正常访问
- ✅ 静态资源（CSS/JS）能正常加载
- ✅ API调用指向正确的云函数地址

### 3. 功能测试
- ✅ 图片上传功能
- ✅ OCR文字识别
- ✅ 背景移除功能
- ✅ 图片调整功能

## 🆘 故障排除

### 问题1：页面无法访问
- 检查文件是否正确上传到根目录
- 确认存储桶的静态网站配置
- 检查访问权限设置

### 问题2：静态资源加载失败
- 确认 `_next` 目录完整上传
- 检查文件路径是否正确
- 验证CDN缓存设置

### 问题3：API调用失败
- 确认前端代码中的API地址正确
- 检查云函数是否正常运行
- 验证CORS配置

## 📞 技术支持

如果遇到问题：
1. 检查腾讯云控制台日志
2. 使用浏览器开发者工具查看错误
3. 运行测试脚本验证功能

---

**上传完成后，您的PhotoBox应用将使用最新的前端代码，所有功能都会调用您的腾讯云后端服务！** 🎉

