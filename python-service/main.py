# 腾讯云云函数入口文件 - 简化测试版本
import json

def handler(event, context):
    """
    腾讯云云函数入口 - 支持HTTP触发器
    """
    try:
        # 处理OPTIONS预检请求（CORS）
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400'
                },
                'body': ''
            }
        
        # 解析事件数据
        body = {}
        if 'body' in event and event['body']:
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
        
        # 获取请求方法和路径
        method = event.get('httpMethod', 'POST')
        path = event.get('path', '/')
        
        # 简单的健康检查
        if path == '/health' or path == '/':
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'status': 'healthy',
                    'message': 'PhotoBox API is running',
                    'path': path,
                    'method': method
                })
            }
        
        # 根据路径路由到不同的处理函数
        if path == '/ocr' or path.endswith('/ocr'):
            return handle_ocr(body)
        elif path == '/remove-background' or path.endswith('/remove-background'):
            return handle_remove_background(body)
        else:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': json.dumps({'error': 'Not Found', 'path': path})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }

def handle_ocr(body):
    """处理 OCR 请求 - 简化版本"""
    try:
        # 获取图片数据
        image_data = body.get('image')
        if not image_data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'error': 'No image data provided'})
            }
        
        # 简化处理：返回模拟结果
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'text': 'OCR功能测试成功 - 这是模拟的识别结果',
                'confidence': 0.95
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': str(e)})
        }

def handle_remove_background(body):
    """处理背景移除请求 - 简化版本"""
    try:
        # 获取图片数据和背景色
        image_data = body.get('image')
        background_color = body.get('backgroundColor', '#FFFFFF')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'error': 'No image data provided'})
            }
        
        # 简化处理：返回模拟结果
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': '背景移除功能测试成功',
                'backgroundColor': background_color
            })
        }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': str(e)})
        }