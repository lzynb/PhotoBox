import sys
import json
import base64
import os

try:
    from rapidocr_onnxruntime import RapidOCR
except Exception as e:
    print(json.dumps({"success": False, "error": f"Import RapidOCR failed: {str(e)}"}))
    sys.exit(1)


def read_stdin_json():
    try:
        data = sys.stdin.read()
        return json.loads(data)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)


def save_base64_to_file(data_url: str, out_path: str):
    try:
        if data_url.startswith('data:'):
            base64_part = data_url.split(',', 1)[1]
        else:
            base64_part = data_url
        with open(out_path, 'wb') as f:
            f.write(base64.b64decode(base64_part))
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Base64 decode failed: {str(e)}"}))
        sys.exit(1)


def main():
    payload = read_stdin_json()
    image_b64 = payload.get('image')
    filename = payload.get('filename', 'image.png')

    if not image_b64:
        print(json.dumps({"success": False, "error": "No image provided"}))
        sys.exit(1)

    temp_path = os.path.join(os.getcwd(), f"_rapidocr_{os.getpid()}_{filename}")
    try:
        save_base64_to_file(image_b64, temp_path)

        ocr = RapidOCR()
        
        # 初始化文本列表
        text_parts = []
        
        # 使用RapidOCR进行文本识别
        # 根据测试结果，RapidOCR返回的是检测结果
        # 我们需要使用不同的方法来获取文本
        try:
            # 方法1: 尝试使用ocr方法获取文本
            text_result = ocr.ocr(temp_path, cls=True)
            print(f"Debug: OCR text result: {text_result}", file=sys.stderr)
            
            if text_result and len(text_result) > 0:
                for line in text_result[0]:
                    if len(line) >= 2:
                        # line[1] 是识别的文本
                        text_content = str(line[1]).strip()
                        if text_content:
                            text_parts.append(text_content)
                            print(f"Debug: Found text via OCR: '{text_content}'", file=sys.stderr)
        except Exception as e:
            print(f"Debug: OCR method failed: {e}", file=sys.stderr)
            
            # 方法2: 如果OCR方法失败，尝试直接调用
            try:
                result, _ = ocr(temp_path)
                print(f"Debug: Direct call result: {result}", file=sys.stderr)
                
                if result:
                    for i, item in enumerate(result):
                        print(f"Debug: Item {i}: {item}", file=sys.stderr)
                        
                        # 尝试从结果中提取文本
                        if isinstance(item, (list, tuple)):
                            for sub_item in item:
                                if isinstance(sub_item, str) and sub_item.strip():
                                    # 这可能是文本内容
                                    text_content = sub_item.strip()
                                    if text_content and not text_content.startswith('['):
                                        text_parts.append(text_content)
                                        print(f"Debug: Found text via direct call: '{text_content}'", file=sys.stderr)
            except Exception as e2:
                print(f"Debug: Direct call also failed: {e2}", file=sys.stderr)
        
        # 用空格连接所有文本
        text = ' '.join(text_parts) if text_parts else ""

        print(json.dumps({"success": True, "text": text}))
    except Exception as e:
        print(json.dumps({"success": False, "error": f"RapidOCR failed: {str(e)}"}))
        sys.exit(1)
    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass


if __name__ == '__main__':
    main()
