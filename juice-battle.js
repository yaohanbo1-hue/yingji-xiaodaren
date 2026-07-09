/**
 * ===========================================================================
 * 应急小达人 v138 — 连击暴击果汁增强系统 (Juice Battle)
 * ===========================================================================
 *
 * 设计目标：在已有 QuizEngine 答题流程之上，叠加一层"爽感/趣味/创新"
 * 反馈，不改动任何既有引擎代码（仅做方法包装），零侵入、可降级。
 *
 * ① 爽感 (Juice)
 *    - 每题答对：随连击数递增的屏幕震动 + 飘字 + 升调音效
 *    - 连击里程碑 (5/10/15/20/30)：满屏纸屑庆祝
 *    - 答错：更重红色裂屏 + 震动，强化"受挫—再战"的正反馈
 *
 * ② 趣味性 (Fun)
 *    - 暴击系统：答对时按概率触发"💥 暴击！"（概率随连击升高），
 *      触发金色裂屏 + 重震动 + 金币音 + 额外经验，制造"赌狗"爽点
 *
 * ③ 创新型 (Innovation)
 *    - 在教育答题里引入 Roguelike 式"连击→暴击"成长：
 *      连击越高，暴击率越高；达到 10 连击进入"狂热模式"，
 *      屏幕边缘金光环绕、暴击率进一步抬升，形成可感知的策略循环
 * ===========================================================================
 */
