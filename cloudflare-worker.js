/**
 * Cloudflare Worker - 硅基流动 API 代理
 * 免费、全球边缘节点、无需 GitHub 登录
 */

export default {
  async fetch(request, env, ctx) {
    // 设置 CORS 头，只允许应急小达人游戏前端访问
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://yaohanbo1-hue.github.io',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // 只允许 POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: '只允许 POST 请求' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 解析请求体
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: '无效的 JSON 请求体' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: '缺少 message 参数' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 从环境变量获取 API Key
    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: '服务器未配置 DEEPSEEK_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // 调用硅基流动 API
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'nex-agi/Nex-N2-Pro',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的防灾减灾教育AI导师。你擅长地震、火灾、洪涝、台风、雷电、暴雪、泥石流、干旱、山火、火山、海啸、沙尘暴等自然灾害的预防和应急知识。回答要简洁实用、通俗易懂，适合普通民众和青少年理解。可以适当使用emoji增加亲和力。如果用户问的是非防灾问题，礼貌地引导回防灾话题。使用中文回答。'
            },
            ...history.slice(-6),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 800,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const status = response.status;
        let errorMsg = error.error?.message || `API 错误 (${status})`;
        if (status === 401) errorMsg = 'API Key 无效';
        if (status === 429) errorMsg = '请求太频繁，请稍后再试';

        return new Response(JSON.stringify({ error: errorMsg }), {
          status: status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;

      if (!answer) {
        return new Response(JSON.stringify({ error: 'API 返回为空' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ answer }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      console.error('Worker error:', e);
      return new Response(JSON.stringify({ error: '代理服务器错误: ' + e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
