/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 防灾主题 BGM 引擎
 * ===========================================================================
 * 
 * 【主题音乐设计】
 * 专为防灾教育游戏设计，风格：勇敢、希望、使命感
 * 适合11岁小学生，不吓人、不紧张，充满正能量
 * 
 * 🎵 菜单音乐 — 《小勇士出发》
 * - 调性: C大调（明亮、希望）
 * - BPM: 88（轻快但不急躁）
 * - 风格: 像冒险队出发，有使命感
 * - 乐器: 钢琴(sine) + 铃铛(triangle) + 稳定低音
 * 
 * 🎵 挑战音乐 — 《快速反应》
 * - 调性: D大调（活力、进取）
 * - BPM: 112（答题节奏，刺激但可控）
 * - 风格: 像解谜闯关，有成就感
 * - 乐器: 明亮方波 + 行走低音 + 轻快节奏
 * 
 * 🎵 情景音乐 — 《安全演练》
 * - 调性: A小调→C大调（从谨慎到希望）
 * - BPM: 76（沉浸、专注）
 * - 风格: 像老师在讲解，认真但不害怕
 * - 乐器: 柔和长音 + 环境氛围 + 偶尔铃音
 * 
 * 🎵 胜利音乐 — 《救援成功》
 * - 调性: C大调（ triumphant ）
 * - 风格: 明亮欢呼，像完成任务获得勋章
 * 
 * 【技术特点】
 * - 纯 Web Audio API 生成，零外部文件
 * - 自适应音量，不会太吵
 * - 循环播放，无缝衔接
 * ===========================================================================
 */

