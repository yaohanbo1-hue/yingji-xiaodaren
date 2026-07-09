/**
 * 应急小达人 v1.2.0 — 错题本引擎 (v2 修复版)
 * 修复: 复习模式选项点击无响应 + 答案匹配逻辑
 */
const WrongBookEngine = {
  _storageKey: 'disaster_hq_wrong_book',
  _wrongItems: [],
  _reviewQueue: [],
  _reviewIdx: 0,
  
  init() {
    this._load();
    this._hookQuizSystem();
    console.log('📕 错题本引擎已加载 (' + this._wrongItems.length + ' 道错题)');
  },
  
  _load() {
    try {
      var data = localStorage.getItem(this._storageKey);
      this._wrongItems = data ? JSON.parse(data) : [];
    } catch (e) {
      this._wrongItems = [];
    }
  },
  
  _save() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._wrongItems));
    } catch (e) {}
  },
  
  addWrong(question, options, correctAnswer, userAnswer, explanation, category) {
    // 过滤掉占位/加载中的无效题目标题（如"加载中..."、"题目加载中..."等）
    var skipPatterns = ['加载中', '题目加载', 'Loading', '...', '请稍候'];
    var isPlaceholder = false;
    for (var pi = 0; pi < skipPatterns.length; pi++) {
      if (question && question.indexOf(skipPatterns[pi]) !== -1) { isPlaceholder = true; break; }
    }
    if (isPlaceholder || !question || question.trim().length < 2) return;

    var existing = null;
    for (var i = 0; i < this._wrongItems.length; i++) {
      if (this._wrongItems[i].question === question) {
        existing = this._wrongItems[i];
        break;
      }
    }
    if (existing) {
      existing.wrongCount++;
      existing.lastWrongTime = Date.now();
      existing.lastUserAnswer = userAnswer;
    } else {
      this._wrongItems.push({
        id: 'wrong_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        question: question,
        options: options,
        correctAnswer: correctAnswer,
        correctIndex: -1,
        userAnswer: userAnswer,
        explanation: explanation || '',
        category: category || 'general',
        wrongCount: 1,
        firstWrongTime: Date.now(),
        lastWrongTime: Date.now(),
        mastered: false,
        reviewCount: 0
      });
    }
    this._save();
    this._updateBadge();
  },
  
  markMastered(id) {
    for (var i = 0; i < this._wrongItems.length; i++) {
      if (this._wrongItems[i].id === id) {
        this._wrongItems[i].reviewCount++;
        if (this._wrongItems[i].reviewCount >= 2) {
          this._wrongItems[i].mastered = true;
        }
        break;
      }
    }
    this._save();
    this._updateBadge();
  },
  
  removeWrong(id) {
    this._wrongItems = this._wrongItems.filter(function(item) { return item.id !== id; });
    this._save();
    this._updateBadge();
  },
  
  clearAll() {
    this._wrongItems = [];
    this._save();
    this._updateBadge();
  },
  
  getUnmastered() {
    return this._wrongItems.filter(function(item) { return !item.mastered; });
  },
  
  getStats() {
    var total = this._wrongItems.length;
    var mastered = this._wrongItems.filter(function(i) { return i.mastered; }).length;
    var totalWrongCount = this._wrongItems.reduce(function(sum, i) { return sum + i.wrongCount; }, 0);
    return {
      total: total, mastered: mastered, unmastered: total - mastered,
      totalWrongCount: totalWrongCount,
      masteryRate: total > 0 ? Math.round(mastered / total * 100) : 0
    };
  },
  
  _updateBadge() {
    var badge = document.getElementById('wrongBookBadge');
    if (badge) {
      var unmastered = this.getUnmastered().length;
      badge.textContent = unmastered > 0 ? unmastered : '';
      badge.style.display = unmastered > 0 ? 'block' : 'none';
    }
  },
  
  _hookQuizSystem() {
    var self = this;
    document.addEventListener('click', function(e) {
      var opt = e.target.closest('.quiz-opt, .choice-btn');
      if (!opt) return;
      setTimeout(function() {
        if (opt.classList.contains('wrong')) {
          self._captureWrongAnswer(opt);
        }
      }, 200);
    });
  },
  
  _captureWrongAnswer(wrongOpt) {
    var questionEl = document.querySelector('.quiz-question, .scenario-desc, .quiz-content');
    if (!questionEl) return;
    var question = questionEl.textContent.trim().substring(0, 200);
    var userAnswer = wrongOpt.textContent.trim().substring(0, 100);
    var correctOpt = document.querySelector('.quiz-opt.correct, .choice-btn.correct');
    var correctAnswer = correctOpt ? correctOpt.textContent.trim().substring(0, 100) : '';
    var options = [];
    var correctIndex = -1;
    document.querySelectorAll('.quiz-opt, .choice-btn').forEach(function(opt, idx) {
      options.push(opt.textContent.trim().substring(0, 100));
      if (opt.classList.contains('correct')) correctIndex = idx;
    });
    var expEl = document.querySelector('.quiz-explanation, .scenario-exp');
    var explanation = expEl ? expEl.textContent.trim().substring(0, 300) : '';
    var category = 'general';
    var activePage = document.querySelector('.page.active');
    if (activePage) category = activePage.id.replace('page-', '');
    if (question) {
      this.addWrong(question, options, correctAnswer, userAnswer, explanation, category);
      // Also store correctIndex
      var last = this._wrongItems[this._wrongItems.length - 1];
      if (last && correctIndex >= 0) {
        last.correctIndex = correctIndex;
        this._save();
      }
    }
  },
  
  renderPage() {
    var container = document.getElementById('wrongBookContent');
    if (!container) return;
    // 过滤掉无效占位题目标题
    var skipPatterns = ['加载中', '题目加载', 'Loading', '...'];
    this._wrongItems = this._wrongItems.filter(function(item) {
      if (!item.question || item.question.trim().length < 2) return false;
      for (var pi = 0; pi < skipPatterns.length; pi++) {
        if (item.question.indexOf(skipPatterns[pi]) !== -1) return false;
      }
      return true;
    });
    this._save();
    var stats = this.getStats();
    var items = this._wrongItems;
    
    if (items.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.5);">' +
        '<div style="font-size:64px;margin-bottom:20px;">📕</div>' +
        '<h3 style="margin-bottom:10px;">错题本是空的</h3>' +
        '<p>太棒了！继续保持！</p></div>';
      return;
    }
    
    var html = '<div class="wrong-book-stats">';
    html += '<div class="wb-stat"><span class="wb-stat-num">' + stats.total + '</span><span class="wb-stat-label">总错题</span></div>';
    html += '<div class="wb-stat"><span class="wb-stat-num">' + stats.unmastered + '</span><span class="wb-stat-label">待复习</span></div>';
    html += '<div class="wb-stat"><span class="wb-stat-num">' + stats.masteryRate + '%</span><span class="wb-stat-label">掌握率</span></div>';
    html += '</div>';
    
    html += '<div class="wrong-book-actions">';
    html += '<button class="wb-btn wb-btn-primary" onclick="WrongBookEngine.startReview()">📝 开始复习</button>';
    html += '<button class="wb-btn wb-btn-danger" onclick="WrongBookEngine.clearAll()">🗑️ 清空</button>';
    html += '</div>';
    
    html += '<div class="wrong-book-list">';
    items.forEach(function(item) {
      var statusClass = item.mastered ? 'mastered' : '';
      var statusText = item.mastered ? '✅ 已掌握' : '❌ 待复习';
      html += '<div class="wb-item ' + statusClass + '">';
      html += '<div class="wb-item-header">';
      html += '<span class="wb-item-status">' + statusText + '</span>';
      html += '<span class="wb-item-count">错 ' + item.wrongCount + ' 次</span>';
      html += '</div>';
      html += '<div class="wb-item-question">' + item.question + '</div>';
      if (item.correctAnswer) {
        html += '<div class="wb-item-answer">✅ 正确答案: ' + item.correctAnswer + '</div>';
      }
      if (item.explanation) {
        html += '<div class="wb-item-exp">💡 ' + item.explanation + '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    
    container.innerHTML = html;
  },
  
  startReview() {
    var unmastered = this.getUnmastered();
    if (unmastered.length === 0) {
      if (typeof Modal !== 'undefined') {
        Modal.show('🎉 太棒了！', '所有错题都已掌握！', '🏆');
      }
      return;
    }
    // Build review queue - shuffle unmastered items
    this._reviewQueue = unmastered.slice().sort(function() { return Math.random() - 0.5; });
    this._reviewIdx = 0;
    this._showReviewQuestion(this._reviewQueue[0]);
  },
  
  _showReviewQuestion(item) {
    var container = document.getElementById('wrongBookContent');
    if (!container) return;
    
    var totalQ = this._reviewQueue.length;
    var currentQ = this._reviewIdx + 1;
    
    var html = '<div class="wb-review">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<span style="color:rgba(255,255,255,0.5);font-size:0.85rem;">📝 错题复习</span>';
    html += '<span style="color:rgba(255,255,255,0.5);font-size:0.85rem;">' + currentQ + ' / ' + totalQ + '</span>';
    html += '</div>';
    html += '<div class="wb-review-question">' + item.question + '</div>';
    html += '<div class="wb-review-options" id="wbReviewOptions">';
    
    if (item.options && item.options.length > 0) {
      var letters = ['A', 'B', 'C', 'D'];
      item.options.forEach(function(opt, i) {
        html += '<button class="wb-review-opt" data-idx="' + i + '">' + 
          '<span class="wb-opt-letter">' + letters[i] + '</span>' +
          '<span class="wb-opt-text">' + opt + '</span>' +
          '</button>';
      });
    }
    
    html += '</div>';
    html += '<div id="wbReviewFeedback" style="display:none;margin-top:12px;"></div>';
    html += '<div style="margin-top:16px;text-align:center;">';
    html += '<button class="wb-btn" onclick="WrongBookEngine.renderPage()" style="margin-right:8px;">← 返回错题本</button>';
    html += '<button class="wb-btn wb-btn-primary" id="wbNextBtn" style="display:none;" onclick="WrongBookEngine._nextReview()">下一题 →</button>';
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
    
    // Bind click events via JS (not inline onclick) to avoid `this` issues
    var self = this;
    var optBtns = container.querySelectorAll('.wb-review-opt');
    optBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        self._handleReviewClick(btn, item);
      });
    });
  },
  
  _handleReviewClick(btn, item) {
    // Prevent double-click
    var allOpts = document.querySelectorAll('.wb-review-opt');
    var alreadyAnswered = false;
    allOpts.forEach(function(opt) {
      if (opt.classList.contains('correct') || opt.classList.contains('wrong')) {
        alreadyAnswered = true;
      }
    });
    if (alreadyAnswered) return;
    
    var clickedIdx = parseInt(btn.getAttribute('data-idx'));
    var correctIdx = item.correctIndex;
    
    // If correctIndex not stored, try to match by text
    if (correctIdx < 0 && item.correctAnswer) {
      for (var i = 0; i < item.options.length; i++) {
        if (item.options[i] === item.correctAnswer || item.correctAnswer.includes(item.options[i])) {
          correctIdx = i;
          break;
        }
      }
    }
    
    // Disable all options
    allOpts.forEach(function(opt) { opt.style.pointerEvents = 'none'; });
    
    // Highlight correct answer
    if (correctIdx >= 0 && correctIdx < allOpts.length) {
      allOpts[correctIdx].classList.add('correct');
    }
    
    var feedbackEl = document.getElementById('wbReviewFeedback');
    var nextBtn = document.getElementById('wbNextBtn');
    
    if (clickedIdx === correctIdx) {
      btn.classList.add('correct');
      this.markMastered(item.id);
      if (feedbackEl) {
        feedbackEl.innerHTML = '<div style="color:#4ade80;text-align:center;font-size:1.1rem;">✅ 正确！已掌握</div>';
        feedbackEl.style.display = 'block';
      }
    } else {
      btn.classList.add('wrong');
      if (feedbackEl) {
        var expHtml = item.explanation ? '<div style="margin-top:8px;font-size:0.85rem;color:rgba(255,255,255,0.6);">💡 ' + item.explanation + '</div>' : '';
        feedbackEl.innerHTML = '<div style="color:#f87171;text-align:center;font-size:1.1rem;">❌ 还是错了！</div>' + expHtml;
        feedbackEl.style.display = 'block';
      }
      // Increment wrong count
      for (var i = 0; i < this._wrongItems.length; i++) {
        if (this._wrongItems[i].id === item.id) {
          this._wrongItems[i].wrongCount++;
          break;
        }
      }
      this._save();
    }
    
    // Show next button
    if (nextBtn) nextBtn.style.display = 'inline-block';
  },
  
  _nextReview() {
    this._reviewIdx++;
    if (this._reviewIdx >= this._reviewQueue.length) {
      // All done
      var container = document.getElementById('wrongBookContent');
      if (container) {
        var stats = this.getStats();
        container.innerHTML = '<div style="text-align:center;padding:40px 20px;">' +
          '<div style="font-size:64px;margin-bottom:20px;">🎉</div>' +
          '<h2 style="color:#fff;margin-bottom:16px;">复习完成！</h2>' +
          '<p style="color:rgba(255,255,255,0.7);margin-bottom:24px;">总错题: ' + stats.total + ' | 掌握率: ' + stats.masteryRate + '%</p>' +
          '<button class="wb-btn wb-btn-primary" onclick="WrongBookEngine.renderPage()" style="margin-right:8px;">← 返回错题本</button>' +
          '<button class="wb-btn" onclick="WrongBookEngine.startReview()">🔄 再来一轮</button>' +
          '</div>';
      }
      return;
    }
    this._showReviewQuestion(this._reviewQueue[this._reviewIdx]);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  WrongBookEngine.init();
});
