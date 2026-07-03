/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 语音播报引擎
 * ===========================================================================
 * 
 * 功能：
 * 1. 使用 Web Speech API 朗读知识点
 * 2. 答题后自动朗读解析
 * 3. 支持开关控制
 * 4. 中文语音优先
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const VoiceEngine = {
  _enabled: false,
  _synth: null,
  _voice: null,
  _rate: 1.0,
  _pitch: 1.0,
  _volume: 0.8,
  
  init() {
    if (!('speechSynthesis' in window)) {
      console.warn('浏览器不支持语音播报');
      return;
    }
    
    this._synth = window.speechSynthesis;
    
    // 从 localStorage 读取设置
    try {
      this._enabled = localStorage.getItem('disaster_hq_voice_enabled') === 'true';
      this._rate = parseFloat(localStorage.getItem('disaster_hq_voice_rate')) || 1.0;
      this._pitch = parseFloat(localStorage.getItem('disaster_hq_voice_pitch')) || 1.0;
    } catch(e) {
      console.error('[VoiceEngine] Error reading localStorage:', e);
      this._enabled = false;
      this._rate = 1.0;
      this._pitch = 1.0;
    }
    
    // 加载中文语音
    this._loadVoice();
    
    console.log('🔊 语音播报引擎已加载 (' + (this._enabled ? '开启' : '关闭') + ')');
  },
  
  _loadVoice() {
    var self = this;
    
    function setVoice() {
      var voices = self._synth.getVoices();
      // 优先中文女声
      self._voice = voices.find(function(v) {
        return v.lang.startsWith('zh') && v.name.includes('Female');
      }) || voices.find(function(v) {
        return v.lang.startsWith('zh-CN');
      }) || voices.find(function(v) {
        return v.lang.startsWith('zh');
      }) || null;
    }
    
    setVoice();
    if (this._synth.onvoiceschanged !== undefined) {
      this._synth.onvoiceschanged = setVoice;
    }
  },
  
  // 开关
  toggle() {
    this._enabled = !this._enabled;
    try {
      localStorage.setItem('disaster_hq_voice_enabled', this._enabled);
    } catch(e) { console.error('Storage error:', e); }
    if (!this._enabled) {
      this.stop();
    }
    return this._enabled;
  },
  
  isEnabled() {
    return this._enabled;
  },
  
  // 设置语速
  setRate(rate) {
    this._rate = Math.max(0.5, Math.min(2.0, rate));
    try {
      localStorage.setItem('disaster_hq_voice_rate', this._rate);
    } catch(e) { console.error('Storage error:', e); }
  },
  
  // 设置音调
  setPitch(pitch) {
    this._pitch = Math.max(0.5, Math.min(2.0, pitch));
    try {
      localStorage.setItem('disaster_hq_voice_pitch', this._pitch);
    } catch(e) { console.error('Storage error:', e); }
  },
  
  // 朗读文本
  speak(text, callback) {
    if (!this._enabled || !this._synth) return;
    
    // 取消之前的朗读
    this._synth.cancel();
    
    // 清理文本
    text = text.replace(/<[^>]+>/g, ''); // 去掉HTML标签
    text = text.replace(/[🌍🌊🔥🌀⛰️🌪️☀️⚡❄️🌋🧊📕⭐🎯💡✅❌]/g, ''); // 去掉emoji
    
    if (text.length === 0) return;
    if (text.length > 300) text = text.substring(0, 300) + '...'; // 限制长度
    
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = this._rate;
    utterance.pitch = this._pitch;
    utterance.volume = this._volume;
    
    if (this._voice) {
      utterance.voice = this._voice;
    }
    
    if (callback) {
      utterance.onend = callback;
    }
    
    this._synth.speak(utterance);
  },
  
  // 停止朗读
  stop() {
    if (this._synth) {
      this._synth.cancel();
    }
  },
  
  // 朗读题目解析（自动钩入）
  speakExplanation(explanation) {
    if (!this._enabled) return;
    this.speak('解析：' + explanation);
  },
  
  // 朗读欢迎语
  speakWelcome(name) {
    if (!this._enabled) return;
    var hour = new Date().getHours();
    var greeting = hour < 12 ? '上午好' : (hour < 18 ? '下午好' : '晚上好');
    this.speak(greeting + '，' + (name || '小学员') + '！欢迎来到应急小达人。');
  },
  
  // 朗读答题结果
  speakResult(correct) {
    if (!this._enabled) return;
    if (correct) {
      var phrases = ['回答正确！', '太棒了！', '完全正确！', '答对了！'];
      this.speak(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      var phrases = ['回答错误。', '不对哦。', '再想想看。'];
      this.speak(phrases[Math.floor(Math.random() * phrases.length)]);
    }
  },
  
  // 钩入答题系统
  hookQuizSystem() {
    var self = this;
    
    // 移除旧监听器（防止重复调用导致堆积）
    if (this._quizHookHandler) {
      document.removeEventListener('click', this._quizHookHandler);
    }
    
    // 监听答题结果
    this._quizHookHandler = function(e) {
      var opt = e.target.closest('.quiz-opt, .choice-btn');
      if (!opt) return;
      
      var timerId = setTimeout(function() {
        var isCorrect = opt.classList.contains('correct');
        self.speakResult(isCorrect);
        
        // 朗读解析
        if (!isCorrect) {
          var expEl = document.querySelector('.quiz-explanation, .scenario-exp');
          if (expEl) {
            setTimeout(function() {
              self.speakExplanation(expEl.textContent.trim());
            }, 1500);
          }
        }
      }, 300);
    };
    document.addEventListener('click', this._quizHookHandler);
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  VoiceEngine.init();
  VoiceEngine.hookQuizSystem();
});

// 挂载到全局
window.VoiceEngine = VoiceEngine;
