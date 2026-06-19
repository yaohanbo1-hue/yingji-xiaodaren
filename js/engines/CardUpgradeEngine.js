/**
 * ============================================================================
 * CardUpgradeEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const CardUpgradeEngine = {MAX_LEVEL:5,getLevel:cardId=>(GameState._data.cardLevels||{})[cardId]||0,upgrade(cardId){var levels=GameState._data.cardLevels||{},current=levels[cardId]||0;if(current>=this.MAX_LEVEL)Modal.show("❌ 已满级","该卡已达 +5 满级");else{var cards=GameState._data.cards||[];if(cards.filter(function(id){return id===cardId}).length<2)Modal.show("❌ 材料不足","需要至少 2 张同名卡（1 张保留 + 1 张消耗）");else{var removed=!1,newCards=[];cards.forEach(function(id){id!==cardId||removed?newCards.push(id):removed=!0}),GameState._data.cards=newCards,levels[cardId]=current+1,GameState._data.cardLevels=levels,GameState._data.stats.cardsUpgraded=(GameState._data.stats.cardsUpgraded||0)+1,GameState.addExp(20+10*current),GameState.save();var card=ALL_CARDS.find(function(c){return c.id===cardId}),name=card?card.zh?card.zh.name:card.icon||card.id:cardId;Modal.show("⚔️ 强化成功！",name+" +"+current+" → +"+(current+1)+"<br/>属性 +10%","⚔️")}}},getBonus(cardId){return 10*this.getLevel(cardId)},render(){var cards=GameState._data.cards||[],levels=GameState._data.cardLevels||{},counts={};cards.forEach(function(id){counts[id]=(counts[id]||0)+1});var upgradeable=[];for(var id in counts)if(counts[id]>=2){var lvl=levels[id]||0;if(lvl<this.MAX_LEVEL){var card=ALL_CARDS.find(function(c){return c.id===id});upgradeable.push({id:id,name:card?card.zh?card.zh.name:card.icon||id:id,count:counts[id],level:lvl})}}if(0===upgradeable.length)return'<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.5)">暂无可强化的卡牌<br/>需要 2 张以上同名卡</div>';var html='<div style="padding:16px"><h3>⚔️ 卡牌强化</h3>';return upgradeable.forEach(function(item){html+='<div class="daily-task-item" onclick="CardUpgradeEngine.upgrade(\''+item.id+'\')" style="cursor:pointer"><span>'+item.name+" +"+item.level+" ("+item.count+'张)</span><span style="color:#ffd700">→ +'+(item.level+1)+"</span></div>"}),html+="</div>"}};
