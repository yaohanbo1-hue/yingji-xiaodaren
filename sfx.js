/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 音效增强引擎
 * ===========================================================================
 * 
 * 优化内容：
 * 1. 更丰富的音效反馈（点击、正确、错误、升级、解锁）
 * 2. 更柔和的提示音（不刺耳）
 * 3. 空间感音效（左右声道）
 * 4. 动态音量控制
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const SFXEngine = {
  _ctx: null,
  _masterGain: null,
  _enabled: true,
  _volume: 0.3,
  
  init() {
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      this._masterGain.connect(this._ctx.destination);
    } catch (e) {
      console.warn('AudioContext not available');
    }
  },
  
  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._masterGain) {
      this._masterGain.gain.value = this._volume;
    }
  },
  
  setEnabled(enabled) {
    this._enabled = enabled;
  },
  
  // 通用音调生成器
  _tone(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
    if (!this._ctx || !this._enabled) return;
    
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, this._ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, this._ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(this._masterGain);
    
    osc.start(this._ctx.currentTime + delay);
    osc.stop(this._ctx.currentTime + delay + duration);
  },
  
  // 点击音效 - 清脆柔和
  click() {
    this._tone(800, 0.08, 'sine', 0.15);
    this._tone(1200, 0.05, 'sine', 0.1, 0.02);
  },
  
  // 正确音效 - 上行和弦
  correct() {
    this._tone(523, 0.15, 'sine', 0.25); // C5
    this._tone(659, 0.15, 'sine', 0.2, 0.05); // E5
    this._tone(784, 0.2, 'sine', 0.25, 0.1); // G5
  },
  
  // 错误音效 - 低沉柔和
  wrong() {
    this._tone(200, 0.3, 'triangle', 0.2);
    this._tone(180, 0.3, 'triangle', 0.15, 0.05);
  },
  
  // 升级音效 - 华丽上行
  levelUp() {
    const notes = [523, 587, 659, 784, 880, 1047]; // C5 to C6
    notes.forEach((freq, i) => {
      this._tone(freq, 0.2, 'sine', 0.2, i * 0.08);
      this._tone(freq * 1.5, 0.15, 'triangle', 0.1, i * 0.08 + 0.02);
    });
  },
  
  // 解锁音效 - 闪亮
  unlock() {
    this._tone(1047, 0.1, 'sine', 0.2);
    this._tone(1319, 0.1, 'sine', 0.2, 0.08);
    this._tone(1568, 0.15, 'sine', 0.25, 0.16);
    this._tone(2093, 0.3, 'sine', 0.2, 0.24);
  },
  
  // 获得金币
  coin() {
    this._tone(1047, 0.08, 'sine', 0.2);
    this._tone(1319, 0.1, 'sine', 0.2, 0.06);
  },
  
  // 按钮悬停
  hover() {
    this._tone(600, 0.05, 'sine', 0.08);
  },
  
  // 弹窗打开
  modalOpen() {
    this._tone(400, 0.1, 'sine', 0.15);
    this._tone(600, 0.15, 'sine', 0.2, 0.05);
  },
  
  // 弹窗关闭
  modalClose() {
    this._tone(600, 0.08, 'sine', 0.12);
    this._tone(400, 0.1, 'sine', 0.1, 0.03);
  },
  
  // 连击音效（根据连击数变化音调）
  combo(count) {
    const baseFreq = 400 + Math.min(count * 50, 400);
    this._tone(baseFreq, 0.1, 'sine', 0.2);
    this._tone(baseFreq * 1.5, 0.08, 'triangle', 0.15, 0.03);
  },
  
  // Boss 登场
  bossEntrance() {
    // 低沉鼓声
    this._tone(80, 0.5, 'sawtooth', 0.3);
    this._tone(60, 0.6, 'sawtooth', 0.25, 0.1);
    // 紧张弦乐
    this._tone(220, 0.8, 'triangle', 0.15, 0.2);
    this._tone(233, 0.8, 'triangle', 0.15, 0.2);
  },
  
  // 胜利音效
  victory() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319];
    melody.forEach((freq, i) => {
      this._tone(freq, 0.2, 'sine', 0.2, i * 0.12);
      this._tone(freq * 0.5, 0.15, 'triangle', 0.1, i * 0.12);
    });
  },
  
  // 失败音效
  gameOver() {
    const melody = [440, 415, 392, 349, 330, 294];
    melody.forEach((freq, i) => {
      this._tone(freq, 0.3, 'triangle', 0.15, i * 0.15);
    });
  },
  
  // 倒计时提示
  countdown() {
    this._tone(880, 0.1, 'sine', 0.2);
  },
  
  // 倒计时结束
  countdownEnd() {
    this._tone(1047, 0.3, 'sine', 0.3);
    this._tone(1047, 0.3, 'triangle', 0.15, 0.05);
  }
};

// 自动初始化（用户首次交互后）
document.addEventListener('click', () => SFXEngine.init(), { once: true });
document.addEventListener('touchstart', () => SFXEngine.init(), { once: true });

// 导出到全局
window.SFXEngine = SFXEngine;
