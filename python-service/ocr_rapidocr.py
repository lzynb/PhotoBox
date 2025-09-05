#!/usr/bin/env python3
"""
RapidOCR 脚本 - 适配 FastAPI 服务调用
"""
import sys
import os
import json
import base64
import tempfile
from PIL import Image
import io

def check_dependencies():
    """检查必要的依赖是否已安装"""
    missing_deps = []
    
    try:
        from rapidocr_onnxruntime import RapidOCR
        print("✅ RapidOCR available", file=sys.stderr)
    except ImportError:
        missing_deps.append("rapidocr-onnxruntime")
    
    try:
        from PIL import Image
        print("✅ PIL (Pillow) available", file=sys.stderr)
    except ImportError:
        missing_deps.append("Pillow")
    
    return missing_deps

def process_image_with_rapidocr(image_bytes):
    """使用 RapidOCR 处理图片"""
    try:
        from rapidocr_onnxruntime import RapidOCR
        
        # 创建临时文件
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name
        
        try:
            # 初始化 RapidOCR
            ocr = RapidOCR()
            
            # 执行 OCR
            result, _ = ocr(temp_path)
            
            # 提取文本
            text_parts = []
            if result:
                for item in result:
                    if len(item) >= 2 and isinstance(item[1], str):
                        text_parts.append(item[1].strip())
            
            # 合并所有文本
            extracted_text = ' '.join(text_parts)
            
            return {
                "success": True,
                "text": extracted_text,
                "confidence": 0.8  # RapidOCR 不直接提供置信度，使用默认值
            }
            
        finally:
            # 清理临时文件
            try:
                os.unlink(temp_path)
            except:
                pass
                
    except Exception as e:
        print(f"RapidOCR processing error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "text": "",
            "error": str(e)
        }

def main():
    # Check dependencies
    missing_deps = check_dependencies()
    if missing_deps:
        result = {
            "success": False,
            "text": "",
            "error": f"Missing dependencies: {', '.join(missing_deps)}"
        }
        print(json.dumps(result))
        sys.exit(1)
    
    try:
        # 从 stdin 读取 base64 图片数据
        input_data = sys.stdin.read().strip()
        
        if not input_data:
            result = {
                "success": False,
                "text": "",
                "error": "No image data provided"
            }
            print(json.dumps(result))
            sys.exit(1)
        
        # 解码 base64
        try:
            if ',' in input_data:
                image_data = input_data.split(',')[1]
            else:
                image_data = input_data
            
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            result = {
                "success": False,
                "text": "",
                "error": f"Invalid base64 data: {str(e)}"
            }
            print(json.dumps(result))
            sys.exit(1)
        
        # 处理图片
        result = process_image_with_rapidocr(image_bytes)
        print(json.dumps(result))
        
    except Exception as e:
        result = {
            "success": False,
            "text": "",
            "error": f"Processing error: {str(e)}"
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main()
