# 腾讯云后端测试指南

## 测试准备

在开始测试之前，您需要：

1. **获取云函数HTTP触发器地址**
   - 登录腾讯云控制台
   - 进入云函数 SCF
   - 找到您的 `photobox-backend` 函数
   - 点击"触发器"标签
   - 复制HTTP触发器的访问地址
   - 地址格式类似：`https://service-xxx-xxx.gz.apigw.tencentcs.com/release/photobox-backend`

2. **配置测试脚本**
   - 将测试脚本中的 `SCF_URL` 替换为您的实际地址

## 测试方法

### 方法一：使用Python脚本（推荐）

```bash
# 安装依赖
pip install requests pillow

# 运行完整测试
python test_tencent_backend.py

# 或运行快速测试
python quick_test.py
```

### 方法二：使用PowerShell脚本

```powershell
# 运行PowerShell测试脚本
.\test_ps.ps1
```

### 方法三：使用批处理脚本

```cmd
# 运行批处理测试脚本
test_curl.bat
```

### 方法四：手动curl测试

```bash
# 1. 健康检查
curl -X GET "https://your-scf-url/health"

# 2. 测试CORS
curl -X OPTIONS "https://your-scf-url/ocr" \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST"

# 3. 测试OCR接口
curl -X POST "https://your-scf-url/ocr" \
  -H "Content-Type: application/json" \
  -d '{"image":"test_data"}'

# 4. 测试背景移除接口
curl -X POST "https://your-scf-url/remove-background" \
  -H "Content-Type: application/json" \
  -d '{"image":"test_data","backgroundColor":"#FF0000"}'
```

## 测试项目说明

### 1. 健康检查测试
- **目的**：验证云函数是否正常运行
- **预期结果**：返回200状态码，包含健康状态信息
- **测试路径**：`/health` 或 `/`

### 2. CORS跨域测试
- **目的**：验证前端能否正常调用后端API
- **预期结果**：OPTIONS请求返回200，包含正确的CORS头
- **测试方法**：发送OPTIONS预检请求

### 3. OCR功能测试
- **目的**：验证OCR文字识别功能
- **预期结果**：能正确处理图片数据并返回识别结果
- **测试路径**：`/ocr`

### 4. 背景移除测试
- **目的**：验证背景移除功能
- **预期结果**：能正确处理图片并返回新背景的图片
- **测试路径**：`/remove-background`

### 5. 错误处理测试
- **目的**：验证API的错误处理能力
- **预期结果**：对无效输入返回适当的错误信息
- **测试方法**：发送无效的图片数据

## 预期测试结果

### 成功情况
```
✅ 健康检查通过: PhotoBox API is running
✅ CORS预检请求成功
✅ OCR功能正常
✅ 背景移除功能正常
✅ 错误处理正常
```

### 常见问题及解决方案

#### 1. 连接超时
- **原因**：云函数冷启动或网络问题
- **解决**：增加超时时间，或预热云函数

#### 2. 404错误
- **原因**：HTTP触发器配置错误或路径不正确
- **解决**：检查云函数触发器配置，确认访问地址正确

#### 3. 500内部错误
- **原因**：代码错误或依赖缺失
- **解决**：检查云函数日志，确认所有依赖已正确安装

#### 4. CORS错误
- **原因**：CORS头配置不正确
- **解决**：检查云函数代码中的CORS头设置

## 性能测试

### 响应时间测试
```bash
# 使用curl测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s "https://your-scf-url/health"
```

创建 `curl-format.txt` 文件：
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### 并发测试
```bash
# 使用ab工具进行并发测试
ab -n 100 -c 10 "https://your-scf-url/health"
```

## 测试报告模板

```
测试时间：2024-XX-XX XX:XX:XX
云函数地址：https://your-scf-url
测试环境：Windows/Linux/Mac

测试结果：
✅ 健康检查：通过
✅ CORS支持：通过
✅ OCR功能：通过
✅ 背景移除：通过
✅ 错误处理：通过

性能指标：
- 平均响应时间：XXXms
- 成功率：100%
- 并发处理能力：正常

问题记录：
- 无问题

总体评价：后端服务运行正常，可以投入使用
```

## 下一步

测试通过后，您可以：

1. **配置前端**：将前端API调用地址指向云函数
2. **设置环境变量**：在构建前端时设置API地址
3. **部署前端**：将前端部署到静态网站托管
4. **端到端测试**：测试完整的前后端交互流程

