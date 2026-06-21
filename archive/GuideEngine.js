/**
 * ============================================================================
 * GuideEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const GuideEngine = {steps:[{icon:"📦",title:"欢迎！",text:"欢迎来到应急小达人！在这里，你将通过游戏学习防灾知识，成为防灾小英雄！"},{icon:"🃏",title:"盲盒抽卡",text:'点击"盲盒抽卡"，每次消耗5金币抽取一张知识卡牌。卡牌包含各种灾害的应对方法！'},{icon:"⚔️",title:"防灾大擂台",text:"挑战灾害怪兽！答对题目攻击怪物，答错自己受伤。击败BOSS获得丰厚奖励！"},{icon:"🏪",title:"商店系统",text:"用金币购买提示卡、复活卡等道具，还能换装酷炫外观！"},{icon:"🌍",title:"灾害百科",text:"10种灾害的详细知识，阅读文章也能获得金币奖励！"},{icon:"🎯",title:"准备出发！",text:"现在你已经了解了基本玩法，开始你的防灾之旅吧！记住，知识就是力量！"}],currentStep:0,active:!1,init(){PageManager.navigate("guide"),this.currentStep=0,this.active=!0,this._showStep(),AudioManager.play("start")},_showStep(){var step=this.steps[this.currentStep],stepEl=document.getElementById("guideStep"),iconEl=document.getElementById("guideIcon"),textEl=document.getElementById("guideText");stepEl&&(stepEl.textContent=this.currentStep+1+"/"+this.steps.length),iconEl&&(iconEl.textContent=step.icon),textEl&&(textEl.innerHTML="<strong>"+step.title+"</strong><br><br>"+step.text);var fill=document.getElementById("guideProgressFill");fill&&(fill.style.width=(this.currentStep+1)/this.steps.length*100+"%")},next(){this.currentStep<this.steps.length-1?(this.currentStep++,this._showStep(),AudioManager.play("click")):this._complete()},prev(){this.currentStep>0&&(this.currentStep--,this._showStep(),AudioManager.play("click"))},_complete(){this.active=!1,AudioManager.play("victory"),"function"==typeof victoryEffect&&victoryEffect(),void 0!==GameState&&GameState._data&&(GameState._data.tutorialDone=!0,GameState._data.coins=(GameState._data.coins||0)+20,"function"==typeof GameState.save&&GameState.save()),Modal.show("🎓 引导完成！","你已经掌握了基本操作！<br><br>💰 +20 金币<br><br>现在开始你的防灾之旅吧！","🎉"),setTimeout(function(){PageManager.navigate("menu")},2e3)}};
