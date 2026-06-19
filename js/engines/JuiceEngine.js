/**
 * ============================================================================
 * JuiceEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const JuiceEngine = {particleBurst(targetEl,count=12){if(!targetEl)return;const rect=targetEl.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,colors=["#00D4FF","#FFD700","#FF006E","#00E676","#AB47BC","#FF9800"];for(let i=0;i<count;i++){const p=document.createElement("div");p.className="particle-burst";const angle=2*Math.PI*i/count,dist=40+60*Math.random();p.style.cssText=`\n        left: ${cx}px; top: ${cy}px;\n        background: ${colors[i%colors.length]};\n        --dx: ${Math.cos(angle)*dist}px;\n        --dy: ${Math.sin(angle)*dist}px;\n        width: ${4+6*Math.random()}px;\n        height: ${4+6*Math.random()}px;\n      `,document.body.appendChild(p),setTimeout(()=>p.remove(),700)}},screenFlash(color="rgba(255,215,0,0.3)",duration=200){const flash=document.createElement("div");flash.style.cssText=`\n      position: fixed; inset: 0; background: ${color};\n      z-index: 99999; pointer-events: none;\n      animation: flashFade ${duration}ms ease-out forwards;\n    `,document.body.appendChild(flash),setTimeout(()=>flash.remove(),duration+50)},coinFloatText(x,y,text="+10"){const el=document.createElement("div");el.className="coin-float-text",el.style.cssText=`\n      position: fixed; left: ${x}px; top: ${y}px;\n      color: #FFD700; font-size: 24px; font-weight: 900;\n      z-index: 9999; pointer-events: none;\n      text-shadow: 0 0 10px rgba(255,215,0,0.8);\n    `,el.textContent=text,document.body.appendChild(el),setTimeout(()=>el.remove(),1100)}};
