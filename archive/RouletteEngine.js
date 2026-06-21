/**
 * ============================================================================
 * RouletteEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const RouletteEngine = {SLOTS:[{label:"💰 ×1",mult:1},{label:"💰 ×2",mult:2},{label:"💰 ×3",mult:3},{label:"💰 ×5",mult:5},{label:"📦 盲盒",mult:0,blindbox:!0},{label:"🎁 道具",mult:0,item:!0},{label:"🧩 碎片",mult:0,frag:!0},{label:"😢 再来",mult:0}],render(){var can=this.canSpin();return'<div class="card-grid"><div class="card-item" style="cursor:default"><div style="font-size:48px;margin:12px 0">🎡</div><div class="card-name">每日转盘</div><div class="card-type">每天免费转 1 次</div><div style="margin:12px 0;color:rgba(255,255,255,0.7)">已转 <b>'+(GameState._data.stats.roulettePlayed||0)+'</b> 次</div><button class="btn btn-battle" onclick="RouletteEngine.spin()" '+(can?"":"disabled")+">"+(can?"🎡 转一发！":"⏰ 明天再来")+"</button></div></div>"},canSpin:()=>GameState._data.lastFreeSpin!==(new Date).toISOString().slice(0,10),spin(){if(this.canSpin()){GameState._data.lastFreeSpin=(new Date).toISOString().slice(0,10),GameState._data.stats.roulettePlayed=(GameState._data.stats.roulettePlayed||0)+1;var msg,idx=Math.floor(Math.random()*this.SLOTS.length),slot=this.SLOTS[idx];if(slot.mult>0){var coins=20*slot.mult;GameState.addCoins(coins),msg=slot.label+" → 💰 +"+coins}else msg=slot.blindbox?"📦 获得一个普通盲盒！":slot.item?"🎁 获得随机道具！":slot.frag?"🧩 获得碎片！":"😢 谢谢参与，明天再来！";GameState.save(),Modal.show("🎡 转盘结果",msg,"🎡")}else Modal.show("❌ 今日已转过","明天再来！")}};
