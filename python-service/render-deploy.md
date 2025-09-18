# Render 部署指南

## 步骤 1：准备部署

1. 访问 [render.com](https://render.com)
2. 使用 GitHub 账号登录
3. 点击 "New +" → "Web Service"

## 步骤 2：连接仓库

1. 选择 "Build and deploy from a Git repository"
2. 连接你的 GitHub 账号
3. 选择 `lzynb/PhotoBox` 仓库

## 步骤 3：配置服务

- **Name**: `photobox-python-backend`
- **Root Directory**: `python-service`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main.py`

## 步骤 4：环境变量

在 "Environment Variables" 部分添加：
- `PYTHON_VERSION`: `3.11.0`

## 步骤 5：部署

1. 点击 "Create Web Service"
2. 等待部署完成
3. 获取服务 URL（类似：`https://photobox-python-backend.onrender.com`）

## 步骤 6：配置 Vercel

在 Vercel 项目设置中添加环境变量：
- **Name**: `PYTHON_SERVICE_URL`
- **Value**: 你的 Render 服务 URL

## 注意事项

- Render 免费计划有 750 小时/月的限制
- 服务在 15 分钟无活动后会休眠
- 首次请求可能需要几秒钟唤醒






