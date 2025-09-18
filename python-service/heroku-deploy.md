# Heroku 部署指南

## 前提条件

- 需要信用卡验证（即使使用免费计划）
- 安装 Heroku CLI

## 步骤 1：安装 Heroku CLI

```bash
# Windows (使用 Chocolatey)
choco install heroku-cli

# 或下载安装包
# https://devcenter.heroku.com/articles/heroku-cli
```

## 步骤 2：登录 Heroku

```bash
heroku login
```

## 步骤 3：创建应用

```bash
# 在 python-service 目录中
cd python-service
heroku create photobox-python-backend
```

## 步骤 4：配置构建包

```bash
heroku buildpacks:set heroku/python
```

## 步骤 5：部署

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 步骤 6：配置环境变量

```bash
heroku config:set PYTHON_VERSION=3.11.0
```

## 步骤 7：获取服务 URL

```bash
heroku apps:info
```

## 注意事项

- Heroku 免费计划已停止，需要付费计划
- 最低 $7/月






