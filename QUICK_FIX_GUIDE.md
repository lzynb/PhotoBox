# 🚀 PhotoBox 404错误快速修复指南

## 问题诊断
您的网站 `https://photobox-frontend-1300931050.cos-website.ap-guangzhou.myqcloud.com` 显示404错误，原因是COS存储桶中缺少 `index.html` 文件。

## 🎯 最简单的解决方案（推荐）

### 方法一：使用腾讯云控制台上传（5分钟解决）

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/cos
   - 使用您的腾讯云账号登录

2. **进入存储桶**
   - 找到存储桶：`photobox-frontend-1300931050`
   - 点击存储桶名称进入

3. **上传文件**
   - 点击"上传文件"按钮
   - 选择项目根目录下的 `out` 文件夹
   - 将整个 `out` 文件夹拖拽到上传区域
   - 点击"开始上传"

4. **配置静态网站**
   - 在左侧菜单找到"基础配置" → "静态网站"
   - 点击"编辑"按钮
   - 启用静态网站功能
   - 首页文档：`index.html`
   - 错误文档：`404.html`
   - 点击"保存"

5. **设置访问权限**
   - 在左侧菜单找到"权限管理" → "存储桶访问权限"
   - 设置为"公有读私有写"
   - 点击"保存"

### 方法二：使用Python脚本上传

如果您有腾讯云API密钥，可以运行Python脚本：

1. **安装依赖**
   ```bash
   pip install cos-python-sdk-v5
   ```

2. **设置环境变量**
   ```bash
   set TENCENT_SECRET_ID=your_secret_id
   set TENCENT_SECRET_KEY=your_secret_key
   ```

3. **运行上传脚本**
   ```bash
   python upload_to_cos.py
   ```

## 🔍 验证修复

上传完成后，访问您的网站：
https://photobox-frontend-1300931050.cos-website.ap-guangzhou.myqcloud.com

如果看到PhotoBox主页，说明修复成功！

## 📁 需要上传的文件结构

确保以下文件都上传到存储桶根目录：
```
photobox-frontend-1300931050/
├── index.html          # 主页（必需）
├── 404.html           # 错误页（必需）
├── _next/             # Next.js静态资源（必需）
│   ├── static/
│   │   ├── css/
│   │   └── chunks/
│   └── ...
├── background.html    # 背景处理页面
├── resize.html        # 图片缩放页面
├── search.html        # 图片搜索页面
├── page.js           # 页面脚本
└── 其他.rsc和.nft.json文件
```

## ⚠️ 常见问题

### 1. 仍然显示404
- 检查文件是否上传到存储桶根目录（不是子文件夹）
- 确认静态网站功能已启用
- 检查首页设置是否为 `index.html`

### 2. 页面显示但样式错乱
- 确认 `_next` 目录已完整上传
- 检查文件路径是否正确

### 3. 权限问题
- 确保存储桶设置为"公有读私有写"
- 检查是否有防盗链设置

## 🎉 修复完成后的下一步

1. **测试所有页面功能**
2. **配置后端API地址**（如果需要）
3. **考虑配置自定义域名**（可选）

## 📞 需要帮助？

如果按照上述步骤仍然无法解决问题，请：
1. 检查腾讯云控制台中的存储桶设置
2. 确认所有文件都已正确上传
3. 联系技术支持


