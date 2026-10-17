# -*- coding: utf-8 -*-
import json, os, html
from stock_data3 import STOCKS
for _S in STOCKS.values():
    _S["y1"]=_S["price"]/_S["weekly"][8]-1; _S["m1"]=_S["price"]/_S["m1_ref"]-1
BASE = 'site/co-phieu'
CSS = open('tools/stock-inner.css', encoding='utf-8').read()

def vn(n, d=0):
    s = f"{abs(n):,.{d}f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    return ('−' if n < 0 else '') + s
def pct(x, d=1):
    return ('+' if x > 0 else '') + vn(x * 100, d) + '%'

def page(tk, S):
    w = S['weekly']; assert len(w) == 60, (tk, len(w))
    peak = max(w); frompk = w[-1] / peak - 1
    ma10 = sum(w[-10:]) / 10; ma40 = sum(w[-40:]) / 40
    data = dict(weekly=w, profit=S['profit'], price=S['price'])
    sumrows = ''.join(f'<div class="row"><span class="ic {c}">{i}</span><div class="rc"><span class="rt">{t}</span><span class="rs">{s}</span></div></div>' for c, i, t, s in S['summary'])
    widgets = ''.join(f'<div class="w"><span class="k">{k}</span><span class="v tn">{v}</span><p class="t p">{p}</p><p class="t x">{x}</p></div>' for k, v, p, x in S['widgets'])
    th = ''.join(f'<th>{h}</th>' for h in S['table']['head'])
    def cell(c):
        cls = ' class="up"' if c.startswith('+') else (' class="dn"' if (c.startswith('−') or c == 'Lỗ') else '')
        return f'<td{cls}>{c}</td>'
    tr = ''.join('<tr>' + ''.join(cell(c) if j else f'<td>{c}</td>' for j, c in enumerate(r)) + '</tr>' for r in S['table']['rows'])
    chipc = {'r': 'r', 'o': 'o', 'b': 'b', 'g': 'g'}
    ins = ''
    for h, tc, tag, p, x, ev in S['insights']:
        ins += f'<article class="card"><div class="ch"><h3>{h}</h3><span class="chip {chipc[tc]}">{tag}</span></div><p class="p">{p}</p><p class="x">{x}</p>' + (f'<div class="ev">{ev}</div>' if ev else '') + '</article>'
    pro = ''
    for blk in S['pro']:
        ph = ''.join(f'<th>{h}</th>' for h in blk['head'])
        pr = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in blk['rows'])
        pro += f'<section class="xs"><div class="sh"><h2>{blk["title"]}</h2><span class="badge">Chuyên gia</span></div><div class="tw"><table><thead><tr>{ph}</tr></thead><tbody>{pr}</tbody></table></div><p class="foot-note">{blk["note"]}</p></section>'
    T = S['tech']
    trows = ''.join(f'<div class="row"><span class="ic {c}">{ic}</span><div class="rc"><span class="rt">{t}</span><span class="rs p">{p}</span><span class="rs x">{x}</span></div></div>' for ic, c, t, p, x in T['rows'])
    trows += f'<div class="row"><span class="ic g">W</span><div class="rc"><span class="rt">Đường tuần</span><span class="rs p">Đường trung bình 10 tuần ở {vn(ma10)}, 40 tuần ở {vn(ma40)}.</span><span class="rs x">MA10 tuần {vn(ma10)} · MA40 tuần {vn(ma40)} · Giá/MA40 {pct(w[-1]/ma40-1)}.</span></div></div>'
    news = ''.join(f'<div class="row"><span class="ic {c}">{i}</span><div class="rc"><span class="dt">{d}</span><span class="rt">{t}</span><span class="rs">{s}</span></div></div>' for c, i, d, t, s in S['news'])
    lvc = ['dn', 'wn', 'up']
    lv = ''.join(f'<div class="w"><span class="k {lvc[j]}">{k}</span><span class="v {lvc[j]} tn">{v}</span><p class="t">{t}</p></div>' for j, (k, v, t) in enumerate(S['levels']))
    y1c = 'g' if S['y1'] > 0 else 'r'
    out = f'''<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Giải mã {tk} · Top Broker</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Giải mã cổ phiếu {tk} ({html.escape(S['name'])}) bằng tiếng dễ hiểu và những gì ít người nói cho bạn.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<link rel="icon" href="../../assets/logo.svg" type="image/svg+xml">
<link rel="icon" href="../../assets/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="../../assets/apple-touch-icon.png">
<link rel="stylesheet" href="../../assets/site.css?v=20261017a">
<style>{CSS}</style>
<style>body{{margin:0}}.nav{{z-index:15}}.back a{{color:var(--blue);text-decoration:none}}.back span{{color:var(--label2)}}@media (max-width:560px){{.back span{{display:none}}}}</style>
</head>
<body data-root="../../" data-page="giai-ma">
<div id="tb-top"></div>
<nav class="nav" id="nav"><div class="navIn">
  <span class="back"><a href="../index.html">Cổ phiếu</a> <span>/ {tk}</span></span>
  <span class="navT">{tk} · {vn(S['price'])}</span>
  <div class="seg" role="group" aria-label="Chế độ đọc"><button id="mPlain" aria-pressed="true">Dễ hiểu</button><button id="mPro" aria-pressed="false">Chuyên gia</button></div>
</div></nav>
<div class="wrap">
  <header class="hero">
    <span class="sub">{S['sector']} · Chốt phiên 16/10/2026</span>
    <h1>{tk}</h1>
    <span class="sub" style="font-size:17px;color:var(--label)">{S['name']}</span>
    <div class="priceLine"><span class="price tn">{vn(S['price'])}</span><span class="chip {y1c} tn">{pct(S['y1'])} · 1 năm</span><span class="chip {'g' if S['m1']>0 else 'r'} tn">{pct(S['m1'])} · 1 tháng</span><span class="chip r tn">{pct(frompk,0)} từ đỉnh 60 tuần</span></div>
    <p class="sub p">{S['sub_p']}</p><p class="sub x tn">{S['sub_x']}</p>
  </header>
  <section><div class="sh"><h2>Tóm tắt 30 giây</h2></div><div class="group">{sumrows}<p class="verdict p">{S['verdict_p']}</p><p class="verdict x">{S['verdict_x']}</p></div></section>
  <section><div class="sh"><h2>Giá này đắt hay rẻ?</h2></div><div class="widgets">{widgets}</div></section>
  <section><div class="sh"><h2>Làm ăn ra sao?</h2></div>
    <div class="cc"><svg id="profitChart" viewBox="0 0 640 250" role="img" aria-label="Lợi nhuận theo quý"></svg><div class="legend"><span><i style="background:var(--blue)"></i>{S['profit']['unit']}</span><span><i style="background:var(--red)"></i>Quý lỗ</span></div></div>
    <div class="tw"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div><p class="foot-note">Đơn vị: tỷ đồng. Nguồn: BCTC hợp nhất qua TCBS.</p></section>
  <section><div class="sh"><h2>Những gì ít người nói cho bạn</h2></div><p class="foot-note" style="padding-inline:4px">Phần lớn báo cáo chỉ kể điểm sáng. Đây là những chỗ nên soi kỹ trước khi xuống tiền.</p><div class="ins">{ins}</div></section>
  <div class="teaser"><span class="ic i">+</span><div class="rc"><span class="rt">Bảng phân tích chuyên sâu</span><span class="rs">Chỉ số chi tiết, cấu trúc tài chính và ghi chú của chuyên viên.</span></div><button id="goPro">Xem</button></div>
  <div id="pro" style="display:contents">{pro}</div>
  <section><div class="sh"><h2>Giá đang đi về đâu?</h2></div>
    <div class="cc"><svg id="priceChart" viewBox="0 0 640 270" role="img" aria-label="Giá tuần 60 tuần gần nhất"></svg><div class="legend"><span><i style="background:var(--label)"></i>Giá đóng cửa tuần</span><span><i style="background:var(--orange)"></i>MA 10 tuần (~2,5 tháng)</span><span><i style="background:var(--red)"></i>MA 40 tuần (~10 tháng)</span></div></div>
    <div class="group">{trows}</div></section>
  <section><div class="sh"><h2>Tin chuẩn</h2></div><div class="group news">{news}</div></section>
  <section><div class="sh"><h2>Các mốc giá cần nhớ</h2></div><div class="lv">{lv}</div><p class="foot-note p">Thống nhất trước với nhau: giá về đâu thì làm gì. Khi thị trường biến động, mình làm theo kế hoạch chứ không theo cảm xúc.</p></section>
  <footer class="legal"><p><b>Nguồn:</b> TCBS (BCTC, giá điều chỉnh, chỉ báo kỹ thuật, tin HOSE và báo chí). Dữ liệu chốt phiên 16/10/2026.</p><p>Công cụ tham khảo và giáo dục, không phải khuyến nghị mua hay bán. Các số "khoảng", "ước tính" được suy ra từ BCTC và cần đối chiếu thuyết minh gốc.</p></footer>
</div>
<div id="tb-foot"></div>
<script src="../../assets/site.js?v=20261017a"></script>
<script>
var S={json.dumps(data, ensure_ascii=False)};
(function(){{
  var b=document.body,p=document.getElementById('mPlain'),x=document.getElementById('mPro');
  function set(pro){{b.classList.toggle('pro',pro);p.setAttribute('aria-pressed',String(!pro));x.setAttribute('aria-pressed',String(pro));try{{localStorage.setItem('tbMode',pro?'pro':'plain')}}catch(e){{}}}}
  p.onclick=function(){{set(false)}};x.onclick=function(){{set(true)}};
  document.getElementById('goPro').onclick=function(){{set(true);var f=document.querySelector('#pro .xs');if(f)f.scrollIntoView({{behavior:'smooth',block:'start'}})}};
  try{{if(localStorage.getItem('tbMode')==='pro')set(true)}}catch(e){{}}
  var nav=document.getElementById('nav');addEventListener('scroll',function(){{nav.classList.toggle('scrolled',scrollY>90)}},{{passive:true}});
  var NS='http://www.w3.org/2000/svg';
  function el(t,a,par){{var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(par)par.appendChild(e);return e}}
  function tx(par,x,y,s,o){{o=o||{{}};var e=el('text',{{x:x,y:y,'font-size':o.fs||11,fill:o.fill||'var(--label2)','text-anchor':o.anchor||'middle','font-weight':o.fw||400,'font-family':'Be Vietnam Pro,-apple-system,sans-serif'}},par);e.textContent=s;return e}}
  function f(n){{return Math.round(n).toLocaleString('vi-VN')}}
  function nice(m){{var p=Math.pow(10,Math.floor(Math.log10(m))),r=m/p;return (r<=1?1:r<=2?2:r<=2.5?2.5:r<=5?5:10)*p}}
  // lợi nhuận
  (function(){{var L=S.profit.labels,v=S.profit.vals,s=document.getElementById('profitChart'),W=640,H=250,l=56,r=8,T=20,B=30;
    var mx=Math.max.apply(null,v.concat([0])),mn=Math.min.apply(null,v.concat([0])),st=nice((mx-mn)/4||1),hi=Math.ceil(mx/st)*st,lo=Math.floor(mn/st)*st;
    var y=function(a){{return T+(H-T-B)*(hi-a)/(hi-lo)}};
    for(var g=lo;g<=hi+1e-9;g+=st){{el('line',{{x1:l,x2:W-r,y1:y(g),y2:y(g),stroke:g===0?'var(--label3)':'var(--sep)'}},s);tx(s,l-8,y(g)+4,f(g),{{anchor:'end'}})}}
    var bw=(W-l-r)/L.length;L.forEach(function(lb,i){{var x0=l+i*bw+bw*.22,w=bw*.56,a=v[i],top=y(Math.max(a,0)),h=Math.abs(y(a)-y(0));
      el('rect',{{x:x0,y:top,width:w,height:Math.max(h,1.5),rx:5,fill:a<0?'var(--red)':'var(--blue)','fill-opacity':i===L.length-1?1:.6}},s);
      tx(s,x0+w/2,a<0?y(a)+14:y(a)-6,f(a),{{fill:'var(--label)',fs:10.5,fw:600}});tx(s,x0+w/2,H-10,lb)}})}})();
  // giá tuần
  (function(){{var c=S.weekly,N=c.length,s=document.getElementById('priceChart'),W=640,H=270,l=58,r=60,T=14,B=26;
    function ma(n){{return c.map(function(_,i){{if(i<n-1)return null;var t=0;for(var j=i-n+1;j<=i;j++)t+=c[j];return t/n}})}}
    var m10=ma(10),m40=ma(40),mx=Math.max.apply(null,c),mn=Math.min.apply(null,c),st=nice((mx-mn)/4),hi=Math.ceil(mx/st)*st,lo=Math.floor(mn/st)*st;
    var X=function(i){{return l+(W-l-r)*i/(N-1)}},Y=function(a){{return T+(H-T-B)*(hi-a)/(hi-lo)}};
    for(var g=lo;g<=hi+1e-9;g+=st){{el('line',{{x1:l,x2:W-r,y1:Y(g),y2:Y(g),stroke:'var(--sep)'}},s);tx(s,l-8,Y(g)+4,f(g),{{anchor:'end'}})}}
    [[0,'8/2025'],[20,'1/2026'],[39,'6/2026'],[N-1,'10/2026']].forEach(function(t){{tx(s,X(t[0]),H-6,t[1])}});
    var up=c[N-1]>=c[0],col=up?'var(--green)':'var(--red)';
    var g2=el('linearGradient',{{id:'pg',x1:0,x2:0,y1:0,y2:1}},el('defs',{{}},s));el('stop',{{offset:'0','stop-color':col,'stop-opacity':.18}},g2);el('stop',{{offset:'1','stop-color':col,'stop-opacity':0}},g2);
    var d=c.map(function(a,i){{return(i?'L':'M')+X(i).toFixed(1)+' '+Y(a).toFixed(1)}}).join('');
    el('path',{{d:d+'L'+X(N-1)+' '+Y(lo)+'L'+X(0)+' '+Y(lo)+'Z',fill:'url(#pg)'}},s);
    function line(a,cl,w){{var dd='';a.forEach(function(v,i){{if(v==null)return;dd+=(dd?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)}});el('path',{{d:dd,fill:'none',stroke:cl,'stroke-width':w,'stroke-linejoin':'round'}},s)}}
    line(m40,'var(--red)',1.5);line(m10,'var(--orange)',1.5);line(c,'var(--label)',2);
    el('circle',{{cx:X(N-1),cy:Y(c[N-1]),r:4.5,fill:'var(--label)',stroke:'var(--card)','stroke-width':2}},s);
    tx(s,X(N-1)+8,Y(c[N-1])+4,f(S.price),{{anchor:'start',fill:'var(--label)',fw:700,fs:11.5}})}})();
}})();
</script>
</body>
</html>
'''
    os.makedirs(f'{BASE}/{tk.lower()}', exist_ok=True)
    open(f'{BASE}/{tk.lower()}/index.html', 'w', encoding='utf-8').write(out)
    return dict(tk=tk, name=S['name'], sector=S['sector'], price=S['price'], y1=S['y1'], m1=S['m1'], frompk=frompk, line=S['summary'][1][3])

cards=[page(tk,S) for tk,S in STOCKS.items()]
json.dump(cards, open('/tmp/claude-0/-home-claude/b65b1452-9880-550c-93a2-d4c942536f5e/scratchpad/cards3.json','w',encoding='utf-8'), ensure_ascii=False)
print([(c['tk'],round(c['y1'],3),round(c['m1'],3),round(c['frompk'],3)) for c in cards])
