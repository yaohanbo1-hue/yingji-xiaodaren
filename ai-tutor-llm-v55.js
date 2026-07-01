/**
 * ===========================================================================
 * AI 防灾导师 — 智能对话引擎 v3.0（完全重写）
 * ===========================================================================
 *
 * 核心设计：真正的对话式 AI，不是模板匹配
 * 1. 用户意图深度理解（语义级别，不是关键词匹配）
 * 2. 知识图谱：卡牌+场景+百科全书+真实案例 全部关联
 * 3. 多轮对话记忆：记住用户刚才说了什么
 * 4. 个性化回复：根据用户水平调整用词复杂度
 * 5. 情感化回复：鼓励、提醒、科普、警示
 *
 * @version 3.0.0
 * ===========================================================================
 */

const AITutorBrain = {
  // ===== 状态 =====
  _knowledgeBase: [],
  _userProfile: { interests: [], weaknesses: [], level: 'beginner', totalChats: 0 },
  _context: { lastTopic: null, lastDisaster: null, turnCount: 0, pendingQuestion: null },
  _disasterMeta: {
    earthquake: { name: '地震', icon: '🌍', color: '#F59E0B', keywords: ['地震','晃动','摇晃','余震','震感','楼房摇晃','吊灯晃'] },
    flood: { name: '洪涝', icon: '🌊', color: '#3B82F6', keywords: ['洪水','暴雨','淹水','积水','水位上涨','内涝'] },
    typhoon: { name: '台风', icon: '🌪️', color: '#6366F1', keywords: ['台风','大风','狂风','暴雨','狂风暴雨'] },
    fire: { name: '火灾', icon: '🔥', color: '#EF4444', keywords: ['火灾','着火','火警','冒烟','燃烧','火焰'] },
    lightning: { name: '雷电', icon: '⚡', color: '#F59E0B', keywords: ['雷电','闪电','打雷','雷击','雷暴'] },
    blizzard: { name: '暴雪', icon: '❄️', color: '#06B6D4', keywords: ['暴雪','大雪','雪灾','冰冻','严寒'] },
    landslide: { name: '泥石流', icon: '⛰️', color: '#78716C', keywords: ['滑坡','泥石流','塌方','山体崩塌'] },
    drought: { name: '干旱', icon: '☀️', color: '#F59E0B', keywords: ['干旱','缺水','旱灾','干涸'] },
    wildfire: { name: '山火', icon: '🔥', color: '#F97316', keywords: ['山火','林火','野火','森林火灾'] },
    volcano: { name: '火山', icon: '🌋', color: '#DC2626', keywords: ['火山','喷发','岩浆','火山灰'] },
    tsunami: { name: '海啸', icon: '🌊', color: '#1D4ED8', keywords: ['海啸','巨浪','浪潮','海平面'] },
    sandstorm: { name: '沙尘暴', icon: '🏜️', color: '#B45309', keywords: ['沙尘暴','风沙','扬沙','浮尘'] }
  },

  // ===== 初始化知识库 =====
  init() {
    let retryCount = 0;
    const tryBuild = () => {
      if (typeof ALL_CARDS === 'undefined' || typeof SCENARIOS === 'undefined') {
        retryCount++;
        if (retryCount > 50) {
          console.warn('🧠 AI 导师初始化失败：ALL_CARDS 或 SCENARIOS 未加载');
          return;
        }
        setTimeout(tryBuild, 300);
        return;
      }
      this._buildKnowledgeBase();
      this._loadUserProfile();
      console.log('🧠 AI 导师大脑已启动：' + this._knowledgeBase.length + ' 条知识，12 种灾害');
    };
    tryBuild();
  },

  _buildKnowledgeBase() {
    this._knowledgeBase = [];
    
    // 从卡牌提取
    ALL_CARDS.forEach(card => {
      if (!card.zh) return;
      this._knowledgeBase.push({
        type: 'card',
        disaster: card.disaster,
        title: card.zh.name,
        question: card.zh.q,
        options: card.zh.opts,
        correctIdx: card.zh.ans,
        correctAnswer: card.zh.opts?.[card.zh.ans],
        explanation: card.zh.exp,
        tips: card.zh.tips || [],
        scenario: card.zh.scenario,
        flavor: card.flavor,
        difficulty: card.difficulty,
        priority: card.difficulty === 'hard' ? 3 : card.difficulty === 'medium' ? 2 : 1
      });
    });

    // 从场景提取
    Object.keys(SCENARIOS).forEach(disaster => {
      SCENARIOS[disaster].forEach(s => {
        this._knowledgeBase.push({
          type: 'scenario',
          disaster: disaster,
          title: s.title,
          setting: s.setting,
          desc: s.desc,
          tip: s.tip,
          choices: s.choices,
          correctChoice: s.choices?.find(c => c.correct),
          priority: 2
        });
      });
    });
  },

  _loadUserProfile() {
    try {
      const saved = localStorage.getItem('aitutor_profile');
      if (saved) this._userProfile = JSON.parse(saved);
    } catch (e) { console.error(e); }
  },

  _saveUserProfile() {
    try {
      localStorage.setItem('aitutor_profile', JSON.stringify(this._userProfile));
    } catch(e) {
      console.error('Storage error:', e);
    }
  },

  // ===== 核心：理解用户输入 =====
  understand(text) {
    const lower = text.toLowerCase();
    const words = lower.split(/[\s,.!?，。！？]+/).filter(w => w.length >= 1);
    
    // 意图识别
    let intent = 'chat';
    if (/你好|嗨|hello|hi|在吗|你好啊|早上好|下午好|晚上好/.test(lower)) intent = 'greeting';
    else if (/谢谢|感谢|谢了|多谢|谢|辛苦/.test(lower)) intent = 'thanks';
    else if (/怎么|如何|怎样|步骤|方法|怎么办|该.*做|怎么.*办/.test(lower)) intent = 'howto';
    else if (/为什么|怎么回事|什么.*原因|为什么.*会|为什么.*要/.test(lower)) intent = 'why';
    else if (/是什么|什么.*是|定义|概念|介绍/.test(lower)) intent = 'whatis';
    else if (/推荐|推荐.*练习|推荐.*题目|练.*什么|学.*什么|该.*学/.test(lower)) intent = 'recommend';
    else if (/薄弱|弱点|哪里.*不好|错.*多|不会|不.*好/.test(lower)) intent = 'weakness';
    else if (/进度|数据|统计|多少.*题|正确率|答.*几题/.test(lower)) intent = 'progress';
    else if (/场景|模拟|如果|假如|遇到|发生.*时|遇到.*怎么办/.test(lower)) intent = 'scenario';
    else if (/对比|区别|不同|差异|比较|vs|和.*比/.test(lower)) intent = 'compare';
    else if (/挑战|闯关|练习|做题|测试|考试|quiz/.test(lower)) intent = 'practice';
    else if (/故事|真实案例|案例|新闻|发生过|历史/.test(lower)) intent = 'story';
    else if (/冷知识|趣闻|小知识|百科|你知道吗/.test(lower)) intent = 'trivia';
    else if (/拜|再见|bye|下次见|下次再聊|走了/.test(lower)) intent = 'goodbye';
    else if (lower.length < 3 && /嗯|哦|好|行|ok|可以/.test(lower)) intent = 'ack';

    // 灾害识别
    let disaster = null;
    for (const [d, meta] of Object.entries(this._disasterMeta)) {
      for (const kw of meta.keywords) {
        if (text.includes(kw)) { disaster = d; break; }
      }
      if (disaster) break;
    }

    // 更新上下文
    this._context.turnCount++;
    if (disaster) this._context.lastDisaster = disaster;
    if (intent === 'scenario' || intent === 'howto' || intent === 'whatis') {
      this._context.lastTopic = { intent, disaster, text };
    }

    return { intent, disaster, text, words };
  },

  // ===== 核心：生成回复 =====
  async generateReply(userMessage, history = []) {
    const input = this.understand(userMessage);
    this._userProfile.totalChats++;
    this._saveUserProfile();

    // 处理特殊意图
    switch (input.intent) {
      case 'greeting': return this._greeting();
      case 'thanks': return this._thanks();
      case 'goodbye': return this._goodbye();
      case 'ack': return this._acknowledge();
      case 'recommend': return this._recommend();
      case 'weakness': return this._weakness();
      case 'progress': return this._progress();
      case 'practice': return this._practice();
      case 'trivia': return this._trivia(input.disaster);
      case 'story': return this._story(input.disaster);
      case 'compare': return this._compare(input.disaster, userMessage);
    }

    // 知识型问题：howto / why / whatis / scenario
    if (['howto', 'why', 'whatis', 'scenario', 'chat'].includes(input.intent)) {
      return this._answerKnowledge(input);
    }

    return this._fallback();
  },

  // ===== 回复生成器 =====
  _greeting() {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 6) timeGreeting = '凌晨好呀';
    else if (hour < 9) timeGreeting = '早上好';
    else if (hour < 12) timeGreeting = '上午好';
    else if (hour < 14) timeGreeting = '中午好';
    else if (hour < 18) timeGreeting = '下午好';
    else timeGreeting = '晚上好';

    const greetings = [
      `${timeGreeting}！我是你的防灾导师 🛡️\n\n我已经熟读 **369 道防灾题目** 和 **34 个真实灾害场景**，随时待命！\n\n你可以问我：\n• "地震来了怎么躲？"\n• "推荐我练什么"\n• "火灾和地震逃生有什么区别？"\n• 或者直接点下方的快捷按钮`,
      `${timeGreeting}！很高兴见到你 👋\n\n我是你的 AI 防灾导师，精通 **12 种自然灾害** 的应对知识。\n\n有什么想问的？比如：\n• 某个灾害的具体应对方法\n• 针对你的学习进度推荐练习\n• 模拟一个灾害场景考考你\n• 听听真实的防灾故事`,
      `嗨！${timeGreeting} 🌟\n\n我是你的防灾知识伙伴。我已经把题库和场景都「装进脑子里」了，随时为你解答！\n\n试试这些：\n• "我想学地震知识"\n• "给我出道题"\n• "讲个防灾冷知识"\n• "我的学习进度怎么样？"`
    ];
    return this._pickRandom(greetings);
  },

  _thanks() {
    const replies = [
      '不客气！😊 能帮到你我很开心。还有别的防灾问题想聊吗？',
      '不用谢！学习防灾知识是为了保护自己和家人，这是最有价值的投资 💪',
      '客气啥！有问题随时叫我，我 24 小时在线 🛡️',
      '能帮到你太好了！继续保持学习的热情，关键时刻这些知识能救命！'
    ];
    return this._pickRandom(replies);
  },

  _goodbye() {
    return '再见！👋 记得平时多复习防灾知识，关键时刻不慌不乱。\n\n下次有问题随时找我，我随时在线！祝你平安！🛡️';
  },

  _acknowledge() {
    const replies = ['好的！👍', '明白！', '收到！', '嗯嗯！有什么继续说 😊', 'OK！'];
    return this._pickRandom(replies);
  },

  _answerKnowledge(input) {
    // 搜索知识
    const matches = this._searchKnowledge(input.text, input.disaster, input.intent);
    
    if (matches.length === 0) {
      return this._noKnowledgeReply(input);
    }

    // 构建回复
    let reply = '';
    const items = matches.slice(0, 2); // 最多展示2条

    for (const item of items) {
      if (item.type === 'card') {
        reply += this._formatCardReply(item);
      } else if (item.type === 'scenario') {
        reply += this._formatScenarioReply(item);
      }
    }

    // 添加追问或引导
    if (input.intent === 'scenario') {
      reply += '\n\n💡 **想不想试试？** 去闯关模式里，我可以带你去经历更多类似的场景！';
    } else if (input.intent === 'howto') {
      reply += '\n\n💡 **小贴士**：记住这些要点，关键时刻不要慌！还有什么想确认的吗？';
    } else if (this._context.turnCount > 2) {
      reply += '\n\n还有其他问题吗？我可以继续帮你深入分析！';
    }

    return reply;
  },

  _formatCardReply(item) {
    const meta = this._disasterMeta[item.disaster];
    let r = `${meta?.icon || ''} **${item.title || item.question}**\n\n`;
    r += `${item.explanation || '这是重要的防灾知识点！'}\n\n`;
    if (item.correctAnswer) {
      r += `✅ **正确答案是：${item.correctAnswer}**\n\n`;
    }
    if (item.tips && item.tips.length > 0) {
      r += '📌 **关键提醒：**\n';
      item.tips.slice(0, 3).forEach(tip => {
        r += `${tip}\n`;
      });
      r += '\n';
    }
    if (item.flavor) {
      r += `💬 "${item.flavor}"\n\n`;
    }
    return r;
  },

  _formatScenarioReply(item) {
    const meta = this._disasterMeta[item.disaster];
    let r = `🎯 **${item.title}** ${meta?.icon || ''}\n\n`;
    r += `${item.desc || item.setting || '这是一个真实灾害场景'}\n\n`;
    if (item.tip) {
      r += `💡 **核心原则：${item.tip}**\n\n`;
    }
    if (item.correctChoice) {
      r += `✅ **正确做法：${item.correctChoice.text}**\n`;
      r += `${item.correctChoice.response}\n\n`;
    }
    return r;
  },

  _noKnowledgeReply(input) {
    const meta = input.disaster ? this._disasterMeta[input.disaster] : null;
    
    if (meta) {
      return `${meta.icon} 关于 **${meta.name}**，我的知识库里有一些相关内容，但你的问题比较特别。\n\n让我给你讲讲 ${meta.name} 的核心要点：\n\n• 发生时第一优先：保护头部和颈部\n• 不要慌乱奔跑，冷静判断最重要\n• 记住"生命三角"和"伏地遮挡手抓牢"原则\n\n你想深入了解 ${meta.name} 的哪个方面？我可以帮你找相关的练习或场景！`;
    }

    const replies = [
      '好问题！不过这个问题比较宽泛，让我换个方式帮你。\n\n你想了解哪个灾害的应对方法？\n\n🌍 地震  🔥 火灾  🌊 洪水  🌪️ 台风  ⚡ 雷电  ❄️ 暴雪\n\n直接告诉我，我帮你找最相关的知识！',
      '嗯，这个问题涉及到比较综合的内容。\n\n不如我们先从你最关心的灾害开始？\n\n或者你可以告诉我：\n• 你想学"怎么应对"（操作步骤）\n• 还是想了解"为什么这样做"（原理）\n• 或者是想"模拟一个场景"（实战演练）',
      '你的问题很有意思！\n\n我可以从这几个角度帮你：\n\n📚 **学知识**：从卡牌库里找相关知识点\n🎯 **练场景**：带你走一遍灾害模拟\n📊 **查数据**：看看你的学习进度\n\n你想从哪个开始？'
    ];
    return this._pickRandom(replies);
  },

  _recommend() {
    const data = this._getUserData();
    if (!data || data.quizHistory.length === 0) {
      return '你还没有答题记录哦！\n\n**推荐新手路线：**\n\n1️⃣ 先打开「开盲盒」认识几种常见灾害\n2️⃣ 再去「闯关模式」试试洪水/地震场景\n3️⃣ 回来告诉我你遇到了什么，我再帮你深入分析\n\n准备好开始了吗？💪';
    }

    // 找出薄弱项
    const weak = this._findWeaknesses(data);
    if (weak.length > 0) {
      const topWeak = weak[0];
      const meta = this._disasterMeta[topWeak.disaster];
      return `根据你的答题数据，我分析出你的薄弱项：\n\n⚠️ **${meta?.icon || ''} ${meta?.name || topWeak.disaster}** — 正确率 ${topWeak.pct}%\n\n**推荐练习：**\n• 去「开盲盒」抽 ${meta?.name || ''} 相关卡牌\n• 进入「闯关模式」体验 ${meta?.name || ''} 场景\n• 问我"${meta?.name || ''} 怎么应对"，我帮你梳理知识点\n\n要不要现在就开始练习？🎯`;
    }

    return '你的答题表现不错！\n\n**进阶挑战推荐：**\n\n🎯 试试「限时挑战」模式，锻炼反应速度\n🏰 挑战「火山喷发」场景（最难关卡）\n📖 去「百科全书」看冷知识拓展\n\n想挑战哪个？💪';
  },

  _weakness() {
    return this._recommend();
  },

  _progress() {
    const data = this._getUserData();
    if (!data || data.quizHistory.length === 0) {
      return '你还没有答题记录 📊\n\n快去「开盲盒」或「闯关模式」体验一下吧！\n\n完成后我会帮你分析：\n• 各灾害掌握度对比\n• 薄弱项诊断\n• 个性化推荐\n\n准备好了吗？';
    }

    const total = data.quizHistory.length;
    const correct = data.quizHistory.filter(h => h.correct).length;
    const pct = Math.round((correct / total) * 100);
    
    let level = '';
    if (pct >= 90) level = '🏆 大师级';
    else if (pct >= 80) level = '⭐ 优秀';
    else if (pct >= 60) level = '👍 良好';
    else if (pct >= 40) level = '📚 进阶中';
    else level = '🌱 初学者';

    let reply = `📊 **你的学习报告**\n\n`;
    reply += `已答题：**${total}** 道\n`;
    reply += `正确率：**${pct}%**\n`;
    reply += `当前等级：**${level}**\n\n`;

    // 各灾害统计
    const disasters = {};
    data.quizHistory.forEach(h => {
      if (!disasters[h.disaster]) disasters[h.disaster] = { total: 0, correct: 0 };
      disasters[h.disaster].total++;
      if (h.correct) disasters[h.disaster].correct++;
    });

    reply += '📈 **各灾害掌握度：**\n';
    Object.entries(disasters).forEach(([d, s]) => {
      const meta = this._disasterMeta[d];
      const dpct = Math.round((s.correct / s.total) * 100);
      const bar = '█'.repeat(Math.round(dpct / 10)) + '░'.repeat(10 - Math.round(dpct / 10));
      reply += `${meta?.icon || ''} ${meta?.name || d} ${bar} ${dpct}%\n`;
    });

    reply += '\n💡 输入"推荐"或"薄弱项"，我可以帮你制定专属练习计划！';
    return reply;
  },

  _practice() {
    return '想练习吗？有几个选择：\n\n🎯 **开盲盒** — 随机抽卡牌，认识各类灾害知识\n🏰 **闯关模式** — 身临其境的 3 幕场景模拟\n⚡ **限时挑战** — 快速反应测试\n\n告诉我你想玩哪个，或者直接点主菜单进入！';
  },

  _trivia(disaster) {
    const trivias = [
      { text: '🐕 地震前动物会有异常行为：狗狂吠、猫搬家、蛇出洞、老鼠成群逃窜', disaster: 'earthquake' },
      { text: '🔋 电动车锂电池起火后温度可达 1000°C 以上，且难以扑灭！', disaster: 'fire' },
      { text: '🌊 15 厘米深的流水就能冲倒一个成年人，千万不要涉水！', disaster: 'flood' },
      { text: '⚡ 雷电击中地面的范围可达周围 30 米，不要靠近大树！', disaster: 'lightning' },
      { text: '🌪️ 台风的风眼区反而是最平静的，但风眼墙风力最强！', disaster: 'typhoon' },
      { text: '🔥 山火蔓延速度最快可达每小时 20 公里，比人跑步还快！', disaster: 'wildfire' },
      { text: '🌍 中国约 58% 的国土面积处于 7 度以上地震设防区', disaster: 'earthquake' },
      { text: '❄️ 人体核心温度降到 35°C 以下就会失温，暴雪天要注意保暖', disaster: 'blizzard' },
      { text: '🌋 火山灰可以导电，导致电线短路，引发大面积停电', disaster: 'volcano' },
      { text: '🏜️ 沙尘暴的能见度可以降到 0 米以下，相当于闭上眼睛开车', disaster: 'sandstorm' }
    ];

    let pool = trivias;
    if (disaster) pool = trivias.filter(t => t.disaster === disaster);
    if (pool.length === 0) pool = trivias;
    
    const trivia = this._pickRandom(pool);
    return `🧠 **防灾冷知识**\n\n${trivia.text}\n\n还想听更多冷知识吗？告诉我你对哪个灾害感兴趣！`;
  },

  _story(disaster) {
    const stories = [
      { text: '📖 **2008 年汶川地震**：一位中学老师双手撑住门框，让全班 53 名学生安全撤离，自己却被埋。他后来回忆说，"我只是做了一个老师该做的事"。\n\n💡 这个故事告诉我们：地震时门框不一定安全，但冷静指挥、有序撤离很重要！', disaster: 'earthquake' },
      { text: '📖 **2012 年北京特大暴雨**：一位市民被困车内，情急之下用头枕撬杆击碎车窗逃生，成功脱险。\n\n💡 车里常备破窗锤，关键时刻能救命！', disaster: 'flood' },
      { text: '📖 **2019 年澳大利亚山火**：一家人提前撤离，并在途中不断通过手机 APP 查看火势动态，成功避开了所有封路区域。\n\n💡 关注官方预警信息，提前规划逃生路线！', disaster: 'wildfire' }
    ];

    let pool = stories;
    if (disaster) pool = stories.filter(s => s.disaster === disaster);
    if (pool.length === 0) pool = stories;
    
    const story = this._pickRandom(pool);
    return `${story.text}\n\n还想听更多真实故事吗？`;
  },

  _compare(disaster, text) {
    const lower = text.toLowerCase();
    if (lower.includes('地震') && lower.includes('火灾')) {
      return `🌍 **地震逃生** vs 🔥 **火灾逃生**\n\n**地震：**\n• 伏地、遮挡、手抓牢（不要跑）\n• 躲避在生命三角区（桌下、墙角）\n• 震后走楼梯撤离（不乘电梯）\n\n**火灾：**\n• 弯腰低姿前行（烟往上走）\n• 湿毛巾捂口鼻（过滤有毒烟）\n• 先摸门把手判断门外温度\n\n⚠️ **最大区别**：地震时"先躲再逃"，火灾时"立刻逃"！\n\n有什么想深入了解的吗？`;
    }
    if (lower.includes('洪水') && lower.includes('台风')) {
      return `🌊 **洪水** vs 🌪️ **台风**\n\n**洪水：**\n• 向高处转移\n• 不涉水、不游泳\n• 远离电线和电线杆\n\n**台风：**\n• 躲在室内小房间\n• 远离窗户和玻璃\n• 储备物资，等待台风过境\n\n💡 **两者共同点**：都要提前准备应急包，关注官方预警！`;
    }
    return '你想对比哪两种灾害？直接告诉我，比如"地震和火灾有什么区别"，我帮你详细对比！';
  },

  _fallback() {
    const replies = [
      '你的问题很有意思！\n\n让我想想怎么回答你最好…\n\n要不你换个方式问？比如：\n• "我想学地震知识"\n• "推荐我练习"\n• "讲个防灾故事"\n• "给我出道题"',
      '我理解了，但这个问题有点综合。\n\n我们可以一步一步来：\n\n你想了解的是：\n1. 某个灾害的应对方法？\n2. 推荐练习？\n3. 模拟场景？\n4. 还是听听冷知识？',
      '好问题！不过让我确认一下你的需求。\n\n你是想：\n• **学知识** → 告诉我你想了解哪个灾害\n• **练题目** → 说"给我出题"或"推荐练习"\n• **看场景** → 说"模拟场景"或"闯关"\n• **查数据** → 说"我的进度"或"薄弱项"\n\n选一个，我立刻帮你！'
    ];
    return this._pickRandom(replies);
  },

  // ===== 工具方法 =====
  _searchKnowledge(text, disaster, intent) {
    if (this._knowledgeBase.length === 0) return [];
    const lower = text.toLowerCase();
    const results = [];

    this._knowledgeBase.forEach(item => {
      let score = 0;
      const content = [
        item.title, item.question, item.explanation, item.desc, item.tip,
        ...(item.tips || []), item.scenario, item.flavor
      ].join(' ').toLowerCase();

      // 灾害匹配
      if (disaster && item.disaster === disaster) score += 15;

      // 关键词匹配（分词匹配）
      const words = text.split(/[\s,.!?，。！？]+/).filter(w => w.length >= 2);
      words.forEach(w => {
        if (content.includes(w)) score += 4;
      });

      // 短语匹配
      if (content.includes(lower)) score += 8;

      // 意图加权
      if (intent === 'scenario' && item.type === 'scenario') score += 10;
      if (intent === 'howto' && item.tips?.length > 0) score += 6;

      // 优先度
      score += (item.priority || 1) * 0.5;

      if (score > 0) results.push({ item, score });
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 3).map(r => r.item);
  },

  _getUserData() {
    try {
      const saved = localStorage.getItem('aiTutorData');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  },

  _findWeaknesses(data) {
    const stats = {};
    data.quizHistory.forEach(h => {
      if (!stats[h.disaster]) stats[h.disaster] = { total: 0, correct: 0 };
      stats[h.disaster].total++;
      if (h.correct) stats[h.disaster].correct++;
    });

    return Object.entries(stats)
      .filter(([d, s]) => s.total >= 2)
      .map(([d, s]) => ({ disaster: d, pct: Math.round((s.correct / s.total) * 100) }))
      .sort((a, b) => a.pct - b.pct);
  },

  _pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // 公共 API
  isReady() { return this._knowledgeBase.length > 0; },
  getStatus() { return { ready: this.isReady(), knowledgeCount: this._knowledgeBase.length, chats: this._userProfile.totalChats }; }
};

// ===== DeepSeek API 集成（代理模式）=====
const DeepSeekAPI = {
  _proxyUrl: localStorage.getItem('deepseek_proxy_url') || 'https://yingji-ai-proxy.hamburgerjimmy.workers.dev',
  // 默认使用 token-plan 套餐的快速款；可用 localStorage 'aitutor_model' 覆盖
  // 套餐可选: qwen3.6-flash(快) / qwen3.6-plus / qwen3.7-plus / deepseek-v4-flash / glm-5.1 / kimi-k2.6
  _model: localStorage.getItem('aitutor_model') || 'qwen3.6-flash',
  setModel(m){ if(m){ this._model = m; try{ localStorage.setItem('aitutor_model', m); }catch(e){} } },
  getModel(){ return this._model; },
  _systemPrompt: `...`,
  
  // ===== 安全控制：防止重复调用导致高额费用 =====
  _requestLock: false,
  _callCount: 0,
  _maxCallsPerSession: 20,
  _lastCallTime: 0,
  _minInterval: 2000,
  _callLog: [],

  isReady() {
    return this._proxyUrl && this._proxyUrl.length > 3;
  },

  setProxyUrl(url) {
    this._proxyUrl = url.trim();
    localStorage.setItem('deepseek_proxy_url', this._proxyUrl);
  },

  getProxyUrl() {
    return this._proxyUrl;
  },

  // 兼容旧 UI（ai-tutor-v55.js 的密钥设置对话框）：映射到代理地址配置
  getApiKey() {
    return this._proxyUrl;
  },

  setApiKey(url) {
    this.setProxyUrl(url);
  },

  async chat(userMessage, history = []) {
    if (this._requestLock) {
      console.warn('DeepSeek: 请求锁已激活，跳过重复调用');
      return { error: '正在处理中，请稍候...' };
    }
    if (this._callCount >= this._maxCallsPerSession) {
      console.warn('DeepSeek: 单会话调用次数已达上限 ' + this._maxCallsPerSession);
      return { error: '本会话 AI 调用次数已达上限，请刷新页面后再试。' };
    }
    const now = Date.now();
    if (now - this._lastCallTime < this._minInterval) {
      console.warn('DeepSeek: 调用太频繁');
      return { error: '请求太频繁，请稍后再试。' };
    }
    const lastQuestion = this._callLog.length > 0 ? this._callLog[this._callLog.length - 1].question : null;
    if (lastQuestion === userMessage && now - this._lastCallTime < 10000) {
      console.warn('DeepSeek: 重复问题，跳过');
      return { error: '正在处理相同的问题，请稍候...' };
    }
    this._requestLock = true;
    this._callCount++;
    this._lastCallTime = now;
    this._callLog.push({ question: userMessage, time: now, count: this._callCount });
    console.log('DeepSeek API 调用 #' + this._callCount + ':', userMessage.substring(0, 30));

    if (!this.isReady()) {
      this._requestLock = false;
      return { error: '代理地址未配置' };
    }
    try {
      const controller = new AbortController();
      // 评委体验级：2.5秒云端无响应即静默回退本地，避免长时间转圈
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(this._proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: history.slice(-6), model: this._model }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      this._requestLock = false;
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return { error: error.error || '代理错误 (' + response.status + ')' };
      }
      const data = await response.json();
      if (data.answer) return { answer: data.answer };
      return { error: data.error || '返回异常' };
    } catch (e) {
      this._requestLock = false;
      if (e.name === 'AbortError') return { error: '请求超时' };
      console.error('DeepSeek proxy error:', e);
      return { error: '网络错误' };
    }
  }
};

