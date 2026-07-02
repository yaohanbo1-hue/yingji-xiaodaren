
/* ===== v75 紧急补丁：补全缺失的引擎和方法 ===== */

// SettingsEngine 补全
if(typeof SettingsEngine==='undefined'){window.SettingsEngine={
  toggleSFX(){var s=GameState._data.settings;s.sound=!s.sound;GameState.save();Modal.show('🔊 音效设置',s.sound?'✅ 音效已开启':'🔇 音效已关闭');},
  toggleVoice(){var s=GameState._data.settings;s.voice=!s.voice;GameState.save();Modal.show('🎙️ 语音设置',s.voice?'✅ 语音已开启':'🔇 语音已关闭');},
  exportData(){try{var data=JSON.stringify(GameState._data,null,2);var blob=new Blob([data],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='防灾存档_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);Modal.show('📤 导出成功','数据已保存到下载文件夹');}catch(e){Modal.show('❌ 导出失败',e.message);}},
  importData(){var input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=function(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){try{var data=JSON.parse(ev.target.result);if(data&&data.coins!==undefined){GameState._data=Object.assign(GameState._data,data);GameState.save();Modal.show('📥 导入成功','数据已恢复，页面即将刷新');setTimeout(function(){location.reload();},1000);}else{Modal.show('❌ 无效文件','请选择有效的存档文件');}}catch(err){Modal.show('❌ 解析失败',err.message);}};reader.readAsText(file);};input.click();},
  showAbout(){var stats=GameState._data.stats||{};Modal.show('ℹ️ 关于','<div style="text-align:center"><div style="font-size:3rem;margin-bottom:8px">🛡️</div><h3>应急小达人</h3><p>v1.3.2 — 防灾教育互动游戏</p><p>Made with ❤️</p></div>','🎉');},
  render(){var volSlider=document.getElementById('volumeSlider');if(volSlider&&GameState._data.settings){volSlider.value=GameState._data.settings.volume||50;}}
};};

// TutorialEngine.reset() 补全
if(typeof TutorialEngine!=='undefined'&&!TutorialEngine.reset){TutorialEngine.reset=function(){localStorage.removeItem('tutorialDone');Modal.show('🎓 引导已重置','下次进入游戏将重新显示新手引导');};}

// GameState.reset() 补全
if(typeof GameState!=='undefined'&&!GameState.reset){GameState.reset=function(){if(confirm('确定要重置所有数据吗？此操作不可恢复！')){localStorage.removeItem('disaster_game_save');location.reload();}};}

// QuizEngine.startSpeed() 补全
if(typeof QuizEngine!=='undefined'&&!QuizEngine.startSpeed){QuizEngine.startSpeed=function(count){this._resetState({cards:ALL_CARDS.filter(function(c){return'equip'!==c.disaster}).slice(0,count||10),totalCards:count||10,showTimer:true,timeLeft:5});this._initUI({showTimer:true});this.active=true;this.timeLimit=5;this.showQuestion();};}

// CardSynthesisEngine.render() 检查（已有）
if(typeof CardSynthesisEngine!=='undefined'&&!CardSynthesisEngine.render){CardSynthesisEngine.render=function(){var items=this.getSynthesizable();if(0===items.length)return'<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.5)">暂无可合成的卡牌<br/>需要 3 张同类型同稀有度</div>';var html='<div style="padding:16px"><h3>🧪 卡牌合成</h3>',labels={common:'普通',rare:'稀有',epic:'史诗'},self=this;items.forEach(function(item){var nextIdx=self.RARITY_ORDER.indexOf(item.rarity)+1,next=self.RARITY_ORDER[nextIdx]||'legendary';html+='<div class="daily-task-item" onclick="CardSynthesisEngine.synthesize(\''+item.key+'\')" style="cursor:pointer"><span>'+item.count+' × '+labels[item.rarity]+' '+item.type+'</span><span style="color:#ffd700">→ 1 × '+labels[next]+'</span></div>'});html+='</div>';return html;};}

// ReportEngine 补全（避免页面报错）
if(typeof ReportEngine==='undefined'){window.ReportEngine={showReport(){Modal.show('📊 学习报告','<div style="text-align:center"><p>📊 功能开发中</p><p>请先完成更多游戏来生成报告</p></div>','📊');},showDetailReport(){Modal.show('📊 详细报告','<div style="text-align:center"><p>📊 功能开发中</p></div>','📊');}};}

// AmbientParticles 补全
if(typeof AmbientParticles==='undefined'){window.AmbientParticles={init(){}};}

// BGMEngine 补全
if(typeof BGMEngine==='undefined'){window.BGMEngine={play(){},stop(){},playBattleBgm(){},playVictoryBgm(){},playMenuBgm(){},setVolume(){},initMuteButton(){}};}

// TransitionEngine 补全
if(typeof TransitionEngine==='undefined'){window.TransitionEngine={flash(duration){var el=document.createElement('div');el.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(255,255,255,0.6);pointer-events:none;opacity:0;transition:opacity '+(duration/2)+'ms ease';document.body.appendChild(el);requestAnimationFrame(function(){el.style.opacity='1';setTimeout(function(){el.style.opacity='0';setTimeout(function(){el.remove();},duration/2);},duration/2);});}};}

// VisualFX 补全
if(typeof VisualFX==='undefined'){window.VisualFX={startBattleParticles(){},stopBattleParticles(){},bossEntrance(icon,name){},comboFlameText(n){},checkinFireworks(){},playerHitFlash(){},ultimateFlash(color,text){},diagonalTransition(fn){fn();}};}

// V10Toast 补全
if(typeof V10Toast==='undefined'){window.V10Toast={success(msg){Modal.show('✅',msg);},error(msg){Modal.show('❌',msg);},warning(msg){Modal.show('⚠️',msg);}};}

// GuideEnhancer 补全
if(typeof GuideEnhancer==='undefined'){window.GuideEnhancer={forceRestart(){if(typeof GuideEngine!=='undefined'){GuideEngine.init();}else{Modal.show('📖 新手引导','引导功能正在准备中');}}};}
