/**
 * 故事模式 V4 - 电子书阅读体验
 * 精美的翻页效果 + 章节封面 + 知识点卡片
 */
const StoryV2Engine = {
  _chapters: [
    {
      id: 1,
      title: "地震来袭",
      icon: "🌍",
      color: "#3b82f6",
      cover: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
      summary: "城市突发6.5级地震，防灾指挥官如何带领市民安全撤离？",
      content: `2026年6月15日，下午3:27。

你正在市政厅的防灾指挥中心值班。窗外阳光明媚，一切看起来都很平静。

突然——大地开始剧烈摇晃！

桌上的水杯摔落在地，天花板上的灯管疯狂摆动。警报声骤然响起。

「报告！震级6.5，震中位于市区东部15公里处！」

你迅速按下红色按钮，全市的应急广播系统启动。

「各位市民请注意，现在发生地震，请保持冷静，按照演练路线有序撤离到空旷地带！」

警报声响彻整座城市。你通过监控看到，市民们开始有序地向公园和操场撤离。

⚠️ 突然，大地再次剧烈摇晃！

余震来了！建筑物开始二次倒塌，玻璃碎片四处飞溅。

你通过广播大喊：「蹲下！护头！抓住固定物！」

所有人立刻采取避险姿势，躲在桌子下、护住头部、抓住身边的固定物。

余震终于过去了。

你清点人数，确认所有人都安全。救援队的直升机也赶到了。

「指挥官，干得好！因为你的及时指挥，全市零伤亡！」

你长舒一口气，窗外的城市虽然满目疮痍，但人们都活着。`,
      knowledge: [
        { icon: "🔔", title: "地震预警", desc: "应急广播、警报声是主要预警方式" },
        { icon: "🏃", title: "撤离原则", desc: "有序、不推挤、走安全通道" },
        { icon: "🧎", title: "避险姿势", desc: "蹲下、护头、抓牢固定物" },
        { icon: "📦", title: "应急物资", desc: "水、食物、急救包、手电筒" },
        { icon: "⏱️", title: "余震危险", desc: "主震后可能有余震，需持续避险" }
      ]
    },
    {
      id: 2,
      title: "洪水围城",
      icon: "🌊",
      color: "#06b6d4",
      cover: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
      summary: "连续暴雨导致河水暴涨，洪水正在涌入居民区。",
      content: `暴雨已经持续了三天三夜。

你接到紧急报告：上游水库水位已超过警戒线，随时可能溃坝。

河对岸的低洼居民区还在沉睡中。

你果断启动防洪应急预案。全市防洪系统启动，低洼地区的警报器开始鸣响。

「全体市民注意！洪水预警！请立即向高处转移！」

你组织救援队伍，优先转移老人、儿童和残疾人。

冲锋舟在洪水中穿梭，搜救被困群众。一位母亲抱着孩子，被从楼顶救下。

洪水还在上涨。

你发现一栋居民楼里还有被困的家庭，水位已经到二楼了。

他们正在窗口挥舞着鲜艳的衣服求救。

你立即调派冲锋舟从水路接近，成功将所有被困居民救出。

所有被困居民都被成功救出。

你组织大家在临时安置点休息，分发热食和干衣物。

「谢谢你...如果不是你，我们可能就...」一位母亲抱着孩子哽咽道。

你拍拍她的肩膀：「没事了，安全了。」`,
      knowledge: [
        { icon: "🌊", title: "洪水预警", desc: "蓝色→黄色→橙色→红色" },
        { icon: "🏔️", title: "避险原则", desc: "向高处转移，不涉水过河" },
        { icon: "🚤", title: "救援方式", desc: "冲锋舟、绳索、直升机" },
        { icon: "🆘", title: "求救信号", desc: "鲜艳衣物、手电筒、哨子" },
        { icon: "👴", title: "优先原则", desc: "老人、儿童、残疾人优先转移" }
      ]
    },
    {
      id: 3,
      title: "台风登陆",
      icon: "🌀",
      color: "#8b5cf6",
      cover: "linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)",
      summary: "超强台风「海神」即将登陆，风力达到17级。",
      content: `气象台发布台风红色预警。

超强台风「海神」将在6小时后登陆，中心风力17级，阵风18级。

这是近50年来最强的台风。

你立即召开紧急防灾会议：全市进入紧急状态！开放所有避难所！渔船回港！户外施工全部停止！

你调派大巴疏散海边游客到内陆。

但台风提前登陆了。

狂风呼啸，大树被连根拔起，广告牌在空中飞舞。

你接到报告：有人不顾警告在海边观浪。

你立即强制撤离，生命至上。

台风眼经过了。

突然风平浪静，一些人跑出去查看情况。

但你清楚——台风眼过后，狂风会从反方向再次袭来。

你紧急广播：「不要外出！台风眼还没过！」

果然，几分钟后狂风再次袭来，比之前更猛烈。

台风终于过去了。

城市一片狼藉，但因为你提前部署，伤亡降到了最低。

「指挥官，全市零死亡！这是奇迹！」

你摇摇头：「不是奇迹，是科学防灾的力量。」`,
      knowledge: [
        { icon: "🌀", title: "台风预警", desc: "蓝→黄→橙→红（红色最严重）" },
        { icon: "🏠", title: "防风措施", desc: "加固门窗、收回户外物品" },
        { icon: "🌊", title: "台风眼", desc: "短暂平静后狂风再来" },
        { icon: "⚠️", title: "危险行为", desc: "海边观浪、台风中外出" },
        { icon: "🚌", title: "疏散原则", desc: "提前疏散、强制撤离" }
      ]
    },
    {
      id: 4,
      title: "火灾逃生",
      icon: "🔥",
      color: "#ef4444",
      cover: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
      summary: "商场突发大火，浓烟滚滚，数百人被困。",
      content: `周六下午，阳光购物中心人山人海。

你正在三楼陪家人逛街，突然——

「着火了！着火了！」尖叫声从一楼传来。

浓烟迅速向上蔓延。

你立即按下火灾报警器，自动喷淋系统启动。

但浓烟正在快速蔓延，能见度越来越低。

你带领家人和附近顾客低姿弯腰，沿墙走向安全出口。

「不要坐电梯！走楼梯！」你大喊。

用湿毛巾捂住口鼻，减少有毒烟雾的吸入。

前方通道被大火封堵了。

浓烟越来越浓，有人开始咳嗽、恐慌。

你冷静地寻找备用疏散通道，发现了一个消防楼梯。

你帮助一位行动不便的老人下楼，大家有序撤离。

终于，你们冲出了商场，呼吸到了新鲜空气。

消防车已经赶到，消防员正在灭火。

你拨打119，告知被困人员位置。

「多亏了你，大家都安全了。」家人紧紧握着你的手。`,
      knowledge: [
        { icon: "🚨", title: "火灾报警", desc: "按下报警器，拨打119" },
        { icon: "🚫", title: "禁止电梯", desc: "火灾时电梯可能断电或成为烟囱" },
        { icon: "🚶", title: "逃生姿势", desc: "低姿弯腰，湿毛巾捂口鼻" },
        { icon: "🚪", title: "逃生路线", desc: "沿墙走，寻找安全出口标志" },
        { icon: "🔄", title: "备用通道", desc: "主通道被封时寻找消防楼梯" }
      ]
    }
  ],

  _current: -1,
  _page: 0,
  _completed: [],

  init() {
    this._loadCompleted();
    PageManager.navigate("story");
    this._showLibrary();
  },

  _loadCompleted() {
    try {
      this._completed = JSON.parse(localStorage.getItem('story_completed_v4') || '[]');
    } catch(e) {
      this._completed = [];
    }
  },

  _saveCompleted() {
    localStorage.setItem('story_completed_v4', JSON.stringify(this._completed));
  },

  _showLibrary() {
    const el = document.getElementById('storyContent');
    if (!el) return;

    let html = `
      <div class="story-library">
        <div class="library-header">
          <div class="library-icon">📚</div>
          <h1 class="library-title">防灾故事馆</h1>
          <p class="library-subtitle">在故事中学习防灾知识</p>
        </div>
        <div class="library-grid">
    `;

    this._chapters.forEach((ch, i) => {
      const completed = this._completed.includes(ch.id);
      const locked = i > 0 && !this._completed.includes(this._chapters[i-1].id);
      
      html += `
        <div class="story-book ${locked ? 'locked' : ''} ${completed ? 'completed' : ''}" 
             style="--book-color: ${ch.color};"
             onclick="${locked ? '' : `StoryV2Engine.openBook(${i})`}">
          <div class="book-cover" style="background: ${ch.cover};">
            <div class="book-icon">${ch.icon}</div>
            <div class="book-title">${ch.title}</div>
            ${completed ? '<div class="book-badge">✅</div>' : ''}
            ${locked ? '<div class="book-badge">🔒</div>' : ''}
          </div>
          <div class="book-info">
            <div class="book-summary">${ch.summary}</div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    el.innerHTML = html;
  },

  openBook(idx) {
    this._current = idx;
    this._page = 0;
    this._showPage();
  },

  _showPage() {
    const chapter = this._chapters[this._current];
    const el = document.getElementById('storyContent');
    if (!el) return;

    // 分割内容为段落
    const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());
    const totalPages = paragraphs.length + 1; // +1 for knowledge page

    let html = `
      <div class="story-reader" style="--chapter-color: ${chapter.color};">
        <div class="reader-header">
          <div class="reader-chapter">${chapter.icon} ${chapter.title}</div>
          <div class="reader-progress">
            <div class="progress-dots">
              ${Array(totalPages).fill(0).map((_, i) => `<span class="dot ${i <= this._page ? 'active' : ''}"></span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="reader-content">
    `;

    if (this._page < paragraphs.length) {
      // 显示文本段落
      const text = paragraphs[this._page];
      html += `<div class="story-paragraph">${text.replace(/\n/g, '<br>')}</div>`;
    } else {
      // 显示知识点页面
      html += `
        <div class="knowledge-page">
          <div class="knowledge-header">
            <div class="knowledge-icon">📖</div>
            <h2>本章知识点</h2>
          </div>
          <div class="knowledge-cards">
            ${chapter.knowledge.map(k => `
              <div class="knowledge-card">
                <div class="card-icon">${k.icon}</div>
                <div class="card-content">
                  <div class="card-title">${k.title}</div>
                  <div class="card-desc">${k.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += `
        </div>
        
        <div class="reader-footer">
          ${this._page > 0 ? `<button class="btn-prev" onclick="StoryV2Engine.prevPage()">← 上一页</button>` : `<button class="btn-back" onclick="StoryV2Engine._showLibrary()">← 返回</button>`}
          ${this._page < totalPages - 1 ? `<button class="btn-next" onclick="StoryV2Engine.nextPage()">下一页 →</button>` : `<button class="btn-finish" onclick="StoryV2Engine.finishChapter()">完成 ✓</button>`}
        </div>
      </div>
    `;

    el.innerHTML = html;
  },

  prevPage() {
    if (this._page > 0) {
      this._page--;
      this._showPage();
    }
  },

  nextPage() {
    const chapter = this._chapters[this._current];
    const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());
    const totalPages = paragraphs.length + 1;
    
    if (this._page < totalPages - 1) {
      this._page++;
      this._showPage();
    }
  },

  finishChapter() {
    const chapter = this._chapters[this._current];
    
    if (!this._completed.includes(chapter.id)) {
      this._completed.push(chapter.id);
      this._saveCompleted();
    }

    this._showLibrary();
  }
};

// 完全覆盖旧的 StoryEngine
window.StoryEngine = StoryV2Engine;
