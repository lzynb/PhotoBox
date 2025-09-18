# 腾讯云快速部署指南

## 🚀 一键部署（推荐）

### 前提条件
1. 腾讯云账号（已完成实名认证）
2. 已安装腾讯云 CLI

### 快速开始

```bash
# 1. 配置腾讯云 CLI
tccli configure

# 2. 运行部署脚本
# Windows:
tencent-cloud-config/deploy.bat

# Linux/Mac:
bash tencent-cloud-config/deploy.sh
```

## 📋 手动部署步骤

### 步骤 1：准备腾讯云账号
1. 访问 [cloud.tencent.com](https://cloud.tencent.com)
2. 注册并完成实名认证
3. 开通服务：静态网站托管、云函数 SCF、API 网关、对象存储 COS

### 步骤 2：安装腾讯云 CLI
```bash
# Windows: 下载安装包
# https://cloud.tencent.com/document/product/440/34011

# 配置 CLI
tccli configure
# 输入 SecretId、SecretKey、地域（如 ap-beijing）
```

### 步骤 3：构建前端
```bash
npm run build
```

### 步骤 4：部署前端
1. 登录腾讯云控制台 → 对象存储 COS
2. 创建存储桶：`photobox-frontend-{时间戳}`
3. 启用静态网站功能
4. 上传 `out` 目录中的所有文件

### 步骤 5：部署后端
1. 登录腾讯云控制台 → 云函数 SCF
2. 创建函数：
   - 名称：`photobox-backend`
   - 环境：Python 3.9
   - 执行方法：`main.handler`
3. 上传代码包（使用 `tencent-cloud-config/main.py`）

### 步骤 6：配置 API 网关
1. 登录腾讯云控制台 → API 网关
2. 创建服务：`photobox-api`
3. 创建 API：
   - `/ocr` → `photobox-backend`
   - `/remove-background` → `photobox-backend`
4. 发布服务

### 步骤 7：测试
访问你的静态网站地址，测试功能是否正常。

## 💰 成本说明

**免费额度**：
- 静态网站托管：1GB 存储 + 10GB 流量/月
- 云函数：100万次调用/月  
- API 网关：100万次调用/月

**基本免费使用**，超出部分按量计费。

## 🔧 故障排除

### 常见问题
1. **云函数超时**：增加超时时间到 30 秒
2. **跨域问题**：在 API 网关配置 CORS
3. **静态网站 404**：检查文件路径和配置

### 获取帮助
- 腾讯云文档：https://cloud.tencent.com/document
- 技术支持：腾讯云工单系统

## 📞 联系信息
- 邮箱：luzhiyang2024@163.com
- 微信：ZY_L0215





