# 腾讯云云函数手动部署指南

## 问题诊断
你的云函数创建失败，原因是：
- 账号未开通CLS日志服务
- 代码上传失败

## 解决方案：手动部署

### 1. 登录腾讯云控制台
访问：https://console.cloud.tencent.com/scf

### 2. 创建云函数
1. 点击"新建函数"
2. 选择"从头开始"
3. 填写函数信息：
   - 函数名称：`photobox-backend`
   - 运行环境：`Python 3.9`
   - 地域：`广州`
   - 创建方式：`空白函数`

### 3. 配置函数
1. 执行方法：`main.handler`
2. 内存：`512MB`
3. 超时时间：`30秒`
4. 环境变量：无需添加

### 4. 上传代码
1. 在"函数代码"页面
2. 删除默认的`index.py`文件
3. 上传我们准备的代码包：`photobox-backend-simple.zip`

### 5. 创建HTTP触发器
1. 在"触发器管理"页面
2. 点击"创建触发器"
3. 选择"API网关触发器"
4. 配置：
   - 触发方式：`API网关`
   - API网关：`新建API网关服务`
   - 请求方法：`ANY`
   - 发布环境：`发布`
   - 鉴权方式：`免鉴权`

### 6. 获取访问地址
创建完成后，在触发器页面会显示访问地址，格式类似：
```
https://service-xxx-xxx.gz.apigw.tencentcs.com/release/photobox-backend
```

## 测试API

### 健康检查
```bash
curl "你的API地址/health"
```

### 测试OCR
```bash
curl -X POST "你的API地址/ocr" \
  -H "Content-Type: application/json" \
  -d '{"image": "test"}'
```

## 前端配置

获取API地址后，更新前端配置：

```bash
# 创建.env.local文件
echo "NEXT_PUBLIC_TENCENT_API_URL=你的API地址" > .env.local

# 重新构建
npm run build

# 重新上传到COS
python upload_to_cos.py
```

## 故障排除

### 如果仍然失败
1. 检查腾讯云账号是否实名认证
2. 确认已开通云函数SCF服务
3. 检查账号余额是否充足
4. 尝试在其他地域创建（如北京、上海）

### 替代方案
如果云函数部署困难，建议使用：
1. **纯前端方案**：使用Tesseract.js和@imgly/background-removal
2. **Railway部署**：免费且简单
3. **Vercel部署**：与前端同平台


