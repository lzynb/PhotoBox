# 🔧 PhotoBox 后端API测试指南

## 📋 测试准备

### 1. 确认云函数部署状态

**方法一：腾讯云控制台**
1. 登录腾讯云控制台：https://console.cloud.tencent.com/scf
2. 进入"云函数 SCF"
3. 查看是否有名为 `photobox-backend` 的函数
4. 检查函数状态是否为"运行中"

**方法二：命令行检查**
```powershell
tccli scf ListFunctions --region ap-guangzhou
```

### 2. 获取HTTP触发器地址

在云函数详情页面：
1. 点击"触发器"标签
2. 找到HTTP触发器
3. 复制访问地址，格式类似：
   ```
   https://service-xxx-xxx.gz.apigw.tencentcs.com/release/photobox-backend
   ```

## 🧪 测试方法

### 方法一：使用Python测试工具（推荐）

1. **安装依赖**
   ```powershell
   pip install requests
   ```

2. **运行测试工具**
   ```powershell
   python test_api.py
   ```

3. **按提示输入**
   - 云函数HTTP触发器地址
   - 测试图片路径（可选）

### 方法二：使用curl命令测试

**测试API健康状态**
```bash
curl -X OPTIONS "你的HTTP触发器地址" -v
```

**测试OCR API**
```bash
curl -X POST "你的HTTP触发器地址/ocr" \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."}'
```

**测试背景移除API**
```bash
curl -X POST "你的HTTP触发器地址/remove-background" \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...", "backgroundColor": "#FF0000"}'
```

### 方法三：使用Postman测试

1. 创建新请求
2. 设置请求方法为POST
3. 输入URL：`你的HTTP触发器地址/ocr`
4. 设置Headers：`Content-Type: application/json`
5. 设置Body（raw JSON）：
   ```json
   {
     "image": "data:image/jpeg;base64,你的base64图片数据"
   }
   ```

## 🔍 测试检查点

### ✅ 成功指标
- **健康检查**：OPTIONS请求返回200状态码
- **OCR API**：返回JSON格式的识别结果
- **背景移除API**：返回PNG格式的图片数据

### ❌ 常见错误及解决方案

**1. 404 Not Found**
- 检查HTTP触发器地址是否正确
- 确认云函数已部署且状态为"运行中"

**2. 500 Internal Server Error**
- 检查云函数日志：控制台 → 云函数 → 日志查询
- 确认Python依赖已正确安装

**3. CORS错误**
- 确认云函数代码中已设置CORS响应头
- 检查Access-Control-Allow-Origin设置

**4. 超时错误**
- 增加云函数超时时间（建议30秒）
- 检查图片大小是否过大

## 🎯 前端集成测试

### 1. 配置环境变量

创建 `.env.local` 文件：
```bash
NEXT_PUBLIC_TENCENT_API_URL=你的HTTP触发器地址
```

### 2. 重新构建前端

```powershell
npm run build
```

### 3. 重新上传到COS

```powershell
python upload_to_cos.py
```

### 4. 功能测试

访问你的网站，测试：
- 图片压缩功能
- 图片缩放功能  
- OCR文字识别功能
- 证件照换底色功能

## 📊 性能监控

### 云函数监控
- 调用次数
- 错误率
- 平均执行时间
- 内存使用情况

### 成本监控
- 函数调用费用
- 流量费用
- 存储费用

## 🚨 故障排除

### 如果API测试失败

1. **检查云函数日志**
   - 控制台 → 云函数 → 日志查询
   - 查看错误信息和堆栈跟踪

2. **验证依赖安装**
   - 确认requirements.txt中的包已安装
   - 检查Python版本兼容性

3. **测试本地运行**
   ```powershell
   cd python-service
   python main.py
   ```

4. **重新部署云函数**
   - 更新代码包
   - 重新创建HTTP触发器

### 如果前端无法连接后端

1. **检查网络连接**
   - 确认前端可以访问云函数地址
   - 检查防火墙设置

2. **验证CORS配置**
   - 确认云函数返回正确的CORS头
   - 检查预检请求处理

3. **检查环境变量**
   - 确认NEXT_PUBLIC_TENCENT_API_URL设置正确
   - 重新构建前端项目

## 📞 获取帮助

如果遇到问题：
1. 查看云函数日志
2. 检查腾讯云文档
3. 联系技术支持


