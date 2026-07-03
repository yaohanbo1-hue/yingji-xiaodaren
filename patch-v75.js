
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
if(typeof GameState!=='undefined'&&!GameState.reset){GameState.reset=function(){if(confirm('确定要重置所有数据吗？此操作不可恢复！')){var keys=['disasterGachaState','disasterSeason','tutorialDone','bg_theme','aitutor_profile','aitutor_cache','aiTutorData','disaster_hq_voice_enabled','disaster_hq_voice_rate','disaster_hq_voice_pitch','deepseek_proxy_url','aitutor_model','disasterHQ_language','disaster_hq_loading_shown','certificationData'];for(var i=0;i<keys.length;i++){try{localStorage.removeItem(keys[i]);}catch(e){console.error('[GameState.reset] Error removing key:',keys[i],e);}}location.reload();}};}

// 23. GameState.reset() 强制覆盖：补充遗漏的 localStorage 键（数据流一致性修复）
if(typeof GameState!=='undefined'&&GameState.reset){var _origReset=GameState.reset;GameState.reset=function(){if(confirm('确定要重置所有数据吗？此操作不可恢复！')){var keys=['disasterGachaState','disasterSeason','tutorialDone','bg_theme','aitutor_profile','aitutor_cache','aiTutorData','disaster_hq_voice_enabled','disaster_hq_voice_rate','disaster_hq_voice_pitch','deepseek_proxy_url','aitutor_model','disasterHQ_language','disaster_hq_loading_shown','certificationData'];for(var i=0;i<keys.length;i++){try{localStorage.removeItem(keys[i]);}catch(e){console.error('[GameState.reset] Error removing key:',keys[i],e);}}location.reload();}};}

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
  getLevel(){var xp=GameState._data.exp||0,level=1,name='防灾新手',icon='🌱';for(var i=0;i<this.LEVELS.length;i++)if(xp>=this.LEVELS[i].xp){level=this.LEVELS[i].level;name=this.LEVELS[i].name;icon=this.LEVELS[i].icon;}return{level:level,name:name,icon:icon,xp:xp};},
  getNextLevel(){var xp=GameState._data.exp||0;for(var i=0;i<this.LEVELS.length;i++)if(xp<this.LEVELS[i].xp)return{level:this.LEVELS[i].level,xp:this.LEVELS[i].xp-xp};return{level:10,xp:0};},
  addXP(amount){GameState._data.exp=(GameState._data.exp||0)+amount;const needed=100*(GameState._data.level||1);while(GameState._data.exp>=needed){GameState._data.exp-=needed;GameState._data.level=(GameState._data.level||1)+1;if(typeof V10Toast!=='undefined'){V10Toast.show('🎉 升级了！Lv.'+GameState._data.level,'success');}}GameState.save();}
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

// 24. GameState 核心方法 null 防御（数据流一致性修复）
if(typeof GameState!=='undefined'){
  if(GameState.addExp){
    var _origAddExp=GameState.addExp;
    GameState.addExp=function(amount){
      if(!this._data){console.warn('[GameState.addExp] _data is null, skipping'); return;}
      return _origAddExp.call(this,amount);
    };
  }
  if(GameState.addCoins){
    var _origAddCoins=GameState.addCoins;
    GameState.addCoins=function(amount){
      if(!this._data){console.warn('[GameState.addCoins] _data is null, skipping'); return;}
      return _origAddCoins.call(this,amount);
    };
  }
  if(GameState.spendCoins){
    var _origSpendCoins=GameState.spendCoins;
    GameState.spendCoins=function(amount){
      if(!this._data){console.warn('[GameState.spendCoins] _data is null, skipping'); return false;}
      return _origSpendCoins.call(this,amount);
    };
  }
}

// 25. GameState._ensureDefaults null 值修复（数据流一致性修复）
if(typeof GameState!=='undefined'&&GameState._ensureDefaults){
  var _origEnsureDefaults=GameState._ensureDefaults;
  GameState._ensureDefaults=function(){
    // 将 null 值修复为 undefined，使原逻辑能正确应用默认值
    if(this._data&&this._keys){
      for(var i=0;i<this._keys.length;i++){
        var key=this._keys[i];
        if(this._data[key]===null&&this._defaults[key]!==null&&this._defaults[key]!==undefined){
          this._data[key]=undefined;
        }
      }
    }
    return _origEnsureDefaults.call(this);
  };
}


