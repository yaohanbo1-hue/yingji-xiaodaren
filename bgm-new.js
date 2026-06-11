/**
 * 应急小达人 — 新版 Menu BGM
 * 风格：简洁温暖，钢琴琶音 + 柔和贝斯，不杂乱
 * 调性：C大调，BPM: 80（更舒缓）
 */
function newMenuBgm() {
  BGMEngine.stopBgm();
  BGMEngine.init();
  var ctx = BGMEngine.ctx;
  var dest = BGMEngine.bgmGain;
  var bpm = 80;
  var beatDur = 60 / bpm;
  var barDur = 4 * beatDur;

  var master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(dest);

  // 和弦进行: C - Am - F - G（经典温暖进行）
  var chords = [
    [261.63, 329.63, 392.00],  // C:  C4 E4 G4
    [220.00, 261.63, 329.63],  // Am: A3 C4 E4
    [174.61, 220.00, 261.63],  // F:  F3 A3 C4
    [196.00, 246.94, 293.66],  // G:  G3 B3 D4
  ];
  var bassFreqs = [130.81, 110.00, 87.31, 98.00]; // C3 A2 F2 G2

  function scheduleLoop() {
    var startTime = ctx.currentTime + 0.1;
    var totalBars = 4;

    for (var bar = 0; bar < totalBars; bar++) {
      var barStart = startTime + bar * barDur;

      // === 层1: 柔和贝斯（每小节1个长音） ===
      (function(b, bs) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        var filter = ctx.createBiquadFilter();
        osc.type = "sine";
        osc.frequency.value = bassFreqs[b];
        filter.type = "lowpass";
        filter.frequency.value = 250;
        g.gain.setValueAtTime(0, bs);
        g.gain.linearRampToValueAtTime(0.08, bs + 0.1);
        g.gain.setValueAtTime(0.08, bs + barDur - 0.2);
        g.gain.linearRampToValueAtTime(0, bs + barDur);
        osc.connect(filter);
        filter.connect(g);
        g.connect(master);
        osc.start(bs);
        osc.stop(bs + barDur + 0.1);
      })(bar, barStart);

      // === 层2: 琶音（每小节4个音，上行分解和弦） ===
      (function(b, bs) {
        var chord = chords[b];
        for (var i = 0; i < 4; i++) {
          var t = bs + i * beatDur;
          var freq = chord[i % 3];
          // 高八度
          if (i >= 2) freq *= 2;

          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;

          var vol = (i === 0) ? 0.06 : 0.04;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(vol, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + beatDur * 1.8);

          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + beatDur * 2);
        }
      })(bar, barStart);
    }

    // 循环调度
    var loopDur = totalBars * barDur;
    setTimeout(function() {
      if (BGMEngine.currentBgm && !BGMEngine.isMuted) {
        scheduleLoop();
      }
    }, loopDur * 1000 - 100);
  }

  scheduleLoop();

  BGMEngine.currentBgm = {
    stop: function() {
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
