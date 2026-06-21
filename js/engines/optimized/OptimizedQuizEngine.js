/**
 * ============================================================================
 * OptimizedQuizEngine - 答题引擎（重构版）
 * ============================================================================
 * 优化点：
 *  1. 继承 BaseEngine：消除 init() 重复模式
 *  2. DOM 缓存：$id 替代所有 getElementById
 *  3. 事件委托：data-action 替代 onclick
 *  4. 批量渲染：选项批量创建，减少 DOM 操作次数
 *  5. 错误边界：答题过程任何错误不崩溃
 *  6. 定时器管理：自动清理，防止内存泄漏
 * ============================================================================
 */
const OptimizedQuizEngine = new (class extends BaseEngine {
  constructor() {
    super('QuizEngine', 'quiz');
    this.cards = [];
    this.currentIdx = 0;
    this.score = 0;
    this.correct = 0;
    this.wrong = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.totalCards = 10;
    this.timerInterval = null;
    this.timeLeft = 15;
    this.timeLimit = 15;
    this.answered = false;
    this.hp = 100;
    this.maxHp = 100;
    this.isBattleMode = false;
    this.damageMultiplier = 1;
    this.onQuizComplete = null;
  }

  _resetState(options) {
    this.cards = options.cards || [];
    this.totalCards = options.totalCards || this.cards.length || 10;
    this.currentIdx = 0;
    this.score = 0;
    this.correct = 0;
    this.wrong = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.active = true;
    this.isBattleMode = !!options.isBattleMode;
    this.timeLeft = options.timeLeft || this.timeLimit;
    this.answered = false;
    this.hp = 100;
    this.onQuizComplete = options.onComplete || null;
  }

  render() {
    ErrorBoundary.safeCall(() => {
      this._initUI();
      this._showCard();
    }, 'QuizEngine.render', undefined);
  }

  _initUI() {
    const el = (id) => {
      const mappedId = this.isBattleMode ? {
        quizHeader: 'battleQuizHeader',
        quizProgressTxt: 'battleQuizProgressTxt',
        quizScoreTxt: 'battleQuizScoreTxt',
        quizProgressBar: 'battleQuizProgressBar',
        quizProgressFill: 'battleQuizProgressFill',
        quizTimer: 'battleQuizTimer',
        quizTimerFill: 'battleQuizTimerFill',
        quizCard: 'battleQuizCard',
        quizDisasterIcon: 'battleQuizDisasterIcon',
        quizQuestion: 'battleQuizQuestion',
        quizOptions: 'battleQuizOptions',
        quizExpBox: 'battleQuizExpBox',
        quizNextBtn: 'battleQuizNextBtn',
        quizResult: 'battleQuizResult',
        quizExpText: 'battleQuizExpText',
        quizTipText: 'battleQuizTipText',
        quizExpCard: 'battleQuizExpCard',
        quizExpScenario: 'battleQuizExpScenario'
      }[id] || id : id;
      return DOMCache.get(mappedId) || DOMCache.get(id);
    };

    const ss = (id, val) => { const e = el(id); if (e) e.style.display = val; };
    const st = (id, val) => { const e = el(id); if (e) e.textContent = val; };
    const sw = (id, val) => { const e = el(id); if (e) e.style.width = val; };

    ss('quizHeader', 'flex');
    ss('quizProgressBar', 'block');
    ss('quizTimer', 'block');
    ss('quizCard', 'block');
    ss('quizExpBox', 'none');
    ss('quizNextBtn', 'none');
    ss('quizResult', 'none');
    sw('quizProgressFill', '0%');
    st('quizProgressTxt', '');
    st('quizCombo', '');
    st('quizScoreTxt', '🏆 0 分');

    if (this.isBattleMode) {
      ss('quizHpBar', 'flex');
      sw('quizHpFill', '100%');
      st('quizHpText', '100/100');
    }
  }

  _showCard() {
    if (this.currentIdx >= this.totalCards) {
      this._finish();
      return;
    }

    const card = this.cards[this.currentIdx];
    if (!card) return;

    const progress = ((this.currentIdx + 1) / this.totalCards * 100) + '%';
    const timerEl = DOMCache.get(this.isBattleMode ? 'battleQuizTimer' : 'quizTimer');
    const timerFill = DOMCache.get(this.isBattleMode ? 'battleQuizTimerFill' : 'quizTimerFill');
    const progressTxt = DOMCache.get(this.isBattleMode ? 'battleQuizProgressTxt' : 'quizProgressTxt');
    const progressFill = DOMCache.get(this.isBattleMode ? 'battleQuizProgressFill' : 'quizProgressFill');
    const disasterIcon = DOMCache.get(this.isBattleMode ? 'battleQuizDisasterIcon' : 'quizDisasterIcon');
    const question = DOMCache.get(this.isBattleMode ? 'battleQuizQuestion' : 'quizQuestion');
    const options = DOMCache.get(this.isBattleMode ? 'battleQuizOptions' : 'quizOptions');
    const cardEl = DOMCache.get(this.isBattleMode ? 'battleQuizCard' : 'quizCard');

    if (progressTxt) progressTxt.textContent = `${this.currentIdx + 1}/${this.totalCards}`;
    if (progressFill) progressFill.style.width = progress;
    if (timerEl) timerEl.textContent = this.timeLeft + 's';
    if (timerFill) timerFill.style.width = '100%';
    if (disasterIcon) disasterIcon.textContent = card.icon || '🌍';
    if (question) question.textContent = card.zh ? card.zh.q : card.question || '';

    if (options) {
      options.innerHTML = '';
      const opts = card.zh ? card.zh.opts : (card.options || []);
      const correctIdx = card.zh ? card.zh.ans : (card.correctOption || 0);

      // Fisher-Yates 洗牌算法（比 .sort(() => Math.random() - 0.5) 更公平）
      const shuffled = opts.map((o, i) => ({ text: o, isCorrect: i === correctIdx, originalIdx: i }));
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const fragment = document.createDocumentFragment();
      const letters = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < shuffled.length; i++) {
        const opt = shuffled[i];
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.dataset.action = 'quiz.select';
        btn.dataset.params = JSON.stringify({ correct: opt.isCorrect, idx: i });
        btn.innerHTML = `<span class="quiz-opt-letter">${letters[i]}</span><span class="quiz-opt-text">${opt.text}</span>`;
        if (opt.isCorrect) btn.classList.add('correct');
        fragment.appendChild(btn);
      }
      options.appendChild(fragment);
    }

    if (cardEl) {
      cardEl.classList.remove('quiz-flip');
      void cardEl.offsetWidth; // 强制重绘
    }

    this.answered = false;
    this._startTimer();
  }

  _startTimer() {
    this._clearTimers();
    if (this.timeLimit <= 0) return;

    let remaining = this.timeLeft;
    this.timerInterval = this._setInterval(() => {
      remaining--;
      const timerEl = DOMCache.get(this.isBattleMode ? 'battleQuizTimer' : 'quizTimer');
      const timerFill = DOMCache.get(this.isBattleMode ? 'battleQuizTimerFill' : 'quizTimerFill');
      if (timerEl) timerEl.textContent = remaining + 's';
      if (timerFill) timerFill.style.width = (remaining / this.timeLimit * 100) + '%';

      if (remaining <= 0) {
        this._clearTimers();
        this._onTimeUp();
      }
    }, 1000);
  }

  _onTimeUp() {
    if (this.answered) return;
    this._handleAnswer(false, null);
  }

  _handleAnswer(isCorrect, btnEl) {
    if (this.answered) return;
    this.answered = true;
    this._clearTimers();

    if (isCorrect) {
      this.correct++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      this.score += 10 + Math.floor(this.streak * 1.5);
      AudioManager.play('correct');
    } else {
      this.wrong++;
      this.streak = 0;
      this.hp = Math.max(0, this.hp - (10 * this.damageMultiplier));
      AudioManager.play('wrong');
    }

    this._updateScoreUI();

    if (this.currentIdx + 1 >= this.totalCards) {
      setTimeout(() => this._finish(), 1000);
    } else {
      this.currentIdx++;
      setTimeout(() => this._showCard(), 800);
    }
  }

  _updateScoreUI() {
    const scoreTxt = DOMCache.get(this.isBattleMode ? 'battleQuizScoreTxt' : 'quizScoreTxt');
    if (scoreTxt) scoreTxt.textContent = '🏆 ' + this.score + ' 分';
    const combo = DOMCache.get('quizCombo');
    if (combo) combo.textContent = this.streak > 1 ? '🔥 ' + this.streak + ' 连击!' : '';

    if (this.isBattleMode) {
      const hpFill = DOMCache.get('battleQuizHpFill');
      const hpText = DOMCache.get('battleQuizHpText');
      if (hpFill) hpFill.style.width = (this.hp / this.maxHp * 100) + '%';
      if (hpText) hpText.textContent = this.hp + '/' + this.maxHp;
    }
  }

  _finish() {
    this.active = false;
    this._clearTimers();
    if (typeof this.onQuizComplete === 'function') {
      this.onQuizComplete(this.score, this.correct, this.totalCards);
    }
  }

  _bindEvents() {
    EventDelegate.on('quiz.select', (e, params) => {
      e.preventDefault();
      this._handleAnswer(params.correct, e.target.closest('.quiz-opt'));
    });
  }
})();

// 向后兼容：保留旧 API
window.QuizEngine = OptimizedQuizEngine;
