// 故事模式 V5 - 纯阅读电子书
const StoryBookEngine = {
  _book: null,
  _chapter: 0,
  _page: 0,
  _totalPages: 0,
  
  init() {
    PageManager.navigate('story-book');
    setTimeout(() => this._renderLibrary(), 300);
  },
  
  _renderLibrary() {
    const container = document.getElementById('storyBookContent');
    if (!container) return;
    
    const books = [
      { id: 1, title: '地震求生记', icon: '🌍', color: '#E74C3C', chapters: 5 },
      { id: 2, title: '洪水逃生录', icon: '🌊', color: '#3498DB', chapters: 5 },
      { id: 3, title: '台风防御战', icon: '🌀', color: '#9B59B6', chapters: 5 },
      { id: 4, title: '火灾自救指南', icon: '🔥', color: '#E67E22', chapters: 5 }
    ];
    
    let html = `
      <div style="text-align:center;margin-bottom:30px;">
        <h2 style="font-size:24px;color:#fff;margin-bottom:8px;">📚 故事书库</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;">选择一本故事书，开始阅读之旅</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:500px;margin:0 auto;">
    `;
    
    books.forEach(book => {
      html += `
        <div onclick="StoryBookEngine.openBook(${book.id})" style="
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:16px;
          padding:24px 16px;
          text-align:center;
          cursor:pointer;
          transition:all 0.3s;
        " onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="font-size:48px;margin-bottom:12px;">${book.icon}</div>
          <div style="font-size:16px;color:#fff;font-weight:600;margin-bottom:4px;">${book.title}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.5);">${book.chapters}个章节</div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  },
  
  openBook(bookId) {
    this._book = this._getBookData(bookId);
    this._chapter = 0;
    this._page = 0;
    this._renderChapter();
  },
  
  _getBookData(bookId) {
    const books = {
      1: {
        title: '地震求生记',
        icon: '🌍',
        chapters: [
          {
            title: '第一章：突如其来的震动',
            pages: [
              '2026年6月15日，下午3:27。\n\n你正在市政厅办公，突然大地剧烈晃动，桌上的水杯掉落在地，发出清脆的响声。\n\n窗外的建筑物开始摇晃，灰尘从天花板簌簌落下。',
              '你冷静地站起身，迅速判断情况——这是一次6.5级地震。\n\n作为防灾指挥官，你知道接下来的每一秒都至关重要。\n\n你立即启动了应急广播系统，全市响起了疏散警报。',
              '市民们听到警报后开始有序撤离。\n\n你通过广播指导大家：\n• 如果在室内，躲在坚固的桌子下\n• 如果在室外，远离建筑物和电线杆\n• 如果在开车，立即靠边停车',
              '地震持续了约30秒后逐渐平息。\n\n你立即组织救援队伍，开始检查伤亡情况和建筑损毁程度。\n\n由于预警及时，市民们大多安全撤离到了空旷地带。',
              '📚 地震知识总结\n\n1. 地震发生时，保持冷静是最重要的\n2. 室内避险：躲在坚固家具下，保护头部\n3. 室外避险：远离建筑物、电线杆等高大物体\n4. 震后要注意余震，不要立即返回建筑物内\n5. 准备应急包，包含水、食物、药品、手电筒等'
            ]
          },
          {
            title: '第二章：余震与救援',
            pages: [
              '地震过去一小时后，你接到了报告：\n\n• 市区有3处建筑倒塌\n• 约50人被困\n• 多处道路出现裂缝\n\n你立即调配救援力量，优先处理最危险的情况。',
              '突然，一阵强烈的余震袭来！\n\n你通过广播紧急提醒市民：\n"注意！余震来了！请大家保持冷静，继续留在空旷地带，远离建筑物！"',
              '余震持续了10秒后结束。\n\n幸运的是，由于疏散及时，没有造成新的伤亡。\n\n你继续指挥救援工作，重点搜救被困人员。',
              '救援队伍在一处倒塌的建筑中发现了被困者。\n\n你指导救援人员：\n• 先用生命探测仪确定位置\n• 从侧面小心挖掘，避免二次坍塌\n• 救出后立即进行医疗检查',
              '📚 地震救援知识\n\n1. 余震可能在地震后数小时甚至数天内发生\n2. 救援时要优先处理最危险的情况\n3. 搜救被困者时要小心，避免二次伤害\n4. 震后要注意防疫，确保饮用水安全\n5. 心理疏导同样重要，帮助受灾者走出阴影'
            ]
          }
        ]
      },
      2: {
        title: '洪水逃生录',
        icon: '🌊',
        chapters: [
          {
            title: '第一章：暴雨来袭',
            pages: [
              '连续三天的暴雨让河流水位急剧上涨。\n\n你作为防灾指挥官，密切关注着水情变化。\n\n气象台发布红色预警：未来24小时还将有特大暴雨。',
              '下午4点，你接到紧急报告：\n\n上游水库水位已超过警戒线，有溃坝风险！\n\n下游3个村庄、约2000名居民需要立即转移！',
              '你立即启动应急预案：\n\n• 拉响防洪警报\n• 组织村民向高地转移\n• 调派救援车辆和船只\n• 开放学校、体育馆作为临时安置点',
              '转移工作紧张进行中。\n\n你通过广播指导村民：\n• 携带重要证件和必需品\n• 关闭煤气和电源\n• 不要贪恋财物，生命最重要',
              '📚 洪水知识总结\n\n1. 关注气象预警，提前做好准备\n2. 洪水来临时，迅速向高地转移\n3. 不要试图徒步或驾车通过洪水\n4. 远离电力设施，防止触电\n5. 洪水后要注意防疫，不喝生水'
            ]
          }
        ]
      },
      3: {
        title: '台风防御战',
        icon: '🌀',
        chapters: [
          {
            title: '第一章：台风预警',
            pages: [
              '气象台发布台风橙色预警：\n\n超强台风"海燕"正在向本地靠近，预计12小时后登陆。\n\n风力将达到14-16级，伴有特大暴雨。',
              '你立即召开紧急会议，部署防台工作：\n\n• 停止所有户外活动\n• 学校停课、企业停工\n• 加固易被风吹动的搭建物\n• 准备充足的应急物资',
              '你通过媒体向市民发布防台指南：\n\n• 关好门窗，用胶带在玻璃上贴成米字形\n• 不要靠近窗户\n• 储备3天的食物和饮用水\n• 给手机充满电',
              '台风眼越来越近，风力开始增强。\n\n你叮嘱值班人员：\n"大家辛苦了！今晚我们要坚守岗位，确保市民安全。有任何紧急情况立即上报！"',
              '📚 台风知识总结\n\n1. 台风来临前要做好充分准备\n2. 关好门窗，远离玻璃\n3. 不要在台风期间外出\n4. 如果在室外，寻找坚固的建筑物躲避\n5. 台风过后要注意防疫和安全'
            ]
          }
        ]
      },
      4: {
        title: '火灾自救指南',
        icon: '🔥',
        chapters: [
          {
            title: '第一章：火情突发',
            pages: [
              '深夜11点，一阵急促的警报声把你惊醒。\n\n你冲出房间，发现楼道里浓烟滚滚。\n\n隔壁单元发生了火灾！',
              '你迅速判断情况：\n\n• 火势还在初期\n• 楼道已有浓烟\n• 需要立即疏散居民\n\n你大声喊道："大家不要慌！用湿毛巾捂住口鼻，弯腰低姿下楼！"',
              '你组织楼内居民有序疏散：\n\n• 不要乘坐电梯\n• 用湿毛巾捂住口鼻\n• 弯腰低姿前行\n• 摸门把手判断温度，烫手就不要开门',
              '疏散过程中，有人报告：\n"3楼还有人没出来！"\n\n你立即通知赶到的消防员，并指导被困者：\n"用湿布堵住门缝，在窗口呼救，等待救援！"',
              '📚 火灾知识总结\n\n1. 发现火情立即报警（119）\n2. 用湿毛巾捂住口鼻，低姿逃生\n3. 不要乘坐电梯\n4. 摸门把手判断温度，烫手不要开门\n5. 身上着火时，就地打滚灭火'
            ]
          }
        ]
      }
    };
    return books[bookId];
  },
  
  _renderChapter() {
    const container = document.getElementById('storyBookContent');
    if (!container) return;
    
    const chapter = this._book.chapters[this._chapter];
    const page = chapter.pages[this._page];
    const totalPages = chapter.pages.length;
    
    let html = `
      <div style="max-width:500px;margin:0 auto;padding:20px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:32px;margin-bottom:8px;">${this._book.icon}</div>
          <h3 style="color:#fff;font-size:18px;margin-bottom:4px;">${this._book.title}</h3>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;">${chapter.title}</p>
        </div>
        
        <div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;min-height:200px;">
          <div style="color:rgba(255,255,255,0.9);font-size:15px;line-height:1.8;white-space:pre-line;">${page}</div>
        </div>
        
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;">
          <div style="color:rgba(255,255,255,0.5);font-size:13px;">
            第 ${this._page + 1} / ${totalPages} 页
          </div>
          <div style="display:flex;gap:12px;">
    `;
    
    if (this._page > 0) {
      html += `<button onclick="StoryBookEngine.prevPage()" style="padding:10px 20px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;">← 上一页</button>`;
    }
    
    if (this._page < totalPages - 1) {
      html += `<button onclick="StoryBookEngine.nextPage()" style="padding:10px 20px;background:linear-gradient(135deg,#667eea,#764ba2);border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:600;">下一页 →</button>`;
    } else if (this._chapter < this._book.chapters.length - 1) {
      html += `<button onclick="StoryBookEngine.nextChapter()" style="padding:10px 20px;background:linear-gradient(135deg,#f093fb,#f5576c);border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:600;">下一章 →</button>`;
    } else {
      html += `<button onclick="StoryBookEngine._renderLibrary()" style="padding:10px 20px;background:linear-gradient(135deg,#4facfe,#00f2fe);border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:600;">✓ 阅读完成</button>`;
    }
    
    html += `
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  },
  
  nextPage() {
    this._page++;
    this._renderChapter();
  },
  
  prevPage() {
    this._page--;
    this._renderChapter();
  },
  
  nextChapter() {
    this._chapter++;
    this._page = 0;
    this._renderChapter();
  }
};

// 覆盖旧的 StoryEngine
window.StoryEngine = StoryBookEngine;
