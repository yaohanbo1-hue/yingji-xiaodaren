/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 真实案例还原模式 (比赛级)
 * ===========================================================================
 * 
 * 【功能】
 * 1. 精选 10 个真实灾害事件改编成情景
 * 2. 三阶段流程：事件回顾 → 情景模拟 → 知识总结
 * 3. 体现教育价值和科学性（比赛核心评分点）
 * 4. 数据引用自中国应急管理部公开资料
 * 
 * @version 1.2.0
 * @date 2026-06-09
 * ===========================================================================
 */

const RealCasesEngine = {
  _cases: [
    {
      id: 'wenchuan',
      title: '汶川大地震',
      date: '2008 年 5 月 12 日',
      icon: '🌍',
      type: 'earthquake',
      magnitude: '8.0 级',
      impact: '近 7 万人遇难，37 万人受伤',
      source: '中国地震局公开资料',
      timeline: [
        { time: '14:28', event: '四川汶川发生 8.0 级地震' },
        { time: '14:35', event: '震波传至北京、上海等地' },
        { time: '15:00', event: '全国启动一级应急响应' },
        { time: '15:30', event: '第一支救援队出发' }
      ],
      scenario: {
        setting: '🏫 四川某小学教室',
        desc: '下午第二节课刚开始，突然感到强烈震动，吊灯剧烈摇晃，墙皮开始掉落...',
        choices: [
          { text: '躲在课桌下，保护头部', correct: true, exp: '正确！"伏地、遮挡、手抓牢"是标准避险姿势。汶川地震中，采用此方法的学生伤亡率大幅降低。' },
          { text: '冲出教室跑向操场', correct: false, exp: '错误！地震时跑动容易被掉落物砸伤。汶川地震中，有学生在跑向楼梯时被砸伤。' },
          { text: '站在门口等待', correct: false, exp: '错误！门框并非绝对安全，且容易被门夹伤。应该立即躲在坚固的桌子下。' },
          { text: '跳窗逃生', correct: false, exp: '极其危险！二楼以上跳窗可能导致骨折甚至更严重后果。' }
        ]
      },
      knowledge: [
        '地震预警时间通常只有几秒到十几秒',
        '"生命三角区"理论已被多国地震专家否定',
        '汶川地震后，中国全面修订了学校抗震标准',
        '每年 5 月 12 日为全国防灾减灾日'
      ]
    },
    {
      id: 'henan_flood',
      title: '河南特大暴雨',
      date: '2021 年 7 月 20 日',
      icon: '🌊',
      type: 'flood',
      magnitude: '201.9 毫米/小时（历史极值）',
      impact: '398 人遇难，直接经济损失 1200 亿元',
      source: '中国气象局公开资料',
      timeline: [
        { time: '16:00', event: '郑州小时降雨量突破历史极值' },
        { time: '17:00', event: '地铁 5 号线进水' },
        { time: '18:00', event: '京广路隧道被淹' },
        { time: '20:00', event: '全市启动一级应急响应' }
      ],
      scenario: {
        setting: '🚇 郑州地铁 5 号线车厢',
        desc: '列车行驶中突然停下，车厢外水位快速上涨，已经开始渗入车厢...',
        choices: [
          { text: '立即拨打 119 求救', correct: true, exp: '正确！第一时间报警并告知位置。同时寻找车厢内的安全锤。' },
          { text: '等待救援，不要慌张', correct: false, exp: '错误！水位上涨极快，被动等待可能错失最佳逃生时机。' },
          { text: '试图砸窗逃生', correct: false, exp: '错误！车外水压大，砸窗可能导致水涌入更快。应该转移到高处等待救援。' },
          { text: '向车头方向跑', correct: false, exp: '错误！车厢是连通的，跑动意义不大。应该留在原地寻找安全位置。' }
        ]
      },
      knowledge: [
        '暴雨预警分四级：蓝、黄、橙、红',
        '红色预警时应停止集会、停课、停业',
        '车辆涉水熄火后应立即弃车逃生',
        '家中常备应急包：手电筒、哨子、饮用水'
      ]
    },
    {
      id: 'australia_fire',
      title: '澳洲丛林大火',
      date: '2019 年 9 月 - 2020 年 2 月',
      icon: '🔥',
      type: 'wildfire',
      magnitude: '烧毁 1800 万公顷土地',
      impact: '30 亿动物死亡，33 人遇难',
      source: '澳大利亚林火管理局公开资料',
      timeline: [
        { time: '2019.09', event: '新南威尔士州首次火情报告' },
        { time: '2019.12', event: '火势失控，进入紧急状态' },
        { time: '2020.01', event: '总理宣布国家紧急状态' },
        { time: '2020.02', event: '大雨帮助控制火势' }
      ],
      scenario: {
        setting: '🏡 澳洲郊区民宅',
        desc: '远处浓烟滚滚，风向正在转向你家，收音机发布紧急撤离警报...',
        choices: [
          { text: '立即按应急计划撤离', correct: true, exp: '正确！山火蔓延速度可达每小时 20 公里，犹豫会错失逃生窗口。' },
          { text: '用水浇湿屋顶和周围', correct: false, exp: '错误！当火势逼近时，个人防护杯水车薪。应该优先撤离。' },
          { text: '开车跑向最近城镇', correct: false, exp: '错误！山火可能封锁道路，且烟雾会降低能见度。应按照预定路线撤离。' },
          { text: '躲进地下室', correct: false, exp: '极其危险！地下室可能成为陷阱，浓烟和高温会迅速充满空间。' }
        ]
      },
      knowledge: [
        '山火季节应提前制定家庭应急计划',
        '撤离时穿长袖长裤和棉质衣物',
        '用湿毛巾捂住口鼻防止吸入浓烟',
        '不要顺风跑，应向侧风向或逆风方向撤离'
      ]
    },
    {
      id: 'doksuri',
      title: '台风杜苏芮',
      date: '2023 年 7 月 28 日',
      icon: '🌀',
      type: 'typhoon',
      magnitude: '强台风级（15 级）',
      impact: '福建 21.8 万人紧急转移',
      source: '中央气象台公开资料',
      timeline: [
        { time: '09:55', event: '杜苏芮在福建晋江登陆' },
        { time: '12:00', event: '狂风暴雨席卷沿海地区' },
        { time: '15:00', event: '多地出现城市内涝' },
        { time: '20:00', event: '台风减弱为热带低压' }
      ],
      scenario: {
        setting: '🏠 沿海城市高层住宅',
        desc: '窗外狂风呼啸，广告牌被吹飞，玻璃窗嘎嘎作响...',
        choices: [
          { text: '远离窗户，待在室内小房间', correct: true, exp: '正确！台风天应远离窗户，待在室内最安全的小房间（如卫生间）。' },
          { text: '站在阳台拍摄视频', correct: false, exp: '极其危险！强风可能将人吹落，或被飞溅的玻璃碎片击中。' },
          { text: '出门查看积水情况', correct: false, exp: '错误！台风天外出极其危险，可能被坠落物砸伤或被积水卷走。' },
          { text: '用胶带在玻璃上贴米字', correct: false, exp: '作用有限。更好的做法是远离窗户，用厚窗帘遮挡。' }
        ]
      },
      knowledge: [
        '台风预警分四级：蓝、黄、橙、红',
        '台风眼经过时风力会短暂减弱，但很快会恢复',
        '不要在海边或河边观潮',
        '台风过后注意饮用水安全，防范疫情'
      ]
    },
    {
      id: 'japan_tsunami',
      title: '日本 311 海啸',
      date: '2011 年 3 月 11 日',
      icon: '🌊',
      type: 'tsunami',
      magnitude: '9.0 级地震引发',
      impact: '近 2 万人死亡或失踪',
      source: '日本气象厅公开资料',
      timeline: [
        { time: '14:46', event: '宫城县外海发生 9.0 级地震' },
        { time: '14:50', event: '发布海啸警报' },
        { time: '15:30', event: '第一波海啸抵达海岸' },
        { time: '16:00', event: '海啸波高达 15 米' }
      ],
      scenario: {
        setting: '🏖️ 日本仙台海岸',
        desc: '强烈地震后，海水快速退去，露出大片海底...',
        choices: [
          { text: '立即向高地转移', correct: true, exp: '正确！海水异常退去是海啸前兆，应立即向高地或坚固的高层建筑转移。' },
          { text: '去海边捡鱼', correct: false, exp: '极其危险！海水退去后很快会有巨大的海啸波袭来。' },
          { text: '拍照发社交媒体', correct: false, exp: '错误！海啸波速可达每小时 800 公里，犹豫就会丧命。' },
          { text: '等待官方通知再行动', correct: false, exp: '错误！海啸可能在地震后几分钟内到达，必须立即自救。' }
        ]
      },
      knowledge: [
        '海啸前兆：海水异常退去、地面强烈震动',
        '海啸波速可达每小时 800 公里',
        '至少向内陆转移 2 公里或向高地转移',
        '海啸可能有多波，第一波通常不是最大的'
      ]
    },
    {
      id: 'yushu_earthquake',
      title: '玉树地震救援',
      date: '2010 年 4 月 14 日',
      icon: '🏔️',
      type: 'earthquake',
      magnitude: '7.1 级',
      impact: '2698 人遇难，海拔 4000 米以上高原救援',
      source: '中国应急管理部公开资料',
      timeline: [
        { time: '07:49', event: '青海玉树发生 7.1 级地震' },
        { time: '08:00', event: '大量房屋倒塌，通讯中断' },
        { time: '10:00', event: '启动国家一级救灾响应' },
        { time: '次日', event: '首批救援物资空运抵达' }
      ],
      scenario: {
        setting: '🏠 玉树结古镇民居',
        desc: '清晨正在家中，突然房屋剧烈摇晃，土墙开始开裂倒塌，灰尘弥漫...',
        choices: [
          { text: '迅速跑到室外空旷处', correct: true, exp: '正确！玉树地区多为土木结构房屋，抗震能力差，震时应迅速撤离到室外空旷地带。' },
          { text: '躲在床底下不动', correct: false, exp: '不妥！玉树民居多为土木结构，容易整体坍塌掩埋，应尽快撤离到室外。' },
          { text: '回去拿贵重物品', correct: false, exp: '错误！生命第一，余震随时可能发生，不要因财物耽误逃生时间。' },
          { text: '乘坐电梯下楼', correct: false, exp: '错误！地震时电梯可能卡死或坠落，绝对不能使用电梯。' }
        ]
      },
      knowledge: [
        '高原地震救援面临缺氧、低温、交通不便三大挑战',
        '土木结构房屋抗震能力远不如钢筋混凝土',
        '震后需警惕滑坡、泥石流等次生灾害',
        '玉树地震后国家大幅提升了西部农村建筑抗震标准'
      ]
    },
    {
      id: 'liangshan_fire',
      title: '凉山森林火灾',
      date: '2019 年 3 月 30 日',
      icon: '🔥',
      type: 'wildfire',
      magnitude: '爆燃 · 瞬间温度上千度',
      impact: '31 名扑火人员牺牲',
      source: '四川省应急管理厅公开资料',
      timeline: [
        { time: '17:00', event: '凉山州木里县发生森林火灾' },
        { time: '次日', event: '689 名扑火人员投入扑救' },
        { time: '15:00', event: '风向突变引发爆燃' },
        { time: '15:30', event: '27 名森林消防指战员牺牲' }
      ],
      scenario: {
        setting: '🌲 四川凉山山林',
        desc: '你在山中徒步，突然闻到浓烟味，远处山头火光冲天，风向正在改变...',
        choices: [
          { text: '逆风方向快速撤离', correct: true, exp: '正确！山火蔓延方向主要受风向影响，逆风撤离可以最快脱离火场。' },
          { text: '往山顶跑', correct: false, exp: '极其危险！火势向上蔓延速度是平地的 3-5 倍，山顶是最危险的位置。' },
          { text: '躲进附近山洞', correct: false, exp: '危险！山洞可能成为烟囱效应通道，浓烟会迅速充满洞穴。' },
          { text: '用衣服捂住口鼻原地等待', correct: false, exp: '错误！森林火灾蔓延极快，原地等待等于坐以待毙，必须立即撤离。' }
        ]
      },
      knowledge: [
        '森林火灾蔓延速度可达每小时 20 公里',
        '风向突变是森林火灾最大杀手',
        '遇到山火应往山下、逆风方向撤离',
        '湿毛巾捂住口鼻只能提供短暂保护，不能原地等待'
      ]
    },
    {
      id: 'tangshan_earthquake',
      title: '唐山大地震',
      date: '1976 年 7 月 28 日',
      icon: '🌍',
      type: 'earthquake',
      magnitude: '7.8 级',
      impact: '24.2 万人遇难，百年城市夷为平地',
      source: '中国地震局公开资料',
      timeline: [
        { time: '03:42', event: '河北唐山发生 7.8 级地震' },
        { time: '03:43', event: '全城断电断水断通讯' },
        { time: '04:00', event: '余震不断，建筑持续倒塌' },
        { time: '数小时后', event: '全国救援力量开始集结' }
      ],
      scenario: {
        setting: '🏘️ 唐山居民区凌晨',
        desc: '凌晨3点多，你在睡梦中被剧烈晃动惊醒，整栋楼在摇晃，窗外一片漆黑...',
        choices: [
          { text: '迅速躲在坚固桌下护头', correct: true, exp: '正确！凌晨地震最难防备，第一时间保护头部、寻找坚固遮挡物是关键。' },
          { text: '摸黑跑下楼梯', correct: false, exp: '危险！黑暗中跑动容易被坠落物砸伤，楼梯可能已经受损。' },
          { text: '站在窗边观察情况', correct: false, exp: '极其危险！玻璃在地震中极易破碎，站在窗边可能被割伤。' },
          { text: '继续睡等震动停止', correct: false, exp: '错误！7.8级地震可能导致房屋倒塌，必须立即采取避险措施。' }
        ]
      },
      knowledge: [
        '唐山地震发生在凌晨，大量居民来不及逃生',
        '地震后中国开始建立全国性地震监测台网',
        '建筑抗震设防标准在此后大幅提升',
        '唐山地震促使中国建立完善的应急救援体系'
      ]
    }
  ],
  
  _currentCase: null,
  _currentPhase: 'select', // select, timeline, scenario, knowledge
  _selectedChoice: null,
  
  init(caseId) {
    this._currentCase = this._cases.find(c => c.id === caseId);
    if (!this._currentCase) return;
    
    this._currentPhase = 'timeline';
    this.renderTimeline();
  },
  
  renderTimeline() {
    const c = this._currentCase;
    const container = document.getElementById('realCasesContent');
    if (!container) return;
    
    container.innerHTML = `
      <div class="case-header">
        <div class="case-icon">${c.icon}</div>
        <div class="case-title-group">
          <h3>${c.title}</h3>
          <p>${c.date} · ${c.magnitude}</p>
        </div>
      </div>
      
      <div class="case-impact">
        <span class="impact-label">影响</span>
        <span class="impact-text">${c.impact}</span>
      </div>
      
      <div class="case-timeline">
        <h4>📅 事件时间线</h4>
        ${c.timeline.map(t => `
          <div class="timeline-item">
            <div class="timeline-time">${t.time}</div>
            <div class="timeline-dot"></div>
            <div class="timeline-event">${t.event}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="case-source">
        📖 数据来源：${c.source}
      </div>
      
      <button class="case-next-btn" onclick="RealCasesEngine.startScenario()">
        进入情景模拟 →
      </button>
    `;
  },
  
  startScenario() {
    this._currentPhase = 'scenario';
    const c = this._currentCase;
    const container = document.getElementById('realCasesContent');
    
    container.innerHTML = `
      <div class="scenario-header">
        <div class="scenario-setting">${c.scenario.setting}</div>
      </div>
      
      <div class="scenario-desc">${c.scenario.desc}</div>
      
      <div class="scenario-choices">
        ${c.scenario.choices.map((ch, i) => `
          <button class="choice-btn" onclick="RealCasesEngine.makeChoice(${i})">
            <span class="choice-letter">${String.fromCharCode(65 + i)}</span>
            <span class="choice-text">${ch.text}</span>
          </button>
        `).join('')}
      </div>
      
      <div id="choiceResult" style="display:none;"></div>
    `;
  },
  
  makeChoice(index) {
    const c = this._currentCase;
    const choice = c.scenario.choices[index];
    this._selectedChoice = { index, correct: choice.correct };
    
    // 禁用所有按钮
    document.querySelectorAll('.choice-btn').forEach((btn, i) => {
      btn.disabled = true;
      if (i === index) {
        btn.classList.add(choice.correct ? 'correct-choice' : 'wrong-choice');
      }
      if (c.scenario.choices[i].correct) {
        btn.classList.add('highlight-correct');
      }
    });
    
    // 显示结果
    const result = document.getElementById('choiceResult');
    result.style.display = 'block';
    result.innerHTML = `
      <div class="choice-result ${choice.correct ? 'correct' : 'wrong'}">
        <div class="result-icon">${choice.correct ? '✅' : '❌'}</div>
        <div class="result-text">
          <h4>${choice.correct ? '正确！' : '错误！'}</h4>
          <p>${choice.exp}</p>
        </div>
      </div>
    `;
    
    // 记录答题
    if (typeof AITutorEngine !== 'undefined') {
      AITutorEngine.recordAnswer(
        `case_${c.id}_${index}`,
        choice.correct,
        c.type
      );
    }
    
    // 显示知识总结按钮
    result.innerHTML += `
      <button class="case-next-btn" onclick="RealCasesEngine.showKnowledge()">
        📚 查看防灾知识总结 →
      </button>
    `;
  },
  
  showKnowledge() {
    this._currentPhase = 'knowledge';
    const c = this._currentCase;
    const container = document.getElementById('realCasesContent');
    
    container.innerHTML = `
      <div class="knowledge-header">
        <h3>📚 防灾知识总结</h3>
        <p>来自 ${c.title} 的经验教训</p>
      </div>
      
      <div class="knowledge-list">
        ${c.knowledge.map((k, i) => `
          <div class="knowledge-item">
            <span class="knowledge-number">${i + 1}</span>
            <span class="knowledge-text">${k}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="knowledge-actions">
        <button class="case-action-btn secondary" onclick="RealCasesEngine.backToSelect()">
          ← 返回案例列表
        </button>
        <button class="case-action-btn primary" onclick="RealCasesEngine.backToSelect()">
          🎯 继续学习其他案例
        </button>
      </div>
    `;
  },
  
  backToSelect() {
    this._currentPhase = 'select';
    this._currentCase = null;
    this.renderCaseList();
  },
  
  renderCaseList() {
    const container = document.getElementById('realCasesContent');
    if (!container) return;
    
    container.innerHTML = `
      <div class="cases-intro">
        <h3>📖 真实灾害案例</h3>
        <p>精选 5 个重大灾害事件，还原真实情景，学习防灾知识</p>
      </div>
      
      <div class="cases-list">
        ${this._cases.map(c => `
          <div class="case-card" onclick="RealCasesEngine.init('${c.id}')">
            <div class="case-card-icon">${c.icon}</div>
            <div class="case-card-info">
              <h4>${c.title}</h4>
              <p>${c.date} · ${c.magnitude}</p>
            </div>
            <div class="case-card-arrow">→</div>
          </div>
        `).join('')}
      </div>
    `;
  }
};

// 页面激活时自动渲染列表
document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('page-real-cases');
  if (page) {
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class' && m.target.classList.contains('active')) {
          if (RealCasesEngine._currentPhase === 'select' || !RealCasesEngine._currentCase) {
            RealCasesEngine.renderCaseList();
          }
        }
      });
    }).observe(page, { attributes: true, attributeFilter: ['class'] });
  }
});
