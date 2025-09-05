from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
import base64
import io
import sys
import os
import tempfile
import subprocess
import json
from PIL import Image
import numpy as np

app = FastAPI(title="PhotoBox Python Service", version="1.0.0")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "PhotoBox Python Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "python-backend"}

@app.post("/remove-background")
async def remove_background(
    image_data: str = None,
    new_bg_color: str = "#FFFFFF"
):
    """
    移除背景并添加新背景色
    """
    try:
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # 解码 base64 图片数据
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")
        
        # 创建临时文件
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as input_file:
            input_file.write(image_bytes)
            input_path = input_file.name
        
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as output_file:
            output_path = output_file.name
        
        try:
            # 调用 Python 脚本处理图片
            result = subprocess.run([
                sys.executable, 
                os.path.join(os.path.dirname(__file__), 'remove_background.py'),
                input_path, output_path, new_bg_color
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Python script failed: {result.stderr}"
                )
            
            # 读取处理后的图片
            with open(output_path, 'rb') as f:
                processed_image = f.read()
            
            return Response(
                content=processed_image,
                media_type="image/png",
                headers={"Content-Disposition": "attachment; filename=processed.png"}
            )
            
        finally:
            # 清理临时文件
            try:
                os.unlink(input_path)
                os.unlink(output_path)
            except:
                pass
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/ocr")
async def ocr_processing(image_data: str = None):
    """
    图片文字识别
    """
    try:
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # 解码 base64 图片数据
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")
        
        # 创建临时文件
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as input_file:
            input_file.write(image_bytes)
            input_path = input_file.name
        
        try:
            # 调用 OCR 脚本
            result = subprocess.run([
                sys.executable, 
                os.path.join(os.path.dirname(__file__), 'ocr_rapidocr.py')
            ], input=image_bytes, capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                raise HTTPException(
                    status_code=500, 
                    detail=f"OCR script failed: {result.stderr}"
                )
            
            # 解析结果
            try:
                ocr_result = json.loads(result.stdout.strip())
                return ocr_result
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "text": "",
                    "error": "Failed to parse OCR result"
                }
                
        finally:
            # 清理临时文件
            try:
                os.unlink(input_path)
            except:
                pass
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
