# PhotoBox Python Service

这是 PhotoBox 工具集的后端 Python 服务，提供图片背景移除和 OCR 功能。

## 功能

- 图片背景移除（使用 rembg）
- 图片文字识别（使用 RapidOCR）
- RESTful API 接口

## 部署到 Railway

### 方法一：直接部署（推荐）

1. 访问 [railway.app](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的仓库
4. 在 "Root Directory" 中设置为 `python-service`
5. Railway 会自动检测 Python 项目并部署

### 方法二：使用 Railway CLI

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

## 环境变量

- `PORT`: 服务端口（Railway 自动设置）
- `REMBG_MODEL_PATH`: rembg 模型路径（可选）

## API 端点

- `GET /`: 服务状态
- `GET /health`: 健康检查
- `POST /remove-background`: 背景移除
- `POST /ocr`: 文字识别

## 本地开发

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

服务将在 http://localhost:8000 启动
