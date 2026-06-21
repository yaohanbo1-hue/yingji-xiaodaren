/**
 * ============================================================================
 * AdaptiveDifficulty
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const AdaptiveDifficulty = {getDifficultyParams(){const stats=GameState._data?GameState._data.stats:{},totalAnswered=(stats.correct||0)+(stats.wrong||0),accuracy=totalAnswered>0?stats.correct/totalAnswered:.5,maxStreak=stats.maxStreak||0;let tier=0;return accuracy>=.9&&maxStreak>=15?tier=4:accuracy>=.8&&maxStreak>=10?tier=3:accuracy>=.65&&maxStreak>=5?tier=2:accuracy>=.5&&(tier=1),[{timeLimit:20,easyRatio:.6,hardRatio:.1,count:5,label:"新手"},{timeLimit:15,easyRatio:.4,hardRatio:.2,count:8,label:"入门"},{timeLimit:12,easyRatio:.3,hardRatio:.3,count:10,label:"进阶"},{timeLimit:10,easyRatio:.2,hardRatio:.4,count:12,label:"高手"},{timeLimit:8,easyRatio:.1,hardRatio:.5,count:15,label:"大师"}][tier]},selectCards(count){if("undefined"==typeof ALL_CARDS)return[];const knowledge=ALL_CARDS.filter(c=>"equip"!==c.disaster),params=this.getDifficultyParams(),easy=knowledge.filter(c=>"easy"===c.difficulty),medium=knowledge.filter(c=>"medium"===c.difficulty),hard=knowledge.filter(c=>"hard"===c.difficulty),shuffle=arr=>[...arr].sort(()=>Math.random()-.5),pick=(arr,n)=>shuffle(arr).slice(0,Math.min(n,arr.length)),selected=[],targetCount=Math.min(count,params.count),hardCount=Math.round(targetCount*params.hardRatio),easyCount=Math.round(targetCount*params.easyRatio),medCount=targetCount-hardCount-easyCount,h=pick(hard,hardCount),e=pick(easy,easyCount),m=pick(medium,medCount);let hi=0,ei=0,mi=0;for(let i=0;i<targetCount;i++)i%3==0&&hi<h.length?selected.push(h[hi++]):i%3==1&&ei<e.length?selected.push(e[ei++]):mi<m.length?selected.push(m[mi++]):hi<h.length?selected.push(h[hi++]):ei<e.length&&selected.push(e[ei++]);return selected.length>0?selected:shuffle(knowledge).slice(0,targetCount)}};
