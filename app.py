from flask import Flask, request, jsonify
import os
import json
import urllib.request
import urllib.error

app = Flask(__name__)

@app.route('/', methods=['POST', 'OPTIONS'])
def chat():
    # 处理 CORS 预检
    if request.method == 'OPTIONS':
        response = app.make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response, 200
    
    # 获取请求数据 - 多种方式尝试
    body = None
    try:
        body = request.get_json(silent=True, force=True)
    except Exception as e:
        print('get_json error:', e)
    
    if not body:
        try:
            raw_data = request.get_data(as_text=True)
            print('raw_data:', raw_data[:200])
            if raw_data:
                body = json.loads(raw_data)
        except Exception as e:
            print('parse raw_data error:', e)
    
    if not body:
        try:
            raw_bytes = request.get_data()
            if raw_bytes:
                body = json.loads(raw_bytes.decode('utf-8'))
        except Exception as e:
            print('parse bytes error:', e)
    
    if not body:
        return jsonify({'error': '无效的 JSON 请求体'}), 400
    
    message = body.get('message', '')
    history = body.get('history', [])
    
    if not message or not isinstance(message, str):
        return jsonify({'error': '缺少 message 参数'}), 400
    
    # 获取 API Key
    api_key = os.environ.get('DEEPSEEK_API_KEY', '')
    if not api_key or len(api_key) < 10:
        return jsonify({'error': '服务器未配置 DEEPSEEK_API_KEY'}), 500
    
    try:
        payload = {
            'model': 'nex-agi/Nex-N2-Pro',
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
            'https://api.siliconflow.cn/v1/chat/completions',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            answer = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            if not answer:
                return jsonify({'error': 'API 返回为空'}), 500
            
            response = jsonify({'answer': answer})
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response
    
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
        return jsonify({'error': error_msg}), e.code
    
    except urllib.error.URLError as e:
        return jsonify({'error': f'连接 API 失败: {str(e.reason)}'}), 502
    
    except Exception as e:
        return jsonify({'error': f'代理服务器错误: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('FC_SERVER_PORT', 9000))
    app.run(host='0.0.0.0', port=port, threaded=True)
