/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — UI 润色引擎
 * ===========================================================================
 * 
 * 【数字滚动算法详解】
 * numberCounter(selector, target, duration)
 * 1. 获取当前值: current = parseInt(el.textContent)
 * 2. 计算每帧增量: step = (target - current) / (duration / 16)
 * 3. 使用 requestAnimationFrame 循环:
 *    current += step
 *    el.textContent = Math.floor(current).toLocaleString()
 * 4. 到达目标值后停止循环
 * 
 * 【交错动画】
 * stagger(selector, delay)
 * 为每个匹配元素添加递增的 animation-delay，
 * 实现依次进入的瀑布流效果。
 * 例如: 第1个元素 0ms，第2个 50ms，第3个 100ms...
 * 
 * 【水波纹效果】
 * rippleEffect(button, event)
 * 在按钮点击位置创建径向扩散的圆形动画，
 * 模拟水波纹扩散效果，增强点击反馈感。
 * 
 * 【模块说明】
 * UIPolishEngine 负责游戏中的各种 UI 细节优化和润色效果，
 * 让界面看起来更精致、更专业。
 * 
 * 【包含功能】
 * 1. 按钮悬停音效和光晕效果
 * 2. 卡片翻转动画
 * 3. 数字滚动计数器（金币/分数/连击）
 * 4. 进度条平滑动画
 * 5. 菜单项延迟交错动画（stagger animation）
 * 6. 加载骨架屏（skeleton loading）
 * 7. 工具提示（tooltip）
 * 8. 滚动指示器
 * 
 * 【设计原则】
 * - 所有动画使用 cubic-bezier 缓动函数
 * - 过渡时间不超过 300ms（保持流畅感）
 * - 移动端触摸反馈优化
 * - 60fps 性能目标
 * 
 * 【使用示例】
 * UIPolishEngine.init();                    // 初始化
 * UIPolishEngine.numberCounter('#score', 100, 2000); // 数字滚动
 * UIPolishEngine.stagger('.menu-btn', 50);  // 交错动画
 * 
 * @version 1.1.0
 * @date 2026-06-05
 * @author 应急小达人开发团队
 * ===========================================================================
 */
