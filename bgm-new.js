/**
 * 应急小达人 — 史诗风格 Menu BGM
 * 风格：史诗感、大气、鼓舞人心
 * 调性：D小调，BPM: 70（庄重缓慢）
 * 特点：低沉弦乐 + 鼓点 + 铜管感和弦
 */
function newMenuBgm() {
  BGMEngine.stopBgm();
  BGMEngine.init();
  var ctx = BGMEngine.ctx;
  var dest = BGMEngine.bgmGain;
  var bpm = 70;
  var beatDur = 60 / bpm;
  var barDur = 4 * beatDur;

  var master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(dest);

  // 史诗和弦进行: Dm - Bb - F - C (i - VI - III - VII)
  // 经典史诗/电影配乐进行
  var chords = [
    [146.83, 174.61, 220.00],  // Dm: D3 F3 A3
    [116.54, 146.83, 174.61],  // Bb: Bb2 D3 F3
    [174.61, 220.00, 261.63],  // F:  F3 A3 C4
    [130.81, 164.81, 196.00],  // C:  C3 E3 G3
  ];
  
  // 低音进行（更厚重）
  var bassFreqs = [73.42, 58.27, 87.31, 65.41]; // D2 Bb1 F2 C2

  // 史诗旋律音符（D小调五声音阶）
  var melodyNotes = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33]; // D4 F4 G4 A4 C5 D5

  function scheduleLoop() {
    var startTime = ctx.currentTime + 0.1;
    var totalBars = 8; // 8小节循环

    for (var bar = 0; bar < totalBars; bar++) {
      var barStart = startTime + bar * barDur;
      var chordIdx = bar % 4;

      // === 层1: 深沉贝斯（每小节2个音，八度跳跃） ===
      (function(b, bs, ci) {
        var baseFreq = bassFreqs[ci];
        // 第一拍：低音
        var osc1 = ctx.createOscillator();
        var g1 = ctx.createGain();
        var filter1 = ctx.createBiquadFilter();
        osc1.type = "sawtooth";
        osc1.frequency.value = baseFreq;
        filter1.type = "lowpass";
        filter1.frequency.value = 180;
        filter1.Q.value = 2;
        g1.gain.setValueAtTime(0, bs);
        g1.gain.linearRampToValueAtTime(0.12, bs + 0.05);
        g1.gain.setValueAtTime(0.1, bs + beatDur * 1.5);
        g1.gain.linearRampToValueAtTime(0, bs + beatDur * 2);
        osc1.connect(filter1);
        filter1.connect(g1);
        g1.connect(master);
        osc1.start(bs);
        osc1.stop(bs + beatDur * 2 + 0.1);

        // 第三拍：高八度
        var osc2 = ctx.createOscillator();
        var g2 = ctx.createGain();
        var filter2 = ctx.createBiquadFilter();
        osc2.type = "sawtooth";
        osc2.frequency.value = baseFreq * 2;
        filter2.type = "lowpass";
        filter2.frequency.value = 250;
        g2.gain.setValueAtTime(0, bs + beatDur * 2);
        g2.gain.linearRampToValueAtTime(0.08, bs + beatDur * 2 + 0.05);
        g2.gain.linearRampToValueAtTime(0, bs + barDur);
        osc2.connect(filter2);
        filter2.connect(g2);
        g2.connect(master);
        osc2.start(bs + beatDur * 2);
        osc2.stop(bs + barDur + 0.1);
      })(bar, barStart, chordIdx);

      // === 层2: 史诗和弦（持续音，类似弦乐铺底） ===
      (function(ci, bs) {
        var chord = chords[ci];
        for (var i = 0; i < chord.length; i++) {
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          var filter = ctx.createBiquadFilter();
          osc.type = "sawtooth";
          osc.frequency.value = chord[i] * 2; // 高两个八度
          filter.type = "lowpass";
          filter.frequency.value = 800;
          filter.Q.value = 1;
          
          // 弦乐式淡入淡出
          g.gain.setValueAtTime(0, bs);
          g.gain.linearRampToValueAtTime(0.03, bs + 0.3);
          g.gain.setValueAtTime(0.03, bs + barDur - 0.3);
          g.gain.linearRampToValueAtTime(0, bs + barDur);
          
          osc.connect(filter);
          filter.connect(g);
          g.connect(master);
          osc.start(bs);
          osc.stop(bs + barDur + 0.1);
        }
      })(chordIdx, barStart);

      // === 层3: 战鼓节奏（每两小节一个模式） ===
      if (bar % 2 === 1) {
        (function(bs) {
          // 大鼓：第1、3拍
          for (var beat = 0; beat < 4; beat += 2) {
            var t = bs + beat * beatDur;
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(80, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.25, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(g);
            g.connect(master);
            osc.start(t);
            osc.stop(t + 0.35);
          }
          
          // 小鼓：第2、4拍（噪音模拟）
          for (var beat = 1; beat < 4; beat += 2) {
            var t = bs + beat * beatDur;
            var bufferSize = ctx.sampleRate * 0.1;
            var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
              data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
            }
            var noise = ctx.createBufferSource();
            noise.buffer = buffer;
            var g = ctx.createGain();
            var filter = ctx.createBiquadFilter();
            filter.type = "highpass";
            filter.frequency.value = 1000;
            g.gain.setValueAtTime(0.08, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            noise.connect(filter);
            filter.connect(g);
            g.connect(master);
            noise.start(t);
          }
        })(barStart);
      }

      // === 层4: 史诗旋律（每4小节一句，简单有力） ===
      if (bar % 4 === 0 || bar % 4 === 2) {
        (function(bs, phrase) {
          // 简单的4音旋律
          var pattern = phrase === 0 
            ? [0, 2, 4, 3]  // D G C A
            : [4, 3, 2, 0]; // C A G D
          
          for (var i = 0; i < 4; i++) {
            var t = bs + i * beatDur;
            var freq = melodyNotes[pattern[i]];
            
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            var filter = ctx.createBiquadFilter();
            osc.type = "triangle";
            osc.frequency.value = freq;
            filter.type = "lowpass";
            filter.frequency.value = 2000;
            
            // 铜管式起音
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.06, t + 0.05);
            g.gain.setValueAtTime(0.05, t + beatDur * 0.7);
            g.gain.linearRampToValueAtTime(0, t + beatDur);
            
            osc.connect(filter);
            filter.connect(g);
            g.connect(master);
            osc.start(t);
            osc.stop(t + beatDur + 0.1);
          }
        })(barStart, bar % 8 === 0 ? 0 : 1);
      }
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
