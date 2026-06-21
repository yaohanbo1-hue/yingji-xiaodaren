/**
 * ============================================================================
 * SeasonEngine
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const SeasonEngine = {_data:{season:1,startDate:null,points:0,rank:"铜牌",history:[]},init(){try{const saved=localStorage.getItem("disasterSeason");saved&&(this._data=JSON.parse(saved))}catch(e){}if(!this._data.startDate){const now=new Date;this._data.startDate=new Date(now.getFullYear(),now.getMonth(),1).toISOString()}this._checkSeasonReset()},_checkSeasonReset(){const start=new Date(this._data.startDate),now=new Date;12*(now.getFullYear()-start.getFullYear())+(now.getMonth()-start.getMonth())>=1&&(this._data.history.push({season:this._data.season,points:this._data.points,rank:this._data.rank,endDate:start.toISOString()}),this._data.season++,this._data.startDate=new Date(now.getFullYear(),now.getMonth(),1).toISOString(),this._data.points=0,this._data.rank="铜牌",this._save())},addPoints(pts){this._data.points+=pts,this._data.points>=2e3?this._data.rank="钻石":this._data.points>=1e3?this._data.rank="铂金":this._data.points>=500?this._data.rank="金牌":this._data.points>=200?this._data.rank="银牌":this._data.rank="铜牌",this._save()},getSeasonInfo(){return{season:this._data.season,points:this._data.points,rank:this._data.rank}},_save(){try{localStorage.setItem("disasterSeason",JSON.stringify(this._data))}catch(e){}}};
