/**
 * ===========================================================================
 * AI 防灾导师 — LLM 增强模块 + 知识库 RAG
 * ===========================================================================
 * 
 * 双模式回复系统：
 * 1. 知识库 RAG 模式（默认）：基于 ALL_CARDS + SCENARIOS 检索回答
 * 2. LLM 模式（可选）：加载 transformers.js + Qwen2-0.5B-Instruct
 * 
 * 知识库构建：从 369 张卡牌 + 34 个情景场景中提取防灾知识
 * 检索算法：关键词匹配 + 灾害类型分类
 * 
 * @version 1.3.0
 * ===========================================================================
 */

const AITutorLLM = {
  // ===== 状态 =====
  _pipeline: null,
  _modelId: 'Xenova/Qwen2-0.5B-Instruct',
  _isLoading: false,
  _isReady: false,
  _loadProgress: 0,
  _loadStatus: '',
  _knowledgeBase: [],
  _disasterKeywords: {
    earthquake: ['地震', '地动', '震动', '震级', '余震', '断层', '地壳', '震中', '地震波', '抗震'],
    flood: ['洪水', '洪涝', '暴雨', '水灾', '积水', '内涝', '河流水位', '漫堤', '汛期'],
    typhoon: ['台风', '飓风', '热带气旋', '大风', '狂风', '风暴', '风眼', '登陆'],
    fire: ['火灾', '火警', '着火', '火焰', '燃烧', '灭火', '消防', '119', '灭火器', '烟雾'],
    lightning: ['雷电', '闪电', '打雷', '雷击', '雷暴', '避雷', '电闪'],
    blizzard: ['暴雪', '大雪', '暴风雪', '雪灾', '冰冻', '严寒', '低温', '结冰'],
    landslide: ['滑坡', '泥石流', '塌方', '山体', '地质', '土石流', '崩塌'],
    drought: ['干旱', '旱灾', '缺水', '旱情', '干涸', '枯水', '水资源'],
    wildfire: ['山火', '林火', '野火', '森林火灾', '大火', '火势蔓延'],
    volcano: ['火山', '喷发', '岩浆', '火山灰', '熔岩', '火山爆发'],
    tsunami: ['海啸', '浪潮', '巨浪', '海平面', '海底地震', '潮汐'],
    sandstorm: ['沙尘暴', '风沙', '沙尘', '扬沙', '浮尘', '能见度'],
    general: ['防灾', '应急', '避难', '救援', '自救', '安全', '预警', '疏散', '急救']
  },

  // ===== 初始化知识库 =====
  initKnowledgeBase() {
    // 等待 ALL_CARDS 和 SCENARIOS 加载完成
    const tryBuild = () => {
      if (typeof ALL_CARDS === 'undefined' || typeof SCENARIOS === 'undefined') {
        setTimeout(tryBuild, 500);
        return;
      }
      this._buildKnowledgeBase();
      console.log('📚 AI 知识库已构建：' + this._knowledgeBase.length + ' 条知识');
    };
    tryBuild();
  },

  _buildKnowledgeBase() {
    this._knowledgeBase = [];

    // 从 ALL_CARDS 提取知识
    ALL_CARDS.forEach(card => {
      if (card.zh) {
        const keywords = [
          card.disaster,
          card.zh.name || '',
          card.zh.q || '',
          card.zh.exp || '',
          card.zh.scenario || '',
          ...(card.zh.tips || [])
        ].join(' ');

        this._knowledgeBase.push({
          type: 'card',
          disaster: card.disaster,
          question: card.zh.q,
          options: card.zh.opts,
          correctAnswer: card.zh.opts ? card.zh.opts[card.zh.ans] : '',
          explanation: card.zh.exp,
          tips: card.zh.tips || [],
          scenario: card.zh.scenario,
          flavor: card.flavor,
          keywords: keywords.toLowerCase(),
          priority: card.difficulty === 'hard' ? 3 : card.difficulty === 'medium' ? 2 : 1
        });
      }
    });

    // 从 SCENARIOS 提取知识
    Object.keys(SCENARIOS).forEach(disaster => {
      SCENARIOS[disaster].forEach(scenario => {
        const keywords = [
          disaster,
          scenario.title || '',
          scenario.desc || '',
          scenario.tip || '',
          scenario.setting || '',
          ...(scenario.choices || []).map(c => c.text + ' ' + c.response)
        ].join(' ');

        this._knowledgeBase.push({
          type: 'scenario',
          disaster: disaster,
          title: scenario.title,
          setting: scenario.setting,
          desc: scenario.desc,
          tip: scenario.tip,
          choices: scenario.choices,
          keywords: keywords.toLowerCase(),
          priority: 2
        });
      });
    });
  },

  // ===== 知识库搜索 =====
  searchKnowledge(query) {
    if (this._knowledgeBase.length === 0) return [];
    
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/[\s,.!?，。！？]+/).filter(w => w.length >= 2);
    
    // 识别灾害类型
    let matchedDisaster = null;
    Object.keys(this._disasterKeywords).forEach(d => {
      this._disasterKeywords[d].forEach(kw => {
        if (lowerQuery.includes(kw)) matchedDisaster = d;
      });
    });

    const results = [];
    
    this._knowledgeBase.forEach(item => {
      let score = 0;
      const text = item.keywords;

      // 灾害类型匹配（权重高）
      if (matchedDisaster && item.disaster === matchedDisaster) {
        score += 10;
      }

      // 关键词匹配
      queryWords.forEach(word => {
        if (text.includes(word)) score += 3;
      });

      // 完整短语匹配（权重更高）
      if (text.includes(lowerQuery)) score += 5;

      // 优先度加权
      score += (item.priority || 1) * 0.5;

      if (score > 0) {
        results.push({ item, score });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.item);
  },

  // ===== 加载 LLM 模型 =====
  async loadModel() {
    if (this._isLoading || this._isReady) return;
    this._isLoading = true;
    this._loadProgress = 0;
    this._loadStatus = '正在加载模型...';

    try {
      // 动态加载 transformers.js
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
      
      // 使用本地缓存
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      
      this._loadStatus = '下载模型中（约 300MB，首次加载较慢）...';
      
      this._pipeline = await pipeline('text-generation', this._modelId, {
        dtype: 'q4',
        device: 'webgpu',
        progress_callback: (p) => {
          if (p.status === 'progress') {
            this._loadProgress = Math.round(p.progress * 100);
            this._loadStatus = `下载中... ${this._loadProgress}%`;
          } else if (p.status === 'done') {
            this._loadStatus = '模型加载完成';
          }
        }
      });
      
      this._isReady = true;
      this._loadStatus = 'AI 模型已就绪';
      console.log('✅ LLM 模型加载完成');
    } catch (e) {
      console.warn('❌ LLM 模型加载失败:', e);
      this._isReady = false;
      this._loadStatus = '模型加载失败，使用知识库模式';
    }
    
    this._isLoading = false;
  },

  // ===== 生成回复（核心入口） =====
  async generateReply(userMessage, history = []) {
    // 特殊指令处理
    if (userMessage.includes('启用AI') || userMessage.includes('启用模型') || userMessage.includes('加载模型')) {
      if (!this._isReady && !this._isLoading) {
        this.loadModel();
        return '⏳ 正在加载 AI 模型（约 300MB，首次需要等待下载）...\n\n下载完成后会自动切换到 AI 模式。期间我会使用知识库为你回答。';
      }
      if (this._isLoading) {
        return `⏳ 模型加载中... ${this._loadProgress}%\n\n请稍等片刻。`;
      }
      return '✅ AI 模型已就绪！现在可以为你生成智能回答。';
    }

    // 如果 LLM 已加载，使用 LLM + RAG
    if (this._isReady && this._pipeline) {
      return this._generateLLMReply(userMessage, history);
    }
    
    // 回退到知识库模式
    return this._generateKnowledgeReply(userMessage);
  },

  // ===== LLM 回复生成 =====
  async _generateLLMReply(userMessage, history) {
    const knowledge = this.searchKnowledge(userMessage);
    const context = this._buildLLMContext(knowledge);
    
    const messages = [
      { 
        role: 'system', 
        content: '你是应急小达人的 AI 防灾导师，精通各种自然灾害的预防和应对知识。请用中文回答，语气亲切友好，适合小学生理解。回答要简洁准确，包含具体可操作的防灾建议。' + context 
      },
      ...history.slice(-4).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage }
    ];
    
    try {
      const output = await this._pipeline(messages, {
        max_new_tokens: 200,
        temperature: 0.7,
        do_sample: true,
        top_k: 50
      });
      
      let reply = output[0].generated_text;
      // 提取模型生成的部分（去除输入上下文）
      const assistantMarker = '<|im_start|>assistant\n';
      const assistantIdx = reply.lastIndexOf(assistantMarker);
      if (assistantIdx >= 0) {
        reply = reply.substring(assistantIdx + assistantMarker.length).trim();
      }
      // 去除结束标记
      reply = reply.replace(/<\|im_end\|>/g, '').trim();
      
      if (reply && reply.length > 10) {
        return reply;
      }
    } catch (e) {
      console.warn('LLM 生成失败:', e);
    }
    
    // LLM 失败时回退到知识库
    return this._generateKnowledgeReply(userMessage);
  },

  // ===== 知识库回复生成 =====
  _generateKnowledgeReply(userMessage) {
    const knowledge = this.searchKnowledge(userMessage);
    
    if (knowledge.length === 0) {
      return '💡 我可以帮你了解这些防灾知识：\n\n' +
        '• 地震避险：伏地、遮挡、手抓牢\n' +
        '• 火灾逃生：湿毛巾捂口鼻，弯腰前行\n' +
        '• 洪水应对：向高地转移，不游泳过河\n' +
        '• 台风防护：远离窗户，加固门窗\n' +
        '• 雷电安全：不在树下避雨，远离金属\n\n' +
        '你想了解哪个？直接问我吧！\n\n' +
        '（输入"启用AI"可加载更强大的 AI 模型）';
    }

    // 构建回复
    let reply = '';
    const seenTypes = new Set();
    
    knowledge.forEach((item, idx) => {
      if (idx > 0) reply += '\n\n';
      
      if (item.type === 'card') {
        if (!seenTypes.has(item.question)) {
          seenTypes.add(item.question);
          reply += `💡 **${item.question}**\n\n`;
          if (item.explanation) {
            reply += `${item.explanation}\n\n`;
          }
          if (item.correctAnswer) {
            reply += `✅ **正确答案：** ${item.correctAnswer}\n`;
          }
          if (item.tips && item.tips.length > 0) {
            reply += '\n📌 **关键提醒：**\n';
            item.tips.slice(0, 3).forEach(tip => {
              reply += `• ${tip}\n`;
            });
          }
        }
      } else if (item.type === 'scenario') {
        if (!seenTypes.has(item.title)) {
          seenTypes.add(item.title);
          reply += `🎯 **${item.title}**\n\n`;
          if (item.desc) {
            reply += `${item.desc}\n\n`;
          }
          if (item.tip) {
            reply += `💡 **核心建议：** ${item.tip}\n`;
          }
          if (item.choices) {
            const correctChoice = item.choices.find(c => c.correct);
            if (correctChoice) {
              reply += `\n✅ **正确做法：** ${correctChoice.text}\n`;
            }
          }
        }
      }
    });

    reply += '\n\n需要我推荐相关练习吗？';
    return reply;
  },

  // ===== 构建 LLM 上下文 =====
  _buildLLMContext(knowledge) {
    if (knowledge.length === 0) return '';
    
    let context = '\n\n【参考知识库】\n';
    knowledge.forEach((item, i) => {
      if (item.type === 'card') {
        context += `${i+1}. ${item.question}\n   答案：${item.correctAnswer || '未知'}\n   解析：${item.explanation || ''}\n`;
      } else {
        context += `${i+1}. ${item.title}\n   场景：${item.desc || ''}\n   建议：${item.tip || ''}\n`;
      }
    });
    return context;
  },

  // ===== 获取加载状态 =====
  getLoadStatus() {
    return {
      isLoading: this._isLoading,
      isReady: this._isReady,
      progress: this._loadProgress,
      status: this._loadStatus
    };
  }
};

// 自动初始化知识库
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AITutorLLM.initKnowledgeBase());
} else {
  AITutorLLM.initKnowledgeBase();
}

// 挂载到全局
window.AITutorLLM = AITutorLLM;