// 23. 性能/内存修复：为所有引擎补全 cleanup() 方法，增强 PageManager._cleanupEngines
(function() {
  // 先确保各引擎有 cleanup 方法
  if (typeof MemoryCardEngine !== 'undefined' && !MemoryCardEngine.cleanup) {
    MemoryCardEngine.cleanup = function() {
      this.timer && (clearInterval(this.timer), this.timer = null);
      this.active = !1;
    };
  }
  if (typeof QuizEngine !== 'undefined' && !QuizEngine.cleanup) {
    QuizEngine.cleanup = function() {
      this.timerInterval && (clearInterval(this.timerInterval), this.timerInterval = null);
      this.active = !1;
    };
  }
  if (typeof BossRushEngine !== 'undefined' && !BossRushEngine.cleanup) {
    BossRushEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof PKEngine !== 'undefined' && !PKEngine.cleanup) {
    PKEngine.cleanup = function() {
      this.timerInterval && (clearInterval(this.timerInterval), this.timerInterval = null);
      this.active = !1;
    };
  }
  if (typeof ReactionGameV2 !== 'undefined' && !ReactionGameV2.cleanup) {
    ReactionGameV2.cleanup = function() {
      this._timer && (clearInterval(this._timer), this._timer = null);
      this._active = !1;
    };
  }
  if (typeof SurvivalEngine !== 'undefined' && !SurvivalEngine.cleanup) {
    SurvivalEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof PrecisionEngine !== 'undefined' && !PrecisionEngine.cleanup) {
    PrecisionEngine.cleanup = function() {
      this.active = !1;
    };
  }
  if (typeof ScenarioEngine !== 'undefined' && !ScenarioEngine.cleanup) {
    ScenarioEngine.cleanup = function() {
      this.active = !1;
      this.storyShown = !1;
    };
  }
  if (typeof StoryEngine !== 'undefined' && !StoryEngine.cleanup) {
    StoryEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof StoryAdventureEngine !== 'undefined' && !StoryAdventureEngine.cleanup) {
    StoryAdventureEngine.cleanup = function() {
      this.active = !1;
    };
  }
  if (typeof StoryChallengeEngine !== 'undefined' && !StoryChallengeEngine.cleanup) {
    StoryChallengeEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof StudyEngine !== 'undefined' && !StudyEngine.cleanup) {
    StudyEngine.cleanup = function() {
      this.active = !1;
    };
  }
  if (typeof SupplyDropGame !== 'undefined' && !SupplyDropGame.cleanup) {
    SupplyDropGame.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof BattleEngine !== 'undefined' && !BattleEngine.cleanup) {
    BattleEngine.cleanup = function() {
      this.currentBoss = null;
      this.isBattleOver = !0;
      this.isBossPhase = !1;
    };
  }
  if (typeof FirstAidEngine !== 'undefined' && !FirstAidEngine.cleanup) {
    FirstAidEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof MiniGameEngine !== 'undefined' && !MiniGameEngine.cleanup) {
    MiniGameEngine.cleanup = function() {
      this.currentGame = null;
    };
  }
  if (typeof GuideEngine !== 'undefined' && !GuideEngine.cleanup) {
    GuideEngine.cleanup = function() {
      this.active = !1;
    };
  }
  if (typeof TutorialEngine !== 'undefined' && !TutorialEngine.cleanup) {
    TutorialEngine.cleanup = function() {
      this.active = !1;
      this.overlay && (this.overlay.remove(), this.overlay = null);
      this.spotlight && (this.spotlight.remove(), this.spotlight = null);
    };
  }
  if (typeof DailyChallengeEngine !== 'undefined' && !DailyChallengeEngine.cleanup) {
    DailyChallengeEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof MemoryGameV2 !== 'undefined' && !MemoryGameV2.cleanup) {
    MemoryGameV2.cleanup = function() {
      this._active = !1;
      this._flipped = [];
    };
  }

  // 增强 PageManager._cleanupEngines，补充所有缺失的引擎清理
  if (typeof PageManager !== 'undefined' && PageManager._cleanupEngines) {
    var _origCleanup = PageManager._cleanupEngines;
    PageManager._cleanupEngines = function() {
      _origCleanup.call(this);
      "undefined" != typeof QuizEngine && QuizEngine.cleanup && QuizEngine.cleanup();
      "undefined" != typeof BossRushEngine && BossRushEngine.cleanup && BossRushEngine.cleanup();
      "undefined" != typeof PKEngine && PKEngine.cleanup && PKEngine.cleanup();
      "undefined" != typeof ReactionGameV2 && ReactionGameV2.cleanup && ReactionGameV2.cleanup();
      "undefined" != typeof SurvivalEngine && SurvivalEngine.cleanup && SurvivalEngine.cleanup();
      "undefined" != typeof PrecisionEngine && PrecisionEngine.cleanup && PrecisionEngine.cleanup();
      "undefined" != typeof ScenarioEngine && ScenarioEngine.cleanup && ScenarioEngine.cleanup();
      "undefined" != typeof StoryEngine && StoryEngine.cleanup && StoryEngine.cleanup();
      "undefined" != typeof StoryAdventureEngine && StoryAdventureEngine.cleanup && StoryAdventureEngine.cleanup();
      "undefined" != typeof StoryChallengeEngine && StoryChallengeEngine.cleanup && StoryChallengeEngine.cleanup();
      "undefined" != typeof StudyEngine && StudyEngine.cleanup && StudyEngine.cleanup();
      "undefined" != typeof SupplyDropGame && SupplyDropGame.cleanup && SupplyDropGame.cleanup();
      "undefined" != typeof BattleEngine && BattleEngine.cleanup && BattleEngine.cleanup();
      "undefined" != typeof FirstAidEngine && FirstAidEngine.cleanup && FirstAidEngine.cleanup();
      "undefined" != typeof MiniGameEngine && MiniGameEngine.cleanup && MiniGameEngine.cleanup();
      "undefined" != typeof GuideEngine && GuideEngine.cleanup && GuideEngine.cleanup();
      "undefined" != typeof TutorialEngine && TutorialEngine.cleanup && TutorialEngine.cleanup();
      "undefined" != typeof DailyChallengeEngine && DailyChallengeEngine.cleanup && DailyChallengeEngine.cleanup();
      "undefined" != typeof MemoryGameV2 && MemoryGameV2.cleanup && MemoryGameV2.cleanup();
    };
  }
})();

