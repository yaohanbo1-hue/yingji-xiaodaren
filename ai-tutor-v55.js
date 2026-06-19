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

const AITutorEngine = {
  _data: null,
  _radarAnimProgress: 0,
  _radarAnimFrame: null,
  
  // ===== 初始化 =====
  init() {
    if (this._initialized) return;
    this._initialized = true;
    this.loadData();
    this.analyzeMastery();
    this.generateRecommendations();
    this.renderDashboard();
    setTimeout(() => this.startConversation(), 300);
  },
  
  loadData() {
    const saved = localStorage.getItem('aiTutorData');
    if (saved) {
      try {
        this._data = JSON.parse(saved);
      } catch (e) {
        this._data = this._getEmptyData();
      }
    } else {
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
            <div class="terminal-action-btn" onclick="AITutorEngine.loadLLM()" title="启用AI模型" id="llmToggleBtn">🧠</div>
            <div class="terminal-action-btn" onclick="AITutorEngine.showApiKeyDialog()" title="设置DeepSeek API Key" id="apiKeyBtn">🔑</div>
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
        <button class="action-btn action-btn-primary" onclick="AITutorEngine.startRecommendedPractice()">
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
    const engine = window.AITutorBrain || window.AITutorLLM;
    if (engine && engine.generateReply) {
      engine.generateReply('你好').then(greeting => {
        this._typeMessage('ai', greeting);
      }).catch(() => {
        this._typeMessage('ai', '👋 你好！我是你的 AI 防灾导师！\n\n我已经学习了 369 道防灾题目和 34 个真实灾害场景，随时为你解答。');
      });
    } else {
      this._typeMessage('ai', '👋 你好！我是你的 AI 防灾导师！\n\n我已经学习了 369 道防灾题目和 34 个真实灾害场景，随时为你解答。\n\n你可以直接问我：\n• "地震来了怎么办？"\n• "推荐我练习什么？"\n• "讲个防灾故事"\n• 或者点击下方的快捷按钮');
    }
  },
  
  _typeMessage(type, text, callback) {
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
    
    if (type === 'ai' && text.length > 30) {
      // 智能打字动画：按词打字，自动解析 HTML 标签
      let plainText = text.replace(/<[^>]+>/g, ''); // 临时计算长度
      const speed = 18;
      let i = 0;
      let inTag = false;
      let displayText = '';
      
      const typeChar = () => {
        if (i < text.length) {
          const char = text[i];
          if (char === '<') inTag = true;
          if (inTag) {
            displayText += char;
            if (char === '>') inTag = false;
          } else {
            displayText += char;
          }
          i++;
          
          // 遇到标点或空格时暂停稍长，模拟自然阅读节奏
          let delay = speed;
          if (!inTag && /[。！？\n]/.test(char)) delay = speed * 6;
          else if (!inTag && /[，；：]/.test(char)) delay = speed * 3;
          else if (!inTag && char === ' ') delay = speed * 1.5;
          
          bubble.innerHTML = displayText.replace(/\n/g, '<br>');
          body.scrollTop = body.scrollHeight;
          
          if (i < text.length) {
            setTimeout(typeChar, delay);
          } else {
            if (callback) callback();
          }
        } else {
          if (callback) callback();
        }
      };
      typeChar();
    } else {
      bubble.innerHTML = text.replace(/\n/g, '<br>');
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
    const text = input?.value.trim();
    if (!text) { this._askingLock = false; return; }
    
    this._typeMessage('user', text);
    input.value = '';
    
    this.showTyping();
    
    const engine = window.AITutorBrain || window.AITutorLLM;
    if (engine && engine.generateReply) {
      engine.generateReply(text, this._chatHistory || []).then(response => {
        this.hideTyping();
        this._typeMessage('ai', response);
        if (!this._chatHistory) this._chatHistory = [];
        this._chatHistory.push({ role: 'user', content: text });
        this._chatHistory.push({ role: 'assistant', content: response });
        if (this._chatHistory.length > 20) this._chatHistory = this._chatHistory.slice(-20);
        this._askingLock = false;
      }).catch(err => {
        this.hideTyping();
        console.error('AI回复错误:', err);
        this._typeMessage('ai', '抱歉，AI引擎暂时出错了，请稍后再试。');
        this._askingLock = false;
      });
    } else {
      this.hideTyping();
      this._typeMessage('ai', 'AI 引擎正在初始化，请稍后再试...');
      this._askingLock = false;
    }
  },
  
  quickAsk(type) {
    if (this._askingLock) {
      console.warn('AI 请求锁已激活，跳过重复调用');
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
    
    const engine = window.AITutorBrain || window.AITutorLLM;
    if (engine && engine.generateReply) {
      engine.generateReply(text, this._chatHistory || []).then(response => {
        this.hideTyping();
        this._typeMessage('ai', response);
        if (!this._chatHistory) this._chatHistory = [];
        this._chatHistory.push({ role: 'user', content: text });
        this._chatHistory.push({ role: 'assistant', content: response });
        if (this._chatHistory.length > 20) this._chatHistory = this._chatHistory.slice(-20);
        this._askingLock = false;
      }).catch(err => {
        this.hideTyping();
        console.error('AI回复错误:', err);
        this._typeMessage('ai', '抱歉，AI引擎暂时出错了，请稍后再试。');
        this._askingLock = false;
      });
    } else {
      this.hideTyping();
      this._typeMessage('ai', 'AI 引擎正在初始化，请稍后再试...');
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
        
        return `我为你智能推荐了 ${recs.length} 道练习题，优先针对你的薄弱环节。\n\n点击"开始智能推荐练习"按钮，直接进入针对性训练模式！`;
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
  
  clearChat() {
    const body = document.getElementById('terminalBody');
    if (body) body.innerHTML = '';
    this._chatHistory = [];
    setTimeout(() => this.startConversation(), 200);
  },
  
  loadLLM() {
    const btn = document.getElementById('llmToggleBtn');
    if (!btn) return;
    const isActive = btn.classList.contains('llm-active');
    if (!isActive) {
      // 检查 DeepSeek 是否可用
      if (!window.DeepSeekAPI || !window.DeepSeekAPI.isReady()) {
        this._typeMessage('ai', '⚠️ **DeepSeek AI 引擎未配置**\n\n点击右上角的 🔑 按钮设置 API Key，即可启用智能问答！\n\n如果没有 Key，可以前往 [DeepSeek 官网](https://platform.deepseek.com) 免费获取。');
        return;
      }
      btn.classList.add('llm-active');
      btn.innerHTML = '✨';
      btn.title = 'DeepSeek AI 已激活';
      this._typeMessage('ai', '✨ **DeepSeek AI 智能引擎已激活！**\n\n我现在可以调用云端大模型，为你提供更精准、更深入的防灾知识解答。\n\n有什么想问的？');
    } else {
      btn.classList.remove('llm-active');
      btn.innerHTML = '🧠';
      btn.title = '启用 DeepSeek AI';
      this._typeMessage('ai', '🧠 已切换回本地规则引擎。');
    }
  },
  
  // 显示 API Key 设置对话框
  showApiKeyDialog() {
    const existing = document.getElementById('apiKeyDialog');
    if (existing) existing.remove();
    
    const dialog = document.createElement('div');
    dialog.id = 'apiKeyDialog';
    dialog.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid rgba(0,212,255,0.3);border-radius:16px;padding:24px;z-index:9999;width:90%;max-width:400px;box-shadow:0 0 40px rgba(0,212,255,0.2);';
    
    const currentKey = window.DeepSeekAPI ? window.DeepSeekAPI.getApiKey() : '';
    const maskedKey = currentKey ? currentKey.slice(0, 8) + '****' + currentKey.slice(-4) : '未设置';
    const isDefault = currentKey === 'sk-wrnjpxffpqlpsweqdnhczhrjpbgfsyjihevpusqioxndlkcg';
    
    dialog.innerHTML = `
      <h3 style="margin:0 0 16px;color:#00d4ff;font-size:18px;">🔑 DeepSeek API 设置</h3>
      <p style="color:#8899aa;font-size:14px;margin:0 0 12px;line-height:1.5;">
        当前状态：${isDefault ? '<span style="color:#00e676;">✅ 内置 Key 可用</span>' : (currentKey ? '<span style="color:#00e676;">✅ 已设置</span>' : '<span style="color:#FF4D00;">⚠️ 未设置</span>')}
      </p>
      <p style="color:#8899aa;font-size:12px;margin:0 0 12px;">
        当前 Key：${maskedKey}
      </p>
      <input type="text" id="newApiKeyInput" placeholder="输入新的 API Key（可选）" 
        style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:8px;color:#fff;font-size:14px;margin-bottom:12px;box-sizing:border-box;"
        value="${isDefault ? '' : currentKey}">
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button onclick="document.getElementById('apiKeyDialog').remove()" 
          style="padding:8px 16px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;font-size:14px;">取消</button>
        <button onclick="AITutorEngine.saveApiKey()" 
          style="padding:8px 16px;background:linear-gradient(135deg,#00d4ff,#7c4dff);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">保存</button>
      </div>
      <p style="color:#8899aa;font-size:11px;margin:12px 0 0;line-height:1.5;">
        💡 提示：内置 Key 为共享额度，用完可前往 <a href="https://platform.deepseek.com" target="_blank" style="color:#00d4ff;">DeepSeek 官网</a> 免费获取个人 Key。
      </p>
    `;
    
    document.body.appendChild(dialog);
  },
  
  saveApiKey() {
    const input = document.getElementById('newApiKeyInput');
    if (!input) return;
    
    const key = input.value.trim();
    if (!key) {
      document.getElementById('apiKeyDialog').remove();
      return;
    }
    
    if (window.DeepSeekAPI) {
      window.DeepSeekAPI.setApiKey(key);
      this._typeMessage('ai', '✅ API Key 已更新！DeepSeek AI 引擎已准备就绪。');
    }
    
    document.getElementById('apiKeyDialog').remove();
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
    
    const recommendedCards = ALL_CARDS?.filter(c => recs.includes(c.id));
    if (recommendedCards?.length > 0 && typeof StudyEngine !== 'undefined') {
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
    
    if (navigator.clipboard?.writeText) {
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
