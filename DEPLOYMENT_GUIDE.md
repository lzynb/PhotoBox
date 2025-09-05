# PhotoBox 部署指南

## 方案一：Vercel + Railway（推荐）

### 第一步：部署 Next.js 到 Vercel

1. **连接 GitHub 仓库**：
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入 GitHub 仓库 `lzynb/PhotoBox`
   - 框架选择 "Next.js"
   - 点击 "Deploy"

2. **配置环境变量**：
   在 Vercel 项目设置 → Environment Variables 中添加：
   ```
   PYTHON_SERVICE_URL=https://your-python-service.railway.app
   ```

### 第二步：部署 Python 服务到 Railway

1. **准备 Python 服务**：
   - 项目已包含 `python-service/` 目录
   - 包含 FastAPI 服务、依赖文件和部署配置

2. **部署到 Railway**：
   - 访问 [railway.app](https://railway.app)
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你的仓库，选择 `python-service` 目录
   - Railway 会自动检测 Python 项目并部署

3. **配置 Railway 环境变量**（可选）：
   ```
   REMBG_MODEL_PATH=/app/models
   ```

4. **获取服务 URL**：
   - 部署完成后，Railway 会提供一个 URL
   - 格式类似：`https://your-service-name.railway.app`
   - 将此 URL 设置为 Vercel 的 `PYTHON_SERVICE_URL`

### 第三步：测试部署

1. **测试 Python 服务**：
   ```bash
   curl https://your-service-name.railway.app/health
   ```

2. **测试完整功能**：
   - 访问 Vercel 部署的网站
   - 测试图片压缩、缩放、OCR、背景替换功能

## 方案二：全栈部署到 Railway

1. **修改项目结构**：
   - 将 `python-service/` 内容移到项目根目录
   - 创建 `Procfile`：
     ```
     web: python main.py
     ```

2. **部署**：
   - 在 Railway 上选择整个项目
   - 配置构建命令：`npm install && npm run build`
   - 配置启动命令：`python main.py`

## 方案三：Docker 部署

1. **创建 Dockerfile**：
   ```dockerfile
   FROM node:18-alpine
   RUN apk add --no-cache python3 py3-pip
   WORKDIR /app
   COPY . .
   RUN npm install && pip install -r python-service/requirements.txt
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **部署到支持 Docker 的平台**：
   - DigitalOcean App Platform
   - Google Cloud Run
   - AWS ECS

## 环境变量说明

### Vercel 环境变量：
- `PYTHON_SERVICE_URL`: Python 服务的完整 URL

### Python 服务环境变量：
- `REMBG_MODEL_PATH`: rembg 模型文件路径（可选）
- `PORT`: 服务端口（Railway 自动设置）

## 故障排除

### 常见问题：

1. **Python 服务无法访问**：
   - 检查 Railway 部署状态
   - 确认 URL 正确
   - 检查 CORS 设置

2. **模型文件缺失**：
   - Railway 会自动下载 rembg 模型
   - 如果失败，可以手动上传到 Railway 文件系统

3. **超时问题**：
   - 增加 Vercel 函数超时时间
   - 优化 Python 服务性能

### 监控和日志：

1. **Vercel**：
   - 在 Vercel 仪表盘查看函数日志
   - 监控 API 调用次数和错误率

2. **Railway**：
   - 查看部署日志
   - 监控服务状态和资源使用

## 成本估算

### 方案一（Vercel + Railway）：
- Vercel：免费额度通常足够
- Railway：$5/月起

### 方案二（全栈 Railway）：
- Railway：$5/月起

### 方案三（Docker）：
- 根据选择的云平台：$10-50/月

## 安全建议

1. **限制 CORS 来源**：
   - 在生产环境中限制 `allow_origins` 为你的域名

2. **API 限流**：
   - 考虑添加 API 限流机制

3. **环境变量安全**：
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理配置

## 性能优化

1. **图片处理优化**：
   - 限制上传文件大小
   - 添加图片压缩

2. **缓存策略**：
   - 为静态资源添加缓存头
   - 考虑使用 CDN

3. **数据库**（如需要）：
   - 考虑添加 Redis 缓存
   - 使用连接池优化数据库连接
