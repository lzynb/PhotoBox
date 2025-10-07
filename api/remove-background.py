# Vercel Python API - 背景移除端点（真实AI版本）
from http.server import BaseHTTPRequestHandler
import json
import base64
import io
import os
import sys
import re
import time

# 添加当前目录到 Python 路径
sys.path.append(os.path.dirname(__file__))

# 全局rembg会话（懒加载）
_rembg_session = None

def load_rembg_session():
    """加载rembg会话"""
    global _rembg_session
    if _rembg_session is not None:
        return _rembg_session
    
    try:
        from rembg import new_session
        
        # 模型文件路径
        models_dir = os.path.dirname(__file__)
        u2netp_path = os.path.join(models_dir, "u2netp.onnx")
        
        if not os.path.exists(u2netp_path):
            raise FileNotFoundError(f"背景移除模型文件不存在: {u2netp_path}")
        
        # 设置模型目录
        os.environ["U2NET_HOME"] = models_dir
        
        # 初始化会话
        _rembg_session = new_session("u2netp")
        return _rembg_session
        
    except ImportError as e:
        raise ImportError(f"rembg依赖未安装: {e}")
    except Exception as e:
        raise Exception(f"背景移除模型加载失败: {e}")

class handler(BaseHTTPRequestHandler):
    """Vercel函数入口"""
    
    def do_POST(self):
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            body = json.loads(body_bytes.decode('utf-8'))
            
            image_data = body.get('image')
            new_bg_color = body.get('newBgColor', '#FFFFFF')
            
            if not image_data:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': 'No image data provided'
                }, ensure_ascii=False).encode('utf-8'))
                return
            
            # 验证颜色格式
            if not re.match(r'^#[0-9A-Fa-f]{6}$', new_bg_color):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': 'Invalid color format. Use hex format like #FFFFFF'
                }, ensure_ascii=False).encode('utf-8'))
                return
            
            # Base64解码图片
            if image_data.startswith('data:'):
                image_data = image_data.split(',', 1)[1]
            image_bytes = base64.b64decode(image_data)
            
            # 执行背景移除
            start_time = time.time()
            from PIL import Image
            from rembg import remove
            
            # 打开原图
            rgba_image = Image.open(io.BytesIO(image_bytes)).convert('RGBA')
            
            # 移除背景
            session = load_rembg_session()
            fg_png_bytes = io.BytesIO()
            rgba_image.save(fg_png_bytes, format='PNG')
            fg_png_bytes = fg_png_bytes.getvalue()
            
            fg_png_bytes = remove(fg_png_bytes, session=session)
            
            # 添加新背景
            fg_image = Image.open(io.BytesIO(fg_png_bytes)).convert('RGBA')
            bg_image = Image.new('RGBA', fg_image.size, new_bg_color + 'FF')
            result_image = Image.alpha_composite(bg_image, fg_image).convert('RGBA')
            
            # 转换为PNG字节
            result_png_bytes = io.BytesIO()
            result_image.save(result_png_bytes, format='PNG')
            result_png_bytes = result_png_bytes.getvalue()
            
            processing_time = time.time() - start_time
            
            # 发送响应（图片）
            self.send_response(200)
            self.send_header('Content-Type', 'image/png')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(result_png_bytes)
            
        except ImportError as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': f'背景移除依赖未安装: {str(e)}',
                'type': 'import_error'
            }, ensure_ascii=False).encode('utf-8'))
        except FileNotFoundError as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': f'背景移除模型文件缺失: {str(e)}',
                'type': 'model_error'
            }, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e),
                'type': 'background_removal_error'
            }, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        # 处理CORS预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
