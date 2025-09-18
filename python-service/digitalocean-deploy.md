# DigitalOcean App Platform 部署指南

## 步骤 1：创建账户

1. 访问 [digitalocean.com](https://digitalocean.com)
2. 注册账户（需要信用卡）
3. 进入 App Platform

## 步骤 2：创建应用

1. 点击 "Create App"
2. 选择 "GitHub" 作为源代码
3. 连接你的 GitHub 账号
4. 选择 `lzynb/PhotoBox` 仓库

## 步骤 3：配置应用

- **Source Directory**: `python-service`
- **Type**: `Web Service`
- **Build Command**: `pip install -r requirements.txt`
- **Run Command**: `python main.py`

## 步骤 4：选择计划

- 选择 "Basic" 计划（$5/月）
- 或 "Starter" 计划（$12/月）

## 步骤 5：部署

1. 点击 "Create Resources"
2. 等待部署完成
3. 获取服务 URL

## 成本

- Basic: $5/月
- Starter: $12/月