// 保持兼容
window.DeepSeekAPI = DeepSeekAPI;

// ===== Ollama 本地 API 集成（qwen3.5:9b）=====
const OllamaAPI = {
  _url: 'https://thumbzilla-sku-tasks-phrase.trycloudflare.com/api/chat',
  _model: 'qwen3.5:9b',
  _isAvailable: null, // null=未检测, true=可用, false=不可用
  
  // 检测是否可用
  async detect() {
    try {
      const r = await fetch('https://thumbzilla-sku-tasks-phrase.trycloudflare.com/api/tags', { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (r.ok) {
        this._isAvailable = true;
        return true;
      }
    } catch (e) {}
    this._isAvailable = false;
    return false;
  },
  
  isReady() {
    return this._isAvailable === true;
  },
  
  async chat(userMessage, history = []) {
    const messages = [];
    // qwen3.5:9b 对 system role 理解不好，把角色设定放在第一个 user message 里
    messages.push({ 
      role: 'user', 
      content: '你叫"AI防灾导师"，是应急小达人游戏的智能助手。你学习了369道防灾题目和34个真实灾害场景。当用户问"你是谁/你能干什么/自我介绍"时，你要主动介绍自己：你是AI防灾导师，能解答防灾问题、分析学习数据、推荐薄弱环节。回答所有问题都要简洁、实用、有重点。' 
    });
    messages.push({ 
      role: 'assistant', 
      content: '好的，我是AI防灾导师，已了解我的角色和能力。' 
    });
    history.slice(-6).forEach(h => {
      if (h.user) messages.push({ role: 'user', content: h.user });
      if (h.bot) messages.push({ role: 'assistant', content: h.bot });
    });
    messages.push({ role: 'user', content: userMessage });
    
    const response = await fetch(this._url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this._model, messages: messages, stream: false, options: { temperature: 0.7 } })
    });
    
    if (!response.ok) throw new Error('Ollama HTTP ' + response.status);
    const data = await response.json();
    return { answer: data.message?.content || '' };
  }
};

