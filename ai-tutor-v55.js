/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — AI 智能防灾导师 (比赛级重制版)
 * ===========================================================================
 * 
 * 【核心功能】
 * 1. 知识掌握度分析 - 12 维雷达图（带平滑动画）
 * 2. 智能诊断 - 薄弱项识别 + 学习建议生成
 * 3. 智能推荐 - 基于错误模式推荐题目
 * 4. 对话交互 - 带打字动画的指挥官终端
 * 5. 数据持久化 - localStorage 自动保存
 * 
 * @version 1.2.0
 * @date 2026-06-09
 * ===========================================================================
 */

// XSS防护：HTML转义辅助函数
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// AI 智能出题：请求 DeepSeek 返回结构化 JSON（题干 + 选项 + 正确答案 + 解析）
const AI_TUTOR_QUIZ_SYSTEM = `你是中国防灾教育游戏《应急小达人》的 AI 出题官，面向中小学生。请出一道防灾知识选择题，考查 12 种自然灾害（地震、洪水、台风、火灾、雷电、暴雪、滑坡、干旱、山火、火山、海啸、沙尘暴）之一的科学应对方法。你应当在 12 类灾害之间均衡轮换覆盖，不要反复只出"地震"类题目。

要求：
1. 题干简洁明确，符合中小学生认知水平。
2. 提供 4 个选项，其中只有 1 个正确。
3. answer 为正确选项索引，从 0 开始（0=A，1=B，2=C，3=D）。
4. explanation 用 1-2 句通俗语言说明正确答案的原因，并点出常见误区。
5. 题干要用具体、生活化的场景切入（如家里、学校、户外徒步、开车、海边、夜间、厨房等），避免千篇一律的"发生X时，正确做法是"句式；同一灾害也要从不同侧面（预防/避险/自救/互救）出题，不要与已有题目雷同。
6. 只输出 JSON，不要任何额外说明文字，不要使用 markdown 代码块标记。

输出格式（严格 JSON）：
{
  "question": "题干文字",
  "options": ["A. 选项一", "B. 选项二", "C. 选项三", "D. 选项四"],
  "answer": 0,
  "explanation": "解析文字"
}`;

const AI_TUTOR_QUIZ_USER = '请出一道新的防灾选择题，严格按系统要求的 JSON 格式返回，只返回 JSON。';

