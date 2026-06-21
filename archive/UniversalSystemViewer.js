/**
 * ============================================================================
 * UniversalSystemViewer
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const UniversalSystemViewer = {show(title,icon,content){var page=document.getElementById("page-gacha");page&&(page.innerHTML='<button class="btn back-float" onclick="PageManager.navigate(\'menu\')">←</button><div class="preview-header"><span class="preview-icon">'+icon+'</span><h2 class="preview-title">'+title+'</h2></div><div style="max-height:70vh;overflow-y:auto">'+content+"</div>",PageManager.navigate("gacha"))},firstaid(){this.show("🩺 急救模拟器","🩺",FirstAidEngine.render())},museum(){this.show("🏛️ 虚拟防灾馆","🏛️",DisasterMuseumEngine.render())},pets(){this.show("🐉 宠物系统","🐉",PetEngine.render())},diary(){this.show("📓 防灾日记","📓",DiaryEngine.render())},synthesis(){this.show("🧩 卡牌工坊","🧩",CardSynthesisEngine.render()+CardUpgradeEngine.render()+CardFragmentEngine.render()+SetBonusEngine.render())},music(){this.show("🎵 音乐收藏","🎵",MusicEngine.render())},eggs(){this.show("🥚 隐藏彩蛋","🥚",EasterEggEngine.render())},base(){this.show("🏠 防灾基地","🏠",BaseEngine.render()+OutfitEngine.render())}};
