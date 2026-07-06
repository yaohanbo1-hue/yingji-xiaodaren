/**
 * ===========================================================================
 * 应急小达人 v1.3.4 — 音效增强引擎 (Pro Audio Engine)
 * ===========================================================================
 *
 * 相对 v1.2.0 的核心升级：
 *  1. 🎧 立体声声相 (StereoPanner)：真正实现注释中承诺的"空间感"，
 *     不同音效分布在左右声道，听感更立体、不挤在中间。
 *  2. 🌌 卷积混响 (ConvolverNode)：程序生成的脉冲响应，给升级/解锁/
 *     胜利等"华丽"音效加上空间回响，告别干瘪。
 *  3. 🛡️ 动态限制器 (DynamicsCompressor)：作为总线最后一道防线，
 *     彻底杜绝多个音效叠加时的爆音与削波。
 *  4. 🎚️ 平滑包络：所有音效统一 attack(防爆音) + 指数 release(自然收尾)，
 *     高频短音不再刺耳。
 *  5. 🎼 饱满音色：和弦类音效叠加根音/泛音层 + 轻微低通滤波，
 *     声音更温暖厚实，而非单薄的正弦波。
 *  6. 🔊 新增音效：toggle / select / tab / notify / tick / error / success / swipe，
 *     供后续 UI 交互按需调用，完全向后兼容旧调用方。
 *
 * 公开 API 与 v1.2.0 100% 兼容：click / correct / wrong / levelUp / unlock /
 * coin / hover / modalOpen / modalClose / combo / bossEntrance / victory /
 * gameOver / countdown / countdownEnd 的方法名与参数顺序不变。
 *
 * @version 1.3.4
 * ===========================================================================
 */