const AITutorEngine = {
  _data: null,
  _radarAnimProgress: 0,
  _radarAnimFrame: null,
  _typingTimer: null,
  _cloudEnabled: false,
  // AI 出题题材清单 + 去重记忆：让 LLM 自选题材，并带上"近期已出过"的记忆保证多样性
  _quizTypes: ['earthquake','flood','typhoon','fire','lightning','blizzard','landslide','drought','wildfire','volcano','tsunami','sandstorm'],
  _quizRecent: [],
  
  // ===== 初始化 =====
  init() {
    if (this._initialized) return;
    this._initialized = true;
    this._initDeepSeekToast();
    this.loadData();
    this.analyzeMastery();
    this.generateRecommendations();
    this.renderDashboard();
    // 滚动到页面顶部，确保 AI 导师内容可见
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => this.startConversation(), 300);
  },
  
  loadData() {
    let saved = null;
    try { saved = localStorage.getItem('aiTutorData'); } catch (e) { saved = null; }
    if (saved && saved !== 'null') {
      try {
        this._data = JSON.parse(saved);
      } catch (e) {
        this._data = null;
      }
    } else {
      this._data = null;
    }
    // 防御：localStorage 可能被写入字符串 "null"，JSON.parse 会得到 null
    if (!this._data || typeof this._data !== 'object') {
      this._data = this._getEmptyData();
    }

    if (!this._data.quizHistory) this._data.quizHistory = [];
    if (!this._data.mastery) this._data.mastery = {};
    if (!this._data.recommendations) this._data.recommendations = [];
  },
  
  _getEmptyData() {
    return {
      quizHistory: [],
      mastery: {},
      recommendations: [],
      lastAnalyzed: null,
      totalSessions: 0
    };
  },
  
  saveData() {
    try {
      localStorage.setItem('aiTutorData', JSON.stringify(this._data));
    } catch(e) {
      console.error('Storage error:', e);
    }
  },
  
  // ===== 记录答题 =====
  recordAnswer(cardId, correct, disaster) {
    if (!cardId || !disaster) return;
    // 防御：若 AI 导师页尚未打开过，_data 可能仍为 null，先自愈
    if (!this._data || typeof this._data !== 'object') {
      this._data = this._getEmptyData();
    }
    if (!this._data.quizHistory) this._data.quizHistory = [];

    this._data.quizHistory.push({
      cardId, correct,
      timestamp: Date.now(),
      disaster
    });
    
    if (this._data.quizHistory.length > 500) {
      this._data.quizHistory = this._data.quizHistory.slice(-500);
    }
    
    this.saveData();
    
    // 如果当前在 AI 导师页面，实时更新
    const page = document.getElementById('page-ai-tutor');
    if (page && page.classList.contains('active')) {
      this.analyzeMastery();
      this.generateRecommendations();
      this.renderDashboard();
    }
  },
  
  // ===== 掌握度分析 =====
  analyzeMastery() {
    const disasters = [
      'earthquake', 'flood', 'typhoon', 'fire', 'lightning', 'blizzard',
      'landslide', 'drought', 'wildfire', 'volcano', 'tsunami', 'sandstorm'
    ];
    
    const stats = {};
    disasters.forEach(d => { stats[d] = { total: 0, correct: 0 }; });
    
    this._data.quizHistory.forEach(h => {
      if (stats[h.disaster]) {
        stats[h.disaster].total++;
        if (h.correct) stats[h.disaster].correct++;
      }
    });
    
    this._data.mastery = {};
    disasters.forEach(d => {
      if (stats[d].total > 0) {
        this._data.mastery[d] = Math.round((stats[d].correct / stats[d].total) * 100);
      } else {
        this._data.mastery[d] = 0;
      }
    });
    
    this._data.lastAnalyzed = Date.now();
    this._data.totalSessions++;
    this.saveData();
  },
  
  // ===== 智能推荐 =====
  generateRecommendations() {
    const weakPoints = Object.entries(this._data.mastery)
      .filter(([d, score]) => score < 50 && score > 0)
      .sort((a, b) => a[1] - b[1])
      .map(([d]) => d);
    
    let targets = weakPoints.length > 0 ? weakPoints : 
      Object.keys(this._data.mastery).filter(d => this._data.mastery[d] === 0);
    
    if (targets.length === 0) {
      targets = Object.keys(this._data.mastery);
    }
    
    const recommendations = [];
    if (typeof ALL_CARDS !== 'undefined') {
      targets.forEach(disaster => {
        const cards = ALL_CARDS.filter(c => c.disaster === disaster && c.category === 'knowledge');
        const shuffled = [...cards].sort(() => 0.5 - Math.random());
        recommendations.push(...shuffled.slice(0, 5).map(c => c.id));
      });
    }
    
    this._data.recommendations = recommendations.slice(0, 30);
    this.saveData();
  },
  
  // ===== 渲染仪表盘 =====
  renderDashboard() {
    const container = document.getElementById('aiTutorContent');
    if (!container) return;
    
    const mastery = this._data.mastery;
    const totalAnswered = this._data.quizHistory.length;
    const correctCount = this._data.quizHistory.filter(h => h.correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    
    const weakPoints = Object.entries(mastery)
      .filter(([d, s]) => s < 50 && s > 0)
      .sort((a, b) => a[1] - b[1]);
    const mastered = Object.entries(mastery).filter(([d, s]) => s >= 80);
    const unlearned = Object.entries(mastery).filter(([d, s]) => s === 0);
    
    const meta = this._getDisasterMeta();
    
    container.innerHTML = `
      <!-- 头部卡片 -->
      <div class="ai-header-card">
        <div class="ai-header-top">
          <div class="ai-identity">
            <div class="ai-avatar">🤖</div>
            <div class="ai-title-group">
              <h3>AI 防灾导师</h3>
              <p>智能分析 · 个性推荐 · 持续进步</p>
            </div>
          </div>
          <div class="ai-badge">
            <span class="ai-badge-dot"></span>
            在线
          </div>
        </div>
        <div class="ai-stats-grid">
          <div class="stat-card">
            <div class="stat-value">${totalAnswered}</div>
            <div class="stat-label">已答题</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${accuracy}%</div>
            <div class="stat-label">正确率</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${mastered.length}</div>
            <div class="stat-label">已掌握</div>
          </div>
        </div>
      </div>
      
      <!-- 雷达图卡片 -->
      <div class="radar-card">
        <div class="radar-header">
          <h3>📊 知识掌握度</h3>
          <span class="radar-legend-toggle" onclick="AITutorEngine.toggleLegend()">图例</span>
        </div>
        <canvas id="radarCanvas" width="320" height="320"></canvas>
        <div class="radar-legend" id="radarLegend">
          ${Object.entries(meta.names).map(([key, name]) => `
            <div class="legend-item">
              <span class="legend-dot" style="background: ${this._getMasteryColor(mastery[key] || 0)}; color: ${this._getMasteryColor(mastery[key] || 0)}"></span>
              <span class="legend-label">${meta.icons[key]} ${name}</span>
              <span class="legend-value">${mastery[key] || 0}%</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- 诊断卡片 -->
      <div class="diagnosis-card">
        <div class="diagnosis-header">
          <h3>🔍 智能诊断</h3>
        </div>
        ${this._renderDiagnosis(weakPoints, unlearned, totalAnswered, meta)}
      </div>
      
      <!-- 对话终端卡片 -->
      <div class="terminal-card">
        <div class="terminal-header">
          <div class="terminal-title">
            <span class="terminal-title-icon">💬</span>
            AI 导师对话
          </div>
          <div class="terminal-actions">
            <div class="terminal-action-btn" onclick="AITutorEngine.showApiKeyDialog()" title="设置 DeepSeek API" id="llmToggleBtn">☁️</div>
            <div class="terminal-action-btn" onclick="AITutorEngine.showApiKeyDialog()" title="DeepSeek API 设置" id="apiKeyBtn">🔑</div>
            <div class="terminal-action-btn" onclick="AITutorEngine.clearChat()" title="清空对话">🗑</div>
          </div>
        </div>
        <div class="terminal-body" id="terminalBody"></div>
        <div class="terminal-suggestions">
          <button class="suggestion-btn" onclick="AITutorEngine.quickAsk('weakness')">⚠️ 薄弱项</button>
          <button class="suggestion-btn" onclick="AITutorEngine.quickAsk('recommend')">🎯 推荐练习</button>
          <button class="suggestion-btn" onclick="AITutorEngine.quickAsk('progress')">📊 学习进度</button>
          <button class="suggestion-btn" onclick="AITutorEngine.quickAsk('trivia')">🧠 冷知识</button>
          <button class="suggestion-btn" onclick="AITutorEngine.quickAsk('story')">📖 真实故事</button>
          <button class="suggestion-btn" onclick="AITutorEngine.quickAsk('practice')">❓ 给我出题</button>
        </div>
        <div class="terminal-input-area">
          <div class="terminal-input-wrapper">
            <input type="text" class="terminal-input" id="terminalInput" placeholder="问我任何防灾问题..." onkeypress="if(event.key==='Enter')AITutorEngine.handleInput()">
            <button class="terminal-send-btn" onclick="AITutorEngine.handleInput()">➤</button>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions-card">
        <button class="action-btn action-btn-primary" onclick="AITutorEngine.startAIQuiz()">
          <span class="action-btn-icon">🎯</span>
          <span class="action-btn-text">开始智能练习</span>
        </button>
        <button class="action-btn action-btn-secondary" onclick="AITutorEngine.exportReport()">
          <span class="action-btn-icon">📊</span>
          <span class="action-btn-text">导出学习报告</span>
        </button>
      </div>
    `;
    
    // 启动雷达图动画
    this._radarAnimProgress = 0;
    this._animateRadar();
  },
  
  _getDisasterMeta() {
    return {
      names: {
        earthquake: '地震', flood: '洪水', typhoon: '台风', fire: '火灾',
        lightning: '雷电', blizzard: '暴雪', landslide: '滑坡', drought: '干旱',
        wildfire: '山火', volcano: '火山', tsunami: '海啸', sandstorm: '沙尘暴'
      },
      icons: {
        earthquake: '🌍', flood: '🌊', typhoon: '🌀', fire: '🔥',
        lightning: '⚡', blizzard: '❄️', landslide: '⛰️', drought: '☀️',
        wildfire: '🔥', volcano: '🌋', tsunami: '🌊', sandstorm: '🌪️'
      }
    };
  },
  
  _getMasteryColor(score) {
    if (score === 0) return '#6B7280';
    if (score < 50) return '#EF4444';
    if (score < 80) return '#F59E0B';
    return '#10B981';
  },
  
  _renderDiagnosis(weakPoints, unlearned, totalAnswered, meta) {
    if (weakPoints.length > 0) {
      return `
        <div class="diagnosis-alert">
          <div class="diagnosis-summary">
            <div class="diagnosis-icon">⚠️</div>
            <div class="diagnosis-content">
              <h4>发现薄弱环节</h4>
              <p>以下知识模块掌握度不足 50%，建议优先练习：</p>
              <div class="weak-tags">
                ${weakPoints.map(([d, s]) => `
                  <span class="weak-tag" onclick="AITutorEngine.startPractice('${d}')">
                    <span class="weak-tag-icon">${meta.icons[d]}</span>
                    ${meta.names[d]}
                    <span class="weak-tag-pct">${s}%</span>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    if (totalAnswered === 0) {
      return `
        <div class="diagnosis-empty">
          <div class="diagnosis-empty-icon">📚</div>
          <div class="diagnosis-empty-text">
            还没有答题记录哦！<br>
            去<strong>开盲盒</strong>或<strong>挑战答题</strong>，我会帮你分析薄弱项 💪
          </div>
        </div>
      `;
    }
    
    return `
      <div class="diagnosis-good">
        <div class="diagnosis-good-icon">🎉</div>
        <div class="diagnosis-good-text">
          太棒了！所有已学模块掌握度都超过了 50%！<br>
          ${unlearned.length > 0 ? `还有 ${unlearned.length} 个模块未学习，去探索吧！` : '继续加油，冲击 80% 以上吧！'}
        </div>
      </div>
    `;
  },
  
  // ===== 雷达图动画 =====
  _animateRadar() {
    if (this._radarAnimFrame) cancelAnimationFrame(this._radarAnimFrame);
    
    const animate = () => {
      this._radarAnimProgress += 0.03;
      if (this._radarAnimProgress > 1) this._radarAnimProgress = 1;
      
      this._drawRadarChart(this._radarAnimProgress);
      
      if (this._radarAnimProgress < 1) {
        this._radarAnimFrame = requestAnimationFrame(animate);
      }
    };
    
    this._radarAnimFrame = requestAnimationFrame(animate);
  },
  
  _drawRadarChart(progress = 1) {
    const canvas = document.getElementById('radarCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = 120;
    
    const mastery = this._data.mastery;
    const disasters = Object.keys(this._getDisasterMeta().names);
    const n = disasters.length;
    
    ctx.clearRect(0, 0, W, H);
    
    // 绘制网格
    for (let i = 1; i <= 4; i++) {
      const r = (R / 4) * i;
      ctx.beginPath();
      for (let j = 0; j < n; j++) {
        const angle = (Math.PI * 2 / n) * j - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // 绘制轴线
    for (let j = 0; j < n; j++) {
      const angle = (Math.PI * 2 / n) * j - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // 绘制数据区域（带动画）
    ctx.beginPath();
    for (let j = 0; j < n; j++) {
      const angle = (Math.PI * 2 / n) * j - Math.PI / 2;
      const value = ((mastery[disasters[j]] || 0) / 100) * progress;
      const r = R * value;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    // 渐变填充
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    gradient.addColorStop(0, 'rgba(96, 165, 250, 0.25)');
    gradient.addColorStop(1, 'rgba(96, 165, 250, 0.03)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制数据点
    const meta = this._getDisasterMeta();
    for (let j = 0; j < n; j++) {
      const angle = (Math.PI * 2 / n) * j - Math.PI / 2;
      const value = ((mastery[disasters[j]] || 0) / 100) * progress;
      const r = R * value;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = this._getMasteryColor(mastery[disasters[j]] || 0);
      ctx.fill();
    }
    
    // 标签
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let j = 0; j < n; j++) {
      const angle = (Math.PI * 2 / n) * j - Math.PI / 2;
      const x = cx + (R + 22) * Math.cos(angle);
      const y = cy + (R + 22) * Math.sin(angle);
      ctx.fillText(meta.icons[disasters[j]], x, y - 7);
      ctx.fillText(`${mastery[disasters[j]] || 0}%`, x, y + 7);
    }
  },
  
  toggleLegend() {
    const legend = document.getElementById('radarLegend');
    if (legend) {
      legend.style.display = legend.style.display === 'none' ? 'grid' : 'none';
    }
  },
  
  // ===== 对话系统 =====
  startConversation() {
    if (this._askingLock) return;
    const engine = window.AITutorLLM;
    const configured = window.DeepSeekAPI && window.DeepSeekAPI.isConfigured();
    
    if (configured) {
      // 已配置 DeepSeek，发送欢迎语
      this._typeMessage('ai', '👋 你好！我是你的 AI 防灾导师。\n\n我已经接入 DeepSeek 大模型，可以回答任何防灾问题。\n\n你可以问我：\n• "地震来了怎么办？"\n• "洪水和台风有什么区别？"\n• "推荐我练习什么？"\n• 或者点击下方的快捷按钮');
    } else {
      // 未配置，提示用户设置
      this._typeMessage('ai', '👋 你好！我是你的 AI 防灾导师。\n\n⚠️ **尚未配置 DeepSeek API**\n\n请点击右上角 ☁️ 按钮设置 API Key，启用 AI 对话。\n\n💡 前往 [DeepSeek 开放平台](https://platform.deepseek.com) 注册，免费送 500 万 tokens。');
    }
  },
  
  _typeMessage(type, text, callback) {
    // 先取消正在进行的打字动画（即使 body 不存在也要清理）
    if (this._typingTimer) {
      clearTimeout(this._typingTimer);
      this._typingTimer = null;
    }
    
    const body = document.getElementById('terminalBody');
    if (!body) return;
    
    const msg = document.createElement('div');
    msg.className = `terminal-msg ${type === 'ai' ? 'ai-msg' : 'user-msg'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = type === 'ai' ? '🤖' : '👤';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    body.appendChild(msg);
    
    // XSS安全：先转义HTML，再渲染 markdown
    const safeText = escapeHtml(text);
    // 将 **bold** 转为 <strong>bold</strong>（在转义之后，安全）
    const renderMd = (t) => t.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    if (type === 'ai' && safeText.length > 30) {
      const speed = 18;
      let i = 0;
      let displayText = '';
      
      const typeChar = () => {
        if (i < safeText.length) {
          const char = safeText[i];
          displayText += char;
          i++;
          
          // 遇到标点或空格时暂停稍长，模拟自然阅读节奏
          let delay = speed;
          if (/[。！？\n]/.test(char)) delay = speed * 6;
          else if (/[，；：]/.test(char)) delay = speed * 3;
          else if (char === ' ') delay = speed * 1.5;
          
          bubble.innerHTML = renderMd(displayText);
          body.scrollTop = body.scrollHeight;
          
          if (i < safeText.length) {
            this._typingTimer = setTimeout(typeChar, delay);
          } else {
            this._typingTimer = null;
            if (callback) callback();
          }
        } else {
          this._typingTimer = null;
          if (callback) callback();
        }
      };
      typeChar();
    } else {
      bubble.innerHTML = renderMd(safeText);
      body.scrollTop = body.scrollHeight;
      if (callback) callback();
    }
  },
  
  showTyping() {
    const body = document.getElementById('terminalBody');
    if (!body) return;
    this.hideTyping(); // 先清理旧指示器
    
    const typing = document.createElement('div');
    typing.className = 'terminal-msg ai-msg';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">
        <div class="ai-typing">
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
        </div>
      </div>
    `;
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
  },
  
  hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  },
  
  handleInput() {
    if (this._askingLock) {
      console.warn('AI 请求锁已激活，跳过重复调用');
      return;
    }
    this._askingLock = true;
    
    const input = document.getElementById('terminalInput');
    const text = (input && input.value).trim();
    if (!text) { this._askingLock = false; return; }
    
    this._typeMessage('user', text);
    input.value = '';

    this.showTyping();

    const engine = window.AITutorLLM;
    if (engine && engine.generateReply) {
      engine.generateReply(text, this._chatHistory || []).then(result => {
        const reply = typeof result === 'string' ? result : (result.reply || '');
        this.hideTyping();
        this._renderAIReply(reply);
        
        if (!this._chatHistory) this._chatHistory = [];
        this._chatHistory.push({ role: 'user', content: text });
        this._chatHistory.push({ role: 'assistant', content: reply });
        if (this._chatHistory.length > 20) this._chatHistory = this._chatHistory.slice(-20);
        
        this._askingLock = false;
      }).catch(err => {
        this.hideTyping();
        if(location.hostname==='localhost')console.error('AI回复错误:', err);
        this._typeMessage('ai', '抱歉，AI 引擎出错了，请稍后再试。');
        this._askingLock = false;
      });
    } else {
      this.hideTyping();
      this._typeMessage('ai', 'AI 导师引擎正在加载中，请稍后再试。');
      this._askingLock = false;
    }
  },
  
  quickAsk(type) {
    if (this._askingLock) {
      console.warn('AI 请求锁已激活，跳过重复调用');
      return;
    }
    // 「给我出题」走结构化 AI 智能答题流程
    if (type === 'practice') {
      this.startAIQuiz();
      return;
    }
    this._askingLock = true;
    
    const questions = {
      weakness: '我的薄弱项是什么？',
      recommend: '推荐一些练习题',
      progress: '我的学习进度如何？',
      tips: '有什么防灾小贴士？',
      trivia: '讲个防灾冷知识',
      story: '讲个真实防灾故事',
      practice: '给我出道题'
    };
    
    const text = questions[type] || type;
    this._typeMessage('user', text);
    this.showTyping();
    
    const engine = window.AITutorLLM;
    if (engine && engine.generateReply) {
      engine.generateReply(text, this._chatHistory || []).then(result => {
        const reply = typeof result === 'string' ? result : (result.reply || '');
        this.hideTyping();
        this._typeMessage('ai', reply);
        if (!this._chatHistory) this._chatHistory = [];
        this._chatHistory.push({ role: 'user', content: text });
        this._chatHistory.push({ role: 'assistant', content: reply });
        if (this._chatHistory.length > 20) this._chatHistory = this._chatHistory.slice(-20);
        this._askingLock = false;
      }).catch(err => {
        this.hideTyping();
        if(location.hostname==='localhost')console.error('AI回复错误:', err);
        this._typeMessage('ai', '抱歉，AI引擎暂时出错了，请稍后再试。');
        this._askingLock = false;
      });
    } else {
      this.hideTyping();
      this._typeMessage('ai', 'AI 导师引擎正在加载中，请稍后再试。');
      this._askingLock = false;
    }
  },
  
  analyzeIntent(text) {
    const lower = text.toLowerCase();
    
    if (/薄弱|不好|差|弱|不会/.test(lower)) return this.getResponse('weakness');
    if (/推荐|练习|做什么|练什么|学什么/.test(lower)) return this.getResponse('recommend');
    if (/进度|多少|统计|怎么样|如何/.test(lower)) return this.getResponse('progress');
    if (/贴士|技巧|怎么|如何|注意/.test(lower)) return this.getResponse('tips');
    
    return '我可以帮助分析你的学习进度、薄弱项，并推荐针对性的练习。\n\n试试点击下方的快捷按钮，或直接告诉我你想了解什么！';
  },
  
  getResponse(type) {
    const meta = this._getDisasterMeta();
    const totalAnswered = this._data.quizHistory.length;
    const correctCount = this._data.quizHistory.filter(h => h.correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    
    switch (type) {
      case 'weakness': {
        const weakPoints = Object.entries(this._data.mastery)
          .filter(([d, s]) => s < 50 && s > 0)
          .sort((a, b) => a[1] - b[1]);
        
        if (weakPoints.length === 0) {
          return totalAnswered === 0 
            ? '还没有答题记录哦！先去答题，我才能帮你分析薄弱项 📚'
            : '太棒了！所有已学知识模块掌握度都超过了 50%！\n\n继续保持，冲击 80% 以上的优秀水平吧 💪';
        }
        
        return `根据分析，你的薄弱项有：\n\n${weakPoints.map(([d, s]) => `${meta.icons[d]} ${meta.names[d]}：${s}%`).join('\n')}\n\n建议从掌握度最低的模块开始练习，点击下方"推荐练习"开始吧！`;
      }
      
      case 'recommend': {
        const recs = this._data.recommendations;
        if (recs.length === 0) {
          return '目前还没有足够的答题记录来生成推荐。\n\n先去开盲盒或挑战答题吧，我会根据你的表现智能推荐练习题目！';
        }
        
        return `我为你智能推荐了 ${recs.length} 道练习题，优先针对你的薄弱环节。\n\n点击「开始智能练习」或「给我出题」按钮，AI 会针对你的薄弱项实时出题，答对答错都会讲解！`;
      }
      
      case 'progress': {
        const mastered = Object.values(this._data.mastery).filter(s => s >= 80).length;
        const learning = Object.values(this._data.mastery).filter(s => s > 0 && s < 80).length;
        const unlearned = Object.values(this._data.mastery).filter(s => s === 0).length;
        
        return `📊 学习进度报告：\n\n• 已答题数：${totalAnswered} 道\n• 正确率：${accuracy}%\n• 已掌握 (≥80%)：${mastered} 个模块\n• 学习中 (1-79%)：${learning} 个模块\n• 未学习：${unlearned} 个模块\n\n${totalAnswered === 0 ? '还没有答题记录，快去挑战吧！' : '继续保持，你的进步很棒！'}`;
      }
      
      case 'tips': {
        const tips = [
          '地震时记住"伏地、遮挡、手抓牢"三步法，这是国际通用的避险姿势！',
          '火灾逃生要弯腰低姿，用湿毛巾捂住口鼻，沿墙壁摸索前进。',
          '洪水来临时向高地转移，不要游泳过河，远离电线杆。',
          '台风天远离窗户和广告牌，躲在室内最安全的小房间。',
          '雷电时不要在树下避雨，远离金属物品，不要使用手机。',
          '山火逃生时逆风向跑，用湿毛巾捂住口鼻，避开浓烟区域。',
          '滑坡发生时向两侧山坡跑，不要顺着滑坡方向跑。',
          '海啸预警后迅速向高地转移，不要在海边观望！',
          '暴雪天减少外出，注意保暖，储备食物和饮用水。',
          '干旱时节约用水，关注官方供水信息。'
        ];
        
        return `💡 防灾小贴士：\n\n${tips[Math.floor(Math.random() * tips.length)]}\n\n想了解更多？去"学习模式"或"百科"查看详细知识！`;
      }
      
      default:
        return '我可以帮助分析你的学习进度、薄弱项，并推荐针对性的练习。试试点击下方的快捷按钮吧！';
    }
  },
  
  // 渲染 AI 回复：若返回的是结构化题库 JSON 则渲染为可交互答题卡
  _renderAIReply(reply) {
    const quiz = this._parseQuizJSON(reply);
    if (quiz) {
      this._currentQuiz = quiz;
      this.renderAIQuiz(quiz);
    } else {
      this._typeMessage('ai', reply);
    }
  },

  // ===== AI 结构化智能答题 =====
  startAIQuiz() {
    if (this._askingLock) {
      console.warn('AI 请求锁已激活，跳过重复调用');
      return;
    }
    this._askingLock = true;

    const api = window.DeepSeekAPI;
    if (!api || !api.isConfigured()) {
      this._typeMessage('ai', '⚠️ **AI 出题需要连接 AI 代理**\n\n本游戏通过 Cloudflare Worker 代理调用 DeepSeek（浏览器直连 API Key 会被 CORS 拦截，请勿直接填 Key）。\n\n请部署仓库 `worker/` 目录下的 Worker 并在 ☁️ 设置中填入代理地址，或由管理员在 `ai-tutor-llm-v55.js` 配置 `AI_TUTOR_DEFAULT_PROXY_URL`。详见 `worker/README.md`。');
      this._askingLock = false;
      return;
    }

    // 让 LLM 自选题材，但带上"近期已出过"的记忆，引导它自己产出多样化题目（而非前端硬排）
    const meta = this._getDisasterMeta();
    const allNames = this._quizTypes.map(k => meta.names[k]).join('、');
    const recent = (this._quizRecent || []).slice(-6).map(k => meta.names[k]).filter(Boolean);
    const recentStr = recent.length ? recent.join('、') : '（暂无）';
    this._typeMessage('user', '❓ 给我出一道 AI 防灾选择题');
    this.showTyping();

    const quizUserMsg = '请从这 12 类灾害【' + allNames + '】中，自选一道【尚未出过或最近没出过】的灾害来出题'
      + '（最近已出过：' + recentStr + '，请优先选完全不同的；若全都出过则选一个不同的）。'
      + '只返回严格 JSON（不要使用 markdown 代码块）。题干用具体生活场景切入（居家/学校/户外/驾车/夜间/海边/山区/厨房等），'
      + '严禁"发生X时，正确做法是"这类模板句式，同一灾害换不同侧面（预防/避险/自救/互救）设问。';
    api.chat(quizUserMsg, [], { system: AI_TUTOR_QUIZ_SYSTEM }).then(result => {
      this.hideTyping();
      if (result.error) {
        this._typeMessage('ai', '⚠️ **AI 出题失败**\n\n' + result.error + '\n\n你可以稍后再试，或检查 API Key 设置。');
        this._askingLock = false;
        return;
      }
      const quiz = this._parseQuizJSON(result.answer || '');
      if (!quiz) {
        // 退化处理：模型未返回规范 JSON，当作普通回答展示
        this._typeMessage('ai', '🤖 ' + (result.answer || '（AI 未返回内容）'));
        this._askingLock = false;
        return;
      }
      // 记录本题题材到去重记忆，引导 LLM 下次自选不同灾害
      const d = this._detectDisaster((quiz.question || '') + ' ' + (quiz.explanation || ''));
      this._quizRecent = this._quizRecent || [];
      this._quizRecent.push(d);
      if (this._quizRecent.length > 12) this._quizRecent = this._quizRecent.slice(-12);
      this._currentQuiz = quiz;
      this.renderAIQuiz(quiz);
      this._askingLock = false;
    }).catch(err => {
      this.hideTyping();
      if (location.hostname === 'localhost') console.error('AI出题错误:', err);
      this._typeMessage('ai', '抱歉，AI 出题出错了，请稍后再试。');
      this._askingLock = false;
    });
  },

  // 渲染可交互答题卡（选项按钮 + 结果/解析区）
  renderAIQuiz(quiz) {
    const body = document.getElementById('terminalBody');
    if (!body) { this._askingLock = false; return; }
    const q = escapeHtml(quiz.question || '');
    const correctIdx = (typeof quiz.answer === 'number') ? quiz.answer : 0;
    const opts = Array.isArray(quiz.options) ? quiz.options : [];
    const optHtml = opts.map((o, i) => {
      const label = String.fromCharCode(65 + i);
      const text = escapeHtml(String(o).replace(/^[A-Da-d][\.\、\)）．]\s*/, ''));
      return '<button class="ai-quiz-opt" data-idx="' + i + '" onclick="AITutorEngine.answerAIQuiz(' + i + ', ' + correctIdx + ', this)" style="display:block;width:100%;text-align:left;margin:8px 0;padding:12px 14px;border:1px solid rgba(0,212,255,.25);border-radius:12px;background:rgba(255,255,255,.04);color:#e6edf3;font-size:14px;cursor:pointer;transition:all .2s;font-family:inherit;box-sizing:border-box;">' + label + '. ' + text + '</button>';
    }).join('');

    const card = document.createElement('div');
    card.className = 'terminal-msg ai-msg';
    card.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble" style="width:100%;">
        <div class="ai-quiz-card" style="background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.25);border-radius:14px;padding:14px;margin-top:4px;">
          <div style="font-size:12px;color:#00d4ff;font-weight:700;letter-spacing:1px;margin-bottom:6px;">🧠 AI 智能出题</div>
          <div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:10px;line-height:1.5;">${q}</div>
          <div class="ai-quiz-opts">${optHtml}</div>
          <div class="ai-quiz-result" style="margin-top:10px;display:none;"></div>
          <div class="ai-quiz-actions" style="margin-top:10px;"></div>
        </div>
      </div>
    `;
    body.appendChild(card);
    body.scrollTop = body.scrollHeight;
  },

  // 用户作答：判定正误、高亮选项、展示解析，并计入掌握度
  answerAIQuiz(idx, correctIdx, btn) {
    const card = btn.closest('.ai-quiz-card');
    if (!card || card.dataset.answered === '1') return;
    card.dataset.answered = '1';

    const optsWrap = card.querySelector('.ai-quiz-opts');
    optsWrap.querySelectorAll('.ai-quiz-opt').forEach(b => {
      b.disabled = true;
      b.style.cursor = 'default';
      const bi = parseInt(b.getAttribute('data-idx'), 10);
      if (bi === correctIdx) {
        b.style.background = 'rgba(16,185,129,.25)';
        b.style.borderColor = '#10B981';
      } else if (bi === idx) {
        b.style.background = 'rgba(239,68,68,.22)';
        b.style.borderColor = '#EF4444';
      } else {
        b.style.opacity = '.6';
      }
    });

    const correct = idx === correctIdx;
    const result = card.querySelector('.ai-quiz-result');
    const quiz = this._currentQuiz || {};
    const exp = escapeHtml(quiz.explanation || '（AI 未提供解析）');
    result.style.display = 'block';
    result.innerHTML = `
      <div style="padding:10px 12px;border-radius:10px;font-size:14px;line-height:1.7;${correct ? 'background:rgba(16,185,129,.15);color:#6ee7b7;border:1px solid rgba(16,185,129,.4);' : 'background:rgba(239,68,68,.15);color:#fca5a5;border:1px solid rgba(239,68,68,.4);'}">
        <strong>${correct ? '✅ 回答正确！' : '❌ 回答错误'}</strong><br>
        <span style="color:#cbd5e1;">📖 解析：${exp}</span>
      </div>
    `;

    // 记录到掌握度分析（不触发整页重渲染，避免覆盖当前答题卡与解析）
    const disaster = this._detectDisaster((quiz.question || '') + ' ' + (quiz.explanation || ''));
    this.recordAIAnswer(correct, disaster);

    const actions = card.querySelector('.ai-quiz-actions');
    actions.innerHTML = '<button onclick="AITutorEngine.startAIQuiz()" style="margin-top:4px;padding:8px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#00d4ff,#7c4dff);color:#fff;font-weight:600;cursor:pointer;font-size:13px;">🔄 再来一题</button>';
  },

  // 记录 AI 答题结果（仅更新数据，不重渲染仪表盘，避免覆盖答题卡）
  recordAIAnswer(correct, disaster) {
    if (!disaster) disaster = 'earthquake';
    this._data.quizHistory.push({
      cardId: 'ai-quiz',
      correct: !!correct,
      timestamp: Date.now(),
      disaster: disaster
    });
    if (this._data.quizHistory.length > 500) {
      this._data.quizHistory = this._data.quizHistory.slice(-500);
    }
    this.analyzeMastery();
    this.saveData();
  },

  // 从模型文本中稳健解析选择题 JSON
  _parseQuizJSON(text) {
    if (!text) return null;
    let s = String(text).trim();
    s = s.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    const first = s.indexOf('{');
    const last = s.lastIndexOf('}');
    if (first !== -1 && last > first) s = s.substring(first, last + 1);

    const tryParse = (str) => {
      try {
        const obj = JSON.parse(str);
        if (obj && obj.question && Array.isArray(obj.options) && obj.options.length >= 2) {
          let ans = obj.answer;
          if (typeof ans === 'string') ans = parseInt(ans.replace(/[^0-9]/g, ''), 10);
          if (typeof ans !== 'number' || isNaN(ans) || ans < 0 || ans >= obj.options.length) ans = 0;
          return {
            question: String(obj.question),
            options: obj.options.map(String),
            answer: ans,
            explanation: obj.explanation ? String(obj.explanation) : '（AI 未提供解析）'
          };
        }
      } catch (e) {}
      return null;
    };

    let r = tryParse(s);
    if (r) return r;
    // 宽松修复：去掉尾随逗号后再试一次
    try { r = tryParse(s.replace(/,(\s*[}\]])/g, '$1')); } catch (e) {}
    return r;
  },

  // 从题目文字推断灾害类型（用于掌握度统计）
  _detectDisaster(text) {
    const meta = this._getDisasterMeta().names;
    for (const key in meta) { if (text.indexOf(meta[key]) !== -1) return key; }
    const map = {
      '地震': 'earthquake', '洪涝': 'flood', '洪水': 'flood', '台风': 'typhoon',
      '火灾': 'fire', '雷电': 'lightning', '暴雪': 'blizzard', '滑坡': 'landslide',
      '泥石流': 'landslide', '干旱': 'drought', '山火': 'wildfire', '火山': 'volcano',
      '海啸': 'tsunami', '沙尘暴': 'sandstorm', '沙尘': 'sandstorm'
    };
    for (const k in map) { if (text.indexOf(k) !== -1) return map[k]; }
    return 'earthquake';
  },

  // 初始化「正在调用 DeepSeek API」提示（监听 DeepSeekAPI 广播的事件）
  _initDeepSeekToast() {
    if (this._toastReady) return;
    this._toastReady = true;
    if (!document.getElementById('deepseekToastStyle')) {
      const st = document.createElement('style');
      st.id = 'deepseekToastStyle';
      st.textContent = '@keyframes deepseekPulse{0%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.25)}100%{opacity:.35;transform:scale(.8)}}';
      document.head.appendChild(st);
    }
    window.addEventListener('deepseek:call', (e) => {
      const d = (e && e.detail) || {};
      this._showDeepSeekToast(d.phase, d);
    });
  },

  // 显示/隐藏 DeepSeek 调用提示气泡
  _showDeepSeekToast(phase, detail) {
    let toast = document.getElementById('deepseekToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'deepseekToast';
      toast.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-14px);background:linear-gradient(135deg,rgba(0,212,255,.96),rgba(124,77,255,.96));color:#fff;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:600;z-index:10000;box-shadow:0 6px 24px rgba(0,212,255,.35);display:flex;align-items:center;gap:8px;pointer-events:none;opacity:0;transition:opacity .3s ease,transform .3s ease;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;max-width:90vw;';
      document.body.appendChild(toast);
    }
    if (phase === 'start') {
      toast.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block;animation:deepseekPulse 1s infinite;"></span> 正在调用 DeepSeek API（' + (detail.model || 'deepseek-chat') + '）…';
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
      clearTimeout(this._toastHideTimer);
    } else if (phase === 'end') {
      toast.innerHTML = detail.ok ? '✅ DeepSeek 已响应' : '⚠️ DeepSeek 调用失败';
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
      clearTimeout(this._toastHideTimer);
      this._toastHideTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-14px)';
      }, 1500);
    }
  },

  clearChat() {
    if (this._typingTimer) {
      clearTimeout(this._typingTimer);
      this._typingTimer = null;
    }
    const body = document.getElementById('terminalBody');
    if (body) body.innerHTML = '';
    this._chatHistory = [];
    this._askingLock = false;
    setTimeout(() => this.startConversation(), 200);
  },
  
  loadLLM() {
    // 直接打开设置对话框
    this.showApiKeyDialog();
  },
  
  // 显示 DeepSeek API 设置对话框
  showApiKeyDialog() {
    const existing = document.getElementById('apiKeyDialog');
    if (existing) existing.remove();
    
    const dialog = document.createElement('div');
    dialog.id = 'apiKeyDialog';
    dialog.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid rgba(0,212,255,0.3);border-radius:16px;padding:24px;z-index:9999;width:90%;max-width:420px;box-shadow:0 0 40px rgba(0,212,255,0.2);';
    
    const api = window.DeepSeekAPI;
    const currentKey = api ? api.getApiKey() : '';
    const currentProxy = api ? api.getProxyUrl() : '';
    const configured = (currentKey && currentKey.length > 10) || (currentProxy && currentProxy.length > 10);
    
    dialog.innerHTML = `
      <h3 style="margin:0 0 12px;color:#00d4ff;font-size:18px;">🤖 DeepSeek AI 设置</h3>
      <p style="color:#8899aa;font-size:12.5px;margin:0 0 14px;line-height:1.6;">
        ${configured ? '<span style="color:#00e676;">✅ 已配置，可使用 LLM 出题</span>' : '<span style="color:#F59E0B;">⚠️ 尚未配置，AI 导师暂不能出题</span>'}<br>
        推荐填<b>代理地址</b>：部署仓库 <code>worker/</code> 里的 Cloudflare Worker 后，把地址（如 <code>https://xxx.workers.dev</code>）填到下方即可免 Key 使用。<br>
        浏览器直连 DeepSeek Key 会被 CORS 拦截，一般不可用，故优先用代理。
      </p>

      <label style="display:block;color:#8899aa;font-size:12px;margin:0 0 6px;">代理地址（推荐）</label>
      <input type="text" id="newProxyInput" placeholder="https://你的-worker.workers.dev"
        style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:8px;color:#fff;font-size:14px;margin:0 0 14px;box-sizing:border-box;"
        value="${escapeHtml(currentProxy || '')}">

      <label style="display:block;color:#8899aa;font-size:12px;margin:0 0 6px;">DeepSeek API Key（直连，通常被 CORS 拦截）</label>
      <input type="password" id="newApiKeyInput" placeholder="sk-xxxxxxxxxxxx"
        style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:8px;color:#fff;font-size:14px;margin:0 0 12px;box-sizing:border-box;"
        value="${escapeHtml(currentKey || '')}">
      
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        ${configured ? '<button onclick="AITutorEngine.clearApiKey()" style="padding:8px 16px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);border-radius:8px;color:#EF4444;cursor:pointer;font-size:14px;">清除</button>' : ''}
        <button onclick="var d=document.getElementById(\'apiKeyDialog\');d&&d.remove()" 
          style="padding:8px 16px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;font-size:14px;">取消</button>
        <button onclick="AITutorEngine.saveApiKey()" 
          style="padding:8px 16px;background:linear-gradient(135deg,#00d4ff,#7c4dff);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">保存</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
  },
  
  saveApiKey() {
    const proxyInput = document.getElementById('newProxyInput');
    const keyInput = document.getElementById('newApiKeyInput');
    if (!proxyInput && !keyInput) return;

    const proxy = proxyInput ? proxyInput.value.trim() : '';
    const key = keyInput ? keyInput.value.trim() : '';

    if (!proxy && !key) {
      this.clearApiKey();
      return;
    }

    if (window.DeepSeekAPI) {
      // 代理地址是浏览器唯一可行的路径（直连 Key 会被 CORS 拦截）
      window.DeepSeekAPI.setProxyUrl(proxy);
      window.DeepSeekAPI.setApiKey(key);
      const ok = window.DeepSeekAPI.isConfigured();
      this._typeMessage('ai', ok
        ? '✅ **AI 已配置成功！**\n\n现在点击下方「开始智能练习」或「给我出题」，AI 会实时出防灾选择题并讲解对错。'
        : 'ℹ️ 已保存，但代理地址和 Key 都为空。请填入 Cloudflare Worker 代理地址（推荐）后再试。');
    }

    const dialog = document.getElementById('apiKeyDialog');
    if (dialog) dialog.remove();
  },

  clearApiKey() {
    if (window.DeepSeekAPI) {
      window.DeepSeekAPI.setApiKey('');
      window.DeepSeekAPI.setProxyUrl('');
    }
    const dialog = document.getElementById('apiKeyDialog');
    if (dialog) dialog.remove();
    this._typeMessage('ai', '已清除 AI 配置（代理地址与 Key 均已清空）。如需使用，请点击 ☁️ 重新填入代理地址。');
  },
  
  // ===== 练习功能 =====
  startPractice(disaster) {
    if (typeof StudyEngine !== 'undefined' && typeof ALL_CARDS !== 'undefined') {
      const cards = ALL_CARDS.filter(c => c.disaster === disaster && c.category === 'knowledge');
      if (cards.length > 0) {
        StudyEngine.customCards = cards;
        PageManager.navigate('study');
        StudyEngine.start();
      }
    }
  },
  
  startRecommendedPractice() {
    const recs = this._data.recommendations;
    if (recs.length === 0) {
      this._typeMessage('ai', '还没有足够的推荐题目。先去答题吧，我会根据你的表现智能推荐！');
      return;
    }
    
    const recommendedCards = (ALL_CARDS && ALL_CARDS.filter(c => recs.includes(c.id)));
    if ((recommendedCards && recommendedCards.length) > 0 && typeof StudyEngine !== 'undefined') {
      this._typeMessage('ai', `已为你准备 ${recommendedCards.length} 道针对性练习题！开始练习吧 💪`);
      StudyEngine.customCards = recommendedCards;
      PageManager.navigate('study');
      StudyEngine.start();
    }
  },
  
  // ===== 导出报告 =====
  exportReport() {
    const mastery = this._data.mastery;
    const meta = this._getDisasterMeta();
    const totalAnswered = this._data.quizHistory.length;
    const correctCount = this._data.quizHistory.filter(h => h.correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const mastered = Object.values(mastery).filter(s => s >= 80).length;
    const learning = Object.values(mastery).filter(s => s > 0 && s < 80).length;
    const unlearned = Object.values(mastery).filter(s => s === 0).length;
    const weakPoints = Object.entries(mastery).filter(([d, s]) => s < 50 && s > 0).sort((a, b) => a[1] - b[1]);
    
    const report = `# 应急小达人 - 学习报告\n## 生成时间：${new Date().toLocaleString('zh-CN')}\n\n### 📊 总体数据\n- 已答题数：${totalAnswered} 道\n- 正确数量：${correctCount} 道\n- 正确率：${accuracy}%\n- 已掌握 (≥80%)：${mastered} 个模块\n- 学习中 (1-79%)：${learning} 个模块\n- 未学习：${unlearned} 个模块\n\n### 🎯 各模块掌握度\n${Object.entries(mastery).map(([d, s]) => `- ${meta.names[d] || d}：${s}% ${s === 0 ? '(未学习)' : s < 50 ? '⚠️ 薄弱' : s < 80 ? '📈 学习中' : '✅ 已掌握'}`).join('\n')}\n\n### 💡 学习建议\n${weakPoints.length > 0 ? `薄弱项需要加强：${weakPoints.map(([d, s]) => `${meta.names[d]}(${s}%)`).join('、')}。建议通过"开盲盒"或"学习模式"针对性练习。` : '所有模块掌握良好，继续保持！挑战更高难度题目吧。'}`;
    
    if ((navigator.clipboard && navigator.clipboard.writeText)) {
      navigator.clipboard.writeText(report).then(() => {
        this._typeMessage('ai', '学习报告已复制到剪贴板！你可以粘贴到文本文件中保存 📋');
      }).catch(() => this._fallbackCopy(report));
    } else {
      this._fallbackCopy(report);
    }
  },
  
  _fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this._typeMessage('ai', '学习报告已复制到剪贴板！你可以粘贴到文本文件中保存 📋');
    } catch (e) {
      this._typeMessage('ai', '复制失败，请手动保存');
    }
    document.body.removeChild(textarea);
  }
};

// 页面激活时自动初始化
document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('page-ai-tutor');
  if (page) {
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class' && m.target.classList.contains('active')) {
          AITutorEngine.init();
        }
      });
    }).observe(page, { attributes: true, attributeFilter: ['class'] });
  }
});
