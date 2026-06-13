/**
 * Battle BGM V2 - 史诗级战斗音乐增强
 * 增加: 史诗弦乐Pad + 更强鼓点 + 低频冲击
 */

(function() {
    if (typeof BGMEngine === 'undefined') return;
    
    // 保存原始方法
    const _origPlayBattleBgm = BGMEngine.playBattleBgm.bind(BGMEngine);
    
    BGMEngine.playBattleBgm = function() {
        this.stopBgm();
        this.init();
        var ctx = this.ctx, dest = this.bgmGain;
        var bpm = 140;
        var beatDur = 60 / bpm;
        var barDur = 4 * beatDur;
        var startTime = ctx.currentTime + 0.05;
        
        var battleMaster = ctx.createGain();
        battleMaster.gain.value = 0.15;
        battleMaster.connect(dest);
        
        // === Track 1: 史诗鼓点 (增强版) ===
        for (var bar = 0; bar < 16; bar++) {
            for (var beat = 0; beat < 4; beat++) {
                var t = startTime + bar * barDur + beat * beatDur;
                var isDownbeat = beat === 0;
                
                // 底鼓 - 更强
                var kickOsc = ctx.createOscillator();
                var kickGain = ctx.createGain();
                kickOsc.type = "sine";
                kickOsc.frequency.setValueAtTime(isDownbeat ? 80 : 60, t);
                kickOsc.frequency.exponentialRampToValueAtTime(20, t + 0.15);
                kickGain.gain.setValueAtTime(isDownbeat ? 0.4 : 0.25, t);
                kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                kickOsc.connect(kickGain);
                kickGain.connect(battleMaster);
                kickOsc.start(t);
                kickOsc.stop(t + 0.25);
                
                // 军鼓 (2/4拍)
                if (beat === 1 || beat === 3) {
                    var snareLen = ctx.sampleRate * 0.15;
                    var snareBuf = ctx.createBuffer(1, snareLen, ctx.sampleRate);
                    var snareData = snareBuf.getChannelData(0);
                    for (var i = 0; i < snareLen; i++) {
                        snareData[i] = (2 * Math.random() - 1) * Math.exp(-i / (snareLen * 0.2));
                    }
                    var snareSrc = ctx.createBufferSource();
                    snareSrc.buffer = snareBuf;
                    var snareFilter = ctx.createBiquadFilter();
                    snareFilter.type = "bandpass";
                    snareFilter.frequency.value = 2000;
                    var snareGain = ctx.createGain();
                    snareGain.gain.setValueAtTime(0.15, t);
                    snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                    snareSrc.connect(snareFilter);
                    snareFilter.connect(snareGain);
                    snareGain.connect(battleMaster);
                    snareSrc.start(t);
                }
                
                // Hi-hat (8分音符)
                for (var sub = 0; sub < 2; sub++) {
                    var ht = t + sub * beatDur / 2;
                    var hhLen = ctx.sampleRate * 0.05;
                    var hhBuf = ctx.createBuffer(1, hhLen, ctx.sampleRate);
                    var hhData = hhBuf.getChannelData(0);
                    for (var i = 0; i < hhLen; i++) {
                        hhData[i] = (2 * Math.random() - 1) * Math.exp(-i / (hhLen * 0.1));
                    }
                    var hhSrc = ctx.createBufferSource();
                    hhSrc.buffer = hhBuf;
                    var hhFilter = ctx.createBiquadFilter();
                    hhFilter.type = "highpass";
                    hhFilter.frequency.value = 8000;
                    var hhGain = ctx.createGain();
                    hhGain.gain.setValueAtTime(0.06, ht);
                    hhGain.gain.exponentialRampToValueAtTime(0.001, ht + 0.04);
                    hhSrc.connect(hhFilter);
                    hhFilter.connect(hhGain);
                    hhGain.connect(battleMaster);
                    hhSrc.start(ht);
                }
                
                // 每4小节加一次重击 (timpani效果)
                if (bar % 4 === 3 && beat === 3) {
                    var timpOsc = ctx.createOscillator();
                    var timpGain = ctx.createGain();
                    timpOsc.type = "sine";
                    timpOsc.frequency.setValueAtTime(55, t);
                    timpOsc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
                    timpGain.gain.setValueAtTime(0.3, t);
                    timpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                    timpOsc.connect(timpGain);
                    timpGain.connect(battleMaster);
                    timpOsc.start(t);
                    timpOsc.stop(t + 0.7);
                }
            }
        }
        
        // === Track 2: 强力贝斯 ===
        var bassNotes = [110, 110, 87.31, 98]; // A2, A2, F2, G2
        for (var bar = 0; bar < 16; bar++) {
            var freq = bassNotes[bar % bassNotes.length];
            var t = startTime + bar * barDur;
            
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            var filter = ctx.createBiquadFilter();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t);
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(300, t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.12, t + 0.05);
            g.gain.setValueAtTime(0.12, t + barDur * 0.8);
            g.gain.linearRampToValueAtTime(0, t + barDur);
            osc.connect(filter);
            filter.connect(g);
            g.connect(battleMaster);
            osc.start(t);
            osc.stop(t + barDur + 0.1);
        }
        
        // === Track 3: 战斗旋律 (方波) ===
        var melody = [
            440, 0, 523.25, 0, 587.33, 523.25, 440, 0,
            349.23, 0, 392, 0, 440, 392, 349.23, 0,
            329.63, 0, 392, 0, 440, 523.25, 587.33, 0,
            659.25, 587.33, 523.25, 440, 392, 349.23, 329.63, 0
        ];
        for (var bar = 0; bar < 16; bar++) {
            for (var beat = 0; beat < 4; beat++) {
                var noteIdx = bar * 4 + beat;
                if (noteIdx >= melody.length) break;
                var freq = melody[noteIdx];
                if (!freq) continue;
                var t = startTime + bar * barDur + beat * beatDur;
                
                var osc = ctx.createOscillator();
                var g = ctx.createGain();
                osc.type = "square";
                osc.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.06, t + 0.02);
                g.gain.setValueAtTime(0.06, t + beatDur * 0.7);
                g.gain.linearRampToValueAtTime(0, t + beatDur * 0.95);
                osc.connect(g);
                g.connect(battleMaster);
                osc.start(t);
                osc.stop(t + beatDur);
            }
        }
        
        // === Track 4: 史诗弦乐Pad (新增!) ===
        var padChords = [
            [220, 277.18, 329.63], // Am
            [220, 277.18, 329.63], // Am
            [174.61, 220, 261.63], // F
            [196, 246.94, 293.66]  // G
        ];
        for (var bar = 0; bar < 16; bar++) {
            var chord = padChords[Math.floor(bar / 4) % padChords.length];
            var t = startTime + bar * barDur;
            var dur = barDur * 0.95;
            
            chord.forEach(function(freq) {
                var osc = ctx.createOscillator();
                var g = ctx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(freq * 2, t); // 高八度
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.02, t + 0.3);
                g.gain.setValueAtTime(0.02, t + dur - 0.3);
                g.gain.linearRampToValueAtTime(0, t + dur);
                var filter = ctx.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.setValueAtTime(1200, t);
                osc.connect(filter);
                filter.connect(g);
                g.connect(battleMaster);
                osc.start(t);
                osc.stop(t + dur + 0.1);
            });
        }
        
        // === Track 5: 低频冲击波 (每4小节) ===
        for (var i = 0; i < 4; i++) {
            var t = startTime + i * 4 * barDur;
            
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(40, t);
            osc.frequency.exponentialRampToValueAtTime(20, t + 1);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.2, t + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
            osc.connect(g);
            g.connect(battleMaster);
            osc.start(t);
            osc.stop(t + 2);
        }
        
        this.currentBgm = {
            stop: function() {
                try {
                    battleMaster.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
                } catch(e) {}
            }
        };
    };
    
    console.log('✅ BGM V2: Battle BGM enhanced (epic strings + sub-bass impact)');
})();