const SFXEngine = {
  _ctx: null,
  _masterGain: null,
  _compressor: null,        // 总线限制器（防爆音）
  _reverb: null,            // 卷积混响
  _reverbGain: null,        // 混响输出音量
  _reverbInput: null,       // 混响发送总线
  _noiseBuf: null,          // 白噪声 buffer（打击感/风声）
  _supportPanner: false,    // 浏览器是否支持 StereoPanner
  _enabled: true,
  _volume: 0.32,            // 主音量（略高于旧版 0.3，配合限制器更稳）
  _muted: false,

  init() {
    if (this._ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this._ctx = new AC();
      this._supportPanner = typeof this._ctx.createStereoPanner === 'function';

      // --- 主增益 ---
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;

      // --- 总线限制器：防止多音叠加爆音/削波 ---
      this._compressor = this._ctx.createDynamicsCompressor();
      this._compressor.threshold.value = -10;
      this._compressor.knee.value = 6;
      this._compressor.ratio.value = 20;
      this._compressor.attack.value = 0.003;
      this._compressor.release.value = 0.25;

      this._masterGain.connect(this._compressor);
      this._compressor.connect(this._ctx.destination);

      // --- 混响支路：混响输入 → Convolver → 混响增益 → 限制器 ---
      this._reverbInput = this._ctx.createGain();
      this._reverb = this._ctx.createConvolver();
      this._reverb.buffer = this._buildReverbIR(1.6, 2.6);
      this._reverbGain = this._ctx.createGain();
      this._reverbGain.gain.value = 0.85;
      this._reverbInput.connect(this._reverb);
      this._reverb.connect(this._reverbGain);
      this._reverbGain.connect(this._compressor);

      // --- 白噪声 buffer（用于打击感 / 风声）---
      this._noiseBuf = this._buildNoise(1.0);

      console.log('🔊 SFXEngine Pro initialized (stereo + reverb + limiter)');
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  },

  // 生成混响脉冲响应（衰减噪声）
  _buildReverbIR(seconds, decay) {
    const rate = this._ctx.sampleRate;
    const len = Math.max(1, Math.floor(rate * seconds));
    const buf = this._ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // 轻微早反射 + 指数衰减尾音，听感更自然
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }
    return buf;
  },

  // 生成白噪声 buffer
  _buildNoise(seconds) {
    const len = Math.max(1, Math.floor(this._ctx.sampleRate * seconds));
    const buf = this._ctx.createBuffer(1, len, this._ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  },

  // 创建立体声声相节点（不支持时返回 null 作安全降级）
  _makePanner(pan) {
    if (!this._supportPanner || !pan) return null;
    try {
      const p = this._ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      return p;
    } catch (e) {
      return null;
    }
  },

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._masterGain) {
      this._masterGain.gain.setTargetAtTime(this._volume, this._ctx.currentTime, 0.02);
    }
  },

  getVolume() {
    return this._volume;
  },

  setEnabled(enabled) {
    this._enabled = !!enabled;
    this._muted = !this._enabled;
    if (this._masterGain && this._ctx) {
      this._masterGain.gain.setTargetAtTime(
        this._enabled ? this._volume : 0,
        this._ctx.currentTime, 0.02
      );
    }
  },

  // ===== 通用音调生成器（带平滑包络 / 声相 / 混响 / 谐波层）=====
  // opts: { freq, duration, type, volume, delay, pan, reverbSend,
  //         attack, release, detune, harmonic:{ratio,gain,type} }
  _tone(opts) {
    if (!this._ctx || !this._enabled) return;
    const o = opts || {};
    const freq = o.freq || 440;
    const duration = o.duration != null ? o.duration : 0.2;
    const type = o.type || 'sine';
    const volume = o.volume != null ? o.volume : 0.3;
    const delay = o.delay || 0;
    const pan = o.pan || 0;
    const reverbSend = o.reverbSend || 0;
    const attack = o.attack != null ? o.attack : 0.006;
    const release = o.release != null ? o.release : Math.max(0.05, duration * 0.6);
    const detune = o.detune || 0;

    const t0 = this._ctx.currentTime + delay;
    const end = t0 + duration + release;

    // 增益包络：从静音平滑起音 → 峰值 → 指数自然收尾，杜绝爆音
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration + release);

    // 轻微低通滤波，削减刺耳高频，听感更柔和
    const lp = this._ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 8200;
    lp.Q.value = 0.3;

    // 主振荡器
    const osc = this._ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(gain);

    // 谐波层：叠加泛音，让音色更饱满（如根音 + 八度）
    if (o.harmonic) {
      const h = o.harmonic;
      const osc2 = this._ctx.createOscillator();
      osc2.type = h.type || 'triangle';
      osc2.frequency.value = freq * (h.ratio || 2);
      osc2.detune.value = detune;
      const hg = this._ctx.createGain();
      hg.gain.value = (h.gain != null ? h.gain : 0.3) * volume;
      osc2.connect(hg);
      hg.connect(gain);
      osc2.start(t0);
      osc2.stop(end);
    }

    gain.connect(lp);

    // 路由：声相（若有）→ 主总线；混响发送从低通后分流
    const node = this._makePanner(pan) || this._masterGain;
    lp.connect(node);
    if (reverbSend > 0 && this._reverbInput) {
      const rs = this._ctx.createGain();
      rs.gain.value = reverbSend;
      lp.connect(rs);
      rs.connect(this._reverbInput);
    }

    osc.start(t0);
    osc.stop(end);
  },

  // 噪声打击（用于点击质感 / 风声 / 低频冲击）
  _noise(opts) {
    if (!this._ctx || !this._enabled || !this._noiseBuf) return;
    const o = opts || {};
    const duration = o.duration != null ? o.duration : 0.1;
    const volume = o.volume != null ? o.volume : 0.2;
    const delay = o.delay || 0;
    const pan = o.pan || 0;
    const filterType = o.type || 'highpass';
    const freq = o.freq || 1000;
    const reverbSend = o.reverbSend || 0;

    const t0 = this._ctx.currentTime + delay;
    const end = t0 + duration;

    const src = this._ctx.createBufferSource();
    src.buffer = this._noiseBuf;
    src.loop = true;

    const filt = this._ctx.createBiquadFilter();
    filt.type = filterType;
    filt.frequency.value = freq;
    filt.Q.value = 0.7;

    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    src.connect(filt);
    filt.connect(gain);

    const node = this._makePanner(pan) || this._masterGain;
    gain.connect(node);
    if (reverbSend > 0 && this._reverbInput) {
      const rs = this._ctx.createGain();
      rs.gain.value = reverbSend;
      gain.connect(rs);
      rs.connect(this._reverbInput);
    }

    src.start(t0);
    src.stop(end);
  },

  /* =========================================================================
   * 公开音效 API（与 v1.2.0 兼容）
   * ========================================================================= */

  // 点击音效 - 柔和短促 + 轻微噪声质感，左右微声相
  click() {
    this._tone({ freq: 660, duration: 0.07, type: 'triangle', volume: 0.12, attack: 0.004, pan: -0.1 });
    this._tone({ freq: 990, duration: 0.05, type: 'sine', volume: 0.08, delay: 0.015, pan: 0.12 });
    this._noise({ duration: 0.035, volume: 0.05, freq: 3200, type: 'highpass' });
  },

  // 正确音效 - 上行大三和弦 + 泛音层 + 轻混响，声相展开
  correct() {
    const send = 0.12;
    this._tone({ freq: 523.25, duration: 0.18, type: 'sine', volume: 0.18, reverbSend: send, pan: -0.18 });
    this._tone({ freq: 659.25, duration: 0.18, type: 'sine', volume: 0.16, delay: 0.045, reverbSend: send, pan: 0.18 });
    this._tone({ freq: 783.99, duration: 0.24, type: 'sine', volume: 0.18, delay: 0.09, reverbSend: send });
    this._tone({ freq: 1046.5, duration: 0.12, type: 'triangle', volume: 0.06, delay: 0.0, reverbSend: send });
  },

  // 错误音效 - 低沉柔和 + 轻微失谐 + 小混响 + 低频噪声
  wrong() {
    this._tone({ freq: 196, duration: 0.28, type: 'triangle', volume: 0.16, reverbSend: 0.08, detune: -6, pan: -0.12 });
    this._tone({ freq: 174.61, duration: 0.3, type: 'sine', volume: 0.12, delay: 0.05, detune: 6, pan: 0.12 });
    this._noise({ duration: 0.09, volume: 0.05, freq: 220, type: 'lowpass' });
  },

  // 升级音效 - 华丽上行琶音 + 八度泛音 + 丰富混响
  levelUp() {
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const send = 0.22;
    notes.forEach((f, i) => {
      this._tone({ freq: f, duration: 0.22, type: 'sine', volume: 0.16, delay: i * 0.07, reverbSend: send });
      this._tone({ freq: f * 2, duration: 0.14, type: 'triangle', volume: 0.05, delay: i * 0.07 + 0.02, reverbSend: send });
    });
  },

  // 解锁音效 - 闪亮上行 + 高频噪声闪烁 + 大混响
  unlock() {
    const send = 0.26;
    [1046.5, 1318.5, 1567.98, 2093].forEach((f, i) => {
      this._tone({ freq: f, duration: 0.28, type: 'sine', volume: 0.13, delay: i * 0.07, reverbSend: send });
    });
    this._noise({ duration: 0.3, volume: 0.035, freq: 6000, type: 'highpass', delay: 0.1, reverbSend: send });
  },

  // 获得金币 - 清脆双音（三角波更柔和）
  coin() {
    this._tone({ freq: 1046.5, duration: 0.08, type: 'triangle', volume: 0.1, attack: 0.003 });
    this._tone({ freq: 1318.5, duration: 0.12, type: 'triangle', volume: 0.1, delay: 0.05, attack: 0.003 });
  },

  // 按钮悬停 - 极轻
  hover() {
    this._tone({ freq: 580, duration: 0.05, type: 'sine', volume: 0.05 });
  },

  // 弹窗打开 - 柔和上滑 + 轻混响
  modalOpen() {
    this._tone({ freq: 392, duration: 0.12, type: 'sine', volume: 0.1, reverbSend: 0.1 });
    this._tone({ freq: 587.33, duration: 0.16, type: 'sine', volume: 0.12, delay: 0.05, reverbSend: 0.1 });
  },

  // 弹窗关闭 - 反向
  modalClose() {
    this._tone({ freq: 587.33, duration: 0.1, type: 'sine', volume: 0.1, reverbSend: 0.1 });
    this._tone({ freq: 392, duration: 0.12, type: 'sine', volume: 0.08, delay: 0.04, reverbSend: 0.1 });
  },

  // 连击音效（随连击数升调）+ 闪烁泛音
  combo(count) {
    const base = 440 + Math.min(count, 12) * 40;
    this._tone({ freq: base, duration: 0.1, type: 'sine', volume: 0.16, reverbSend: 0.1, pan: -0.1 });
    this._tone({ freq: base * 1.5, duration: 0.08, type: 'triangle', volume: 0.08, delay: 0.03, pan: 0.1 });
  },

  // Boss 登场 - 低沉鼓声 + 低频冲击 + 紧张弦乐 + 大混响
  bossEntrance() {
    this._tone({ freq: 70, duration: 0.5, type: 'sawtooth', volume: 0.2, reverbSend: 0.15 });
    this._tone({ freq: 55, duration: 0.6, type: 'sine', volume: 0.18, delay: 0.1 });
    this._noise({ duration: 0.32, volume: 0.12, freq: 120, type: 'lowpass' });
    this._tone({ freq: 220, duration: 0.8, type: 'sawtooth', volume: 0.09, delay: 0.2, detune: -8, reverbSend: 0.1 });
    this._tone({ freq: 233, duration: 0.8, type: 'sawtooth', volume: 0.09, delay: 0.2, detune: 8, reverbSend: 0.1 });
  },

  // 胜利音效 - 上行旋律 + 低八度垫音 + 丰富混响
  victory() {
    const mel = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
    const send = 0.22;
    mel.forEach((f, i) => {
      this._tone({ freq: f, duration: 0.22, type: 'sine', volume: 0.16, delay: i * 0.11, reverbSend: send });
      this._tone({ freq: f * 0.5, duration: 0.16, type: 'triangle', volume: 0.06, delay: i * 0.11, reverbSend: send });
    });
  },

  // 失败音效 - 下行悲伤 + 小混响
  gameOver() {
    const mel = [440, 415.3, 392, 349.23, 329.63, 293.66];
    const send = 0.12;
    mel.forEach((f, i) => {
      this._tone({ freq: f, duration: 0.3, type: 'triangle', volume: 0.12, delay: i * 0.14, reverbSend: send });
    });
  },

  // 倒计时提示 - 短促
  countdown() {
    this._tone({ freq: 880, duration: 0.08, type: 'sine', volume: 0.14, reverbSend: 0.05 });
  },

  // 倒计时结束 - 高亮双音 + 混响
  countdownEnd() {
    this._tone({ freq: 1046.5, duration: 0.3, type: 'sine', volume: 0.2, reverbSend: 0.15 });
    this._tone({ freq: 1046.5, duration: 0.2, type: 'triangle', volume: 0.1, delay: 0.05 });
  },

  /* =========================================================================
   * 新增音效（v1.3.4 扩展，供 UI 交互按需调用，不影响旧调用方）
   * ========================================================================= */

  // 开关：on=true 上行确认音，on=false 下行关闭音
  toggle(on) {
    if (on) {
      this._tone({ freq: 520, duration: 0.1, type: 'sine', volume: 0.12, reverbSend: 0.08 });
      this._tone({ freq: 780, duration: 0.12, type: 'sine', volume: 0.12, delay: 0.05, reverbSend: 0.08 });
    } else {
      this._tone({ freq: 520, duration: 0.1, type: 'sine', volume: 0.1, reverbSend: 0.06 });
      this._tone({ freq: 360, duration: 0.12, type: 'sine', volume: 0.1, delay: 0.05, reverbSend: 0.06 });
    }
  },

  // 选择确认 - 短促双音
  select() {
    this._tone({ freq: 720, duration: 0.06, type: 'sine', volume: 0.12, attack: 0.003 });
    this._tone({ freq: 960, duration: 0.09, type: 'sine', volume: 0.1, delay: 0.04, attack: 0.003 });
  },

  // 切换标签 - 轻点
  tab() {
    this._tone({ freq: 600, duration: 0.05, type: 'triangle', volume: 0.09 });
  },

  // 提示通知 - 温和三连音
  notify() {
    const send = 0.12;
    [880, 1108.7, 1318.5].forEach((f, i) => {
      this._tone({ freq: f, duration: 0.12, type: 'sine', volume: 0.1, delay: i * 0.08, reverbSend: send });
    });
  },

  // 计时滴答 - 极短
  tick() {
    this._tone({ freq: 1200, duration: 0.03, type: 'sine', volume: 0.08 });
  },

  // 错误提示（比 wrong 更短促，用于表单/输入校验）
  error() {
    this._tone({ freq: 220, duration: 0.12, type: 'square', volume: 0.1, reverbSend: 0.05 });
    this._tone({ freq: 180, duration: 0.14, type: 'square', volume: 0.08, delay: 0.04, reverbSend: 0.05 });
  },

  // 成功提示（correct 的别名，语义更清晰）
  success() {
    this.correct();
  },

  // 滑动 / 翻页 - 噪声扫频
  swipe() {
    if (!this._ctx || !this._enabled || !this._noiseBuf) return;
    const t0 = this._ctx.currentTime;
    const src = this._ctx.createBufferSource();
    src.buffer = this._noiseBuf;
    src.loop = true;
    const filt = this._ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(600, t0);
    filt.frequency.exponentialRampToValueAtTime(3000, t0 + 0.18);
    filt.Q.value = 1.2;
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.08, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this._masterGain);
    src.start(t0);
    src.stop(t0 + 0.18);
  }
};

// 自动初始化（用户首次交互后解锁 AudioContext）
document.addEventListener('click', () => SFXEngine.init(), { once: true });
document.addEventListener('touchstart', () => SFXEngine.init(), { once: true });

// 导出到全局
window.SFXEngine = SFXEngine;
