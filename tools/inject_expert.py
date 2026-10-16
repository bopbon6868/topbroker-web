# -*- coding: utf-8 -*-
# Chèn khối "Góc nhìn nhà phân tích" (chỉ hiện ở chế độ Chuyên gia) vào 11 trang cổ phiếu.
# Chạy lại được nhiều lần: khối cũ nằm giữa 2 dấu <!--AX--> sẽ được thay mới.
import re, sys
sys.path.insert(0, '.')
from expert_data import E

CSS = '''<style>
.ax .axk{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--indigo)}
.ax .card p{font-size:16px;line-height:1.7}
.ax .axt{border-left:4px solid var(--indigo)}
.ax ol.axd{list-style:none;margin:0;padding:0;counter-reset:d;display:flex;flex-direction:column}
.ax ol.axd li{counter-increment:d;display:grid;grid-template-columns:28px minmax(0,1fr);gap:2px 10px;padding:12px 0;border-top:1px solid var(--sep)}
.ax ol.axd li:first-child{border-top:0;padding-top:4px}
.ax ol.axd li::before{content:counter(d);grid-row:span 3;width:24px;height:24px;border-radius:50%;background:var(--indigo);color:#fff;font-size:13px;font-weight:700;display:grid;place-items:center;margin-top:1px}
.ax ol.axd b{font-size:16px}
.ax ol.axd span{font-size:15px;color:var(--label2);line-height:1.55}
.ax ol.axd em{font-style:normal;font-size:14.5px;line-height:1.55;background:var(--fill);border-radius:8px;padding:7px 10px;margin-top:4px}
.ax ul.axs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.ax ul.axs li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:2px 10px;padding:10px 0;border-top:1px solid var(--sep)}
.ax ul.axs li:first-child{border-top:0;padding-top:2px}
.ax ul.axs li i{grid-row:span 2;font-style:normal;font-weight:800;font-size:15px;line-height:1.4}
.ax ul.axs li.g i{color:var(--green)} .ax ul.axs li.r i{color:var(--red)}
.ax ul.axs b{font-size:15.5px} .ax ul.axs span{font-size:15px;color:var(--label2);line-height:1.5}
.ax .axc{background:color-mix(in srgb,var(--indigo) 7%,var(--card))}
.ax table td:first-child{font-weight:600}
</style>'''

def block(tk):
    d = E[tk]
    drv = ''.join(f'<li><b>{n}</b><span>{x}</span><em>{s}</em></li>' for n, x, s in d['drivers'])
    th = ''.join(f'<th>{h}</th>' for h in d['scen']['head'])
    tr = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in d['scen']['rows'])
    sg = ''.join(f'<li class="{c}"><i>{"↑" if c == "g" else "↓"}</i><b>{t}</b><span>{m}</span></li>' for c, t, m in d['signs'])
    return ('<!--AX-->' + CSS +
      '<section class="xs ax"><div class="sh"><h2>Góc nhìn nhà phân tích</h2><span class="badge">Chuyên gia</span></div>'
      f'<article class="card axt"><span class="axk">Luận điểm cốt lõi</span><p>{d["thesis"]}</p></article>'
      f'<article class="card"><span class="axk">Giá hiện tại đang ngầm định gì?</span><p>{d["implied"]}</p><div class="ev">{d["implied_ev"]}</div></article>'
      f'<article class="card"><span class="axk">Các biến số quyết định và độ nhạy</span><ol class="axd">{drv}</ol></article>'
      f'<span class="axk" style="padding:8px 4px 0">Ma trận kịch bản: P/E, P/B ở giá hiện tại</span>'
      f'<div class="tw"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div><p class="foot-note">{d["scen"]["note"]}</p>'
      f'<article class="card"><span class="axk">Tín hiệu xác nhận hoặc bác bỏ luận điểm</span><ul class="axs">{sg}</ul></article>'
      f'<article class="card axc"><span class="axk">Điều thị trường có thể đang bỏ sót</span><p>{d["blind"]}</p></article>'
      '</section><!--/AX-->\n  ')

for tk in E:
    p = f'site/co-phieu/{tk.lower()}/index.html'
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'<!--AX-->.*?<!--/AX-->\n  ', '', s, flags=re.S)
    i = s.index('<div class="teaser">')
    s = s[:i] + block(tk) + s[i:]
    open(p, 'w', encoding='utf-8').write(s)
    print('ok', tk)