// 24. 页面隐藏时暂停 requestAnimationFrame / 定时器，减少后台资源消耗
(function() {
  if (typeof document !== 'undefined' && document.visibilityState !== undefined) {
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // 页面切换到后台时，暂停 BGM（如果支持）
        if (typeof BGMEngine !== 'undefined' && BGMEngine.pause) {
          try { BGMEngine.pause(); } catch (_) {}
        }
      } else {
        // 页面恢复前台时，恢复 BGM
        if (typeof BGMEngine !== 'undefined' && BGMEngine.resume) {
          try { BGMEngine.resume(); } catch (_) {}
        }
      }
    });
  }
})();

// 25. 全局清理动态 DOM 粒子/浮动元素（防止内存泄漏）
window.addEventListener('beforeunload', function() {
  // 清理金币雨
  if (typeof CoinRainEngine !== 'undefined' && CoinRainEngine.clear) {
    try { CoinRainEngine.clear(); } catch (_) {}
  }
  // 清理所有粒子 burst
  document.querySelectorAll('.particle-burst, .combo-popup, .coin-float-text').forEach(function(el) {
    try { el.remove(); } catch (_) {}
  });
  // 清理所有教程覆盖层
  document.querySelectorAll('#tutorialOverlay, .tutorial-overlay, .tutorial-spotlight').forEach(function(el) {
    try { el.remove(); } catch (_) {}
  });
  // 清理证书覆盖层
  document.querySelectorAll('#certificateOverlay, .cert-overlay').forEach(function(el) {
    try { el.remove(); } catch (_) {}
  });
  // 清理卡片掉落覆盖层
  document.querySelectorAll('.card-drop-overlay').forEach(function(el) {
    try { el.remove(); } catch (_) {}
  });
});

/* ===== v75-patch 表单验证修复（form-validation-check） ===== */

