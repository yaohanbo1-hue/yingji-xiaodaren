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
  _currentTrack: null,
  _pausedTrack: null,
  _playing: false,
  _volume: 0.15,
  _nodes: [],
  
  init() {
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      
      // 添加混响效果
      this._reverb = this._createReverb();
      this._reverbGain = this._ctx.createGain();
      this._reverbGain.gain.value = 0.3;
      this._reverb.connect(this._reverbGain);
      this._reverbGain.connect(this._ctx.destination);
      
      this._masterGain.connect(this._ctx.destination);
    } catch (e) {
      console.warn('AudioContext not available');
    }
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
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'menu';
    
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
          this._playNote(freq * 0.5, now + i * 4 * beatDuration, 3.5 * beatDuration, 'triangle', 0.04);
        });
      });
      
      // 旋律（每拍一个音）
      melody.forEach((freq, i) => {
        this._playNote(freq, now + i * beatDuration, beatDuration * 0.8, 'sine', 0.06);
      });
      
      // 低音
      const bassNotes = [130.81, 110.00, 87.31, 98.00]; // C3 A2 F2 G2
      bassNotes.forEach((freq, i) => {
        this._playNote(freq, now + i * 4 * beatDuration, 3.5 * beatDuration, 'triangle', 0.05);
      });
      
      // 循环
      setTimeout(loop, 16 * beatDuration * 1000);
    };
    
    loop();
  },
  
  // 战斗BGM - 紧张刺激
  playBattle() {
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'battle';
    
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
      
      // 和弦（每2拍换一次，更紧凑）
      chordProgression.forEach((chord, i) => {
        chord.forEach(freq => {
          this._playNote(freq, now + i * 2 * beatDuration, 1.8 * beatDuration, 'sawtooth', 0.02);
          this._playNote(freq, now + i * 2 * beatDuration, 1.8 * beatDuration, 'triangle', 0.03);
        });
      });
      
      // 旋律（半拍节奏）
      melody.forEach((freq, i) => {
        this._playNote(freq, now + i * beatDuration, beatDuration * 0.6, 'square', 0.03);
      });
      
      // 鼓点模拟（低频脉冲）
      for (let i = 0; i < 8; i++) {
        this._playNote(60, now + i * 2 * beatDuration, 0.1, 'sine', 0.08);
        this._playNote(80, now + i * 2 * beatDuration + beatDuration, 0.08, 'sine', 0.05);
      }
      
      // 低音
      const bassNotes = [110, 87.31, 65.41, 73.42];
      bassNotes.forEach((freq, i) => {
        this._playNote(freq, now + i * 2 * beatDuration, 1.8 * beatDuration, 'sawtooth', 0.04);
      });
      
      setTimeout(loop, 16 * beatDuration * 1000);
    };
    
    loop();
  },
  
  // 情景BGM - 沉浸氛围
  playScenario() {
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'scenario';
    
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
