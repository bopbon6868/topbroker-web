# -*- coding: utf-8 -*-
import json, os, re, html as H
from lessons_a import L as LA
from lessons_b import L as LB
LS = {**LA, **LB}
js = open('site/assets/giai-ngo.js', encoding='utf-8').read()
# lấy tiêu đề, chặng, phút từ giai-ngo.js
meta = {}
for m in re.finditer(r"\{n:(\d+),\s*s:(\d),\s*status:'(\w+)',\s*min:(\d),\s*t:'(.*?)',\s*q:'(.*?)'\}", js):
    meta[int(m.group(1))] = dict(s=int(m.group(2)), min=int(m.group(4)), t=m.group(5))
STAGE = {1:'Vỡ lòng',2:'Mở hàng',3:'Đọc vị',4:'Giữ tiền',5:'Tâm lý',6:'Kênh khác & nâng cao'}
LIVE_MAX = 15

def blocks(bl, n):
    out = ''
    for b in bl:
        k = b[0]
        if k == 'p': out += f'<p>{b[1]}</p>'
        elif k == 'h3': out += f'<h3>{b[1]}</h3>'
        elif k == 'aside': out += f'<p class="gn-aside">{b[1]}</p>'
        elif k == 'table':
            wide = any(len(c) > 26 or len(a) > 34 for a, c in b[1])
            out += '<div class="gn-vd"><table>' + ''.join((f'<tr class="wide"><td>{a}</td><td class="t">{c}</td></tr>' if wide else f'<tr><td>{a}</td><td>{c}</td></tr>') for a, c in b[1]) + '</table></div>'
        elif k == 'steps':
            out += '<ol class="gn-steps">' + ''.join(f'<li><b>{a}</b><span>{c}</span></li>' for a, c in b[1]) + '</ol>'
        elif k == 'check':
            items, msgs = b[1], b[2]
            out += '<div class="gn-check" data-msgs=\'' + H.escape(json.dumps(msgs, ensure_ascii=False), quote=True) + '\'>' + ''.join(
                f'<label><input type="checkbox" id="c{n}_{i}"> {it}</label>' for i, it in enumerate(items)) + '<div class="gn-res" aria-live="polite">Chưa đánh dấu câu nào.</div></div>'
        elif k == 'calc':
            out += CALC[b[1]]
    return out

CALC = {
 'compound': '''<div class="gn-calc" data-calc="compound">
  <label for="cA"><span>Số tiền ban đầu <output id="oA">100 triệu</output></span><input type="range" id="cA" min="10" max="2000" step="10" value="100"></label>
  <label for="cR"><span>Lãi suất mỗi năm <output id="oR">7%</output></span><input type="range" id="cR" min="1" max="20" step="0.5" value="7"></label>
  <label for="cY"><span>Số năm <output id="oY">10 năm</output></span><input type="range" id="cY" min="1" max="30" step="1" value="10"></label>
  <div class="gn-out"><div><small>Sau thời gian đó</small><b id="rV">—</b></div><div><small>Tiền lãi tích lũy</small><b id="rI" class="pos">—</b></div><div><small>Gấp đôi sau khoảng</small><b id="rD">—</b></div></div>
  <p class="note">Giả định lãi được nhập gốc mỗi năm và lãi suất không đổi. Chưa trừ thuế, phí và lạm phát.</p></div>''',
 'recover': '''<div class="gn-calc" data-calc="recover">
  <label for="cL"><span>Mức lỗ hiện tại <output id="oL">20%</output></span><input type="range" id="cL" min="1" max="95" step="1" value="20"></label>
  <div class="gn-out"><div><small>Cần tăng để hòa vốn</small><b id="rN" class="neg">—</b></div><div><small>100 triệu còn lại</small><b id="rL">—</b></div></div>
  <p class="note">Chưa tính phí giao dịch và thuế khi bán.</p></div>''',
 'margin': '''<div class="gn-calc" data-calc="margin">
  <label for="cM"><span>Vay thêm so với vốn tự có <output id="oM">100%</output></span><input type="range" id="cM" min="0" max="150" step="10" value="100"></label>
  <label for="cP"><span>Giá cổ phiếu thay đổi <output id="oP">−20%</output></span><input type="range" id="cP" min="-60" max="60" step="5" value="-20"></label>
  <div class="gn-out"><div><small>Vốn 100 triệu còn</small><b id="rE">—</b></div><div><small>Lời / lỗ trên vốn</small><b id="rP">—</b></div><div><small>Không vay thì</small><b id="rU">—</b></div></div>
  <p class="note">Chưa tính lãi vay, phí và khả năng bị bán giải chấp giữa chừng.</p></div>'''
}

