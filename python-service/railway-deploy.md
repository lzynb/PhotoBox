# Railway 部署指南

## 快速部署步骤

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的仓库 `lzynb/PhotoBox`
5. 在 "Root Directory" 中设置为 `python-service`
6. 点击 "Deploy"

## 获取服务 URL

部署完成后，Railway 会提供一个 URL，格式类似：
`https://your-service-name.railway.app`

## 配置 Vercel 环境变量

在 Vercel 项目设置中添加：
- **Name**: `PYTHON_SERVICE_URL`
- **Value**: 你的 Railway 服务 URL
- **Environment**: Production, Preview, Development

## 测试服务

```bash
# 健康检查
curl https://your-service-name.railway.app/health

# 测试背景移除
curl -X POST https://your-service-name.railway.app/remove-background \
  -H "Content-Type: application/json" \
  -d '{"image_data": "base64_encoded_image", "new_bg_color": "#FF0000"}'

# 测试 OCR
curl -X POST https://your-service-name.railway.app/ocr \
  -H "Content-Type: application/json" \
  -d '{"image_data": "base64_encoded_image"}'
```