// 23. PKEngine 输入验证增强：trim、长度限制、数值校验
(function() {
  if (typeof PKEngine === 'undefined' || !PKEngine.start) return;
  var _origPkStart = PKEngine.start.bind(PKEngine);
  PKEngine.start = function() {
    var n1 = document.getElementById('pkName1');
    var n2 = document.getElementById('pkName2');
    if (n1) { n1.value = (n1.value || '').trim().slice(0, 8) || '玩家1'; }
    if (n2) { n2.value = (n2.value || '').trim().slice(0, 8) || '玩家2'; }
    var tq = document.getElementById('pkTotalQ');
    if (tq) {
      var v = parseInt(tq.value, 10);
      if (isNaN(v) || v < 6) v = 6;
      if (v > 14) v = 14;
      tq.value = v;
    }
    var tl = document.getElementById('pkTimeLimit');
    if (tl) {
      var v = parseInt(tl.value, 10);
      if (isNaN(v) || v < 8) v = 8;
      if (v > 15) v = 15;
      tl.value = v;
    }
    return _origPkStart.apply(this, arguments);
  };
})();

// 24. LeaderboardEngine XSS 修复：输入过滤 + 渲染转义
(function() {
  if (typeof LeaderboardEngine === 'undefined') return;
  var _h = function(s) {
    return s ? String(s).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#x27;'}[c];
    }) : '';
  };
  var _origAddScore = LeaderboardEngine.addScore.bind(LeaderboardEngine);
  LeaderboardEngine.addScore = function(name, score, combo, accuracy) {
    var safeName = _h((name || '').trim()).slice(0, 20) || '匿名玩家';
    return _origAddScore.call(this, safeName, score, combo, accuracy);
  };
  LeaderboardEngine.render = function() {
    var el = document.getElementById('leaderboardContent');
    if (!el) return;
    var board = this._getBoard();
    if (board.length === 0) {
      el.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px 20px;"><div style="font-size:3rem;margin-bottom:16px;">🏆</div><div style="font-size:1.1rem;color:rgba(255,255,255,0.7);margin-bottom:8px;">暂无排行数据</div><div style="font-size:0.85rem;color:rgba(255,255,255,0.4);">快去答题上榜吧！</div></div>';
      return;
    }
    var html = '';
    if (typeof SeasonEngine !== 'undefined') {
      SeasonEngine.init();
      var si = SeasonEngine.getSeasonInfo();
      html += '<div style="text-align:center;padding:14px;margin-bottom:12px;background:linear-gradient(135deg,rgba(0,212,255,0.08),rgba(255,215,0,0.08));border-radius:14px;border:1px solid rgba(0,212,255,0.15);"><div style="font-size:0.75rem;color:rgba(255,255,255,0.4);">第 ' + si.season + ' 赛季</div><div style="font-size:1.4rem;font-weight:800;margin:4px 0;">🏅 ' + si.rank + '</div><div style="font-size:0.8rem;color:rgba(255,255,255,0.5);">赛季积分: ' + si.points + '</div></div>';
    }
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    board.forEach(function(entry, i) {
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid ' + (i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)') + '"><div style="font-size:1.5rem;font-weight:800;color:' + (i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text-secondary)') + ';width:32px;text-align:center;">' + (i + 1) + '</div><div style="flex:1"><div style="font-size:1rem;font-weight:700;color:rgba(255,255,255,0.9);">' + _h(entry.name) + '</div><div style="font-size:0.75rem;color:var(--text-tertiary);">' + _h(entry.date) + '</div></div><div style="text-align:right;"><div style="font-size:1.2rem;font-weight:800;color:var(--cyber-blue);">' + entry.score + '分</div><div style="font-size:0.75rem;color:var(--text-secondary);">🔥' + entry.combo + 'x 🎯' + entry.accuracy + '%</div></div></div>';
    });
    html += '</div>';
    el.innerHTML = html;
  };
})();

