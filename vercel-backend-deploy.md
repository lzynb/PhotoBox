# Vercel 后端部署方案

## 1. 准备Vercel项目

### 创建API目录结构
```
api/
├── ocr/
│   └── route.py
├── remove-background/
│   └── route.py
└── requirements.txt
```

### 2. 创建API路由文件

**api/ocr/route.py**
```python
from http.server import BaseHTTPRequestHandler
import json
import base64
import sys
import os

# 添加python-service到路径
sys.path.append(os.path.join(os.path.dirname(__file__), '../../python-service'))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 读取请求体
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # 获取图片数据
            image_data = data.get('image')
            if not image_data:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No image data'}).encode())
                return
            
            # 解码图片
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            
            # 导入OCR处理函数
            from ocr_rapidocr import process_ocr
            result = process_ocr(image_bytes)
            
            # 返回结果
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
```

**api/remove-background/route.py**
```python
from http.server import BaseHTTPRequestHandler
import json
import base64
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../../python-service'))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            image_data = data.get('image')
            background_color = data.get('backgroundColor', '#FFFFFF')
            
            if not image_data:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No image data'}).encode())
                return
            
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            
            from remove_background import process_background_removal
            result = process_background_removal(image_bytes, background_color)
            
            if result['success']:
                self.send_response(200)
                self.send_header('Content-type', 'image/png')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(base64.b64decode(result['image']))
            else:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
```

**api/requirements.txt**
```
opencv-python
numpy
Pillow
rapidocr-onnxruntime
rembg
```

### 3. 部署到Vercel

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

### 4. 更新前端配置

```bash
# 创建.env.local
echo "NEXT_PUBLIC_API_URL=https://your-project.vercel.app" > .env.local

# 重新构建
npm run build

# 重新上传到COS
python upload_to_cos.py
```


