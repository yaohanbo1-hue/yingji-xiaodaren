/**
 * Cloudflare Worker - DeepSeek API 代理
 * 免费套餐每天 10 万次请求，全球边缘节点
 * 
 * 部署说明：
 * 1. 在 Cloudflare Dashboard → Workers & Pages → 创建 Worker
 * 2. 粘贴本文件代码
 * 3. 在 Settings → Variables 添加环境变量 DEEPSEEK_API_KEY
 * 4. 部署后获得 https://你的子域名.workers.dev
 * 5. 在游戏控制台执行：
 *    localStorage.setItem('deepseek_proxy_url', 'https://你的子域名.workers.dev')
 */

export default {
  async fetch(request, env, ctx) {
    // CORS — 允许应急小达人前端访问
    const allowedOrigins = [
      'https://yaohanbo1-hue.github.io',
      'https://www.yingji-ai.top',
      'http://localhost:8000',
      'http://localhost:3000',
      'http://127.0.0.1:8000',
      'http://127.0.0.1:5500'
    ];
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://yaohanbo1-hue.github.io';

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: '只允许 POST 请求' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 解析请求
    let body;
    try { body = await request.json(); }
    catch (e) {
      return new Response(JSON.stringify({ error: '无效的 JSON 请求体' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, history = [], model = 'deepseek-chat' } = body;
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: '缺少 message 参数' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 模型名映射（兼容前端传入的别名 → DeepSeek 官方模型名）
    const modelMap = {
      'deepseek-v4-flash': 'deepseek-chat',
      'deepseek-v4-pro': 'deepseek-chat',
      'deepseek-chat': 'deepseek-chat',
      'deepseek-reasoner': 'deepseek-reasoner',
    };
    const resolvedModel = modelMap[model] || 'deepseek-chat';

    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: '未配置 DEEPSEEK_API_KEY，请在 Worker 设置中添加' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // ===== 调用 DeepSeek API =====
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: resolvedModel,
          messages: [
            {
              role: 'system',
              content: '你是一位专业的防灾减灾教育AI导师。你擅长地震、火灾、洪涝、台风、雷电、暴雪、泥石流、干旱、山火、火山、海啸、沙尘暴等自然灾害的预防和应急知识。回答要简洁实用、通俗易懂，适合普通民众和青少年理解。可以适当使用emoji增加亲和力。如果用户问的是非防灾问题，礼貌地引导回防灾话题。使用中文回答。'
            },
            ...(history || []).slice(-6),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const status = response.status;
        const errorMessages = {
          401: 'DeepSeek API Key 无效',
          402: 'API 余额不足',
          429: '请求太频繁，请稍后再试',
          500: 'DeepSeek 服务器内部错误'
        };
        return new Response(JSON.stringify({
          error: errorMessages[status] || err.error?.message || `API 错误 (${status})`
        }), {
          status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      if (!answer) {
        return new Response(JSON.stringify({ error: 'API 返回内容为空' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ answer }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: '代理错误: ' + e.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
