/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 社交分享引擎（成绩海报生成）
 * ===========================================================================
 * 
 * 功能：
 * 1. Canvas 渲染精美成绩海报
 * 2. 展示学习数据（答题数/正确率/掌握灾害/认证等级）
 * 3. 一键下载 PNG 海报
 * 4. 支持多种海报模板
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const SafeStorage = {
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.error('Storage error:', e); }
  },
  get(key, defaultVal) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : defaultVal; } catch(e) { return defaultVal; }
  },
  getString(key, defaultVal) {
    try { return localStorage.getItem(key) || defaultVal; } catch(e) { return defaultVal; }
  }
};

const ShareEngine = {
  
  // 生成成绩海报
  generatePoster(template) {
    const canvas = document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 1334; // 手机屏幕比例
    const ctx = canvas.getContext('2d');
    
    // 获取用户数据
    const data = this._getUserData();
    
    switch(template || 'default') {
      case 'achievement':
        this._drawAchievementPoster(ctx, canvas.width, canvas.height, data);
        break;
      case 'challenge':
        this._drawChallengePoster(ctx, canvas.width, canvas.height, data);
        break;
      default:
        this._drawDefaultPoster(ctx, canvas.width, canvas.height, data);
    }
    
    return canvas;
  },
  
  // 下载海报
  downloadPoster(template) {
    const canvas = this.generatePoster(template);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.download = `应急小达人_成绩海报_${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  },
  
  // 显示分享弹窗
  showShareModal() {
    // 移除已有弹窗
    const existing = document.querySelector('.share-modal-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'share-modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    
    overlay.innerHTML = `
      <div class="share-modal-content">
        <div class="share-modal-header">
          <h3>📸 分享成绩</h3>
          <button class="share-modal-close" onclick="this.closest('.share-modal-overlay').remove()">✕</button>
        </div>
        <div class="share-modal-body">
          <canvas id="sharePosterCanvas" width="375" height="667" style="width:100%;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);"></canvas>
          <div class="share-template-selector">
            <button class="share-template-btn active" data-template="default" onclick="ShareEngine.switchTemplate('default')">📊 学习报告</button>
            <button class="share-template-btn" data-template="achievement" onclick="ShareEngine.switchTemplate('achievement')">🏆 成就展示</button>
            <button class="share-template-btn" data-template="challenge" onclick="ShareEngine.switchTemplate('challenge')">⚔️ 挑战成绩</button>
          </div>
        </div>
        <div class="share-modal-actions">
          <button class="share-download-btn" onclick="ShareEngine.downloadPoster(ShareEngine._currentTemplate)">
            💾 下载海报
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 渲染默认海报
    this._currentTemplate = 'default';
    setTimeout(() => this._renderPosterToModal('default'), 100);
  },
  
  _currentTemplate: 'default',
  
  switchTemplate(template) {
    this._currentTemplate = template;
    
    // 更新按钮状态
    document.querySelectorAll('.share-template-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.template === template);
    });
    
    this._renderPosterToModal(template);
  },
  
  _renderPosterToModal(template) {
    const canvas = document.getElementById('sharePosterCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = this._getUserData();
    
    // 清空
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 根据模板绘制
    switch(template) {
      case 'achievement':
        this._drawAchievementPoster(ctx, canvas.width, canvas.height, data, true);
        break;
      case 'challenge':
        this._drawChallengePoster(ctx, canvas.width, canvas.height, data, true);
        break;
      default:
        this._drawDefaultPoster(ctx, canvas.width, canvas.height, data, true);
    }
  },
  
  // 获取用户数据
  _getUserData() {
    const stats = {
      totalAnswered: 0,
      correctCount: 0,
      accuracy: 0,
      masteredDisasters: 0,
      currentLevel: 0,
      levelName: '防灾新手',
      blindboxOpened: 0,
      streakDays: 0
    };
    
    // 尝试从实际存在的 key 读取数据
    try {
      // 1. 优先从 disasterGachaState 读取综合数据
      const gacha = SafeStorage.get('disasterGachaState', null);
      if (gacha) {
        stats.totalAnswered = gacha.totalQuizzes || gacha.totalAnswered || 0;
        stats.correctCount = gacha.correctCount || 0;
        stats.blindboxOpened = gacha.blindboxOpened || gacha.boxOpened || 0;
        stats.streakDays = gacha.streakDays || gacha.checkinStreak || 0;
      }
      
      // 2. 从 aiTutorData 补充答题数据
      const aiData = SafeStorage.get('aiTutorData', null);
      if (aiData && aiData.quizHistory) {
        stats.totalAnswered = stats.totalAnswered || aiData.quizHistory.length;
        stats.correctCount = stats.correctCount || aiData.quizHistory.filter(h => h.correct).length;
      }
      
      // 3. 从 CertificationEngine 获取等级数据
      if (typeof CertificationEngine !== 'undefined' && CertificationEngine._data) {
        stats.currentLevel = CertificationEngine._data.currentLevel || 0;
        if (CertificationEngine._levels && stats.currentLevel >= 0) {
          stats.levelName = CertificationEngine._levels[stats.currentLevel]?.name || '防灾新手';
        }
        stats.masteredDisasters = CertificationEngine._data.masteredModules || 0;
      }
      
      // 4. 从 GameState 补充数据
      if (typeof GameState !== 'undefined' && GameState._data) {
        stats.totalAnswered = stats.totalAnswered || GameState._data.totalQuizzes || 0;
        stats.correctCount = stats.correctCount || GameState._data.correctCount || 0;
        stats.blindboxOpened = stats.blindboxOpened || GameState._data.blindboxOpened || 0;
      }
      
      // 5. 计算正确率
      if (stats.totalAnswered > 0) {
        stats.accuracy = Math.round(stats.correctCount / stats.totalAnswered * 100);
      }
    } catch(e) {
      // 使用默认值
    }
    
    return stats;
  },
  
  // 默认海报 — 学习报告
  _drawDefaultPoster(ctx, W, H, data, isPreview) {
    // 背景渐变
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0F172A');
    bg.addColorStop(0.5, '#1E293B');
    bg.addColorStop(1, '#0F172A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    
    // 装饰光晕
    this._drawGlow(ctx, W * 0.3, H * 0.2, 150, '#3b82f6', 0.15);
    this._drawGlow(ctx, W * 0.7, H * 0.4, 120, '#8b5cf6', 0.1);
    this._drawGlow(ctx, W * 0.5, H * 0.8, 180, '#06b6d4', 0.08);
    
    // 顶部装饰线
    const topGrad = ctx.createLinearGradient(0, 0, W, 0);
    topGrad.addColorStop(0, 'transparent');
    topGrad.addColorStop(0.3, '#3b82f6');
    topGrad.addColorStop(0.7, '#8b5cf6');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 3);
    
    // 标题
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const scale = isPreview ? 0.5 : 1;
    const fontSize = (title) => (isPreview ? title * 0.5 : title) + 'px "Microsoft YaHei", sans-serif';
    
    ctx.font = `bold ${isPreview ? 18 : 36}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText('应急小达人', W / 2, isPreview ? 40 : 80);
    
    ctx.font = `${isPreview ? 10 : 20}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText('我的防灾学习报告', W / 2, isPreview ? 62 : 124);
    
    // 分隔线
    ctx.fillStyle = topGrad;
    ctx.fillRect(W * 0.2, isPreview ? 80 : 160, W * 0.6, 1);
    
    // 数据卡片
    const cardY = isPreview ? 100 : 200;
    const cardH = isPreview ? 80 : 160;
    const cardW = isPreview ? 150 : 300;
    const gap = isPreview ? 10 : 20;
    
    const stats = [
      { value: data.totalAnswered, label: '答题总数', icon: '📝', color: '#3b82f6' },
      { value: data.accuracy + '%', label: '正确率', icon: '🎯', color: '#22c55e' },
      { value: data.masteredDisasters + '/12', label: '掌握灾害', icon: '🌍', color: '#f59e0b' },
      { value: data.blindboxOpened, label: '开启盲盒', icon: '🎁', color: '#8b5cf6' },
      { value: data.streakDays, label: '连续打卡', icon: '🔥', color: '#ef4444' },
      { value: data.levelName, label: '当前等级', icon: '🏅', color: '#06b6d4' }
    ];
    
    stats.forEach((stat, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = W * 0.15 + col * (cardW + gap);
      const y = cardY + row * (cardH + gap);
      
      // 卡片背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, isPreview ? 6 : 12);
      ctx.fill();
      ctx.stroke();
      
      // 图标
      ctx.font = `${isPreview ? 16 : 32}px sans-serif`;
      ctx.fillText(stat.icon, x + cardW / 2, y + (isPreview ? 20 : 40));
      
      // 数值
      ctx.font = `bold ${isPreview ? 14 : 28}px "Microsoft YaHei", sans-serif`;
      ctx.fillStyle = stat.color;
      ctx.fillText(String(stat.value), x + cardW / 2, y + (isPreview ? 45 : 90));
      
      // 标签
      ctx.font = `${isPreview ? 9 : 18}px "Microsoft YaHei", sans-serif`;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.fillText(stat.label, x + cardW / 2, y + (isPreview ? 62 : 125));
    });
    
    // 底部 slogan
    ctx.font = `${isPreview ? 9 : 18}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.fillText('让防灾知识触手可及', W / 2, isPreview ? 620 : 1240);
    
    // 二维码提示
    ctx.font = `${isPreview ? 7 : 14}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.fillText('应急小达人 · 全国青少年安全与应急科普创新大赛', W / 2, isPreview ? 645 : 1290);
  },
  
  // 成就海报
  _drawAchievementPoster(ctx, W, H, data, isPreview) {
    // 金色主题背景
    const bg = ctx.createRadialGradient(W/2, H/3, 0, W/2, H/3, H);
    bg.addColorStop(0, '#1a1512');
    bg.addColorStop(0.5, '#0F172A');
    bg.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    
    // 金色光晕
    this._drawGlow(ctx, W/2, H * 0.3, 200, '#f59e0b', 0.2);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 标题
    ctx.font = `bold ${isPreview ? 14 : 28}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('🏆 防灾能力认证', W / 2, isPreview ? 40 : 80);
    
    // 等级图标
    ctx.font = `${isPreview ? 40 : 80}px sans-serif`;
    ctx.fillText('🏅', W / 2, isPreview ? 100 : 200);
    
    // 等级名称
    ctx.font = `bold ${isPreview ? 20 : 40}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(data.levelName, W / 2, isPreview ? 150 : 300);
    
    // 数据
    ctx.font = `${isPreview ? 11 : 22}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`答题 ${data.totalAnswered} 道 · 正确率 ${data.accuracy}%`, W / 2, isPreview ? 190 : 380);
    ctx.fillText(`掌握 ${data.masteredDisasters}/12 种灾害`, W / 2, isPreview ? 215 : 430);
    
    // 底部
    ctx.font = `${isPreview ? 8 : 16}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.fillText('应急小达人 · 让防灾知识触手可及', W / 2, isPreview ? 630 : 1260);
  },
  
  // 挑战成绩海报
  _drawChallengePoster(ctx, W, H, data, isPreview) {
    // 红色主题背景
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1a0a0a');
    bg.addColorStop(0.5, '#0F172A');
    bg.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    
    // 红色光晕
    this._drawGlow(ctx, W/2, H * 0.3, 180, '#ef4444', 0.15);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 标题
    ctx.font = `bold ${isPreview ? 14 : 28}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#ef4444';
    ctx.fillText('⚔️ 挑战成绩单', W / 2, isPreview ? 40 : 80);
    
    // 大数字正确率
    ctx.font = `bold ${isPreview ? 50 : 100}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(data.accuracy + '%', W / 2, isPreview ? 150 : 300);
    
    ctx.font = `${isPreview ? 11 : 22}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText('正确率', W / 2, isPreview ? 190 : 380);
    
    // 其他数据
    ctx.font = `${isPreview ? 10 : 20}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`共答题 ${data.totalAnswered} 道`, W / 2, isPreview ? 250 : 500);
    ctx.fillText(`连续打卡 ${data.streakDays} 天`, W / 2, isPreview ? 280 : 560);
    ctx.fillText(`开启盲盒 ${data.blindboxOpened} 个`, W / 2, isPreview ? 310 : 620);
    
    // 底部
    ctx.font = `${isPreview ? 8 : 16}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.fillText('应急小达人 · 你能超过我吗？', W / 2, isPreview ? 630 : 1260);
  },
  
  _drawGlow(ctx, x, y, radius, color, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  ShareEngine.init();
});

// 添加分享按钮到统计页面
ShareEngine.init = function() {
  // 在统计页面添加分享按钮
  const checkInterval = setInterval(() => {
    const statsPage = document.getElementById('page-stats');
    if (statsPage && !statsPage.querySelector('.share-btn-float')) {
      const btn = document.createElement('button');
      btn.className = 'share-btn-float';
      btn.innerHTML = '📸 分享成绩';
      btn.onclick = () => ShareEngine.showShareModal();
      statsPage.appendChild(btn);
      clearInterval(checkInterval);
    }
  }, 500);
};

window.ShareEngine = ShareEngine;
