#!/usr/bin/env python3
"""
背景移除脚本 - 适配 FastAPI 服务调用
"""
import sys
import os
import tempfile
import base64
from PIL import Image
import numpy as np

def check_dependencies():
    """检查必要的依赖是否已安装"""
    missing_deps = []
    
    try:
        import rembg
        print("✅ rembg available", file=sys.stderr)
    except ImportError:
        missing_deps.append("rembg")
    
    try:
        from PIL import Image
        print("✅ PIL (Pillow) available", file=sys.stderr)
    except ImportError:
        missing_deps.append("Pillow")
    
    try:
        import numpy
        print("✅ numpy available", file=sys.stderr)
    except ImportError:
        missing_deps.append("numpy")
    
    # 检查模型文件 (Model file check - now only a warning, not blocking)
    model_path = os.path.join(os.path.expanduser("~"), ".u2net", "u2net.onnx")
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        if size_mb < 170: # Expected size is around 176MB
            print(f"⚠️ AI模型文件可能不完整 ({size_mb:.1f}MB)", file=sys.stderr)
        else:
            print(f"✅ AI模型文件可用 ({size_mb:.1f}MB)", file=sys.stderr)
    else:
        print("❌ AI模型文件未找到", file=sys.stderr)
        # Removed adding to missing_deps, so it won't block execution

    return missing_deps

def hex_to_rgb(hex_color: str) -> tuple:
    """将十六进制颜色转换为RGB元组，支持#RGB和#RRGGBB"""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def process_image(input_path: str, output_path: str, bg_color: str):
    """处理图片：移除背景并添加新背景色"""
    try:
        from rembg import remove
        
        # Read input image
        input_image = Image.open(input_path).convert("RGBA")
        print(f"Input image size: {input_image.size}", file=sys.stderr)

        # Remove background with rembg
        print("Removing background with rembg...", file=sys.stderr)
        transparent_image = remove(input_image)
        print(f"Transparent image size: {transparent_image.size}", file=sys.stderr)

        # Create new background image
        bg_rgb = hex_to_rgb(bg_color)
        background = Image.new('RGBA', transparent_image.size, bg_rgb + (255,))

        # Composite images
        print("Compositing image with new background...", file=sys.stderr)
        if transparent_image.mode != 'RGBA':
            transparent_image = transparent_image.convert('RGBA')

        result = Image.alpha_composite(background, transparent_image)

        # Save result
        result.save(output_path, 'PNG', quality=95)
        print(f"Result saved to: {output_path}", file=sys.stderr)

        return True

    except Exception as e:
        print(f"Error processing image: {str(e)}", file=sys.stderr)
        return False

def main():
    if len(sys.argv) != 4:
        print("Usage: python remove_background.py <input_path> <output_path> <bg_color>", file=sys.stderr)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    bg_color = sys.argv[3]
    
    # Check dependencies
    missing_deps = check_dependencies()
    if missing_deps:
        print(f"Missing dependencies: {', '.join(missing_deps)}", file=sys.stderr)
        sys.exit(1)
    
    # Process image
    success = process_image(input_path, output_path, bg_color)
    if not success:
        sys.exit(1)
    
    print("Background removal completed successfully", file=sys.stderr)

if __name__ == "__main__":
    main()
