# -*- coding: utf-8 -*-
"""Dựng trang Tin nhanh và Bài viết từ nội dung soạn ở trang quản trị (topbroker.fun/admin).

Nguồn:  site/content/tin/*.json       (mỗi tin một file)
        site/content/bai-viet/*.json  (mỗi bài một file, phần thân viết bằng Markdown)
Kết quả: site/tin/index.html, site/bai-viet/index.html, site/bai-viet/<slug>/index.html
         và khối "Tin nhanh · Bài viết mới" trên trang chủ (giữa <!--CMS--> và <!--/CMS-->).

Netlify tự chạy file này mỗi lần có thay đổi (xem netlify.toml). Không cần thư viện ngoài.
"""
import glob, html, json, os, re, sys
from datetime import datetime

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
TAGS = {'NHNN': 'nh', 'Tin chuẩn': 's', 'Chưa xác minh': 'x'}
WD = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']


def esc(s):
    return html.escape(str(s or ''), quote=True)


def parse_dt(s):
    s = str(s or '').strip().replace('Z', '')
    for f in ('%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M', '%Y-%m-%d %H:%M', '%Y-%m-%d'):
        try:
            return datetime.strptime(s[:26], f)
        except ValueError:
            pass
    return datetime(2000, 1, 1)


def fmt_dt(d, time=True):
    t = f'{WD[d.weekday()]}, {d.day:02d}/{d.month:02d}/{d.year}'
    return t + (f' · {d.hour:02d}:{d.minute:02d}' if time and (d.hour or d.minute) else '')


def slugify(s):
    s = str(s or '').lower()
    tr = str.maketrans('àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
                       'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd')
    s = re.sub(r'[^a-z0-9]+', '-', s.translate(tr)).strip('-')
    return s[:70] or 'bai'


def inline(t):
    t = esc(t)
    t = re.sub(r'!\[([^\]]*)\]\(([^)\s]+)\)', r'<img src="\2" alt="\1" loading="lazy">', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', lambda m: f'<a href="{m.group(2)}"' + (' target="_blank" rel="noopener"' if m.group(2).startswith('http') else '') + f'>{m.group(1)}</a>', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', t)
    return t


def md(src):
    """Markdown tối giản: tiêu đề ##/###, đoạn văn, in đậm, in nghiêng, link, ảnh, danh sách, trích dẫn."""
    out, para, lst, ltype = [], [], [], None

    def flush():
        nonlocal para, lst, ltype
        if para:
            out.append('<p>' + '<br>'.join(inline(x) for x in para) + '</p>'); para = []
        if lst:
            out.append(f'<{ltype}>' + ''.join(f'<li>{inline(x)}</li>' for x in lst) + f'</{ltype}>'); lst = []; ltype = None

    for line in str(src or '').replace('\r', '').split('\n'):
        s = line.strip()
        if not s:
            flush(); continue
        m = re.match(r'^(#{1,4})\s+(.*)', s)
        if m:
            flush(); lv = min(4, max(2, len(m.group(1)) + 1)); out.append(f'<h{lv}>{inline(m.group(2))}</h{lv}>'); continue
        m = re.match(r'^[-*+]\s+(.*)', s)
        if m:
            if para or ltype == 'ol': flush()
            ltype = 'ul'; lst.append(m.group(1)); continue
        m = re.match(r'^\d+[.)]\s+(.*)', s)
        if m:
            if para or ltype == 'ul': flush()
            ltype = 'ol'; lst.append(m.group(1)); continue
        if s.startswith('>'):
            flush(); out.append(f'<blockquote>{inline(s.lstrip("> "))}</blockquote>'); continue
        if lst: flush()
        para.append(s)
    flush()
    return '\n'.join(out)


def load(folder):
    items = []
    for p in sorted(glob.glob(os.path.join(ROOT, 'content', folder, '*.json'))):
        try:
            d = json.load(open(p, encoding='utf-8'))
        except Exception as e:
            print('BỎ QUA file lỗi', p, e, file=sys.stderr); continue
        if d.get('an') or d.get('draft'):
            continue
        d['_dt'] = parse_dt(d.get('ngay'))
        d['_slug'] = d.get('slug') or os.path.splitext(os.path.basename(p))[0]
        items.append(d)
    items.sort(key=lambda d: d['_dt'], reverse=True)
    return items


HEAD = '''<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title} · Top Broker</title>
<meta name="description" content="{desc}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Lora:ital,wght@0,600;0,700;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<link rel="icon" href="{r}assets/logo.svg" type="image/svg+xml">
<link rel="icon" href="{r}assets/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="{r}assets/apple-touch-icon.png">
<link rel="stylesheet" href="{r}assets/site.css">
<link rel="stylesheet" href="{r}assets/content.css">
</head>
<body data-root="{r}" data-page="{page}">
<div id="tb-top"></div>
<main class="cm">
'''
FOOT = '''</main>
<div id="tb-foot"></div>
<script src="{r}assets/site.js"></script>
</body>
</html>
'''


def page(path, r, pg, title, desc, body):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(HEAD.format(title=esc(title), desc=esc(desc), r=r, page=pg) + body + FOOT.format(r=r))