const BGMEngineV2 = {
  _ctx: null,
  _masterGain: null,
  _reverb: null,
  _reverbGain: null,
  _currentTrack: null,
  _playing: false,
  _volume: 0.15,
  _nodes: [],
  _timeoutId: null,
  
  init() {
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      
      // 添加混响效果，让音乐更有空间感
      this._reverb = this._createReverb();
      this._reverbGain = this._ctx.createGain();
      this._reverbGain.gain.value = 0.25;
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
    const length = rate * 1.5;
    const impulse = this._ctx.createBuffer(2, length, rate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
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
    this._wasPlaying = false;
    this._pausedTrack = null;
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
    this._nodes.forEach(n => {
      try { n.stop(); } catch(e) {}
    });
    this._nodes = [];
  },

  pause() {
    if (this._playing) {
      this._wasPlaying = true;
      this._pausedTrack = this._currentTrack;
      this.stop();
    }
  },

  resume() {
    if (this._wasPlaying && this._pausedTrack) {
      this._wasPlaying = false;
      switch (this._pausedTrack) {
        case 'menu': this.playMenu(); break;
        case 'battle': this.playBattle(); break;
        case 'scenario': this.playScenario(); break;
        case 'victory': this.playVictory(); break;
      }
      this._pausedTrack = null;
    }
  },
  
  // 播放单个音符（带 ADSR 包络）
  _playNote(freq, startTime, duration, type = 'sine', volume = 0.1) {
    if (!this._ctx || !this._playing) return;
    
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    const filter = this._ctx.createBiquadFilter();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    // 低通滤波，让声音更柔和，不刺耳
    filter.type = 'lowpass';
    filter.frequency.value = 2500;
    filter.Q.value = 0.8;
    
    // ADSR 包络：Attack-Decay-Sustain-Release
    const attackTime = startTime + 0.04;
    const decayTime = startTime + 0.2;
    const sustainTime = Math.max(decayTime, startTime + duration - 0.1);
    const releaseTime = Math.max(sustainTime, startTime + duration);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, attackTime);      // Attack
    gain.gain.linearRampToValueAtTime(volume * 0.6, decayTime); // Decay
    gain.gain.setValueAtTime(volume * 0.6, sustainTime);       // Sustain
    gain.gain.linearRampToValueAtTime(0, releaseTime);          // Release
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    gain.connect(this._reverb);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    this._nodes.push(osc);
  },
  
  // ===== 🎵 菜单音乐 — 《小勇士出发》 =====
  // 明亮、希望、有使命感，像救援队准备出发
  playMenu() {
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'menu';
    
    const bpm = 88;
    const beat = 60 / bpm;
    
    // C大调 希望感和弦：C - G - Am - F
    const chords = [
      [261.63, 329.63, 392.00],      // C major (do mi sol)
      [196.00, 246.94, 293.66],      // G major (sol ti re)
      [220.00, 261.63, 329.63],      // A minor (la do mi)
      [174.61, 220.00, 261.63]       // F major (fa la do)
    ];
    
    // 主旋律 — "小勇士出发" 上行音阶，有前进感
    const melody = [
      523.25, 587.33, 659.25, 783.99,  // C5 D5 E5 G5 — "出发！"
      659.25, 587.33, 523.25, 493.88,  // E5 D5 C5 B4 — "向前冲"
      440.00, 523.25, 587.33, 659.25,  // A4 C5 D5 E5 — "不怕难"
      783.99, 659.25, 587.33, 523.25   // G5 E5 D5 C5 — "我最棒"
    ];
    
    // 铃铛装饰音 — 模拟警报/希望之光（偶尔出现）
    const bell = [
      1046.50, 0, 0, 0, 0, 0, 1318.51, 0, 0, 0, 0, 0, 1174.66, 0, 0, 0
    ];
    
    const loop = () => {
      if (!this._playing || this._currentTrack !== 'menu') return;
      
      const now = this._ctx.currentTime;
      
      // 和弦铺垫（每4拍换一次，温暖饱满）
      chords.forEach((chord, i) => {
        chord.forEach((freq, j) => {
          // 根音更响，其他音柔和
          const vol = j === 0 ? 0.05 : 0.03;
          this._playNote(freq * 0.5, now + i * 4 * beat, 3.8 * beat, 'triangle', vol);
        });
      });
      
      // 主旋律（每拍一个音，明亮清晰）
      melody.forEach((freq, i) => {
        this._playNote(freq, now + i * beat, beat * 0.9, 'sine', 0.07);
      });
      
      // 低音进行（稳定的脚步感）
      const bass = [130.81, 98.00, 110.00, 87.31]; // C3 G2 A2 F2
      bass.forEach((freq, i) => {
        this._playNote(freq, now + i * 4 * beat, 3.8 * beat, 'triangle', 0.05);
      });
      
      // 铃铛装饰音（轻盈闪烁）
      bell.forEach((freq, i) => {
        if (freq > 0) {
          this._playNote(freq, now + i * beat, 0.15, 'sine', 0.04);
        }
      });
      
      // 16拍后循环
      this._timeoutId = setTimeout(loop, 16 * beat * 1000);
    };
    
    loop();
  },
  
  // ===== 🎵 挑战音乐 — 《快速反应》 =====
  // 活力、有节奏，像答题闯关时的兴奋感
  playBattle() {
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'battle';
    
    const bpm = 112;
    const beat = 60 / bpm;
    
    // D大调 进取感和弦：D - Bm - G - A
    const chords = [
      [293.66, 369.99, 440.00],      // D major
      [246.94, 293.66, 369.99],      // B minor
      [196.00, 246.94, 293.66],      // G major
      [220.00, 261.63, 329.63]       // A major
    ];
    
    // 快节奏旋律 — 有跳跃感，像"快速答题"
    const melody = [
      587.33, 0, 659.25, 587.33,  // D5 空 E5 D5
      0, 523.25, 587.33, 659.25,   // 空 C5 D5 E5
      783.99, 0, 659.25, 587.33,   // G5 空 E5 D5
      0, 523.25, 587.33, 0         // 空 C5 D5 空
    ];
    
    const loop = () => {
      if (!this._playing || this._currentTrack !== 'battle') return;
      
      const now = this._ctx.currentTime;
      
      // 和弦（每2拍，更紧凑）
      chords.forEach((chord, i) => {
        chord.forEach((freq, j) => {
          const vol = j === 0 ? 0.04 : 0.025;
          this._playNote(freq, now + i * 2 * beat, 1.9 * beat, 'triangle', vol);
        });
      });
      
      // 旋律（半拍节奏，跳跃感）
      melody.forEach((freq, i) => {
        if (freq > 0) {
          this._playNote(freq, now + i * beat * 0.5, beat * 0.4, 'sine', 0.06);
        }
      });
      
      // 行走低音（有推进感）
      const bass = [146.83, 123.47, 98.00, 110.00]; // D3 B2 G2 A2
      bass.forEach((freq, i) => {
        this._playNote(freq, now + i * 2 * beat, 1.9 * beat, 'triangle', 0.05);
      });
      
      // 轻快节奏（模拟鼓点，用短促低频）
      for (let i = 0; i < 8; i++) {
        this._playNote(80, now + i * beat, 0.08, 'sine', 0.06);  // 重拍
        this._playNote(100, now + i * beat + beat * 0.5, 0.06, 'sine', 0.03); // 轻拍
      }
      
      this._timeoutId = setTimeout(loop, 16 * beat * 1000);
    };
    
    loop();
  },
  
  // ===== 🎵 情景音乐 — 《安全演练》 =====
  // 沉浸、专注，像认真听老师讲解防灾知识
  playScenario() {
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'scenario';
    
    const bpm = 76;
    const beat = 60 / bpm;
    
    // A小调→C大调：从谨慎到希望，表示"危险但可控"
    const chords = [
      [220.00, 261.63, 329.63],      // A minor
      [261.63, 329.63, 392.00],      // C major (希望出现)
      [174.61, 220.00, 261.63],      // F major
      [196.00, 246.94, 293.66]       // G major
    ];
    
    // 稀疏旋律 — 像认真思考时的脑内声音
    const sparseMelody = [
      440.00, 0, 523.25, 0, 659.25, 0, 0, 0,
      587.33, 0, 523.25, 0, 440.00, 0, 493.88, 0
    ];
    
    // 环境音 — 模拟风声/远处声音（用非常低的音量）
    const ambient = [
      329.63, 0, 0, 392.00, 0, 0, 293.66, 0,
      0, 349.23, 0, 0, 261.63, 0, 0, 0
    ];
    
    const loop = () => {
      if (!this._playing || this._currentTrack !== 'scenario') return;
      
      const now = this._ctx.currentTime;
      
      // 长音和弦（缓慢、温暖，像老师温柔的讲解）
      chords.forEach((chord, i) => {
        chord.forEach((freq, j) => {
          const vol = j === 0 ? 0.04 : 0.025;
          this._playNote(freq * 0.5, now + i * 4 * beat, 3.8 * beat, 'sine', vol);
          // 八度叠加，增加厚度
          this._playNote(freq, now + i * 4 * beat, 3.8 * beat, 'triangle', vol * 0.6);
        });
      });
      
      // 稀疏旋律（偶尔出现，不打扰思考）
      sparseMelody.forEach((freq, i) => {
        if (freq > 0) {
          this._playNote(freq, now + i * beat, 1.5 * beat, 'sine', 0.04);
        }
      });
      
      // 环境音（极轻，营造氛围）
      ambient.forEach((freq, i) => {
        if (freq > 0) {
          this._playNote(freq, now + i * beat * 2, 2.5 * beat, 'sine', 0.015);
        }
      });
      
      // 偶尔铃音（像警报声但很柔和，提醒注意安全）
      if (Math.random() > 0.6) {
        this._playNote(880, now + 8 * beat, 0.2, 'sine', 0.02);
      }
      
      this._timeoutId = setTimeout(loop, 16 * beat * 1000);
    };
    
    loop();
  },
  
  // ===== 🎵 胜利音乐 — 《救援成功》 =====
  // 明亮、欢呼，像完成任务获得勋章
  playVictory() {
    this.stop();
    this.init();
    this._playing = true;
    this._currentTrack = 'victory';
    
    const now = this._ctx.currentTime;
    
    // 明亮上行琶音 — "你做到了！"
    const fanfare = [
      523.25, 659.25, 783.99, 1046.50,   // C5 E5 G5 C6
      783.99, 1046.50, 1318.51, 1567.98  // G5 C6 E6 G6
    ];
    
    // 和弦伴奏
    const chordNotes = [261.63, 329.63, 392.00, 523.25];
    
    // 主旋律
    fanfare.forEach((freq, i) => {
      this._playNote(freq, now + i * 0.12, 0.35, 'sine', 0.09);
      this._playNote(freq * 0.5, now + i * 0.12, 0.35, 'triangle', 0.05);
    });
    
    // 和弦
    chordNotes.forEach((freq, i) => {
      this._playNote(freq, now + i * 0.12, 0.5, 'triangle', 0.04);
    });
    
    // 最后长音
    this._playNote(1046.50, now + 1.2, 0.8, 'sine', 0.08);
    this._playNote(1318.51, now + 1.4, 0.6, 'sine', 0.06);
    
    // 胜利音乐播完后，自动回到菜单音乐
    this._timeoutId = setTimeout(() => {
      if (this._currentTrack === 'victory') {
        this.playMenu();
      }
    }, 2500);
  }
};

