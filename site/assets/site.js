/* =========================================================
   TOP BROKER · Khung dùng chung
   ---------------------------------------------------------
   MUỐN THÊM SẢN PHẨM MỚI:
     1. Thêm 1 dòng vào TB.PRODUCTS bên dưới.
     2. Tạo thư mục + trang index.html cho sản phẩm đó,
        trong trang có:  <body data-root="../" data-page="id">
                         <div id="tb-top"></div> ... <div id="tb-foot"></div>
                         <script src="../assets/site.js"></script>
     Menu, trang chủ và chân trang tự cập nhật.
   MUỐN CẬP NHẬT THANH CHỈ SỐ: sửa TB.TICKER.
   ========================================================= */
(function(){
var TB = window.TB = {};

TB.UPDATED = 'Thứ Bảy, 17/10/2026 · 21:00';

/* status: 'live' = đang chạy, 'soon' = sắp ra mắt */
TB.PRODUCTS = [
  {id:'radar',   name:'Radar tin nóng',            group:'Tin tức & vĩ mô', status:'live', href:'radar/index.html', icon:'radar', tint:['#FF6A5C','#D9302A'], short:'Radar',
   desc:'Tin chuẩn và tin mạng xã hội tách bạch, theo sát động thái bơm hút tiền của Ngân hàng Nhà nước.', nav:'Radar'},
  {id:'giai-ma', name:'Giải mã cổ phiếu',          group:'Phân tích',       status:'live', href:'co-phieu/index.html', icon:'chart', tint:['#5AA5FF','#1F6FD1'], short:'Cổ phiếu',
   desc:'Đọc doanh nghiệp bằng tiếng dễ hiểu, kèm những rủi ro ít người nói. Đang có 16 mã: HPG, VPB, VIC, FPT, PNJ, VIX, SHB, MSB, NVL, MWG, BSR, SSI, TCB, GEX, PDR, VCG.', nav:'Cổ phiếu'},
  {id:'bac-si',  name:'Bác sĩ danh mục',           group:'Quản lý tài sản', status:'live', href:'bac-si-danh-muc/index.html', icon:'pulse', tint:['#3FC79A','#128A63'], short:'Bác sĩ',
   desc:'Khám danh mục, làm rõ hoàn cảnh, so sánh phương án và chốt kế hoạch. Cuối buổi có AI tổng kết bằng lời dễ hiểu.', nav:'Bác sĩ danh mục', hot:'MUST TRY'},
  {id:'giai-ngo',name:'Giải ngố chứng khoán',      group:'Học đầu tư',      status:'live', href:'giai-ngo/index.html', icon:'tea', tint:['#FFB24D','#F0760F'], short:'Giải ngố',
   desc:'Kiến thức đầu tư kiểu trà đá vỉa hè: dễ nghe, dễ hiểu, cầm tay chỉ việc. Kèm Từ điển chứng khoán vỉa hè.', nav:'Giải ngố'},
  {id:'tu-dien', name:'Từ điển chứng khoán vỉa hè', group:'Học đầu tư',   status:'live', href:'giai-ngo/tu-dien/index.html', icon:'book', tint:['#9480F5','#5A3FC8'], short:'Từ điển',
   desc:'Đu đỉnh, úp bô, lùa gà… giải nghĩa từng từ, kèm câu dùng thật.', nav:null},
  {id:'loc',     name:'Bộ lọc dòng tiền',          group:'Phân tích',       status:'soon', href:'sap-ra-mat/index.html#loc', icon:'filter', short:'Bộ lọc',
   desc:'Lọc cổ phiếu theo khối lượng, MACD, RSI, ADX và các đường trung bình.', nav:'Bộ lọc'},
  {id:'lich',    name:'Lịch sự kiện & cổ tức',     group:'Tin tức & vĩ mô', status:'soon', href:'sap-ra-mat/index.html#lich', icon:'cal', short:'Lịch',
   desc:'Ngày chốt quyền, trả cổ tức, họp ĐHCĐ, công bố KQKD của các mã anh quan tâm.', nav:'Lịch'},
  {id:'game',    name:'Webgame Top Broker',        group:'Giải trí',        status:'live', href:'https://game.topbroker.fun', icon:'game', tint:['#8A6CFF','#3B22C4'], short:'Webgame',
   desc:'Nghỉ tay vài phút, chơi một ván. Game mở ở trang riêng game.topbroker.fun.', nav:'Webgame'}
];

/* Thanh chỉ số: [nhãn, giá trị, thay đổi, chiều u/d/n, ghi chú thời điểm] */
TB.TICKER = [
  ['VN-Index','1.705,91','+0,45%','u','16/10'],
  ['VN30','1.855,41','+0,63%','u','16/10'],
  ['HOSE tăng/giảm','162 / 133','','u','16/10'],
  ['Khối ngoại HOSE','−515 tỷ','','d','16/10'],
  ['Qua đêm LNH','3,10%','−0,40','d','15/10'],
  ['Tỷ giá trung tâm','25.637','−5','d','16/10'],
  ['NHNN tuần 12–16/10','bơm ròng 8.189 tỷ','','u','16/10'],
  ['OMO lưu hành','104.933 tỷ','','n','16/10'],
  ['Tàu qua Hormuz','2 chuyến','thường 85/ngày','d','11/10'],
  ['Mục tiêu GDP 2027','≥10%','CPI ~4,5%','n','17/10'],
  ['GDP quý 3/2026','+9,95%','','u','17/10'],
  ['HPG','20.900','+0,72%','u','16/10'],
  ['SHB LNTT 9T','~14.300 tỷ','+17%','u','15/10'],
  ['ABBank LNTT 9T','~4.540 tỷ','+97%','u','17/10'],
  ['Thanh khoản HOSE TB tuần','11.212 tỷ','−13,3%','d','16/10'],
  ['HNX','259,13','−0,06%','d','16/10'],
  ['UPCoM','124,87','+0,58%','u','16/10'],
  ['S&P 500','7.659,44','−1,09%','d','16/10'],
  ['Dow Jones','52.002,41','−0,34%','d','16/10'],
  ['Nasdaq','26.140,03','−2,14%','d','16/10'],
  ['VIX','20,22','+23%','d','16/10'],
  ['Nikkei 225','65.324,29','+1,39%','u','16/10'],
  ['Hang Seng','24.186,83','+0,52%','u','16/10'],
  ['KOSPI','5.668,05','+2,05%','u','16/10'],
  ['FTSE 100','10.881,90','+0,38%','u','16/10'],
  ['Vàng','4.167,9','−0,05%','d','16/10'],
  ['Brent','109,86','+3,72%','u','16/10'],
  ['WTI','101,41','+3,5%','u','16/10'],
  ['BTC','81.507','−0,72%','d','17/10'],
  ['ETH','2.425','−0,80%','d','17/10'],
  ['Xác suất Fed tăng lãi T10','15%','từ 27%','u','17/10'],
  ['TPCP 10 năm','4,46%','','n','15/10'],
  ['Lãi HĐ bình quân','6,46%','','n','30/9']
];

var body = document.body, root = body.getAttribute('data-root') || '', page = body.getAttribute('data-page') || '';
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
TB.url = function(h){return /^https?:/.test(h) ? h : root + h};

/* Biểu tượng ứng dụng kiểu iOS cho từng sản phẩm (nét trắng trên nền gradient) */
TB.GLYPH = {
  radar:'<circle cx="12" cy="12" r="2.3" fill="#fff" stroke="none"/><path d="M8 16a5.7 5.7 0 0 1 0-8M16 8a5.7 5.7 0 0 1 0 8M5.1 18.9a9.8 9.8 0 0 1 0-13.8M18.9 5.1a9.8 9.8 0 0 1 0 13.8"/>',
  chart:'<path d="M6 19v-6M12 19V6M18 19v-9" stroke-width="3.4"/>',
  tea:'<path d="M5 10h11v3a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 11h1.3a2.4 2.4 0 0 1 0 4.8H15.6M9 4.5v2.5M12.5 4.5v2.5"/>',
  book:'<path d="M5.5 5.5A2 2 0 0 1 7.5 4H18v13H7.5a2 2 0 0 0-2 2zM5.5 19a2 2 0 0 0 2 1.5H18"/>',
  game:'<rect x="3" y="7.5" width="18" height="10" rx="5"/><path d="M8.2 10.5v4M6.2 12.5h4"/><circle cx="15.3" cy="11.3" r=".9" fill="#fff"/><circle cx="17.3" cy="13.6" r=".9" fill="#fff"/>',
  pulse:'<path d="M3 12.5h4l2.2-5 4 10 2.3-5H21"/>',
  filter:'<path d="M4 5.5h16l-6 7.3v5.7l-4-2v-3.7z"/>',
  "case":'<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V5.5h6v2M3.5 12.5h17"/>',
  cal:'<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10.5h16M9 3.5v4M15 3.5v4"/>'
};
TB.appIcon = function(p){
  var t = p.status==='live' && p.tint ? p.tint : ['#CFC8BA','#A79F90'], gid='ai-'+p.id;
  return '<svg class="tb-app" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+t[0]+'"/><stop offset="1" stop-color="'+t[1]+'"/></linearGradient></defs>'+
    '<path d="M30 0H70C89.5 0 100 10.5 100 30V70C100 89.5 89.5 100 70 100H30C10.5 100 0 89.5 0 70V30C0 10.5 10.5 0 30 0Z" fill="url(#'+gid+')"/>'+
    '<g transform="translate(22 22) scale(2.33)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(TB.GLYPH[p.icon]||'')+'</g></svg>';
};

/* Logo A: biểu tượng iOS nến tăng */
TB.LOGO = '<svg class="tb-mark" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="tbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9A4A"/><stop offset="1" stop-color="#E4500A"/></linearGradient></defs><path d="M30 0H70C89.5 0 100 10.5 100 30V70C100 89.5 89.5 100 70 100H30C10.5 100 0 89.5 0 70V30C0 10.5 10.5 0 30 0Z" fill="url(#tbg)"/><rect x="26" y="52" width="12" height="24" rx="4" fill="#fff" fill-opacity=".72"/><rect x="44" y="40" width="12" height="36" rx="4" fill="#fff" fill-opacity=".86"/><rect x="62" y="26" width="12" height="50" rx="4" fill="#fff"/></svg>';

/* Nhãn trên dải chữ chạy → mã giá tự cập nhật (xem /api/quotes) */
TB.LIVEMAP = {'VN-Index':'VNINDEX','VN30':'VN30','HNX':'HNX','HNX-Index':'HNX','UPCoM':'UPCOM','S&P 500':'GSPC','Dow Jones':'DJI','Nasdaq':'IXIC','VIX':'VIX',
  'Nikkei 225':'N225','Hang Seng':'HSI','KOSPI':'KS11','FTSE 100':'FTSE','Vàng':'GOLD','Brent':'BRENT','WTI':'WTI','BTC':'BTC','ETH':'ETH'};

function header(){
  var nav = '<a href="'+TB.url('index.html')+'"'+(page==='home'?' aria-current="page"':'')+'>Trang chủ</a>';
  TB.PRODUCTS.forEach(function(p){
    if(!p.nav) return;
    nav += '<a href="'+TB.url(p.href)+'"'+(page===p.id?' aria-current="page"':'')+(/^https?:/.test(p.href)?' class="tb-ext" target="_blank" rel="noopener"':'')+'>'+esc(p.nav)+(p.status==='soon'?'<span class="tb-soon">SẮP</span>':'')+(p.hot?'<span class="tb-hot">'+esc(p.hot)+'</span>':'')+'</a>';
  });
  var tick = TB.TICKER.map(function(t){
    var lk=TB.LIVEMAP[t[0]]; return '<li'+(lk?' data-q="'+lk+'"':'')+'><b>'+esc(t[0])+'</b><span class="v">'+esc(t[1])+'</span>'+(t[2]||lk?'<span class="c '+t[3]+'">'+esc(t[2])+'</span>':'')+'<span class="t">'+esc(t[4])+'</span></li>';
  }).join('');
  return '<div class="tb-in tb-bar"><a class="tb-logo" href="'+TB.url('index.html')+'">'+TB.LOGO+'Top Broker<small>ĐẦU TƯ</small></a>'+
         '<nav class="tb-nav" aria-label="Điều hướng chính">'+nav+'</nav><span class="tb-date" title="Số liệu cập nhật: '+esc(TB.UPDATED)+'"><span class="tb-live" aria-hidden="true"></span><span data-clock="full">'+esc(TB.UPDATED)+'</span></span></div>'+
         '<div class="tb-tick"><div class="tb-in"><ul aria-label="Chỉ số thị trường">'+tick+tick.replace(/<li>/g,'<li aria-hidden="true">')+'</ul></div></div>';
}

function footer(){
  var groups = {};
  TB.PRODUCTS.forEach(function(p){(groups[p.group]=groups[p.group]||[]).push(p)});
  var cols = Object.keys(groups).map(function(g){
    return '<div><h4>'+esc(g)+'</h4><ul>'+groups[g].map(function(p){
      return '<li><a href="'+TB.url(p.href)+'"'+(/^https?:/.test(p.href)?' target="_blank" rel="noopener"':'')+'>'+esc(p.name)+'</a> <span class="tb-pill '+p.status+'">'+(p.status==='live'?'Đang chạy':'Sắp có')+'</span></li>'}).join('')+'</ul></div>';
  }).join('');
  return '<div class="tb-in"><div class="tb-brand"><a class="tb-logo" href="'+TB.url('index.html')+'">'+TB.LOGO+'Top Broker</a>'+
    '<p class="tb-slogan">Chứng khoán không lấy tiền của người nghèo.<br>Nó lấy tiền của người <em>lười đọc</em>.</p><p class="tb-sub">Top Broker đọc hộ các bác. Còn nút bán thì các bác tự bấm.</p></div>'+cols+
    '<p class="tb-legal">Thông tin trên website mang tính tham khảo và giáo dục, không phải khuyến nghị mua bán chứng khoán. Dữ liệu thị trường: TCBS. Tin tức: các nguồn được ghi rõ trên từng bài. © 2026 Top Broker · topbroker.fun</p></div>';
}

var top = document.getElementById('tb-top'), foot = document.getElementById('tb-foot');
if(top){top.className='tb-top';top.setAttribute('role','banner');top.innerHTML=header()}
if(foot){foot.className='tb-foot';foot.innerHTML=footer()}

/* Đồng hồ chạy theo giờ Việt Nam: mọi phần tử có data-clock tự cập nhật mỗi giây
   data-clock="full"  → Thứ Sáu, 16/10/2026 · 21:11:05
   data-clock="date"  → Thứ Sáu, 16 tháng 10
   data-clock="time"  → 21:11:05
   data-clock="dateline" → Thứ Sáu, 16 tháng 10 · 21:11:05 (dòng ngày giờ trang chủ, tự ghi đè nội dung cũ) */
TB.now = function(){
  var d = new Date(), p = {};
  try{
    new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})
      .formatToParts(d).forEach(function(x){p[x.type]=x.value});
  }catch(_){ var v=new Date(d.getTime()+(d.getTimezoneOffset()+420)*60000);
    p={weekday:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][v.getDay()],day:('0'+v.getDate()).slice(-2),month:('0'+(v.getMonth()+1)).slice(-2),year:''+v.getFullYear(),
       hour:('0'+v.getHours()).slice(-2),minute:('0'+v.getMinutes()).slice(-2),second:('0'+v.getSeconds()).slice(-2)} }
  var wd = {Mon:'Thứ Hai',Tue:'Thứ Ba',Wed:'Thứ Tư',Thu:'Thứ Năm',Fri:'Thứ Sáu',Sat:'Thứ Bảy',Sun:'Chủ Nhật'}[p.weekday];
  var h = p.hour==='24'?'00':p.hour, t = h+':'+p.minute+':'+p.second;
  var dt = wd+', '+(+p.day)+' tháng '+(+p.month);
  return {full: wd+', '+p.day+'/'+p.month+'/'+p.year+' · '+t, date: dt, time: t, dateline: dt+' · '+t};
};
function tbTick(){
  var n = TB.now(), els = document.querySelectorAll('[data-clock]');
  for(var i=0;i<els.length;i++){ var k=els[i].getAttribute('data-clock'); if(n[k] && els[i].textContent!==n[k]) els[i].textContent=n[k]; }
}
tbTick(); setInterval(tbTick, 1000);

