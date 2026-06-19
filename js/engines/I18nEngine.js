/**
 * ============================================================================
 * I18nEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const I18nEngine = {currentLang:"zh",translations:{zh:{title:"应急小达人",subtitle:"开盲盒 · 学防灾 · 救世界",collect:"收集",achievement:"成就",highscore:"最高分",correct:"答对了！",wrong:"答错了！",combo:"连击",score:"得分",coins:"金币",level:"等级",hp:"生命",start:"开始",back:"返回",fire:"火灾",earthquake:"地震",flood:"洪水",typhoon:"台风",lightning:"雷电",landslide:"泥石流",tornado:"龙卷风",snowstorm:"暴雪",gas:"燃气泄漏",elevator:"电梯故障"},en:{title:"Disaster HQ",subtitle:"Open Boxes · Learn Safety · Save Lives",collect:"Collected",achievement:"Achievement",highscore:"High Score",correct:"Correct!",wrong:"Wrong!",combo:"Combo",score:"Score",coins:"Coins",level:"Level",hp:"HP",start:"Start",back:"Back",fire:"Fire",earthquake:"Earthquake",flood:"Flood",typhoon:"Typhoon",lightning:"Lightning",landslide:"Landslide",tornado:"Tornado",snowstorm:"Snowstorm",gas:"Gas Leak",elevator:"Elevator"}},t(key){return(this.translations[this.currentLang]||this.translations.zh)[key]||key},setLang(lang){this.currentLang=lang,void 0!==GameState&&GameState._data&&(GameState._data.language=lang,GameState.save())},toggle(){this.setLang("zh"===this.currentLang?"en":"zh"),location.reload()},init(){void 0!==GameState&&GameState._data&&(this.currentLang=GameState._data.language||"zh")}};
