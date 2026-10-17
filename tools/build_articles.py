# -*- coding: utf-8 -*-
# Sinh site/co-phieu/articles.js (danh bạ bài Giải mã) từ các trang cổ phiếu + tools/articles_meta.json.
# Chạy từ thư mục gốc kho: python3 tools/build_articles.py
import json, re, html
meta = json.load(open('tools/articles_meta.json', encoding='utf-8'))
idx = open('site/co-phieu/index.html', encoding='utf-8').read()
old = json.load(open('tools/articles_cache.json', encoding='utf-8')) if __import__('os').path.exists('tools/articles_cache.json') else {}
def txt(s): return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()
out = []
for tk, m in meta.items():
    if tk.startswith('_'): continue
    page = open(f'site/co-phieu/{tk.lower()}/index.html', encoding='utf-8').read()
    row = re.search(r'<a class="st" href="%s/index.html">(.*?)</a>(?=<a class="st"|</div>)' % tk.lower(), idx, re.S)
    c = old.get(tk, {})
    if row:
        r = row.group(1)
        c['name'] = txt(re.search(r'<span class="nm">(.*?)<small>', r, re.S).group(1))
        c['sector'] = txt(re.search(r'<small>(.*?)</small>', r).group(1))
        c['price'] = txt(re.search(r'<span class="px mono">(.*?)</span>', r).group(1))
        nums = re.findall(r'<span class="mono (up|dn)">(.*?)</span>', r)
        c['m1'], c['y1'], c['pk'] = [(a, txt(b)) for a, b in nums[:3]]
        c['line'] = txt(re.sub(r'<span class="more">.*?</span>', '', re.search(r'<span class="ln">(.*)</span>', r, re.S).group(1)))
    sec = re.search(r'Tóm tắt 30 giây</h2>.*?</section>', page, re.S).group(0)
    c['points'] = [txt(x) for x in re.findall(r'<span class="rs">(.*?)</span>', sec)][:4]
    old[tk] = c
    c['title'] = m.get('title') or (tk + ': ' + c['line'].split('. ')[0].rstrip('.'))
    art = f'tools/art/{tk}.svg'  # tranh riêng của bài (tools/make_art.py), hiện ở ô Giải mã trang chủ
    c['art'] = open(art, encoding='utf-8').read().strip() if __import__('os').path.exists(art) else None
    out.append(dict(tk=tk, pub=m['pub'], upd=m.get('upd'), data=m.get('data'), history=m.get('history', []), changes=m.get('changes', []), **c))
[o.pop('art', None) for o in old.values()]
json.dump(old, open('tools/articles_cache.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
out.sort(key=lambda a: (a['upd'] or a['pub']), reverse=True)
js = '/* Sinh tự động bởi tools/build_articles.py, đừng sửa tay. Sắp xếp: bài mới đăng hoặc mới cập nhật đứng đầu. */\nwindow.TB_ARTICLES = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n'
open('site/co-phieu/articles.js', 'w', encoding='utf-8').write(js)
# Gắn ?v=<mã băm nội dung> vào mọi thẻ <script src=...articles.js> để điện thoại không giữ bản cũ (thiếu tranh, thiếu bài mới)
import hashlib, glob
ver = hashlib.md5(js.encode('utf-8')).hexdigest()[:8]
for f in ['site/index.html'] + glob.glob('site/co-phieu/**/index.html', recursive=True):
    h = open(f, encoding='utf-8').read()
    h2 = re.sub(r'(src="[./]*(?:co-phieu/)?articles\.js)(\?v=\w+)?"', r'\1?v=' + ver + '"', h)
    if h2 != h: open(f, 'w', encoding='utf-8').write(h2)
print('articles.js?v=' + ver)
print([a['tk'] for a in out])
