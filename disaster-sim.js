/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 灾害情景沉浸模拟 (比赛级)
 * ===========================================================================
 * 
 * 【功能】
 * 1. Canvas 动画重现真实灾害场景
 * 2. 4 种灾害模拟：地震/洪水/山火/台风
 * 3. 用户在动画进行中做出决策，增强紧迫感
 * 4. 真实案例标注（如"2008 汶川地震"）
 * 
 * @version 1.2.0
 * @date 2026-06-09
 * ===========================================================================
 */

const DisasterSimEngine = {
  _canvas: null,
  _ctx: null,
  _animFrame: null,
  _currentDisaster: null,
  _scenePhase: 0,
  _particles: [],
  _shakeIntensity: 0,
  _waterLevel: 0,
  _fireSpread: 0,
  _windSpeed: 0,
  
  _disasters: {
    earthquake: {
      name: '地震',
      icon: '🌍',
      color: '#FF6B35',
      case: '2008 汶川地震 · 8.0 级',
      desc: '突然感到强烈震动，家具开始摇晃，墙上的挂画掉落...'
    },
    flood: {
      name: '洪水',
      icon: '🌊',
      color: '#3B82F6',
      case: '2021 河南暴雨 · 千年一遇',
      desc: '窗外响起警报声，手机收到洪水预警，河水正在暴涨...'
    },
    wildfire: {
      name: '山火',
      icon: '🔥',
      color: '#EF4444',
      case: '2019 澳洲山火 · 烧毁千万公顷',
      desc: '远处浓烟滚滚，火势正在向你的方向蔓延...'
    },
    typhoon: {
      name: '台风',
      icon: '🌀',
      color: '#8B5CF6',
      case: '2023 台风杜苏芮 · 强台风级',
      desc: '狂风呼啸，窗户被吹得嘎嘎作响，暴雨倾盆...'
    }
  },
  
  init(disasterType) {
    this._currentDisaster = disasterType;
    this._scenePhase = 0;
    this._particles = [];
    this._shakeIntensity = 0;
    this._waterLevel = 0;
    this._fireSpread = 0;
    this._windSpeed = 0;
    
    // 隐藏选择器，显示模拟内容
    const selector = document.getElementById('simSelector');
    const canvasWrapper = document.getElementById('simCanvasWrapper');
    const info = document.getElementById('simInfo');
    const actions = document.getElementById('simActions');
    const result = document.getElementById('simResult');
    
    if (selector) selector.style.display = 'none';
    if (canvasWrapper) canvasWrapper.style.display = 'block';
    if (info) info.style.display = 'block';
    if (actions) actions.style.display = 'grid';
    if (result) result.style.display = 'none';
    
    this._canvas = document.getElementById('simCanvas');
    if (!this._canvas) return;
    
    this._ctx = this._canvas.getContext('2d');
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
    
    this.renderUI();
    this.startAnimation();
  },
  
  resize() {
    if (!this._canvas) return;
    const rect = this._canvas.parentElement.getBoundingClientRect();
    this._canvas.width = rect.width;
    this._canvas.height = Math.min(400, rect.height);
  },
  
  renderUI() {
    const d = this._disasters[this._currentDisaster];
    if (!d) return;
    
    const info = document.getElementById('simInfo');
    const actions = document.getElementById('simActions');
    
    if (info) {
      info.innerHTML = `
        <div class="sim-case-tag">${d.icon} ${d.case}</div>
        <div class="sim-scene">${d.desc}</div>
        <div class="sim-phase" id="simPhase">阶段：预警期</div>
      `;
    }
    
    if (actions) {
      actions.innerHTML = this._getActions();
    }
  },
  
  _getActions() {
    const actions = {
      earthquake: [
        { text: '🛡️ 躲在桌子下', correct: true },
        { text: '🚪 跑向门口', correct: false },
        { text: '🪟 站在窗户边', correct: false },
        { text: '📱 打电话求助', correct: false }
      ],
      flood: [
        { text: '⛰️ 向高地转移', correct: true },
        { text: '🏠 待在家里关窗', correct: false },
        { text: '🏊 游泳过河', correct: false },
        { text: '📸 拍照发朋友圈', correct: false }
      ],
      wildfire: [
        { text: '💨 逆风向逃跑', correct: true },
        { text: '🏃 顺着火跑', correct: false },
        { text: '🌊 跳进河里', correct: false },
        { text: '🚗 开车逃跑', correct: false }
      ],
      typhoon: [
        { text: '🏠 躲在室内小房间', correct: true },
        { text: '🪟 靠近窗户观望', correct: false },
        { text: '🌳 在树下避风', correct: false },
        { text: '🚶 外出查看情况', correct: false }
      ]
    };
    
    return (actions[this._currentDisaster] || []).map((a, i) => `
      <button class="sim-action-btn" onclick="DisasterSimEngine.makeChoice(${i}, ${a.correct})">
        ${a.text}
      </button>
    `).join('');
  },
  
  makeChoice(index, correct) {
    // 停止动画
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    
    const d = this._disasters[this._currentDisaster];
    
    // 显示结果
    const result = document.getElementById('simResult');
    if (result) {
      result.style.display = 'block';
      result.innerHTML = `
        <div class="sim-result ${correct ? 'correct' : 'wrong'}">
          <div class="sim-result-icon">${correct ? '✅' : '❌'}</div>
          <div class="sim-result-text">
            <h4>${correct ? '正确！' : '错误！'}</h4>
            <p>${this._getExplanation(correct)}</p>
          </div>
          <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">
            <button class="sim-continue-btn" onclick="DisasterSimEngine.continuePractice()" style="flex:1;min-width:120px;">
              ${correct ? '🎯 继续练习' : '💪 再试一次'}
            </button>
            <button class="sim-continue-btn" onclick="DisasterSimEngine.nextDisaster()" style="flex:1;min-width:120px;background:linear-gradient(135deg,#3b82f6,#2563eb);">
              ➡️ 下一题 →
            </button>
          </div>
        </div>
      `;
    }
    
    // 记录答题
    if (typeof AITutorEngine !== 'undefined') {
      AITutorEngine.recordAnswer(
        `sim_${this._currentDisaster}_${index}`,
        correct,
        this._currentDisaster
      );
    }
  },
  
  _getExplanation(correct) {
    const explanations = {
      earthquake: correct ? '地震时"伏地、遮挡、手抓牢"是国际通用的避险姿势，躲在坚固的桌子下可以防止被掉落物砸伤。' : '地震时不要跑向门口或窗户，这些地方最容易被掉落物砸伤。应该立即躲在坚固的桌子下。',
      flood: correct ? '洪水来临时应立即向高地转移，不要待在家里或游泳过河，非常危险！' : '洪水上涨时待在家里或游泳过河都非常危险！应该立即向高地转移。',
      wildfire: correct ? '山火逃生时应逆风向跑，用湿毛巾捂住口鼻，避开浓烟区域。' : '顺着火势跑会被火追上，开车可能被倒下的树阻挡。应该逆风向跑。',
      typhoon: correct ? '台风天应躲在室内最安全的小房间，远离窗户和广告牌。' : '台风天靠近窗户、在树下或外出都非常危险！应该躲在室内最安全的地方。'
    };
    return explanations[this._currentDisaster] || '';
  },
  
  nextDisaster() {
    // Go to next disaster type
    const types = Object.keys(this._disasters);
    const currentIdx = types.indexOf(this._currentDisaster);
    const nextIdx = (currentIdx + 1) % types.length;
    this.init(types[nextIdx]);
  },
  
  continuePractice() {
    // 重置 UI 到选择器
    const selector = document.getElementById('simSelector');
    const canvasWrapper = document.getElementById('simCanvasWrapper');
    const info = document.getElementById('simInfo');
    const actions = document.getElementById('simActions');
    const result = document.getElementById('simResult');
    
    if (selector) selector.style.display = 'grid';
    if (canvasWrapper) canvasWrapper.style.display = 'none';
    if (info) info.style.display = 'none';
    if (actions) actions.style.display = 'none';
    if (result) result.style.display = 'none';
  },
  
  // ===== 动画循环 =====
  startAnimation() {
    const animate = () => {
      this._scenePhase += 0.005;
      
      switch (this._currentDisaster) {
        case 'earthquake': this._drawEarthquake(); break;
        case 'flood': this._drawFlood(); break;
        case 'wildfire': this._drawWildfire(); break;
        case 'typhoon': this._drawTyphoon(); break;
      }
      
      // 更新阶段文字
      this._updatePhaseText();
      
      this._animFrame = requestAnimationFrame(animate);
    };
    
    this._animFrame = requestAnimationFrame(animate);
  },
  
  _updatePhaseText() {
    const phaseEl = document.getElementById('simPhase');
    if (!phaseEl) return;
    
    const p = this._scenePhase;
    if (p < 0.3) phaseEl.textContent = '阶段：预警期 ⚠️';
    else if (p < 0.6) phaseEl.textContent = '阶段：发生期 🔴';
    else phaseEl.textContent = '阶段：决策期 🎯';
  },
  
  // ===== 地震模拟 =====
  _drawEarthquake() {
    const ctx = this._ctx;
    const W = this._canvas.width;
    const H = this._canvas.height;
    const p = this._scenePhase;
    
    ctx.clearRect(0, 0, W, H);
    
    // 背景渐变
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1E293B');
    bg.addColorStop(1, '#0F172A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    
    // 震动效果
    this._shakeIntensity = Math.min(1, p * 3) * 8;
    const shakeX = (Math.random() - 0.5) * this._shakeIntensity;
    const shakeY = (Math.random() - 0.5) * this._shakeIntensity;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    // 房间
    ctx.fillStyle = '#334155';
    ctx.fillRect(40, 60, W - 80, H - 100);
    
    // 墙壁
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 60, W - 80, H - 100);
    
    // 地板
    ctx.fillStyle = '#475569';
    ctx.fillRect(40, H - 60, W - 80, 20);
    
    // 桌子
    ctx.fillStyle = '#92400E';
    ctx.fillRect(W / 2 - 60, H - 140, 120, 60);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(W / 2 - 55, H - 135, 110, 50);
    
    // 挂画（摇晃）
    const swing = Math.sin(p * 10) * 15 * Math.min(1, p * 2);
    ctx.save();
    ctx.translate(W / 3, 100);
    ctx.rotate(swing * Math.PI / 180);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-20, -15, 40, 30);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(-20, -15, 40, 30);
    ctx.restore();
    
    // 掉落物
    if (p > 0.2) {
      const dropCount = Math.floor((p - 0.2) * 8);
      for (let i = 0; i < dropCount; i++) {
        const x = 60 + (i * 50) % (W - 120);
        const y = H - 80 + (i % 3) * 15;
        ctx.fillStyle = ['#EF4444', '#F59E0B', '#3B82F6'][i % 3];
        ctx.fillRect(x, y, 8, 8);
      }
    }
    
    // 警告文字
    if (p < 0.3) {
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#EF4444';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ 地震预警！', W / 2, H / 2);
    }
    
    ctx.restore();
  },
  
  // ===== 洪水模拟 =====
  _drawFlood() {
    const ctx = this._ctx;
    const W = this._canvas.width;
    const H = this._canvas.height;
    const p = this._scenePhase;
    
    ctx.clearRect(0, 0, W, H);
    
    // 天空
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1E3A5F');
    sky.addColorStop(0.5, '#334155');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    
    // 雨滴
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 50; i++) {
      const x = (i * 17 + p * 200) % W;
      const y = (i * 23 + p * 500) % H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 10);
      ctx.stroke();
    }
    
    // 水位上涨
    this._waterLevel = Math.min(1, p * 1.5);
    const waterY = H - 40 - this._waterLevel * (H - 100);
    
    // 水
    const water = ctx.createLinearGradient(0, waterY, 0, H);
    water.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    water.addColorStop(1, 'rgba(30, 58, 95, 0.8)');
    ctx.fillStyle = water;
    ctx.fillRect(0, waterY, W, H - waterY);
    
    // 波浪
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < W; x += 5) {
      const y = waterY + Math.sin((x + p * 100) * 0.05) * 3;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // 房屋（被水淹）
    ctx.fillStyle = '#92400E';
    ctx.fillRect(W / 2 - 40, H - 120, 80, 80);
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 50, H - 120);
    ctx.lineTo(W / 2, H - 160);
    ctx.lineTo(W / 2 + 50, H - 120);
    ctx.closePath();
    ctx.fill();
    
    // 高地
    ctx.fillStyle = '#065F46';
    ctx.beginPath();
    ctx.moveTo(W - 120, H - 40);
    ctx.lineTo(W - 60, H - 100);
    ctx.lineTo(W - 20, H - 40);
    ctx.closePath();
    ctx.fill();
    
    // 警告
    if (p < 0.3) {
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#EF4444';
      ctx.textAlign = 'center';
      ctx.fillText('🌊 洪水警报！', W / 2, H / 2);
    }
  },
  
  // ===== 山火模拟 =====
  _drawWildfire() {
    const ctx = this._ctx;
    const W = this._canvas.width;
    const H = this._canvas.height;
    const p = this._scenePhase;
    
    ctx.clearRect(0, 0, W, H);
    
    // 天空（烟雾）
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#374151');
    sky.addColorStop(1, '#1F2937');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    
    // 烟雾
    ctx.fillStyle = 'rgba(107, 114, 128, 0.3)';
    for (let i = 0; i < 8; i++) {
      const x = (i * 60 + p * 50) % W;
      const y = 50 + i * 15;
      const r = 30 + Math.sin(p * 2 + i) * 10;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 地面
    ctx.fillStyle = '#065F46';
    ctx.fillRect(0, H - 60, W, 60);
    
    // 火势蔓延
    this._fireSpread = Math.min(1, p * 1.2);
    const fireX = W * (1 - this._fireSpread);
    
    // 火焰
    for (let i = 0; i < 20; i++) {
      const x = fireX + (i * 15) % (W * this._fireSpread);
      const baseY = H - 60;
      const height = 20 + Math.random() * 40;
      
      const fire = ctx.createLinearGradient(x, baseY, x, baseY - height);
      fire.addColorStop(0, '#EF4444');
      fire.addColorStop(0.5, '#F59E0B');
      fire.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = fire;
      
      ctx.beginPath();
      ctx.moveTo(x - 8, baseY);
      ctx.quadraticCurveTo(x - 5, baseY - height * 0.6, x, baseY - height);
      ctx.quadraticCurveTo(x + 5, baseY - height * 0.6, x + 8, baseY);
      ctx.closePath();
      ctx.fill();
    }
    
    // 火星
    ctx.fillStyle = '#FBBF24';
    for (let i = 0; i < 15; i++) {
      const x = fireX + Math.random() * W * this._fireSpread;
      const y = H - 80 - Math.random() * 100;
      const size = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 树木
    ctx.fillStyle = '#047857';
    for (let i = 0; i < 6; i++) {
      const x = 40 + i * 50;
      if (x > fireX) continue; // 被火烧掉
      ctx.beginPath();
      ctx.moveTo(x, H - 60);
      ctx.lineTo(x - 15, H - 100);
      ctx.lineTo(x + 15, H - 100);
      ctx.closePath();
      ctx.fill();
    }
    
    // 安全区域
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(0, 0, W * 0.15, H);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#10B981';
    ctx.textAlign = 'center';
    ctx.fillText('安全区', W * 0.075, H / 2);
    
    if (p < 0.3) {
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#EF4444';
      ctx.fillText('🔥 山火警报！', W / 2, 40);
    }
  },
  
  // ===== 台风模拟 =====
  _drawTyphoon() {
    const ctx = this._ctx;
    const W = this._canvas.width;
    const H = this._canvas.height;
    const p = this._scenePhase;
    
    ctx.clearRect(0, 0, W, H);
    
    // 天空
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1E3A5F');
    sky.addColorStop(1, '#111827');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    
    // 暴雨
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 60; i++) {
      const x = (i * 13 + p * 300) % (W + 100) - 50;
      const y = (i * 19 + p * 600) % H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 15, y + 20);
      ctx.stroke();
    }
    
    // 风的效果
    this._windSpeed = Math.min(1, p * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const y = 50 + i * 30;
      const x1 = (p * 400 + i * 80) % (W + 200) - 100;
      const x2 = x1 + 50 + this._windSpeed * 50;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y + 5);
      ctx.stroke();
    }
    
    // 房屋
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(W / 2 - 50, H - 140, 100, 100);
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, H - 140);
    ctx.lineTo(W / 2, H - 180);
    ctx.lineTo(W / 2 + 60, H - 140);
    ctx.closePath();
    ctx.fill();
    
    // 被风吹动的物体
    const blowX = Math.sin(p * 5) * 20 * this._windSpeed;
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(W / 2 - 15 + blowX, H - 80, 30, 20);
    
    // 窗户闪烁
    const flicker = Math.sin(p * 20) > 0.8;
    ctx.fillStyle = flicker ? '#FBBF24' : 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(W / 2 - 20, H - 120, 15, 15);
    ctx.fillRect(W / 2 + 5, H - 120, 15, 15);
    
    // 闪电
    if (Math.sin(p * 15) > 0.95) {
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2 - 20, H / 3);
      ctx.lineTo(W / 2 + 10, H / 2);
      ctx.lineTo(W / 2 - 5, H * 0.7);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
      ctx.fillRect(0, 0, W, H);
    }
    
    if (p < 0.3) {
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#8B5CF6';
      ctx.textAlign = 'center';
      ctx.fillText('🌀 台风警报！', W / 2, H / 2);
    }
  }
};
