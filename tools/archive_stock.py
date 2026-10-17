# -*- coding: utf-8 -*-
# Lưu bản cũ của một bài Giải mã trước khi phân tích lại.
# Dùng: python3 tools/archive_stock.py VCG 2026-10-17   (ngày = ngày đăng/cập nhật của bản đang có)
# Kết quả: site/co-phieu/vcg/2026-10-17/index.html (sửa đường dẫn tương đối), và thêm ngày vào history trong tools/articles_meta.json.
import sys, os, json
tk, d = sys.argv[1].upper(), sys.argv[2]
src = f'site/co-phieu/{tk.lower()}/index.html'; dst_dir = f'site/co-phieu/{tk.lower()}/{d}'
s = open(src, encoding='utf-8').read()
s = s.replace('"../../', '"../../../').replace('"../articles', '"../../articles').replace('href="../index.html"', 'href="../../index.html"')
s = s.replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"', 1)
os.makedirs(dst_dir, exist_ok=True)
open(f'{dst_dir}/index.html', 'w', encoding='utf-8').write(s)
m = json.load(open('tools/articles_meta.json', encoding='utf-8'))
h = m[tk].setdefault('history', [])
if d not in h: h.insert(0, d)
json.dump(m, open('tools/articles_meta.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('Đã lưu', dst_dir)
