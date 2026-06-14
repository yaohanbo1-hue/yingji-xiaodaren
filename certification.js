/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 能力认证体系 (比赛级)
 * ===========================================================================
 * 
 * 【功能】
 * 1. 5 级认证系统：青铜 → 白银 → 黄金 → 钻石 → 大师
 * 2. 动态升级条件：答题正确率 + 模块掌握度 + 练习次数
 * 3. 可打印证书：HTML Canvas 渲染，含防伪水印
 * 4. 成就徽章：玻璃态卡片 + 动画效果
 * 
 * @version 1.2.0
 * @date 2026-06-09
 * ===========================================================================
 */

const CertificationEngine = {
  _levels: [
    {
      name: '青铜卫士',
      icon: '🥉',
      color: '#CD7F32',
      gradient: 'linear-gradient(135deg, #CD7F32, #A0522D)',
      requirement: { totalAnswered: 10, accuracy: 40, masteredModules: 1 },
      desc: '完成 10 道题，正确率 40%+'
    },
    {
      name: '白银先锋',
      icon: '🥈',
      color: '#C0C0C0',
      gradient: 'linear-gradient(135deg, #E8E8E8, #A8A8A8)',
      requirement: { totalAnswered: 50, accuracy: 55, masteredModules: 3 },
      desc: '完成 50 道题，正确率 55%+'
    },
    {
      name: '黄金勇士',
      icon: '🥇',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
      requirement: { totalAnswered: 100, accuracy: 70, masteredModules: 6 },
      desc: '完成 100 道题，正确率 70%+'
    },
    {
      name: '钻石专家',
      icon: '💎',
      color: '#B9F2FF',
      gradient: 'linear-gradient(135deg, #B9F2FF, #00BFFF)',
      requirement: { totalAnswered: 200, accuracy: 80, masteredModules: 9 },
      desc: '完成 200 道题，正确率 80%+'
    },
    {
      name: '防灾大师',
      icon: '🏆',
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
      requirement: { totalAnswered: 300, accuracy: 90, masteredModules: 12 },
      desc: '完成 300 道题，正确率 90%+'
    }
  ],
  
  _data: null,
  
  init() {
    this.loadData();
    this.checkProgress();
    this.renderPage();
  },
  
  loadData() {
    const saved = localStorage.getItem('certificationData');
    if (saved) {
      try {
        this._data = JSON.parse(saved);
      } catch (e) {
        this._data = this._getEmptyData();
      }
    } else {
      this._data = this._getEmptyData();
    }
  },
  
  _getEmptyData() {
    return {
      currentLevel: -1, // -1 表示未获得任何认证
      unlockedLevels: [],
      certificates: [],
      totalSessions: 0
    };
  },
  
  saveData() {
    localStorage.setItem('certificationData', JSON.stringify(this._data));
  },
  
  // ===== 检查进度 =====
  checkProgress() {
    const aiData = JSON.parse(localStorage.getItem('aiTutorData') || '{}');
    const mastery = aiData.mastery || {};
    const history = aiData.quizHistory || [];
    
    const totalAnswered = history.length;
    const correctCount = history.filter(h => h.correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const masteredModules = Object.values(mastery).filter(s => s >= 80).length;
    
    // 检查每个等级
    this._levels.forEach((level, index) => {
      if (this._data.unlockedLevels.includes(index)) return;
      
      const req = level.requirement;
      const passed = 
        totalAnswered >= req.totalAnswered &&
        accuracy >= req.accuracy &&
        masteredModules >= req.masteredModules;
      
      if (passed && !this._data.unlockedLevels.includes(index)) {
        this._data.unlockedLevels.push(index);
        this._data.currentLevel = Math.max(this._data.currentLevel, index);
        this._data.certificates.push({
          level: index,
          date: new Date().toISOString(),
          totalAnswered,
          accuracy,
          masteredModules
        });
        
        // 显示升级通知
        setTimeout(() => this.showLevelUpNotification(level, index), 500);
      }
    });
    
    this._data.totalSessions++;
    this.saveData();
  },
  
  showLevelUpNotification(level, levelIndex) {
    if (typeof Modal !== 'undefined') {
      Modal.show(
        `🎉 恭喜获得 ${level.icon} ${level.name} 认证！`,
        `
        <div style="text-align:center;padding:10px 0">
          <div style="font-size:48px;margin-bottom:12px">${level.icon}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:16px">
            ${level.desc}
          </div>
          <button class="btn btn-primary" onclick="CertificationEngine.showCertificate(${levelIndex})" 
            style="background:${level.gradient};border:none;padding:10px 24px;border-radius:12px;color:#fff;font-weight:600;cursor:pointer;font-size:14px">
            📜 查看证书
          </button>
        </div>
        `,
        level.icon
      );
    }
  },
  
  // ===== 渲染页面 =====
  renderPage() {
    const container = document.getElementById('certContent');
    if (!container) return;
    
    const aiData = JSON.parse(localStorage.getItem('aiTutorData') || '{}');
    const history = aiData.quizHistory || [];
    const mastery = aiData.mastery || {};
    const totalAnswered = history.length;
    const correctCount = history.filter(h => h.correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const masteredModules = Object.values(mastery).filter(s => s >= 80).length;
    
    container.innerHTML = `
      <!-- 当前等级卡片 -->
      <div class="cert-current-card">
        <div class="cert-current-header">
          <div class="cert-level-badge ${this._data.currentLevel >= 0 ? 'unlocked' : 'locked'}">
            ${this._data.currentLevel >= 0 ? this._levels[this._data.currentLevel].icon : '🔒'}
          </div>
          <div class="cert-level-info">
            <h3>${this._data.currentLevel >= 0 ? this._levels[this._data.currentLevel].name : '未认证'}</h3>
            <p>${this._data.currentLevel >= 0 ? this._levels[this._data.currentLevel].desc : '完成答题即可获得认证'}</p>
          </div>
        </div>
        <div class="cert-progress-ring">
          <canvas id="progressRingCanvas" width="160" height="160"></canvas>
          <div class="progress-ring-text">
            <div class="progress-value">${this._data.currentLevel >= 0 ? Math.round((this._data.currentLevel + 1) / 5 * 100) : 0}%</div>
            <div class="progress-label">认证进度</div>
          </div>
        </div>
      </div>
      
      <!-- 统计数据 -->
      <div class="cert-stats-card">
        <h3>📊 当前数据</h3>
        <div class="cert-stats-grid">
          <div class="cert-stat-item">
            <div class="cert-stat-value">${totalAnswered}</div>
            <div class="cert-stat-label">已答题</div>
          </div>
          <div class="cert-stat-item">
            <div class="cert-stat-value">${accuracy}%</div>
            <div class="cert-stat-label">正确率</div>
          </div>
          <div class="cert-stat-item">
            <div class="cert-stat-value">${masteredModules}</div>
            <div class="cert-stat-label">已掌握模块</div>
          </div>
          <div class="cert-stat-item">
            <div class="cert-stat-value">${this._data.unlockedLevels.length}</div>
            <div class="cert-stat-label">已获得认证</div>
          </div>
        </div>
      </div>
      
      <!-- 等级列表 -->
      <div class="cert-levels-card">
        <h3>🏅 认证等级</h3>
        <div class="cert-levels-list">
          ${this._levels.map((level, index) => {
            const unlocked = this._data.unlockedLevels.includes(index);
            const req = level.requirement;
            const progress = Math.min(100, Math.round(
              ((totalAnswered / req.totalAnswered) * 30 +
               (accuracy / req.accuracy) * 40 +
               (masteredModules / req.masteredModules) * 30)
            ));
            
            return `
              <div class="cert-level-item ${unlocked ? 'unlocked' : ''}">
                <div class="cert-level-left">
                  <div class="cert-level-icon" style="background:${unlocked ? level.gradient : 'rgba(255,255,255,0.05)'}">
                    ${level.icon}
                  </div>
                  <div class="cert-level-details">
                    <h4>${level.name}</h4>
                    <p>${level.desc}</p>
                  </div>
                </div>
                <div class="cert-level-right">
                  ${unlocked ? 
                    `<button class="cert-view-btn" onclick="CertificationEngine.showCertificate(${index})">查看证书</button>` :
                    `<div class="cert-progress-bar">
                      <div class="cert-progress-fill" style="width:${progress}%;background:${level.gradient}"></div>
                    </div>
                    <span class="cert-progress-text">${progress}%</span>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    // 绘制进度环
    this.drawProgressRing();
  },
  
  drawProgressRing() {
    const canvas = document.getElementById('progressRingCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = 65;
    const lineWidth = 8;
    
    const progress = this._data.currentLevel >= 0 ? 
      ((this._data.currentLevel + 1) / 5) : 0;
    
    ctx.clearRect(0, 0, W, H);
    
    // 背景环
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // 进度环
    ctx.beginPath();
    ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, '#60A5FA');
    gradient.addColorStop(1, '#A78BFA');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  },
  
  // ===== 显示证书 =====
  showCertificate(levelIndex) {
    const level = this._levels[levelIndex];
    const cert = this._data.certificates.find(c => c.level === levelIndex);
    if (!cert) return;
    
    const date = new Date(cert.date);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    
    // 创建证书模态框
    const overlay = document.createElement('div');
    overlay.className = 'cert-modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    
    overlay.innerHTML = `
      <div class="cert-modal-content">
        <div class="cert-modal-header">
          <h3>📜 认证证书</h3>
          <button class="cert-modal-close" onclick="this.closest('.cert-modal-overlay').remove()">✕</button>
        </div>
        <div class="cert-canvas-wrapper">
          <canvas id="certificateCanvas" width="800" height="560"></canvas>
        </div>
        <div class="cert-modal-actions">
          <button class="cert-download-btn" onclick="CertificationEngine.downloadCertificate(${levelIndex})">
            💾 下载证书
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 渲染证书
    setTimeout(() => this.drawCertificate(levelIndex, cert), 100);
  },
  
  drawCertificate(levelIndex, cert) {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const level = this._levels[levelIndex];
    
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, '#0F172A');
    bgGradient.addColorStop(1, '#1E293B');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);
    
    // 边框
    ctx.strokeStyle = level.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    
    // 内边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    
    // 装饰角
    const drawCorner = (x, y, angle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 0);
      ctx.lineTo(0, 40);
      ctx.closePath();
      ctx.fillStyle = level.color;
      ctx.fill();
      ctx.restore();
    };
    
    drawCorner(30, 30, 0);
    drawCorner(W - 30, 30, Math.PI / 2);
    drawCorner(30, H - 30, -Math.PI / 2);
    drawCorner(W - 30, H - 30, Math.PI);
    
    // 标题
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText('应急小达人', W / 2, 80);
    
    ctx.font = '20px -apple-system, sans-serif';
    ctx.fillStyle = level.color;
    ctx.fillText('能力认证证书', W / 2, 120);
    
    // 徽章
    ctx.font = '64px sans-serif';
    ctx.fillText(level.icon, W / 2, 200);
    
    // 等级名称
    ctx.font = 'bold 36px -apple-system, sans-serif';
    ctx.fillStyle = level.color;
    ctx.fillText(level.name, W / 2, 270);
    
    // 描述
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText(level.desc, W / 2, 310);
    
    // 数据
    const date = new Date(cert.date);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.fillText(`答题数：${cert.totalAnswered} 道  |  正确率：${cert.accuracy}%  |  掌握模块：${cert.masteredModules}/12`, W / 2, 370);
    
    // 日期
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.fillText(dateStr, W / 2, 420);
    
    // 防伪水印
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = 'bold 80px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillText('防灾认证', 0, 0);
    ctx.restore();
    
    // 编号
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.fillText(`CERT-${date.getTime().toString(36).toUpperCase()}`, W / 2, H - 50);
  },
  
  downloadCertificate(levelIndex) {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `防灾认证_${this._levels[levelIndex].name}_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
};

// 页面激活时自动初始化
document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('page-certification');
  if (page) {
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class' && m.target.classList.contains('active')) {
          CertificationEngine.init();
        }
      });
    }).observe(page, { attributes: true, attributeFilter: ['class'] });
  }
});
