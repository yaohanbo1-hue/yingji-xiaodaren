/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 错题本引擎
 * ===========================================================================
 * 
 * 功能：
 * 1. 自动收集答错的题目
 * 2. 记录错误次数和最后错误时间
 * 3. 错题复习模式（专项练习薄弱项）
 * 4. 错题统计分析
 * 5. 数据持久化（localStorage）
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const WrongBookEngine = {
  _storageKey: 'disaster_hq_wrong_book',
  _wrongItems: [],
  
  init() {
    this._load();
    this._hookQuizSystem();
    console.log('📕 错题本引擎已加载 (' + this._wrongItems.length + ' 道错题)');
  },
  
  // 从 localStorage 加载
  _load() {
    try {
      var data = localStorage.getItem(this._storageKey);
      this._wrongItems = data ? JSON.parse(data) : [];
    } catch (e) {
      this._wrongItems = [];
    }
  },
  
  // 保存到 localStorage
  _save() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._wrongItems));
    } catch (e) {
      console.warn('错题本保存失败');
    }
  },
  
  // 添加错题
  addWrong(question, options, correctAnswer, userAnswer, explanation, category) {
    // 检查是否已存在
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
  
  // 标记为已掌握（复习时答对）
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
  
  // 移除错题
  removeWrong(id) {
    this._wrongItems = this._wrongItems.filter(function(item) {
      return item.id !== id;
    });
    this._save();
    this._updateBadge();
  },
  
  // 清空错题本
  clearAll() {
    this._wrongItems = [];
    this._save();
    this._updateBadge();
  },
  
  // 获取未掌握的错题
  getUnmastered() {
    return this._wrongItems.filter(function(item) {
      return !item.mastered;
    });
  },
  
  // 按分类统计
  getStatsByCategory() {
    var stats = {};
    this._wrongItems.forEach(function(item) {
      var cat = item.category || 'general';
      if (!stats[cat]) {
        stats[cat] = { total: 0, mastered: 0, wrongCount: 0 };
      }
      stats[cat].total++;
      stats[cat].wrongCount += item.wrongCount;
      if (item.mastered) stats[cat].mastered++;
    });
    return stats;
  },
  
  // 获取最薄弱的题目（错误次数最多）
  getWeakestTopics(count) {
    count = count || 5;
    return this._wrongItems
      .filter(function(item) { return !item.mastered; })
      .sort(function(a, b) { return b.wrongCount - a.wrongCount; })
      .slice(0, count);
  },
  
  // 获取总统计
  getStats() {
    var total = this._wrongItems.length;
    var mastered = this._wrongItems.filter(function(i) { return i.mastered; }).length;
    var totalWrongCount = this._wrongItems.reduce(function(sum, i) { return sum + i.wrongCount; }, 0);
    
    return {
      total: total,
      mastered: mastered,
      unmastered: total - mastered,
      totalWrongCount: totalWrongCount,
      masteryRate: total > 0 ? Math.round(mastered / total * 100) : 0
    };
  },
  
  // 更新角标
  _updateBadge() {
    var badge = document.getElementById('wrongBookBadge');
    if (badge) {
      var unmastered = this.getUnmastered().length;
      badge.textContent = unmastered > 0 ? unmastered : '';
      badge.style.display = unmastered > 0 ? 'block' : 'none';
    }
  },
  
  // 钩入答题系统（自动收集错题）
  _hookQuizSystem() {
    var self = this;
    
    // 监听答题结果
    document.addEventListener('click', function(e) {
      var opt = e.target.closest('.quiz-opt, .choice-btn');
      if (!opt) return;
      
      // 延迟检查（等游戏逻辑处理完）
      setTimeout(function() {
        if (opt.classList.contains('wrong')) {
          self._captureWrongAnswer(opt);
        }
      }, 200);
    });
  },
  
  // 捕获错误答案
  _captureWrongAnswer(wrongOpt) {
    // 获取当前题目信息
    var questionEl = document.querySelector('.quiz-question, .scenario-desc, .quiz-content');
    if (!questionEl) return;
    
    var question = questionEl.textContent.trim().substring(0, 200);
    var userAnswer = wrongOpt.textContent.trim().substring(0, 100);
    
    // 获取正确答案
    var correctOpt = document.querySelector('.quiz-opt.correct, .choice-btn.correct');
    var correctAnswer = correctOpt ? correctOpt.textContent.trim().substring(0, 100) : '';
    
    // 获取选项列表
    var options = [];
    document.querySelectorAll('.quiz-opt, .choice-btn').forEach(function(opt) {
      options.push(opt.textContent.trim().substring(0, 100));
    });
    
    // 获取解析
    var expEl = document.querySelector('.quiz-explanation, .scenario-exp');
    var explanation = expEl ? expEl.textContent.trim().substring(0, 300) : '';
    
    // 获取分类
    var category = 'general';
    var activePage = document.querySelector('.page.active');
    if (activePage) {
      category = activePage.id.replace('page-', '');
    }
    
    if (question) {
      this.addWrong(question, options, correctAnswer, userAnswer, explanation, category);
    }
  },
  
  // 渲染错题本页面
  renderPage() {
    var container = document.getElementById('wrongBookContent');
    if (!container) return;
    
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
        html += '<div class="wb-item-answer">正确答案: ' + item.correctAnswer + '</div>';
      }
      if (item.explanation) {
        html += '<div class="wb-item-exp">💡 ' + item.explanation + '</div>';
      }
      if (!item.mastered) {
        html += '<button class="wb-btn wb-btn-small" onclick="WrongBookEngine.markMastered(\'' + item.id + '\')">✅ 标记已掌握</button>';
      }
      html += '<button class="wb-btn wb-btn-small wb-btn-del" onclick="WrongBookEngine.removeWrong(\'' + item.id + '\')">删除</button>';
      html += '</div>';
    });
    html += '</div>';
    
    container.innerHTML = html;
  },
  
  // 开始复习模式
  startReview() {
    var unmastered = this.getUnmastered();
    if (unmastered.length === 0) {
      if (typeof Modal !== 'undefined') {
        Modal.show('🎉 太棒了！', '所有错题都已掌握！', '🏆');
      }
      return;
    }
    
    // 随机选一道错题进行复习
    var item = unmastered[Math.floor(Math.random() * unmastered.length)];
    this._showReviewQuestion(item);
  },
  
  _showReviewQuestion(item) {
    var container = document.getElementById('wrongBookContent');
    if (!container) return;
    
    var html = '<div class="wb-review">';
    html += '<h3>📝 错题复习</h3>';
    html += '<div class="wb-review-question">' + item.question + '</div>';
    html += '<div class="wb-review-options">';
    
    if (item.options && item.options.length > 0) {
      var letters = ['A', 'B', 'C', 'D'];
      item.options.forEach(function(opt, i) {
        html += '<button class="wb-review-opt" onclick="WrongBookEngine._checkReviewAnswer(this, \'' + item.id + '\', \'' + 
          (item.correctAnswer || '').replace(/'/g, "\\'") + '\')">' + 
          letters[i] + '. ' + opt + '</button>';
      });
    }
    
    html += '</div>';
    html += '<button class="wb-btn" onclick="WrongBookEngine.renderPage()">← 返回错题本</button>';
    html += '</div>';
    
    container.innerHTML = html;
  },
  
  _checkReviewAnswer(btn, id, correctAnswer) {
    var allOpts = btn.parentElement.querySelectorAll('.wb-review-opt');
    allOpts.forEach(function(opt) {
      opt.disabled = true;
      if (opt.textContent.includes(correctAnswer)) {
        opt.classList.add('correct');
      }
    });
    
    if (btn.textContent.includes(correctAnswer)) {
      btn.classList.add('correct');
      this.markMastered(id);
      if (typeof SFXEngine !== 'undefined') SFXEngine.correct();
    } else {
      btn.classList.add('wrong');
      if (typeof SFXEngine !== 'undefined') SFXEngine.wrong();
    }
    
    // 2秒后显示下一题
    var self = this;
    setTimeout(function() {
      self.startReview();
    }, 2000);
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  WrongBookEngine.init();
});
