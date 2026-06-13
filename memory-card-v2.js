/**
 * 记忆翻牌 V2 - 应急知识卡牌配对
 * 全新引擎：使用ALL_CARDS数据 + 玻璃态视觉 + 连击系统
 */
const MemoryCardV2 = {
  cards: [],
  flipped: [],
  matched: 0,
  totalPairs: 6,
  moves: 0,
  combo: 0,
  maxCombo: 0,
  score: 0,
  active: false,
  timer: null,
  timeLeft: 90,
  level: 1,
  _locked: false,

  init() {
    PageManager.navigate('memory-card');
    this.level = 1;
    this.score = 0;
    this._startLevel();
    AudioManager.play('start');
  },

  _startLevel() {
    this.matched = 0;
    this.moves = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.flipped = [];
    this._locked = false;
    this.active = true;
    this.timeLeft = Math.max(30, 90 - (this.level - 1) * 15);
    this.totalPairs = Math.min(6 + this.level, 10);
    clearInterval(this.timer);
    this._generateCards();
    this._render();
    this._startTimer();
  },

  _generateCards() {
    // 从ALL_CARDS中随机选取配对卡片
    var pool = ALL_CARDS.filter(function(c) {
      return c.zh && c.icon && c.zh.name;
    });
    // 打乱并选取
    pool.sort(function() { return Math.random() - 0.5; });
    var selected = pool.slice(0, this.totalPairs);
    
    var self = this;
    this.cards = [];
    selected.forEach(function(card, i) {
      // 正面（配对面）
      self.cards.push({
        pairId: i,
        icon: card.icon,
        name: card.zh.name,
        disaster: card.disaster,
        matched: false
      });
      self.cards.push({
        pairId: i,
        icon: card.icon,
        name: card.zh.name,
        disaster: card.disaster,
        matched: false
      });
    });
    // 打乱顺序
    this.cards.sort(function() { return Math.random() - 0.5; });
  },

  _render() {
    var container = document.getElementById('memoryGrid');
    if (!container) return;

    // 计算网格列数
    var cols = this.totalPairs <= 6 ? 4 : (this.totalPairs <= 8 ? 4 : 5);
    container.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

    var html = '';
    var self = this;

    // 顶部信息栏
    var infoHtml = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:12px 16px;background:rgba(255,255,255,0.05);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">' +
      '<div style="text-align:center;"><div style="font-size:1.4rem;font-weight:800;color:#FF6B35;" id="memTimer">' + this.timeLeft + '</div><div style="font-size:0.65rem;color:rgba(255,255,255,0.4);">⏱ 时间</div></div>' +
      '<div style="text-align:center;"><div style="font-size:1.4rem;font-weight:800;color:#FFD700;" id="memScore">' + this.score + '</div><div style="font-size:0.65rem;color:rgba(255,255,255,0.4);">⭐ 得分</div></div>' +
      '<div style="text-align:center;"><div style="font-size:1.4rem;font-weight:800;color:#00D4FF;">' + this.level + '</div><div style="font-size:0.65rem;color:rgba(255,255,255,0.4);">📊 关卡</div></div>' +
      '<div style="text-align:center;"><div style="font-size:1.4rem;font-weight:800;color:#E040FB;" id="memCombo">' + this.combo + '</div><div style="font-size:0.65rem;color:rgba(255,255,255,0.4);">🔥 连击</div></div>' +
      '<div style="text-align:center;"><div style="font-size:1.4rem;font-weight:800;color:#4CAF50;" id="memProgress">' + this.matched + '/' + this.totalPairs + '</div><div style="font-size:0.65rem;color:rgba(255,255,255,0.4);">✅ 配对</div></div>' +
      '</div>';

    // 卡片网格
    var cardsHtml = '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:10px;max-width:420px;margin:0 auto;">';
    this.cards.forEach(function(card, idx) {
      var matchedClass = card.matched ? ' mem-matched' : '';
      cardsHtml += '<div class="mem-card' + matchedClass + '" data-idx="' + idx + '" onclick="MemoryCardV2._flip(' + idx + ')">' +
        '<div class="mem-card-inner">' +
        '<div class="mem-card-front"><span style="font-size:1.5rem;">❓</span></div>' +
        '<div class="mem-card-back">' +
        '<span style="font-size:1.8rem;">' + card.icon + '</span>' +
        '<span style="font-size:0.55rem;color:rgba(255,255,255,0.7);margin-top:4px;display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + card.name + '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
    });
    cardsHtml += '</div>';

    container.innerHTML = infoHtml + cardsHtml;
  },

  _flip(idx) {
    if (!this.active || this._locked) return;
    var card = this.cards[idx];
    if (card.matched || this.flipped.indexOf(idx) !== -1) return;
    if (this.flipped.length >= 2) return;

    // 翻牌
    var cardEls = document.querySelectorAll('.mem-card');
    if (cardEls[idx]) cardEls[idx].classList.add('flipped');
    this.flipped.push(idx);
    AudioManager.play('click');

    if (this.flipped.length === 2) {
      this.moves++;
      this._locked = true;
      var self = this;
      setTimeout(function() { self._checkMatch(); }, 600);
    }
  },

  _checkMatch() {
    var idx1 = this.flipped[0], idx2 = this.flipped[1];
    var c1 = this.cards[idx1], c2 = this.cards[idx2];
    var cardEls = document.querySelectorAll('.mem-card');

    if (c1.pairId === c2.pairId) {
      // 配对成功
      c1.matched = true;
      c2.matched = true;
      this.matched++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      // 得分：基础100 + 连击奖励
      var pts = 100 + this.combo * 30;
      this.score += pts;

      if (cardEls[idx1]) cardEls[idx1].classList.add('mem-matched');
      if (cardEls[idx2]) cardEls[idx2].classList.add('mem-matched');
      AudioManager.play('correct');

      // 浮动得分
      if (typeof showFloatingText === 'function') {
        var rect = cardEls[idx2] ? cardEls[idx2].getBoundingClientRect() : null;
        if (rect) showFloatingText(rect.left + rect.width/2, rect.top, '+' + pts, '#4CAF50', '20px');
      }

      this.flipped = [];
      this._locked = false;
      this._updateUI();

      // 检查是否全部配对
      if (this.matched >= this.totalPairs) {
        var self = this;
        setTimeout(function() { self._levelComplete(); }, 800);
      }
    } else {
      // 配对失败
      this.combo = 0;
      if (cardEls[idx1]) cardEls[idx1].classList.add('mem-wrong');
      if (cardEls[idx2]) cardEls[idx2].classList.add('mem-wrong');
      AudioManager.play('wrong');
      if (typeof screenShake === 'function') screenShake(4, 200);

      var self = this;
      setTimeout(function() {
        if (cardEls[idx1]) { cardEls[idx1].classList.remove('flipped', 'mem-wrong'); }
        if (cardEls[idx2]) { cardEls[idx2].classList.remove('flipped', 'mem-wrong'); }
        self.flipped = [];
        self._locked = false;
        self._updateUI();
      }, 700);
    }
  },

  _updateUI() {
    var el;
    el = document.getElementById('memScore');
    if (el) el.textContent = this.score;
    el = document.getElementById('memCombo');
    if (el) el.textContent = this.combo;
    el = document.getElementById('memProgress');
    if (el) el.textContent = this.matched + '/' + this.totalPairs;
  },

  _startTimer() {
    var self = this;
    this.timer = setInterval(function() {
      self.timeLeft--;
      var el = document.getElementById('memTimer');
      if (el) {
        el.textContent = self.timeLeft;
        el.style.color = self.timeLeft <= 10 ? '#FF0000' : self.timeLeft <= 20 ? '#FF6B35' : '#FF6B35';
      }
      if (self.timeLeft <= 0) {
        self._gameOver();
      }
    }, 1000);
  },

  _levelComplete() {
    clearInterval(this.timer);
    this.active = false;
    var timeBonus = this.timeLeft * 10;
    var comboBonus = this.maxCombo * 50;
    this.score += timeBonus + comboBonus;

    if (this.level >= 3) {
      // 通关！
      this._gameWin();
    } else {
      // 进入下一关
      AudioManager.play('victory');
      if (typeof showConfetti === 'function') showConfetti(30);
      var self = this;
      Modal.show('🎉 第' + this.level + '关通过！',
        '⏱ 时间奖励: +' + timeBonus + '<br>' +
        '🔥 最大连击: ' + this.maxCombo + ' (+' + comboBonus + ')<br>' +
        '⭐ 总分: <strong style="color:#FFD700;font-size:1.2rem;">' + this.score + '</strong><br><br>' +
        '准备进入第' + (this.level + 1) + '关...',
        '🏆');
      setTimeout(function() {
        Modal.hide();
        self.level++;
        self._startLevel();
      }, 2500);
    }
  },

  _gameWin() {
    var coins = Math.floor(this.score / 10);
    var xp = 50 + this.level * 20;
    if (typeof GameState !== 'undefined' && GameState._data) {
      GameState._data.coins = (GameState._data.coins || 0) + coins;
      if (typeof LevelEngine !== 'undefined') LevelEngine.addXP(xp);
      if (typeof GameState.save === 'function') GameState.save();
    }
    AudioManager.play('victory');
    if (typeof showConfetti === 'function') showConfetti(60);
    Modal.show('🏆 记忆大师！',
      '全部3关通关！<br><br>' +
      '⭐ 总分: <strong style="color:#FFD700;font-size:1.5rem;">' + this.score + '</strong><br>' +
      '💰 +' + coins + ' 金币<br>' +
      '⭐ +' + xp + ' 经验<br>' +
      '🔥 最高连击: ' + this.maxCombo,
      '🧠');
  },

  _gameOver() {
    clearInterval(this.timer);
    this.active = false;
    var coins = Math.floor(this.score / 20);
    if (typeof GameState !== 'undefined' && GameState._data) {
      GameState._data.coins = (GameState._data.coins || 0) + coins;
      if (typeof GameState.save === 'function') GameState.save();
    }
    AudioManager.play('game_over');
    Modal.show('⏰ 时间到！',
      '第' + this.level + '关<br>' +
      '✅ 配对: ' + this.matched + '/' + this.totalPairs + '<br>' +
      '⭐ 得分: ' + this.score + '<br>' +
      '💰 +' + coins + ' 金币<br><br>' +
      '<button onclick="MemoryCardV2.init()" style="padding:8px 20px;background:linear-gradient(135deg,#00D4FF,#7c4dff);border:none;color:#fff;border-radius:10px;cursor:pointer;font-weight:700;">🔄 再来一次</button>',
      '🧠');
  }
};
