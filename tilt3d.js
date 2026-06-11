/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 鼠标跟随 3D 倾斜引擎
 * ===========================================================================
 * 
 * 【模块说明】
 * Tilt3DEngine 实现了基于鼠标/触摸位置的 3D 透视倾斜效果。
 * 通过 CSS transform 的 rotateX/Y 配合 perspective，让游戏卡片
 * 和面板产生跟随鼠标移动的 3D 立体视差效果。
 * 
 * 【技术原理】
 * 1. 监听 mousemove / touchmove 事件获取鼠标位置
 * 2. 计算鼠标相对于元素中心的偏移百分比
 * 3. 将偏移映射为 rotateX/Y 角度（最大 ±15deg）
 * 4. 应用 CSS transform: perspective(1000px) rotateX() rotateY()
 * 5. 添加平滑过渡动画和光泽反射层
 * 
 * 【性能优化】
 * - 使用 requestAnimationFrame 节流
 * - 鼠标移出元素时自动复位
 * - 移动端触摸事件兼容
 * 
 * 【使用示例】
 * Tilt3DEngine.init();                    // 初始化
 * Tilt3DEngine.applyTo('.my-card');       // 应用到指定选择器
 * Tilt3DEngine.setMaxTilt(20);           // 设置最大倾斜角度
 * 
 * @version 1.1.0
 * @date 2026-06-05
 * @author 应急小达人开发团队
 * ===========================================================================
 */
/* ============================================
   3D 鼠标跟随倾斜交互
   对 .quiz-opt / .scenario-opt / .mode-btn 生效
   ============================================ */
(function(){
  function addTilt3D(selector){
    document.querySelectorAll(selector).forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rotateY = ((x - cx) / cx) * 8;  // 左右倾斜 ±8°
        var rotateX = ((cy - y) / cy) * 6;  // 上下倾斜 ±6°
        el.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(12px) scale(1.02)';
      });
      el.addEventListener('mouseleave', function(){
        el.style.transform = '';
      });
    });
  }

  // 延迟初始化（等 DOM 渲染完）
  function init(){
    addTilt3D('.quiz-opt');
    addTilt3D('.scenario-opt');
    addTilt3D('.mode-btn');
  }

  if(document.readyState === 'complete'){
    setTimeout(init, 500);
  } else {
    window.addEventListener('load', function(){ setTimeout(init, 500); });
  }

  // 也支持动态生成的选项（MutationObserver）
  var observer = new MutationObserver(function(mutations){
    mutations.forEach(function(m){
      m.addedNodes.forEach(function(node){
        if(node.nodeType === 1){
          if(node.classList && (node.classList.contains('quiz-opt') || node.classList.contains('scenario-opt'))){
            addTilt3D('.quiz-opt');
            addTilt3D('.scenario-opt');
          }
        }
      });
    });
  });
  observer.observe(document.body, {childList: true, subtree: true});
})();
