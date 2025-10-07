# Vercel Python API - 健康检查端点
import json
from typing import Dict, Any
from utils import create_json_response

def handler(request):
    """健康检查函数"""
    return create_json_response(200, {
        'status': 'healthy',
        'message': 'PhotoBox API is running on Vercel',
        'platform': 'Vercel',
        'features': ['OCR', 'Background Removal', 'CORS Support'],
        'version': 'vercel-v1.0'
    })
