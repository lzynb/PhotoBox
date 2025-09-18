# Railway 后端部署方案

## 1. 准备Railway项目

### 创建部署配置

**railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python main.py",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**main.py** (Railway入口文件)
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import base64
import json

app = FastAPI(title="PhotoBox API")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/ocr")
async def ocr_endpoint(request: dict):
    try:
        from ocr_rapidocr import process_ocr
        
        image_data = request.get('image')
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        result = process_ocr(image_bytes)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/remove-background")
async def remove_background_endpoint(request: dict):
    try:
        from remove_background import process_background_removal
        
        image_data = request.get('image')
        background_color = request.get('backgroundColor', '#FFFFFF')
        
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        result = process_background_removal(image_bytes, background_color)
        
        if result['success']:
            return {"image": result['image']}
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Processing failed'))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**requirements.txt**
```
fastapi==0.104.1
uvicorn==0.24.0
opencv-python
numpy
Pillow
rapidocr-onnxruntime
rembg
```

## 2. 部署步骤

### 方法一：GitHub集成
1. 将代码推送到GitHub
2. 访问 https://railway.app
3. 连接GitHub仓库
4. 自动部署

### 方法二：Railway CLI
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

## 3. 获取部署地址

部署完成后，Railway会提供类似这样的地址：
```
https://your-project-production.up.railway.app
```

## 4. 更新前端配置

```bash
# 创建.env.local
echo "NEXT_PUBLIC_API_URL=https://your-project-production.up.railway.app" > .env.local

# 重新构建
npm run build

# 重新上传到COS
python upload_to_cos.py
```


