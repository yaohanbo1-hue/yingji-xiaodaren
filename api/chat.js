/**
 * DeepSeek API 代理 - Vercel Serverless Function
 * 解决浏览器 CORS 跨域限制问题
 */

export default async function handler(req, res) {
  // 设置 CORS 头，允许所有来源访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许 POST 请求' });
  }

  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '缺少 message 参数' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 DEEPSEEK_API_KEY' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的防灾减灾教育AI导师。你擅长地震、火灾、洪涝、台风、雷电、暴雪、泥石流、干旱、山火、火山、海啸、沙尘暴等自然灾害的预防和应急知识。回答要简洁实用、通俗易懂，适合普通民众和青少年理解。可以适当使用emoji增加亲和力。如果用户问的是非防灾问题，礼貌地引导回防灾话题。使用中文回答。'
          },
          ...history.slice(-6), // 保留最近6轮对话历史
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401) {
        return res.status(401).json({ error: 'API Key 无效，请检查 DEEPSEEK_API_KEY 是否正确' });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: '请求太频繁，请稍后再试' });
      }
      return res.status(response.status).json({
        error: error.error?.message || `DeepSeek API 错误 (${response.status})`
      });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({ error: 'DeepSeek API 返回为空' });
    }

    return res.status(200).json({ answer });

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: '请求超时，请检查网络连接' });
    }
    console.error('Proxy error:', error);
    return res.status(500).json({ error: '代理服务器错误: ' + error.message });
  }
}
