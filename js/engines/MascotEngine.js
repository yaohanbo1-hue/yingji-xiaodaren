/**
 * ============================================================================
 * MascotEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const MascotEngine = {say(text,duration=3e3){const el=document.getElementById("mascotBubble");el&&(el.textContent=text,el.style.display="block",setTimeout(()=>el.style.display="none",duration))},onCorrect(){this.say("太棒了！继续保持！")},onWrong(){this.say("没关系，下次一定行！")},onCelebrate(){this.say("🎉 哇！你是防灾大师！")}};
