/**
 * 故事模式 V3 - 纯阅读模式
 * 像看书一样，在故事中学习防灾知识
 */
const StoryV2Engine = {
  _chapters: [
    {
      id: 1,
      title: "第一章：地震来袭",
      icon: "🌍",
      bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      desc: "城市突然发生6.5级地震，防灾指挥官如何带领市民安全撤离？",
      scenes: [
        {
          text: "2026年6月15日，下午3:27。\n\n你正在市政厅的防灾指挥中心值班，窗外阳光明媚，一切看起来都很平静。\n\n突然——大地开始剧烈摇晃！桌上的水杯摔落在地，天花板上的灯管疯狂摆动。\n\n「报告！震级6.5，震中位于市区东部15公里处！」",
          effect: "shake"
        },
        {
          text: "你迅速按下红色按钮，全市的应急广播系统启动！\n\n「各位市民请注意，现在发生地震，请保持冷静，按照演练路线有序撤离到空旷地带！」\n\n警报声响彻整座城市。你通过监控看到，市民们开始有序地向公园和操场撤离。",
          effect: "alarm"
        },
        {
          text: "⚠️ 突然，大地再次剧烈摇晃！\n\n余震来了！建筑物开始二次倒塌，玻璃碎片四处飞溅...\n\n你通过广播大喊：「蹲下！护头！抓住固定物！」\n\n所有人立刻采取避险姿势，躲在桌子下、护住头部、抓住身边的固定物。",
          effect: "quake"
        },
        {
          text: "余震终于过去了...\n\n你清点人数，确认所有人都安全。救援队的直升机也赶到了！\n\n「指挥官，干得好！因为你的及时指挥，全市零伤亡！」\n\n你长舒一口气，窗外的城市虽然满目疮痍，但人们都活着。",
          effect: "relief"
        }
      ],
      knowledge: [
        "🔔 地震预警信号：应急广播、警报声",
        "🏃 撤离原则：有序、不推挤、走安全通道",
        "🧎 避险姿势：蹲下、护头、抓牢固定物",
        "📦 应急物资：水、食物、急救包、手电筒",
        "⏱️ 余震危险：主震后可能有余震，需持续避险"
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
          text: "暴雨已经持续了三天三夜...\n\n你接到紧急报告：上游水库水位已超过警戒线，随时可能溃坝！\n\n河对岸的低洼居民区还在沉睡中...\n\n你果断启动防洪应急预案，全市防洪系统启动，低洼地区的警报器开始鸣响。",
          effect: "rain"
        },
        {
          text: "「全体市民注意！洪水预警！请立即向高处转移！」\n\n你组织救援队伍，优先转移老人、儿童和残疾人。\n\n冲锋舟在洪水中穿梭，搜救被困群众。\n\n一位母亲抱着孩子，被从楼顶救下。",
          effect: "flood"
        },
        {
          text: "洪水还在上涨！\n\n你发现一栋居民楼里还有被困的家庭，水位已经到二楼了！\n\n他们正在窗口挥舞着鲜艳的衣服求救...\n\n你立即调派冲锋舟从水路接近，成功将所有被困居民救出。",
          effect: "danger"
        },
        {
          text: "所有被困居民都被成功救出！\n\n你组织大家在临时安置点休息，分发热食和干衣物。\n\n「谢谢你...如果不是你，我们可能就...」一位母亲抱着孩子哽咽道。\n\n你拍拍她的肩膀：「没事了，安全了。」",
          effect: "warmth"
        }
      ],
      knowledge: [
        "🌊 洪水预警：蓝色→黄色→橙色→红色",
        "🏔️ 避险原则：向高处转移，不涉水过河",
        "🚤 救援方式：冲锋舟、绳索、直升机",
        "🆘 求救信号：鲜艳衣物、手电筒、哨子",
        "👴 优先原则：老人、儿童、残疾人优先转移"
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
          text: "气象台发布台风红色预警！\n\n超强台风「海神」将在6小时后登陆，中心风力17级，阵风18级！\n\n这是近50年来最强的台风...\n\n你立即召开紧急防灾会议：全市进入紧急状态！开放所有避难所！渔船回港！户外施工全部停止！",
          effect: "wind"
        },
        {
          text: "你调派大巴疏散海边游客到内陆。\n\n但台风提前登陆了！！\n\n狂风呼啸，大树被连根拔起，广告牌在空中飞舞...\n\n你接到报告：有人不顾警告在海边观浪！你立即强制撤离，生命至上！",
          effect: "typhoon"
        },
        {
          text: "台风眼经过了！\n\n突然风平浪静，一些人跑出去查看情况...\n\n但你清楚——台风眼过后，狂风会从反方向再次袭来！\n\n你紧急广播：「不要外出！台风眼还没过！」\n\n果然，几分钟后狂风再次袭来，比之前更猛烈。",
          effect: "eye"
        },
        {
          text: "台风终于过去了...\n\n城市一片狼藉，但因为你提前部署，伤亡降到了最低。\n\n「指挥官，全市零死亡！这是奇迹！」\n\n你摇摇头：「不是奇迹，是科学防灾的力量。」",
          effect: "victory"
        }
      ],
      knowledge: [
        "🌀 台风预警：蓝→黄→橙→红（红色最严重）",
        "🏠 防风措施：加固门窗、收回户外物品",
        "🌊 台风眼：短暂平静后狂风再来",
        "⚠️ 危险行为：海边观浪、台风中外出",
        "🚌 疏散原则：提前疏散、强制撤离"
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
          text: "周六下午，阳光购物中心人山人海。\n\n你正在三楼陪家人逛街，突然——\n\n「着火了！着火了！」尖叫声从一楼传来。\n\n浓烟 rapidly 向上蔓延，你立即按下火灾报警器，自动喷淋系统启动！",
          effect: "fire"
        },
        {
          text: "但浓烟正在快速蔓延，能见度越来越低...\n\n你带领家人和附近顾客低姿弯腰，沿墙走向安全出口。\n\n「不要坐电梯！走楼梯！」你大喊。\n\n用湿毛巾捂住口鼻，减少有毒烟雾的吸入。",
          effect: "smoke"
        },
        {
          text: "前方通道被大火封堵了！\n\n浓烟越来越浓，有人开始咳嗽、恐慌...\n\n你冷静地寻找备用疏散通道，发现了一个消防楼梯。\n\n你帮助一位行动不便的老人下楼，大家有序撤离。",
          effect: "blocked"
        },
        {
          text: "终于，你们冲出了商场，呼吸到了新鲜空气！\n\n消防车已经赶到，消防员正在灭火。\n\n你拨打119，告知被困人员位置。\n\n「多亏了你，大家都安全了。」家人紧紧握着你的手。",
          effect: "escape"
        }
      ],
      knowledge: [
        "🚨 火灾报警：按下报警器，拨打119",
        "🚫 禁止电梯：火灾时电梯可能断电或成为烟囱",
        "🚶 逃生姿势：低姿弯腰，湿毛巾捂口鼻",
        "🚪 逃生路线：沿墙走，寻找安全出口标志",
        "🔄 备用通道：主通道被封时寻找消防楼梯"
      ]
    }
  ],

  _current: 0,
  _sceneIdx: 0,
  _active: false,
  _completed: [],

  init() {
    this._current = 0;
    this._sceneIdx = 0;
    this._active = true;
    this._loadCompleted();
    PageManager.navigate("story");
    this._renderChapterSelect();
  },

  _loadCompleted() {
    try {
      const data = JSON.parse(localStorage.getItem('story_completed') || '[]');
      this._completed = data;
    } catch(e) {
      this._completed = [];
    }
  },

  _saveCompleted() {
    localStorage.setItem('story_completed', JSON.stringify(this._completed));
  },

  _renderChapterSelect() {
    const el = document.getElementById('storyContent');
    if (!el) return;

    let html = `
      <div class="story-v2-container">
        <div class="story-v2-header">
          <div class="story-v2-title">📖 防灾故事</div>
          <div class="story-v2-subtitle">在故事中学习防灾知识</div>
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
          </div>
          ${completed ? '<div class="chapter-badge">✅ 已读</div>' : ''}
          ${locked ? '<div class="chapter-badge">🔒 未解锁</div>' : ''}
        </div>
      `;
    });

    html += `
        </div>
        <div class="story-v2-footer">
          <div class="story-v2-tip">💡 像看书一样，在故事中学习防灾知识</div>
        </div>
      </div>
    `;

    el.innerHTML = html;
  },

  startChapter(idx) {
    this._current = idx;
    this._sceneIdx = 0;
    this._renderScene();
  },

  _renderScene() {
    const chapter = this._chapters[this._current];
    const scene = chapter.scenes[this._sceneIdx];
    const el = document.getElementById('storyContent');
    if (!el) return;

    const isLast = this._sceneIdx >= chapter.scenes.length - 1;

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

        <div class="story-v2-next">
          <div class="next-btn" onclick="StoryV2Engine.nextScene()">
            ${isLast ? '📚 查看知识点' : '📖 继续阅读'} →
          </div>
        </div>
      </div>
    `;

    el.innerHTML = html;

    if (scene.effect) {
      this._applyEffect(scene.effect);
    }
  },

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

  nextScene() {
    const chapter = this._chapters[this._current];
    this._sceneIdx++;
    
    if (this._sceneIdx >= chapter.scenes.length) {
      this._chapterComplete();
    } else {
      this._renderScene();
    }
  },

  _chapterComplete() {
    const chapter = this._chapters[this._current];
    
    if (!this._completed.includes(chapter.id)) {
      this._completed.push(chapter.id);
      this._saveCompleted();
    }

    const el = document.getElementById('storyContent');
    if (!el) return;

    let html = `
      <div class="story-v2-container story-complete" style="background: ${chapter.bg};">
        <div class="complete-header">
          <div class="complete-icon">📖</div>
          <div class="complete-title">${chapter.title} 阅读完成</div>
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
            🔄 重新阅读
          </div>
          <div class="action-btn" onclick="PageManager.navigate('menu')">
            🏠 返回主页
          </div>
        </div>
      </div>
    `;

    el.innerHTML = html;
  }
};

if (typeof StoryEngine !== 'undefined') {
  StoryEngine.init = function() { StoryV2Engine.init(); };
}
