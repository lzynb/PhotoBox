# 本地开发 + ngrok 方案

## 步骤 1：本地运行 Python 服务

```bash
# 进入 python-service 目录
cd python-service

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

服务将在 http://localhost:8000 启动

## 步骤 2：使用 ngrok 暴露本地服务

```bash
# 安装 ngrok
# 下载：https://ngrok.com/download

# 暴露本地 8000 端口
ngrok http 8000
```

ngrok 会提供一个公网 URL，类似：`https://abc123.ngrok.io`

## 步骤 3：配置 Vercel 环境变量

在 Vercel 项目设置中添加：
- **Name**: `PYTHON_SERVICE_URL`
- **Value**: 你的 ngrok URL（例如：`https://abc123.ngrok.io`）

## 步骤 4：测试功能

访问你的 Vercel 网站，测试关键词检索和照片换底色功能。

## 注意事项

- ngrok 免费计划有连接数限制
- 每次重启 ngrok 都会获得新的 URL
- 仅适用于测试，不适合生产环境






