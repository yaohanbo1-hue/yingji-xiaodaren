/**
 * ============================================================================
 * DailyTaskEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const DailyTaskEngine = {TASK_TEMPLATES:[{id:"answer10",name:"答对 10 题",check:function(s){return(s.correct||0)>=10},reward:50},{id:"open1box",name:"开 1 个盲盒",check:function(s){return!0},reward:30},{id:"play3mode",name:"玩 3 种模式",check:function(s){return(s.gamesPlayed||0)>=3},reward:80},{id:"combo5",name:"达成 5 连击",check:function(s){return(s.maxStreak||0)>=5},reward:60},{id:"boss1",name:"击败 1 个 Boss",check:function(s){return!0},reward:100}],init(){var today=(new Date).toISOString().slice(0,10),dt=GameState._data.dailyTasks;dt.date!==today&&(dt.date=today,dt.allDone=!1,dt.tasks=this.TASK_TEMPLATES.map(function(t){return{id:t.id,name:t.name,done:!1,reward:t.reward}}),GameState.save())},claim(taskId){for(var dt=GameState._data.dailyTasks,i=0;i<dt.tasks.length;i++)if(dt.tasks[i].id===taskId&&dt.tasks[i].done)return GameState.addCoins(dt.tasks[i].reward),void Modal.show("✅ 任务奖励","💰 +"+dt.tasks[i].reward+" 金币")},render(){this.init();for(var dt=GameState._data.dailyTasks,html='<div class="daily-tasks"><h3>📋 每日任务</h3>',i=0;i<dt.tasks.length;i++){var t=dt.tasks[i];html+='<div class="daily-task-item '+(t.done?"done":"")+'"><span>'+(t.done?"✅":"⬜")+"</span> <span>"+t.name+'</span> <span class="reward">💰 '+t.reward+"</span></div>"}return html+"</div>"}};