// 自动初始化：用户第一次点击或触摸时启动音频
function initAudio() {
  BGMEngineV2.init();
}

document.addEventListener('click', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });

// 导出到全局
window.BGMEngineV2 = BGMEngineV2;

// ===== BGMEngine 兼容层 =====
// 将旧版 BGMEngine API 代理到 BGMEngineV2
const BGMEngine = {
  init() { BGMEngineV2.init(); },
  playMenuBgm() { BGMEngineV2.playMenu(); },
  playBattleBgm() { BGMEngineV2.playBattle(); },
  playScenarioBgm() { BGMEngineV2.playScenario(); },
  playVictoryBgm() { BGMEngineV2.playVictory(); },
  stop() { BGMEngineV2.stop(); },
  pause() { BGMEngineV2.pause(); },
  resume() { BGMEngineV2.resume(); },
  setVolume(v) {
    BGMEngineV2.setVolume(v);
    // 同步到 GameState 持久化
    if (typeof GameState !== 'undefined' && GameState._data && GameState._data.settings) {
      GameState._data.settings.bgmVolume = Math.round(v * 100);
      if (typeof GameState.save === 'function') GameState.save();
    }
  },
  setBPM(bpm) { /* BGMEngineV2 内部管理 BPM，无需外部设置 */ }
};
window.BGMEngine = BGMEngine;