TPL = open('site/giai-ngo/bai-01/index.html', encoding='utf-8').read()
HEAD = TPL[:TPL.index('<title>')]
HEADREST = TPL[TPL.index('</title>')+8:TPL.index('<body')]
HEADREST = re.sub(r'<meta name="description" content=".*?">', '', HEADREST)

SCRIPT = r'''<script>
(function(){
  [].forEach.call(document.querySelectorAll('.gn-check'),function(box){
    var msgs=JSON.parse(box.getAttribute('data-msgs')),inp=[].slice.call(box.querySelectorAll('input')),res=box.querySelector('.gn-res'),N=inp.length;
    function u(){var n=inp.filter(function(i){return i.checked}).length;res.className='gn-res';
      if(!n){res.textContent='Chưa đánh dấu câu nào.';return}
      if(n===N){res.classList.add('g');res.textContent=msgs[0]}else if(n>=Math.ceil(N/2)){res.classList.add('y');res.textContent=n+'/'+N+': '+msgs[1]}else{res.classList.add('r');res.textContent=n+'/'+N+': '+msgs[2]}}
    inp.forEach(function(i){i.addEventListener('change',u)})});
  function f(x,d){return x.toLocaleString('vi-VN',{maximumFractionDigits:d||0})}
  function $(id){return document.getElementById(id)}
  var c=document.querySelector('[data-calc="compound"]');if(c){var u=function(){var A=+$('cA').value,R=+$('cR').value,Y=+$('cY').value,V=A*Math.pow(1+R/100,Y);
    $('oA').textContent=f(A)+' triệu';$('oR').textContent=f(R,1)+'%';$('oY').textContent=Y+' năm';$('rV').textContent=f(V,1)+' triệu';$('rI').textContent='+'+f(V-A,1)+' triệu';$('rD').textContent=f(Math.log(2)/Math.log(1+R/100),1)+' năm'};
    ['cA','cR','cY'].forEach(function(i){$(i).addEventListener('input',u)});u()}
  var r=document.querySelector('[data-calc="recover"]');if(r){var v=function(){var L=+$('cL').value;$('oL').textContent=L+'%';$('rN').textContent='+'+f(L/(100-L)*100,1)+'%';$('rL').textContent=f(100-L)+' triệu'};$('cL').addEventListener('input',v);v()}
  var m=document.querySelector('[data-calc="margin"]');if(m){var w=function(){var M=+$('cM').value/100,P=+$('cP').value/100,E=100*(1+M)*(1+P)-100*M,pc=E/100-1;
    $('oM').textContent=f(M*100)+'%';$('oP').textContent=(P>0?'+':P<0?'−':'')+f(Math.abs(P*100))+'%';
    $('rE').textContent=E<=0?'0 (mất trắng)':f(E,1)+' triệu';$('rE').className=E<100?'neg':'pos';
    $('rP').textContent=(pc>=0?'+':'−')+f(Math.abs(Math.max(pc,-1))*100,1)+'%';$('rP').className=pc<0?'neg':'pos';
    $('rU').textContent=(P>=0?'+':'−')+f(Math.abs(P*100))+'%'};$('cM').addEventListener('input',w);$('cP').addEventListener('input',w);w()}
  [].forEach.call(document.querySelectorAll('.gn-quiz'),function(qz){var Q=JSON.parse(qz.getAttribute('data-q'));
    Q.forEach(function(q,i){var d=document.createElement('div');d.className='gn-qz';var p=document.createElement('p');p.textContent=(i+1)+'. '+q[0];d.appendChild(p);
      var ex=document.createElement('div');ex.className='ex';ex.hidden=true;ex.textContent=q[3];
      q[1].forEach(function(o,j){var b=document.createElement('button');b.type='button';b.textContent=o;b.onclick=function(){[].forEach.call(d.querySelectorAll('button'),function(x){x.classList.remove('ok','no')});b.classList.add(j===q[2]?'ok':'no');if(j!==q[2])d.querySelectorAll('button')[q[2]].classList.add('ok');ex.hidden=false};d.appendChild(b)});
      d.appendChild(ex);qz.appendChild(d)})});
  var cb=document.getElementById('copyZ');if(cb)cb.onclick=function(){var done=function(){cb.textContent='Đã chép'};
    function sel(){var rg=document.createRange();rg.selectNodeContents(document.getElementById('zalo'));var s=getSelection();s.removeAllRanges();s.addRange(rg);cb.textContent='Đã chọn số'}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText('0939660996').then(done,sel)}else sel()};
})();
</script>'''