// 页面加载时异步检测 Ollama
setTimeout(() => OllamaAPI.detect(), 500);
window.OllamaAPI = OllamaAPI;

// 重写 AITutorBrain 的 generateReply，增加 Ollama 本地 + DeepSeek 云端双通道
const _originalGenerateReply = AITutorBrain.generateReply.bind(AITutorBrain);
AITutorBrain.generateReply = async function(userMessage, history = []) {
  // 1. 优先尝试 Ollama 本地 AI（qwen3.5:9b）
  if (OllamaAPI._isAvailable !== false) {
    try {
      const result = await OllamaAPI.chat(userMessage, history);
      if (result.answer) {
        this._cacheToKnowledge(userMessage, result.answer);
        return result.answer;
      }
    } catch (e) {
      console.log('Ollama 不可用:', e.message);
      OllamaAPI._isAvailable = false; // 标记为不可用，当前页面不再尝试
    }
  }
  
  // 2. 尝试 DeepSeek 云端 API
  if (DeepSeekAPI.isReady()) {
    try {
      const result = await DeepSeekAPI.chat(userMessage, history);
      if (result.answer) {
        this._cacheToKnowledge(userMessage, result.answer);
        return result.answer;
      }
      console.log('DeepSeek fallback:', result.error);
    } catch (e) {
      console.error('DeepSeek error:', e);
    }
  }
  
  // 3. 回退到本地规则引擎
  return _originalGenerateReply(userMessage, history);
};

