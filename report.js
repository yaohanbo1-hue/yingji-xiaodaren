/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 学习报告导出引擎
 * ===========================================================================
 * 
 * 功能：
 * 1. 生成学习数据报告（Canvas 渲染）
 * 2. 支持导出为 PNG 图片
 * 3. 支持直接打印
 * 4. 包含：学习时长、答题统计、薄弱项、进步曲线
 * 
 * @version 1.2.0
 * ===========================================================================
 */

// roundRect 兼容补丁
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'number') r = [r, r, r, r];
    if (!Array.isArray(r)) r = [0, 0, 0, 0];
    var tl = r[0] || 0, tr = r[1] || r[0] || 0, br = r[2] || r[0] || 0, bl = r[3] || r[1] || r[0] || 0;
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

const ReportEngine = {
  
  // 收集学习数据
  _collectData() {
    var data = {
      date: new Date().toLocaleDateString('zh-CN'),
      studentName: localStorage.getItem('disaster_hq_name') || '防灾小学员',
      totalTime: this._getPlayTime(),
      totalQuizzes: this._getQuizCount(),
      correctRate: this._getCorrectRate(),
      categoryStats: this._getCategoryStats(),
      weakAreas: this._getWeakAreas(),
      achievements: this._getAchievements(),
      wrongBookStats: this._getWrongBookStats(),
      level: this._getLevel(),
      streak: this._getStreak()
    };
    return data;
  },
  
  _getPlayTime() {
    // 尝试从多个可能的存储位置获取
    var time = localStorage.getItem('disaster_hq_playtime') ||
               localStorage.getItem('disaster_hq_totalTime') ||
               localStorage.getItem('play_time') || '0';
    var minutes = parseInt(time) || 0;
    if (minutes < 60) return minutes + ' 分钟';
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return hours + ' 小时 ' + mins + ' 分钟';
  },
  
  _getQuizCount() {
    var count = localStorage.getItem('disaster_hq_quizcount') ||
                localStorage.getItem('disaster_hq_totalQuizzes') ||
                localStorage.getItem('quiz_count') || '0';
    return parseInt(count) || 0;
  },
  
  _getCorrectRate() {
    var correct = parseInt(localStorage.getItem('disaster_hq_correct') || 
                  localStorage.getItem('correct_count') || '0');
    var total = parseInt(localStorage.getItem('disaster_hq_total') || 
                localStorage.getItem('total_count') || '0');
    if (total === 0) return 0;
    return Math.round(correct / total * 100);
  },
  
  _getCategoryStats() {
    var categories = {
      earthquake: { name: '地震', icon: '🌍', correct: 0, total: 0 },
      flood: { name: '洪水', icon: '🌊', correct: 0, total: 0 },
      fire: { name: '火灾', icon: '🔥', correct: 0, total: 0 },
      typhoon: { name: '台风', icon: '🌀', correct: 0, total: 0 },
      tsunami: { name: '海啸', icon: '🌊', correct: 0, total: 0 },
      landslide: { name: '滑坡', icon: '⛰️', correct: 0, total: 0 },
      tornado: { name: '龙卷风', icon: '🌪️', correct: 0, total: 0 },
      drought: { name: '干旱', icon: '☀️', correct: 0, total: 0 },
      lightning: { name: '雷电', icon: '⚡', correct: 0, total: 0 },
      avalanche: { name: '雪崩', icon: '❄️', correct: 0, total: 0 },
      volcano: { name: '火山', icon: '🌋', correct: 0, total: 0 },
      hail: { name: '冰雹', icon: '🧊', correct: 0, total: 0 }
    };
    
    // 尝试从已有数据中获取
    try {
      var stats = localStorage.getItem('disaster_hq_category_stats');
      if (stats) {
        var parsed = JSON.parse(stats);
        Object.keys(parsed).forEach(function(key) {
          if (categories[key]) {
            categories[key] = Object.assign(categories[key], parsed[key]);
          }
        });
      }
    } catch (e) {}
    
    return categories;
  },
  
  _getWeakAreas() {
    if (typeof WrongBookEngine !== 'undefined' && typeof WrongBookEngine.getWeakestTopics === 'function') {
      var weakest = WrongBookEngine.getWeakestTopics(3);
      return weakest.map(function(item) {
        return {
          question: item.question.substring(0, 50),
          wrongCount: item.wrongCount,
          category: item.category
        };
      });
    }
    return [];
  },
  
  _getAchievements() {
    var achievements = [];
    try {
      var data = localStorage.getItem('disaster_hq_achievements') ||
                 localStorage.getItem('achievements');
      if (data) {
        achievements = JSON.parse(data);
      }
    } catch (e) {}
    return achievements.slice(0, 5); // 最多显示5个
  },
  
  _getWrongBookStats() {
    if (typeof WrongBookEngine !== 'undefined' && typeof WrongBookEngine.getStats === 'function') {
      return WrongBookEngine.getStats();
    }
    return { total: 0, mastered: 0, unmastered: 0, masteryRate: 0 };
  },
  
  _getLevel() {
    var level = localStorage.getItem('disaster_hq_level') ||
                localStorage.getItem('player_level') || '1';
    return parseInt(level) || 1;
  },
  
  _getStreak() {
    var streak = localStorage.getItem('disaster_hq_streak') ||
                 localStorage.getItem('login_streak') || '0';
    return parseInt(streak) || 0;
  },
  
  // 生成报告 Canvas
  generateReport() {
    var data = this._collectData();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 1100;
    
    // 背景渐变
    var bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 顶部装饰线
    var topGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    topGrad.addColorStop(0, 'rgba(59,130,246,0.8)');
    topGrad.addColorStop(0.5, 'rgba(167,139,250,0.8)');
    topGrad.addColorStop(1, 'rgba(251,146,60,0.8)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvas.width, 4);
    
    // 标题区
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 32px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌪️ 应急小达人', canvas.width / 2, 60);
    
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px "Microsoft YaHei", sans-serif';
    ctx.fillText('学 习 报 告', canvas.width / 2, 95);
    
    // 日期和姓名
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px "Microsoft YaHei", sans-serif';
    ctx.fillText('学员: ' + data.studentName + '  |  生成日期: ' + data.date, canvas.width / 2, 125);
    
    // 分隔线
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 145);
    ctx.lineTo(canvas.width - 50, 145);
    ctx.stroke();
    
    // 核心数据卡片
    var cardY = 170;
    var cardH = 100;
    var cardW = 160;
    var gap = 20;
    var startX = (canvas.width - (cardW * 4 + gap * 3)) / 2;
    
    var cards = [
      { label: '学习等级', value: 'Lv.' + data.level, color: '#60a5fa', icon: '⭐' },
      { label: '学习时长', value: data.totalTime, color: '#34d399', icon: '⏱️' },
      { label: '答题总数', value: data.totalQuizzes.toString(), color: '#a78bfa', icon: '📝' },
      { label: '正确率', value: data.correctRate + '%', color: '#fbbf24', icon: '🎯' }
    ];
    
    cards.forEach(function(card, i) {
      var x = startX + i * (cardW + gap);
      
      // 卡片背景
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, cardY, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();
      
      // 图标
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.icon, x + cardW / 2, cardY + 35);
      
      // 数值
      ctx.fillStyle = card.color;
      ctx.font = 'bold 22px "Microsoft YaHei", sans-serif';
      ctx.fillText(card.value, x + cardW / 2, cardY + 65);
      
      // 标签
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.fillText(card.label, x + cardW / 2, cardY + 88);
    });
    
    // 第二行：连续签到 + 错题掌握率
    var row2Y = cardY + cardH + 20;
    var row2Cards = [
      { label: '连续签到', value: data.streak + ' 天', color: '#f472b6', icon: '🔥' },
      { label: '错题掌握率', value: data.wrongBookStats.masteryRate + '%', color: '#2dd4bf', icon: '📕' }
    ];
    
    var row2StartX = (canvas.width - (200 * 2 + gap)) / 2;
    row2Cards.forEach(function(card, i) {
      var x = row2StartX + i * (200 + gap);
      
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.roundRect(x, row2Y, 200, 80, 12);
      ctx.fill();
      ctx.stroke();
      
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.icon, x + 40, row2Y + 48);
      
      ctx.fillStyle = card.color;
      ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
      ctx.fillText(card.value, x + 120, row2Y + 42);
      
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.fillText(card.label, x + 120, row2Y + 62);
    });
    
    // 分类掌握情况
    var catY = row2Y + 110;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 18px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 分类掌握情况', 60, catY);
    
    catY += 20;
    var catKeys = Object.keys(data.categoryStats);
    var barX = 100;
    var barMaxW = 500;
    var barH = 22;
    var barGap = 8;
    
    catKeys.forEach(function(key, i) {
      var cat = data.categoryStats[key];
      var y = catY + i * (barH + barGap);
      
      // 分类名
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '13px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(cat.icon + ' ' + cat.name, barX - 10, y + 16);
      
      // 进度条背景
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(barX, y, barMaxW, barH, 4);
      ctx.fill();
      
      // 进度条
      var rate = cat.total > 0 ? cat.correct / cat.total : 0;
      if (rate > 0) {
        var grad = ctx.createLinearGradient(barX, 0, barX + barMaxW * rate, 0);
        grad.addColorStop(0, 'rgba(59,130,246,0.8)');
        grad.addColorStop(1, 'rgba(139,92,246,0.8)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(barX, y, barMaxW * rate, barH, 4);
        ctx.fill();
      }
      
      // 百分比
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '11px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(Math.round(rate * 100) + '%', barX + barMaxW + 10, y + 16);
    });
    
    // 薄弱项
    if (data.weakAreas.length > 0) {
      var weakY = catY + catKeys.length * (barH + barGap) + 30;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 18px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚠️ 需要加强的知识点', 60, weakY);
      
      weakY += 15;
      data.weakAreas.forEach(function(area, i) {
        weakY += 25;
        ctx.fillStyle = 'rgba(239,68,68,0.8)';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.fillText('❌ ' + area.question + '... (错' + area.wrongCount + '次)', 80, weakY);
      });
    }
    
    // 底部信息
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('应急小达人 v1.2.0 | 全国青少年安全与应急科普创新大赛', canvas.width / 2, canvas.height - 40);
    ctx.fillText('本报告由系统自动生成，数据来源于本地学习记录', canvas.width / 2, canvas.height - 20);
    
    return canvas;
  },
  
  // 显示报告弹窗
  showReport() {
    var canvas = this.generateReport();
    
    // 创建弹窗
    var overlay = document.createElement('div');
    overlay.id = 'reportOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;';
    
    var container = document.createElement('div');
    container.style.cssText = 'background:rgba(15,23,42,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px;max-width:90vw;max-height:90vh;overflow:auto;box-shadow:0 25px 50px rgba(0,0,0,0.5);';
    
    var title = document.createElement('h2');
    title.style.cssText = 'color:rgba(255,255,255,0.9);font-size:20px;margin-bottom:20px;text-align:center;';
    title.textContent = '📊 学习报告预览';
    container.appendChild(title);
    
    canvas.style.cssText = 'max-width:100%;height:auto;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.3);';
    container.appendChild(canvas);
    
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center;margin-top:20px;';
    
    var downloadBtn = document.createElement('button');
    downloadBtn.style.cssText = 'padding:12px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;';
    downloadBtn.textContent = '💾 保存图片';
    downloadBtn.onclick = function() {
      var link = document.createElement('a');
      link.download = '防灾学习报告_' + new Date().toISOString().slice(0,10) + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    var printBtn = document.createElement('button');
    printBtn.style.cssText = 'padding:12px 24px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.9);font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;';
    printBtn.textContent = '🖨️ 打印报告';
    printBtn.onclick = function() {
      var win = window.open('', '_blank');
      win.document.write('<html><head><title>学习报告</title><style>body{margin:0;background:#0F172A;display:flex;justify-content:center;}img{max-width:100%;}</style></head><body><img src="' + canvas.toDataURL() + '" onload="window.print()"></body></html>');
    };
    
    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'padding:12px 24px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.9);font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;';
    closeBtn.textContent = '✕ 关闭';
    closeBtn.onclick = function() { overlay.remove(); };
    
    btnRow.appendChild(downloadBtn);
    btnRow.appendChild(printBtn);
    btnRow.appendChild(closeBtn);
    container.appendChild(btnRow);
    
    overlay.appendChild(container);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
    
    document.body.appendChild(overlay);
  }
};

// 挂载到全局
window.ReportEngine = ReportEngine;
