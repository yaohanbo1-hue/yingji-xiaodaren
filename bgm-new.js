/**
 * 应急小达人 — 温暖希望风格 Menu BGM
 * 风格：温暖、希望、鼓舞人心
 * 调性：C大调，BPM: 85（轻快但不急促）
 * 特点：钢琴旋律 + 弦乐铺底 + 轻快琶音
 */
function newMenuBgm() {
  BGMEngine.stopBgm();
  BGMEngine.init();
  var ctx = BGMEngine.ctx;
  var dest = BGMEngine.bgmGain;
  var bpm = 85;
  var beatDur = 60 / bpm;
  var barDur = 4 * beatDur;

  var master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(dest);

  // 温暖和弦进行: C - Am - F - G (I - vi - IV - V)
  // 经典流行/温暖进行
  var chords = [
    [261.63, 329.63, 392.00],  // C: C4 E4 G4
    [220.00, 261.63, 329.63],  // Am: A3 C4 E4
    [174.61, 220.00, 261.63],  // F: F3 A3 C4
    [196.00, 246.94, 293.66],  // G: G3 B3 D4
  ];
  
  // 低音进行
  var bassFreqs = [130.81, 110.00, 87.31, 98.00]; // C3 A2 F2 G2

  // 温暖旋律音符（C大调五声音阶）
  var melodyNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5 D5 E5 G5 A5 C6

  var loopTimer = null;
  var isPlaying = true;

  function scheduleLoop() {
    if (!isPlaying) return;
    
    var startTime = ctx.currentTime + 0.1;
    var totalBars = 8; // 8小节循环

    for (var bar = 0; bar < totalBars; bar++) {
      var barStart = startTime + bar * barDur;
      var chordIdx = bar % 4;

      // === 层1: 温暖贝斯（每小节2个音） ===
      (function(bs, ci) {
        var baseFreq = bassFreqs[ci];
        // 第一拍：低音
        var osc1 = ctx.createOscillator();
        var g1 = ctx.createGain();
        var filter1 = ctx.createBiquadFilter();
        osc1.type = "triangle";
        osc1.frequency.value = baseFreq;
        filter1.type = "lowpass";
        filter1.frequency.value = 200;
        g1.gain.setValueAtTime(0, bs);
        g1.gain.linearRampToValueAtTime(0.08, bs + 0.05);
        g1.gain.setValueAtTime(0.06, bs + beatDur * 1.5);
        g1.gain.linearRampToValueAtTime(0, bs + beatDur * 2);
        osc1.connect(filter1);
        filter1.connect(g1);
        g1.connect(master);
        osc1.start(bs);
        osc1.stop(bs + beatDur * 2 + 0.1);

        // 第三拍：五度音
        var osc2 = ctx.createOscillator();
        var g2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.value = baseFreq * 1.5;
        g2.gain.setValueAtTime(0, bs + beatDur * 2);
        g2.gain.linearRampToValueAtTime(0.05, bs + beatDur * 2 + 0.05);
        g2.gain.linearRampToValueAtTime(0, bs + barDur);
        osc2.connect(g2);
        g2.connect(master);
        osc2.start(bs + beatDur * 2);
        osc2.stop(bs + barDur + 0.1);
      })(barStart, chordIdx);

      // === 层2: 温暖和弦铺底（弦乐感） ===
      (function(ci, bs) {
        var chord = chords[ci];
        for (var i = 0; i < chord.length; i++) {
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          var filter = ctx.createBiquadFilter();
          osc.type = "sine";
          osc.frequency.value = chord[i];
          filter.type = "lowpass";
          filter.frequency.value = 1500;
          
          // 弦乐式淡入淡出
          g.gain.setValueAtTime(0, bs);
          g.gain.linearRampToValueAtTime(0.025, bs + 0.4);
          g.gain.setValueAtTime(0.025, bs + barDur - 0.4);
          g.gain.linearRampToValueAtTime(0, bs + barDur);
          
          osc.connect(filter);
          filter.connect(g);
          g.connect(master);
          osc.start(bs);
          osc.stop(bs + barDur + 0.1);
        }
      })(chordIdx, barStart);

      // === 层3: 轻快琶音（每2拍一个音） ===
      if (bar % 2 === 0) {
        (function(bs, ci) {
          var chord = chords[ci];
          for (var i = 0; i < 4; i++) {
            var t = bs + i * beatDur;
            var freq = chord[i % chord.length] * 2; // 高八度
            
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            
            // 钢琴式起音
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.04, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + beatDur * 0.8);
            
            osc.connect(g);
            g.connect(master);
            osc.start(t);
            osc.stop(t + beatDur);
          }
        })(barStart, chordIdx);
      }

      // === 层4: 温暖旋律（每4小节一句） ===
      if (bar % 4 === 0 || bar % 4 === 2) {
        (function(bs, phrase) {
          // 简单优美的旋律
          var pattern = phrase === 0 
            ? [0, 2, 4, 3]  // C E A G
            : [4, 3, 2, 0]; // A G E C
          
          for (var i = 0; i < 4; i++) {
            var t = bs + i * beatDur;
            var freq = melodyNotes[pattern[i]];
            
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            var filter = ctx.createBiquadFilter();
            osc.type = "sine";
            osc.frequency.value = freq;
            filter.type = "lowpass";
            filter.frequency.value = 3000;
            
            // 温暖的起音
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.035, t + 0.08);
            g.gain.setValueAtTime(0.03, t + beatDur * 0.6);
            g.gain.linearRampToValueAtTime(0, t + beatDur);
            
            osc.connect(filter);
            filter.connect(g);
            g.connect(master);
            osc.start(t);
            osc.stop(t + beatDur + 0.1);
          }
        })(barStart, bar % 8 === 0 ? 0 : 1);
      }

      // === 层5: 轻柔打击（每小节） ===
      (function(bs) {
        // 轻拍：第1、3拍
        for (var beat = 0; beat < 4; beat += 2) {
          var t = bs + beat * beatDur;
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.06, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 0.2);
        }
      })(barStart);
    }

    // 循环调度
    var loopDur = totalBars * barDur;
    loopTimer = setTimeout(function() {
      if (isPlaying && !BGMEngine.isMuted) {
        scheduleLoop();
      }
    }, loopDur * 1000 - 50);
  }

  scheduleLoop();

  BGMEngine.currentBgm = {
    stop: function() {
      isPlaying = false;
      if (loopTimer) {
        clearTimeout(loopTimer);
        loopTimer = null;
      }
      try {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      } catch(e) {}
      setTimeout(function() {
        try { master.disconnect(); } catch(e) {}
      }, 600);
    }
  };
}

// 替换原始 playMenuBgm
BGMEngine._originalPlayMenuBgm = BGMEngine.playMenuBgm;
BGMEngine.playMenuBgm = newMenuBgm;
