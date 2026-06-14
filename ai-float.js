/**
 * AI导师浮动面板 — 右下角常驻按钮 + 弹出面板
 * 不跳转页面，直接在当前页面弹出对话面板
 */

(function() {
  'use strict';

  // 创建浮动按钮和面板
  function createFloatUI() {
    // 浮动按钮
    var fab = document.createElement('button');
    fab.className = 'ai-fab';
    fab.id = 'aiFab';
    fab.innerHTML = '🤖<span class="ai-fab-badge"></span>';
    fab.title = 'AI 防灾导师';
    fab.onclick = function() { togglePanel(); };
    document.body.appendChild(fab);

    // 浮动面板
    var panel = document.createElement('div');
    panel.className = 'ai-float-panel';
    panel.id = 'aiFloatPanel';
    panel.innerHTML = [
      '<div class="ai-float-header">',
      '  <div class="ai-float-header-left">',
      '    <div class="ai-float-avatar">🤖</div>',
      '    <div>',
      '      <div class="ai-float-title">AI 防灾导师</div>',
      '      <div class="ai-float-subtitle">智能分析 · 个性推荐</div>',
      '    </div>',
      '  </div>',
      '  <button class="ai-float-close" onclick="AITutorFloat.close()">✕</button>',
      '</div>',
      '<div class="ai-float-tabs">',
      '  <button class="ai-float-tab active" data-tab="chat" onclick="AITutorFloat.switchTab(\'chat\')">💬 对话</button>',
      '  <button class="ai-float-tab" data-tab="radar" onclick="AITutorFloat.switchTab(\'radar\')">📊 分析</button>',
      '  <button class="ai-float-tab" data-tab="recommend" onclick="AITutorFloat.switchTab(\'recommend\')">💡 推荐</button>',
      '</div>',
      '<div class="ai-float-body" id="aiFloatBody"></div>',
      '<div class="ai-float-footer">',
      '  <input class="ai-float-input" id="aiFloatInput" placeholder="问我任何防灾问题..." onkeydown="if(event.key===\'Enter\')AITutorFloat.sendMessage()">',
      '  <button class="ai-float-send" onclick="AITutorFloat.sendMessage()">➤</button>',
      '</div>'
    ].join('');
    document.body.appendChild(panel);

    // 点击外部关闭
    document.addEventListener('click', function(e) {
      if (!panel.contains(e.target) && !fab.contains(e.target)) {
        if (panel.classList.contains('active')) {
          // 延迟关闭，避免和打开冲突
          setTimeout(function() {
            if (!panel.matches(':hover')) closePanel();
          }, 200);
        }
      }
    });
  }

  function togglePanel() {
    var panel = document.getElementById('aiFloatPanel');
    if (panel.classList.contains('active')) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    var panel = document.getElementById('aiFloatPanel');
    panel.classList.add('active');
    // 隐藏badge
    var badge = document.querySelector('.ai-fab-badge');
    if (badge) badge.style.display = 'none';
    // 加载对话
    if (!window._aiFloatLoaded) {
      window._aiFloatLoaded = true;
      AITutorFloat.switchTab('chat');
    }
  }

  function closePanel() {
    var panel = document.getElementById('aiFloatPanel');
    panel.classList.remove('active');
  }

  // 浮动面板引擎
  window.AITutorFloat = {
    currentTab: 'chat',
    messages: [],

    switchTab: function(tab) {
      this.currentTab = tab;
      // 更新标签状态
      document.querySelectorAll('.ai-float-tab').forEach(function(t) {
        t.classList.toggle('active', t.getAttribute('data-tab') === tab);
      });
      // 渲染内容
      var body = document.getElementById('aiFloatBody');
      if (!body) return;

      switch(tab) {
        case 'chat': this.renderChat(body); break;
        case 'radar': this.renderRadar(body); break;
        case 'recommend': this.renderRecommend(body); break;
      }
    },

    renderChat: function(body) {
      if (this.messages.length === 0) {
        this.addBotMessage('你好！我是你的 AI 防灾导师 🤖\n\n我已经学习了 369 道防灾题目和 34 个真实灾害场景，可以帮你解答任何防灾问题！\n\n试试下面的按钮，或直接输入你的问题！');
      }

      var html = '';
      var lastBotIdx = -1;
      this.messages.forEach(function(msg, idx) {
        if (msg.type === 'bot') {
          lastBotIdx = idx;
          html += '<div class="ai-msg ai-msg-bot" data-idx="' + idx + '"><div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble">' + msg.text.replace(/\n/g, '<br>') + '</div></div>';
        } else {
          html += '<div class="ai-msg ai-msg-user"><div class="ai-msg-bubble">' + msg.text + '</div></div>';
        }
      });

      // 智能快速操作 - 根据用户数据动态生成
      html += '<div class="ai-quick-actions">';
      
      var engine = window.AITutorEngine;
      var data = engine ? engine._data : null;
      var hasData = data && data.quizHistory && data.quizHistory.length > 0;
      
      if (hasData) {
        // 有数据时，显示个性化按钮
        html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'查看我的学习数据\')">📊 我的数据</button>';
        html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'我最薄弱的是什么\')">🎯 薄弱项</button>';
        
        // 找出最薄弱的灾害类型
        var mastery = data.mastery || {};
        var weakest = null, weakestPct = 100;
        var names = { earthquake:'地震', flood:'洪涝', typhoon:'台风', fire:'火灾', lightning:'雷电', blizzard:'暴雪', landslide:'泥石流', drought:'干旱', wildfire:'山火', volcano:'火山', tsunami:'海啸', sandstorm:'沙尘暴' };
        for (var k in mastery) {
          var d = mastery[k];
          if (d.total >= 2) {
            var pct = Math.round(d.correct / d.total * 100);
            if (pct < weakestPct) { weakestPct = pct; weakest = k; }
          }
        }
        if (weakest) {
          html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'帮我提高' + names[weakest] + '\')">💪 提高' + names[weakest] + '</button>';
        }
        
        // 显示用户答过的灾害类型
        var answered = [];
        for (var k in mastery) {
          if (mastery[k].total > 0 && names[k]) {
            answered.push({ key: k, name: names[k], count: mastery[k].total });
          }
        }
        answered.sort(function(a, b) { return b.count - a.count; });
        
        // 显示前3个答得最多的
        for (var i = 0; i < Math.min(3, answered.length); i++) {
          var item = answered[i];
          html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'' + item.name + '我答对了几题\')">' + item.name + ' (' + item.count + '题)</button>';
        }
      } else {
        // 没数据时，显示引导按钮
        html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'我想学地震\')">🌍 地震</button>';
        html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'我想学火灾\')">🔥 火灾</button>';
        html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'我想学洪涝\')">🌊 洪涝</button>';
        html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'我想学台风\')">🌪️ 台风</button>';
        html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'我想学雷电\')">⚡ 雷电</button>';
        html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'我想学暴雪\')">❄️ 暴雪</button>';
      }
      
      // 通用按钮
      html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'推荐我练习什么\')">💡 推荐练习</button>';
      html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'有什么学习技巧\')">📚 学习技巧</button>';
      html += '<button class="ai-quick-btn" onclick="AITutorFloat.quickAsk(\'防灾基础知识\')">🛡️ 基础知识</button>';
      
      html += '</div>';

      body.innerHTML = html;
      body.scrollTop = body.scrollHeight;
      
      // 打字机效果：最后一条 bot 消息如果标记为 typing，逐字显示
      var lastBotMsg = this.messages[lastBotIdx];
      if (lastBotMsg && lastBotMsg.typing && lastBotMsg.text.length > 30) {
        var bubbleEl = body.querySelector('.ai-msg[data-idx="' + lastBotIdx + '"]').querySelector('.ai-msg-bubble');
        var fullText = lastBotMsg.text;
        bubbleEl.innerHTML = '';
        var i = 0, inTag = false, displayText = '';
        var typeChar = function() {
          if (i < fullText.length) {
            var c = fullText[i];
            if (c === '<') inTag = true;
            if (inTag) { displayText += c; if (c === '>') inTag = false; }
            else { displayText += c; }
            i++;
            var delay = 18;
            if (!inTag && /[。！？\n]/.test(c)) delay = 90;
            else if (!inTag && /[，；：]/.test(c)) delay = 45;
            bubbleEl.innerHTML = displayText.replace(/\n/g, '<br>');
            body.scrollTop = body.scrollHeight;
            if (i < fullText.length) setTimeout(typeChar, delay);
            else { lastBotMsg.typing = false; }
          }
        };
        typeChar();
      }
    },

    renderRadar: function(body) {
      var html = '<div class="ai-radar-container"><canvas id="aiRadarCanvas" width="200" height="200"></canvas></div>';
      
      // 掌握度列表
      var engine = window.AITutorEngine;
      if (engine && engine._data) {
        var mastery = engine._data.mastery || {};
        var disasters = {
          earthquake: '🌍 地震', flood: '🌊 洪涝', typhoon: '🌪️ 台风',
          fire: '🔥 火灾', lightning: '⚡ 雷电', blizzard: '❄️ 暴雪',
          landslide: '⛰️ 泥石流', drought: '☀️ 干旱', wildfire: '🔥 山火',
          volcano: '🌋 火山', tsunami: '🌊 海啸', sandstorm: '🏜️ 沙尘暴'
        };
        var colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#eab308'];

        html += '<div class="ai-mastery-list">';
        var i = 0;
        for (var key in disasters) {
          var data = mastery[key] || { total: 0, correct: 0 };
          var pct = data.total > 0 ? Math.round(data.correct / data.total * 100) : 0;
          html += '<div class="ai-mastery-item">';
          html += '<span style="width:70px;flex-shrink:0">' + disasters[key] + '</span>';
          html += '<div class="ai-mastery-bar"><div class="ai-mastery-bar-fill" style="width:' + pct + '%;background:' + colors[i % colors.length] + '"></div></div>';
          html += '<span style="width:35px;text-align:right">' + pct + '%</span>';
          html += '</div>';
          i++;
        }
        html += '</div>';
      } else {
        html += '<p style="text-align:center;color:rgba(255,255,255,0.5);font-size:12px;padding:20px;">暂无学习数据，快去答题吧！</p>';
      }

      body.innerHTML = html;

      // 绘制雷达图
      setTimeout(function() { AITutorFloat.drawRadar(); }, 100);
    },

    drawRadar: function() {
      var canvas = document.getElementById('aiRadarCanvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var w = canvas.width, h = canvas.height;
      var cx = w / 2, cy = h / 2, r = 80;

      ctx.clearRect(0, 0, w, h);

      var engine = window.AITutorEngine;
      var mastery = (engine && engine._data) ? engine._data.mastery || {} : {};
      
      var labels = ['地震', '洪涝', '台风', '火灾', '雷电', '暴雪', '泥石流', '干旱', '山火', '火山', '海啸', '沙尘暴'];
      var keys = ['earthquake', 'flood', 'typhoon', 'fire', 'lightning', 'blizzard', 'landslide', 'drought', 'wildfire', 'volcano', 'tsunami', 'sandstorm'];
      var n = labels.length;

      // 画网格
      for (var level = 1; level <= 4; level++) {
        ctx.beginPath();
        var lr = r * level / 4;
        for (var i = 0; i <= n; i++) {
          var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
          var x = cx + lr * Math.cos(angle);
          var y = cy + lr * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 画轴线
      for (var i = 0; i < n; i++) {
        var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.stroke();
      }

      // 画数据
      var values = keys.map(function(k) {
        var d = mastery[k] || { total: 0, correct: 0 };
        return d.total > 0 ? d.correct / d.total : 0;
      });

      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var idx = i % n;
        var angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
        var val = values[idx];
        var x = cx + r * val * Math.cos(angle);
        var y = cy + r * val * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 画数据点
      for (var i = 0; i < n; i++) {
        var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        var val = values[i];
        var x = cx + r * val * Math.cos(angle);
        var y = cy + r * val * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      }

      // 画标签
      ctx.font = '9px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var i = 0; i < n; i++) {
        var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        var x = cx + (r + 14) * Math.cos(angle);
        var y = cy + (r + 14) * Math.sin(angle);
        ctx.fillText(labels[i], x, y);
      }
    },

    renderRecommend: function(body) {
      var engine = window.AITutorEngine;
      var recs = (engine && engine._data) ? engine._data.recommendations || [] : [];
      
      if (recs.length === 0) {
        // 默认推荐
        var defaults = [
          { icon: '🌍', title: '地震应急练习', desc: '掌握地震避险核心知识', action: "StudyEngine.start('earthquake')" },
          { icon: '🔥', title: '火灾逃生训练', desc: '学会火场自救技能', action: "StudyEngine.start('fire')" },
          { icon: '🌊', title: '洪涝防灾挑战', desc: '了解洪水应对策略', action: "StudyEngine.start('flood')" },
          { icon: '⚔️', title: '大擂台', desc: '综合知识对战', action: 'BattleEngine.init()' }
        ];

        var html = '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:12px;">📌 为你推荐</div>';
        defaults.forEach(function(r) {
          html += '<div class="ai-recommend-card" onclick="' + r.action + '">';
          html += '<div class="ai-recommend-title">' + r.icon + ' ' + r.title + '</div>';
          html += '<div class="ai-recommend-desc">' + r.desc + '</div>';
          html += '</div>';
        });
        body.innerHTML = html;
      } else {
        var html = '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:12px;">📌 基于你的学习数据推荐</div>';
        recs.forEach(function(r) {
          html += '<div class="ai-recommend-card" onclick="AITutorFloat.followRecommend(\'' + (r.disaster || '') + '\')">';
          html += '<div class="ai-recommend-title">' + (r.icon || '📚') + ' ' + (r.title || r.reason || '推荐练习') + '</div>';
          html += '<div class="ai-recommend-desc">' + (r.desc || r.reason || '点击开始练习') + '</div>';
          html += '</div>';
        });
        body.innerHTML = html;
      }
    },

    followRecommend: function(disaster) {
      closePanel();
      if (disaster && window.StudyEngine) {
        StudyEngine.start(disaster);
      } else if (window.BattleEngine) {
        BattleEngine.init();
      }
    },

    addBotMessage: function(text, typing) {
      this.messages.push({ type: 'bot', text: text, typing: typing });
    },

    addUserMessage: function(text) {
      this.messages.push({ type: 'user', text: text });
    },

    sendMessage: function() {
      var input = document.getElementById('aiFloatInput');
      if (!input) return;
      var text = input.value.trim();
      if (!text) return;
      
      this.quickAsk(text);
      input.value = '';
    },

    quickAsk: function(question) {
      this.addUserMessage(question);
      
      // 渲染用户消息
      var body = document.getElementById('aiFloatBody');
      if (body) this.renderChat(body);
      
      // 使用 LLM 生成回复（异步）
      if (window.AITutorLLM) {
        AITutorLLM.generateReply(question).then(function(reply) {
          AITutorFloat.addBotMessage(reply, true); // typing = true
          var body = document.getElementById('aiFloatBody');
          if (body) AITutorFloat.renderChat(body);
        });
      } else {
        // 回退到旧版同步回复
        var reply = this.generateReply(question);
        if (body) {
          setTimeout(function() {
            AITutorFloat.addBotMessage(reply, true); // typing = true
            AITutorFloat.renderChat(body);
          }, 500);
        }
      }
    },

    generateReply: function(question) {
      var q = question.toLowerCase();
      var engine = window.AITutorEngine;
      var data = engine ? engine._data : null;
      var names = { earthquake:'地震', flood:'洪涝', typhoon:'台风', fire:'火灾', lightning:'雷电', blizzard:'暴雪', landslide:'泥石流', drought:'干旱', wildfire:'山火', volcano:'火山', tsunami:'海啸', sandstorm:'沙尘暴' };
      var icons = { earthquake:'🌍', flood:'🌊', typhoon:'🌪️', fire:'🔥', lightning:'⚡', blizzard:'❄️', landslide:'⛰️', drought:'☀️', wildfire:'🔥', volcano:'🌋', tsunami:'🌊', sandstorm:'🏜️' };

      // 查看学习数据
      if (q.indexOf('数据') !== -1 || q.indexOf('统计') !== -1 || q.indexOf('我的') !== -1 && q.indexOf('学') !== -1) {
        if (!data || !data.quizHistory || data.quizHistory.length === 0) {
          return '你还没有答题记录哦！\n\n快去完成几道练习题吧：\n• 点击"开盲盒"抽取知识卡\n• 或者进入"学习模式"系统学习\n\n答完题后，我就能帮你分析了 📊';
        }
        
        var total = data.quizHistory.length;
        var correct = data.quizHistory.filter(function(h) { return h.correct; }).length;
        var accuracy = Math.round(correct / total * 100);
        var mastery = data.mastery || {};
        
        // 找出最强和最弱
        var best = null, bestPct = 0;
        var worst = null, worstPct = 100;
        for (var k in mastery) {
          var d = mastery[k];
          if (d.total >= 2 && names[k]) {
            var pct = Math.round(d.correct / d.total * 100);
            if (pct > bestPct) { bestPct = pct; best = k; }
            if (pct < worstPct) { worstPct = pct; worst = k; }
          }
        }
        
        var reply = '📊 你的学习数据：\n\n';
        reply += '• 总答题数：' + total + ' 题\n';
        reply += '• 答对：' + correct + ' 题\n';
        reply += '• 正确率：' + accuracy + '%\n\n';
        
        if (best) {
          reply += '🏆 最强项：' + icons[best] + names[best] + ' (' + bestPct + '%)\n';
        }
        if (worst) {
          reply += '⚠️ 薄弱项：' + icons[worst] + names[worst] + ' (' + worstPct + '%)\n';
        }
        
        reply += '\n💡 建议：';
        if (accuracy < 60) {
          reply += '你的正确率较低，建议先从基础学习开始，多做"学习模式"的练习。';
        } else if (accuracy < 80) {
          reply += '你的基础不错，建议针对薄弱项' + (worst ? names[worst] : '') + '进行专项练习。';
        } else {
          reply += '你已经掌握得很好了！可以挑战"大擂台"或"生存模式"提升实战能力。';
        }
        
        return reply;
      }

      // 查询具体灾害类型的答题情况
      for (var k in names) {
        if (q.indexOf(names[k]) !== -1 && (q.indexOf('答对') !== -1 || q.indexOf('答错') !== -1 || q.indexOf('几题') !== -1 || q.indexOf('多少') !== -1)) {
          if (!data || !data.mastery || !data.mastery[k]) {
            return '你还没有做过' + names[k] + '相关的题目哦！\n\n点击下面的按钮开始学习：';
          }
          var d = data.mastery[k];
          var pct = d.total > 0 ? Math.round(d.correct / d.total * 100) : 0;
          var reply = icons[k] + ' ' + names[k] + '答题情况：\n\n';
          reply += '• 总题数：' + d.total + ' 题\n';
          reply += '• 答对：' + d.correct + ' 题\n';
          reply += '• 答错：' + (d.total - d.correct) + ' 题\n';
          reply += '• 正确率：' + pct + '%\n\n';
          
          if (pct < 60) {
            reply += '⚠️ 掌握度较低，建议：\n1. 进入"学习模式"系统学习' + names[k] + '知识\n2. 查看百科中的' + names[k] + '文章\n3. 多做' + names[k] + '相关练习';
          } else if (pct < 80) {
            reply += '💪 掌握度一般，建议：\n1. 针对错题进行复习\n2. 尝试"' + names[k] + '专项挑战"\n3. 关注易错知识点';
          } else {
            reply += '🎉 掌握得很好！可以继续挑战更高难度的模式，或者帮助其他薄弱的灾害类型。';
          }
          return reply;
        }
      }

      // 帮我提高XX
      for (var k in names) {
        if (q.indexOf('提高') !== -1 && q.indexOf(names[k]) !== -1) {
          var d = data && data.mastery && data.mastery[k] ? data.mastery[k] : { total: 0, correct: 0 };
          var pct = d.total > 0 ? Math.round(d.correct / d.total * 100) : 0;
          
          var reply = '💪 提高' + names[k] + '掌握度的计划：\n\n';
          reply += '📍 当前水平：' + (d.total > 0 ? pct + '% (' + d.correct + '/' + d.total + ')' : '还未开始') + '\n\n';
          reply += '📚 学习步骤：\n';
          reply += '1. 基础知识：进入"学习模式" → 选择"' + names[k] + '"\n';
          reply += '2. 巩固练习：开盲盒 → 抽取' + names[k] + '知识卡\n';
          reply += '3. 实战测试：大擂台 → 挑战' + names[k] + '相关题目\n';
          reply += '4. 深度理解：百科 → 阅读' + names[k] + '文章\n\n';
          
          reply += '🎯 目标：连续答对10题' + names[k] + '相关知识！';
          return reply;
        }
      }

      // 我想学XX
      for (var k in names) {
        if (q.indexOf('想学') !== -1 && q.indexOf(names[k]) !== -1) {
          return '👍 很好的选择！' + icons[k] + names[k] + '是非常重要的防灾知识。\n\n';
        }
      }

      // 薄弱项分析
      if (q.indexOf('薄弱') !== -1 || q.indexOf('弱') !== -1 || q.indexOf('最差') !== -1) {
        if (!data || !data.quizHistory || data.quizHistory.length === 0) {
          return '你还没有答题记录哦！先去完成几道练习题，我就能帮你分析了 📊';
        }
        var mastery = data.mastery || {};
        var worst = null, worstPct = 100;
        for (var k in mastery) {
          var d = mastery[k];
          if (d.total >= 2 && names[k]) {
            var pct = Math.round(d.correct / d.total * 100);
            if (pct < worstPct) { worstPct = pct; worst = k; }
          }
        }
        if (worst) {
          return '🎯 你的薄弱项分析：\n\n' + icons[worst] + ' ' + names[worst] + '：' + worstPct + '% 正确率\n\n';
        }
        return '你的各项防灾知识掌握比较均衡，继续保持！可以尝试更高难度的挑战 🏆';
      }

      // 推荐练习
      if (q.indexOf('推荐') !== -1 || q.indexOf('练习') !== -1 || q.indexOf('学什么') !== -1) {
        if (!data || !data.quizHistory || data.quizHistory.length === 0) {
          return '💡 推荐你从基础开始：\n\n1. 🌍 地震应急 - 最基础的防灾知识\n2. 🔥 火灾逃生 - 最实用的自救技能\n3. 🌊 洪涝防灾 - 了解洪水应对\n\n点击下方的推荐卡片开始吧！';
        }
        
        // 根据数据推荐
        var mastery = data.mastery || {};
        var worst = null, worstPct = 100;
        for (var k in mastery) {
          var d = mastery[k];
          if (d.total >= 2 && names[k]) {
            var pct = Math.round(d.correct / d.total * 100);
            if (pct < worstPct) { worstPct = pct; worst = k; }
          }
        }
        
        var reply = '💡 个性化推荐：\n\n';
        if (worst) {
          reply += '1. ' + icons[worst] + ' 优先提高' + names[worst] + '（当前' + worstPct + '%）\n';
          reply += '2. 📚 进入"学习模式"系统学习\n';
          reply += '3. 🎁 开盲盒抽取' + names[worst] + '知识卡\n';
        } else {
          reply += '1. ⚔️ 挑战"大擂台"综合知识\n';
          reply += '2. ♾️ 尝试"生存模式"极限挑战\n';
          reply += '3. 📅 完成每日签到保持节奏\n';
        }
        reply += '\n坚持每天练习，你就是防灾小专家！🌟';
        return reply;
      }

      // 学习技巧
      if (q.indexOf('技巧') !== -1 || q.indexOf('方法') !== -1 || q.indexOf('怎么学') !== -1) {
        return '📚 高效学习技巧：\n\n';
        return '📚 高效学习技巧：\n\n1. **系统学习**：先进入"学习模式"打好基础\n2. **盲盒巩固**：开盲盒随机抽取知识卡\n3. **错题复习**：定期查看"错题本"复习\n4. **实战测试**：用"大擂台"检验学习成果\n5. **每日打卡**：坚持"每日签到"保持节奏\n\n💡 关键：理解 > 死记硬背，多思考"为什么"！';
      }

      // 灾害知识问答
      if (q.indexOf('地震') !== -1) {
        return '🌍 地震避险要点：\n\n1. **室内**：蹲下→掩护→抓牢（桌下）\n2. **室外**：远离建筑物、电线杆\n3. **驾车**：靠边停车，留在车内\n4. **被困**：敲击管道发出信号，保存体力\n\n⚠️ 切记：不要跳楼！不要乘电梯！';
      }

      if (q.indexOf('火灾') !== -1 || q.indexOf('火') !== -1) {
        return '🔥 火灾逃生要点：\n\n1. **湿毛巾捂口鼻**，低姿匍匐前进\n2. **摸门把手**，发烫则不开门\n3. **走楼梯**，绝不乘电梯\n4. **身上着火**：停→倒→滚\n5. **拨打119**，说清地址和火势\n\n⚠️ 切记：不要贪恋财物！';
      }

      if (q.indexOf('洪') !== -1 || q.indexOf('水') !== -1) {
        return '🌊 洪涝防灾要点：\n\n1. 向高处转移，避开河道\n2. 不要涉水行走（15cm流水可冲倒人）\n3. 远离电线杆和变压器\n4. 准备应急包（手电、食物、药品）\n5. 关注气象预警信息\n\n⚠️ 切记：不要开车穿过积水区！';
      }

      if (q.indexOf('台风') !== -1 || q.indexOf('风') !== -1) {
        return '🌪️ 台风防灾要点：\n\n1. 关好门窗，用胶带贴"米"字\n2. 收起阳台花盆等物品\n3. 远离广告牌和大树\n4. 储备3天食物和饮用水\n5. 台风眼经过时仍需警惕\n\n⚠️ 切记：台风期间不要外出！';
      }

      if (q.indexOf('雷电') !== -1 || q.indexOf('雷') !== -1) {
        return '⚡ 雷电防灾要点：\n\n1. 不要在树下、电线杆旁避雨\n2. 远离金属物品和水域\n3. 关闭手机等电子设备\n4. 在室内远离窗户和管道\n5. 汽车内相对安全（金属外壳屏蔽）\n\n⚠️ 切记：不要奔跑，尽量蹲低！';
      }

      if (q.indexOf('暴雪') !== -1 || q.indexOf('雪') !== -1) {
        return '❄️ 暴雪防灾要点：\n\n1. 减少外出，注意保暖\n2. 外出穿防滑鞋，小心行走\n3. 远离广告牌和老旧建筑\n4. 驾车减速慢行，保持车距\n5. 储备食物和饮用水\n\n⚠️ 切记：不要在高处停留！';
      }

      if (q.indexOf('泥石流') !== -1 || q.indexOf('山体') !== -1) {
        return '⛰️ 泥石流防灾要点：\n\n1. 向两侧高地跑，不要顺沟方向\n2. 远离山谷和河床\n3. 注意观察山体裂缝、树木倾斜\n4. 暴雨后不要立即进入山谷\n5. 听到异常声响立即撤离\n\n⚠️ 切记：不要贪恋财物，快速撤离！';
      }

      // 默认回复 - 更友好和引导性
      var replies = [
        '这是个好问题！建议你去"学习模式"系统学习相关知识，或者开盲盒抽取对应的知识卡 📚',
        '想了解更多信息？可以去"百科"查看详细文章，那里有全面的防灾知识 🔍',
        '实践出真知！建议多做练习题，点击"开盲盒"开始学习吧 🎁',
        '防灾知识需要系统学习，推荐你先完成"新手引导"，再挑战"大擂台" 💪',
        '你可以问我具体的灾害类型，比如"地震时该怎么办"、"火灾如何逃生"等 🌍'
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
  };

  // 初始化
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createFloatUI);
    } else {
      createFloatUI();
    }
  }

  init();
})();
