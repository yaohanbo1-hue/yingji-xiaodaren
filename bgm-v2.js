/**
 * BGM V2 - 增强版音乐引擎
 * 改进: Scenario BGM 从2轨升级到5轨, Battle BGM 更史诗
 * 增加混响效果
 */

// 增强 Scenario BGM - 从2轨升级到5轨
(function() {
    if (typeof BGMEngine === 'undefined') return;
    
    // 保存原始方法
    const _origPlayScenarioBgm = BGMEngine.playScenarioBgm.bind(BGMEngine);
    
    // 新的 Scenario BGM - 温暖沉浸风格
    BGMEngine.playScenarioBgm = function() {
        this.stopBgm();
        this.init();
        var ctx = this.ctx, dest = this.bgmGain;
        var beatDur = 60 / 85; // BPM 85, 更舒缓
        var barDur = 4 * beatDur;
        var startTime = ctx.currentTime + 0.05;
        
        var scenarioMaster = ctx.createGain();
        scenarioMaster.gain.value = 0.12;
        scenarioMaster.connect(dest);
        
        // 创建简易混响
        var convolver = ctx.createConvolver();
        var reverbLen = ctx.sampleRate * 1.5; // 1.5秒混响
        var reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
        for (var ch = 0; ch < 2; ch++) {
            var data = reverbBuf.getChannelData(ch);
            for (var i = 0; i < reverbLen; i++) {
                data[i] = (2 * Math.random() - 1) * Math.exp(-i / (reverbLen * 0.3));
            }
        }
        convolver.buffer = reverbBuf;
        var reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.2;
        convolver.connect(reverbGain);
        reverbGain.connect(scenarioMaster);
        
        // Track 1: 温暖的Pad和弦 (正弦波 + 混响)
        var chordProg = [
            [261.63, 329.63, 392.00], // C major
            [220.00, 277.18, 329.63], // Am
            [174.61, 220.00, 261.63], // F major
            [196.00, 246.94, 293.66]  // G major
        ];
        
        for (var bar = 0; bar < 8; bar++) {
            var chord = chordProg[bar % chordProg.length];
            var t = startTime + bar * barDur;
            var dur = 0.95 * barDur;
            
            chord.forEach(function(freq) {
                // 直接音
                var osc = ctx.createOscillator();
                var g = ctx.createGain();
                var filter = ctx.createBiquadFilter();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, t);
                filter.type = "lowpass";
                filter.frequency.setValueAtTime(800, t);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.03, t + 0.5);
                g.gain.setValueAtTime(0.03, t + dur - 0.5);
                g.gain.linearRampToValueAtTime(0, t + dur);
                osc.connect(filter);
                filter.connect(g);
                g.connect(scenarioMaster);
                osc.start(t);
                osc.stop(t + dur + 0.1);
                
                // 混响音
                var osc2 = ctx.createOscillator();
                var g2 = ctx.createGain();
                osc2.type = "sine";
                osc2.frequency.setValueAtTime(freq, t);
                g2.gain.setValueAtTime(0, t);
                g2.gain.linearRampToValueAtTime(0.015, t + 0.8);
                g2.gain.setValueAtTime(0.015, t + dur - 0.8);
                g2.gain.linearRampToValueAtTime(0, t + dur);
                osc2.connect(g2);
                g2.connect(convolver);
                osc2.start(t);
                osc2.stop(t + dur + 0.1);
            });
        }
        
        // Track 2: 柔和的贝斯 (三角波)
        var bassNotes = [130.81, 110.00, 87.31, 98.00]; // C3, A2, F2, G2
        for (var bar = 0; bar < 8; bar++) {
            var freq = bassNotes[bar % bassNotes.length];
            var t = startTime + bar * barDur;
            
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            var filter = ctx.createBiquadFilter();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t);
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(200, t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.08, t + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, t + barDur * 0.9);
            osc.connect(filter);
            filter.connect(g);
            g.connect(scenarioMaster);
            osc.start(t);
            osc.stop(t + barDur);
        }
        
        // Track 3: 轻柔的琶音 (正弦波)
        var arpNotes = [523.25, 659.25, 783.99, 659.25, 523.25, 392.00, 440.00, 392.00];
        for (var bar = 0; bar < 8; bar++) {
            for (var beat = 0; beat < 4; beat++) {
                var t = startTime + bar * barDur + beat * beatDur;
                var noteIdx = (bar * 4 + beat) % arpNotes.length;
                var freq = arpNotes[noteIdx];
                
                var osc = ctx.createOscillator();
                var g = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.02, t + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, t + beatDur * 1.5);
                osc.connect(g);
                g.connect(scenarioMaster);
                // 也发送到混响
                var g2 = ctx.createGain();
                g2.gain.value = 0.3;
                g.connect(g2);
                g2.connect(convolver);
                osc.start(t);
                osc.stop(t + beatDur * 2);
            }
        }
        
        // Track 4: 环境音 - 轻柔的风声/流水声 (噪声 + 滤波)
        for (var bar = 0; bar < 8; bar++) {
            var t = startTime + bar * barDur;
            var len = barDur * ctx.sampleRate;
            var buf = ctx.createBuffer(1, len, ctx.sampleRate);
            var data = buf.getChannelData(0);
            for (var i = 0; i < len; i++) {
                data[i] = 2 * Math.random() - 1;
            }
            var src = ctx.createBufferSource();
            src.buffer = buf;
            var filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(400 + Math.sin(bar) * 100, t);
            filter.Q.value = 0.5;
            var g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.008, t + barDur * 0.3);
            g.gain.linearRampToValueAtTime(0, t + barDur);
            src.connect(filter);
            filter.connect(g);
            g.connect(scenarioMaster);
            src.start(t);
            src.stop(t + barDur);
        }
        
        // Track 5: 偶尔的钟声/铃声 (高频正弦 + 长衰减)
        var bellNotes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6
        for (var i = 0; i < 4; i++) {
            var t = startTime + (i * 2 + 1) * barDur; // 每隔2小节
            var freq = bellNotes[i % bellNotes.length];
            
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.015, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + 3);
            osc.connect(g);
            g.connect(scenarioMaster);
            // 混响
            var g2 = ctx.createGain();
            g2.gain.value = 0.5;
            g.connect(g2);
            g2.connect(convolver);
            osc.start(t);
            osc.stop(t + 3.5);
        }
        
        this.currentBgm = {
            stop: function() {
                try {
                    scenarioMaster.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
                } catch(e) {}
            }
        };
    };
    
    console.log('✅ BGM V2: Scenario BGM enhanced (2 tracks → 5 tracks + reverb)');
})();