/* Webgame: bấm vào là bật hẳn một cửa sổ riêng (máy tính); điện thoại thì mở tab mới */
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a[href*="game.topbroker.fun"]');
  if(!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
  a.target = '_blank'; a.rel = 'noopener';
  if(window.innerWidth < 760) return;
  var w = Math.min(1280, screen.availWidth - 80), h = Math.min(820, screen.availHeight - 80),
      l = Math.max(0, (screen.availWidth - w) / 2), t = Math.max(0, (screen.availHeight - h) / 2);
  var win = window.open(a.href, 'tbgame', 'popup=yes,width='+w+',height='+h+',left='+l+',top='+t);
  if(win){ try{win.opener=null}catch(_){} win.focus(); e.preventDefault(); }
  /* trình duyệt chặn cửa sổ bật lên thì để link tự mở tab mới như bình thường */
}, true);

/* Giá tự cập nhật: mọi phần tử có data-q="MÃ" nhận giá mới mỗi 30 giây.
   Trong phần tử: .v hoặc <b> = giá, .c hoặc <em> = % thay đổi, .n span hoặc .t = giờ của giá.
   Chỉ số Việt Nam trễ 15 phút; lỗi mạng thì giữ nguyên số tĩnh có sẵn. */
TB.LIVE = {
  dec: {VNINDEX:2,VN30:2,HNX:2,UPCOM:2,DJI:2,IXIC:2,GSPC:2,VIX:2,N225:2,HSI:2,KS11:2,FTSE:2,GOLD:1,BRENT:2,WTI:2,BTC:0,ETH:0},
  inverse: {VIX:1}
};
function tbNum(v,d){ try{ return v.toLocaleString('vi-VN',{minimumFractionDigits:d,maximumFractionDigits:d}) }catch(_){ return v.toFixed(d) } }
function tbPct(c){ if(c==null||isNaN(c)) return ''; var a=Math.abs(c).toFixed(2).replace('.',','); return (c>0?'+':c<0?'\u2212':'')+a+'%' }
function tbHM(ts){ var d=new Date((ts+7*3600)*1000); return ('0'+d.getUTCHours()).slice(-2)+':'+('0'+d.getUTCMinutes()).slice(-2) }
function tbDM(ts){ var d=new Date((ts+7*3600)*1000); return ('0'+d.getUTCDate()).slice(-2)+'/'+('0'+(d.getUTCMonth()+1)).slice(-2) }
function tbApply(data){
  var q=data&&data.q||{}, els=document.querySelectorAll('[data-q]'), today=tbDM(Date.now()/1000), n=0;
  for(var i=0;i<els.length;i++){
    var el=els[i], k=el.getAttribute('data-q'), x=q[k]; if(!x||x.p==null) continue; n++;
    var d=TB.LIVE.dec[k]==null?2:TB.LIVE.dec[k], v=el.querySelector('.v')||el.querySelector('b:not(:first-child)')||el.querySelector('b'),
        c=el.querySelector('.c')||el.querySelector('em'), t=el.querySelector('.n span')||el.querySelector('.t');
    if(el.tagName==='LI'){ v=el.querySelector('.v'); }
    var nv=tbNum(x.p,d);
    if(v&&v.textContent!==nv){ var up=parseFloat(v.textContent.replace(/\./g,'').replace(',','.'))<x.p; v.textContent=nv;
      el.classList.remove('tb-fu','tb-fd'); void el.offsetWidth; el.classList.add(up?'tb-fu':'tb-fd'); }
    if(c&&x.c!=null){ var good=TB.LIVE.inverse[k]?x.c<0:x.c>0, bad=TB.LIVE.inverse[k]?x.c>0:x.c<0;
      c.textContent=tbPct(x.c);
      if(el.tagName==='LI'){ c.className='c '+(x.c>0?'u':x.c<0?'d':'n'); } else { c.classList.remove('up','dn','wn'); c.classList.add(good?'up':bad?'dn':'wn'); } }
    if(t&&x.t){ var dm=tbDM(x.t); t.textContent=(dm===today?tbHM(x.t):dm); }
    el.setAttribute('data-open', x.open?'1':'0');
  }
  var st=document.getElementById('tb-live-st');
  if(st&&n){ st.hidden=false; st.querySelector('span').textContent=tbHM(Date.now()/1000); }
}
function tbFetch(){
  if(document.hidden) return;
  var url=(location.protocol==='file:'?'https://topbroker.fun':'')+'/api/quotes';
  fetch(url,{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){ if(j) tbApply(j) }).catch(function(){});
}
if(document.querySelector('[data-q]')){ tbFetch(); setInterval(tbFetch,30000); document.addEventListener('visibilitychange',function(){ if(!document.hidden) tbFetch() }); }

