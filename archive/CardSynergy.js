/**
 * ============================================================================
 * CardSynergy
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const CardSynergy = {SETS:{earthquake:{name:"地震专家",icon:"🌍",bonus:"地震题金币+30%",coinBonus:.3,color:"#8D6E63"},fire:{name:"烈焰战士",icon:"🔥",bonus:"火灾题金币+30%",coinBonus:.3,color:"#FF5722"},flood:{name:"洪水勇者",icon:"🌊",bonus:"洪水题金币+30%",coinBonus:.3,color:"#2196F3"},typhoon:{name:"台风克星",icon:"🌪️",bonus:"台风题金币+30%",coinBonus:.3,color:"#9E9E9E"},thunder:{name:"闪电侠",icon:"⚡",bonus:"雷电题金币+30%",coinBonus:.3,color:"#FFD700"},tornado:{name:"龙卷猎人",icon:"🌀",bonus:"龙卷题金币+30%",coinBonus:.3,color:"#9C27B0"},blizzard:{name:"冰雪卫士",icon:"❄️",bonus:"暴雪题金币+30%",coinBonus:.3,color:"#90CAF9"},volcano:{name:"火山征服者",icon:"🌋",bonus:"火山题金币+30%",coinBonus:.3,color:"#FF6B35"},epidemic:{name:"防疫先锋",icon:"🦠",bonus:"防疫题金币+30%",coinBonus:.3,color:"#4CAF50"},landslide:{name:"地灾专家",icon:"⛰️",bonus:"地灾题金币+30%",coinBonus:.3,color:"#795548"}},getProgress(){const collected=GameState._data&&GameState._data.cards||[],progress={};for(const[type,set]of Object.entries(this.SETS)){const total="undefined"!=typeof ALL_CARDS?ALL_CARDS.filter(c=>c.disaster===type).length:0,owned=collected.filter(id=>{const card="undefined"!=typeof ALL_CARDS?ALL_CARDS.find(c=>c.id===id):null;return card&&card.disaster===type}).length;progress[type]={...set,owned:owned,total:total,complete:total>0&&owned>=total}}return progress},getSynergyBonus(disasterType){let progress=this.getProgress();return progress[disasterType]&&progress[disasterType].complete?this.SETS[disasterType].coinBonus:0},getCompletedSets(){let progress=this.getProgress();return Object.entries(progress).filter(([_,p])=>p.complete).map(([type,p])=>({type:type,...p}))},getRarityBonus:card=>({common:0,fine:.05,rare:.1,epic:.15,legendary:.2,mythic:.3}[card.rarity]||0)};