def tin_item(d, r=''):
    tag = d.get('nhan') or 'Tin chuẩn'
    link = d.get('nguon_link')
    src = f'<a class="src" href="{esc(link)}" target="_blank" rel="noopener">Nguồn: {esc(d.get("nguon") or link)}</a>' if link else (f'<span class="src">Nguồn: {esc(d.get("nguon"))}</span>' if d.get('nguon') else '')
    body = md(d.get('body')) if d.get('body') else ''
    return (f'<article class="tn" id="{esc(d["_slug"])}"><div class="tm"><span class="tag {TAGS.get(tag, "s")}">{esc(tag)}</span>'
            f'<time datetime="{d["_dt"].isoformat()}">{fmt_dt(d["_dt"])}</time></div>'
            f'<h2>{esc(d.get("tieu_de"))}</h2>' + (f'<p class="sum">{esc(d.get("tom_tat"))}</p>' if d.get('tom_tat') else '') +
            (f'<div class="prose">{body}</div>' if body else '') + src + '</article>')


def build():
    tin, bai = load('tin'), load('bai-viet')

    # Tin nhanh
    page(os.path.join(ROOT, 'tin', 'index.html'), '../', 'tin', 'Tin nhanh', 'Tin nhanh thị trường do Top Broker cập nhật trong ngày.',
         '<header class="ch"><span class="kick">Top Broker</span><h1>Tin nhanh</h1><p class="dek">Tin ngắn trong ngày, ghi rõ nguồn. Tin mạng xã hội luôn gắn nhãn "Chưa xác minh".</p></header>'
         + ('<div class="tl">' + ''.join(tin_item(d) for d in tin) + '</div>' if tin else '<p class="empty">Chưa có tin nào.</p>'))

    # Bài viết
    cards = ''.join(
        f'<a class="bc" href="{esc(d["_slug"])}/index.html">' + (f'<img src="{esc(d["anh"])}" alt="" loading="lazy">' if d.get('anh') else '') +
        f'<span class="k">{esc(d.get("chuyen_muc") or "Bài viết")} · {fmt_dt(d["_dt"], False)}</span><b>{esc(d.get("tieu_de"))}</b>'
        + (f'<span class="d">{esc(d.get("mo_ta"))}</span>' if d.get('mo_ta') else '') + '<span class="more">Đọc tiếp →</span></a>' for d in bai)
    page(os.path.join(ROOT, 'bai-viet', 'index.html'), '../', 'bai-viet', 'Bài viết', 'Bài viết phân tích, góc nhìn thị trường của Top Broker.',
         '<header class="ch"><span class="kick">Top Broker</span><h1>Bài viết</h1><p class="dek">Góc nhìn, phân tích và chuyện nghề đầu tư, viết dễ hiểu.</p></header>'
         + (f'<div class="bg">{cards}</div>' if bai else '<p class="empty">Chưa có bài viết nào.</p>'))
    for d in bai:
        page(os.path.join(ROOT, 'bai-viet', d['_slug'], 'index.html'), '../../', 'bai-viet', d.get('tieu_de'), d.get('mo_ta') or '',
             f'<article class="ar"><a class="bk" href="../index.html">‹ Bài viết</a><span class="kick">{esc(d.get("chuyen_muc") or "Bài viết")}</span>'
             f'<h1>{esc(d.get("tieu_de"))}</h1>' + (f'<p class="dek">{esc(d.get("mo_ta"))}</p>' if d.get('mo_ta') else '') +
             f'<div class="by">{esc(d.get("tac_gia") or "Top Broker")} · <time datetime="{d["_dt"].isoformat()}">{fmt_dt(d["_dt"])}</time></div>'
             + (f'<img class="hero" src="{esc(d["anh"])}" alt="">' if d.get('anh') else '') +
             f'<div class="prose">{md(d.get("body"))}</div><p class="disc">Thông tin tham khảo, không phải khuyến nghị mua bán chứng khoán.</p></article>')

    # Khối trên trang chủ
    hp = os.path.join(ROOT, 'index.html')
    s = open(hp, encoding='utf-8').read()
    if '<!--CMS-->' in s and '<!--/CMS-->' in s:
        tl = ''.join(f'<li><span class="tag {TAGS.get(d.get("nhan") or "Tin chuẩn", "s")}">{esc(d.get("nhan") or "Tin chuẩn")}</span>'
                     f'<a href="tin/index.html#{esc(d["_slug"])}">{esc(d.get("tieu_de"))}</a><time>{fmt_dt(d["_dt"])}</time></li>' for d in tin[:5])
        bl = ''.join(f'<li><a href="bai-viet/{esc(d["_slug"])}/index.html">{esc(d.get("tieu_de"))}</a><span>{esc(d.get("chuyen_muc") or "Bài viết")} · {fmt_dt(d["_dt"], False)}</span></li>' for d in bai[:4])
        block = ('<!--CMS-->\n  <div class="cms">'
                 '<section class="card cmsb" aria-labelledby="h-tn"><div class="sh"><h2 id="h-tn">Tin nhanh</h2><a href="tin/index.html">Tất cả →</a></div>'
                 + (f'<ul class="tnl">{tl}</ul>' if tl else '<p class="note">Chưa có tin.</p>') + '</section>'
                 '<section class="card cmsb" aria-labelledby="h-bv"><div class="sh"><h2 id="h-bv">Bài viết mới</h2><a href="bai-viet/index.html">Tất cả →</a></div>'
                 + (f'<ul class="bvl">{bl}</ul>' if bl else '<p class="note">Chưa có bài viết.</p>') + '</section></div>\n  <!--/CMS-->')
        s = re.sub(r'<!--CMS-->.*?<!--/CMS-->', lambda m: block, s, flags=re.S)
        open(hp, 'w', encoding='utf-8').write(s)
    print(f'Đã dựng {len(tin)} tin nhanh, {len(bai)} bài viết.')


if __name__ == '__main__':
    build()
