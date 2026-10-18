"""Ghép tb-core.js + tb-core.tests.js vào trang demo một file. Chạy: python3 tools/build_demo_core.py <đường dẫn ra>"""
import sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'tools/demo_core.src.html').read_text(encoding='utf-8')
core = (root / 'site/bac-si-danh-muc/tb-core.js').read_text(encoding='utf-8')
tests = (root / 'site/bac-si-danh-muc/tb-core.tests.js').read_text(encoding='utf-8')
out = src.replace('/*CORE*/', core).replace('/*TESTS*/', tests)
pathlib.Path(sys.argv[1]).write_text(out, encoding='utf-8')
print('ok', len(out))
