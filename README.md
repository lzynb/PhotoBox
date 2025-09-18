# PhotoBox 工具集

一个专注图片处理的轻量化工具集合，支持图片压缩、缩放、OCR 文字识别和证件照换底色等功能。

## 🚀 功能特性

- **图片压缩**：在保证画质的前提下降低图片体积
- **图片缩放**：调整图片尺寸，支持保持纵横比
- **关键字检索**：OCR 文字识别，按关键词筛选图片
- **证件照换底色**：AI 抠图，快速替换背景为纯色

## 🛠️ 技术栈

- **前端**：Next.js 13 + TypeScript + Tailwind CSS
- **后端**：Python + FastAPI
- **AI 模型**：本地 OCR 和背景移除
- **部署**：Vercel (前端) + 腾讯云函数 (后端)

## 📦 安装和运行

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_TENCENT_API_URL=https://your-scf-http-trigger-url
```

## 🌐 部署

### Vercel 部署

1. Fork 此仓库
2. 在 Vercel 中导入项目
3. 设置环境变量 `NEXT_PUBLIC_TENCENT_API_URL`
4. 部署

### 腾讯云部署

参考 `tencent-cloud-deploy.md` 文档进行部署。

## 📱 使用说明

1. **图片压缩**：上传图片，选择压缩质量，下载压缩后的图片
2. **图片缩放**：上传图片，设置目标尺寸，下载调整后的图片
3. **关键字检索**：上传图片，输入关键词，查看匹配结果
4. **证件照换底色**：上传证件照，选择背景色，下载处理后的图片

## 🔒 数据安全

- 图片处理尽可能在本地完成
- 不主动上传到第三方服务器
- 仅在你主动分享时数据才会离开设备

## 📞 联系方式

- 邮箱：luzhiyang2024@163.com
- 微信：ZY_L0215

## 📄 许可证

MIT License