/**
 * ============================================================================
 * ScratchEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const ScratchEngine = {COST:40,canPlay(){return GameState._data.coins>=this.COST},render(){return'<div class="card-grid"><div class="card-item" style="cursor:default"><div style="font-size:48px;margin:12px 0">🃏</div><div class="card-name">刮刮卡</div><div class="card-type">每次 <span style="color:#FFD700">40</span> 金币</div><div style="margin:12px 0;color:rgba(255,255,255,0.7)">已刮 <b>'+(GameState._data.stats.scratchPlayed||0)+'</b> 次</div><button class="btn btn-battle" onclick="ScratchEngine.play()" '+(this.canPlay()?"":"disabled")+">🃏 刮一张</button></div></div>"},play(){if(this.canPlay()){GameState.spendCoins(this.COST),GameState._data.stats.scratchPlayed=(GameState._data.stats.scratchPlayed||0)+1;for(var prize,msg,prizes=[{t:"coins",v:30,w:35},{t:"coins",v:80,w:25},{t:"coins",v:200,w:15},{t:"card",w:15},{t:"rarebox",w:8},{t:"jackpot",w:2}],r=100*Math.random(),sum=0,i=0;i<prizes.length;i++)if(r<(sum+=prizes[i].w)){prize=prizes[i];break}if(prize||(prize=prizes[0]),"coins"===prize.t)GameState.addCoins(prize.v),msg="💰 +"+prize.v+" 金币";else if("card"===prize.t){msg="🃏 获得随机卡牌！";var pool="undefined"!=typeof ALL_CARDS?ALL_CARDS:[],c=pool[Math.floor(Math.random()*pool.length)];c&&GameState.addCard(c.id)}else"rarebox"===prize.t?msg="🎁 稀有盲盒券！":"jackpot"===prize.t&&(GameState.addCoins(1e3),msg="💎 头奖！💰 +1000 金币！");GameState.save(),Modal.show("🎫 刮刮卡结果",msg,"🎫")}else Modal.show("❌ 金币不足","需要 "+this.COST+" 金币")}};
