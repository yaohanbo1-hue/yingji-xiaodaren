/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — BGM 增强引擎
 * ===========================================================================
 * 
 * 优化内容：
 * 1. 更丰富的和弦进行
 * 2. 多层音色叠加（钢琴+弦乐+环境音）
 * 3. 动态音量包络
 * 4. 场景自适应BGM切换
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const BGMEngineV2 = {
  _ctx: null,
  _masterGain: null,
  _limiter: null,
  _masterLP: null,
  _currentTrack: null,
  _pausedTrack: null,
  _playing: false,
  _volume: 0.13,
  _nodes: [],
  
  init() {
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      // 从静音起步，由 _fadeIn 平滑拉起，避免突发爆音
      this._masterGain.gain.value = 0.0001;
      
      // 主低通：削减刺耳高频，增加温暖感，听感更干净
      this._masterLP = this._ctx.createBiquadFilter();
      this._masterLP.type = 'lowpass';
      this._masterLP.frequency.value = 5200;
      this._masterLP.Q.value = 0.4;
      
      // 主总线限制器：防止多层振荡器叠加时削波/爆音
      this._limiter = this._ctx.createDynamicsCompressor();
      this._limiter.threshold.value = -12;
      this._limiter.knee.value = 12;
      this._limiter.ratio.value = 12;
      this._limiter.attack.value = 0.005;
      this._limiter.release.value = 0.25;
      
      this._masterGain.connect(this._masterLP);
      this._masterLP.connect(this._limiter);
      this._limiter.connect(this._ctx.destination);
      
      // 混响：经 reverbGain → 主音量总线（受主音量/限制器统一控制），不再直连 destination
      this._reverb = this._createReverb();
      this._reverbGain = this._ctx.createGain();
      this._reverbGain.gain.value = 0.16;
      this._reverb.connect(this._reverbGain);
      this._reverbGain.connect(this._masterGain);
      
      this._fadeIn();
    } catch (e) {
      console.warn('AudioContext not available');
    }
  },

  // 平滑淡入到目标主音量（切换/启动曲子时调用）
  _fadeIn() {
    if (!this._ctx || !this._masterGain) return;
    const t = this._ctx.currentTime;
    const g = this._masterGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(0.0001, g.value), t);
    g.linearRampToValueAtTime(this._volume, t + 0.4);
  },

  // 快速淡出（用于暂停等需要静音的场景）
  _fadeOut(cb) {
    if (!this._ctx || !this._masterGain) { if (cb) cb(); return; }
    const t = this._ctx.currentTime;
    const g = this._masterGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(0.0001, g.value), t);
    g.linearRampToValueAtTime(0.0001, t + 0.12);
    if (cb) setTimeout(cb, 140);
  },
  
  _createReverb() {
    const convolver = this._ctx.createConvolver();
    const rate = this._ctx.sampleRate;
    const length = rate * 2;
    const impulse = this._ctx.createBuffer(2, length, rate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    convolver.buffer = impulse;
    return convolver;
  },
  
  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._masterGain) {
      this._masterGain.gain.setTargetAtTime(this._volume, this._ctx.currentTime, 0.1);
    }
  },
  
  stop() {
    this._playing = false;
    this._nodes.forEach(n => {
      try { n.stop(); } catch(e) {}
    });
    this._nodes = [];
  },

  // 页面隐藏时暂停 BGM：停止调度循环 + 挂起音频上下文（立即静音）。
  // 记住当前曲目，待 resume() 时无缝续播。
  pause() {
    if (!this._ctx) return;
    this._pausedTrack = this._currentTrack || null;
    this._playing = false;
    this._nodes.forEach(n => { try { n.stop(); } catch (e) {} });
    this._nodes = [];
    if (this._ctx.state === 'running') {
      try { this._ctx.suspend(); } catch (e) {}
    }
  },

  // 页面恢复可见时恢复 BGM（仅当隐藏前正在播放）。
  resume() {
    if (!this._ctx) return;
    if (this._ctx.state === 'suspended') {
      try { this._ctx.resume(); } catch (e) {}
    }
    if (this._pausedTrack && !this._playing) {
      var t = this._pausedTrack;
      this._pausedTrack = null;
      if (t === 'menu') this.playMenu();
      else if (t === 'battle') this.playBattle();
      else if (t === 'scenario') this.playScenario();
    }
  },

  // 播放单个音符（带包络）
  _playNote(freq, startTime, duration, type = 'sine', volume = 0.1) {
    if (!this._ctx) return;
    
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    const filter = this._ctx.createBiquadFilter();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    // 低通滤波，让声音更柔和
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    
    // ADSR 包络
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05); // Attack
    gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.15); // Decay
    gain.gain.setValueAtTime(volume * 0.7, startTime + duration - 0.1); // Sustain
    gain.gain.linearRampToValueAtTime(0, startTime + duration); // Release
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    gain.connect(this._reverb);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    this._nodes.push(osc);
  },
  
  // 菜单BGM - 轻松愉快的钢琴旋律
  playMenu() {
    if (this._playing && this._currentTrack === 'menu') return;
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'menu';
    this._fadeIn();
    
    const bpm = 90;
    const beatDuration = 60 / bpm;
    
    // C大调钢琴和弦进行: C - Am - F - G
    const chordProgression = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66]  // G major
    ];
    
    // 旋律音符
    const melody = [
      523.25, 587.33, 659.25, 783.99, // C5 D5 E5 G5
      659.25, 587.33, 523.25, 493.88, // E5 D5 C5 B4
      440.00, 523.25, 587.33, 659.25, // A4 C5 D5 E5
      587.33, 523.25, 493.88, 440.00  // D5 C5 B4 A4
    ];
    
    const loop = () => {
      if (!this._playing) return;
      
      const now = this._ctx.currentTime;
      
      // 和弦（每4拍换一次）
      chordProgression.forEach((chord, i) => {
        chord.forEach(freq => {
          this._playNote(freq * 0.5, now + i * 4 * beatDuration, 3.5 * beatDuration, 'triangle', 0.035);
        });
      });
      
      // 旋律（每拍一个音）
      melody.forEach((freq, i) => {
        this._playNote(freq, now + i * beatDuration, beatDuration * 0.8, 'sine', 0.05);
      });
      
      // 低音
      const bassNotes = [130.81, 110.00, 87.31, 98.00]; // C3 A2 F2 G2
      bassNotes.forEach((freq, i) => {
        this._playNote(freq, now + i * 4 * beatDuration, 3.5 * beatDuration, 'triangle', 0.04);
      });
      
      // 循环
      setTimeout(loop, 16 * beatDuration * 1000);
    };
    
    loop();
  },
  
  // 战斗BGM - 紧张刺激（柔和波形，避免刺耳嘈杂）
  playBattle() {
    if (this._playing && this._currentTrack === 'battle') return;
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'battle';
    this._fadeIn();
    
    const bpm = 130;
    const beatDuration = 60 / bpm;
    
    // A小调和弦进行: Am - F - C - G
    const chordProgression = [
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [130.81, 164.81, 196.00], // C major
      [98.00, 123.47, 146.83]   // G major
    ];
    
    // 紧张的旋律
    const melody = [
      440, 493.88, 523.25, 587.33,
      523.25, 493.88, 440, 392,
      349.23, 392, 440, 523.25,
      493.88, 440, 392, 349.23
    ];
    
    const loop = () => {
      if (!this._playing) return;
      
      const now = this._ctx.currentTime;
      
      // 和弦（每2拍换一次，更紧凑）—— 改用柔和 triangle，避免锯齿波刺耳
      chordProgression.forEach((chord, i) => {
        chord.forEach(freq => {
          this._playNote(freq, now + i * 2 * beatDuration, 1.8 * beatDuration, 'triangle', 0.02);
        });
      });
      
      // 旋律（半拍节奏）—— sine 替代 square，干净不噪
      melody.forEach((freq, i) => {
        this._playNote(freq, now + i * beatDuration, beatDuration * 0.6, 'sine', 0.025);
      });
      
      // 鼓点模拟（低频脉冲，克制音量避免轰头）
      for (let i = 0; i < 8; i++) {
        this._playNote(60, now + i * 2 * beatDuration, 0.1, 'sine', 0.05);
        this._playNote(80, now + i * 2 * beatDuration + beatDuration, 0.08, 'sine', 0.035);
      }
      
      // 低音 —— triangle 替代锯齿波
      const bassNotes = [110, 87.31, 65.41, 73.42];
      bassNotes.forEach((freq, i) => {
        this._playNote(freq, now + i * 2 * beatDuration, 1.8 * beatDuration, 'triangle', 0.035);
      });
      
      setTimeout(loop, 16 * beatDuration * 1000);
    };
    
    loop();
  },
  
  // 情景BGM - 沉浸氛围
  playScenario() {
    if (this._playing && this._currentTrack === 'scenario') return;
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'scenario';
    this._fadeIn();
    
    const bpm = 70;
    const beatDuration = 60 / bpm;
    
    // 氛围和弦（加九和弦）
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj9
      [220.00, 261.63, 329.63, 440.00], // Am9
      [174.61, 220.00, 261.63, 349.23], // Fmaj9
      [196.00, 246.94, 293.66, 392.00]  // G9
    ];
    
    const loop = () => {
      if (!this._playing) return;
      
      const now = this._ctx.currentTime;
      
      // 长音和弦垫
      chords.forEach((chord, i) => {
        chord.forEach(freq => {
          this._playNote(freq * 0.5, now + i * 4 * beatDuration, 3.8 * beatDuration, 'sine', 0.03);
          this._playNote(freq, now + i * 4 * beatDuration, 3.8 * beatDuration, 'triangle', 0.02);
        });
      });
      
      // 稀疏的旋律点缀
      const sparseMelody = [523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0];
      sparseMelody.forEach((freq, i) => {
        if (freq > 0) {
          this._playNote(freq, now + i * 2 * beatDuration, 1.5 * beatDuration, 'sine', 0.04);
        }
      });
      
      setTimeout(loop, 16 * beatDuration * 1000);
    };
    
    loop();
  },
  
  // 胜利BGM
  playVictory() {
    this.stop();
    this.init();
    this._playing = true;
    this._fadeIn();
    
    const now = this._ctx.currentTime;
    const fanfare = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51];
    
    fanfare.forEach((freq, i) => {
      this._playNote(freq, now + i * 0.15, 0.3, 'sine', 0.08);
      this._playNote(freq * 0.5, now + i * 0.15, 0.3, 'triangle', 0.04);
    });
    
    setTimeout(() => this.playMenu(), fanfare.length * 150 + 500);
  }
};

// 自动初始化
document.addEventListener('click', () => BGMEngineV2.init(), { once: true });
document.addEventListener('touchstart', () => BGMEngineV2.init(), { once: true });

// 导出
window.BGMEngineV2 = BGMEngineV2;
