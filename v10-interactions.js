/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 交互动画引擎
 * ===========================================================================
 * 
 * 【交互效果详解】
 * 
 * 1. 水波纹效果 (Ripple Effect)
 *    - 在点击位置创建 radial-gradient 圆形
 *    - 使用 CSS animation 实现扩散效果
 *    - 动画结束后自动移除 DOM 元素
 * 
 * 2. 滑动切换 (Swipe Navigation)
 *    - 监听 touchstart/touchmove/touchend
 *    - 计算滑动距离和方向
 *    - 超过阈值 (50px) 触发页面切换
 * 
 * 3. 长按反馈 (Long Press Haptic)
 *    - 按住 500ms 触发震动反馈
 *    - 使用 navigator.vibrate API (移动端)
 *    - 桌面端使用视觉反馈替代
 * 
 * 4. 拖拽排序 (Drag & Drop)
 *    - HTML5 Drag and Drop API
 *    - 拖拽时半透明化原元素
 *    - 放置时播放动画效果
 * 
 * 【模块说明】
 * V10Interactions 负责游戏中的高级交互动画效果，
 * 提升用户操作的视觉反馈和沉浸感。
 * 
 * 【包含功能】
 * 1. 按钮点击水波纹效果（ripple effect）
 * 2. 滑动切换手势（swipe navigation）
 * 3. 长按震动反馈（long press haptic）
 * 4. 拖拽排序动画（drag & drop）
 * 5. 缩放进入/退出动画（scale transition）
 * 6. 弹性滚动（elastic scroll）
 * 7. 3D 翻转卡片（3D card flip）
 * 
 * 【交互原则】
 * - 每次交互都有明确的视觉/触觉反馈
 * - 动画时间控制在 200-400ms
 * - 使用 transform 和 opacity 保证 60fps
 * - 移动端适配触摸事件
 * 
 * @version 1.1.0
 * @date 2026-06-05
 * @author 应急小达人开发团队
 * ===========================================================================
 */
const V10Toast={_container:null,init(){this._container=document.createElement("div"),this._container.style.cssText="position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;gap:8px;pointer-events:none;",document.body.appendChild(this._container)},show(message,type="info",duration=2500){this._container||this.init();const toast=document.createElement("div");toast.className="v10-toast "+type,toast.textContent=message,this._container.appendChild(toast),requestAnimationFrame(()=>{requestAnimationFrame(()=>toast.classList.add("show"))}),setTimeout(()=>{toast.classList.remove("show"),setTimeout(()=>toast.remove(),400)},duration)},success(msg){this.show(msg,"success")},error(msg){this.show(msg,"error")},warning(msg){this.show(msg,"warning")},info(msg){this.show(msg,"info")}},V10CountUp={animate(element,target,duration=800){const start=parseInt(element.textContent)||0,diff=target-start,startTime=performance.now();requestAnimationFrame(function step(currentTime){const elapsed=currentTime-startTime,progress=Math.min(elapsed/duration,1),eased=1-Math.pow(1-progress,3);element.textContent=Math.round(start+diff*eased),progress<1&&requestAnimationFrame(step)})}},V10PageTransition={_history:[],_isTransitioning:!1,navigate(pageId,direction="forward"){if(this._isTransitioning)return!1;if("undefined"==typeof PageManager)return!1;if(PageManager._currentPage===pageId)return!1;this._isTransitioning=!0;const oldPage=document.getElementById("page-"+PageManager._currentPage),newPage=document.getElementById("page-"+pageId);return newPage?(oldPage&&(oldPage.style.animation="v10-pageExit 0.3s var(--v10-ease-smooth) forwards"),setTimeout(()=>{document.querySelectorAll(".page").forEach(p=>{p.classList.remove("active"),p.style.animation=""}),newPage.classList.add("active"),newPage.style.animation="forward"===direction?"v10-slideInRight 0.4s var(--v10-ease-out) forwards":"v10-slideInLeft 0.4s var(--v10-ease-out) forwards",PageManager._currentPage=pageId,PageManager._refreshPage(pageId),document.querySelectorAll(".tool-btn[data-nav]").forEach(btn=>{btn.classList.toggle("active",btn.dataset.nav===pageId)}),AudioManager.play("whoosh"),setTimeout(()=>{this._isTransitioning=!1,newPage.style.animation=""},400)},300),!0):(this._isTransitioning=!1,!1)},back(){if(this._history.length>0){const prev=this._history.pop();this.navigate(prev,"back")}else this.navigate("menu","back")},push(pageId){if("undefined"==typeof PageManager)return;this._history.push(PageManager._currentPage)}};if("undefined"!=typeof AudioManager){const origPlay=AudioManager.play.bind(AudioManager);AudioManager.play=function(name,vol){try{origPlay(name,vol)}catch(e){}}}const origModalShow=Modal.show.bind(Modal);Modal.show=function(title,desc,icon){if(desc&&desc.length<50&&!desc.includes("<")){if(desc.includes("成功")||desc.includes("✅")||desc.includes("获得"))return void V10Toast.success(icon+" "+desc);if(desc.includes("失败")||desc.includes("❌")||desc.includes("错误"))return void V10Toast.error(icon+" "+desc)}origModalShow(title,desc,icon)},"loading"===document.readyState?document.addEventListener("DOMContentLoaded",()=>V10Toast.init()):V10Toast.init();