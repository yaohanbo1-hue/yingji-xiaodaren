/**
 * 故事模式 V2 - 沉浸式防灾故事
 * 丰富的剧情 + 精美的视觉体验
 */
const StoryV2Engine = {
  // 丰富的故事章节
  _chapters: [
    {
      id: 1,
      title: "第一章：地震来袭",
      icon: "🌍",
      bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      desc: "城市突然发生6.5级地震，你是防灾指挥官，需要带领市民安全撤离。",
      scenes: [
        {
          id: 1,
          text: "2026年6月15日，下午3:27。\n\n你正在市政厅的防灾指挥中心值班，窗外阳光明媚，一切看起来都很平静。\n\n突然——",
          effect: "shake",
          options: [
            { text: "🚨 立即启动应急广播系统", next: 2, points: 25, mood: "冷静应对", tag: "correct" },
            { text: "🏃 先跑出大楼再说", next: 3, points: 10, mood: "惊慌失措", tag: "wrong" }
          ]
        },
        {
          id: 2,
          text: "你迅速按下红色按钮，全市的应急广播系统启动！\n\n「各位市民请注意，现在发生地震，请保持冷静，按照演练路线有序撤离到空旷地带！」\n\n警报声响彻整座城市。",
          effect: "alarm",
          options: [
            { text: "📍 指挥市民前往公园和操场", next: 4, points: 30, mood: "有序指挥", tag: "correct" },
            { text: "👥 组织志愿者协助老人和孩子", next: 4, points: 25, mood: "关怀弱势", tag: "good" }
          ]
        },
        {
          id: 3,
          text: "你冲出大楼，但街道上已经一片混乱！\n\n没有组织的撤离让很多人摔倒受伤，有人被掉落的广告牌砸中...\n\n你意识到，没有指挥的逃跑比原地等待更危险。",
          effect: "chaos",
          options: [
            { text: "📢 大声呼喊，组织附近人群", next: 4, points: 15, mood: "亡羊补牢", tag: "ok" },
            { text: "🩹 先救助受伤的人", next: 4, points: 20, mood: "救死扶伤", tag: "good" }
          ]
        },
        {
          id: 4,
          text: "⚠️ 突然，大地再次剧烈摇晃！\n\n余震来了！建筑物开始二次倒塌，玻璃碎片四处飞溅...\n\n你必须立刻做出决定！",
          effect: "quake",
          options: [
            { text: "🧎 大喊「蹲下！护头！抓住固定物！」", next: 5, points: 30, mood: "正确避险", tag: "correct" },
            { text: "🏃‍♂️ 继续快速往空旷处跑", next: 5, points: 10, mood: "冒险行动", tag: "risky" }
          ]
        },
        {
          id: 5,
          text: "余震终于过去了...\n\n你成功带领市民到达安全的开阔地带。救援队的直升机也赶到了！\n\n「指挥官，干得好！我们已经控制了局面。」",
          effect: "relief",
          options: [
            { text: "📦 配合救援队分发应急物资", next: "end", points: 35, mood: "完美收尾", tag: "correct" }
          ]
        }
      ],
      reward: 150,
      knowledge: [
        "🔔 地震预警信号：应急广播、警报声",
        "🏃 撤离原则：有序、不推挤、走安全通道",
        "🧎 避险姿势：蹲下、护头、抓牢固定物",
        "📦 应急物资：水、食物、急救包、手电筒"
      ]
    },
    {
      id: 2,
      title: "第二章：洪水围城",
      icon: "🌊",
      bg: "linear-gradient(135deg, #0c3547 0%, #1a4a5e 50%, #2d6b8a 100%)",
      desc: "连续暴雨导致河水暴涨，洪水正在涌入居民区。",
      scenes: [
        {
          id: 1,
          text: "暴雨已经持续了三天三夜...\n\n你接到紧急报告：上游水库水位已超过警戒线，随时可能溃坝！\n\n河对岸的低洼居民区还在沉睡中...",
          effect: "rain",
          options: [
            { text: "🚨 立即启动防洪应急预案", next: 2, points: 25, mood: "果断决策", tag: "correct" },
            { text: "📞 先打电话请示上级", next: 3, points: 10, mood: "犹豫不决", tag: "wrong" }
          ]
        },
        {
          id: 2,
          text: "你果断按下启动按钮！\n\n全市防洪系统启动，低洼地区的警报器开始鸣响。\n\n「全体市民注意！洪水预警！请立即向高处转移！」",
          effect: "alarm",
          options: [
            { text: "👴 优先转移老人、儿童和残疾人", next: 4, points: 30, mood: "以人为本", tag: "correct" },
            { text: "📦 先抢救重要物资和设备", next: 4, points: 15, mood: "物资优先", tag: "risky" }
          ]
        },
        {
          id: 3,
          text: "你拨通了上级的电话，但线路繁忙...\n\n等你终于接通时，洪水已经涌入了居民区！\n\n一些人被困在了楼顶， situation 变得非常危急！",
          effect: "flood",
          options: [
            { text: "🚁 立即组织冲锋舟救援", next: 4, points: 20, mood: "紧急救援", tag: "ok" },
            { text: "⏳ 等待专业救援队到来", next: 4, points: 10, mood: "被动等待", tag: "wrong" }
          ]
        },
        {
          id: 4,
          text: "洪水还在上涨！\n\n你发现一栋居民楼里还有被困的家庭，水位已经到二楼了！\n\n他们正在窗口挥舞着鲜艳的衣服求救...",
          effect: "danger",
          options: [
            { text: "🚤 调用冲锋舟从水路接近", next: 5, points: 25, mood: "水路救援", tag: "correct" },
            { text: "🪢 用绳索搭建救援通道", next: 5, points: 20, mood: "绳索救援", tag: "good" }
          ]
        },
        {
          id: 5,
          text: "所有被困居民都被成功救出！\n\n你组织大家在临时安置点休息，分发热食和干衣物。\n\n「谢谢你...如果不是你，我们可能就...」一位母亲抱着孩子哽咽道。",
          effect: "warmth",
          options: [
            { text: "🍲 安排食物、医疗和心理疏导", next: "end", points: 35, mood: "全面关怀", tag: "correct" }
          ]
        }
      ],
      reward: 180,
      knowledge: [
        "🌊 洪水预警：蓝色→黄色→橙色→红色",
        "🏔️ 避险原则：向高处转移，不涉水过河",
        "🚤 救援方式：冲锋舟、绳索、直升机",
        "🆘 求救信号：鲜艳衣物、手电筒、哨子"
      ]
    },
    {
      id: 3,
      title: "第三章：台风登陆",
      icon: "🌀",
      bg: "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #4a4a6a 100%)",
      desc: "超强台风「海神」即将登陆，风力达到17级。",
      scenes: [
        {
          id: 1,
          text: "气象台发布台风红色预警！\n\n超强台风「海神」将在6小时后登陆，中心风力17级，阵风18级！\n\n这是近50年来最强的台风...",
          effect: "wind",
          options: [
            { text: "📋 立即召开紧急防灾会议", next: 2, points: 25, mood: "统筹部署", tag: "correct" },
            { text: "🔨 先派人加固自家门窗", next: 2, points: 10, mood: "顾此失彼", tag: "wrong" }
          ]
        },
        {
          id: 2,
          text: "紧急会议上，你做出了部署：\n\n「全市进入紧急状态！开放所有避难所！渔船回港！户外施工全部停止！」\n\n但还有一个问题——海边还有大量游客...",
          effect: "meeting",
          options: [
            { text: "🚌 调派大巴疏散游客到内陆", next: 3, points: 30, mood: "果断疏散", tag: "correct" },
            { text: "📢 广播通知，让他们自行撤离", next: 3, points: 15, mood: "被动通知", tag: "risky" }
          ]
        },
        {
          id: 3,
          text: "台风提前登陆了！！\n\n狂风呼啸，大树被连根拔起，广告牌在空中飞舞...\n\n你接到报告：有人不顾警告在海边观浪！",
          effect: "typhoon",
          options: [
            { text: "🚔 强制撤离，必要时采取强制措施", next: 4, points: 30, mood: "生命至上", tag: "correct" },
            { text: "📣 继续劝说，希望他们自己离开", next: 4, points: 10, mood: "优柔寡断", tag: "wrong" }
          ]
        },
        {
          id: 4,
          text: "台风眼经过了！\n\n突然风平浪静，一些人跑出去查看情况...\n\n但你清楚——台风眼过后，狂风会从反方向再次袭来！",
          effect: "eye",
          options: [
            { text: "📢 紧急广播：不要外出！台风眼还没过！", next: 5, points: 35, mood: "专业判断", tag: "correct" },
            { text: "🔍 派人出去评估损失", next: 5, points: 10, mood: "冒险行动", tag: "dangerous" }
          ]
        },
        {
          id: 5,
          text: "台风终于过去了...\n\n城市一片狼藉，但因为你提前部署，伤亡降到了最低。\n\n「指挥官，全市零死亡！这是奇迹！」",
          effect: "victory",
          options: [
            { text: "🔧 组织灾后重建和恢复工作", next: "end", points: 35, mood: "善始善终", tag: "correct" }
          ]
        }
      ],
      reward: 200,
      knowledge: [
        "🌀 台风预警：蓝→黄→橙→红（红色最严重）",
        "🏠 防风措施：加固门窗、收回户外物品",
        "🌊 台风眼：短暂平静后狂风再来",
        "⚠️ 危险行为：海边观浪、台风中外出"
      ]
    },
    {
      id: 4,
      title: "第四章：火灾逃生",
      icon: "🔥",
      bg: "linear-gradient(135deg, #2d1b1b 0%, #4a2020 50%, #6b3030 100%)",
      desc: "商场突发大火，浓烟滚滚，数百人被困。",
      scenes: [
        {
          id: 1,
          text: "周六下午，阳光购物中心人山人海。\n\n你正在三楼陪家人逛街，突然——\n\n「着火了！着火了！」尖叫声从一楼传来。",
          effect: "fire",
          options: [
            { text: "🚨 立即按下火灾报警器", next: 2, points: 25, mood: "冷静报警", tag: "correct" },
            { text: "🏃 拉着家人往电梯跑", next: 3, points: 5, mood: "错误选择", tag: "dangerous" }
          ]
        },
        {
          id: 2,
          text: "火灾报警器响了！自动喷淋系统启动！\n\n但浓烟正在快速蔓延，能见度越来越低...\n\n你必须带领家人和附近顾客逃生。",
          effect: "smoke",
          options: [
            { text: "🚶 低姿弯腰，沿墙走向安全出口", next: 4, points: 30, mood: "正确逃生", tag: "correct" },
            { text: "🛗 乘坐电梯快速下楼", next: 5, points: 0, mood: "致命错误", tag: "deadly" }
          ]
        },
        {
          id: 3,
          text: "你冲向电梯，但电梯门打开的瞬间——\n\n浓烟从电梯井涌出！电梯可能随时断电！\n\n「不能坐电梯！走楼梯！」有人大喊。",
          effect: "danger",
          options: [
            { text: "🚪 改走消防楼梯", next: 4, points: 20, mood: "及时纠正", tag: "ok" },
            { text: "⏳ 还是等等看", next: 5, points: 0, mood: "犹豫致命", tag: "deadly" }
          ]
        },
        {
          id: 4,
          text: "你们低姿弯腰，用湿毛巾捂住口鼻...\n\n但前方通道被大火封堵了！\n\n浓烟越来越浓，有人开始咳嗽、恐慌...",
          effect: "blocked",
          options: [
            { text: "🔄 寻找备用疏散通道", next: 6, points: 25, mood: "冷静寻找", tag: "correct" },
            { text: "💨 冲过火海", next: 5, points: 0, mood: "盲目冒险", tag: "deadly" }
          ]
        },
        {
          id: 5,
          text: "很遗憾...\n\n在火灾中，错误的选择往往意味着致命的后果。\n\n但这是一次学习的机会，让我们重新来过。",
          effect: "fail",
          options: [
            { text: "🔄 重新开始，学习正确的逃生方法", next: "retry", points: 0, mood: "重新学习", tag: "retry" }
          ]
        },
        {
          id: 6,
          text: "你找到了备用通道！\n\n大家有序撤离，你帮助一位行动不便的老人下楼...\n\n终于，你们冲出了商场，呼吸到了新鲜空气！",
          effect: "escape",
          options: [
            { text: "📞 拨打119，告知被困人员位置", next: "end", points: 35, mood: "专业报警", tag: "correct" }
          ]
        }
      ],
      reward: 220,
      knowledge: [
        "🚨 火灾报警：按下报警器，拨打119",
        "🚫 禁止电梯：火灾时电梯可能断电或成为烟囱",
        "🚶 逃生姿势：低姿弯腰，湿毛巾捂口鼻",
        "🚪 逃生路线：沿墙走，寻找安全出口标志"
      ]
    }
  ],

  _current: 0,
  _sceneIdx: 0,
  _score: 0,
  _mood: 100,
  _choices: [],
  _active: false,
  _completed: [],

  // 初始化
  init() {
    this._current = 0;
    this._sceneIdx = 0;
    this._score = 0;
    this._mood = 100;
    this._choices = [];
    this._active = true;
    this._loadCompleted();
    PageManager.navigate("story");
    this._renderChapterSelect();
  },

  // 加载已完成章节
  _loadCompleted() {
    try {
      const data = JSON.parse(localStorage.getItem('story_completed') || '[]');
      this._completed = data;
    } catch(e) {
      this._completed = [];
    }
  },

  // 保存已完成章节
  _saveCompleted() {
    localStorage.setItem('story_completed', JSON.stringify(this._completed));
  },

  // 渲染章节选择
  _renderChapterSelect() {
    const el = document.getElementById('storyContent');
    if (!el) return;

    let html = `
      <div class="story-v2-container">
        <div class="story-v2-header">
          <div class="story-v2-title">📖 防灾故事</div>
          <div class="story-v2-subtitle">沉浸式体验，做出关键选择</div>
        </div>
        <div class="story-v2-chapters">
    `;

    this._chapters.forEach((ch, i) => {
      const completed = this._completed.includes(ch.id);
      const locked = i > 0 && !this._completed.includes(this._chapters[i-1].id);
      
      html += `
        <div class="story-v2-chapter ${locked ? 'locked' : ''} ${completed ? 'completed' : ''}" 
             onclick="${locked ? '' : `StoryV2Engine.startChapter(${i})`}"
             style="background: ${ch.bg};">
          <div class="chapter-icon">${ch.icon}</div>
          <div class="chapter-content">
            <div class="chapter-title">${ch.title}</div>
            <div class="chapter-desc">${ch.desc}</div>
            <div class="chapter-reward">🏆 ${ch.reward} 分</div>
          </div>
          ${completed ? '<div class="chapter-badge">✅ 已完成</div>' : ''}
          ${locked ? '<div class="chapter-badge">🔒 未解锁</div>' : ''}
        </div>
      `;
    });

    html += `
        </div>
        <div class="story-v2-footer">
          <div class="story-v2-tip">💡 每个选择都会影响故事走向</div>
        </div>
      </div>
    `;

    el.innerHTML = html;
  },

  // 开始章节
  startChapter(idx) {
    this._current = idx;
    this._sceneIdx = 0;
    this._score = 0;
    this._mood = 100;
    this._choices = [];
    this._renderScene();
  },

  // 渲染场景
  _renderScene() {
    const chapter = this._chapters[this._current];
    const scene = chapter.scenes[this._sceneIdx];
    const el = document.getElementById('storyContent');
    if (!el) return;

    // 应用背景效果
    document.querySelector('.story-v2-container').style.background = chapter.bg;

    let html = `
      <div class="story-v2-container" style="background: ${chapter.bg};">
        <div class="story-v2-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(this._sceneIdx + 1) / chapter.scenes.length * 100}%"></div>
          </div>
          <div class="progress-text">${this._sceneIdx + 1} / ${chapter.scenes.length}</div>
        </div>
        
        <div class="story-v2-scene">
          <div class="scene-chapter">${chapter.icon} ${chapter.title}</div>
          <div class="scene-text ${scene.effect ? 'effect-' + scene.effect : ''}">${scene.text.replace(/\n/g, '<br>')}</div>
        </div>

        <div class="story-v2-options">
    `;

    scene.options.forEach((opt, i) => {
      html += `
        <div class="story-v2-option ${opt.tag || ''}" onclick="StoryV2Engine.choose(${i})">
          <div class="option-text">${opt.text}</div>
        </div>
      `;
    });

    html += `
        </div>
        
        <div class="story-v2-status">
          <div class="status-item">
            <span class="status-label">得分</span>
            <span class="status-value">${this._score}</span>
          </div>
          <div class="status-item">
            <span class="status-label">状态</span>
            <span class="status-value mood">${scene.options[0]?.mood || '正常'}</span>
          </div>
        </div>
      </div>
    `;

    el.innerHTML = html;

    // 应用特效
    if (scene.effect) {
      this._applyEffect(scene.effect);
    }
  },

  // 应用场景特效
  _applyEffect(effect) {
    const container = document.querySelector('.story-v2-container');
    
    switch(effect) {
      case 'shake':
      case 'quake':
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 1000);
        break;
      case 'fire':
        container.classList.add('fire-glow');
        break;
      case 'flood':
      case 'rain':
        container.classList.add('rain');
        break;
      case 'wind':
      case 'typhoon':
        container.classList.add('wind');
        break;
    }
  },

  // 做出选择
  choose(optIdx) {
    const chapter = this._chapters[this._current];
    const scene = chapter.scenes[this._sceneIdx];
    const option = scene.options[optIdx];

    // 记录选择
    this._choices.push({
      scene: this._sceneIdx,
      choice: optIdx,
      points: option.points,
      tag: option.tag
    });

    // 更新分数
    this._score += option.points;

    // 处理特殊标签
    if (option.next === 'retry') {
      this.startChapter(this._current);
      return;
    }

    if (option.next === 'end') {
      this._chapterComplete();
      return;
    }

    // 进入下一场景
    this._sceneIdx++;
    if (this._sceneIdx >= chapter.scenes.length) {
      this._chapterComplete();
    } else {
      this._renderScene();
    }
  },

  // 章节完成
  _chapterComplete() {
    const chapter = this._chapters[this._current];
    
    // 标记完成
    if (!this._completed.includes(chapter.id)) {
      this._completed.push(chapter.id);
      this._saveCompleted();
    }

    // 保存分数
    const totalCoins = (GameState.get('coins') || 0) + Math.floor(this._score / 2);
    GameState.set('coins', totalCoins);

    const el = document.getElementById('storyContent');
    if (!el) return;

    let html = `
      <div class="story-v2-container story-complete" style="background: ${chapter.bg};">
        <div class="complete-header">
          <div class="complete-icon">🎉</div>
          <div class="complete-title">${chapter.title} 完成！</div>
        </div>
        
        <div class="complete-stats">
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-value">${this._score}</div>
            <div class="stat-label">总得分</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-value">+${Math.floor(this._score / 2)}</div>
            <div class="stat-label">获得金币</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-value">${this._choices.length}</div>
            <div class="stat-label">做出选择</div>
          </div>
        </div>

        <div class="complete-knowledge">
          <div class="knowledge-title">📚 本章学到的防灾知识</div>
          <div class="knowledge-list">
            ${chapter.knowledge.map(k => `<div class="knowledge-item">${k}</div>`).join('')}
          </div>
        </div>

        <div class="complete-actions">
          <div class="action-btn primary" onclick="StoryV2Engine._renderChapterSelect()">
            📖 选择其他章节
          </div>
          <div class="action-btn" onclick="StoryV2Engine.startChapter(${this._current})">
            🔄 重新挑战
          </div>
          <div class="action-btn" onclick="PageManager.navigate('menu')">
            🏠 返回主页
          </div>
        </div>
      </div>
    `;

    el.innerHTML = html;

    // 撒花特效
    if (typeof CoinRainEngine !== 'undefined') {
      CoinRainEngine.rain(Math.floor(this._score / 4), `+${Math.floor(this._score / 2)} 🪙`);
    }
  }
};

// 覆盖原有的StoryEngine
if (typeof StoryEngine !== 'undefined') {
  StoryEngine.init = function() { StoryV2Engine.init(); };
}
