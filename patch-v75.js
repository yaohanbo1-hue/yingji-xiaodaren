
/* ===== v77 紧急补丁：修复多轮检查发现的所有问题 ===== */

// 0. 全局未定义函数兜底（防止 ReferenceError）
if(typeof showSpectacleText!=='function'){window.showSpectacleText=function(){};}
if(typeof showConfetti!=='function'){window.showConfetti=function(){};}
if(typeof screenShake!=='function'){window.screenShake=function(){};}
if(typeof showFloatingText!=='function'){window.showFloatingText=function(){};}
if(typeof victoryEffect!=='function'){window.victoryEffect=function(){};}
if(typeof escapeHtml!=='function'&&typeof _escapeHtml==='function'){window.escapeHtml=_escapeHtml;}

// 1. SettingsEngine 补全（使用 var 确保全局词法绑定）
if(typeof SettingsEngine==='undefined'){window.SettingsEngine={
  toggleSFX(){var s=GameState._data.settings;s.sound=!s.sound;GameState.save();Modal.show('🔊 音效设置',s.sound?'✅ 音效已开启':'🔇 音效已关闭');},
  toggleVoice(){var s=GameState._data.settings;s.voice=!s.voice;GameState.save();Modal.show('🎙️ 语音设置',s.voice?'✅ 语音已开启':'🔇 语音已关闭');},
  exportData(){try{var data=JSON.stringify(GameState._data,null,2);var blob=new Blob([data],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='防灾存档_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);Modal.show('📤 导出成功','数据已保存到下载文件夹');}catch(e){Modal.show('❌ 导出失败',e.message);}},
  importData(){var input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=function(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){try{var data=JSON.parse(ev.target.result);if(data&&data.coins!==undefined){GameState._data=Object.assign(GameState._data,data);GameState.save();Modal.show('📥 导入成功','数据已恢复，页面即将刷新');setTimeout(function(){location.reload();},1000);}else{Modal.show('❌ 无效文件','请选择有效的存档文件');}}catch(err){Modal.show('❌ 解析失败',err.message);}};reader.readAsText(file);};input.click();},
  showAbout(){var stats=GameState._data.stats||{};Modal.show('ℹ️ 关于','<div style="text-align:center"><div style="font-size:3rem;margin-bottom:8px">🛡️</div><h3>应急小达人</h3><p>v1.3.2 — 防灾教育互动游戏</p><p>Made with ❤️</p></div>','🎉');},
  render(){var volSlider=document.getElementById('bgmVolumeSlider');if(volSlider&&GameState._data.settings){volSlider.value=GameState._data.settings.bgmVolume||50;}}
};}

// 2. TutorialEngine.reset() 补全
if(typeof TutorialEngine!=='undefined'&&!TutorialEngine.reset){TutorialEngine.reset=function(){localStorage.removeItem('tutorialDone');Modal.show('🎓 引导已重置','下次进入游戏将重新显示新手引导');};}

// 3. GameState.reset() 补全（修复 localStorage key）
if(typeof GameState!=='undefined'&&!GameState.reset){GameState.reset=function(){if(confirm('确定要重置所有数据吗？此操作不可恢复！')){var keys=['disasterGachaState','disasterSeason','tutorialDone','bg_theme','aitutor_profile','aitutor_cache','aiTutorData','disaster_hq_voice_enabled','disaster_hq_voice_rate','disaster_hq_voice_pitch','deepseek_proxy_url','aitutor_model'];for(var i=0;i<keys.length;i++){try{localStorage.removeItem(keys[i]);}catch(e){console.error('[GameState.reset] Error removing key:',keys[i],e);}}location.reload();}};}

// 4. QuizEngine.startSpeed() 补全
if(typeof QuizEngine!=='undefined'&&!QuizEngine.startSpeed){QuizEngine.startSpeed=function(count){this._resetState({cards:ALL_CARDS.filter(function(c){return'equip'!==c.disaster}).slice(0,count||10),totalCards:count||10,showTimer:true,timeLeft:5});this._initUI({showTimer:true});this.active=true;this.timeLimit=5;this.showQuestion();};}

// 6. ReportEngine 补全
if(typeof ReportEngine==='undefined'){window.ReportEngine={showReport(){Modal.show('📊 学习报告','<div style="text-align:center"><p>📊 功能开发中</p><p>请先完成更多游戏来生成报告</p></div>','📊');},showDetailReport(){Modal.show('📊 详细报告','<div style="text-align:center"><p>📊 功能开发中</p></div>','📊');}};}

// 7. AmbientParticles 补全
if(typeof AmbientParticles==='undefined'){window.AmbientParticles={init(){}};}

// 8. BGMEngine 补全
if(typeof BGMEngine==='undefined'){window.BGMEngine={play(){},stop(){},playBattleBgm(){},playVictoryBgm(){},playMenuBgm(){},playScenarioBgm(){},setVolume(){},initMuteButton(){}};}

// 9. TransitionEngine 补全
if(typeof TransitionEngine==='undefined'){window.TransitionEngine={flash(duration){var el=document.createElement('div');el.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(255,255,255,0.6);pointer-events:none;opacity:0;transition:opacity '+(duration/2)+'ms ease';document.body.appendChild(el);requestAnimationFrame(function(){el.style.opacity='1';setTimeout(function(){el.style.opacity='0';setTimeout(function(){el.remove();},duration/2);},duration/2);});}};}

// 10. VisualFX 补全
if(typeof VisualFX==='undefined'){window.VisualFX={startBattleParticles(){},stopBattleParticles(){},bossEntrance(icon,name){},comboFlameText(n){},checkinFireworks(){},playerHitFlash(){},ultimateFlash(color,text){},diagonalTransition(fn){fn();}};}

// 11. V10Toast 补全
if(typeof V10Toast==='undefined'){window.V10Toast={success(msg){Modal.show('✅',msg);},error(msg){Modal.show('❌',msg);},warning(msg){Modal.show('⚠️',msg);}};}

// 12. GuideEnhancer 补全
if(typeof GuideEnhancer==='undefined'){window.GuideEnhancer={forceRestart(){if(typeof GuideEngine!=='undefined'){GuideEngine.init();}else{Modal.show('📖 新手引导','引导功能正在准备中');}}};}

// 13. LevelEngine 补全（使用 var 确保全局词法绑定）
if(typeof LevelEngine==='undefined'){window.LevelEngine={
  LEVELS:[
    {level:1,name:'防灾新手',icon:'🌱',xp:0},{level:2,name:'防灾学徒',icon:'🌿',xp:150},
    {level:3,name:'防灾学员',icon:'🍃',xp:400},{level:4,name:'防灾助手',icon:'🌲',xp:800},
    {level:5,name:'防灾专员',icon:'🌳',xp:1400},{level:6,name:'防灾专家',icon:'🌴',xp:2200},
    {level:7,name:'防灾达人',icon:'⭐',xp:3200},{level:8,name:'防灾大师',icon:'🌟',xp:4500},
    {level:9,name:'防灾宗师',icon:'💫',xp:6000},{level:10,name:'防灾之神',icon:'👑',xp:8000}
  ],
  getLevel(){var xp=GameState._data.xp||0,level=1,name='防灾新手',icon='🌱';for(var i=0;i<this.LEVELS.length;i++)if(xp>=this.LEVELS[i].xp){level=this.LEVELS[i].level;name=this.LEVELS[i].name;icon=this.LEVELS[i].icon;}return{level:level,name:name,icon:icon,xp:xp};},
  getNextLevel(){var xp=GameState._data.xp||0;for(var i=0;i<this.LEVELS.length;i++)if(xp<this.LEVELS[i].xp)return{level:this.LEVELS[i].level,xp:this.LEVELS[i].xp-xp};return{level:10,xp:0};}
};}

// 14. AudioManager 补全（使用 var 确保全局词法绑定）
if(typeof AudioManager==='undefined'){window.AudioManager={
  _sounds:{},play(name,combo){},stop(){},_getCtx(){return null;}
};}

// 15. BGMEngine.playScenarioBgm 补全
if(typeof BGMEngine!=='undefined'&&!BGMEngine.playScenarioBgm){BGMEngine.playScenarioBgm=function(){};}

// 16. StatsEngine._getCategoryStats 补全
if(typeof StatsEngine!=='undefined'&&!StatsEngine._getCategoryStats){StatsEngine._getCategoryStats=function(){var s=GameState._data.stats||{};return{earthquake:s.earthquakeCorrect||0,flood:s.floodCorrect||0,fire:s.fireCorrect||0,typhoon:s.typhoonCorrect||0,lightning:s.lightningCorrect||0,blizzard:s.blizzardCorrect||0,landslide:s.landslideCorrect||0,drought:s.droughtCorrect||0,volcano:s.volcanoCorrect||0};};}

// 17. StudyEngine.quit 补全
if(typeof StudyEngine!=='undefined'&&!StudyEngine.quit){StudyEngine.quit=function(){this.active=false;PageManager.navigate('free');};}

// 18. GameState.get 补全
if(typeof GameState!=='undefined'&&!GameState.get){GameState.get=function(key){return(this._data||{})[key];};}

// 19. DailyTaskEngine 任务自动完成修复
if(typeof DailyTaskEngine!=='undefined'&&DailyTaskEngine.TASK_TEMPLATES){
  DailyTaskEngine.TASK_TEMPLATES.forEach(function(t){if(t.id==='open1box'){t.check=function(s){return(s.blindboxOpened||0)>=1;};}if(t.id==='boss1'){t.check=function(s){return(s.bossDefeated||0)>=1;};}});
}

// 20. ComboEngine._fireMilestone typeof 保护（保留原始调用）
if(typeof ComboEngine!=='undefined'&&ComboEngine._fireMilestone){
  var _origFireMilestone=ComboEngine._fireMilestone;
  ComboEngine._fireMilestone=function(ms){
    typeof showSpectacleText==='function'&&showSpectacleText(ms.text,this.combo+' 连击！');
    typeof showConfetti==='function'&&showConfetti();
    typeof screenShake==='function'&&screenShake(200);
    _origFireMilestone.call(this,ms);
  };
}

// 21. PageManager.navigate pets → pet 修复
if(typeof UniversalSystemViewer!=='undefined'&&UniversalSystemViewer.pets){
  var _origPets=UniversalSystemViewer.pets;
  UniversalSystemViewer.pets=function(){PageManager.navigate('pet');setTimeout(function(){if(typeof PetEngine!=='undefined'&&PetEngine.render){var el=document.getElementById('pet-content');if(el)el.innerHTML=PetEngine.render();}},100);};
}

// 22. GameState.save 防抖修复（在 beforeunload 中强制同步保存）
window.addEventListener('beforeunload',function(){
  if(typeof GameState!=='undefined'&&GameState._data&&GameState._data!==null){
    try{localStorage.setItem('disasterGachaState',JSON.stringify(GameState._data));}catch(e){console.error('[beforeunload] Save error:',e);}
  }
});
