#!/usr/bin/env python3
"""
背景移除和背景色合成脚本
使用rembg进行抠图，PIL进行背景色合成
"""
import sys
import json
import base64
import os
import tempfile
from pathlib import Path

def check_dependencies():
    """检查必要的依赖是否已安装"""
    missing_deps = []
    
    try:
        import rembg
        print("✅ rembg available", file=sys.stderr)
    except ImportError:
        missing_deps.append("rembg")
        print("❌ rembg not found", file=sys.stderr)
    
    try:
        from PIL import Image
        print("✅ PIL (Pillow) available", file=sys.stderr)
    except ImportError:
        missing_deps.append("PIL (Pillow)")
        print("❌ PIL (Pillow) not found", file=sys.stderr)
    
    try:
        import numpy as np  # noqa: F401 - used by rembg internals sometimes
        print("✅ numpy available", file=sys.stderr)
    except ImportError:
        missing_deps.append("numpy")
        print("❌ numpy not found", file=sys.stderr)
    
    # 放宽模型文件检查：仅提示，不作为阻断条件
    model_path = os.path.join(os.path.expanduser("~"), ".u2net", "u2net.onnx")
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        if size_mb > 0:
            print(f"ℹ️ AI模型文件存在 (约 {size_mb:.1f}MB)", file=sys.stderr)
        else:
            print("⚠️ AI模型文件大小为0，可能不完整，但仍尝试运行", file=sys.stderr)
    else:
        print("⚠️ 未找到AI模型文件，将由rembg按默认逻辑尝试加载/下载", file=sys.stderr)
    
    return missing_deps

def save_base64_to_file(data_url: str, out_path: str):
    """将Base64图片数据保存到文件"""
    try:
        if data_url.startswith('data:'):
            base64_part = data_url.split(',', 1)[1]
        else:
            base64_part = data_url
        
        with open(out_path, 'wb') as f:
            f.write(base64.b64decode(base64_part))
        return True
    except Exception as e:
        print(f"Base64 decode failed: {e}", file=sys.stderr)
        return False

def hex_to_rgb(hex_color: str) -> tuple:
    """将十六进制颜色转换为RGB元组，支持#RGB/#RRGGBB"""
    c = hex_color.strip()
    if not c.startswith('#'):
        c = '#' + c
    c = c.lstrip('#')
    if len(c) == 3:
        c = ''.join([ch*2 for ch in c])
    return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))

def process_image(input_path: str, output_path: str, bg_color: str):
    """处理图片：移除背景并添加新背景色"""
    try:
        from rembg import remove
        from PIL import Image
        
        print(f"Processing image: {input_path}", file=sys.stderr)
        print(f"Background color: {bg_color}", file=sys.stderr)
        
        # 读取输入图片（以PIL Image形式传给rembg，确保得到RGBA）
        input_image = Image.open(input_path).convert('RGBA')
        print(f"Input image size: {input_image.size}", file=sys.stderr)
        
        # 使用rembg移除背景，输出应为RGBA（带alpha）
        print("Removing background with rembg...", file=sys.stderr)
        fg_image = remove(input_image)
        if not isinstance(fg_image, Image.Image):
            fg_image = Image.fromarray(fg_image)
        if fg_image.mode != 'RGBA':
            fg_image = fg_image.convert('RGBA')
        print(f"Foreground image mode: {fg_image.mode}", file=sys.stderr)
        
        # 创建新的背景图像
        bg_rgb = hex_to_rgb(bg_color)
        background = Image.new('RGBA', fg_image.size, bg_rgb + (255,))
        
        # 使用alpha通道进行合成
        print("Compositing image with new background...", file=sys.stderr)
        result = Image.alpha_composite(background, fg_image)
        
        # 最终保存为PNG（保留RGB，不需要透明）
        result_rgb = result.convert('RGB')
        result_rgb.save(output_path, 'PNG', quality=95)
        print(f"Result saved to: {output_path}", file=sys.stderr)
        
        return True
        
    except Exception as e:
        print(f"Image processing failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return False

def main():
    """主函数"""
    try:
        # 检查依赖（不阻断模型文件缺失/不完整）
        missing_deps = check_dependencies()
        if missing_deps:
            error_msg = f"Missing dependencies: {', '.join(missing_deps)}. Please install them with: pip install {' '.join(missing_deps)}"
            print(json.dumps({"success": False, "error": error_msg}))
            sys.exit(1)
        
        # 读取输入
        input_data = sys.stdin.read()
        payload = json.loads(input_data)
        
        image_b64 = payload.get('image')
        new_bg_color = payload.get('newBgColor', '#FFFFFF')
        
        if not image_b64:
            print(json.dumps({"success": False, "error": "No image data provided"}))
            sys.exit(1)
        
        if not new_bg_color:
            print(json.dumps({"success": False, "error": "No background color provided"}))
            sys.exit(1)
        
        # 创建临时文件
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_input:
            input_path = temp_input.name
        
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_output:
            output_path = temp_output.name
        
        try:
            # 保存Base64图片到临时文件
            if not save_base64_to_file(image_b64, input_path):
                print(json.dumps({"success": False, "error": "Failed to decode image data"}))
                sys.exit(1)
            
            # 处理图片
            if process_image(input_path, output_path, new_bg_color):
                print(json.dumps({
                    "success": True, 
                    "tempFilePath": output_path,
                    "message": "Background removal and color change completed successfully"
                }))
            else:
                print(json.dumps({"success": False, "error": "Image processing failed"}))
                sys.exit(1)
                
        finally:
            # 清理输入临时文件
            try:
                os.unlink(input_path)
            except:
                pass
        
    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON input: {e}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Unexpected error: {e}"}))
        sys.exit(1)

if __name__ == '__main__':
    main()
