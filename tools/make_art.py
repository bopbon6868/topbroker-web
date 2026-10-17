# -*- coding: utf-8 -*-
# Tranh minh họa riêng cho từng bài Giải mã (anh Hải yêu cầu 18/10/2026): mỗi tranh gắn với ngành nghề
# và điểm chính của bài phân tích. Chạy: python3 tools/make_art.py → ghi tools/art/<MÃ>.svg.
# Phong cách: vẽ tay phẳng, nét #2C2A30 dày 3, nền màu ấm, không chữ, không logo, không người thật.
# Bài mới: thêm một mục vào ART rồi chạy lại script này và tools/build_articles.py.
import os
K = '#2C2A30'
def svg(label, body, bg):
    return ('<svg viewBox="0 0 300 220" role="img" aria-label="Tranh minh họa: %s">'
            '<rect width="300" height="220" rx="20" fill="%s"/>%s</svg>') % (label, bg, body)
S = 'stroke="%s" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' % K

ART = {
# VCG – Vinaconex, xây dựng; P/E thấp do khoản lãi bất thường "thổi phồng"
'VCG': svg('cần cẩu công trường treo một quả bóng bay phồng to cạnh khung nhà đang xây, ý nói lợi nhuận bị thổi phồng bởi khoản bất thường', f'''
<path d="M20 192 h260" {S} fill="none"/>
<rect x="150" y="104" width="100" height="88" fill="#F4E3C3" {S}/>
<path d="M150 134 h100 M150 163 h100 M183 104 v88 M217 104 v88" {S} fill="none"/>
<path d="M60 192 v-150 M72 192 v-150 M60 62 l12 -14 M60 92 l12 -16 M60 122 l12 -16 M60 152 l12 -16 M60 182 l12 -16" {S} fill="none"/>
<path d="M44 42 h188 l-10 -10 h-150 z" fill="#F2A13B" {S}/>
<rect x="34" y="42" width="26" height="16" rx="3" fill="#2C2A30"/>
<path d="M196 42 v34" {S} fill="none"/>
<circle cx="196" cy="98" r="22" fill="#E05A47" {S}/>
<path d="M188 90 q4 -6 10 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M196 120 l-4 8 h8 z" fill="#E05A47" {S}/>
<path d="M232 66 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4z" fill="#F2A13B"/>''', '#FCEBD6'),

# PDR – Phát Đạt, bất động sản; kinh doanh chính lỗ, doanh thu rất thấp
'PDR': svg('tòa chung cư xây dở với nhiều ô cửa trống, biển rao bán để trống và vài đồng xu lèo tèo, ý nói doanh thu chính rất mỏng', f'''
<path d="M20 192 h260" {S} fill="none"/>
<rect x="58" y="58" width="104" height="134" fill="#E8E2D6" {S}/>
<path d="M58 58 l14 -16 h76 l14 16" fill="#C9BFAE" {S}/>
<g fill="#fff" stroke="{K}" stroke-width="3"><rect x="72" y="74" width="20" height="18"/><rect x="100" y="74" width="20" height="18"/><rect x="128" y="74" width="20" height="18"/><rect x="72" y="104" width="20" height="18"/><rect x="100" y="104" width="20" height="18"/><rect x="128" y="104" width="20" height="18"/><rect x="72" y="134" width="20" height="18"/><rect x="128" y="134" width="20" height="18"/></g>
<rect x="100" y="134" width="20" height="18" fill="#F2C14E" stroke="{K}" stroke-width="3"/>
<rect x="96" y="166" width="28" height="26" fill="#9B8F7C" {S}/>
<path d="M192 192 v-62" {S} fill="none"/>
<rect x="176" y="96" width="76" height="40" rx="6" fill="#fff" {S}/>
<path d="M190 112 h48 M190 122 h30" stroke="#D5DCE3" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="236" cy="186" rx="13" ry="5" fill="#F2C14E" {S}/>
<ellipse cx="258" cy="188" rx="9" ry="4" fill="#F2C14E" {S}/>''', '#EAF0F6'),

# GEX – Gelex, thiết bị điện & hạ tầng; 60% lợi nhuận thuộc cổ đông thiểu số
'GEX': svg('cột điện cao thế kéo dây điện và chiếc bánh lợi nhuận bị chia, phần lớn lăn sang phía khác, ý nói phần lớn lãi thuộc cổ đông thiểu số', f'''
<path d="M20 192 h260" {S} fill="none"/>
<path d="M60 192 l24 -150 l24 150 M68 140 h32 M72 110 h24 M76 80 h16 M64 166 l40 -26 M104 166 l-40 -26" fill="none" {S}/>
<path d="M50 62 h68 M58 92 h52" {S} fill="none"/>
<path d="M50 62 q60 30 140 18 M118 62 q50 26 124 22" fill="none" stroke="{K}" stroke-width="2.5"/>
<path d="M186 74 l-8 18 h12 l-8 18" fill="none" stroke="#F2C14E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M222 150 L222 114 A36 36 0 0 1 243.2 179.1 Z" fill="#F2A13B" {S}/>
<path d="M222 150 L243.2 179.1 A36 36 0 1 1 222 114 Z" fill="#2FA866" {S} transform="translate(-12 8)"/>
<path d="M176 178 l-10 4 M180 190 l-12 0" stroke="{K}" stroke-width="3" stroke-linecap="round"/>''', '#EEF6E8'),

# TCB – Techcombank; lãi đầu tư gần như biến mất, bù bằng phí dịch vụ +74%
'TCB': svg('ngân hàng mái cột, bên trái chồng xu đầu tư teo lại, bên phải thẻ thanh toán và chồng xu phí dịch vụ cao vọt', f'''
<path d="M20 192 h260" {S} fill="none"/>
<path d="M90 70 l60 -34 l60 34 z" fill="#E05A47" {S}/>
<rect x="94" y="70" width="112" height="10" fill="#F4EEE2" {S}/>
<path d="M108 84 v72 M134 84 v72 M166 84 v72 M192 84 v72" {S} fill="none"/>
<rect x="90" y="156" width="120" height="14" fill="#F4EEE2" {S}/>
<ellipse cx="44" cy="184" rx="18" ry="6" fill="#C9CED6" {S}/>
<path d="M44 150 v-26" stroke="#E05A47" stroke-width="4" stroke-linecap="round"/><path d="M36 142 l8 10 l8 -10" fill="none" stroke="#E05A47" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#F2C14E" stroke="{K}" stroke-width="3"><ellipse cx="252" cy="184" rx="18" ry="6"/><ellipse cx="252" cy="172" rx="18" ry="6"/><ellipse cx="252" cy="160" rx="18" ry="6"/><ellipse cx="252" cy="148" rx="18" ry="6"/><ellipse cx="252" cy="136" rx="18" ry="6"/></g>
<rect x="222" y="66" width="52" height="34" rx="6" fill="#3B5B8A" {S}/><rect x="230" y="76" width="12" height="9" rx="2" fill="#F2C14E"/>
<path d="M252 124 v-14" stroke="#2FA866" stroke-width="4" stroke-linecap="round"/><path d="M244 116 l8 -8 l8 8" fill="none" stroke="#2FA866" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>''', '#FDECEA'),

# SSI – chứng khoán; lãi tăng 43% mà giá giảm 35%
'SSI': svg('màn hình bảng giá có cột lợi nhuận xanh đi lên trong khi đường giá cổ phiếu đỏ đi xuống, hai hướng ngược nhau', f'''
<rect x="40" y="34" width="220" height="136" rx="12" fill="#2F3346" {S}/>
<path d="M130 170 l-10 22 h60 l-10 -22 M104 192 h92" fill="#C9CED6" {S}/>
<path d="M58 152 h184" stroke="#59607A" stroke-width="2"/>
<g stroke="{K}" stroke-width="3"><rect x="70" y="118" width="24" height="34" fill="#2FA866"/><rect x="108" y="100" width="24" height="52" fill="#2FA866"/><rect x="146" y="82" width="24" height="70" fill="#2FA866"/><rect x="184" y="62" width="24" height="90" fill="#2FA866"/></g>
<path d="M62 56 l44 18 l40 2 l40 30 l46 34" fill="none" stroke="#FF6B5B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M222 132 l12 8 l-14 2" fill="none" stroke="#FF6B5B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>''', '#E9EEF7'),

# BSR – Lọc hóa dầu Bình Sơn; lãi tăng vọt nhờ giá dầu cao
'BSR': svg('nhà máy lọc dầu với tháp chưng cất, bồn chứa và ngọn lửa, bên cạnh giọt dầu lớn và mũi tên giá đi lên', f'''
<path d="M20 192 h260" {S} fill="none"/>
<rect x="44" y="70" width="26" height="122" rx="6" fill="#C9CED6" {S}/>
<rect x="80" y="96" width="22" height="96" rx="6" fill="#E8E2D6" {S}/>
<path d="M44 96 h26 M44 122 h26 M44 148 h26 M80 120 h22 M80 146 h22" {S} fill="none"/>
<path d="M120 192 v-68 h8 v68" fill="#9B8F7C" {S}/>
<path d="M124 118 q-10 -14 0 -26 q2 10 8 6 q2 12 -8 20z" fill="#F2A13B" {S}/>
<ellipse cx="172" cy="170" rx="30" ry="9" fill="#F4EEE2" {S}/><path d="M142 170 v-30 a30 9 0 0 1 60 0 v30" fill="#F4EEE2" {S}/>
<path d="M240 150 q0 -26 20 -44 q20 18 20 44 a20 20 0 0 1 -40 0z" fill="{K}"/>
<path d="M252 136 q4 -8 10 -12" stroke="#7D7A86" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M206 84 l22 -24 l12 10 l22 -30" fill="none" stroke="#2FA866" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M248 38 l16 -4 l-2 16" fill="none" stroke="#2FA866" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>''', '#FFF1DE'),

# MWG – Thế Giới Di Động, bán lẻ điện thoại, điện máy, bách hóa; lãi gấp đôi
'MWG': svg('cửa hàng có mái hiên sọc, giỏ mua sắm đựng điện thoại và rau củ, bên cạnh hai cột lợi nhuận cột sau cao gấp đôi cột trước', f'''
<path d="M20 192 h260" {S} fill="none"/>
<rect x="34" y="72" width="140" height="120" fill="#fff" {S}/>
<path d="M28 50 h152 l-6 26 h-140z" fill="#F2C14E" {S}/>
<path d="M54 50 l-4 26 M80 50 l-2 26 M104 50 v26 M128 50 l2 26 M154 50 l4 26" stroke="{K}" stroke-width="3"/>
<rect x="48" y="96" width="40" height="44" rx="4" fill="#BFE3F2" {S}/>
<rect x="118" y="132" width="34" height="60" fill="#E8E2D6" {S}/>
<path d="M92 156 h56 l-8 32 h-40z" fill="#F2A13B" {S}/>
<path d="M98 156 l12 -18 M142 156 l-12 -18" {S} fill="none"/>
<rect x="104" y="128" width="16" height="26" rx="3" fill="#2C2A30"/><rect x="107" y="132" width="10" height="16" rx="1" fill="#BFE3F2"/>
<circle cx="132" cy="146" r="9" fill="#2FA866" {S}/>
<rect x="206" y="146" width="26" height="46" rx="3" fill="#C9CED6" {S}/>
<rect x="244" y="100" width="26" height="92" rx="3" fill="#2FA866" {S}/>
<path d="M257 90 v-22 M249 76 l8 -8 l8 8" fill="none" stroke="#2FA866" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>''', '#FFF6D8'),

# NVL – Novaland, bất động sản nghỉ dưỡng; bán nhà lãi rất ít, lợi nhuận từ khoản khác
'NVL': svg('biệt thự nghỉ dưỡng bên bờ biển có cây dừa, ngôi nhà chỉ kèm một đồng xu nhỏ còn túi tiền lớn đến từ phía khác', f'''
<rect x="0" y="150" width="300" height="70" rx="0" fill="#7FBEDC"/>
<path d="M0 150 h300" {S}/>
<path d="M20 170 h40 M120 186 h50 M210 176 h44" stroke="#BFE3F2" stroke-width="4" stroke-linecap="round"/>
<circle cx="250" cy="48" r="20" fill="#FFD27A"/>
<rect x="56" y="98" width="90" height="52" fill="#fff" {S}/>
<path d="M48 100 l53 -38 l53 38 z" fill="#E05A47" {S}/>
<rect x="92" y="118" width="20" height="32" fill="#C98A5E" {S}/>
<rect x="66" y="112" width="16" height="14" fill="#BFE3F2" {S}/><rect x="122" y="112" width="16" height="14" fill="#BFE3F2" {S}/>
<path d="M30 150 q4 -50 10 -66" {S} fill="none"/>
<path d="M40 84 q-18 -6 -28 6 M40 84 q-6 -16 -22 -16 M40 84 q14 -14 30 -8 M40 84 q18 2 24 16" stroke="#2FA866" stroke-width="5" fill="none" stroke-linecap="round"/>
<ellipse cx="160" cy="142" rx="8" ry="4" fill="#F2C14E" {S}/>
<path d="M214 150 q-16 -2 -14 -22 q2 -18 18 -24 l-6 -10 h20 l-6 10 q16 6 18 24 q2 20 -14 22z" fill="#F2C14E" {S}/>
<path d="M216 128 h10" stroke="{K}" stroke-width="3" stroke-linecap="round"/>''', '#FFF4E6'),

# MSB – ngân hàng; giá tăng 35% nhưng lãi quý đi ngang
'MSB': svg('tòa ngân hàng với quả bóng bay giá cổ phiếu bay lên cao trong khi đường lợi nhuận bên dưới đi ngang', f'''
<path d="M20 192 h260" {S} fill="none"/>
<path d="M40 92 l50 -28 l50 28 z" fill="#3B5B8A" {S}/>
<rect x="44" y="92" width="92" height="8" fill="#F4EEE2" {S}/>
<path d="M56 104 v58 M78 104 v58 M102 104 v58 M124 104 v58" {S} fill="none"/>
<rect x="40" y="162" width="100" height="12" fill="#F4EEE2" {S}/>
<path d="M166 160 h108" stroke="{K}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
<path d="M166 150 h108" stroke="#F2A13B" stroke-width="5" stroke-linecap="round"/>
<path d="M220 150 q-6 -40 4 -66" fill="none" stroke="{K}" stroke-width="2.5"/>
<ellipse cx="226" cy="62" rx="24" ry="28" fill="#E05A47" {S}/>
<path d="M216 52 q4 -8 12 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M226 90 l-4 6 h8z" fill="#E05A47" {S}/>
<path d="M258 34 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="#F2A13B"/>''', '#E9F0F8'),

# SHB – ngân hàng; thu nhập cho vay giảm 26%, phí dịch vụ đỡ lại
'SHB': svg('chiếc cân thăng bằng trước ngân hàng, đĩa cho vay vơi đi còn đĩa phí dịch vụ đầy thêm bù lại', f'''
<path d="M20 192 h260" {S} fill="none"/>
<path d="M190 60 l40 -22 l40 22 z" fill="#F2A13B" {S}/>
<rect x="194" y="60" width="72" height="8" fill="#F4EEE2" {S}/>
<path d="M204 72 v80 M222 72 v80 M240 72 v80 M258 72 v80" {S} fill="none"/>
<rect x="190" y="152" width="80" height="12" fill="#F4EEE2" {S}/>
<path d="M100 186 v-130 M80 190 h40" {S} fill="none"/>
<circle cx="100" cy="54" r="6" fill="{K}"/>
<path d="M40 64 h120" {S} fill="none"/>
<path d="M40 64 l-16 46 h32 z M160 64 l-16 46 h32 z" fill="none" stroke="{K}" stroke-width="2.5"/>
<path d="M18 110 h44 q-2 12 -22 12 q-20 0 -22 -12z" fill="#C9CED6" {S}/>
<path d="M138 110 h44 q-2 12 -22 12 q-20 0 -22 -12z" fill="#C9CED6" {S}/>
<ellipse cx="40" cy="106" rx="10" ry="4" fill="#F2C14E" {S}/>
<path d="M40 92 v-14 M34 86 l6 6 l6 -6" fill="none" stroke="#E05A47" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#F2C14E" stroke="{K}" stroke-width="3"><ellipse cx="160" cy="106" rx="12" ry="4"/><ellipse cx="160" cy="98" rx="12" ry="4"/><ellipse cx="160" cy="90" rx="12" ry="4"/></g>
<path d="M160 80 v-14 M154 72 l6 -6 l6 6" fill="none" stroke="#2FA866" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>''', '#FFF0E0'),

# VIX – chứng khoán; 93% tài sản là cổ phiếu tự doanh
'VIX': svg('chiếc giỏ đầy ắp tờ cổ phiếu và nến biểu đồ gần tràn ra ngoài, chỉ có một đồng xu tiền mặt nhỏ bên cạnh', f'''
<path d="M20 192 h260" {S} fill="none"/>
<path d="M70 110 h160 l-18 82 h-124z" fill="#C98A5E" {S}/>
<path d="M84 128 h132 M90 150 h120 M96 172 h108" stroke="{K}" stroke-width="2.5"/>
<g stroke="{K}" stroke-width="3">
<rect x="84" y="56" width="44" height="58" rx="4" fill="#fff" transform="rotate(-12 106 85)"/>
<rect x="128" y="44" width="44" height="66" rx="4" fill="#FFF6D8"/>
<rect x="170" y="58" width="44" height="56" rx="4" fill="#fff" transform="rotate(10 192 86)"/></g>
<path d="M140 92 l8 -10 l8 6 l8 -14" fill="none" stroke="#2FA866" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M140 62 h24 M140 70 h16" stroke="#D5DCE3" stroke-width="4" stroke-linecap="round"/>
<g stroke="{K}" stroke-width="2.5"><line x1="98" y1="72" x2="98" y2="96"/><rect x="93" y="78" width="10" height="12" fill="#E05A47"/><line x1="192" y1="74" x2="192" y2="98"/><rect x="187" y="80" width="10" height="12" fill="#2FA866"/></g>
<ellipse cx="254" cy="186" rx="12" ry="5" fill="#F2C14E" {S}/>''', '#F1ECFA'),

# PNJ – trang sức vàng; lỗ vì dự phòng lớn cho cam kết mua lại hàng đã bán
'PNJ': svg('hộp trang sức mở có nhẫn và vòng cổ vàng, bên cạnh chiếc ô lớn che chồng tiền dự phòng đang bị rút cạn', f'''
<path d="M20 192 h260" {S} fill="none"/>
<path d="M40 150 h110 v42 h-110z" fill="#7A2E3A" {S}/>
<path d="M40 150 l10 -50 h90 l10 50z" fill="#9E3D4C" {S}/>
<path d="M54 146 l6 -32 h70 l6 32z" fill="#F4E3C3" {S}/>
<circle cx="80" cy="132" r="12" fill="none" stroke="#F2C14E" stroke-width="6"/>
<path d="M74 120 l6 -8 l6 8z" fill="#BFE3F2" {S}/>
<path d="M96 120 q18 30 36 0" fill="none" stroke="#F2C14E" stroke-width="5" stroke-linecap="round"/>
<circle cx="114" cy="136" r="5" fill="#F2C14E" {S}/>
<path d="M174 96 a54 40 0 0 1 108 0 q-9 -8 -18 0 q-9 -8 -18 0 q-9 -8 -18 0 q-9 -8 -18 0 q-9 -8 -18 0 q-9 -8 -18 0z" fill="#E05A47" {S}/>
<path d="M228 96 v70 q0 10 -10 10" fill="none" {S}/>
<g fill="#F2C14E" stroke="{K}" stroke-width="3"><ellipse cx="208" cy="186" rx="16" ry="5"/><ellipse cx="208" cy="178" rx="16" ry="5"/></g>
<path d="M258 150 v22 M250 164 l8 8 l8 -8" fill="none" stroke="#E05A47" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>''', '#FDEFF0'),

# FPT – công nghệ; doanh thu giảm hai quý liền
'FPT': svg('máy tính xách tay hiện các dòng mã lập trình, đám mây dữ liệu và con chip phía trên, mũi tên doanh thu đi xuống', f'''
<path d="M20 192 h260" {S} fill="none"/>
<rect x="70" y="86" width="140" height="88" rx="8" fill="#2F3346" {S}/>
<path d="M54 174 h172 l-10 16 h-152z" fill="#C9CED6" {S}/>
<path d="M88 106 l-10 10 l10 10 M112 126 l10 -10 l-10 -10" fill="none" stroke="#7FD1AE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M134 106 h50 M134 118 h36 M134 130 h44 M88 150 h80" stroke="#8EA0C6" stroke-width="4" stroke-linecap="round"/>
<path d="M60 64 q-20 0 -20 -16 q0 -16 18 -16 q6 -14 22 -12 q14 -8 26 4 q16 0 16 16 q0 24 -22 24z" fill="#fff" {S}/>
<rect x="150" y="26" width="40" height="40" rx="6" fill="#F2A13B" {S}/>
<rect x="160" y="36" width="20" height="20" rx="3" fill="#2C2A30"/>
<path d="M158 26 v-8 M170 26 v-8 M182 26 v-8 M158 74 v-8 M170 74 v-8 M182 74 v-8 M150 34 h-8 M150 46 h-8 M150 58 h-8 M198 34 h-8 M198 46 h-8 M198 58 h-8" stroke="{K}" stroke-width="3" stroke-linecap="round"/>
<path d="M228 52 l18 24 l12 -8 l18 30" fill="none" stroke="#E05A47" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M262 100 l14 0 l0 -14" fill="none" stroke="#E05A47" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>''', '#EAF3F8'),

# VIC – Vingroup, bất động sản + xe điện; lãi quý chủ yếu từ ngoài kinh doanh chính
'VIC': svg('khu đô thị nhiều tòa nhà cao và một chiếc ô tô điện đang sạc, túi tiền lợi nhuận đến từ một nhánh riêng bên cạnh', f'''
<path d="M20 192 h260" {S} fill="none"/>
<rect x="30" y="70" width="40" height="122" fill="#C9D8EC" {S}/>
<rect x="78" y="40" width="46" height="152" fill="#E8E2D6" {S}/>
<rect x="132" y="90" width="36" height="102" fill="#C9D8EC" {S}/>
<g fill="#fff" stroke="{K}" stroke-width="2.5"><rect x="38" y="84" width="10" height="10"/><rect x="54" y="84" width="10" height="10"/><rect x="38" y="108" width="10" height="10"/><rect x="54" y="108" width="10" height="10"/><rect x="88" y="54" width="10" height="10"/><rect x="106" y="54" width="10" height="10"/><rect x="88" y="80" width="10" height="10"/><rect x="106" y="80" width="10" height="10"/><rect x="88" y="106" width="10" height="10"/><rect x="106" y="106" width="10" height="10"/><rect x="140" y="104" width="8" height="10"/><rect x="154" y="104" width="8" height="10"/></g>
<path d="M176 176 q2 -22 22 -26 l14 -14 h34 l18 16 q14 2 14 18 v6 h-102z" fill="#3B5B8A" {S}/>
<path d="M214 140 h28 l12 12 h-50z" fill="#BFE3F2" stroke="{K}" stroke-width="2.5"/>
<circle cx="200" cy="180" r="10" fill="{K}"/><circle cx="256" cy="180" r="10" fill="{K}"/>
<path d="M190 156 l-6 12 h8 l-6 12" fill="none" stroke="#F2C14E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M240 104 q-14 -2 -12 -18 q2 -14 14 -18 l-4 -8 h16 l-4 8 q12 4 14 18 q2 16 -12 18z" fill="#F2C14E" {S}/>
<path d="M236 104 q-20 10 -30 30" fill="none" stroke="{K}" stroke-width="2.5" stroke-dasharray="4 6"/>''', '#EEF1F8'),

# VPB – VPBank; cho vay tăng 40%/năm, gấp hơn 2 lần ngành
'VPB': svg('tòa ngân hàng cạnh một tên lửa làm từ chồng tiền xu phóng vọt lên, so với cột tăng trưởng của ngành thấp hơn nhiều', f'''
<path d="M20 192 h260" {S} fill="none"/>
<path d="M30 102 l46 -26 l46 26 z" fill="#2FA866" {S}/>
<rect x="34" y="102" width="84" height="8" fill="#F4EEE2" {S}/>
<path d="M46 114 v52 M66 114 v52 M86 114 v52 M106 114 v52" {S} fill="none"/>
<rect x="30" y="166" width="92" height="12" fill="#F4EEE2" {S}/>
<rect x="150" y="150" width="28" height="42" rx="3" fill="#C9CED6" {S}/>
<path d="M226 40 q20 20 20 56 v50 h-40 v-50 q0 -36 20 -56z" fill="#F2C14E" {S}/>
<path d="M206 96 h40 M206 116 h40" stroke="{K}" stroke-width="3"/>
<circle cx="226" cy="74" r="9" fill="#BFE3F2" {S}/>
<path d="M206 126 l-14 20 h14z M246 126 l14 20 h-14z" fill="#E05A47" {S}/>
<path d="M216 148 q10 26 20 0 q-4 18 -10 30 q-6 -12 -10 -30z" fill="#F2A13B" {S}/>''', '#E8F5EE'),

# HPG – Hòa Phát, thép; 5.400 tỷ lãi đến từ ngoài việc bán thép
'HPG': svg('lò cao luyện thép và cuộn thép, dầm thép xếp chồng, bên cạnh túi tiền lớn đến từ nguồn ngoài việc bán thép', f'''
<path d="M20 192 h260" {S} fill="none"/>
<path d="M44 192 v-86 l14 -30 h28 l14 30 v86z" fill="#9B8F7C" {S}/>
<path d="M58 76 v-34 h28 v34" fill="#C9BFAE" {S}/>
<path d="M66 40 q-8 -12 4 -20 q4 10 10 4 q4 12 -6 18" fill="#C9CED6" stroke="{K}" stroke-width="2.5"/>
<path d="M58 140 h28" stroke="#F2A13B" stroke-width="8" stroke-linecap="round"/>
<circle cx="140" cy="166" r="26" fill="#8EA0B4" {S}/><circle cx="140" cy="166" r="16" fill="#C9D3DE" {S}/><circle cx="140" cy="166" r="6" fill="#2C2A30"/>
<path d="M118 120 h70 v10 h-70z M118 106 h70 v10 h-70z" fill="#B0B8C4" {S}/>
<path d="M224 186 q-24 -2 -22 -32 q2 -26 26 -34 l-8 -14 h28 l-8 14 q24 8 26 34 q2 30 -22 32z" fill="#F2C14E" {S}/>
<path d="M232 152 h16 M232 162 h16" stroke="{K}" stroke-width="3" stroke-linecap="round"/>
<path d="M196 116 q4 -20 18 -28" fill="none" stroke="{K}" stroke-width="2.5" stroke-dasharray="4 6"/>''', '#F3EEE8'),
}

if __name__ == '__main__':
    os.makedirs('tools/art', exist_ok=True)
    for tk, s in ART.items():
        open(f'tools/art/{tk}.svg', 'w', encoding='utf-8').write(s.replace('\n', ''))
    print(len(ART), 'tranh')
