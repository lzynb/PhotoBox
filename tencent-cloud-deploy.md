# 腾讯云部署完整指南

## 方案概述

我们将使用以下腾讯云服务：
- **静态网站托管**：部署 Next.js 前端
- **云函数 SCF**：部署 Python 后端（使用HTTP触发器）
- **对象存储 COS**：存储静态资源

**注意**：API网关已停止售卖，我们使用云函数SCF的HTTP触发器作为替代方案。

## 成本预估

- 静态网站托管：免费额度 1GB 存储 + 10GB 流量/月
- 云函数：免费额度 100万次调用/月
- **总计：基本免费使用**

## 步骤 1：准备腾讯云账号

### 1.1 注册腾讯云账号
1. 访问 [cloud.tencent.com](https://cloud.tencent.com)
2. 注册账号并完成实名认证
3. 开通以下服务：
   - 静态网站托管
   - 云函数 SCF
   - 对象存储 COS

### 1.2 安装腾讯云 CLI
```bash
# Windows 下载安装包
# https://cloud.tencent.com/document/product/440/34011

# 或使用 pip 安装
pip install tencentcloud-sdk-python
```

### 1.3 配置密钥
```bash
# 在腾讯云控制台获取 SecretId 和 SecretKey
# 访问：https://console.cloud.tencent.com/cam/capi

# 配置 CLI
tccli configure
# 输入 SecretId、SecretKey、地域（如 ap-beijing）
```

## 步骤 2：准备部署文件

### 2.1 创建腾讯云部署配置

我已经为你创建了以下配置文件：
- `tencent-cloud-config/static-site.json` - 静态网站配置
- `tencent-cloud-config/scf-config.json` - 云函数配置  
- `tencent-cloud-config/deploy.sh` - Linux/Mac 部署脚本
- `tencent-cloud-config/deploy.bat` - Windows 部署脚本
- `tencent-cloud-config/main.py` - 云函数入口文件

### 2.2 修改项目配置

我已经修改了 `next.config.js` 以支持静态导出：
- 添加了 `output: 'export'` 配置
- 设置了 `trailingSlash: true`
- 配置了 `images.unoptimized: true`

## 步骤 3：部署前端到静态网站托管

### 3.1 构建前端项目
```bash
npm run build
```

### 3.2 创建 COS 存储桶
1. 登录腾讯云控制台
2. 进入对象存储 COS
3. 创建存储桶：
   - 名称：`photobox-frontend-{随机后缀}`
   - 地域：选择离你最近的（如北京）
   - 访问权限：公有读私有写

### 3.3 配置静态网站
1. 在存储桶中启用静态网站功能
2. 设置首页：`index.html`
3. 设置错误页：`404.html`

### 3.4 上传文件
将 `out` 目录中的所有文件上传到存储桶根目录

## 步骤 4：部署后端到云函数

### 4.1 准备云函数代码

**Windows 用户**：
```powershell
# 进入 python-service 目录
cd python-service

# 复制云函数入口文件
copy ..\tencent-cloud-config\main.py .

# 创建部署包（使用PowerShell压缩）
Compress-Archive -Path * -DestinationPath ..\photobox-backend.zip -Force
```

**Linux/Mac 用户**：
```bash
# 进入 python-service 目录
cd python-service

# 复制云函数入口文件
cp ../tencent-cloud-config/main.py .

# 创建部署包
zip -r ../photobox-backend.zip .
```

### 4.2 创建云函数
1. 登录腾讯云控制台
2. 进入云函数 SCF
3. 创建函数：
   - 函数名称：`photobox-backend`
   - 运行环境：Python 3.9
   - 执行方法：`main.handler`
   - 上传代码：选择 `photobox-backend.zip`
   - **触发器类型**：HTTP触发器（重要！）
   - **访问方式**：公网访问

### 4.3 高级配置（解决上传失败问题）
如果出现"上传失败，请在高级配置中填写启动命令"的提示，请按以下步骤配置：

1. **进入高级配置**：
   - 在创建函数页面，点击"高级配置"
   - 或创建后进入函数详情页面的"函数配置"

2. **配置启动命令**：
   ```
   pip install -r requirements.txt
   ```

3. **配置环境变量**：
   - `PYTHON_VERSION`: `3.9`
   - `PYTHONPATH`: `/var/user`

4. **配置超时时间**：
   - 执行超时时间：30秒（OCR和背景移除需要较长时间）

5. **配置内存**：
   - 内存大小：512MB（推荐，处理图片需要足够内存）

### 4.4 故障排除
如果仍然遇到问题，请检查：

1. **requirements.txt 文件**：
   确保 `python-service` 目录下有 `requirements.txt` 文件

2. **文件结构**：
   压缩包应包含以下文件：
   - `main.py`（云函数入口）
   - `requirements.txt`
   - `ocr_rapidocr.py`
   - `remove_background.py`
   - 其他依赖文件

3. **重新创建函数**：
   如果问题持续，可以删除现有函数重新创建

## 步骤 5：配置云函数 HTTP 触发器

### 5.1 获取云函数访问地址
1. 在云函数 SCF 控制台中
2. 进入 `photobox-backend` 函数
3. 点击"触发器"标签
4. 复制 HTTP 触发器的访问地址
5. 地址格式类似：`https://service-xxx-xxx.gz.apigw.tencentcs.com/release/photobox-backend`

### 5.2 配置路由
云函数会自动处理以下路由：
- `POST /ocr` - OCR 文字识别
- `POST /remove-background` - 背景移除

### 5.3 测试云函数
使用云函数提供的测试功能验证接口是否正常工作

## 步骤 6：配置前端调用后端

### 6.1 修改前端 API 调用
需要修改前端代码，将 API 调用指向云函数 HTTP 触发器：

```typescript
// 在 src/lib/api.ts 中添加
const TENCENT_API_BASE = process.env.NEXT_PUBLIC_TENCENT_API_URL || '';

export const callTencentAPI = async (endpoint: string, data: any) => {
  const response = await fetch(`${TENCENT_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return response;
};
```

### 6.2 设置环境变量
**注意**：腾讯云静态网站托管（COS）不支持直接设置环境变量。需要在构建时设置：

**方法一：使用 .env.local 文件（推荐）**
```bash
# 在项目根目录创建 .env.local 文件
echo "NEXT_PUBLIC_TENCENT_API_URL=https://your-scf-http-trigger-url" > .env.local

# 重新构建
npm run build
```

**方法二：在构建命令中设置**
```bash
# Windows PowerShell
$env:NEXT_PUBLIC_TENCENT_API_URL="https://your-scf-http-trigger-url"; npm run build

# Linux/Mac
NEXT_PUBLIC_TENCENT_API_URL=https://your-scf-http-trigger-url npm run build
```

**方法三：修改 next.config.js（已配置）**
已在 `next.config.js` 中添加环境变量支持，只需在构建时设置 `NEXT_PUBLIC_TENCENT_API_URL` 环境变量即可。 

## 步骤 7：测试部署

### 7.1 测试前端
访问你的静态网站地址，检查页面是否正常加载

### 7.2 测试 API
使用 Postman 或 curl 测试 API：
```bash
# 测试 OCR API
curl -X POST https://your-scf-http-trigger-url/ocr \
  -H "Content-Type: application/json" \
  -d '{"image": "base64-encoded-image-data"}'

# 测试背景移除 API  
curl -X POST https://your-scf-http-trigger-url/remove-background \
  -H "Content-Type: application/json" \
  -d '{"image": "base64-encoded-image-data", "backgroundColor": "#FF0000"}'
```

## 步骤 8：配置自定义域名（可选）

### 8.1 购买域名
在腾讯云域名注册购买域名

### 8.2 配置 CDN
1. 进入 CDN 控制台
2. 添加域名
3. 源站类型：COS
4. 源站地址：你的 COS 存储桶

### 8.3 配置 SSL 证书
1. 申请免费 SSL 证书
2. 绑定到 CDN 域名
3. 启用 HTTPS

## 成本优化建议

1. **使用免费额度**：
   - 静态网站托管：1GB 存储 + 10GB 流量/月
   - 云函数：100万次调用/月
   - API 网关：100万次调用/月

2. **监控使用量**：
   - 设置费用告警
   - 定期检查账单

3. **优化资源**：
   - 压缩图片和代码
   - 使用 CDN 加速
   - 合理设置缓存

## 故障排除

### 常见问题

1. **云函数超时**：
   - 增加超时时间到 30 秒
   - 优化 Python 代码性能

2. **云函数跨域**：
   - 在云函数代码中添加 CORS 响应头
   - 处理 OPTIONS 预检请求

3. **静态网站 404**：
   - 检查文件路径
   - 确认 `trailingSlash` 配置

4. **图片上传失败**：
   - 检查文件大小限制
   - 确认 Base64 编码正确

## 自动化部署

使用提供的部署脚本：
```bash
# Windows
tencent-cloud-config/deploy.bat

# Linux/Mac  
bash tencent-cloud-config/deploy.sh
```

脚本会自动完成：
- 构建前端
- 创建存储桶
- 上传文件
- 部署云函数（配置HTTP触发器）