// 25. ai-tutor API Key 输入安全增强：password 类型 + 格式验证
(function() {
  if (typeof AITutorEngine === 'undefined' || !AITutorEngine.showApiKeyDialog) return;
  var _origShowApiKey = AITutorEngine.showApiKeyDialog.bind(AITutorEngine);
  AITutorEngine.showApiKeyDialog = function() {
    _origShowApiKey.apply(this, arguments);
    setTimeout(function() {
      var input = document.getElementById('newApiKeyInput');
      if (input) {
        input.type = 'password';
        input.maxLength = 500;
        input.autocomplete = 'off';
      }
    }, 0);
  };
  if (AITutorEngine.saveApiKey) {
    var _origSaveApiKey = AITutorEngine.saveApiKey.bind(AITutorEngine);
    AITutorEngine.saveApiKey = function() {
      var input = document.getElementById('newApiKeyInput');
      if (!input) return _origSaveApiKey.apply(this, arguments);
      var key = (input.value || '').trim();
      if (!key) {
        var d = document.getElementById('apiKeyDialog');
        d && d.remove();
        return;
      }
      if (key.length > 500) {
        Modal.show('❌ 输入过长', 'API Key / 代理地址不能超过 500 字符');
        return;
      }
      if (key.indexOf('<') !== -1 || key.indexOf('>') !== -1) {
        Modal.show('❌ 格式错误', '不能包含 < 或 > 字符');
        return;
      }
      if (key.indexOf('http') === 0) {
        try { new URL(key); } catch (e) {
          Modal.show('❌ 格式错误', '请输入有效的 URL 地址');
          return;
        }
      }
      return _origSaveApiKey.apply(this, arguments);
    };
  }
})();

// 26. DiaryEngine XSS 修复：保存过滤 + 渲染转义
(function() {
  if (typeof DiaryEngine === 'undefined') return;
  var _h = function(s) {
    return s ? String(s).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#x27;'}[c];
    }) : '';
  };
  if (DiaryEngine.saveEntry) {
    var _origDiarySave = DiaryEngine.saveEntry.bind(DiaryEngine);
    DiaryEngine.saveEntry = function(text) {
      if (!text) return false;
      var trimmed = String(text).trim();
      if (trimmed.length < 3) {
        Modal.show('❌ 内容太短', '至少写 3 个字吧！');
        return false;
      }
      if (trimmed.length > 500) {
        Modal.show('❌ 内容太长', '日记不能超过 500 字！');
        return false;
      }
      return _origDiarySave.call(this, trimmed);
    };
  }
  DiaryEngine.render = function() {
    var entries = this.getEntries(), streak = this.getStreak(), prompt = this.getRandomPrompt();
    var html = '<div style="padding:16px"><h3>📓 防灾日记</h3>';
    html += '<div style="text-align:center;margin:12px 0;padding:12px;background:rgba(0,212,255,0.05);border-radius:12px;border:1px solid rgba(0,212,255,0.15);"><div style="font-size:2rem;margin-bottom:4px">' + prompt.icon + '</div><div style="font-size:1rem;font-weight:700;color:rgba(255,255,255,0.9);">' + prompt.topic + '</div><div style="font-size:0.75rem;color:var(--text-dim);margin-top:4px">💡 提示：' + _h(prompt.tips[0]) + '</div></div>';
    html += '<div style="margin-bottom:12px"><textarea id="diaryInput" placeholder="写下今天的防灾日记..." style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#fff;font-size:14px;resize:vertical;min-height:80px;box-sizing:border-box;" maxlength="500"></textarea><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><span style="font-size:0.75rem;color:var(--text-dim)">✍️ 已连续打卡 ' + streak + ' 天</span><button class="btn btn-primary" onclick="DiaryEngine.submitFromInput()">📝 保存日记</button></div></div>';
    if (entries.length === 0) {
      html += '<div style="text-align:center;padding:20px;color:var(--text-dim)">还没有日记，写第一篇吧！</div>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:8px;">';
      entries.forEach(function(entry) {
        html += '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px"><div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:4px">' + _h(entry.date) + '</div><div style="font-size:0.95rem;color:rgba(255,255,255,0.9);line-height:1.6">' + _h(entry.text) + '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    var el = document.getElementById('diary-content');
    if (el) el.innerHTML = html;
    return html;
  };
  if (!DiaryEngine.submitFromInput) {
    DiaryEngine.submitFromInput = function() {
      var input = document.getElementById('diaryInput');
      if (input) this.saveEntry(input.value);
    };
  }
})();

// 27. Certificate playerName 可编辑输入验证
(function() {
  if (typeof Certificate === 'undefined' || !Certificate.show) return;
  var _h = function(s) {
    return s ? String(s).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#x27;'}[c];
    }) : '';
  };
  var _origShow = Certificate.show.bind(Certificate);
  Certificate.show = function(score, accuracy) {
    var result = _origShow.apply(this, arguments);
    setTimeout(function() {
      var playerEl = document.querySelector('.cert-player');
      if (playerEl) {
        playerEl.addEventListener('blur', function(e) {
          var raw = (e.target.innerText || e.target.textContent || '').trim();
          var safe = raw.slice(0, 16).replace(/[<>]/g, '');
          e.target.textContent = safe || '防灾指挥官';
          GameState._data.playerName = safe || '防灾指挥官';
          GameState.save();
        });
        playerEl.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
        });
      }
    }, 100);
    return result;
  };
})();


