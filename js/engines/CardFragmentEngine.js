/**
 * ============================================================================
 * CardFragmentEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const CardFragmentEngine = {FRAGMENT_COST:10,addFragment(cardId,amount){var frags=GameState._data.cardFragments||{};frags[cardId]=(frags[cardId]||0)+(amount||1),GameState._data.cardFragments=frags,GameState.save()},getFragments:cardId=>(GameState._data.cardFragments||{})[cardId]||0,craft(cardId){var frags=GameState._data.cardFragments||{};if((frags[cardId]||0)<this.FRAGMENT_COST)Modal.show("❌ 碎片不足","需要 "+this.FRAGMENT_COST+" 个碎片，当前 "+(frags[cardId]||0)+" 个");else{frags[cardId]-=this.FRAGMENT_COST,frags[cardId]<=0&&delete frags[cardId],GameState._data.cardFragments=frags,GameState.addCard(cardId),GameState.addExp(30),GameState.save();var card=ALL_CARDS.find(function(c){return c.id===cardId});Modal.show("🧩 碎片合成成功！",(card?card.zh?card.zh.name:card.icon||card.id:cardId)+" 已加入收藏！","🧩")}},render(){var frags=GameState._data.cardFragments||{},self=this,items=[];for(var id in frags)if(frags[id]>0){var card=ALL_CARDS.find(function(c){return c.id===id});items.push({id:id,name:card?card.zh?card.zh.name:card.icon||id:id,count:frags[id],canCraft:frags[id]>=self.FRAGMENT_COST})}if(0===items.length)return'<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.5)">暂无碎片<br/>通过答题、盲盒、Boss 掉落获得</div>';var html='<div style="padding:16px"><h3>🧩 卡牌碎片</h3>';return items.forEach(function(item){var pct=Math.min(100,Math.round(item.count/self.FRAGMENT_COST*100));html+='<div class="daily-task-item" '+(item.canCraft?"onclick=\"CardFragmentEngine.craft('"+item.id+'\')" style="cursor:pointer"':"")+"><span>"+item.name+"</span><span>"+item.count+"/"+self.FRAGMENT_COST+"</span>"+(item.canCraft?'<span style="color:#00e676">合成</span>':'<span style="color:rgba(255,255,255,0.3)">'+pct+"%</span>")+"</div>"}),html+="</div>"}};
