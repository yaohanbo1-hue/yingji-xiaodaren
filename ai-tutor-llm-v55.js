/**
 * 阿里云百炼 API 前端直连（Qwen 3.7 Plus）
 * ⚠️ 警告：API Key 已嵌入前端代码，存在被盗刷风险
 * 已添加严格频率限制降低风险
 */

const BailianAPI = {
  _apiKey: 'sk-sp-D.ILXLI.CXh6.MEUCIQD2zLr+576WS2XcW/LaBOdnYuqU1/QxiOMm494r4aTO8AIgU3lJGTXuvyEdBT4DnM7eEdHeKuA8jIWzya1+dU7RA5s=',
  _baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  _model: 'qwen3.7plus',
  
  // ===== 安全控制：严格限制防止盗刷 =====
  _requestLock: false,       // 请求锁
  _callCount: 0,             // 本会话调用次数
  _maxCallsPerSession: 20,   // 单会话最大调用次数（正常聊天20条足够）
  _lastCallTime: 0,          // 上次调用时间
  _minInterval: 3000,       // 最小调用间隔 3 秒（防止连点）
  _callLog: [],              // 调用日志
  _sessionStart: Date.now(), // 会话开始时间
  
  isReady() {
    return this._apiKey && this._apiKey.length > 10;
  },
  
  getApiKey() {
    return this._apiKey;
  },
  
  setApiKey(key) {
    this._apiKey = key;
  },
  
  async chat(userMessage, history = []) {
    // 1. 检查请求锁
    if (this._requestLock) {
      console.warn('百炼 API: 请求锁已激活，跳过重复调用');
      return { error: '正在处理中，请稍候...' };
    }
    
    // 2. 检查调用次数限制
    if (this._callCount >= this._maxCallsPerSession) {
      console.warn('百炼 API: 单会话调用次数已达上限 ' + this._maxCallsPerSession);
      return { error: '本会话 AI 调用次数已达上限（20次），请刷新页面后再试。' };
    }
    
    // 3. 检查最小调用间隔（60秒）
    const now = Date.now();
    if (now - this._lastCallTime < this._minInterval) {
      const waitSeconds = Math.ceil((this._minInterval - (now - this._lastCallTime)) / 1000);
      console.warn('百炼 API: 调用太频繁，需等待 ' + waitSeconds + ' 秒');
      return { error: '请求太频繁，请 ' + waitSeconds + ' 秒后再试。' };
    }
    
    // 4. 检查是否重复发送相同问题
    const lastQuestion = this._callLog.length > 0 ? this._callLog[this._callLog.length - 1].question : null;
    if (lastQuestion === userMessage && now - this._lastCallTime < 30000) {
      console.warn('百炼 API: 重复问题，跳过');
      return { error: '正在处理相同的问题，请稍候...' };
    }
    
    // 5. 加锁
    this._requestLock = true;
    this._callCount++;
    this._lastCallTime = now;
    this._callLog.push({ question: userMessage, time: now, count: this._callCount });
    console.log('百炼 API 调用 #' + this._callCount + ' (本次会话共允许3次):', userMessage.substring(0, 30));

    if (!this.isReady()) {
      this._requestLock = false;
      return { error: 'API Key 未配置' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(this._baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._apiKey}`
        },
        body: JSON.stringify({
          model: this._model,
          messages: [
            {
              role: 'system',
              content: '你是一位专业的防灾减灾教育AI导师。你擅长地震、火灾、洪涝、台风、雷电、暴雪、泥石流、干旱、山火、火山、海啸、沙尘暴等自然灾害的预防和应急知识。回答要简洁实用、通俗易懂，适合普通民众和青少年理解。可以适当使用emoji增加亲和力。如果用户问的是非防灾问题，礼貌地引导回防灾话题。使用中文回答。'
            },
            ...history.slice(-6),
            { role: 'user', content: userMessage }
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
          this._requestLock = false;
          return { error: 'API Key 无效或已过期' };
        }
        if (response.status === 429) {
          this._requestLock = false;
          return { error: '请求太频繁，请稍后再试' };
        }
        this._requestLock = false;
        return { error: (error.error && error.error.message) || `API 错误 (${response.status})` };
      }

      const data = await response.json();
      const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      
      if (!answer) {
        this._requestLock = false;
        return { error: 'API 返回为空' };
      }

      this._requestLock = false;
      return { answer: answer };
    } catch (e) {
      this._requestLock = false;
      if (e.name === 'AbortError') {
        return { error: '请求超时，请检查网络连接' };
      }
      console.error('百炼 API error:', e);
      return { error: '网络错误，请检查网络连接' };
    }
  }
};

// 保持全局兼容
window.DeepSeekAPI = BailianAPI; // 兼容旧代码引用
window.BailianAPI = BailianAPI;