(function () {
  'use strict';

  // 连击里程碑（与 showComboCelebration 互补，这里负责纸屑 + 音效）
  var MILESTONES = [5, 10, 15, 20, 30];

  // 狂热模式阈值
  var FEVER_STREAK = 10;

  // 当前会话的"狂热"状态（仅用于视觉提示，不影响计分）
  var _fever = false;

  // 自注入"狂热模式"金光样式（源 CSS 不在仓库内，故模块自带，零外部依赖）
  var _feverStyleInjected = false;
  function injectFeverStyle() {
    if (_feverStyleInjected) return;
    _feverStyleInjected = true;
    safe(function () {
      if (document.getElementById('jb-fever-style')) return;
      var st = document.createElement('style');
      st.id = 'jb-fever-style';
      st.textContent =
        '@keyframes jbFeverPulse{0%,100%{box-shadow:inset 0 0 40px rgba(255,215,0,.35),inset 0 0 90px rgba(255,140,0,.18)}50%{box-shadow:inset 0 0 70px rgba(255,215,0,.55),inset 0 0 140px rgba(255,140,0,.3)}}' +
        '#app.jb-fever,#app.jb-fever .page.active{animation:jbFeverPulse 1.1s ease-in-out infinite}' +
        'body.jb-fever::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9000;' +
        'box-shadow:inset 0 0 60px rgba(255,215,0,.45),inset 0 0 120px rgba(255,140,0,.22);' +
        'animation:jbFeverPulse 1.1s ease-in-out infinite}';
      document.head.appendChild(st);
    });
  }

  function safe(fn) { try { fn(); } catch (e) { /* 静默降级，绝不阻断游戏 */ } }

  function getOpt(cls) {
    return document.querySelector('.quiz-opt.' + cls) ||
           document.querySelector('[class*="quiz-opt"].' + cls);
  }

  function scoreRect(engine) {
    try {
      var el = engine && engine._el ? engine._el('quizScoreTxt') : null;
      if (el && el.getBoundingClientRect) return el.getBoundingClientRect();
    } catch (e) {}
    return { left: window.innerWidth / 2, top: window.innerHeight / 3, width: 0, height: 0 };
  }

  // 触发屏幕边缘"狂热"金光（仅添加 class，依赖 CSS；无 CSS 也不报错）
  function setFever(on) {
    if (_fever === on) return;
    injectFeverStyle();
    _fever = on;
    safe(function () {
      var app = document.getElementById('app');
      if (app) app.classList.toggle('jb-fever', on);
      var body = document.body;
      if (body) body.classList.toggle('jb-fever', on);
    });
    if (on && typeof showSpectacleText === 'function') {
      safe(function () { showSpectacleText('🔥 狂热模式！', '#FFD700'); });
    }
  }

  // ---- 答对增强 ----
  function onCorrect(engine, card) {
    var streak = (engine && engine.streak) || 1;

    // 1) 随连击递增的屏幕震动（4~16px），制造"越连越爽"的手感
    if (typeof screenShake === 'function') {
      safe(function () { screenShake(Math.min(4 + streak, 16), 220); });
    }

    // 2) 连击飘字（2 连及以上才提示，避免每题刷屏）
    if (streak >= 2 && typeof showFloatingText === 'function') {
      var r = scoreRect(engine);
      var x = r.left + (r.width || 80) / 2;
      var y = r.top - 6;
      var color = streak >= FEVER_STREAK ? '#FFD700' : (streak >= 5 ? '#FF6B35' : '#00E676');
      safe(function () {
        showFloatingText(x, y, '🔥 ' + streak + ' 连击', color, (streak >= 10 ? 30 : 24) + 'px');
      });
    }

    // 3) 升调连击音效（Web Audio，独立通道，叠在原有 correct 音之上更带感）
    if (typeof SFXEngine !== 'undefined' && SFXEngine && SFXEngine.combo) {
      safe(function () { SFXEngine.combo(streak); });
    }

    // 4) 连击里程碑：满屏纸屑 + 升调庆祝音
    if (MILESTONES.indexOf(streak) !== -1) {
      if (typeof showConfetti === 'function') safe(function () { showConfetti(70); });
      if (typeof SFXEngine !== 'undefined' && SFXEngine && SFXEngine.levelUp) {
        safe(function () { SFXEngine.levelUp(); });
      }
    }

    // 5) 狂热模式判定
    setFever(streak >= FEVER_STREAK);

    // 6) 暴击系统（核心创新点）
    //    基础暴击率随连击升高；狂热模式下额外加成
    var baseChance = 0.06 + (streak - 1) * 0.03;
    if (_fever) baseChance += 0.12;
    var critChance = Math.min(0.5, baseChance);
    if (Math.random() < critChance) {
      var el = getOpt('correct');
      var cx = window.innerWidth / 2, cy = window.innerHeight / 3;
      if (el && el.getBoundingClientRect) {
        var rect = el.getBoundingClientRect();
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height / 2;
      }
      // 金色裂屏 + 重震动 + 闪光（criticalImpact 自带，无需额外调用 screenShake）
      if (typeof criticalImpact === 'function') {
        safe(function () { criticalImpact(el); });
      } else if (typeof screenShake === 'function') {
        safe(function () { screenShake(15, 450); });
      }
      // 金币音 + 额外经验，强化"赚到"的爽点
      if (typeof SFXEngine !== 'undefined' && SFXEngine) {
        safe(function () { if (SFXEngine.coin) SFXEngine.coin(); });
      }
      if (typeof GameState !== 'undefined' && GameState && GameState.addExp) {
        safe(function () { GameState.addExp(8); });
      }
      // 暴击飘字（不依赖 criticalImpact 自带的"💥 暴击！"二次叠加，这里给倍率提示）
      if (typeof showFloatingText === 'function') {
        safe(function () {
          showFloatingText(cx, cy - 48, '⚡ 暴击 x2！', '#FFD700', '30px');
        });
      }
    }
  }

  // ---- 答错增强 ----
  function onWrong(engine) {
    // 更重红色裂屏 + 震动，强化"受挫"反馈（原有 wrong 音已在 _answerFeedback 播放）
    var el = getOpt('wrong');
    if (typeof wrongImpact === 'function') {
      safe(function () { wrongImpact(el); });
    } else if (typeof screenShake === 'function') {
      safe(function () { screenShake(10, 350); });
    }
    // 连击中断 → 退出狂热
    setFever(false);
  }

  // ---- 包装 QuizEngine 的答对/答错入口（幂等、可降级）----
  function init() {
    if (typeof QuizEngine === 'undefined' || !QuizEngine) return;
    if (QuizEngine.__jbWrapped) return;
    QuizEngine.__jbWrapped = true;

    var _hc = QuizEngine._handleCorrect;
    if (typeof _hc === 'function') {
      QuizEngine._handleCorrect = function (card) {
        var res = _hc.apply(this, arguments);
        onCorrect(this, card);
        return res;
      };
    }

    var _hw = QuizEngine._handleWrong;
    if (typeof _hw === 'function') {
      QuizEngine._handleWrong = function () {
        var res = _hw.apply(this, arguments);
        onWrong(this);
        return res;
      };
    }

    // 退出答题（下一题/重开）时清掉狂热残留
    var _next = QuizEngine.next;
    if (typeof _next === 'function') {
      QuizEngine.next = function () {
        setFever(false);
        return _next.apply(this, arguments);
      };
    }
  }

  // 立即尝试（QuizEngine 通常已在同包内定义）；若 DOM 未就绪则等 DOMContentLoaded
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // 双重保险：window load 后再试一次（应对极早期脚本时序）
  if (typeof window !== 'undefined') {
    window.addEventListener('load', init);
  }

  // 暴露给调试/验证
  window.JuiceBattle = { init: init, onCorrect: onCorrect, onWrong: onWrong };
})();
