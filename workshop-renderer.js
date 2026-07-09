/**
 * 卡牌工坊渲染器 — 将 CardFragmentEngine 数据渲染为可视化工坊界面
 * 挂钩 PageManager._refreshPage，在导航到 workshop 时自动调用
 */
(function () {
  'use strict';

  function render() {
    var el = document.getElementById('workshopContent');
    if (!el) return;

    var frags = (typeof GameState !== 'undefined' && GameState._data && GameState._data.cardFragments) || {};
    var keys = Object.keys(frags).filter(function (k) { return frags[k] > 0; });
    var totalFrags = keys.reduce(function (s, k) { return s + frags[k]; }, 0);

    // 统计可合成卡牌
    var craftable = [];
    if (keys.length > 0 && typeof CardFragmentEngine !== 'undefined') {
      keys.forEach(function (cardId) {
        if ((frags[cardId] || 0) >= 10) {
          // 找到卡片名称
          var cardName = cardId;
          try {
            var allCards = typeof ALL_CARDS !== 'undefined' ? ALL_CARDS : [];
            var found = allCards.find(function (c) { return c.id === cardId; });
            if (found && found.zh) cardName = found.zh.name || cardId;
          } catch (e) {}
          craftable.push({ id: cardId, name: cardId === cardName ? cardId : cardName + ' (' + cardId + ')', count: frags[cardId] });
        }
      });
    }

    var html = '';

    // 头部统计
    html += '<div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;">';
    html += '<div style="flex:1;min-width:140px;background:rgba(255,255,255,0.06);border-radius:16px;padding:20px;text-align:center;border:1px solid rgba(251,191,36,0.2);">';
    html += '<div style="font-size:36px;font-weight:900;color:#fbbf24;">' + totalFrags + '</div>';
    html += '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">总碎片</div>';
    html += '</div>';
    html += '<div style="flex:1;min-width:140px;background:rgba(255,255,255,0.06);border-radius:16px;padding:20px;text-align:center;border:1px solid rgba(76,175,80,0.2);">';
    html += '<div style="font-size:36px;font-weight:900;color:#4ade80;">' + keys.length + '</div>';
    html += '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">碎片种类</div>';
    html += '</div>';
    html += '<div style="flex:1;min-width:140px;background:rgba(255,255,255,0.06);border-radius:16px;padding:20px;text-align:center;border:1px solid rgba(168,85,247,0.2);">';
    html += '<div style="font-size:36px;font-weight:900;color:#a78bfa;">' + craftable.length + '</div>';
    html += '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">可合成</div>';
    html += '</div>';
    html += '</div>';

    if (keys.length === 0) {
      html += '<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.4);">';
      html += '<div style="font-size:64px;margin-bottom:16px;">🧩</div>';
      html += '<h3 style="color:rgba(255,255,255,0.7);margin-bottom:8px;">还没有碎片</h3>';
      html += '<p style="font-size:13px;">去「开盲盒」获取随机碎片，集齐10张同类碎片即可合成！</p>';
      html += '</div>';
      el.innerHTML = html;
      return;
    }

    // 碎片列表
    html += '<h4 style="color:rgba(255,255,255,0.8);margin-bottom:12px;font-size:15px;">📦 我的碎片仓库</h4>';
    html += '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;">';

    // 按数量排序（多的在前）
    keys.sort(function (a, b) { return (frags[b] || 0) - (frags[a] || 0); });

    keys.forEach(function (cardId) {
      var count = frags[cardId];
      var canCraft = count >= 10;
      var pct = Math.min(100, Math.round(count / 10 * 100));
      var barColor = canCraft ? '#4ade80' : '#fbbf24';
      var cardName = cardId;
      try {
        var allCards = typeof ALL_CARDS !== 'undefined' ? ALL_CARDS : [];
        var found = allCards.find(function (c) { return c.id === cardId; });
        if (found && found.zh) cardName = found.zh.name || cardId;
      } catch (e) {}

      html += '<div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:14px 18px;border:1px solid ' + (canCraft ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)') + ';position:relative;overflow:hidden;">';

      // 进度条背景
      html += '<div style="position:absolute;left:0;top:0;height:100%;width:' + pct + '%;background:' + barColor + '15;transition:width 0.3s;"></div>';

      html += '<div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1;">';
      html += '<div>';
      html += '<div style="font-weight:700;color:#fff;font-size:14px;">' + cardName + '</div>';
      html += '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:2px;">' + count + ' / 10 碎片</div>';
      html += '</div>';
      if (canCraft) {
        html += '<button class="wb-btn wb-btn-primary" onclick="(function(){if(typeof CardFragmentEngine!==\'undefined\'){CardFragmentEngine.craft(\'' + cardId + '\');WorkshopRenderer.render();}})()" style="font-size:12px;padding:8px 18px;border-radius:10px;cursor:pointer;">✨ 合成</button>';
      } else {
        html += '<span style="font-size:12px;color:rgba(255,255,255,0.3);">还需 ' + (10 - count) + ' 片</span>';
      }
      html += '</div></div>';
    });
    html += '</div>';

    // 可合成提示
    if (craftable.length > 0) {
      html += '<div style="background:linear-gradient(135deg,rgba(251,191,36,0.12),rgba(168,85,247,0.12));border-radius:14px;padding:16px 20px;border:1px solid rgba(251,191,36,0.25);text-align:center;">';
      html += '<span style="font-size:20px;">🎉</span> ';
      html += '<span style="color:#fbbf24;font-weight:700;">' + craftable.length + ' 种卡牌可以合成！</span>';
      html += '<span style="color:rgba(255,255,255,0.5);"> 点击上方「✨ 合成」按钮即可</span>';
      html += '</div>';
    }

    el.innerHTML = html;
  }

  // 工坊页面是否处于激活状态
  function isWorkshopActive() {
    var wp = document.getElementById('page-workshop');
    return !!(wp && wp.classList.contains('active'));
  }

  // 核心修复：碎片变化时若工坊正显示，立即重绘。
  // 覆盖「在工坊页打开盲盒(模态)→获得碎片→关闭」这类不触发页面导航、
  // 且 PageManager.navigate 因 `if(_currentPage===pageId)return` 提前返回而漏渲染的流程。
  function hookFragmentEngine() {
    if (typeof CardFragmentEngine === 'undefined' || CardFragmentEngine.__workshopHooked) return;
    CardFragmentEngine.__workshopHooked = true;
    ['addFragment', 'craft'].forEach(function (m) {
      var orig = CardFragmentEngine[m];
      if (typeof orig !== 'function') return;
      CardFragmentEngine[m] = function () {
        var r = orig.apply(this, arguments);
        if (isWorkshopActive()) render();
        return r;
      };
    });
  }

  // 挂钩 PageManager：导航到 workshop 时自动渲染（多重保险）
  function hook() {
    hookFragmentEngine();
    if (typeof PageManager === 'undefined') return;
    var _refresh = PageManager._refreshPage;
    if (!_refresh || PageManager.__workshopHooked) return;
    PageManager.__workshopHooked = true;
    PageManager._refreshPage = function (pageId) {
      _refresh.apply(this, arguments);
      if (pageId === 'workshop') { setTimeout(render, 100); setTimeout(render, 500); }
    };
    // 关键修复：PageManager 在“重复导航到已访问过的页面”时不再调用 _refreshPage，
    // 导致工坊停留在首次空渲染、开盲盒后拿到的碎片不显示。
    // 因此直接包裹 navigate（每次导航必然调用），导航到 workshop 时用 rAF 可靠触发渲染。
    var _nav = PageManager.navigate;
    if (typeof _nav === 'function') {
      PageManager.navigate = function (pageId) {
        var r = _nav.apply(this, arguments);
        if (pageId === 'workshop') {
          requestAnimationFrame(function () { requestAnimationFrame(render); });
        }
        return r;
      };
    }
    // 保险：监听 workshop 页面激活
    var observer = new MutationObserver(function () {
      if (isWorkshopActive()) render();
    });
    var appEl = document.getElementById('app') || document.body;
    if (appEl) observer.observe(appEl, { subtree: true, attributes: true, attributeFilter: ['class'] });
    // 初始检查：如果当前就在 workshop 页面
    setTimeout(function () {
      if (isWorkshopActive()) render();
    }, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook);
  else hook();
  window.addEventListener('load', hook);

  window.WorkshopRenderer = { render: render };
})();
