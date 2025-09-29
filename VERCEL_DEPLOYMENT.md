# 🚀 Vercel 全栈部署指南

## 项目结构
```
photobox_bydeepseek/
├── src/                    # Next.js 前端
│   ├── app/
│   ├── components/
│   └── lib/
├── api/                    # Vercel Python API
│   ├── ocr.py             # OCR 端点
│   ├── remove-background.py # 背景移除端点
│   ├── health.py          # 健康检查
│   └── utils.py           # 共享工具
├── package.json           # 前端依赖
├── requirements.txt       # Python 依赖
├── vercel.json           # Vercel 配置
└── README.md
```

## 部署步骤

### 1. 准备代码
- ✅ 前端代码已配置为使用 `/api/ocr` 和 `/api/remove-background`
- ✅ Python API 端点已创建
- ✅ Vercel 配置已设置

### 2. 部署到 Vercel

#### 方法一：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

#### 方法二：通过 GitHub 集成
1. 将代码推送到 GitHub
2. 在 Vercel 控制台导入项目
3. 自动部署

### 3. 环境变量配置
在 Vercel 控制台设置以下环境变量（如需要）：
- `NEXT_PUBLIC_API_URL` (可选，默认为相对路径)

## API 端点

### 健康检查
- **URL**: `/api/health`
- **方法**: GET
- **响应**: JSON

### OCR 识别
- **URL**: `/api/ocr`
- **方法**: POST
- **请求体**:
  ```json
  {
    "image": "data:image/jpeg;base64,...",
    "filename": "test.jpg"
  }
  ```
- **响应**: JSON

### 背景移除
- **URL**: `/api/remove-background`
- **方法**: POST
- **请求体**:
  ```json
  {
    "image": "data:image/jpeg;base64,...",
    "newBgColor": "#FF0000"
  }
  ```
- **响应**: JSON

## 测试

### 本地测试
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产测试
部署完成后，访问你的 Vercel 域名：
- 前端: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/health`

## 优势

### ✅ Vercel 全栈部署的优势
1. **统一平台**: 前端和后端在同一个平台
2. **自动部署**: Git 推送自动触发部署
3. **全球 CDN**: 自动全球分发
4. **无服务器**: 按需计费，冷启动快
5. **简单配置**: 无需复杂的服务器配置
6. **内置优化**: 自动图片优化、代码分割等

### 🔧 扩展功能
如需集成真实 OCR 和背景移除服务，可以：

1. **集成第三方 API**:
   - OCR: Google Vision API, Azure Computer Vision
   - 背景移除: Remove.bg API, Clipdrop API

2. **添加真实 AI 模型**:
   - 在 `api/` 目录添加模型文件
   - 使用 `onnxruntime` 等库运行模型

3. **数据库集成**:
   - 使用 Vercel 的数据库服务
   - 或连接外部数据库

## 故障排除

### 常见问题
1. **Python 依赖安装失败**: 检查 `requirements.txt` 格式
2. **API 路由不工作**: 检查 `vercel.json` 配置
3. **CORS 错误**: 检查 API 响应头设置

### 调试
- 查看 Vercel 函数日志
- 使用 Vercel CLI 本地调试: `vercel dev`
- 检查网络请求和响应

## 成本
- **免费额度**: 每月 100GB 带宽，1000 次函数调用
- **付费计划**: 按使用量计费，价格透明
- **预估**: 小型项目基本免费

## 下一步
1. 部署到 Vercel
2. 测试所有功能
3. 根据需要集成真实 AI 服务
4. 优化性能和用户体验
