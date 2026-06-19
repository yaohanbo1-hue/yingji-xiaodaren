import os, re, json, collections

def main(ctx):
    base = "C:/Users/hambu/Documents/kimi/workspace/yingji-xiaodaren"
    results = []
    
    # 1. Read index.html
    with open(os.path.join(base, "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
    
    # 2. Duplicate CSS
    stylesheets = re.findall(r'<link rel="stylesheet" href="([^"]+)">', html)
    dupes_css = {k: v for k, v in collections.Counter(stylesheets).items() if v > 1}
    results.append(f"Duplicate CSS: {dupes_css}")
    
    # 3. Duplicate preloads
    preloads = re.findall(r'<link rel="preload" href="([^"]+)" as="script">', html)
    dupes_preload = {k: v for k, v in collections.Counter(preloads).items() if v > 1}
    results.append(f"Duplicate preload scripts: {dupes_preload}")
    
    # 4. Check empty pages (pages with very little content)
    # Find all <div id="page-xxx" ...> ... </div> blocks (non-greedy inner div matching)
    page_pattern = r'<div id="(page-[\w-]+)" class="page[^"]*"[^>]*>(.*?)</div>\s*</div>'
    pages = re.findall(page_pattern, html, re.DOTALL)
    results.append(f"Total pages: {len(pages)}")
    
    empty_like = []
    for pid, content in pages:
        stripped = re.sub(r'<button[^>]*>.*?</button>', '', content, flags=re.DOTALL)
        stripped = re.sub(r'<script.*?</script>', '', stripped, flags=re.DOTALL)
        stripped = re.sub(r'<style.*?</style>', '', stripped, flags=re.DOTALL)
        stripped = re.sub(r'<!--.*?-->', '', stripped, flags=re.DOTALL)
        text_only = re.sub(r'<[^>]+>', '', stripped).strip()
        if len(text_only) < 20 and len(content) < 300:
            empty_like.append(pid)
    results.append(f"Empty/placeholder pages: {empty_like}")
    
    # 5. Check SW vs HTML coverage
    with open(os.path.join(base, "sw.js"), "r", encoding="utf-8") as f:
        sw = f.read()
    sw_assets = set(re.findall(r"'\.\/([^']+)'", sw))
    css_html = set(stylesheets)
    js_html = set(re.findall(r'<script src="([^"]+)"', html))
    
    missing_in_sw_css = css_html - sw_assets
    missing_in_sw_js = js_html - sw_assets
    results.append(f"CSS in HTML but missing in SW: {missing_in_sw_css}")
    results.append(f"JS in HTML but missing in SW: {missing_in_sw_js}")
    
    # 6. Check manifest.json
    with open(os.path.join(base, "manifest.json"), "r", encoding="utf-8") as f:
        manifest = json.load(f)
    results.append(f"Manifest icons: {manifest.get('icons', [])}")
    
    # 7. Check CSS files for potential issues
    css_files = [f for f in os.listdir(base) if f.endswith('.css')]
    results.append(f"CSS files on disk: {len(css_files)}")
    
    # 8. Look for commented-out code blocks in HTML
    big_comments = re.findall(r'<!--\s*\n[^>]*?(?:TODO|FIXME|deprecated|unused|隐藏|占位|开发中)[^>]*?-->', html, re.IGNORECASE | re.DOTALL)
    results.append(f"Big comment blocks with keywords: {len(big_comments)}")
    
    return "\n".join(results)