/* tiện ích vẽ sparkline dùng chung */
TB.spark = function(svg, v, opt){
  opt=opt||{}; var NS='http://www.w3.org/2000/svg', vb=svg.viewBox.baseVal, W=vb.width, H=vb.height;
  var lo=Math.min.apply(null,v), hi=Math.max.apply(null,v), pad=(hi-lo)*.12||1; lo-=pad; hi+=pad;
  var X=function(i){return 2+(W-4)*i/(v.length-1)}, Y=function(a){return 4+(H-8)*(1-(a-lo)/(hi-lo))};
  var col = opt.color || (v[v.length-1]>=v[0]?'var(--tb-up)':'var(--tb-dn)');
  var d=v.map(function(a,i){return(i?'L':'M')+X(i).toFixed(1)+' '+Y(a).toFixed(1)}).join('');
  function el(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);svg.appendChild(e);return e}
  el('path',{d:d+'L'+X(v.length-1)+' '+H+'L'+X(0)+' '+H+'Z',fill:col,'fill-opacity':.1});
  el('path',{d:d,fill:'none',stroke:col,'stroke-width':opt.w||1.8,'stroke-linejoin':'round'});
  el('circle',{cx:X(v.length-1),cy:Y(v[v.length-1]),r:3,fill:col});
};
})();
