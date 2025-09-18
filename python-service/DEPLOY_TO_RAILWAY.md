# Railway 部署详细步骤

## 选项 1：在现有仓库中设置 Root Directory

1. 访问 [railway.app](https://railway.app)
2. 登录你的 GitHub 账号
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择 `lzynb/PhotoBox` 仓库
6. 在部署配置中找到 "Root Directory" 字段
7. 输入：`python-service`
8. 点击 "Deploy"

## 选项 2：如果找不到 Root Directory 设置

1. 部署完成后，进入项目设置
2. 点击 "Settings" 标签
3. 找到 "Build" 部分
4. 在 "Root Directory" 中输入：`python-service`
5. 保存并重新部署

## 选项 3：使用 Railway CLI

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 在项目根目录运行
railway init

# 设置根目录
railway variables set RAILWAY_ROOT_DIRECTORY=python-service

# 部署
railway up
```

## 选项 4：创建独立仓库（最简单）

如果上述方法都不工作，建议：

1. 在 GitHub 上创建一个新仓库，比如 `photobox-python-backend`
2. 将 `python-service` 目录下的所有文件复制到新仓库的根目录
3. 在 Railway 中部署这个新仓库
4. 在 Vercel 中设置环境变量指向新的 Python 服务

## 验证部署

部署成功后，你应该看到：
- Railway 显示服务正在运行
- 健康检查端点返回 200 状态码
- 获得一个类似 `https://your-service-name.railway.app` 的 URL

## 常见问题

**Q: 找不到 Root Directory 设置**
A: 尝试在项目设置 → Build 部分查找，或者使用 Railway CLI

**Q: 部署失败**
A: 检查 `requirements.txt` 是否包含所有依赖，确保 Python 版本兼容

**Q: 服务无法启动**
A: 检查 `main.py` 中的端口配置，Railway 会自动设置 PORT 环境变量






