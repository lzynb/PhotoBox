# Vercel Python API - OCR 端点（真实AI版本）
from http.server import BaseHTTPRequestHandler
import json
import base64
import os
import sys
import time

# 添加当前目录到 Python 路径
sys.path.append(os.path.dirname(__file__))

# 全局OCR对象（懒加载）
_rapidocr_reader = None

def load_rapidocr():
    """加载RapidOCR模型"""
    global _rapidocr_reader
    if _rapidocr_reader is not None:
        return _rapidocr_reader
    
    try:
        from rapidocr_onnxruntime import RapidOCR
        
        # 模型文件路径
        models_dir = os.path.dirname(__file__)
        det_path = os.path.join(models_dir, "ch_PP-OCRv3_det_infer.onnx")
        rec_path = os.path.join(models_dir, "ch_PP-OCRv3_rec_infer.onnx")
        cls_path = os.path.join(models_dir, "ch_ppocr_mobile_v2.0_cls_infer.onnx")
        
        # 检查模型文件是否存在
        for model_path in [det_path, rec_path, cls_path]:
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"模型文件不存在: {model_path}")
        
        # 初始化OCR引擎
        _rapidocr_reader = RapidOCR(
            det_path=det_path,
            rec_path=rec_path,
            cls_path=cls_path,
            rec_score_thres=0.25
        )
        return _rapidocr_reader
        
    except ImportError as e:
        raise ImportError(f"RapidOCR依赖未安装: {e}")
    except Exception as e:
        raise Exception(f"OCR模型加载失败: {e}")

class handler(BaseHTTPRequestHandler):
    """Vercel函数入口"""
    
    def do_POST(self):
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            body = json.loads(body_bytes.decode('utf-8'))
            
            image_data = body.get('image')
            filename = body.get('filename', 'unknown.jpg')
            
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
            
            # Base64解码
            if image_data.startswith('data:'):
                image_data = image_data.split(',', 1)[1]
            image_bytes = base64.b64decode(image_data)
            
            # 执行OCR识别
            start_time = time.time()
            reader = load_rapidocr()
            result, elapse = reader(image_bytes)
            
            # 处理识别结果
            lines = []
            confidence_sum = 0.0
            count = 0
            
            for item in result or []:
                text = item[0]
                conf = float(item[1]) if len(item) > 1 else 0.0
                lines.append(text)
                confidence_sum += conf
                count += 1
            
            avg_confidence = round(confidence_sum / count, 3) if count > 0 else 0.0
            processing_time = time.time() - start_time
            
            # 发送响应
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'text': '\n'.join(lines),
                'filename': filename,
                'confidence': avg_confidence,
                'num_lines': count,
                'processing_time': f"{processing_time:.3f}s",
                'note': '真实OCR识别结果'
            }, ensure_ascii=False).encode('utf-8'))
            
        except ImportError as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': f'OCR依赖未安装: {str(e)}',
                'type': 'import_error'
            }, ensure_ascii=False).encode('utf-8'))
        except FileNotFoundError as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': f'OCR模型文件缺失: {str(e)}',
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
                'type': 'ocr_error'
            }, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        # 处理CORS预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
