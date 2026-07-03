/**
 * ============================================================================
 * report.js — 学习报告引擎
 * ============================================================================
 * 生成学习报告：包含学习时长、答题统计、薄弱项分析等
 * 支持一键导出为 PNG 图片
 * ============================================================================
 */

const ReportEngine = {
  _data: null,
  
  /**
   * 显示学习报告首页
   */
  showReport: function() {
    var el = document.getElementById('reportDetailContent');
    if (!el) return;
    
    var stats = GameState && GameState._data ? GameState._data.stats || {} : {};
    var totalCorrect = stats.correct || 0;
    var totalWrong = stats.wrong || 0;
    var totalAnswered = totalCorrect + totalWrong;
    var accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    var streak = stats.maxStreak || 0;
    var level = GameState._data ? GameState._data.level || 1 : 1;
    var exp = GameState._data ? GameState._data.exp || 0 : 0;
    var gamesPlayed = stats.gamesPlayed || 0;
    var cardsCollected = GameState._data ? (GameState._data.cards || []).length : 0;
    
    el.innerHTML = '<div style="text-align:center;padding:20px">' +
      '<div style="font-size:80px;margin-bottom:16px;text-shadow:0 0 30px rgba(52,211,153,0.3);">📊</div>' +
      '<h3 style="color:rgba(255,255,255,0.95);margin-bottom:8px;font-size:22px;">学习报告概览</h3>' +
      '<p style="color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:24px;">坚持学习，每一点进步都值得记录</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:360px;margin:0 auto;">' +
        ReportEngine._statCard('📊', '答题总数', totalAnswered) +
        ReportEngine._statCard('🎯', '正确率', accuracy + '%') +
        ReportEngine._statCard('🔥', '最高连击', streak + 'x') +
        ReportEngine._statCard('📚', '学习次数', gamesPlayed) +
        ReportEngine._statCard('🃏', '收集卡牌', cardsCollected) +
        ReportEngine._statCard('⭐', '等级', 'Lv.' + level) +
      '</div>' +
      '<button type="button" class="wb-btn wb-btn-primary" onclick="ReportEngine.showDetailReport()" style="margin-top:24px;padding:12px 28px;font-size:15px;">📋 查看详细报告</button>' +
      '<button type="button" class="wb-btn" onclick="ReportEngine.exportReport()" style="margin-top:12px;margin-left:8px;padding:12px 28px;font-size:15px;">📥 导出报告</button>' +
    '</div>';
  },

  _statCard: function(icon, label, value) {
    return '<div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.15);border-radius:12px;padding:14px 10px;text-align:center;">' +
      '<div style="font-size:24px;margin-bottom:4px;">' + icon + '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:2px;">' + label + '</div>' +
      '<div style="font-size:20px;font-weight:700;color:rgba(52,211,153,0.95);">' + value + '</div>' +
    '</div>';
  },

  /**
   * 显示详细报告
   */
  showDetailReport: function() {
    var el = document.getElementById('reportDetailContent');
    if (!el) return;

    el.innerHTML = '<div style="text-align:center;padding:20px"><div style="font-size:48px;margin-bottom:16px;">📋</div><div style="color:rgba(255,255,255,0.6);">报告加载中...</div></div>';

    // 异步生成详细报告
    setTimeout(function() {
      try {
        var html = ReportEngine._buildDetailReport();
        if (el) el.innerHTML = html;
      } catch(e) {
        if (el) el.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">⚠️ 报告生成失败，请稍后再试</div>';
      }
    }, 100);
  },

  /**
   * 生成详细报告 HTML
   */
  _buildDetailReport: function() {
    var stats = GameState && GameState._data ? GameState._data.stats || {} : {};
    var totalCorrect = stats.correct || 0;
    var totalWrong = stats.wrong || 0;
    var totalAnswered = totalCorrect + totalWrong;
    var accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    var streak = stats.maxStreak || 0;
    var gamesPlayed = stats.gamesPlayed || 0;
    var level = GameState._data ? GameState._data.level || 1 : 1;
    var exp = GameState._data ? GameState._data.exp || 0 : 0;
    var coins = GameState._data ? GameState._data.coins || 0 : 0;
    var cardsCollected = GameState._data ? (GameState._data.cards || []).length : 0;

    // 灾害类型正确率
    var typeStats = '';
    var disasterIcons = {earthquake:'🌍',flood:'🌊',fire:'🔥',typhoon:'🌀',tsunami:'🌊',landslide:'⛰️',tornado:'🌪️',drought:'☀️',lightning:'⚡',avalanche:'❄️',volcano:'🌋',hail:'🧊',wildfire:'🌲',blizzard:'❄️'};
    var typeData = stats.byType || {};
    for (var type in disasterIcons) {
      var t = typeData[type] || {correct:0,wrong:0};
      var tc = t.correct || 0;
      var tw = t.wrong || 0;
      var ta = tc + tw;
      var pct = ta > 0 ? Math.round(tc / ta * 100) : 0;
      if (ta > 0) {
        typeStats += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">' +
          '<span>' + (disasterIcons[type] || '🌍') + '</span>' +
          '<span style="flex:1;font-size:13px;color:rgba(255,255,255,0.7);text-align:left;">' + type + '</span>' +
          '<span style="font-size:12px;color:rgba(255,255,255,0.5);">' + ta + '题</span>' +
          '<div style="width:60px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">' +
          '<div style="height:100%;width:' + pct + '%;background:' + (pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171') + ';border-radius:3px;"></div></div>' +
          '<span style="font-size:12px;width:36px;text-align:right;color:' + (pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171') + ';">' + pct + '%</span>' +
        '</div>';
      }
    }

    var html = '<div style="padding:20px;max-width:420px;margin:0 auto;">' +
      '<div style="text-align:center;margin-bottom:20px;">' +
        '<div style="font-size:64px;margin-bottom:8px;">📊</div>' +
        '<h3 style="color:#fff;margin:0;font-size:20px;">详细学习报告</h3>' +
        '<p style="color:rgba(255,255,255,0.4);font-size:12px;margin:4px 0 0;">' + new Date().toLocaleDateString('zh-CN') + '</p>' +
      '</div>' +

      // 概览数据
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;">' +
        '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px 8px;text-align:center;"><div style="font-size:11px;color:rgba(255,255,255,0.4);">等级</div><div style="font-size:18px;font-weight:700;color:#60a5fa;">' + level + '</div></div>' +
        '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px 8px;text-align:center;"><div style="font-size:11px;color:rgba(255,255,255,0.4);">正确率</div><div style="font-size:18px;font-weight:700;color:#34d399;">' + accuracy + '%</div></div>' +
        '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px 8px;text-align:center;"><div style="font-size:11px;color:rgba(255,255,255,0.4);">最高连击</div><div style="font-size:18px;font-weight:700;color:#fbbf24;">' + streak + '</div></div>' +
        '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px 8px;text-align:center;"><div style="font-size:11px;color:rgba(255,255,255,0.4);">答题数</div><div style="font-size:18px;font-weight:700;color:#a78bfa;">' + totalAnswered + '</div></div>' +
        '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px 8px;text-align:center;"><div style="font-size:11px;color:rgba(255,255,255,0.4);">游戏次数</div><div style="font-size:18px;font-weight:700;color:#f472b6;">' + gamesPlayed + '</div></div>' +
        '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px 8px;text-align:center;"><div style="font-size:11px;color:rgba(255,255,255,0.4);">金币</div><div style="font-size:18px;font-weight:700;color:#fbbf24;">' + coins + '</div></div>' +
      '</div>' +

      // 灾害类型掌握度
      '<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;margin-bottom:16px;">' +
        '<h4 style="color:rgba(255,255,255,0.8);font-size:14px;margin:0 0 12px;">🌍 各灾害类型掌握度</h4>' +
        (typeStats || '<div style="color:rgba(255,255,255,0.3);font-size:13px;text-align:center;padding:12px;">暂无数据，开始答题吧！</div>') +
      '</div>' +

      // 学习建议
      '<div style="background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.15);border-radius:12px;padding:16px;margin-bottom:16px;">' +
        '<h4 style="color:rgba(255,255,255,0.8);font-size:14px;margin:0 0 8px;">💡 学习建议</h4>' +
        '<p style="font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;margin:0;">' +
          (totalAnswered === 0 ? '开始你的第一次防灾学习吧！点击「学习模式」或「开盲盒」开始！' :
           accuracy >= 90 ? '太棒了！你已经掌握得很好，试试「灾害模拟」和「Boss Rush」挑战更高难度！' :
           accuracy >= 70 ? '表现不错！在薄弱类型上多练习，争取更高准确率！' :
           accuracy >= 50 ? '继续加油！多使用「学习模式」打牢基础，再去挑战答题模式。' :
           '别灰心！从「学习模式」开始，系统学习防灾知识，再尝试答题。') +
        '</p>' +
      '</div>' +

      '<div style="display:flex;gap:8px;justify-content:center;">' +
        '<button type="button" class="wb-btn" onclick="ReportEngine.exportReport()" style="padding:10px 20px;font-size:13px;">📥 导出为图片</button>' +
        '<button type="button" class="wb-btn wb-btn-secondary" onclick="PageManager.navigate(\'report\')" style="padding:10px 20px;font-size:13px;">← 返回</button>' +
      '</div>' +
    '</div>';

    return html;
  },

  /**
   * 导出报告为图片
   */
  exportReport: function() {
    var el = document.getElementById('reportDetailContent');
    if (!el) {
      Modal.show('❌ 导出失败', '请先生成报告');
      return;
    }

    try {
      // 使用 html2canvas 或 fallback
      if (typeof html2canvas !== 'undefined') {
        html2canvas(el, {
          backgroundColor: '#0f1117',
          scale: 2,
          useCORS: true,
          logging: false
        }).then(function(canvas) {
          var link = document.createElement('a');
          link.download = '学习报告_' + new Date().toISOString().slice(0,10) + '.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
          Modal.show('✅ 导出成功', '报告已保存为 PNG 图片');
        });
      } else {
        // Fallback: print
        window.print();
      }
    } catch(e) {
      Modal.show('❌ 导出失败', '请使用截图工具保存报告');
    }
  }
};

// 注册
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('ReportEngine', ReportEngine);
}
