# Vercel Python API - 共享工具函数
import json
import base64
import io
from typing import Dict, Any, Union
from PIL import Image

def create_json_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """创建 JSON 响应"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
            'Access-Control-Max-Age': '86400'
        },
        'body': json.dumps(body, ensure_ascii=False)
    }

def create_image_response(png_bytes: bytes) -> Dict[str, Any]:
    """创建图片响应"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'image/png',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
            'Access-Control-Max-Age': '86400'
        },
        'body': base64.b64encode(png_bytes).decode('utf-8'),
        'isBase64Encoded': True
    }

def decode_image_to_pil(image_data: str) -> Image.Image:
    """解码 base64 图片数据为 PIL Image"""
    if image_data.startswith('data:'):
        image_data = image_data.split(',', 1)[1]
    raw = base64.b64decode(image_data)
    return Image.open(io.BytesIO(raw)).convert('RGBA')

def pil_to_png_bytes(img: Image.Image) -> bytes:
    """将 PIL Image 转换为 PNG bytes"""
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()
