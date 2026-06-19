/**
 * ============================================================================
 * GachaEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const GachaEngine = {COST:30,canPlay(){return GameState._data.coins>=this.COST},render(){return'<div class="card-grid"><div class="card-item" style="cursor:default"><div style="font-size:48px;margin:12px 0">🎰</div><div class="card-name">扭蛋机</div><div class="card-type">每次 <span style="color:#FFD700">30</span> 金币</div><div style="margin:12px 0;color:rgba(255,255,255,0.7)">已扭 <b>'+(GameState._data.stats.gachaPlayed||0)+'</b> 次</div><button class="btn btn-battle" onclick="GachaEngine.play()" '+(this.canPlay()?"":"disabled")+">🎰 扭一次</button></div></div>"},play(container){if(this.canPlay()){GameState.spendCoins(this.COST),GameState._data.stats.gachaPlayed=(GameState._data.stats.gachaPlayed||0)+1;for(var reward,rewards=[{type:"coins",val:20,weight:30},{type:"coins",val:50,weight:20},{type:"coins",val:100,weight:10},{type:"card",weight:25},{type:"fragment",weight:10},{type:"golden",weight:5}],r=100*Math.random(),sum=0,i=0;i<rewards.length;i++)if(r<(sum+=rewards[i].weight)){reward=rewards[i];break}reward||(reward=rewards[0]);var msg="";if("coins"===reward.type)GameState.addCoins(reward.val),msg="💰 +"+reward.val+" 金币";else if("card"===reward.type){var pool="undefined"!=typeof ALL_CARDS?ALL_CARDS:[],c=pool[Math.floor(Math.random()*pool.length)];c?(GameState.addCard(c.id),msg="🃏 "+(c.zh?c.zh.name:c.icon||c.id)):(GameState.addCoins(30),msg="💰 +30 金币")}else"fragment"===reward.type?(msg="🧩 +1 碎片",GameState._data.coins+=10,GameState.save()):"golden"===reward.type&&(GameState.addCoins(500),msg="🌟 金色扭蛋！💰 +500");GameState.save(),Modal.show("🎰 扭蛋结果",msg,"🎰")}else Modal.show("❌ 金币不足","需要 "+this.COST+" 金币")}};
