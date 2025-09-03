# PhotoBox by DeepSeek

一个功能强大的图像处理工具集，包含图像缩放、OCR文字识别和背景更换功能。

## 🚀 功能特性

### ✅ **已实现功能**

1. **Image Resizer (图像缩放器)**
   - 客户端图像缩放
   - 保持宽高比选项
   - 实时预览和下载

2. **Image Keyword Searcher (图像关键词搜索器)**
   - 多图像上传（支持拖拽）
   - 服务器端OCR文字识别
   - 关键词搜索（支持中英文）
   - 包含/不包含关键词过滤
   - 单个和批量图片下载

3. **ID Photo Background Changer (证件照背景更换器)**
   - 使用Remove.bg API
   - 多种背景颜色选项
   - 原始图片和结果对比显示

## 🔧 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Next.js 13.5 API Routes (兼容Node.js 18.4.0)
- **OCR引擎**: Tesseract.js (服务器端)
- **图像处理**: Sharp, Canvas API
- **背景移除**: Remove.bg API

## ⚠️ Node.js版本要求

- **当前支持**: Node.js 18.4.0+
- **推荐版本**: Node.js 18.17.0+ 或 20.x LTS
- **如果遇到版本问题**: 运行 `fix-node-version.bat` (Windows) 或 `./fix-node-version.sh` (Linux/macOS)

## 🛠️ 安装和配置

### 1. **环境要求**
- Node.js 16+
- npm 或 yarn

### 2. **安装依赖**
```bash
npm install
```

### 3. **环境变量配置**
创建 `.env.local` 文件：
```env
# Remove.bg API Key (用于背景移除功能)
REMOVE_BG_API_KEY=your_api_key_here
```

### 4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

## 📖 使用方法

### **Image Resizer**
1. 访问 `/resize` 页面
2. 上传图片
3. 设置目标尺寸
4. 选择是否保持宽高比
5. 查看预览并下载

### **Image Keyword Searcher**
1. 访问 `/search` 页面
2. 拖拽或选择多张图片
3. 点击"Start OCR Processing"
4. 输入关键词进行搜索
5. 查看匹配的图片并下载

### **ID Photo Background Changer**
1. 访问 `/background` 页面
2. 上传证件照
3. 选择新的背景颜色
4. 查看结果并下载

## 🐛 问题修复

### ✅ **已修复的问题**

1. **Next.js配置警告**
   - ✅ 移除了过时的`experimental.appDir`配置
   - ✅ 更新到Next.js 14
   - ✅ 简化了webpack配置

2. **OCR引擎问题**
   - ✅ 修复了`NodePython`导入错误
   - ✅ 改用服务器端Tesseract.js
   - ✅ 简化了API实现

3. **依赖项问题**
   - ✅ 移除了不必要的依赖
   - ✅ 更新了Tesseract.js版本
   - ✅ 清理了package.json

## 📁 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── ocr/route.ts          # OCR API端点
│   │   └── test/route.ts         # 测试API端点
│   ├── resize/page.tsx           # 图像缩放页面
│   ├── search/page.tsx           # 图像搜索页面
│   ├── background/page.tsx       # 背景更换页面
│   └── page.tsx                  # 主页面
├── components/
│   ├── ImageResizer.tsx          # 图像缩放组件
│   ├── ImageKeywordSearcher.tsx  # 图像搜索组件
│   └── IDPhotoBackgroundChanger.tsx # 背景更换组件
└── lib/
    ├── api.ts                    # API工具函数
    └── utils.ts                  # 工具函数
```

## 🔍 API端点

### **OCR API**
- `POST /api/ocr` - 图片OCR识别
  - 请求: FormData with 'image' file
  - 响应: `{ success: boolean, text: string, confidence: number }`

### **Test API**
- `GET /api/test` - 测试API连接
  - 响应: `{ success: boolean, message: string }`

## 📊 性能特性

### **OCR处理**
- 单张图片：2-5秒
- 批量处理：自动序列化处理
- 支持格式：JPEG, PNG, BMP等
- 语言支持：中文简体 + 英文

### **图像处理**
- 客户端实时预览
- 服务器端高质量处理
- 自动文件清理
- 内存优化

## 🚀 部署

### **Vercel部署**
```bash
npm run build
```

### **其他平台**
确保环境变量正确配置，特别是Remove.bg API密钥。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License

## 📞 支持

如果遇到问题，请：
1. 检查控制台错误信息
2. 确认环境变量配置
3. 验证API密钥有效性
4. 提交Issue描述问题
