// 修复 battle 页面位置
(function() {
  'use strict';
  
  // 等待 DOM 加载完成
  function fixBattlePosition() {
    var app = document.getElementById('app');
    var battlePage = document.getElementById('page-battle');
    
    if (!app || !battlePage) {
      setTimeout(fixBattlePosition, 100);
      return;
    }
    
    // 检查 page-battle 是否在 #app 内
    if (!app.contains(battlePage)) {
      // 将 page-battle 移到 #app 内部
      app.appendChild(battlePage);
      console.log('✅ page-battle 已移到 #app 内部');
    }
    
    // 强制设置位置
    battlePage.style.top = '0px';
    battlePage.style.paddingTop = '60px';
  }
  
  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixBattlePosition);
  } else {
    fixBattlePosition();
  }
})();