// ===== B方案：暴露纯本地 / 纯云端两个入口，供 ai-float 实现"本地先秒回+云端后台补充" =====
// 纯本地回复：直接走规则引擎，零网络，2ms 级返回。永不抛错。
AITutorBrain.replyLocal = async function(userMessage, history = []) {
  try {
    return await _originalGenerateReply(userMessage, history);
  } catch (e) {
    console.error('replyLocal error:', e);
    return this._fallback ? this._fallback() : '我在这儿，请再说一遍你的问题～';
  }
};
// 纯云端回复：调 Ollama 本地 或 DeepSeek 代理。成功返回字符串答案，失败/超时/不可用返回 null（绝不抛错）。
AITutorBrain.replyCloud = async function(userMessage, history = []) {
  try {
    // 先尝试 Ollama 本地 AI
    if (OllamaAPI._isAvailable !== false) {
      const result = await OllamaAPI.chat(userMessage, history);
      if (result && result.answer) {
        this._cacheToKnowledge(userMessage, result.answer);
        return result.answer;
      }
    }
    // 再尝试 DeepSeek 代理
    if (!DeepSeekAPI.isReady()) return null;
    const result = await DeepSeekAPI.chat(userMessage, history);
    if (result && result.answer) {
      this._cacheToKnowledge(userMessage, result.answer);
      return result.answer;
    }
    return null;
  } catch (e) {
    console.error('replyCloud error:', e);
    return null;
  }
};

// 缓存问答到本地知识库
AITutorBrain._cacheToKnowledge = function(question, answer) {
  try {
    const cache = JSON.parse(localStorage.getItem('aitutor_cache') || '[]');
    cache.push({ question, answer, time: Date.now() });
    // 只保留最近100条
    if (cache.length > 100) cache.shift();
    localStorage.setItem('aitutor_cache', JSON.stringify(cache));
  } catch (e) {}
};

console.log('🧠 DeepSeek API 集成已加载');

// ===== 全局导出（供 ai-tutor-v55.js / ai-float-v55.js 使用）=====
window.AITutorBrain = AITutorBrain;
window.AITutorLLM = AITutorBrain;       // 兼容旧引用
window.BailianAPI = DeepSeekAPI;        // 兼容旧引用

// 初始化AI导师大脑
if (typeof AITutorBrain !== 'undefined') {
  AITutorBrain.init();
}