def nav(n):
    prv = meta.get(n-1); nxt = meta.get(n+1)
    a = f'<a href="../bai-{n-1:02d}/index.html"><small>Bài {n-1}</small>{prv["t"]}</a>' if prv else '<a href="../index.html"><small>Mục lục</small>Giải ngố chứng khoán</a>'
    if nxt and n+1 <= LIVE_MAX: b = f'<a class="r" href="../bai-{n+1:02d}/index.html"><small>Bài {n+1}</small>{nxt["t"]}</a>'
    elif nxt: b = f'<span class="r"><small>Bài {n+1} · đang viết</small>{nxt["t"]}</span>'
    else: b = '<a class="r" href="../index.html"><small>Mục lục</small>Giải ngố chứng khoán</a>'
    return a + b

for n, D in sorted(LS.items()):
    M = meta[n]
    t3, tb = D['tra']; v3, vb = D['vd']; c3, cbk = D['ctv']
    traps = ''.join(f'<li><b>{a}</b>{b}</li>' for a, b in D['traps'])
    page = HEAD + f'<title>{M["t"]} · Giải ngố chứng khoán</title>\n<meta name="description" content="Bài {n} Giải ngố chứng khoán: {H.escape(M["t"])}">' + HEADREST + f'''<body data-root="../../" data-page="giai-ngo">
<div id="tb-top"></div>
<nav class="gn-crumb" aria-label="Đường dẫn"><a href="../../index.html">Trang chủ</a> / <a href="../index.html">Giải ngố chứng khoán</a> / Bài {n}</nav>
<article class="gn-art">
  <header style="display:flex;flex-direction:column;gap:14px">
    <div class="gn-meta"><b>Chặng {M["s"]} · {STAGE[M["s"]]}</b><span>Bài {n}/20</span><span>Đọc {M["min"]} phút</span></div>
    <h1>{M["t"]}</h1>
    <div class="gn-q"><small>Câu hỏi ngố</small>{D["q"]}</div>
  </header>
  <section class="gn-sec"><h2>Trà đá</h2><h3>{t3}</h3>{blocks(tb, n)}</section>
  <section class="gn-sec"><h2>Ví dụ bằng tiền thật</h2><h3>{v3}</h3>{blocks(vb, n)}</section>
  <section class="gn-sec"><h2>Cầm tay chỉ việc</h2><h3>{c3}</h3>{blocks(cbk, n)}</section>
  <section class="gn-sec"><h2>Bẫy hay gặp</h2><ul class="gn-trap">{traps}</ul></section>
  <p class="gn-nho">{D["nho"]}</p>
  <section class="gn-sec"><h2>Đố vui 30 giây</h2><div class="gn-quiz" data-q='{H.escape(json.dumps(D["quiz"], ensure_ascii=False), quote=True)}'></div></section>
  <aside class="gn-cta"><div><b>Còn ngố chỗ nào?</b><p>Nhắn Zalo hỏi thẳng. Không mất phí, không bị lùa, không phải vào nhóm VIP.</p></div><div class="gn-zalo"><span id="zalo">0939 660 996</span><button id="copyZ" type="button">Chép số</button></div></aside>
  <nav class="gn-nav" aria-label="Bài trước và sau">{nav(n)}</nav>
  <p class="gn-legal">Bài viết mang tính giáo dục, không phải khuyến nghị mua bán chứng khoán. Quy định giao dịch, phí và thuế có thể thay đổi; hãy kiểm tra với công ty chứng khoán của bạn. Số liệu doanh nghiệp lấy từ TCBS ngày 15/10/2026.</p>
</article>
<div id="tb-foot"></div>
<script src="../../assets/site.js"></script>
{SCRIPT}
</body>
</html>
'''
    os.makedirs(f'site/giai-ngo/bai-{n:02d}', exist_ok=True)
    open(f'site/giai-ngo/bai-{n:02d}/index.html', 'w', encoding='utf-8').write(page)

# cập nhật trạng thái + điều hướng bài 1
for n in range(2, LIVE_MAX+1):
    js = re.sub(r"(\{n:%d,\s*s:\d,\s*status:)'soon'" % n, r"\1'live'", js)
open('site/assets/giai-ngo.js', 'w', encoding='utf-8').write(js)
b1 = open('site/giai-ngo/bai-01/index.html', encoding='utf-8').read()
b1 = b1.replace('<span class="r"><small>Bài 2 · đang viết</small>Cổ phiếu là gì? Mua một miếng của quán phở</span>',
                '<a class="r" href="../bai-02/index.html"><small>Bài 2</small>Cổ phiếu là gì? Mua một miếng của quán phở</a>')
open('site/giai-ngo/bai-01/index.html', 'w', encoding='utf-8').write(b1)
print('done', sorted(LS), js.count("status:'live'"))
