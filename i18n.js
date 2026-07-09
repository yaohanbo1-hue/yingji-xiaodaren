/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 多语言切换引擎
 * ===========================================================================
 * 
 * 功能：
 * 1. 支持中文/英文切换
 * 2. 翻译所有界面文本
 * 3. 语言偏好保存到 localStorage
 * 4. 自动检测浏览器语言
 * 
 * @version 1.2.0
 * ===========================================================================
 */

// [修复] game-engines.js 已用 var 声明 I18nEngine，此处改为赋值覆盖（var 变量可重新赋值，不报错）
I18nEngine = {
  _currentLang: 'zh',
  _translations: {
    zh: {
      // 主菜单
      'menu.title': '应急小达人',
      'menu.subtitle': '学习防灾知识，成为防灾达人',
      'menu.learn': '📚 学习中心',
      'menu.battle': '⚔️ 闯关挑战',
      'menu.cert': '🏅 认证与模拟',
      
      // 学习中心
      'mode.blindbox': '开盲盒',
      'mode.blindbox.desc': '随机获得防灾知识卡',
      'mode.checkin': '每日签到',
      'mode.checkin.desc': '打卡学习，连续奖励',
      'mode.study': '学习模式',
      'mode.study.desc': '系统学习防灾知识',
      'mode.firstaid': '急救模拟',
      'mode.firstaid.desc': '学习急救技能',
      'mode.museum': '防灾馆',
      'mode.museum.desc': '探索灾害知识',
      'mode.pet': '防灾宠物',
      'mode.pet.desc': '养宠物学防灾',
      'mode.diary': '防灾日记',
      'mode.diary.desc': '记录学习心得',
      'mode.workshop': '卡牌工坊',
      'mode.workshop.desc': '合成升级卡牌',
      'mode.encyclopedia': '灾害百科',
      'mode.encyclopedia.desc': '全面学习灾害知识',
      'mode.guide': '新手引导',
      'mode.guide.desc': '快速上手教程',
      'mode.ai-tutor': 'AI 导师',
      'mode.ai-tutor.desc': '智能诊断与推荐',
      
      // 闯关挑战
      'mode.battle': '防灾大擂台',
      'mode.battle.desc': '回合制打怪兽',
      'mode.free': '自由模式',
      'mode.free.desc': '自选灾害，无限练习',
      'mode.speed': '速答挑战',
      'mode.speed.desc': '10题限时竞答',
      'mode.pk': '双人PK',
      'mode.pk.desc': '朋友对战',
      'mode.daily': '每日挑战',
      'mode.daily.desc': '每天10题打卡',
      'mode.survival': '生存模式',
      'mode.survival.desc': '答错3次结束',
      'mode.bossrush': 'Boss Rush',
      'mode.bossrush.desc': '挑战所有Boss',
      'mode.timed': '限时挑战',
      'mode.timed.desc': '限时答题',
      'mode.story': '故事模式',
      'mode.story.desc': '剧情闯关',
      'mode.lightning': '闪电问答',
      'mode.lightning.desc': '极速答题',
      'mode.supplydrop': '精准投放',
      'mode.supplydrop.desc': '空投物资',
      'mode.gacha': '扭蛋机',
      'mode.gacha.desc': '抽卡收集',
      'mode.music': '音乐模式',
      'mode.music.desc': '节奏答题',
      'mode.easter': '彩蛋模式',
      'mode.easter.desc': '隐藏惊喜',
      'mode.base': '基地模式',
      'mode.base.desc': '建设防灾基地',
      'mode.escape': '限时逃生',
      'mode.escape.desc': '紧急逃生',
      'mode.precision': '精准打击',
      'mode.precision.desc': '精准答题',
      'mode.adventure': '大冒险',
      'mode.adventure.desc': '随机冒险',
      'mode.memory': '记忆翻牌',
      'mode.memory.desc': '记忆挑战',
      'mode.reaction': '反应速度',
      'mode.reaction.desc': '测试反应',
      'mode.race': '知识竞速',
      'mode.race.desc': '速度竞赛',
      
      // 认证与模拟
      'mode.certification': '能力认证',
      'mode.certification.desc': '获取认证证书',
      'mode.disaster-sim': '灾害模拟',
      'mode.disaster-sim.desc': '沉浸式体验',
      'mode.real-cases': '真实案例',
      'mode.real-cases.desc': '历史事件还原',
      
      // 工具栏
      'toolbar.wrong-book': '📕 错题本',
      'toolbar.report': '📊 学习报告',
      'toolbar.share': '📸 分享成绩',
      'toolbar.settings': '⚙️ 设置',
      
      // 通用
      'common.back': '← 返回',
      'common.next': '下一题 →',
      'common.submit': '提交',
      'common.cancel': '取消',
      'common.confirm': '确认',
      'common.close': '关闭',
      'common.loading': '加载中...',
      'common.success': '成功',
      'common.fail': '失败',
      
      // 答题
      'quiz.correct': '✅ 正确！',
      'quiz.wrong': '❌ 错误',
      'quiz.explanation': '解析',
      'quiz.tip': '小贴士',
      'quiz.score': '得分',
      'quiz.streak': '连击',
      'quiz.progress': '进度',
      
      // 盲盒
      'blindbox.open': '开启盲盒',
      'blindbox.opening': '开启中...',
      'blindbox.congrats': '恭喜获得',
      'blindbox.duplicate': '重复卡牌',
      'blindbox.new': '新卡牌',
      
      // 认证
      'cert.level': '认证等级',
      'cert.progress': '进度',
      'cert.certificate': '证书',
      'cert.download': '下载证书',
      'cert.print': '打印证书',
      
      // 分享
      'share.title': '分享成绩',
      'share.download': '下载海报',
      'share.template.default': '📊 学习报告',
      'share.template.achievement': '🏆 成就展示',
      'share.template.challenge': '⚔️ 挑战成绩',
      
      // 设置
      'settings.title': '设置',
      'settings.language': '语言',
      'settings.sound': '音效',
      'settings.bgm': '背景音乐',
      'settings.voice': '语音播报',
      'settings.reset': '重置数据',
      
      // 统计
      'stats.total': '总答题数',
      'stats.accuracy': '正确率',
      'stats.streak': '连续打卡',
      'stats.days': '天',
      'stats.mastered': '已掌握',
      'stats.disasters': '种灾害'
    },
    
    en: {
      // Main Menu
      'menu.title': 'Disaster Command HQ',
      'menu.subtitle': 'Learn disaster preparedness, become a safety expert',
      'menu.learn': '📚 Learning Center',
      'menu.battle': '⚔️ Challenge Mode',
      'menu.cert': '🏅 Certification',
      
      // Learning Center
      'mode.blindbox': 'Blind Box',
      'mode.blindbox.desc': 'Get random knowledge cards',
      'mode.checkin': 'Daily Check-in',
      'mode.checkin.desc': 'Daily learning rewards',
      'mode.study': 'Study Mode',
      'mode.study.desc': 'Systematic learning',
      'mode.firstaid': 'First Aid',
      'mode.firstaid.desc': 'Learn first aid skills',
      'mode.museum': 'Disaster Museum',
      'mode.museum.desc': 'Explore disaster knowledge',
      'mode.pet': 'Safety Pet',
      'mode.pet.desc': 'Raise a pet, learn safety',
      'mode.diary': 'Safety Diary',
      'mode.diary.desc': 'Record learning notes',
      'mode.workshop': 'Card Workshop',
      'mode.workshop.desc': 'Upgrade cards',
      'mode.encyclopedia': 'Encyclopedia',
      'mode.encyclopedia.desc': 'Comprehensive knowledge',
      'mode.guide': 'Tutorial',
      'mode.guide.desc': 'Quick start guide',
      'mode.ai-tutor': 'AI Tutor',
      'mode.ai-tutor.desc': 'Smart diagnosis',
      
      // Challenge Mode
      'mode.battle': 'Battle Arena',
      'mode.battle.desc': 'Turn-based monster fight',
      'mode.free': 'Free Mode',
      'mode.free.desc': 'Unlimited practice',
      'mode.speed': 'Speed Challenge',
      'mode.speed.desc': '10 questions timed',
      'mode.pk': '2P Battle',
      'mode.pk.desc': 'Challenge friends',
      'mode.daily': 'Daily Challenge',
      'mode.daily.desc': '10 questions daily',
      'mode.survival': 'Survival Mode',
      'mode.survival.desc': '3 mistakes = game over',
      'mode.bossrush': 'Boss Rush',
      'mode.bossrush.desc': 'Fight all bosses',
      'mode.timed': 'Time Attack',
      'mode.timed.desc': 'Beat the clock',
      'mode.story': 'Story Mode',
      'mode.story.desc': 'Story-driven levels',
      'mode.lightning': 'Lightning Quiz',
      'mode.lightning.desc': 'Ultra-fast quiz',
      'mode.supplydrop': 'Supply Drop',
      'mode.supplydrop.desc': 'Airdrop supplies',
      'mode.gacha': 'Gacha Machine',
      'mode.gacha.desc': 'Collect cards',
      'mode.music': 'Music Mode',
      'mode.music.desc': 'Rhythm quiz',
      'mode.easter': 'Easter Egg',
      'mode.easter.desc': 'Hidden surprises',
      'mode.base': 'Base Mode',
      'mode.base.desc': 'Build safety base',
      'mode.escape': 'Escape Room',
      'mode.escape.desc': 'Emergency escape',
      'mode.precision': 'Precision Strike',
      'mode.precision.desc': 'Accurate answers',
      'mode.adventure': 'Adventure',
      'mode.adventure.desc': 'Random adventure',
      'mode.memory': 'Memory Cards',
      'mode.memory.desc': 'Memory challenge',
      'mode.reaction': 'Reaction Test',
      'mode.reaction.desc': 'Test reflexes',
      'mode.race': 'Knowledge Race',
      'mode.race.desc': 'Speed competition',
      
      // Certification
      'mode.certification': 'Certification',
      'mode.certification.desc': 'Get certificates',
      'mode.disaster-sim': 'Disaster Sim',
      'mode.disaster-sim.desc': 'Immersive experience',
      'mode.real-cases': 'Real Cases',
      'mode.real-cases.desc': 'Historical events',
      
      // Toolbar
      'toolbar.wrong-book': '📕 Wrong Book',
      'toolbar.report': '📊 Report',
      'toolbar.share': '📸 Share',
      'toolbar.settings': '⚙️ Settings',
      
      // Common
      'common.back': '← Back',
      'common.next': 'Next →',
      'common.submit': 'Submit',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.close': 'Close',
      'common.loading': 'Loading...',
      'common.success': 'Success',
      'common.fail': 'Failed',
      
      // Quiz
      'quiz.correct': '✅ Correct!',
      'quiz.wrong': '❌ Wrong',
      'quiz.explanation': 'Explanation',
      'quiz.tip': 'Tip',
      'quiz.score': 'Score',
      'quiz.streak': 'Streak',
      'quiz.progress': 'Progress',
      
      // Blind Box
      'blindbox.open': 'Open Box',
      'blindbox.opening': 'Opening...',
      'blindbox.congrats': 'You got',
      'blindbox.duplicate': 'Duplicate',
      'blindbox.new': 'New Card',
      
      // Certification
      'cert.level': 'Level',
      'cert.progress': 'Progress',
      'cert.certificate': 'Certificate',
      'cert.download': 'Download',
      'cert.print': 'Print',
      
      // Share
      'share.title': 'Share Results',
      'share.download': 'Download Poster',
      'share.template.default': '📊 Report',
      'share.template.achievement': '🏆 Achievement',
      'share.template.challenge': '⚔️ Challenge',
      
      // Settings
      'settings.title': 'Settings',
      'settings.language': 'Language',
      'settings.sound': 'Sound Effects',
      'settings.bgm': 'Background Music',
      'settings.voice': 'Voice',
      'settings.reset': 'Reset Data',
      
      // Stats
      'stats.total': 'Total Questions',
      'stats.accuracy': 'Accuracy',
      'stats.streak': 'Streak',
      'stats.days': 'days',
      'stats.mastered': 'Mastered',
      'stats.disasters': 'disasters'
    }
  },
  
  // 初始化
  init() {
    // 从 localStorage 读取语言偏好
    const saved = localStorage.getItem('disasterHQ_language');
    if (saved && (saved === 'zh' || saved === 'en')) {
      this._currentLang = saved;
    } else {
      // 检测浏览器语言
      const browserLang = navigator.language || navigator.userLanguage;
      this._currentLang = browserLang.startsWith('zh') ? 'zh' : 'en';
    }
    
    // 应用语言
    this.apply();
    
    // 添加语言切换按钮到设置页面
    this._addLanguageSwitcher();
  },
  
  // 翻译
  t(key) {
    return this._translations[this._currentLang][key] || key;
  },
  
  // 切换语言
  setLanguage(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    this._currentLang = lang;
    try {
      localStorage.setItem('disasterHQ_language', lang);
    } catch(e) { console.error('Storage error:', e); }
    this.apply();
  },
  
  // 应用翻译到界面
  apply() {
    // 翻译所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) {
        el.textContent = text;
      }
    });
    
    // 翻译 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text) {
        el.placeholder = text;
      }
    });
    
    // 更新 HTML lang 属性
    document.documentElement.lang = this._currentLang;
  },
  
  // 添加语言切换器到设置页面（已隐藏，不再注入）
  _addLanguageSwitcher() {
    // i18n 尚未完全接入（0 个 data-i18n 属性），暂不注入切换器
    return;
  },
    const checkInterval = setInterval(() => {
      const settingsPage = document.getElementById('page-settings');
      if (settingsPage && !settingsPage.querySelector('.lang-switcher')) {
        const switcher = document.createElement('div');
        switcher.className = 'lang-switcher';
        switcher.innerHTML = `
          <label data-i18n="settings.language">语言</label>
          <div class="lang-buttons">
            <button class="lang-btn ${this._currentLang === 'zh' ? 'active' : ''}" data-lang="zh" onclick="I18nEngine.setLanguage('zh')">中文</button>
            <button class="lang-btn ${this._currentLang === 'en' ? 'active' : ''}" data-lang="en" onclick="I18nEngine.setLanguage('en')">English</button>
          </div>
        `;
        
        // 插入到设置页面顶部
        const header = settingsPage.querySelector('.game-header');
        if (header) {
          header.after(switcher);
        } else {
          settingsPage.prepend(switcher);
        }
        
        clearInterval(checkInterval);
      }
    }, 500);
  },
  
  // 获取当前语言
  getCurrentLanguage() {
    return this._currentLang;
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  I18nEngine.init();
});

window.I18nEngine = I18nEngine;