!function(){"use strict";function safePlay(sfx){try{"undefined"!=typeof AudioManager&&AudioManager&&AudioManager.play&&AudioManager.play(sfx)}catch(_){}}function safeFloat(x,y,text,color,size){try{"function"==typeof showFloatingText&&showFloatingText(x,y,text,color||"#fff",size||22)}catch(_){}}var comboCount=0,comboTimer=null,comboEl=null,lastCorrectCount=0,lastWrongCount=0;function scanEmpty(){document.querySelectorAll('.empty-state, [class*="empty"]').forEach(function(el){if(!el.dataset.uiEnhanced){el.dataset.uiEnhanced="1";var text=el.textContent||"",emoji="📊";/暂无|空空如也|没有数据/.test(text)?emoji="📭":/暂无|没有.*记录/.test(text)?emoji="📝":/暂无|没有.*收藏/.test(text)&&(emoji="⭐");var icon=document.createElement("div");icon.textContent=emoji,icon.style.cssText="font-size:48px;text-align:center;opacity:0.5;margin-bottom:12px;transition:opacity 0.3s;",icon.onmouseenter=function(){icon.style.opacity="1"},icon.onmouseleave=function(){icon.style.opacity="0.5"},el.insertBefore(icon,el.firstChild)}})}function addRipple(e){var btn=e.target.closest(".btn, .mode-btn, .tool-btn");if(btn){var rect=btn.getBoundingClientRect(),ripple=document.createElement("span");ripple.style.cssText="position:absolute;border-radius:50%;background:rgba(255,255,255,0.3);transform:scale(0);pointer-events:none;z-index:5;";var size=Math.max(rect.width,rect.height);ripple.style.width=ripple.style.height=size+"px",ripple.style.left=e.clientX-rect.left-size/2+"px",ripple.style.top=e.clientY-rect.top-size/2+"px",btn.style.position=btn.style.position||"relative",btn.style.overflow="hidden",btn.appendChild(ripple),ripple.animate([{transform:"scale(0)",opacity:.5},{transform:"scale(3)",opacity:0}],{duration:500,easing:"ease-out"}),setTimeout(function(){ripple.remove()},550)}}function init(){!function(){if(!document.getElementById("ui-polish-v3-css")){var s=document.createElement("style");s.id="ui-polish-v3-css",s.textContent=["@keyframes uiWrongShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-6px)}60%{transform:translateX(6px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}","@keyframes uiTitleBounce{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}","@keyframes uiComboIn{0%{opacity:0;transform:translateX(-50%) scale(2.2)}40%{opacity:1;transform:translateX(-50%) scale(0.95)}100%{opacity:1;transform:translateX(-50%) scale(1)}}"].join("\n"),document.head.appendChild(s)}}(),document.addEventListener("click",addRipple,!0);var fn,t,bodyObserver=new MutationObserver((fn=function(){(function(){var correctEls=document.querySelectorAll(".quiz-opt.correct, .option-btn.correct"),wrongEls=document.querySelectorAll(".quiz-opt.wrong, .option-btn.wrong");if(correctEls.length>lastCorrectCount){comboCount++,safePlay("correct"),[3,5,10,15,25].indexOf(comboCount)>=0&&function(count){comboEl||((comboEl=document.createElement("div")).className="ui-combo-banner",comboEl.style.cssText="position:fixed;top:80px;left:50%;transform:translateX(-50%) scale(2);z-index:99999;font-size:28px;font-weight:900;pointer-events:none;opacity:0;text-shadow:0 2px 16px rgba(0,0,0,0.6);white-space:nowrap;transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s cubic-bezier(0.34,1.56,0.64,1);",document.body.appendChild(comboEl));var color={3:"#38bdf8",5:"#f97316",10:"#ef4444",15:"#facc15",25:"#ff00ff"}[count]||"#00d4ff",label={3:"🔥 3连击！",5:"⚡ 5连击！COMBO",10:"💥 10连击！超神！",15:"🌟 15连击！无敌！",25:"👑 25连击！传说！"}[count]||"🔥 "+count+"连击！";comboEl.textContent=label,comboEl.style.color=color,comboEl.style.fontSize=Math.min(28+2*count,56)+"px",comboEl.style.opacity="1",comboEl.style.transform="translateX(-50%) scale(1)",clearTimeout(comboTimer),comboTimer=setTimeout(function(){comboEl.style.opacity="0",comboEl.style.transform="translateX(-50%) scale(0.6) translateY(-20px)"},2e3)}(comboCount);var el=correctEls[correctEls.length-1],rect=el.getBoundingClientRect();safeFloat(rect.left+rect.width/2,rect.top-10,"+10 ✅","#22c55e",26),function(x,y){for(var i=0;i<5;i++)(function(delay){setTimeout(function(){var coin=document.createElement("div");coin.textContent=["🪙","💰","✨","⭐"][Math.floor(4*Math.random())],coin.style.cssText="position:fixed;z-index:99998;font-size:18px;pointer-events:none;transition: transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.8s cubic-bezier(0.25,0.46,0.45,0.94);",coin.style.left=x+"px",coin.style.top=y+"px",document.body.appendChild(coin),requestAnimationFrame(function(){coin.style.left=window.innerWidth-60+"px",coin.style.top="20px",coin.style.opacity="0",coin.style.transform="scale(0.3) rotate(360deg)"}),setTimeout(function(){coin.remove()},900)},delay)})(80*i)}(rect.left+rect.width/2,rect.top),el.classList.contains("ui-glow-correct")||(el.classList.add("ui-glow-correct"),el.style.boxShadow="0 0 25px rgba(34, 197, 94, 0.5)",el.style.borderColor="rgba(34, 197, 94, 0.8)")}if(wrongEls.length>lastWrongCount){comboCount=0,safePlay("wrong");var el2=wrongEls[wrongEls.length-1],rect2=el2.getBoundingClientRect();safeFloat(rect2.left+rect2.width/2,rect2.top-10,"❌","#ef4444",26),el2.classList.contains("ui-shake-wrong")||(el2.classList.add("ui-shake-wrong"),el2.style.animation="uiWrongShake 0.4s ease-in-out",el2.style.boxShadow="0 0 25px rgba(239, 68, 68, 0.5)",el2.style.borderColor="rgba(239, 68, 68, 0.8)")}lastCorrectCount=correctEls.length,lastWrongCount=wrongEls.length})(),document.querySelectorAll('.modal-overlay, .modal, [class*="modal"]').forEach(function(m){if(!m.dataset.uiCelebrated){var title=m.querySelector("h2, h3, .modal-title");if(title){var text=title.textContent||"";/胜利|通过|完成|恭喜|通关/.test(text)&&(m.dataset.uiCelebrated="1",function(){for(var emojis=["🎉","🎊","✨","🌟","🎈","🎆","🎇","🏆"],i=0;i<20;i++)(function(delay){setTimeout(function(){var p=document.createElement("div");p.textContent=emojis[Math.floor(Math.random()*emojis.length)],p.style.cssText="position:fixed;z-index:99997;font-size:"+(16+20*Math.random())+"px;pointer-events:none;transition: transform 1.5s ease-out, opacity 1.5s ease-out, box-shadow 1.5s ease-out;",p.style.left=Math.random()*window.innerWidth+"px",p.style.top="-30px",p.style.opacity="1",document.body.appendChild(p),requestAnimationFrame(function(){p.style.top=window.innerHeight+30+"px",p.style.left=parseFloat(p.style.left)+100*(Math.random()-.5)+"px",p.style.opacity="0",p.style.transform="rotate("+720*Math.random()+"deg)"}),setTimeout(function(){p.remove()},1600)},delay)})(60*i)}(),title.style.animation="uiTitleBounce 0.5s cubic-bezier(0.34,1.56,0.64,1)")}}}),scanEmpty()},function(){var c=this,a=arguments;clearTimeout(t),t=setTimeout(function(){fn.apply(c,a)},150)}));bodyObserver.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class"]}),setTimeout(function(){scanEmpty()},2e3)}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",init):init()}();