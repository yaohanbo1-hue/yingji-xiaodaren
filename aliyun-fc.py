# coding: utf-8
"""
阿里云函数计算 FC 3.0 - DeepSeek API 代理
国内直接访问，无需翻墙，每月有免费额度
"""
import json
import os
import urllib.request
import urllib.error
import urllib.parse

def handler(environ, start_response):
    """WSGI handler for 阿里云 FC HTTP 函数"""
    
    # 设置 CORS 头
    cors_headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'POST, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type'),
    ]
    
    # 处理预检请求 (OPTIONS)
    if environ.get('REQUEST_METHOD') == 'OPTIONS':
        start_response('200 OK', cors_headers)
        return [b'']
    
    # 只允许 POST
    if environ.get('REQUEST_METHOD') != 'POST':
        start_response('405 Method Not Allowed', [('Content-Type', 'application/json')])
        return [json.dumps({'error': '只允许 POST 请求'}, ensure_ascii=False).encode('utf-8')]
    
    # 读取请求体
    try:
        content_length = int(environ.get('CONTENT_LENGTH', 0))
    except ValueError:
        content_length = 0
    
    request_body = b''
    if content_length > 0:
        request_body = environ['wsgi.input'].read(content_length)
    
    try:
        body = json.loads(request_body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        start_response('400 Bad Request', [('Content-Type', 'application/json')])
        return [json.dumps({'error': '无效的 JSON 请求体'}, ensure_ascii=False).encode('utf-8')]
    
    message = body.get('message', '')
    history = body.get('history', [])
    
    if not message or not isinstance(message, str):
        start_response('400 Bad Request', [('Content-Type', 'application/json')])
        return [json.dumps({'error': '缺少 message 参数'}, ensure_ascii=False).encode('utf-8')]
    
    # 从环境变量获取 API Key
    api_key = os.environ.get('DEEPSEEK_API_KEY', '')
    if not api_key or len(api_key) < 10:
        start_response('500 Internal Server Error', [('Content-Type', 'application/json')])
        return [json.dumps({'error': '服务器未配置 DEEPSEEK_API_KEY'}, ensure_ascii=False).encode('utf-8')]
    
    # 构建 DeepSeek 请求
    try:
        payload = {
            'model': 'deepseek-v4-flash',
            'messages': [
                {
                    'role': 'system',
                    'content': '你是一位专业的防灾减灾教育AI导师。你擅长地震、火灾、洪涝、台风、雷电、暴雪、泥石流、干旱、山火、火山、海啸、沙尘暴等自然灾害的预防和应急知识。回答要简洁实用、通俗易懂，适合普通民众和青少年理解。可以适当使用emoji增加亲和力。如果用户问的是非防灾问题，礼貌地引导回防灾话题。使用中文回答。'
                },
                *history[-6:],
                {'role': 'user', 'content': message}
            ],
            'temperature': 0.7,
            'max_tokens': 800,
            'stream': False
        }
        
        req = urllib.request.Request(
            'https://api.deepseek.com/v1/chat/completions',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            method='POST'
        )
        
        # 20 秒超时
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            answer = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            if not answer:
                start_response('500 Internal Server Error', [('Content-Type', 'application/json')])
                return [json.dumps({'error': 'DeepSeek API 返回为空'}, ensure_ascii=False).encode('utf-8')]
            
            start_response('200 OK', cors_headers)
            return [json.dumps({'answer': answer}, ensure_ascii=False).encode('utf-8')]
    
    except urllib.error.HTTPError as e:
        error_msg = f'API 错误 ({e.code})'
        try:
            error_data = json.loads(e.read().decode('utf-8'))
            error_msg = error_data.get('error', {}).get('message', error_msg)
        except:
            pass
        if e.code == 401:
            error_msg = 'API Key 无效'
        elif e.code == 429:
            error_msg = '请求太频繁，请稍后再试'
        
        start_response(f'{e.code} Error', [('Content-Type', 'application/json')])
        return [json.dumps({'error': error_msg}, ensure_ascii=False).encode('utf-8')]
    
    except urllib.error.URLError as e:
        start_response('502 Bad Gateway', [('Content-Type', 'application/json')])
        return [json.dumps({'error': f'连接 DeepSeek API 失败: {str(e.reason)}'}, ensure_ascii=False).encode('utf-8')]
    
    except Exception as e:
        start_response('500 Internal Server Error', [('Content-Type', 'application/json')])
        return [json.dumps({'error': f'代理服务器错误: {str(e)}'}, ensure_ascii=False).encode('utf-8')]
