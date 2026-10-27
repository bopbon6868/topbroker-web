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

TB.UPDATED = 'Thứ Ba, 27/10/2026 · 15:00';

/* status: 'live' = đang chạy, 'soon' = sắp ra mắt */
TB.PRODUCTS = [
  {id:'radar',   name:'Radar tin nóng',            group:'Tin tức & vĩ mô', status:'live', href:'radar/index.html', icon:'radar', tint:['#FF6A5C','#D9302A'], short:'Radar',
   desc:'Tin chuẩn và tin mạng xã hội tách bạch, theo sát động thái bơm hút tiền của Ngân hàng Nhà nước.', nav:'Radar'},
  {id:'soi-ma',  name:'Soi mã theo ngành',         group:'Phân tích',       status:'live', href:'soi-ma/index.html', icon:'scale', tint:['#E0574A','#A3211B'], short:'Soi mã',
   desc:'Gõ một mã, so với 6 mã lớn nhất cùng ngành: cơ bản 3 năm, định giá, kỹ thuật và thanh khoản, kèm bảng theo mẫu phiếu thẩm định margin. Xuất Excel, PDF.', nav:'Soi mã ngành'},
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
  ['VN-Index','1.761,87','−0,10%','d','27/10'],
  ['VN30','~1.888,4','−0,06%','d','27/10'],
  ['HOSE tăng/giảm','123 / 197','','d','27/10'],
  ['Khối ngoại HOSE','−442 tỷ','bán ròng, ACB −179 tỷ','d','27/10'],
  ['NHNN phiên 26/10','hút ròng 5.064 tỷ','','d','26/10'],
  ['OMO lưu hành','90.000 tỷ','','n','26/10'],
  ['Qua đêm LNH','4,30%','','n','23/10'],
  ['Tỷ giá trung tâm','25.633','+6 đồng','u','27/10'],
  ['Lãi gửi VPBank 6–11T','6,6%','giảm theo NHNN','d','26/10'],
  ['HNX','259,50','+0,07%','u','27/10'],
  ['UPCoM','126,09','−0,15%','d','27/10'],
  ['S&P 500','7.676,80','+0,70%','u','26/10'],
  ['Dow Jones','52.361,52','+0,28%','u','26/10'],
  ['Nasdaq','26.169,38','+0,82%','u','26/10'],
  ['VIX','18,30','−5,9%','u','26/10'],
  ['Nikkei 225','63.268,37','+1,73%','u','27/10'],
  ['Hang Seng','23.041,32','−0,73%','d','27/10'],
  ['KOSPI','5.638,34','+3,1%','u','27/10'],
  ['FTSE 100','10.767,33','+0,72%','u','26/10'],
  ['Vàng','4.008','−9 USD so rạng sáng','d','13:00 27/10'],
  ['Vàng SJC','142 tr (bán)','+0,3 tr','u','chiều 27/10'],
  ['Brent','110,21','−0,5%','d','14:10 27/10'],
  ['WTI','100,66','−1,1%','d','14:10 27/10'],
  ['BTC','80.349','+0,15% 24h','u','17:39 26/10'],
  ['ETH','2.318','−0,92% 24h','d','13:11 26/10'],
  ['Tàu neo chờ quanh Hormuz','159 tàu','thường 85 lượt/ngày','d','26/10 Straits'],
  ['Xác suất Fed tăng lãi 28/10','~10%','','n','26/10'],
  ['Lợi suất TP Mỹ 10 năm','4,98%','','n','26/10'],
  ['GDP quý 3/2026','+9,95%','','u','17/10'],
  ['FDI đăng ký 9T','50,36 tỷ USD','+76,4%','u','17/10'],
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
  scale:'<path d="M12 4v16M7 20h10M5 7h14M5 7l-2.6 6.2a2.8 2.8 0 0 0 5.2 0zM19 7l-2.6 6.2a2.8 2.8 0 0 0 5.2 0z"/>',
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

/* Logo miền Tây (anh Hải duyệt 26/10/2026): bò húc lên trên đường giá tăng + chữ TOP BROKER (Playfair Display, đã chuyển thành nét) */
TB.LOGO = '<svg class="tb-mark" viewBox="0 0 300 300" aria-hidden="true"><path d="M60 0H240C285 0 300 15 300 60V240C300 285 285 300 240 300H60C15 300 0 285 0 240V60C0 15 15 0 60 0Z" fill="#211B17"/><g transform="translate(152 152) scale(0.8) translate(-140 -114)"><path d="M-6 236 L52 230 L78 238 L128 224 L156 230 L214 212 L236 216 L286 192" fill="none" stroke="#C9372C" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><g transform="rotate(-9 150 150)"><g fill="#F2E8D5"><path d="M60 102 Q40 96 34 72 Q32 60 22 52 L30 50 Q42 58 42 72 Q46 90 64 96 Z"/><path d="M22 52 L14 40 L26 46 L24 34 L32 48 Z"/><path d="M70 100 L118 76 L156 48 L186 32 L210 38 L228 54 L240 62 L256 88 L266 108 L268 118 L256 124 L240 116 L228 124 L222 144 L216 156 L242 162 L262 142 L274 142 L274 152 L252 178 L228 184 L204 172 L198 178 L204 204 L210 214 L196 216 L186 186 L178 170 L150 164 L120 160 L114 166 L108 190 L108 214 L94 214 L94 190 L98 168 L86 162 L76 170 L60 190 L42 212 L30 208 L48 182 L58 158 L54 132 L58 110Z"/><path d="M212 52 Q216 36 232 32 Q246 28 252 16 L258 4 Q260 26 246 38 Q232 46 228 58 Z"/><path d="M222 60 Q230 44 250 42 Q266 40 274 26 L284 10 Q284 34 270 50 Q256 60 244 62 L240 68 Z"/><path d="M214 64 L190 64 L206 74 Z"/></g><g fill="#211B17"><path d="M176 64 L194 92 L196 140 L188 98 Z"/><path d="M92 108 L106 128 L100 150 L100 128 Z"/><path d="M236 72 L254 82 L252 86 L236 78 Z"/><path d="M258 108 L264 110 L262 116 Z"/></g></g></g></svg>';
TB.WM = '<svg class="tb-wm" viewBox="0 0 974 100" aria-hidden="true"><path transform="translate(-3.1 98.1) scale(0.1)" fill="currentColor" d="M676 -708Q672 -649 670.5 -594.0Q669 -539 669 -510Q669 -489 670.0 -470.0Q671 -451 672 -438H649Q626 -532 593.5 -586.0Q561 -640 524.5 -662.5Q488 -685 452 -685H451V-113Q451 -72 459.5 -52.0Q468 -32 492.0 -26.0Q516 -20 562 -20V0Q527 -1 467.5 -2.0Q408 -3 343 -3Q281 -3 226.0 -2.0Q171 -1 137 0V-20Q183 -20 207.0 -26.0Q231 -32 239.5 -52.0Q248 -72 248 -113V-685H247Q211 -685 174.5 -662.5Q138 -640 106.0 -586.5Q74 -533 50 -438H27Q29 -451 29.5 -470.0Q30 -489 30 -510Q30 -539 28.5 -594.0Q27 -649 23 -708Q71 -707 129.0 -706.0Q187 -705 245.0 -705.0Q303 -705 350 -705Q397 -705 455.0 -705.0Q513 -705 571.0 -706.0Q629 -707 676 -708ZM1153.0 -722.0Q1265.9 -722.0 1350.9 -679.0Q1436.0 -636 1483.0 -555.5Q1530.0 -475 1530.0 -360Q1530.0 -248 1481.8 -164.0Q1433.7 -80.0 1348.1 -33.0Q1262.5 14.0 1151.9 14.0Q1039.0 14.0 954.0 -29.0Q869.0 -72 822.0 -153.0Q775.0 -234 775.0 -348Q775.0 -460 823.7 -544.0Q872.4 -628.0 957.4 -675.0Q1042.4 -722.0 1153.0 -722.0ZM1148.6 -704.0Q1099.0 -704 1062.0 -659.0Q1025.0 -614 1005.0 -535.0Q985.0 -456 985.0 -352Q985.0 -246 1007.7 -167.5Q1030.5 -89.0 1069.5 -46.5Q1108.5 -4.0 1155.6 -4.0Q1205.8 -4.0 1242.9 -49.0Q1280.0 -94 1300.0 -173.5Q1320.0 -253 1320.0 -356Q1320.0 -463 1296.9 -541.0Q1273.9 -619.0 1234.9 -661.5Q1196.0 -704 1148.6 -704.0ZM1634.0 -708Q1663.0 -707 1710.5 -706.0Q1758.0 -705 1806.0 -705Q1856.0 -705 1902.0 -706.0Q1948.0 -707 1967.0 -707Q2119.0 -707 2193.5 -652.0Q2268.0 -597 2268.0 -510Q2268.0 -474 2253.0 -434.5Q2238.0 -395 2202.0 -361.5Q2166.0 -328 2103.5 -307.0Q2041.0 -286 1945.0 -286H1839.0V-306H1935.0Q1986.0 -306 2012.5 -333.0Q2039.0 -360 2048.5 -404.0Q2058.0 -448 2058.0 -499Q2058.0 -594 2036.5 -641.0Q2015.0 -688 1962.0 -688Q1928.0 -688 1918.0 -671.0Q1908.0 -654 1908.0 -602V-116Q1908.0 -75 1916.5 -55.0Q1925.0 -35 1949.0 -29.0Q1973.0 -23 2019.0 -23V0Q1985.0 -1 1930.0 -2.0Q1875.0 -3 1813.0 -3Q1767.0 -3 1721.0 -2.0Q1675.0 -1 1634.0 0V-20Q1665.0 -22 1680.0 -28.0Q1695.0 -34 1700.0 -52.0Q1705.0 -70 1705.0 -106V-602Q1705.0 -639 1700.0 -656.5Q1695.0 -674 1679.5 -680.5Q1664.0 -687 1634.0 -688ZM2615.0 -708Q2644.2 -707.0 2691.6 -706.0Q2739.0 -705 2787.0 -705Q2837.1 -705.0 2882.9 -706.0Q2928.8 -707.0 2948.0 -707Q3085.0 -707 3152.0 -663.0Q3219.0 -619 3219.0 -550Q3219.0 -515 3194.0 -477.5Q3169.0 -440 3118.0 -411.5Q3067.0 -383 2988.0 -373V-371Q3091.0 -366 3153.0 -339.0Q3215.0 -312 3243.0 -273.5Q3271.0 -235 3271.0 -194Q3271.0 -127 3235.0 -84.0Q3199.0 -41 3131.7 -20.5Q3064.4 0.0 2971.0 0Q2947.0 0 2900.6 -1.5Q2854.3 -3.0 2789.0 -3Q2739.0 -3 2691.6 -2.5Q2644.2 -2.0 2615.0 0V-20Q2646.0 -22 2660.8 -28.0Q2675.7 -34.0 2680.8 -52.0Q2686.0 -70 2686.0 -106V-602Q2686.0 -639 2680.7 -656.5Q2675.5 -674.0 2660.2 -680.5Q2645.0 -687 2615.0 -688ZM2943.0 -688Q2909.4 -688.0 2899.2 -671.0Q2889.0 -654 2889.0 -602V-106Q2889.0 -71 2894.2 -53.0Q2899.4 -35.0 2913.2 -29.0Q2927.1 -23.0 2954.0 -23Q3010.0 -23.0 3035.5 -68.5Q3061.0 -114 3061.0 -198Q3061.0 -275 3024.5 -317.0Q2988.0 -359 2903.0 -359H2830.0Q2830.0 -359 2830.0 -367.5Q2830.0 -376 2830.0 -376H2916.0Q2954.9 -376.0 2976.0 -398.5Q2997.1 -421.0 3005.0 -458.5Q3013.0 -496 3013.0 -539Q3013.0 -613 2996.7 -650.5Q2980.5 -688.0 2943.0 -688ZM3359.0 -708Q3388.0 -707 3435.5 -706.0Q3483.0 -705 3531.0 -705Q3581.0 -705 3627.0 -706.0Q3673.0 -707 3692.0 -707Q3794.0 -707 3860.5 -688.0Q3927.0 -669 3960.0 -630.5Q3993.0 -592 3993.0 -533Q3993.0 -496 3978.0 -461.0Q3963.0 -426 3927.0 -397.5Q3891.0 -369 3828.5 -352.5Q3766.0 -336 3670.0 -336H3574.0V-356H3660.0Q3711.0 -356 3737.5 -378.5Q3764.0 -401 3773.5 -438.5Q3783.0 -476 3783.0 -522Q3783.0 -601 3761.5 -644.5Q3740.0 -688 3687.0 -688Q3653.0 -688 3643.0 -671.0Q3633.0 -654 3633.0 -602V-106Q3633.0 -70 3638.5 -52.0Q3644.0 -34 3659.0 -28.0Q3674.0 -22 3704.0 -20V0Q3675.0 -2 3629.5 -2.5Q3584.0 -3 3537.0 -3Q3483.0 -3 3435.5 -2.5Q3388.0 -2 3359.0 0V-20Q3390.0 -22 3405.0 -28.0Q3420.0 -34 3425.0 -52.0Q3430.0 -70 3430.0 -106V-602Q3430.0 -639 3425.0 -656.5Q3420.0 -674 3404.5 -680.5Q3389.0 -687 3359.0 -688ZM3568.0 -353Q3604.0 -352 3636.0 -349.0Q3668.0 -346 3695.0 -343.5Q3722.0 -341 3741.0 -340Q3848.0 -335 3901.5 -303.0Q3955.0 -271 3967.0 -209L3988.0 -105Q3996.0 -68 4006.0 -54.0Q4016.0 -40 4033.0 -40Q4043.0 -40 4050.0 -43.0Q4057.0 -46 4064.0 -53L4077.0 -40Q4046.0 -9 4009.5 2.5Q3973.0 14 3927.0 14Q3862.0 14 3822.0 -9.5Q3782.0 -33 3773.0 -94L3758.0 -194Q3752.0 -235 3743.0 -267.0Q3734.0 -299 3719.0 -317.5Q3704.0 -336 3678.0 -336H3570.0ZM4506.0 -722.0Q4618.9 -722.0 4703.9 -679.0Q4789.0 -636 4836.0 -555.5Q4883.0 -475 4883.0 -360Q4883.0 -248 4834.8 -164.0Q4786.7 -80.0 4701.1 -33.0Q4615.5 14.0 4504.9 14.0Q4392.0 14.0 4307.0 -29.0Q4222.0 -72 4175.0 -153.0Q4128.0 -234 4128.0 -348Q4128.0 -460 4176.7 -544.0Q4225.4 -628.0 4310.4 -675.0Q4395.4 -722.0 4506.0 -722.0ZM4501.6 -704.0Q4452.0 -704 4415.0 -659.0Q4378.0 -614 4358.0 -535.0Q4338.0 -456 4338.0 -352Q4338.0 -246 4360.7 -167.5Q4383.5 -89.0 4422.5 -46.5Q4461.5 -4.0 4508.6 -4.0Q4558.8 -4.0 4595.9 -49.0Q4633.0 -94 4653.0 -173.5Q4673.0 -253 4673.0 -356Q4673.0 -463 4649.9 -541.0Q4626.9 -619.0 4587.9 -661.5Q4549.0 -704 4501.6 -704.0ZM5698.0 -708V-689Q5664.0 -680 5622.5 -656.0Q5581.0 -632 5534.0 -579L5350.0 -370L5431.0 -476L5668.0 -81Q5681.0 -60 5694.0 -46.0Q5707.0 -32 5729.0 -20V0Q5687.0 -2 5639.5 -2.5Q5592.0 -3 5549.0 -3Q5526.0 -3 5492.0 -2.5Q5458.0 -2 5406.0 0V-20Q5453.0 -22 5460.5 -31.0Q5468.0 -40 5453.0 -65L5308.0 -310Q5298.0 -328 5290.0 -337.0Q5282.0 -346 5274.5 -350.0Q5267.0 -354 5255.0 -355V-376Q5299.0 -378 5338.0 -405.5Q5377.0 -433 5432.0 -495L5466.0 -533Q5508.0 -580 5510.5 -614.5Q5513.0 -649 5489.5 -668.5Q5466.0 -688 5428.0 -689V-708Q5456.0 -707 5480.5 -706.5Q5505.0 -706 5532.5 -705.5Q5560.0 -705 5597.0 -705Q5629.0 -705 5653.5 -706.0Q5678.0 -707 5698.0 -708ZM5332.0 -708V-688Q5302.0 -687 5286.5 -680.5Q5271.0 -674 5266.0 -656.5Q5261.0 -639 5261.0 -602V-106Q5261.0 -70 5266.5 -52.0Q5272.0 -34 5287.0 -28.0Q5302.0 -22 5332.0 -20V0Q5303.0 -2 5257.5 -2.5Q5212.0 -3 5165.0 -3Q5111.0 -3 5063.5 -2.5Q5016.0 -2 4987.0 0V-20Q5018.0 -22 5033.0 -28.0Q5048.0 -34 5053.0 -52.0Q5058.0 -70 5058.0 -106V-602Q5058.0 -639 5053.0 -656.5Q5048.0 -674 5032.5 -680.5Q5017.0 -687 4987.0 -688V-708Q5016.0 -707 5063.5 -706.0Q5111.0 -705 5165.0 -705Q5212.0 -705 5257.5 -706.0Q5303.0 -707 5332.0 -708ZM6340.0 -708Q6336.0 -658 6334.5 -611.5Q6333.0 -565 6333.0 -540Q6333.0 -519.0 6334.0 -499.9Q6335.0 -480.7 6336.0 -468H6313.0Q6301.0 -551 6273.0 -598.5Q6245.0 -646 6207.5 -665.5Q6170.0 -685 6129.0 -685H6116.0Q6090.3 -685.0 6077.1 -680.5Q6064.0 -676 6059.5 -662.8Q6055.0 -649.7 6055.0 -622V-86Q6055.0 -59 6059.5 -45.5Q6064.0 -32 6077.1 -27.5Q6090.3 -23.0 6116.0 -23H6149.0Q6182.0 -23 6218.5 -44.5Q6255.0 -66 6286.0 -118.0Q6317.0 -170 6333.0 -260H6356.0Q6353.0 -224 6353.0 -168Q6353.0 -143.0 6354.0 -96.5Q6355.0 -50 6360.0 0Q6309.0 -2 6245.0 -2.5Q6181.0 -3 6131.0 -3Q6104.3 -3.0 6062.6 -3.0Q6020.9 -3.0 5972.5 -2.5Q5924.1 -2.0 5874.5 -1.5Q5825.0 -1 5781.0 0V-20Q5812.0 -22 5826.8 -28.0Q5841.7 -34.0 5846.8 -52.0Q5852.0 -70 5852.0 -106V-602Q5852.0 -639 5846.7 -656.5Q5841.5 -674.0 5826.2 -680.5Q5811.0 -687 5781.0 -688V-708Q5825.4 -707.0 5874.7 -706.5Q5924.0 -706 5972.4 -705.5Q6020.8 -705.0 6062.6 -705.0Q6104.3 -705.0 6131.0 -705Q6177.0 -705 6235.5 -705.5Q6294.0 -706 6340.0 -708ZM6195.0 -366Q6195.0 -366 6195.0 -356.0Q6195.0 -346 6195.0 -346H6025.0Q6025.0 -346 6025.0 -356.0Q6025.0 -366 6025.0 -366ZM6224.0 -498Q6220.0 -441 6220.5 -411.0Q6221.0 -381 6221.0 -356Q6221.0 -331 6222.0 -301.0Q6223.0 -271 6227.0 -214H6204.0Q6198.0 -251 6179.5 -281.0Q6161.0 -311 6132.0 -328.5Q6103.0 -346 6065.0 -346V-366Q6093.0 -366 6116.0 -378.0Q6139.0 -390 6156.5 -410.0Q6174.0 -430 6185.5 -453.0Q6197.0 -476 6201.0 -498ZM6471.0 -708Q6500.0 -707 6547.5 -706.0Q6595.0 -705 6643.0 -705Q6693.0 -705 6739.0 -706.0Q6785.0 -707 6804.0 -707Q6906.0 -707 6972.5 -688.0Q7039.0 -669 7072.0 -630.5Q7105.0 -592 7105.0 -533Q7105.0 -496 7090.0 -461.0Q7075.0 -426 7039.0 -397.5Q7003.0 -369 6940.5 -352.5Q6878.0 -336 6782.0 -336H6686.0V-356H6772.0Q6823.0 -356 6849.5 -378.5Q6876.0 -401 6885.5 -438.5Q6895.0 -476 6895.0 -522Q6895.0 -601 6873.5 -644.5Q6852.0 -688 6799.0 -688Q6765.0 -688 6755.0 -671.0Q6745.0 -654 6745.0 -602V-106Q6745.0 -70 6750.5 -52.0Q6756.0 -34 6771.0 -28.0Q6786.0 -22 6816.0 -20V0Q6787.0 -2 6741.5 -2.5Q6696.0 -3 6649.0 -3Q6595.0 -3 6547.5 -2.5Q6500.0 -2 6471.0 0V-20Q6502.0 -22 6517.0 -28.0Q6532.0 -34 6537.0 -52.0Q6542.0 -70 6542.0 -106V-602Q6542.0 -639 6537.0 -656.5Q6532.0 -674 6516.5 -680.5Q6501.0 -687 6471.0 -688ZM6680.0 -353Q6716.0 -352 6748.0 -349.0Q6780.0 -346 6807.0 -343.5Q6834.0 -341 6853.0 -340Q6960.0 -335 7013.5 -303.0Q7067.0 -271 7079.0 -209L7100.0 -105Q7108.0 -68 7118.0 -54.0Q7128.0 -40 7145.0 -40Q7155.0 -40 7162.0 -43.0Q7169.0 -46 7176.0 -53L7189.0 -40Q7158.0 -9 7121.5 2.5Q7085.0 14 7039.0 14Q6974.0 14 6934.0 -9.5Q6894.0 -33 6885.0 -94L6870.0 -194Q6864.0 -235 6855.0 -267.0Q6846.0 -299 6831.0 -317.5Q6816.0 -336 6790.0 -336H6682.0Z"/></svg>';

/* Nhãn trên dải chữ chạy → mã giá tự cập nhật (xem /api/quotes) */
TB.LIVEMAP = {'VN-Index':'VNINDEX','VN30':'VN30','HNX':'HNX','HNX-Index':'HNX','UPCoM':'UPCOM','S&P 500':'GSPC','Dow Jones':'DJI','Nasdaq':'IXIC','VIX':'VIX',
  'Nikkei 225':'N225','Hang Seng':'HSI','KOSPI':'KS11','FTSE 100':'FTSE','Vàng':'GOLD','Brent':'BRENT','WTI':'WTI','BTC':'BTC','ETH':'ETH'};

function header(){
  /* Trang chủ đứng đầu, Bác sĩ danh mục ngay sau (anh Hải chốt 26/10/2026) */
  var nav = '', home = '<a href="'+TB.url('index.html')+'"'+(page==='home'?' aria-current="page"':'')+'>Trang chủ</a>';
  var order = [null].concat(TB.PRODUCTS.filter(function(p){return p.id==='bac-si'}), TB.PRODUCTS.filter(function(p){return p.id!=='bac-si'}));
  order.forEach(function(p){
    if(p===null){ nav += home; return; }
    if(!p.nav) return;
    nav += '<a href="'+TB.url(p.href)+'"'+(page===p.id?' aria-current="page"':'')+(/^https?:/.test(p.href)?' class="tb-ext" target="_blank" rel="noopener"':'')+'>'+esc(p.nav)+(p.status==='soon'?'<span class="tb-soon">SẮP</span>':'')+(p.hot?'<span class="tb-hot">'+esc(p.hot)+'</span>':'')+'</a>';
  });
  var tick = TB.TICKER.map(function(t){
    var lk=TB.LIVEMAP[t[0]]; return '<li'+(lk?' data-q="'+lk+'"':'')+'><b>'+esc(t[0])+'</b><span class="v">'+esc(t[1])+'</span>'+(t[2]||lk?'<span class="c '+t[3]+'">'+esc(t[2])+'</span>':'')+'<span class="t">'+esc(t[4])+'</span></li>';
  }).join('');
  return '<div class="tb-in tb-bar"><a class="tb-logo" href="'+TB.url('index.html')+'" aria-label="Top Broker – Trang chủ">'+TB.LOGO+'<span class="tb-wmb">'+TB.WM+'<small>CHỨNG KHOÁN · EST. 2026</small></span></a>'+
         '<nav class="tb-nav" aria-label="Điều hướng chính">'+nav+'</nav><span class="tb-date" title="Số liệu cập nhật: '+esc(TB.UPDATED)+'"><span class="tb-live" aria-hidden="true"></span><span data-clock="full">'+esc(TB.UPDATED)+'</span></span><span class="tb-me" id="tb-me" hidden></span></div>'+
         '<div class="tb-tick"><div class="tb-in"><ul aria-label="Chỉ số thị trường">'+tick+tick.replace(/<li>/g,'<li aria-hidden="true">')+'</ul></div></div>';
}

function footer(){
  var groups = {};
  TB.PRODUCTS.forEach(function(p){(groups[p.group]=groups[p.group]||[]).push(p)});
  var cols = Object.keys(groups).map(function(g){
    return '<div><h4>'+esc(g)+'</h4><ul>'+groups[g].map(function(p){
      return '<li><a href="'+TB.url(p.href)+'"'+(/^https?:/.test(p.href)?' target="_blank" rel="noopener"':'')+'>'+esc(p.name)+'</a> <span class="tb-pill '+p.status+'">'+(p.status==='live'?'Đang chạy':'Sắp có')+'</span></li>'}).join('')+'</ul></div>';
  }).join('');
  return '<div class="tb-in"><div class="tb-brand"><a class="tb-logo" href="'+TB.url('index.html')+'" aria-label="Top Broker – Trang chủ">'+TB.LOGO+'<span class="tb-wmb">'+TB.WM+'<small>CHỨNG KHOÁN · EST. 2026</small></span></a>'+
    '<p class="tb-slogan">Chứng khoán không lấy tiền của người nghèo.<br>Nó lấy tiền của người <em>lười đọc</em>.</p><p class="tb-sub">Top Broker đọc hộ các bác. Còn nút bán thì các bác tự bấm.</p></div>'+cols+
    '<p class="tb-legal">Thông tin trên website mang tính tham khảo và giáo dục, không phải khuyến nghị mua bán chứng khoán. Dữ liệu thị trường: TCBS. Tin tức: các nguồn được ghi rõ trên từng bài. © 2026 Top Broker · topbroker.fun</p></div>';
}

var top = document.getElementById('tb-top'), foot = document.getElementById('tb-foot');
if(top){top.className='tb-top';top.setAttribute('role','banner');top.innerHTML=header()}
if(foot){foot.className='tb-foot';foot.innerHTML=footer()}

/* Thành viên đã nhập mã (localStorage tb-member-v1, dùng chung với Bác sĩ danh mục): hiện ở góc phải đầu trang (anh Hải yêu cầu 26/10/2026) */
TB.MKEY = 'tb-member-v1';
TB.member = function(){ try{ var m = JSON.parse(localStorage.getItem(TB.MKEY)); return m && m.code ? m : null; }catch(_){ return null; } };
TB.renderMe = function(){
  var box = document.getElementById('tb-me'); if(!box) return;
  var m = TB.member(), bar = box.parentNode;
  if(!m){ box.hidden = true; box.innerHTML = ''; bar.classList.remove('has-me'); return; }
  var nm = m.ten || 'Thành viên', ch = (m.ten ? m.ten.trim().split(/\s+/).pop() : 'T').charAt(0).toUpperCase();
  box.innerHTML = '<a class="tb-me-a" href="'+TB.url('bac-si-danh-muc/index.html')+'" title="Thành viên Top Broker · '+esc(m.code)+'"><span class="tb-av" aria-hidden="true">'+esc(ch)+'</span><span class="tb-me-t"><b>'+esc(nm)+'</b><small>'+esc(m.code)+'</small></span></a>'+
    '<button type="button" class="tb-me-x" aria-label="Thoát mã thành viên '+esc(m.code)+'" title="Thoát">Thoát</button>';
  box.hidden = false; bar.classList.add('has-me');
};
document.addEventListener('click', function(e){
  if(!(e.target.closest && e.target.closest('.tb-me-x'))) return;
  try{ localStorage.setItem(TB.MKEY, 'null'); }catch(_){}
  TB.renderMe();
  try{ window.dispatchEvent(new Event('tb-member-out')); }catch(_){}
});
window.addEventListener('storage', function(e){ if(e.key===TB.MKEY) TB.renderMe(); });
TB.renderMe();
/* Mã lưu từ trước chưa có tên: hỏi máy chủ một lần để lấy tên */
(function(){
  var m = TB.member(); if(!m || 'ten' in m || location.protocol==='file:' || !window.fetch) return;
  fetch('/api/thanh-vien?code='+encodeURIComponent(m.code)).then(function(r){return r.json()}).then(function(j){
    var cur = TB.member(); if(!cur || cur.code!==m.code) return;
    if(j && j.ok){ cur.ten = j.ten || ''; try{ localStorage.setItem(TB.MKEY, JSON.stringify(cur)); }catch(_){} TB.renderMe(); }
  }).catch(function(){});
})();

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
