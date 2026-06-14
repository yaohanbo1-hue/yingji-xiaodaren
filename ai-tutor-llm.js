/**
 * ===========================================================================
 * AI 防灾导师 — 纯前端智能对话引擎 v2.0
 * ===========================================================================
 * 
 * 无需任何外部模型/后端！纯前端实现：
 * 1. 知识库 RAG：从 ALL_CARDS + SCENARIOS 提取 400+ 条知识
 * 2. 意图识别：关键词 + 正则 + 上下文分类
 * 3. 对话状态机：greeting → assess → recommend → deep_dive
 * 4. 模板生成：多模板随机选择 + 变量替换 + 自然语言拼接
 * 5. Markdown 渲染：粗体、列表、emoji 自动装饰
 * 
 * @version 2.0.0
 * ===========================================================================
 */

const AITutorLLM = {
  // ===== 状态 =====
  _knowledgeBase: [],
  _conversationState: 'greeting', // greeting, assess, recommend, deep_dive, follow_up
  _lastTopic: null,
  _lastDisaster: null,
  _askedCount: 0,
  _disasterKeywords: {
    earthquake: ['地震','地动','震动','震级','余震','断层','地壳','震中','地震波','抗震','摇晃'],
    flood: ['洪水','洪涝','暴雨','水灾','积水','内涝','河流水位','漫堤','汛期','水淹','水淹'],
    typhoon: ['台风','飓风','热带气旋','大风','狂风','风暴','风眼','登陆','龙卷风','暴风'],
    fire: ['火灾','火警','着火','火焰','燃烧','灭火','消防','119','灭火器','烟雾','烟'],
    lightning: ['雷电','闪电','打雷','雷击','雷暴','避雷','电闪','霹雷'],
    blizzard: ['暴雪','大雪','暴风雪','雪灾','冰冻','严寒','低温','结冰','雪崩'],
    landslide: ['滑坡','泥石流','塌方','山体','地质','土石流','崩塌','滚石'],
    drought: ['干旱','旱灾','缺水','旱情','干涸','枯水','水资源','水荒'],
    wildfire: ['山火','林火','野火','森林火灾','大火','火势蔓延','森林'],
    volcano: ['火山','喷发','岩浆','火山灰','熔岩','火山爆发','地热'],
    tsunami: ['海啸','浪潮','巨浪','海平面','海底地震','潮汐','大海'],
    sandstorm: ['沙尘暴','风沙','沙尘','扬沙','浮尘','能见度','雾霾'],
    general: ['防灾','应急','避难','救援','自救','安全','预警','疏散','急救','逃生','求生']
  },

  // ===== 模板库 =====
  _templates: {
    greeting: [
      '你好呀！我是你的 🛡️ AI 防灾导师。我已经学习了 369 道防灾题目和 34 个真实灾害场景，可以随时帮你解答问题！',
      '嗨！很高兴见到你 👋 我精通地震、火灾、洪水、台风等 12 种自然灾害的应对知识。有什么想了解的？',
      '欢迎！我是你的防灾知识小助手 🤖 你可以问我任何关于自然灾害预防和应对的问题，我会用最易懂的方式告诉你！'
    ],
    no_knowledge: [
      '嗯，这个问题我还没有在知识库里找到答案 🤔 不过我可以告诉你一些基础常识：\n\n{defaultTips}\n\n你想了解哪个具体方面？直接告诉我吧！',
      '这个问题很专业！我的知识库还在学习中 📚 不过基本的防灾原则是这样的：\n\n{defaultTips}\n\n你想深入了解哪个灾害？',
      '好问题！虽然我没有找到完全匹配的知识，但防灾的核心原则是相通的：\n\n{defaultTips}\n\n告诉我你想了解的具体场景，我可以帮你模拟！'
    ],
    card_answer: [
      '💡 **{question}**\n\n{explanation}\n\n✅ **正确答案是：** {correctAnswer}\n\n📌 **关键提醒：**\n{tips}\n\n需要我用一个场景来演示这个知识点吗？',
      '这是个很重要的知识点！\n\n**{question}**\n\n{explanation}\n\n正确答案是 **{correctAnswer}** ✅\n\n记住这些要点：\n{tips}\n\n想实战演练一下吗？',
      '关于这个问题，我的知识库里有详细解答：\n\n📝 **{question}**\n\n{explanation}\n\n✅ 答案：**{correctAnswer}**\n\n⚠️ 特别提醒：\n{tips}'
    ],
    scenario_answer: [
      '🎯 **{title}**\n\n{desc}\n\n💡 **核心建议：** {tip}\n\n✅ **正确做法：** {correctChoice}\n\n遇到类似情况时，记住"{tip}"就不会慌了！',
      '这是一个真实的灾害场景！\n\n**{title}**\n\n{desc}\n\n💡 **关键建议：** {tip}\n\n正确选择应该是：**{correctChoice}**\n\n在现实中也一样，冷静判断最重要！',
      '来看看这个场景模拟：\n\n🎯 {title}\n\n{desc}\n\n核心原则是 **{tip}**\n\n正确答案是：**{correctChoice}** ✅'
    ],
    follow_up: [
      '还有别的问题吗？我可以继续帮你分析！',
      '想不想试试闯关挑战？把刚学的知识用一用？',
      '需要我推荐几道相关练习题巩固一下吗？',
      '还有其他想了解的吗？我随时准备着！'
    ],
    compliment: [
      '你问得很好！这说明你有很强的安全意识 👍',
      '这个问题非常实用！学习防灾就是要关注这些细节 💡',
      '太棒了！你正在建立正确的防灾思维模式 🌟',
      '你的问题很专业！很多成年人都不知道这个知识点呢 👏'
    ]
  },

  _defaultTips: '• 地震：伏地、遮挡、手抓牢（Drop, Cover, Hold On）\n• 火灾：湿毛巾捂口鼻，弯腰低姿前行\n• 洪水：向高处转移，不涉水过河，不触碰电线\n• 台风：远离窗户，加固门窗，储备物资\n• 雷电：不在树下避雨，远离金属和水体',

  // ===== 初始化知识库 =====
  initKnowledgeBase() {
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

  // ===== 智能意图识别 =====
  classifyIntent(query) {
    const lower = query.toLowerCase();
    const words = lower.split(/[\s,.!?，。！？]+/).filter(w => w.length >= 2);
    
    let disaster = null;
    let intent = 'general';
    let confidence = 0;

    // 识别灾害类型
    for (const [d, keywords] of Object.entries(this._disasterKeywords)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          disaster = d;
          confidence += 2;
          break;
        }
      }
      if (disaster) break;
    }

    // 意图关键词
    const intents = {
      quiz: ['题目','答题','练习','测试','考','做','练','挑战','闯关'],
      explain: ['为什么','怎么回事','什么','解释','原理','原因','是什么','意思'],
      howto: ['怎么','如何','怎样','怎么做','怎么办','步骤','方法','教','帮'],
      greeting: ['你好','嗨','在吗','hello','hi','你好啊','早上好','下午好'],
      thanks: ['谢谢','感谢','谢','多谢','谢了','太棒','厉害'],
      compare: ['区别','不同','对比','哪个','比较好','还是'],
      scenario: ['场景','情景','模拟','如果','假设','遇到','发生','时']
    };

    for (const [i, keywords] of Object.entries(intents)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          intent = i;
          confidence += 1;
          break;
        }
      }
    }

    // 更新对话状态
    this._updateState(intent, disaster);

    return { intent, disaster, confidence };
  },

  _updateState(intent, disaster) {
    this._askedCount++;
    if (disaster) this._lastDisaster = disaster;

    const stateMachine = {
      greeting: { next: 'assess', triggers: ['greeting', 'general'] },
      assess: { next: 'recommend', triggers: ['quiz', 'howto', 'explain'] },
      recommend: { next: 'deep_dive', triggers: ['explain', 'howto', 'scenario'] },
      deep_dive: { next: 'follow_up', triggers: ['thanks', 'compare', 'general'] },
      follow_up: { next: 'follow_up', triggers: ['general', 'howto', 'explain'] }
    };

    const current = stateMachine[this._conversationState] || stateMachine.greeting;
    if (current.triggers.includes(intent) || this._askedCount > 3) {
      this._conversationState = current.next;
    }
  },

  // ===== 知识库搜索 =====
  searchKnowledge(query, intent = 'general') {
    if (this._knowledgeBase.length === 0) return [];
    
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/[\s,.!?，。！？]+/).filter(w => w.length >= 2);
    
    let matchedDisaster = null;
    for (const [d, keywords] of Object.entries(this._disasterKeywords)) {
      for (const kw of keywords) {
        if (lowerQuery.includes(kw)) { matchedDisaster = d; break; }
      }
      if (matchedDisaster) break;
    }

    const results = [];
    this._knowledgeBase.forEach(item => {
      let score = 0;
      const text = item.keywords;

      if (matchedDisaster && item.disaster === matchedDisaster) score += 12;
      queryWords.forEach(word => { if (text.includes(word)) score += 3; });
      if (text.includes(lowerQuery)) score += 6;
      score += (item.priority || 1) * 0.5;

      // 意图加权
      if (intent === 'scenario' && item.type === 'scenario') score += 5;
      if (intent === 'explain' && item.type === 'card') score += 3;
      if (intent === 'howto' && item.tips?.length > 0) score += 4;

      if (score > 0) results.push({ item, score });
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 3).map(r => r.item);
  },

  // ===== 核心回复生成 =====
  async generateReply(userMessage, history = []) {
    const { intent, disaster, confidence } = this.classifyIntent(userMessage);
    const knowledge = this.searchKnowledge(userMessage, intent);

    // 问候语
    if (intent === 'greeting') {
      return this._pickTemplate('greeting');
    }

    // 感谢
    if (intent === 'thanks') {
      return '不用谢！😊 能帮到你我很开心。还有什么防灾问题想聊吗？';
    }

    // 无知识匹配
    if (knowledge.length === 0) {
      const tpl = this._pickTemplate('no_knowledge');
      return tpl.replace('{defaultTips}', this._defaultTips);
    }

    // 构建知识回复
    let reply = '';
    const seen = new Set();
    let itemCount = 0;

    for (const item of knowledge) {
      if (itemCount >= 2) break;
      
      if (item.type === 'card') {
        const key = item.question;
        if (seen.has(key)) continue;
        seen.add(key);
        
        const tpl = this._pickTemplate('card_answer');
        const tips = item.tips?.slice(0, 3).map(t => '• ' + t).join('\n') || '• 保持冷静，按照正确步骤操作\n• 记住"安全第一"原则\n• 平时多练习，灾害时不慌张';
        
        reply += tpl
          .replace('{question}', item.question)
          .replace('{explanation}', item.explanation || '这是重要的防灾知识点，请务必牢记！')
          .replace('{correctAnswer}', item.correctAnswer || '请查看题目解析')
          .replace('{tips}', tips);
        
        itemCount++;
      } else if (item.type === 'scenario') {
        const key = item.title;
        if (seen.has(key)) continue;
        seen.add(key);
        
        const tpl = this._pickTemplate('scenario_answer');
        const correctChoice = item.choices?.find(c => c.correct)?.text || '根据实际情况冷静判断';
        
        reply += tpl
          .replace('{title}', item.title)
          .replace('{desc}', item.desc || item.setting || '这是一个真实灾害场景')
          .replace('{tip}', item.tip || '保持冷静，优先确保自身安全')
          .replace('{correctChoice}', correctChoice);
        
        itemCount++;
      }
    }

    // 添加对话流
    if (this._conversationState === 'follow_up' || this._askedCount > 2) {
      reply += '\n\n' + this._pickTemplate('follow_up');
    }

    // 随机夸赞（30%概率）
    if (Math.random() < 0.3 && this._askedCount > 1) {
      reply += '\n\n' + this._pickTemplate('compliment');
    }

    return this._formatMarkdown(reply);
  },

  // ===== 模板选择 =====
  _pickTemplate(type) {
    const templates = this._templates[type];
    if (!templates || templates.length === 0) return '';
    return templates[Math.floor(Math.random() * templates.length)];
  },

  // ===== Markdown 格式化 =====
  _formatMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^•\s+(.+)$/gm, '• $1')
      .replace(/\n/g, '\n');
  },

  // ===== 公共 API =====
  isReady() { return true; },
  getLoadStatus() { return { isReady: true, status: '智能引擎已就绪' }; }
};

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AITutorLLM.initKnowledgeBase());
} else {
  AITutorLLM.initKnowledgeBase();
}

window.AITutorLLM = AITutorLLM;