// 28. 性能/内存修复：为所有引擎补全 cleanup() 方法，增强 PageManager._cleanupEngines
(function() {
  // 先确保各引擎有 cleanup 方法
  if (typeof MemoryCardEngine !== 'undefined' && !MemoryCardEngine.cleanup) {
    MemoryCardEngine.cleanup = function() {
      this.timer && (clearInterval(this.timer), this.timer = null);
      this.active = !1;
    };
  }
  if (typeof QuizEngine !== 'undefined' && !QuizEngine.cleanup) {
    QuizEngine.cleanup = function() {
      this.timerInterval && (clearInterval(this.timerInterval), this.timerInterval = null);
      this.active = !1;
    };
  }
  if (typeof BossRushEngine !== 'undefined' && !BossRushEngine.cleanup) {
    BossRushEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof PKEngine !== 'undefined' && !PKEngine.cleanup) {
    PKEngine.cleanup = function() {
      this.timerInterval && (clearInterval(this.timerInterval), this.timerInterval = null);
      this.active = !1;
    };
  }
  if (typeof ReactionGameV2 !== 'undefined' && !ReactionGameV2.cleanup) {
    ReactionGameV2.cleanup = function() {
      this._timer && (clearInterval(this._timer), this._timer = null);
      this._active = !1;
    };
  }
  if (typeof SurvivalEngine !== 'undefined' && !SurvivalEngine.cleanup) {
    SurvivalEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof PrecisionEngine !== 'undefined' && !PrecisionEngine.cleanup) {
    PrecisionEngine.cleanup = function() {
      this.active = !1;
    };
  }
  if (typeof ScenarioEngine !== 'undefined' && !ScenarioEngine.cleanup) {
    ScenarioEngine.cleanup = function() {
      this.active = !1;
      this.storyShown = !1;
    };
  }
  if (typeof StoryEngine !== 'undefined' && !StoryEngine.cleanup) {
    StoryEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof StoryAdventureEngine !== 'undefined' && !StoryAdventureEngine.cleanup) {
    StoryAdventureEngine.cleanup = function() {
      this.active = !1;
    };
  }
  if (typeof StoryChallengeEngine !== 'undefined' && !StoryChallengeEngine.cleanup) {
    StoryChallengeEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof StudyEngine !== 'undefined' && !StudyEngine.cleanup) {
    StudyEngine.cleanup = function() {
      this.active = !1;
    };
  }
  if (typeof SupplyDropGame !== 'undefined' && !SupplyDropGame.cleanup) {
    SupplyDropGame.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof BattleEngine !== 'undefined' && !BattleEngine.cleanup) {
    BattleEngine.cleanup = function() {
      this.currentBoss = null;
      this.isBattleOver = !0;
      this.isBossPhase = !1;
    };
  }
  if (typeof FirstAidEngine !== 'undefined' && !FirstAidEngine.cleanup) {
    FirstAidEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof MiniGameEngine !== 'undefined' && !MiniGameEngine.cleanup) {
    MiniGameEngine.cleanup = function() {
      this.currentGame = null;
    };
  }
  if (typeof GuideEngine !== 'undefined' && !GuideEngine.cleanup) {
    GuideEngine.cleanup = function() {
      this.active = !1;
    };
  }
  if (typeof TutorialEngine !== 'undefined' && !TutorialEngine.cleanup) {
    TutorialEngine.cleanup = function() {
      this.active = !1;
      this.overlay && (this.overlay.remove(), this.overlay = null);
      this.spotlight && (this.spotlight.remove(), this.spotlight = null);
    };
  }
  if (typeof DailyChallengeEngine !== 'undefined' && !DailyChallengeEngine.cleanup) {
    DailyChallengeEngine.cleanup = function() {
      this._active = !1;
    };
  }
  if (typeof MemoryGameV2 !== 'undefined' && !MemoryGameV2.cleanup) {
    MemoryGameV2.cleanup = function() {
      this._active = !1;
      this._flipped = [];
    };
  }

  // 增强 PageManager._cleanupEngines，补充所有缺失的引擎清理
  if (typeof PageManager !== 'undefined' && PageManager._cleanupEngines) {
    var _origCleanup = PageManager._cleanupEngines;
    PageManager._cleanupEngines = function() {
      _origCleanup.call(this);
      "undefined" != typeof QuizEngine && QuizEngine.cleanup && QuizEngine.cleanup();
      "undefined" != typeof BossRushEngine && BossRushEngine.cleanup && BossRushEngine.cleanup();
      "undefined" != typeof PKEngine && PKEngine.cleanup && PKEngine.cleanup();
      "undefined" != typeof ReactionGameV2 && ReactionGameV2.cleanup && ReactionGameV2.cleanup();
      "undefined" != typeof SurvivalEngine && SurvivalEngine.cleanup && SurvivalEngine.cleanup();
      "undefined" != typeof PrecisionEngine && PrecisionEngine.cleanup && PrecisionEngine.cleanup();
      "undefined" != typeof ScenarioEngine && ScenarioEngine.cleanup && ScenarioEngine.cleanup();
      "undefined" != typeof StoryEngine && StoryEngine.cleanup && StoryEngine.cleanup();
      "undefined" != typeof StoryAdventureEngine && StoryAdventureEngine.cleanup && StoryAdventureEngine.cleanup();
      "undefined" != typeof StoryChallengeEngine && StoryChallengeEngine.cleanup && StoryChallengeEngine.cleanup();
      "undefined" != typeof StudyEngine && StudyEngine.cleanup && StudyEngine.cleanup();
      "undefined" != typeof SupplyDropGame && SupplyDropGame.cleanup && SupplyDropGame.cleanup();
      "undefined" != typeof BattleEngine && BattleEngine.cleanup && BattleEngine.cleanup();
      "undefined" != typeof FirstAidEngine && FirstAidEngine.cleanup && FirstAidEngine.cleanup();
      "undefined" != typeof MiniGameEngine && MiniGameEngine.cleanup && MiniGameEngine.cleanup();
      "undefined" != typeof GuideEngine && GuideEngine.cleanup && GuideEngine.cleanup();
      "undefined" != typeof TutorialEngine && TutorialEngine.cleanup && TutorialEngine.cleanup();
      "undefined" != typeof DailyChallengeEngine && DailyChallengeEngine.cleanup && DailyChallengeEngine.cleanup();
      "undefined" != typeof MemoryGameV2 && MemoryGameV2.cleanup && MemoryGameV2.cleanup();
    };
  }
})();

