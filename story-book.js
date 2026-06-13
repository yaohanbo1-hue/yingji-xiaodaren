// 故事模式 V5 - 纯阅读电子书
const StoryBookEngine = {
  _book: null, _chapter: 0, _page: 0,
  init() {
    PageManager.navigate('story-book');
    setTimeout(() => this._renderLibrary(), 400);
  },
  _renderLibrary() {
    const c = document.getElementById('storyBookContent');
    if (!c) return;
    const books = [
      {id:1,title:'地震求生记',icon:'🌍',chapters:5},
      {id:2,title:'洪水逃生录',icon:'🌊',chapters:5},
      {id:3,title:'台风防御战',icon:'🌀',chapters:5},
      {id:4,title:'火灾自救指南',icon:'🔥',chapters:5}
    ];
    let h = '<div style="text-align:center;margin-bottom:30px;"><h2 style="font-size:24px;color:#fff;margin-bottom:8px;">📚 故事书库</h2><p style="color:rgba(255,255,255,0.6);font-size:14px;">选择一本故事书，开始阅读之旅</p></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:500px;margin:0 auto;">';
    books.forEach(b => {
      h += '<div onclick="StoryBookEngine.openBook('+b.id+')" style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px 16px;text-align:center;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform=\'translateY(-4px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,0.3)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"><div style="font-size:48px;margin-bottom:12px;">'+b.icon+'</div><div style="font-size:16px;color:#fff;font-weight:600;margin-bottom:4px;">'+b.title+'</div><div style="font-size:12px;color:rgba(255,255,255,0.5);">'+b.chapters+'个章节</div></div>';
    });
    h += '</div>';
    c.innerHTML = h;
  },
  openBook(id) {
    this._book = STORY_BOOKS[id];
    this._chapter = 0; this._page = 0;
    this._renderChapter();
  },
  _renderChapter() {
    var c = document.getElementById('storyBookContent');
    if (!c) return;
    var ch = this._book.chapters[this._chapter];
    var pg = ch.pages[this._page];
    var total = ch.pages.length;
    var h = '<div style="max-width:500px;margin:0 auto;padding:20px;">';
    h += '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:32px;margin-bottom:8px;">'+this._book.icon+'</div>';
    h += '<h3 style="color:#fff;font-size:18px;margin-bottom:4px;">'+this._book.title+'</h3>';
    h += '<p style="color:rgba(255,255,255,0.6);font-size:14px;">'+ch.title+'</p></div>';
    h += '<div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;min-height:180px;">';
    h += '<div style="color:rgba(255,255,255,0.9);font-size:15px;line-height:1.8;white-space:pre-line;">'+pg+'</div></div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;">';
    h += '<div style="color:rgba(255,255,255,0.5);font-size:13px;">第 '+(this._page+1)+' / '+total+' 页</div>';
    h += '<div style="display:flex;gap:12px;">';
    if (this._page > 0) h += '<button onclick="StoryBookEngine.prevPage()" style="padding:10px 20px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;">← 上一页</button>';
    if (this._page < total-1) h += '<button onclick="StoryBookEngine.nextPage()" style="padding:10px 20px;background:linear-gradient(135deg,#667eea,#764ba2);border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:600;">下一页 →</button>';
    else if (this._chapter < this._book.chapters.length-1) h += '<button onclick="StoryBookEngine.nextChapter()" style="padding:10px 20px;background:linear-gradient(135deg,#f093fb,#f5576c);border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:600;">下一章 →</button>';
    else h += '<button onclick="StoryBookEngine._renderLibrary()" style="padding:10px 20px;background:linear-gradient(135deg,#4facfe,#00f2fe);border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:600;">✓ 阅读完成</button>';
    h += '</div></div></div>';
    c.innerHTML = h;
  },
  nextPage() { if (this._page < this._book.chapters[this._chapter].pages.length - 1) { this._page++; this._renderChapter(); } },
  prevPage() { if (this._page > 0) { this._page--; this._renderChapter(); } },
  nextChapter() { if (this._chapter < this._book.chapters.length - 1) { this._chapter++; this._page = 0; this._renderChapter(); } }
};
// 故事数据在 story-data-1.js, story-data-2.js, story-data-3.js 中定义
