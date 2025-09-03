#!/usr/bin/env python3
"""
简单的RapidOCR测试
"""
import sys
import os

try:
    from rapidocr_onnxruntime import RapidOCR
    print("✅ RapidOCR导入成功")
except ImportError as e:
    print(f"❌ RapidOCR导入失败: {e}")
    sys.exit(1)

# 创建一个简单的测试图片
def create_simple_image():
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # 创建一个300x150的白色图片
        img = Image.new('RGB', (300, 150), color='white')
        draw = ImageDraw.Draw(img)
        
        # 尝试使用系统字体
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            try:
                font = ImageFont.truetype("DejaVuSans.ttf", 24)
            except:
                font = ImageFont.load_default()
        
        # 在图片上绘制文字
        text = "Hello World 你好世界"
        draw.text((20, 60), text, fill='black', font=font)
        
        test_image_path = "simple_test.png"
        img.save(test_image_path)
        print(f"📸 测试图片已保存: {test_image_path}")
        return test_image_path
    except Exception as e:
        print(f"❌ 创建测试图片失败: {e}")
        return None

def test_rapidocr():
    test_image_path = create_simple_image()
    if not test_image_path:
        return
    
    try:
        # 初始化RapidOCR
        ocr = RapidOCR()
        print("🔧 RapidOCR初始化成功")
        
        # 方法1: 直接调用
        print("\n📋 方法1: 直接调用 ocr()")
        result1, elapse1 = ocr(test_image_path)
        print(f"⏱️ 处理时间: {elapse1}ms")
        print(f"📊 结果类型: {type(result1)}")
        print(f"📊 结果: {result1}")
        
        # 方法2: 使用ocr方法
        print("\n📋 方法2: 使用 ocr.ocr()")
        try:
            result2 = ocr.ocr(test_image_path, cls=True)
            print(f"📊 结果类型: {type(result2)}")
            print(f"📊 结果: {result2}")
        except Exception as e:
            print(f"❌ ocr.ocr() 失败: {e}")
        
        # 方法3: 使用detect方法
        print("\n📋 方法3: 使用 detect()")
        try:
            result3 = ocr.detect(test_image_path)
            print(f"📊 结果类型: {type(result3)}")
            print(f"📊 结果: {result3}")
        except Exception as e:
            print(f"❌ detect() 失败: {e}")
        
        # 方法4: 使用recognize方法
        print("\n📋 方法4: 使用 recognize()")
        try:
            result4 = ocr.recognize(test_image_path)
            print(f"📊 结果类型: {type(result4)}")
            print(f"📊 结果: {result4}")
        except Exception as e:
            print(f"❌ recognize() 失败: {e}")
        
    except Exception as e:
        print(f"❌ RapidOCR测试失败: {e}")
    finally:
        # 清理测试文件
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            print(f"🧹 已删除测试文件: {test_image_path}")

if __name__ == '__main__':
    test_rapidocr()