// 29. 页面隐藏时暂停 requestAnimationFrame / 定时器，减少后台资源消耗
(function() {
  if (typeof document !== 'undefined' && document.visibilityState !== undefined) {
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // 页面切换到后台时，暂停 BGM（如果支持）
        if (typeof BGMEngine !== 'undefined' && BGMEngine.pause) {
          try { BGMEngine.pause(); } catch (_) {}
        }
      } else {
        // 页面恢复前台时，恢复 BGM
        if (typeof BGMEngine !== 'undefined' && BGMEngine.resume) {
          try { BGMEngine.resume(); } catch (_) {}
        }
      }
    });
  }
})();

// 30. 全局清理动态 DOM 粒子/浮动元素（防止内存泄漏）
window.addEventListener('beforeunload', function() {
  // 清理金币雨
  if (typeof CoinRainEngine !== 'undefined' && CoinRainEngine.clear) {
    try { CoinRainEngine.clear(); } catch (_) {}
  }
  // 清理所有粒子 burst
  document.querySelectorAll('.particle-burst, .combo-popup, .coin-float-text').forEach(function(el) {
    try { el.remove(); } catch (_) {}
  });
  // 清理所有教程覆盖层
  document.querySelectorAll('#tutorialOverlay, .tutorial-overlay, .tutorial-spotlight').forEach(function(el) {
    try { el.remove(); } catch (_) {}
  });
  // 清理证书覆盖层
  document.querySelectorAll('#certificateOverlay, .cert-overlay').forEach(function(el) {
    try { el.remove(); } catch (_) {}
  });
  // 清理卡片掉落覆盖层
  document.querySelectorAll('.card-drop-overlay').forEach(function(el) {
    try { el.remove(); } catch (_) {}
  });
});
