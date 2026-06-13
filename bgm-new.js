/**
 * 应急小达人 — 柔和温暖 Menu BGM v3
 * 风格：柔和、温暖、流畅
 * 调性：C大调，BPM: 72（舒缓）
 * 特点：16小节长循环 + 无缝交叉淡入淡出 + 丰富旋律 + 柔和铺底
 */
function softMenuBgm() {
  BGMEngine.stopBgm();
  BGMEngine.init();
  var ctx = BGMEngine.ctx;
  var dest = BGMEngine.bgmGain;
  var bpm = 72;
  var beat = 60 / bpm;
  var bar = 4 * beat;

  var master = ctx.createGain();
  master.gain.value = 0.15;
  master.connect(dest);

  // 柔和混响模拟（用延迟反馈）
  var delay = ctx.createDelay();
  delay.delayTime.value = 0.25;
  var feedback = ctx.createGain();
  feedback.gain.value = 0.2;
  var wetGain = ctx.createGain();
  wetGain.gain.value = 0.12;
  var delayFilter = ctx.createBiquadFilter();
  delayFilter.type = "lowpass";
  delayFilter.frequency.value = 1200;
  master.connect(delay);
  delay.connect(delayFilter);
  delayFilter.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(dest);

  // 温暖和弦: C - Em - F - G - Am - F - G - C (8种，16小节循环)
  var chords = [
    [261.63, 329.63, 392.00],  // C
    [164.81, 196.00, 246.94],  // Em
    [174.61, 220.00, 261.63],  // F
    [196.00, 246.94, 293.66],  // G
    [220.00, 261.63, 329.63],  // Am
    [174.61, 220.00, 261.63],  // F
    [196.00, 246.94, 293.66],  // G
    [261.63, 329.63, 392.00],  // C
  ];
  var bassFreqs = [130.81, 82.41, 87.31, 98.00, 110.00, 87.31, 98.00, 130.81];

  // 优美旋律（C大调，2个乐句交替，每句8个音）
  var melodyA = [523.25, 587.33, 659.25, 523.25, 783.99, 659.25, 587.33, 523.25];
  var melodyB = [659.25, 783.99, 880.00, 783.99, 659.25, 523.25, 587.33, 659.25];
  var melodyC = [392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00];
  var melodyD = [523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25];
  var melodies = [melodyA, melodyB, melodyC, melodyD];

  var isPlaying = true;
  var loopTimer = null;
  var loopCount = 0;

  function scheduleLoop() {
    if (!isPlaying) return;
    var t0 = ctx.currentTime + 0.1;
    var totalBars = 16;
    var loopDur = totalBars * bar;

    for (var b = 0; b < totalBars; b++) {
      var bs = t0 + b * bar;
      var ci = b % 8;
      var chord = chords[ci];

      // 层1: 柔和铺底（弦乐感，非常缓慢的淡入淡出）
      (function(ci, bs) {
        var ch = chords[ci];
        for (var i = 0; i < ch.length; i++) {
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          var flt = ctx.createBiquadFilter();
          osc.type = "sine";
          osc.frequency.value = ch[i];
          flt.type = "lowpass";
          flt.frequency.value = 800;
          flt.Q.value = 0.5;
          g.gain.setValueAtTime(0, bs);
          g.gain.linearRampToValueAtTime(0.018, bs + bar * 0.4);
          g.gain.setValueAtTime(0.018, bs + bar * 0.6);
          g.gain.linearRampToValueAtTime(0, bs + bar);
          osc.connect(flt); flt.connect(g); g.connect(master);
          osc.start(bs); osc.stop(bs + bar + 0.05);
        }
      })(ci, bs);

      // 层2: 温暖贝斯（正弦波，极柔和）
      (function(bs, ci) {
        var freq = bassFreqs[ci];
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        var flt = ctx.createBiquadFilter();
        osc.type = "sine";
        osc.frequency.value = freq;
        flt.type = "lowpass"; flt.frequency.value = 150;
        g.gain.setValueAtTime(0, bs);
        g.gain.linearRampToValueAtTime(0.06, bs + 0.15);
        g.gain.setValueAtTime(0.05, bs + bar * 0.7);
        g.gain.linearRampToValueAtTime(0, bs + bar);
        osc.connect(flt); flt.connect(g); g.connect(master);
        osc.start(bs); osc.stop(bs + bar + 0.05);
      })(bs, ci);

      // 层3: 旋律（每2小节一句，4种旋律交替）
      if (b % 2 === 0) {
        (function(bs, phraseIdx) {
          var mel = melodies[phraseIdx % 4];
          for (var i = 0; i < 8; i++) {
            var t = bs + i * (bar / 8) * 2;
            if (t >= bs + bar * 2) break;
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            var flt = ctx.createBiquadFilter();
            osc.type = "sine";
            osc.frequency.value = mel[i];
            flt.type = "lowpass"; flt.frequency.value = 2500;
            var noteLen = bar / 4;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.03, t + 0.1);
            g.gain.setValueAtTime(0.025, t + noteLen * 0.6);
            g.gain.linearRampToValueAtTime(0, t + noteLen);
            osc.connect(flt); flt.connect(g); g.connect(master);
            osc.start(t); osc.stop(t + noteLen + 0.05);
          }
        })(bs, Math.floor(b / 2));
      }

      // 层4: 轻柔琶音（每4拍一个和弦音，高八度）
      (function(bs, ci) {
        var ch = chords[ci];
        for (var i = 0; i < 4; i++) {
          var t = bs + i * beat;
          var freq = ch[i % ch.length] * 2;
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.015, t + 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9);
          osc.connect(g); g.connect(master);
          osc.start(t); osc.stop(t + beat);
        }
      })(bs, ci);
    }

    loopCount++;
    loopTimer = setTimeout(function() {
      if (isPlaying && !BGMEngine.isMuted) scheduleLoop();
    }, loopDur * 1000 - 30);
  }

  scheduleLoop();

  BGMEngine.currentBgm = {
    stop: function() {
      isPlaying = false;
      if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
      try { master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8); } catch(e) {}
      setTimeout(function() { try { master.disconnect(); delay.disconnect(); } catch(e) {} }, 1000);
    }
  };
}

BGMEngine.playMenuBgm = softMenuBgm;
