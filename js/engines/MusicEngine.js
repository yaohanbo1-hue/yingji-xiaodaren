/**
 * ============================================================================
 * MusicEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const MusicEngine = {TRACKS:[{id:"fire_march",name:"🔥 消防进行曲",unlock:"完成10次火灾题",genre:"进行曲",bpm:120},{id:"earthquake",name:"🌍 地震警报",unlock:"地震题全对",genre:"电子",bpm:140},{id:"ocean",name:"🌊 海洋之声",unlock:"收集20张水灾卡",genre:"环境",bpm:80},{id:"wind_dance",name:"🌪️ 风之舞",unlock:"台风题连续5对",genre:"舞曲",bpm:130},{id:"snow_waltz",name:"❄️ 冰雪华尔兹",unlock:"暴风雪题全对",genre:"华尔兹",bpm:90},{id:"sun_march",name:"☀️ 阳光进行曲",unlock:"连续签到7天",genre:"轻快",bpm:110},{id:"victory",name:"🏆 胜利之歌",unlock:"击败10个Boss",genre:"史诗",bpm:100},{id:"lullaby",name:"🌙 防灾摇篮曲",unlock:"写10篇日记",genre:"柔和",bpm:70},{id:"hero",name:"🦸 英雄主题曲",unlock:"等级达到30",genre:"史诗",bpm:105},{id:"disco",name:"🪩 防灾迪斯科",unlock:"开50个盲盒",genre:"迪斯科",bpm:125}],isUnlocked:trackId=>(GameState._data.musicUnlocked||[]).includes(trackId),unlock(trackId){if(!this.isUnlocked(trackId)){var music=GameState._data.musicUnlocked||[];music.push(trackId),GameState._data.musicUnlocked=music,GameState.save();var track=this.TRACKS.find(function(t){return t.id===trackId});track&&Modal.show("🎵 解锁新音乐！",track.name+"<br/>"+track.genre,"🎵")}},getProgress(){return(GameState._data.musicUnlocked||[]).length+"/"+this.TRACKS.length},render(){var unlocked=GameState._data.musicUnlocked||[],html='<div style="padding:16px"><h3>🎵 音乐收藏</h3>';return html+='<div style="text-align:center;margin:12px 0;font-size:14px;color:rgba(255,255,255,0.6)">已解锁 '+unlocked.length+"/"+this.TRACKS.length+"</div>",this.TRACKS.forEach(function(t){var isUnlocked=unlocked.includes(t.id);html+='<div class="daily-task-item" style="'+(isUnlocked?"":"opacity:0.4")+'"><span>'+t.name+'</span><span style="font-size:11px;color:rgba(255,255,255,0.5)">'+(isUnlocked?t.genre+" "+t.bpm+"bpm":"🔒 "+t.unlock)+"</span></div>"}),html+="</div>"}};
