/**
 * ============================================================================
 * CheckinEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const CheckinEngine = {REWARDS:[30,30,30,50,50,50,100,30,30,30,50,50,50,200,30,30,30,50,50,50,300,30,30,30,50,50,50,400,30,500],canCheckin:()=>GameState._data.lastCheckin!==(new Date).toISOString().slice(0,10),checkin(){if(this.canCheckin()){var today=(new Date).toISOString().slice(0,10),yesterday=new Date(Date.now()-864e5).toISOString().slice(0,10);GameState._data.lastCheckin===yesterday?GameState._data.checkinStreak=(GameState._data.checkinStreak||0)+1:GameState._data.checkinStreak=1,GameState._data.lastCheckin=today;var day=(GameState._data.checkinStreak-1)%30,reward=this.REWARDS[day]||30;GameState.addCoins(reward),GameState._data.checkinDates.push(today),GameState.save(),Modal.show("📅 签到成功","第 "+GameState._data.checkinStreak+" 天<br/>💰 +"+reward+" 金币","📅")}else Modal.show("❌ 今日已签到","明天再来！")},render(){for(var streak=GameState._data.checkinStreak||0,html='<div class="checkin-panel"><h3>📅 每日签到</h3><p>连续签到: '+streak+' 天</p><div class="checkin-grid">',i=0;i<30;i++)html+='<div class="checkin-day '+(i<streak%30?"done":"")+'">'+(i+1)+"<br/>"+(this.REWARDS[i]||30)+"💰</div>";return html+"</div></div>"}};
