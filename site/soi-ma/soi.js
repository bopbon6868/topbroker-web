/* Soi mã theo ngành – bản chạy trên topbroker.fun
   Dữ liệu: /api/soi (VNDirect finfo: ngành ICB, BCTC năm + quý, P/E–P/B cuối kỳ, chỉ số hiện tại)
            /api/stock (VNDirect dchart: giá ngày 3 năm, trễ 15 phút). Tính toán chạy trên trình duyệt. */
const N_PEERS=6, TH_GOOD=0.60, TH_BAD=0.35;
const M_NB=[
 {k:"roe",n:"ROE",d:1,f:"p"},{k:"roa",n:"ROA",d:1,f:"p"},{k:"gm",n:"Biên LN gộp",d:1,f:"p"},{k:"npm",n:"Biên LN ròng",d:1,f:"p"},
 {k:"revG",n:"Tăng trưởng doanh thu",d:1,f:"s"},{k:"npG",n:"Tăng trưởng LNST",d:1,f:"s"},
 {k:"de",n:"Nợ vay / VCSH",d:-1,f:"x"},{k:"le",n:"Nợ phải trả / VCSH",d:-1,f:"x"},
 {k:"cr",n:"Thanh toán hiện hành",d:1,f:"x"},{k:"ic",n:"EBIT / lãi vay",d:1,f:"x"},{k:"cfoNp",n:"CFO / LNST",d:1,f:"x"},
 {k:"pe",n:"P/E cuối kỳ",d:-1,f:"x",val:1},{k:"pb",n:"P/B cuối kỳ",d:-1,f:"x",val:1}];
const M_BK=[
 {k:"roe",n:"ROE",d:1,f:"p"},{k:"roa",n:"ROA",d:1,f:"p"},{k:"niiTa",n:"TN lãi thuần / tổng TS",d:1,f:"p"},
 {k:"npG",n:"Tăng trưởng LNST",d:1,f:"s"},{k:"loanG",n:"Tăng trưởng cho vay",d:1,f:"s"},{k:"depG",n:"Tăng trưởng tiền gửi",d:1,f:"s"},
 {k:"cir",n:"CIR (chi phí / thu nhập)",d:-1,f:"p"},{k:"eqTa",n:"VCSH / tổng TS",d:1,f:"p"},{k:"ldr",n:"Cho vay / tiền gửi",d:0,f:"p"},
 {k:"pe",n:"P/E cuối kỳ",d:-1,f:"x",val:1},{k:"pb",n:"P/B cuối kỳ",d:-1,f:"x",val:1}];
const W_LBL=["12T gần nhất","12T trước đó","12T trước nữa"];
const TW=[{k:"ret",n:"Hiệu suất giá",d:1,f:"s"},{k:"rel",n:"So với VN-Index",d:1,f:"s"},{k:"mdd",n:"Sụt giảm tối đa",d:1,f:"s"},{k:"vol",n:"Biến động (năm)",d:-1,f:"p"},{k:"adtv",n:"GTGD BQ (tỷ/phiên)",d:1,f:"t"}];

const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=v=>typeof v==="number"&&isFinite(v);
function fmt(v,f){if(!num(v))return "–";
 if(f==="p")return (v*100).toFixed(1).replace(".",",")+"%";
 if(f==="s")return (v>0?"+":"")+(v*100).toFixed(1).replace(".",",")+"%";
 if(f==="x")return v.toFixed(1).replace(".",",")+"x";
 if(f==="t")return v.toLocaleString("vi-VN",{maximumFractionDigits:1});
 if(f==="d")return Math.round(v).toLocaleString("vi-VN");return String(v)}
const avg=a=>{a=a.filter(num);return a.length?a.reduce((s,v)=>s+v,0)/a.length:null};
const med=a=>{a=a.filter(num).sort((x,y)=>x-y);if(!a.length)return null;const m=a.length/2;return a.length%2?a[m|0]:(a[m-1]+a[m])/2};
const adjPE=(k,v)=>k==="pe"&&num(v)&&v<0?1e9:v;
function pctl(x,arr,d){arr=arr.filter(num);if(!num(x)||!arr.length||!d)return null;return arr.filter(v=>d>0?v<x:v>x).length/arr.length}

let STATE=null, YR=0, RUN=0;
/* nhãn cột: năm, hoặc kỳ quý mới nhất (chỉ số = 12 tháng gần nhất, KQKD = lũy kế từ đầu năm) */
const isP=y=>typeof y==="string";
const yl=y=>isP(y)?`${y} <span class="sub">(12T gần nhất)</span>`:String(y);
const ylBs=y=>isP(y)?`${STATE?.period?.ytd||y} <span class="sub">(số dư cuối ${y})</span>`:String(y);
const yt=y=>isP(y)?`12T đến ${y}`:`năm ${y}`;
function status(kind,html){const s=$("status");s.hidden=!kind;s.className="status"+(kind==="err"?" err":kind==="warn"?" warn":"");s.innerHTML=html||""}
function load(label){status("load",`<span class="spin"></span>${esc(label)}`)}
async function getJ(url,ms=25000){
 for(let i=0;i<2;i++){
  try{const r=await fetch(url,{signal:AbortSignal.timeout?AbortSignal.timeout(ms):undefined});const j=await r.json().catch(()=>null);
   if(j&&(r.ok||j.error))return j;throw new Error("HTTP "+r.status)}
  catch(e){if(i)throw e;await new Promise(r=>setTimeout(r,1200))}}}
const pxURL=(syms)=>"/api/stock?h=1150&s="+syms.join(",");

/* ---------- tính kỹ thuật từ giá ngày (VNDirect, đơn vị nghìn đồng) ---------- */
function toBars(h){if(!h||!Array.isArray(h.c))return null;
 return h.c.map((c,i)=>({t:Date.parse(h.t[i]+"T00:00:00Z")/1000,c,h:h.h[i],l:h.l[i],v:h.v[i]})).filter(b=>num(b.c)&&b.c>0)}
function dailyStats(bars,vmap,isIndex){
 const c=bars.map(b=>b.c),n=c.length,p=c[n-1],mult=isIndex?1:1000;
 const hi=Math.max(...bars.map(b=>b.h)),lo=Math.min(...bars.map(b=>b.l));
 let peak=c[0],mdd=0;c.forEach(v=>{peak=Math.max(peak,v);mdd=Math.min(mdd,v/peak-1)});
 const r=[];for(let i=1;i<n;i++)r.push(Math.log(c[i]/c[i-1]));const m=avg(r),sd=Math.sqrt(avg(r.map(x=>(x-m)**2)));
 const ret=p/c[0]-1;let rel=null,rel3=null,rel6=null,beta=null;
 if(vmap){const vc=bars.map(b=>vmap.get(b.t));
  const relN=k=>{const i0=n-1-k;if(i0<0||!num(vc[i0])||!num(vc[n-1]))return null;return (p/c[i0]-1)-(vc[n-1]/vc[i0]-1)};
  rel=relN(n-1);rel3=relN(63);rel6=relN(126);
  const xs=[],ys=[];for(let i=1;i<n;i++){if(num(vc[i])&&num(vc[i-1])){xs.push(Math.log(vc[i]/vc[i-1]));ys.push(r[i-1])}}
  if(xs.length>60){const mx=avg(xs),my=avg(ys);let cv=0,vx=0;xs.forEach((x,i)=>{cv+=(x-mx)*(ys[i]-my);vx+=(x-mx)**2});beta=vx?cv/vx:null}}
 const last20=bars.slice(-20);
 const q=[["249 phiên",249],["3 tháng (63 phiên)",63],["52 phiên",52]].map(([lbl,k])=>{const seg=bars.slice(-k);let lo=seg[0],hi=seg[0];seg.forEach(b=>{if(b.l<lo.l)lo=b;if(b.h>hi.h)hi=b});
  return{lbl,n:seg.length,lo:lo.l*mult,loD:lo.t,hi:hi.h*mult,hiD:hi.t,vol:avg(seg.map(b=>b.v)),adtv:avg(seg.map(b=>b.c*mult*b.v/1e9)),range:hi.h/lo.l-1}});
 return{q,p:p*mult,hi:hi*mult,lo:lo*mult,dd:p/hi-1,pos:hi>lo?(p-lo)/(hi-lo):null,ret,rel,rel3,rel6,mdd,vol:sd*Math.sqrt(250),beta,
  adtv:avg(last20.map(b=>b.c*mult*b.v/1e9)),v20:avg(last20.map(b=>b.v))}}
/* 2 giai đoạn 12 tháng trước đó, cũng từ giá ngày (250 phiên/giai đoạn) */
function dailyOlder(bars,vmap){
 const c=bars.map(b=>b.c),out=[null];
 for(let w=1;w<3;w++){const end=c.length-1-250*w,start=end-250;if(start<0){out.push({});continue}
  const seg=c.slice(start,end+1);let pk=seg[0],mdd=0;seg.forEach(v=>{pk=Math.max(pk,v);mdd=Math.min(mdd,v/pk-1)});
  const r=[];for(let i=1;i<seg.length;i++)r.push(Math.log(seg[i]/seg[i-1]));const m=avg(r),sd=Math.sqrt(avg(r.map(x=>(x-m)**2)));
  const ret=seg[seg.length-1]/seg[0]-1;let rel=null;
  if(vmap){const a=vmap.get(bars[start].t),b=vmap.get(bars[end].t);if(num(a)&&num(b))rel=ret-(b/a-1)}
  out.push({ret,rel,mdd,vol:sd*Math.sqrt(250),adtv:avg(bars.slice(start+1,end+1).map(b=>b.c*1000*b.v/1e9))})}
 return out}

/* ---------- tải dữ liệu ---------- */
async function analyze(t){
 const my=++RUN;$("go").disabled=true;loadNotes(t);
 const D={t,peers:[],names:{},fin:{},st:{},now:{},tech:{},older:{},missing:[],finReady:false,olderReady:false,isBank:false};
 const manual=($("d_peers").value||"").toUpperCase().split(/[^A-Z0-9]+/).filter(x=>/^[A-Z0-9]{3,6}$/.test(x)&&x!==t).slice(0,10);
 load("Đang xác định ngành, nhóm so sánh và báo cáo tài chính của "+t+"…");
 try{
  const pxMeP=getJ(pxURL([t,"VNINDEX"])).catch(e=>({__e:e}));
  const j=await getJ("/api/soi?s="+t+(manual.length>=3?"&p="+manual.join(","):""));if(my!==RUN)return;
  if(!j||j.error&&!j.peers?.length){$("dealbox").open=!!(j&&/nhóm so sánh/.test(j.error||""));status("err",esc(j?.error||"Không lấy được dữ liệu."));return}
  D.peers=j.peers;D.peerSrc=j.peerSrc;D.names=j.names||{};D.isBank=!!j.isBank;D.now=j.now||{};
  D.ov={industry:j.industry||"",exchange:j.floor||"",company:j.company||""};D.names[t]=j.name||t;
  if(j.error){status("err",esc(j.error));return}
  D.fin=j.fin||{};D.st=j.st||{};D.years=j.years||[];D.period=j.period||null;D.lag=j.lag||{};D.finReady=D.years.length>0;YR=D.years.length-1;
  (j.missing||[]).forEach(x=>D.missing.push(x+" (tài chính)"));
  load("Đang tải giá 3 năm của "+t+" và "+D.peers.length+" mã so sánh…");
  const ppxP=getJ(pxURL(D.peers)).catch(e=>({__e:e}));
  const px=await pxMeP;if(my!==RUN)return;
  const vb=px&&!px.__e?toBars(px.h?.VNINDEX):null;D.vmap=vb?new Map(vb.map(b=>[b.t,b.c])):null;
  if(vb){const v1=vb.slice(-250);D.vni={r12:v1[v1.length-1].c/v1[0].c-1}}
  const all=px&&!px.__e?toBars(px.h?.[t]):null;
  if(all&&all.length>=60){D.allBars=all;D.bars=all.slice(-250);D.tech[t]=dailyStats(D.bars,D.vmap);D.older[t]=dailyOlder(all,D.vmap)}
  else D.missing.push(t+" (giá)");
  D.asof=D.bars?new Date(D.bars[D.bars.length-1].t*1000).toISOString().slice(0,10):"";
  STATE=D;render();
  const ppx=await ppxP;if(my!==RUN)return;
  D.peers.forEach(x=>{const b=ppx&&!ppx.__e?toBars(ppx.h?.[x]):null;if(b&&b.length>=60){D.tech[x]=dailyStats(b.slice(-250),D.vmap);D.older[x]=dailyOlder(b,D.vmap)}else D.missing.push(x+" (giá)")});
  D.olderReady=!!D.older[t];
  render();
  const msg=[D.missing.length?"Thiếu dữ liệu: "+esc(D.missing.join(", "))+". Các phần khác vẫn tính trên những mã có dữ liệu.":"",periodNote(D)].filter(Boolean).join(" ");
  status(msg?"warn":null,msg);
  try{localStorage.setItem("smtn-last",t)}catch(e){}pushRecent(t);
 }catch(e){if(my===RUN)status("err","Không lấy được dữ liệu ("+esc(e&&e.message||e)+"). Bấm Soi mã lại sau ít phút.")}
 finally{if(my===RUN)$("go").disabled=false}}

function periodNote(D){
 const now=new Date(),cq=Math.floor(now.getMonth()/3),exp=cq===0?`Q4/${now.getFullYear()-1}`:`Q${cq}/${now.getFullYear()}`;
 if(!D.period)return `VNDirect chưa có báo cáo quý của ${esc(D.t)} sau năm ${D.years?.[D.years.length-1]||""}; cột mới nhất sẽ tự thêm khi có.`;
 const P=D.period.key,lag=Object.entries(D.lag||{});let s=`Cột ${P}: chỉ số tính 12 tháng gần nhất, KQKD là lũy kế ${D.period.ytd}.`;
 if(P!==exp)s+=` ${esc(D.t)} chưa có BCTC ${exp} trên VNDirect, trang tự cập nhật khi doanh nghiệp công bố.`;
 if(lag.length)s+=` Chưa có BCTC ${P}: ${lag.map(([c,q])=>esc(c)+" (dùng "+q+")").join(", ")}.`;
 return s}
/* ---------- chấm điểm ---------- */
function techScore(D){const me=D.tech[D.t];if(!me)return null;const pt=D.peers.map(p=>D.tech[p]).filter(Boolean);if(!pt.length)return null;
 return avg([pctl(me.ret,pt.map(x=>x.ret),1),pctl(me.dd,pt.map(x=>x.dd),1),pctl(me.adtv,pt.map(x=>x.adtv),1),pctl(me.vol,pt.map(x=>x.vol),-1)])}
function score(D){
 const tech=techScore(D);
 if(!D.finReady)return{fund:null,val:null,tech,total:null,v:{c:"v-mid",t:"Đang tải chỉ số tài chính…"},y:null};
 const M=D.isBank?M_BK:M_NB,y=D.years[D.years.length-1],F=D.fin;
 const g=m=>pctl(adjPE(m.k,F[D.t]?.[y]?.[m.k]),D.peers.map(p=>adjPE(m.k,F[p]?.[y]?.[m.k])),m.d);
 const fund=avg(M.filter(m=>!m.val).map(g)),val=avg(M.filter(m=>m.val).map(g)),total=avg([fund,val,tech]);
 let v;if(!num(total))v={c:"v-mid",t:"Chưa đủ dữ liệu để kết luận"};
 else if(total>=TH_GOOD)v={c:"v-good",t:"Mạnh hơn mặt bằng ngành"};
 else if(total<TH_BAD)v={c:"v-bad",t:"Rủi ro riêng – yếu hơn ngành"};
 else v={c:"v-mid",t:"Tương đương ngành – yếu tố ngành chi phối"};
 return{fund,val,tech,total,v,y}}
function bullets(D,S){
 const pts=[],t=D.t,me=D.tech[t],pt=D.peers.map(p=>D.tech[p]).filter(Boolean);
 if(D.finReady){const F=D.fin,y=S.y,pm=k=>({x:F[t]?.[y]?.[k],m:med(D.peers.map(p=>F[p]?.[y]?.[k]))});
  const r=pm("roe");if(num(r.x)&&num(r.m))pts.push(`ROE ${yt(y)} ${fmt(r.x,"p")} so với trung vị ngành ${fmt(r.m,"p")} – ${r.x>r.m?"cao hơn":"thấp hơn"} ngành.`);
  const e=pm("npG");if(num(e.x)&&num(e.m))pts.push(`Tăng trưởng LNST ${yt(y)}: ${fmt(e.x,"s")}, ngành ${fmt(e.m,"s")}.`);
  const pb=pm("pb");if(num(pb.x)&&num(pb.m))pts.push(`P/B cuối ${isP(y)?y:"năm "+y} ${fmt(pb.x,"x")} so với ngành ${fmt(pb.m,"x")}${pb.x>pb.m*2?" – định giá cao hơn hẳn ngành":pb.x<pb.m?" – rẻ hơn ngành":""}.`)}
 if(me&&pt.length){const mdd=med(pt.map(x=>x.dd)),gap=me.dd-mdd;
  pts.push(Math.abs(gap)<0.1?`Giá ${fmt(me.dd,"s")} so với đỉnh 52 tuần, tương đương mức chung của ngành (${fmt(mdd,"s")}): áp lực giá chủ yếu đến từ ngành.`:gap>0?`Giá ${fmt(me.dd,"s")} so với đỉnh 52 tuần, chống chịu tốt hơn ngành (${fmt(mdd,"s")}).`:`Giá ${fmt(me.dd,"s")} so với đỉnh 52 tuần, sâu hơn hẳn ngành (${fmt(mdd,"s")}): rủi ro riêng của mã.`);
  pts.push(`Thanh khoản ~${fmt(me.adtv,"t")} tỷ/phiên (20 phiên) so với trung vị ngành ${fmt(med(pt.map(x=>x.adtv)),"t")} tỷ.`)}
 const ff=D.now[t]?.ff;if(num(ff))pts.push(`Tỷ lệ free float ${fmt(ff,"p")} (VNDirect).`);
 return pts.concat(bsBullets(D))}
function sharesOut(D){const n=D.now[D.t];if(n&&num(n.so))return n.so;const me=D.tech[D.t];return n&&num(n.mcap)&&me?n.mcap/me.p:null}
function dealCalc(D){
 const ratio=+$("d_ratio").value/100,cap=+$("d_cap").value,room=+$("d_room").value,pool=+$("d_pool").value,part=(+$("d_part").value||20)/100;
 const init=$("d_init").value===""?null:+$("d_init").value/100,fs=$("d_fs").value===""?null:+$("d_fs").value/100;
 const me=D.tech[D.t];if((!room&&!cap&&!pool)||!me)return null;
 const last=me.p,v=me.v20,eff=cap?Math.min(cap,last):last,so=sharesOut(D);
 // Giá FS ước tính theo cách QTRR: nợ = (1 − tỷ lệ ban đầu) × giá hiện tại; FS khi tỷ lệ TK chạm ngưỡng FS
 const fsPrice=num(init)&&num(fs)&&fs<1?(1-init)*last/(1-fs):null,fsGap=fsPrice?fsPrice/last-1:null;
 const pt=D.peers.map(p=>D.tech[p]).filter(Boolean),mddInd=med(pt.map(x=>x.mdd));
 return{ratio,cap,room,pool,part,last,v20:v,sess:room&&v?room/(v*part):null,roomDays:room&&v?room/v:null,capRatio:cap?cap/last:null,
  maxDebt:room&&ratio?Math.min(pool?pool*1e9:Infinity,room*eff*ratio)/1e9:null,
  so,room5:so&&room?room/(so*0.05):null,init,fs,fsPrice,fsGap,mddMe:me.mdd,mddInd}}

/* ---------- hiển thị ---------- */
function render(){
 const D=STATE;if(!D)return;const t=D.t,S=score(D),me=D.tech[t],pt=D.peers.map(p=>D.tech[p]).filter(Boolean),F=D.fin;
 $("empty").hidden=true;$("out").hidden=false;
 $("xl").disabled=!(window.XLSX&&D.finReady);$("pdf").disabled=!(window.html2canvas&&window.jspdf&&D.finReady);
 if(D.asof)$("asof").textContent="Dữ liệu VNDirect · giá đến phiên "+D.asof.split("-").reverse().join("/")+" (trễ 15 phút)";
 $("indLede").textContent=`${t} – ${D.names[t]}${D.ov.industry?" thuộc ngành "+D.ov.industry:""}. Nhóm so sánh: ${D.peers.length} mã ${D.peerSrc==="manual"?"tự chọn":"vốn hóa lớn nhất cùng ngành (ICB)"}.`;
 const ly=D.finReady?D.years[D.years.length-1]:null;
 $("indKpi").innerHTML=[[`ROE ${ly?(isP(ly)?"12T đến "+ly:ly):""}`,ly?fmt(med(D.peers.map(p=>F[p]?.[ly]?.roe)),"p"):"…"],[`P/B ${ly||""}`,ly?fmt(med(D.peers.map(p=>F[p]?.[ly]?.pb)),"x"):"…"],["Giá 12T",pt.length?fmt(med(pt.map(x=>x.ret)),"s"):"…"],["GTGD (tỷ/phiên)",pt.length?fmt(med(pt.map(x=>x.adtv)),"t"):"…"]].map(([a,b])=>`<div class="kpi"><b>${b}</b><span>${a}</span></div>`).join("");
 $("peerNote").textContent="Nhóm so sánh: "+D.peers.join(", ")+(D.peerSrc==="manual"?" (tự chọn).":" (6 mã vốn hóa lớn nhất cùng ngành, phân ngành ICB của VNDirect).");
 const ctx=[];
 if(D.finReady){const ys=D.years,y=ys[ys.length-1];
  const eY=med(D.peers.map(p=>F[p]?.[y]?.npG));if(num(eY))ctx.push(`Tăng trưởng LNST trung vị ngành ${yt(y)}: ${fmt(eY,"s")}.`);
  const r0=med(D.peers.map(p=>F[p]?.[ys[0]]?.roe)),r2=med(D.peers.map(p=>F[p]?.[y]?.roe));if(num(r0)&&num(r2))ctx.push(`ROE trung vị ngành ${ys[0]} → ${isP(y)?"12T đến "+y:y}: ${fmt(r0,"p")} → ${fmt(r2,"p")}.`)}
 if(pt.length&&D.vni)ctx.push(`Giá 12 tháng: trung vị ngành ${fmt(med(pt.map(x=>x.ret)),"s")} so với VN-Index ${fmt(D.vni.r12,"s")}.`);
 if(pt.length)ctx.push(`Trung vị giá ngành đang ${fmt(med(pt.map(x=>x.dd)),"s")} so với đỉnh 52 tuần.`);
 $("indCtx").innerHTML=ctx.map(c=>`<li>${c}</li>`).join("")||'<li><span class="spin" style="display:inline-block;vertical-align:middle"></span> Đang tải…</li>';

 $("tk").innerHTML=`${esc(t)}<small>${esc(D.names[t])}${D.ov.industry?" · "+esc(D.ov.industry):""}${D.ov.exchange?" · "+esc(D.ov.exchange):""}</small>`;
 $("vd").innerHTML=`<span class="verdict ${S.v.c}">${S.v.t}</span><div class="total">Điểm tổng ${num(S.total)?Math.round(S.total*100)+"%":"–"} · ngưỡng 60% / 35%</div>`;
 $("gauges").innerHTML=[["Cơ bản",S.fund],["Định giá",S.val],["Kỹ thuật",S.tech]].map(([n,v])=>`<div class="gauge"><div class="lbl">${n}<b>${num(v)?Math.round(v*100)+"%":"…"}</b></div><div class="track"><i style="width:${num(v)?Math.max(3,v*100):0}%"></i><em style="left:35%"></em><em style="left:60%"></em></div></div>`).join("");
 $("points").innerHTML=bullets(D,S).map(p=>`<li>${p}</li>`).join("");

 const dc=dealCalc(D);$("dealSec").hidden=!dc;
 if(dc){$("dealOut").innerHTML=[
  ["Số phiên giải chấp hết room",num(dc.sess)?fmt(dc.sess,"t")+" phiên":"–",num(dc.sess)?(dc.sess>10?"b":dc.sess<=5?"g":""):""],
  ["Room / KL bình quân 20 phiên",num(dc.roomDays)?fmt(dc.roomDays,"t")+" lần":"–",""],
  ["Giá chặn / giá thị trường",num(dc.capRatio)?fmt(dc.capRatio,"x"):"–",num(dc.capRatio)&&dc.capRatio>1?"b":""],
  ["Dư nợ tối đa thực tế",num(dc.maxDebt)?fmt(dc.maxDebt,"t")+" tỷ":"–",""]].map(([a,b,c])=>`<div class="kpi"><b class="${c==="b"?"tb":c==="g"?"tg":""}">${b}</b><span>${a}</span></div>`).join("");
  $("dealOut2").innerHTML=[
   ["Room / 5% SLCP lưu hành",num(dc.room5)?fmt(dc.room5,"p"):"–",num(dc.room5)?(dc.room5>1?"b":dc.room5>0.8?"":"g"):""],
   ["Giá FS ước tính",num(dc.fsPrice)?fmt(dc.fsPrice,"d")+"đ":"–",""],
   ["Khoảng cách tới giá FS",num(dc.fsGap)?fmt(dc.fsGap,"s"):"–",""],
   ["Sụt giảm tối đa 12T: mã / ngành",`${fmt(dc.mddMe,"s")} / ${fmt(dc.mddInd,"s")}`,num(dc.fsGap)&&num(dc.mddMe)?(dc.mddMe<dc.fsGap?"b":"g"):""]
  ].map(([a,b,c])=>`<div class="kpi"><b class="${c==="b"?"tb":c==="g"?"tg":""}">${b}</b><span>${a}</span></div>`).join("");
  const ff=num(D.now[D.t]?.ff)?fmt(D.now[D.t].ff,"p"):"";
  const fsTxt=num(dc.fsGap)&&num(dc.mddMe)?(dc.mddMe<dc.fsGap?` Trong 12 tháng qua mã đã từng giảm ${fmt(dc.mddMe,"s")}, sâu hơn khoảng cách tới FS: rủi ro chạm FS là có thật.`:` Mức sụt giảm tối đa 12 tháng của mã (${fmt(dc.mddMe,"s")}) chưa tới khoảng cách FS.`):"";
  $("dealNote").textContent=(num(dc.room5)&&dc.room5>1?"CẢNH BÁO: room vượt 5% SLCP lưu hành ("+fmt(dc.so*0.05,"d")+" cp). ":"")+fsTxt+" ";
  $("dealNote").textContent+=`Giá TT ${fmt(dc.last,"d")}đ; KL bình quân 20 phiên ${fmt(dc.v20,"d")} cp${ff?"; free float "+ff:""}; giả định chỉ bán được ${Math.round(dc.part*100)}% KL mỗi phiên. Dư nợ tối đa = MIN(pool; room × MIN(giá chặn, giá TT) × tỷ lệ vay).${num(dc.capRatio)&&dc.capRatio>1?" Lưu ý: giá chặn đang cao hơn giá thị trường.":""}`}
 let sn=4;if(dc){$("hDeal").textContent="4 · Khả năng xử lý tài sản đảm bảo";sn=5}
 $("hFund").textContent=sn+" · Cơ bản: xu hướng 3 năm so với ngành";$("hTech").textContent=(sn+1)+" · Kỹ thuật & thanh khoản";
 $("hBs").textContent=(sn+2)+" · Kết quả kinh doanh, nguồn vốn & dòng tiền";$("hNotes").textContent=(sn+3)+" · Thông tin định tính (tự điền)";
 renderQ(D);renderBs(D);

 if(!D.finReady){$("t3").innerHTML='<tbody><tr><td><span class="spin" style="display:inline-block;vertical-align:middle"></span> Đang tải báo cáo tài chính 3 năm của '+(D.peers.length+1)+' mã…</td></tr></tbody>';$("tp").innerHTML="";$("yrTabs").innerHTML=""}
 else{const M=D.isBank?M_BK:M_NB,ys=D.years;
  const py=ys.length>1?ys[ys.length-2]:null,ly2=ys[ys.length-1];
  let h=`<thead><tr><th>Chỉ số</th>${ys.map(y=>`<th>${yl(y)}</th>`).join("")}<th>${ly2} so với ${py||"năm trước"}</th><th>So với ngành</th></tr></thead><tbody>`;
  M.forEach(m=>{h+=`<tr><td>${m.n}${m.d<0?' <span class="sub">(càng thấp càng tốt)</span>':m.d===0?' <span class="sub">(tham khảo)</span>':""}</td>`;let win=0,cnt=0;
   ys.forEach(y=>{const x=F[t]?.[y]?.[m.k],mdr=med(D.peers.map(p=>F[p]?.[y]?.[m.k])),md=med(D.peers.map(p=>adjPE(m.k,F[p]?.[y]?.[m.k])));let c="n";
    if(m.d&&num(x)&&num(md)){const ok=(adjPE(m.k,x)-md)*m.d>0;c=ok?"g":"b";cnt++;if(ok)win++}
    h+=`<td><span class="pill ${c}">${fmt(x,m.f)}</span><div class="sub">ngành ${fmt(mdr,m.f)}</div></td>`});
   const a=py?F[t]?.[py]?.[m.k]:null,c=F[t]?.[ly2]?.[m.k];let tr="–";
   if(num(a)&&num(c)){if(m.d===0)tr=c>a?"↑ Tăng":c<a?"↓ Giảm":"Không đổi";else{const d=(adjPE(m.k,c)-adjPE(m.k,a))*m.d;tr=d>0?'<span class="tg">↑ Tốt lên</span>':d<0?'<span class="tb">↓ Xấu đi</span>':"Không đổi"}}
   const vs=!m.d||!cnt?"–":win===cnt?`<span class="tg">Hơn ngành ${win}/${cnt} năm</span>`:win===0?`<span class="tb">Kém ngành ${cnt}/${cnt} năm</span>`:`Hơn ngành ${win}/${cnt} năm`;
   h+=`<td>${tr}</td><td>${vs}</td></tr>`});
  $("t3").innerHTML=h+"</tbody>";
  $("yrTabs").innerHTML=ys.map((y,i)=>`<button type="button" class="chip" aria-pressed="${i===YR}" data-i="${i}">${y}</button>`).join("");
  $("yrTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{YR=+b.dataset.i;render()});
  const yy=ys[YR];let ph=`<thead><tr><th>Mã</th>${M.map(m=>`<th>${m.n}</th>`).join("")}</tr></thead><tbody>`;
  [...D.peers,t].forEach(p=>{ph+=`<tr class="${p===t?"me":""}"><td>${p}${isP(yy)&&D.lag?.[p]?` <span class="sub">(${D.lag[p]})</span>`:""}</td>${M.map(m=>`<td>${fmt(F[p]?.[yy]?.[m.k],m.f)}</td>`).join("")}</tr>`});
  ph+=`<tr class="med"><td>Trung vị ngành</td>${M.map(m=>`<td>${fmt(med(D.peers.map(p=>F[p]?.[yy]?.[m.k])),m.f)}</td>`).join("")}</tr>`;$("tp").innerHTML=ph+"</tbody>"}

 // kỹ thuật theo 3 giai đoạn 12 tháng, đều từ giá ngày
 const win=(x,i)=>i===0?D.tech[x]:(D.older[x]?D.older[x][i]:null);
 const cols=D.olderReady?[0,1,2]:[0];
 let w=`<thead><tr><th>Chỉ số</th>${cols.map(i=>`<th>${W_LBL[i]}</th>`).join("")}</tr></thead><tbody>`;
 TW.forEach(m=>{w+=`<tr><td>${m.n}${m.d<0?' <span class="sub">(thấp tốt)</span>':""}</td>`;
  cols.forEach(i=>{const x=win(t,i)?.[m.k],md=med(D.peers.map(p=>win(p,i)?.[m.k]));let c="n";if(num(x)&&num(md))c=(x-md)*m.d>0?"g":"b";
   w+=`<td><span class="pill ${c}">${fmt(x,m.f)}</span><div class="sub">ngành ${fmt(md,m.f)}</div></td>`});w+="</tr>"});
 $("tw").innerHTML=w+"</tbody>";
 const TM=[{k:"dd",n:"Giá vs đỉnh 52T",f:"s"},{k:"pos",n:"Vị trí 52T",f:"p"},{k:"rel6",n:"So VNI 6T",f:"s"},{k:"adtv",n:"GTGD (tỷ)",f:"t"},{k:"vol",n:"Biến động",f:"p"},{k:"beta",n:"Beta",f:"x"}];
 let th=`<thead><tr><th>Mã</th>${TM.map(m=>`<th>${m.n}</th>`).join("")}</tr></thead><tbody>`;
 [...D.peers,t].forEach(p=>{const r=D.tech[p]||{};th+=`<tr class="${p===t?"me":""}"><td>${p}</td>${TM.map(m=>`<td>${fmt(r[m.k],m.f)}</td>`).join("")}</tr>`});
 th+=`<tr class="med"><td>Trung vị ngành</td>${TM.map(m=>`<td>${fmt(med(pt.map(r=>r[m.k])),m.f)}</td>`).join("")}</tr>`;
 $("tt").innerHTML=th+"</tbody>";
 $("ttNote").textContent="Tính từ giá ngày 12 tháng gần nhất (VNDirect). Biến động = độ lệch chuẩn lợi suất ngày, quy năm. GTGD = bình quân 20 phiên. Beta tính so với VN-Index.";
 drawChart(D);
 $("foot").textContent=`Nguồn: VNDirect (phân ngành ICB, báo cáo tài chính năm và quý, P/E – P/B cuối kỳ, free float, SLCP; giá ngày 3 năm trễ 15 phút). Chỉ số tự tính: ROE, ROA = LNST cổ đông mẹ ÷ bình quân đầu – cuối năm. Điểm = phân vị của mã trong nhóm ${D.peers.length} mã so sánh (0% kém nhất, 100% tốt nhất); Cơ bản, Định giá, Kỹ thuật chia đều. Tham khảo, không phải khuyến nghị đầu tư.`}

function smaArr(a,n){return a.map((_,i)=>i<n-1?null:avg(a.slice(i-n+1,i+1)))}
function rsi(c,n=14){if(c.length<=n)return null;let g=0,l=0;for(let i=1;i<=n;i++){const d=c[i]-c[i-1];d>0?g+=d:l-=d}g/=n;l/=n;for(let i=n+1;i<c.length;i++){const d=c[i]-c[i-1];g=(g*(n-1)+Math.max(d,0))/n;l=(l*(n-1)+Math.max(-d,0))/n}return l?100-100/(1+g/l):100}
function drawChart(D){
 const bars=D.bars;if(!bars||bars.length<60){$("chart").innerHTML='<p class="src">Chưa có dữ liệu giá.</p>';$("ind").innerHTML="";return}
 const c=bars.map(b=>b.c),m20=smaArr(c,20),m50=smaArr(c,50),N=Math.min(125,c.length),off=c.length-N,cs=c.slice(off),a20=m20.slice(off),a50=m50.slice(off);
 $("chTitle").textContent=`${D.t}: giá ${N} phiên gần nhất`;
 const W=560,H=230,pl=48,pr=12,pt=12,pb=24,all=cs.concat(a20,a50).filter(num),mn=Math.min(...all),mx=Math.max(...all),sp=mx-mn||1,lo=mn-sp*.06,hi=mx+sp*.06;
 const x=i=>pl+i*(W-pl-pr)/(N-1),y=v=>pt+(hi-v)*(H-pt-pb)/(hi-lo);
 const path=a=>{let s="",on=false;a.forEach((v,i)=>{if(!num(v)){on=false;return}s+=(on?"L":"M")+x(i).toFixed(1)+","+y(v).toFixed(1);on=true});return s};
 let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ giá ${esc(D.t)}">`;
 [0,1,2,3].map(i=>lo+(hi-lo)*i/3).forEach(v=>{s+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--grid)"/><text x="${pl-6}" y="${y(v)+4}" text-anchor="end" font-size="10.5" fill="var(--muted)">${v.toFixed(1).replace(".",",")}</text>`});
 s+=`<path d="${path(cs)} L${x(N-1)},${H-pb} L${x(0)},${H-pb} Z" fill="var(--accent-soft)"/><path d="${path(a50)}" fill="none" stroke="var(--chart-c)" stroke-width="1.4"/><path d="${path(a20)}" fill="none" stroke="var(--chart-b)" stroke-width="1.6" stroke-dasharray="4 3"/><path d="${path(cs)}" fill="none" stroke="var(--chart-a)" stroke-width="2"/><circle cx="${x(N-1)}" cy="${y(cs[N-1])}" r="4" fill="var(--chart-a)"/>`;
 const dd=i=>new Date(bars[i].t*1000).toISOString().slice(0,10).split("-").reverse().slice(0,2).join("/");
 s+=`<text x="${pl}" y="${H-6}" font-size="10.5" fill="var(--muted)">${dd(off)}</text><text x="${W-pr}" y="${H-6}" font-size="10.5" text-anchor="end" fill="var(--muted)">${dd(bars.length-1)}</text><text x="${pl-6}" y="${pt-2}" font-size="10" text-anchor="end" fill="var(--muted)">nghìn đ</text></svg>`;
 $("chart").innerHTML=s;
 const last=c[c.length-1],r=rsi(c),v20=avg(bars.slice(-20).map(b=>b.v)),v60=avg(bars.slice(-60).map(b=>b.v));
 $("ind").innerHTML=[["Giá so với MA20",fmt(last/m20[m20.length-1]-1,"s")],["Giá so với MA50",fmt(last/m50[m50.length-1]-1,"s")],
  ["RSI (14)",num(r)?r.toFixed(1).replace(".",",")+(r<30?" · quá bán":r>70?" · quá mua":""):"–"],["KL 20 phiên / 60 phiên",num(v20)&&num(v60)?fmt(v20/v60,"x"):"–"]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join("")}


/* ---------- mức 1: bảng theo mẫu QTRR ---------- */
const dstr=t=>t?new Date(t*1000).toISOString().slice(0,10).split("-").reverse().join("/"):"";
function renderQ(D){
 const me=D.tech[D.t],so=sharesOut(D),cap=D.now[D.t]?.mcap,ff=num(D.now[D.t]?.ff)?fmt(D.now[D.t].ff,"p"):"";
 $("qInfo").innerHTML=[["Sàn",esc(D.ov.exchange||"–")],["SLCP lưu hành",num(so)?fmt(so,"d"):"–"],["Vốn hóa (tỷ đ)",num(cap)?fmt(cap/1e9,"d"):(num(so)&&me?fmt(so*me.p/1e9,"d"):"–")],["Free float",ff?esc(ff):"–"]]
  .map(([a,b])=>`<div class="kpi"><b>${b}</b><span>${a}</span></div>`).join("");
 if(!me){$("qTbl").innerHTML='<tbody><tr><td>Chưa có dữ liệu giá.</td></tr></tbody>';$("qNote").textContent="";return}
 const pt=D.peers.map(p=>D.tech[p]).filter(Boolean);
 let h=`<thead><tr><th>Kỳ</th><th>Thấp nhất</th><th>Cao nhất</th><th>Biên độ cao/thấp</th><th>Ngành: biên độ</th><th>KL BQ (cp)</th><th>GTGD BQ (tỷ)</th><th>Ngành: GTGD</th></tr></thead><tbody>`;
 me.q.forEach((q,i)=>{const mr=med(pt.map(x=>x.q?.[i]?.range)),ma=med(pt.map(x=>x.q?.[i]?.adtv));
  const cr=num(mr)?(q.range>mr?"b":"g"):"n",ca=num(ma)?(q.adtv>ma?"g":"b"):"n";
  h+=`<tr><td>${q.lbl}</td><td>${fmt(q.lo,"d")} <span class="sub">(${dstr(q.loD)})</span></td><td>${fmt(q.hi,"d")} <span class="sub">(${dstr(q.hiD)})</span></td><td><span class="pill ${cr}">${fmt(q.range,"p")}</span></td><td>${fmt(mr,"p")}</td><td>${fmt(q.vol,"d")}</td><td><span class="pill ${ca}">${fmt(q.adtv,"t")}</span></td><td>${fmt(ma,"t")}</td></tr>`});
 $("qTbl").innerHTML=h+"</tbody>";
 $("qNote").textContent=`Giá tham chiếu ${fmt(me.p,"d")}đ (phiên ${(D.asof||"").split("-").reverse().join("/")}). Biên độ thấp hơn ngành = ít biến động hơn (xanh). Nguồn: VNDirect.${me.q[0].n<249?` Mã chỉ có ${me.q[0].n} phiên dữ liệu.`:""}`}

/* ---------- mức 2: KQKD, nguồn vốn, dòng tiền (báo cáo năm, tỷ đồng) ---------- */
const BS_ROWS=[["Doanh thu thuần","rev"],["Lợi nhuận gộp","gp"],["LN thuần HĐKD","op"],["LNST","npAll"],["LNST cổ đông mẹ","np"],
 ["Tổng tài sản","ta"],["Tài sản ngắn hạn","ca"],["Nợ phải trả","liab"],["Nợ ngắn hạn","stl"],["Vay ngắn hạn","sd"],["Vay dài hạn","ld"],["Vốn chủ sở hữu","eq"],["Tiền và tương đương tiền","cash"],["Dòng tiền kinh doanh (CFO)","cfo"]];
const BS_ROWS_BK=[["Thu nhập lãi thuần","nii"],["Tổng thu nhập hoạt động","toi"],["LN trước dự phòng","ppop"],["LNST","npAll"],["LNST cổ đông mẹ","np"],
 ["Tổng tài sản","ta"],["Cho vay khách hàng","loan"],["Tiền gửi khách hàng","dep"],["Vốn chủ sở hữu","eq"],["Dòng tiền kinh doanh (CFO)","cfo"]];
const bsRows=D=>D.isBank?BS_ROWS_BK:BS_ROWS;
const stv=(D,x,y,k)=>D.st?.[x]?.[y]?.[k];
function bsMetrics(D,x){if(D.isBank)return{};const ys=D.years||[],y=ys[ys.length-1],b=D.st?.[x]?.[y];if(!b)return{};
 const cfo=ys.filter(yy=>!isP(yy)).map(yy=>stv(D,x,yy,"cfo")).filter(num),e=b.eq,c12=num(b.cfo12)?b.cfo12:b.cfo;
 return{stlE:num(b.stl)&&e?b.stl/e:null,sdE:num(b.sd)&&e?b.sd/e:null,
  cashSd:num(b.cash)&&b.sd>0?b.cash/b.sd:null,cfoE:num(c12)&&e?c12/e:null,cfoPos:cfo.length?cfo.filter(v=>v>0).length:null}}
const BS_CMP=[{k:"stlE",n:"Nợ ngắn hạn / VCSH",d:-1,f:"x"},{k:"sdE",n:"Vay ngắn hạn / VCSH",d:-1,f:"x"},{k:"cashSd",n:"Tiền mặt / vay ngắn hạn",d:1,f:"x"},{k:"cfoE",n:"CFO 12T / VCSH",d:1,f:"p"},{k:"cfoPos",n:"Số năm CFO dương (/3)",d:1,f:"t"}];
function renderBs(D){
 const box=$("bsBox"),outEl=$("bsOut");
 if(!D.finReady||!D.st?.[D.t]){box.hidden=false;$("bsMsg").textContent="Chưa có báo cáo tài chính năm của mã này.";outEl.hidden=true;return}
 box.hidden=true;outEl.hidden=false;const ys=D.years,t=D.t;
 let h=`<thead><tr><th>Chỉ tiêu (tỷ đ)</th>${ys.map(y=>`<th>${ylBs(y)}</th>`).join("")}</tr></thead><tbody>`;
 bsRows(D).forEach(([lbl,k])=>{h+=`<tr><td>${lbl}</td>${ys.map(y=>{const v=stv(D,t,y,k);return `<td${(k==="cfo"||k==="np")&&num(v)&&v<0?' class="tb"':""}>${fmt(v,"d")}</td>`}).join("")}</tr>`});
 $("bsTbl").innerHTML=h+"</tbody>";
 const cmpWrap=$("bsCmp").closest(".tbl"),cmpH=cmpWrap.previousElementSibling;cmpWrap.hidden=cmpH.hidden=D.isBank;
 if(D.isBank)return;
 const rows=[...D.peers,t],ms=Object.fromEntries(rows.map(x=>[x,bsMetrics(D,x)]));
 let c=`<thead><tr><th>Mã</th>${BS_CMP.map(m=>`<th>${m.n}</th>`).join("")}</tr></thead><tbody>`;
 rows.forEach(x=>{c+=`<tr class="${x===t?"me":""}"><td>${x}</td>${BS_CMP.map(m=>`<td>${fmt(ms[x][m.k],m.f)}</td>`).join("")}</tr>`});
 c+=`<tr class="med"><td>Trung vị ngành</td>${BS_CMP.map(m=>`<td>${fmt(med(D.peers.map(p=>ms[p][m.k])),m.f)}</td>`).join("")}</tr>`;
 $("bsCmp").innerHTML=c+"</tbody>"}
function bsBullets(D){if(!D.finReady||D.isBank)return[];const me=bsMetrics(D,D.t),pts=[];const mm=k=>med(D.peers.map(p=>bsMetrics(D,p)[k]));
 if(num(me.stlE)&&num(mm("stlE")))pts.push(`Nợ ngắn hạn/VCSH ${fmt(me.stlE,"x")} so với ngành ${fmt(mm("stlE"),"x")}${me.stlE>mm("stlE")?" – áp lực đảo nợ cao hơn ngành":" – thấp hơn ngành"}.`);
 if(num(me.cfoPos))pts.push(`Dòng tiền kinh doanh dương ${me.cfoPos}/${(D.years||[]).filter(y=>!isP(y)).length} năm (trung vị ngành ${fmt(mm("cfoPos"),"t")}).`);
 return pts}

/* ---------- mức 3: ghi chú định tính ---------- */
const NK=[["n_pledge","Cổ phiếu cổ đông nội bộ cầm cố"],["n_warn","Diện cảnh báo/kiểm soát/hạn chế GD"],["n_margin","Thuộc danh mục ký quỹ của Sở"],["n_conc","Tỷ trọng dư nợ ngành / VCSH SBSI (%)"],["n_issue","Phát hành, trái phiếu đáo hạn 12T"],["n_other","Ghi chú khác"]];
function loadNotes(t){try{const s=JSON.parse(localStorage.getItem("smtn-notes-"+t)||"{}");NK.forEach(([k])=>$(k).value=s[k]||"")}catch(e){NK.forEach(([k])=>$(k).value="")}}
function notesList(){return NK.map(([k,l])=>[l,$(k).value]).filter(([,v])=>String(v).trim()!=="")}
NK.forEach(([k])=>$(k).addEventListener("input",()=>{if(!STATE)return;try{const o={};NK.forEach(([x])=>o[x]=$(x).value);localStorage.setItem("smtn-notes-"+STATE.t,JSON.stringify(o))}catch(e){}}));

/* ---------- xuất file ---------- */
function save(name,data){try{const u=URL.createObjectURL(data),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
 catch(e){status("warn","Không lưu được file: "+esc(e&&e.message||e))}}
const fileBase=()=>`SoiMa_${STATE.t}_${(STATE.asof||"").replace(/-/g,"")}`;
function exportXlsx(){
 const D=STATE,S=score(D),M=D.isBank?M_BK:M_NB,ys=D.years,rows=[...D.peers,D.t],dc=dealCalc(D),pc=v=>num(v)?Math.round(v*1000)/1000:null,wb=XLSX.utils.book_new();
 const sum=[["SOI MÃ THEO NGÀNH – "+D.t],["Doanh nghiệp",D.names[D.t]],["Ngành",D.ov.industry||""],["Giá đến phiên",D.asof],["Nhóm so sánh",D.peers.join(", ")],[],
  ["Kết luận",S.v.t],["Điểm tổng",pc(S.total)],["Điểm Cơ bản",pc(S.fund)],["Điểm Định giá",pc(S.val)],["Điểm Kỹ thuật",pc(S.tech)],["Ngưỡng","≥60% Mạnh hơn ngành; <35% Rủi ro riêng"],[],["Nhận định"],...bullets(D,S).map(b=>["• "+b])];
 if(dc)sum.push([],["THÔNG SỐ DEAL"],["Tỷ lệ vay",dc.ratio||null],["Giá chặn (đ)",dc.cap||null],["Room (cp)",dc.room||null],["Pool (tỷ đ)",dc.pool||null],["Giá TT (đ)",dc.last],["KL BQ 20 phiên (cp)",Math.round(dc.v20||0)],["Bán tối đa / KL phiên",dc.part],["Số phiên giải chấp room",pc(dc.sess)],["Giá chặn / giá TT",pc(dc.capRatio)],["Dư nợ tối đa thực tế (tỷ đ)",pc(dc.maxDebt)],["Room / 5% SLCP lưu hành",pc(dc.room5)],["Tỷ lệ ban đầu / FS",(dc.init!=null?Math.round(dc.init*100)+"%":"–")+" / "+(dc.fs!=null?Math.round(dc.fs*100)+"%":"–")],["Giá FS ước tính (đ)",dc.fsPrice?Math.round(dc.fsPrice):null],["Khoảng cách tới FS",pc(dc.fsGap)],["Sụt giảm tối đa 12T – mã",pc(dc.mddMe)],["Sụt giảm tối đa 12T – trung vị ngành",pc(dc.mddInd)]);
 const nl=notesList();if(nl.length)sum.push([],["THÔNG TIN ĐỊNH TÍNH"],...nl);
 sum.push([],["Nguồn: VNDirect (phân ngành ICB, báo cáo tài chính, định giá, giá). Tham khảo, không phải khuyến nghị đầu tư."]);
 const ws1=XLSX.utils.aoa_to_sheet(sum);ws1["!cols"]=[{wch:30},{wch:70}];XLSX.utils.book_append_sheet(wb,ws1,"Tong quan");
 const f=[["Mã","Năm",...M.map(m=>m.n)]];
 ys.forEach(y=>{rows.forEach(p=>f.push([p,y,...M.map(m=>pc(D.fin[p]?.[y]?.[m.k]))]));f.push(["Trung vị ngành",y,...M.map(m=>pc(med(D.peers.map(p=>D.fin[p]?.[y]?.[m.k]))))]);f.push([])});
 const ws2=XLSX.utils.aoa_to_sheet(f);ws2["!cols"]=[{wch:16},{wch:7},...M.map(()=>({wch:14}))];XLSX.utils.book_append_sheet(wb,ws2,"Co ban 3 nam");
 const win=(x,i)=>i===0?D.tech[x]:(D.older[x]?D.older[x][i]:null),cols=D.olderReady?[0,1,2]:[0];
 const k=[["Mã","Giai đoạn",...TW.map(m=>m.n)]];
 cols.forEach(i=>{rows.forEach(p=>k.push([p,W_LBL[i],...TW.map(m=>pc(win(p,i)?.[m.k]))]));k.push(["Trung vị ngành",W_LBL[i],...TW.map(m=>pc(med(D.peers.map(p=>win(p,i)?.[m.k]))))]);k.push([])});
 k.push(["Hiện tại"],["Mã","Giá (đ)","Giá vs đỉnh 52T","Vị trí 52T","Đỉnh 52T","Đáy 52T","So VNI 6T","Beta"]);
 rows.forEach(p=>{const r=D.tech[p]||{};k.push([p,r.p,pc(r.dd),pc(r.pos),r.hi,r.lo,pc(r.rel6),pc(r.beta)])});
 const ws3=XLSX.utils.aoa_to_sheet(k);ws3["!cols"]=[{wch:16},{wch:14},...TW.map(()=>({wch:16}))];XLSX.utils.book_append_sheet(wb,ws3,"Ky thuat");
 const me=D.tech[D.t],so=sharesOut(D),q=[["THEO MẪU PHIẾU QTRR – "+D.t],["Sàn",D.ov.exchange||""],["SLCP lưu hành",so?Math.round(so):null],["Free float",num(D.now[D.t]?.ff)?Math.round(D.now[D.t].ff*1000)/1000:""],["Giá tham chiếu (đ)",me?Math.round(me.p):null],[],["Kỳ","Thấp nhất","Ngày","Cao nhất","Ngày","Biên độ","Ngành: biên độ","KL BQ (cp)","GTGD BQ (tỷ)","Ngành: GTGD"]];
 if(me){const pt=D.peers.map(p=>D.tech[p]).filter(Boolean);me.q.forEach((x,i)=>q.push([x.lbl,Math.round(x.lo),dstr(x.loD),Math.round(x.hi),dstr(x.hiD),pc(x.range),pc(med(pt.map(y=>y.q?.[i]?.range))),Math.round(x.vol),pc(x.adtv),pc(med(pt.map(y=>y.q?.[i]?.adtv)))]))}
 if(D.finReady){q.push([],["KẾT QUẢ KINH DOANH & NGUỒN VỐN (tỷ đ)",...ys.map(String)]);bsRows(D).forEach(([l,kk])=>q.push([l,...ys.map(y=>{const v=stv(D,D.t,y,kk);return num(v)?Math.round(v):null})]));}
 if(D.finReady&&!D.isBank){
  q.push([],["So với ngành (kỳ gần nhất)","Mã",...BS_CMP.map(m=>m.n)]);[...D.peers,D.t].forEach(x=>{const mm=bsMetrics(D,x);q.push(["",x,...BS_CMP.map(m=>pc(mm[m.k]))])});q.push(["","Trung vị ngành",...BS_CMP.map(m=>pc(med(D.peers.map(p=>bsMetrics(D,p)[m.k]))))])}
 const ws4=XLSX.utils.aoa_to_sheet(q);ws4["!cols"]=[{wch:30},{wch:14},{wch:12},{wch:14},{wch:12},{wch:12},{wch:14},{wch:14},{wch:14},{wch:14}];XLSX.utils.book_append_sheet(wb,ws4,"Mau QTRR");
 save(fileBase()+".xlsx",new Blob([XLSX.write(wb,{bookType:"xlsx",type:"array"})]))}
function reportHtml(){
 const D=STATE,S=score(D),M=D.isBank?M_BK:M_NB,ys=D.years,dc=dealCalc(D),t=D.t,g=v=>num(v)?Math.round(v*100)+"%":"–";
 const cell=(x,md,m)=>{let c="";if(m.d&&num(x)&&num(md))c=(adjPE(m.k,x)-adjPE(m.k,md))*m.d>0?"g":"b";return `<td class="${c}">${fmt(x,m.f)}</td><td>${fmt(md,m.f)}</td>`};
 let f=`<table><thead><tr><th style="text-align:left">Chỉ số</th>${ys.map(y=>`<th>${isP(y)?y+' (12T)':y}<br>${t}</th><th>${isP(y)?y:y}<br>Ngành</th>`).join("")}</tr></thead><tbody>`;
 M.forEach(m=>{f+=`<tr><td style="text-align:left">${m.n}</td>${ys.map(y=>cell(D.fin[t]?.[y]?.[m.k],med(D.peers.map(p=>D.fin[p]?.[y]?.[m.k])),m)).join("")}</tr>`});f+="</tbody></table>";
 const win=(x,i)=>i===0?D.tech[x]:(D.older[x]?D.older[x][i]:null),cols=D.olderReady?[0,1,2]:[0];
 let k=`<table><thead><tr><th style="text-align:left">Chỉ số</th>${cols.map(i=>`<th>${W_LBL[i]}<br>${t}</th><th>Ngành</th>`).join("")}</tr></thead><tbody>`;
 TW.forEach(m=>{k+=`<tr><td style="text-align:left">${m.n}</td>${cols.map(i=>{const x=win(t,i)?.[m.k],md=med(D.peers.map(p=>win(p,i)?.[m.k]));let c="";if(num(x)&&num(md))c=(x-md)*m.d>0?"g":"b";return `<td class="${c}">${fmt(x,m.f)}</td><td>${fmt(md,m.f)}</td>`}).join("")}</tr>`});k+="</tbody></table>";
 const vc=S.v.c==="v-good"?"#1E7F45":S.v.c==="v-bad"?"#C2352B":"#9A5F05";
 return `<div class="rhead">${$("brandLogo").innerHTML.trim().replace("<svg","<svg width=\"30\" height=\"30\"")}<b style="font-family:var(--f-brand);letter-spacing:.06em;font-size:15px">TOP BROKER</b><span style="margin-left:auto;font-size:11px;color:#B3A891">Soi Mã Theo Ngành</span></div><div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #A3211B;padding-bottom:8px"><div><h1>${esc(t)} · ${esc(D.names[t])}</h1><div>${D.ov.industry?"Ngành "+esc(D.ov.industry)+" · ":""}Nhóm so sánh: ${D.peers.join(", ")}</div></div><div style="text-align:right">Giá đến ${(D.asof||"").split("-").reverse().join("/")}<br>Soi Mã Theo Ngành</div></div>
 <h4>Kết luận</h4><div class="box"><b style="color:${vc};font-size:14px">${S.v.t}</b> &nbsp;·&nbsp; Điểm tổng ${g(S.total)} (Cơ bản ${g(S.fund)} · Định giá ${g(S.val)} · Kỹ thuật ${g(S.tech)}; ngưỡng ≥60% / &lt;35%)
 <ul style="margin:6px 0 0;padding-left:16px">${bullets(D,S).map(b=>`<li>${b}</li>`).join("")}</ul></div>
 ${dc?`<h4>Deal margin</h4><div class="box">Tỷ lệ ${dc.ratio?Math.round(dc.ratio*100)+"%":"–"} · Giá chặn ${dc.cap?fmt(dc.cap,"d")+"đ":"–"} · Room ${dc.room?fmt(dc.room,"d"):"–"} cp · Pool ${dc.pool||"–"} tỷ · Giá TT ${fmt(dc.last,"d")}đ<br><b>Số phiên giải chấp room: ${fmt(dc.sess,"t")}</b> (bán ${Math.round(dc.part*100)}% KL/phiên, KL BQ 20 phiên ${fmt(dc.v20,"d")} cp) · Giá chặn/giá TT ${fmt(dc.capRatio,"x")} · Dư nợ tối đa thực tế ${fmt(dc.maxDebt,"t")} tỷ<br>Room/5% SLCP: <b class="${num(dc.room5)&&dc.room5>1?"b":""}">${fmt(dc.room5,"p")}</b> · Giá FS ước tính ${fmt(dc.fsPrice,"d")}đ (cách giá TT ${fmt(dc.fsGap,"s")}) · Sụt giảm tối đa 12T: mã ${fmt(dc.mddMe,"s")}, ngành ${fmt(dc.mddInd,"s")}</div>`:""}
 ${qHtml(D)}
 <h4>Cơ bản 3 năm – ${t} so với trung vị ngành</h4>${f}
 <h4>Kỹ thuật & thanh khoản</h4>${k}${bsHtml(D)}${notesList().length?`<h4>Thông tin định tính</h4><div class="box">${notesList().map(([l,v])=>`<b>${l}:</b> ${esc(v)}`).join("<br>")}</div>`:""}
 <p style="color:#6E6A66;margin-top:14px">Nguồn: VNDirect (phân ngành ICB, báo cáo tài chính, định giá, giá ngày). Điểm = phân vị trong nhóm ${D.peers.length} mã so sánh; xanh = tốt hơn ngành, đỏ = kém hơn. Tài liệu tham khảo, không phải khuyến nghị đầu tư.</p>`}
function qHtml(D){const me=D.tech[D.t];if(!me)return "";const pt=D.peers.map(p=>D.tech[p]).filter(Boolean);
 return `<h4>Theo mẫu phiếu QTRR</h4><table><thead><tr><th style="text-align:left">Kỳ</th><th>Thấp nhất</th><th>Cao nhất</th><th>Biên độ</th><th>Ngành</th><th>KL BQ (cp)</th><th>GTGD (tỷ)</th><th>Ngành</th></tr></thead><tbody>${me.q.map((q,i)=>`<tr><td style="text-align:left">${q.lbl}</td><td>${fmt(q.lo,"d")} (${dstr(q.loD)})</td><td>${fmt(q.hi,"d")} (${dstr(q.hiD)})</td><td>${fmt(q.range,"p")}</td><td>${fmt(med(pt.map(x=>x.q?.[i]?.range)),"p")}</td><td>${fmt(q.vol,"d")}</td><td>${fmt(q.adtv,"t")}</td><td>${fmt(med(pt.map(x=>x.q?.[i]?.adtv)),"t")}</td></tr>`).join("")}</tbody></table>
 <div style="margin-top:4px;color:#6E6A66">SLCP lưu hành ${fmt(sharesOut(D),"d")} · Free float ${fmt(D.now[D.t]?.ff,"p")} · Giá tham chiếu ${fmt(me.p,"d")}đ</div>`}
function bsHtml(D){if(!D.finReady)return "";const ys=D.years,t=D.t,keep=D.isBank?["Thu nhập lãi thuần","LNST cổ đông mẹ","Tổng tài sản","Cho vay khách hàng","Tiền gửi khách hàng","Vốn chủ sở hữu"]:["Doanh thu thuần","LNST cổ đông mẹ","Tổng tài sản","Nợ phải trả","Nợ ngắn hạn","Vốn chủ sở hữu","Dòng tiền kinh doanh (CFO)"];
 const me=bsMetrics(D,t),mm=k=>med(D.peers.map(p=>bsMetrics(D,p)[k]));
 return `<h4>KQKD & nguồn vốn (tỷ đ)</h4><table><thead><tr><th style="text-align:left">Chỉ tiêu</th>${ys.map(y=>`<th>${isP(y)?(D.period?.ytd||y):y}</th>`).join("")}</tr></thead><tbody>${bsRows(D).filter(r=>keep.includes(r[0])).map(([l,k])=>`<tr><td style="text-align:left">${l}</td>${ys.map(y=>`<td>${fmt(stv(D,t,y,k),"d")}</td>`).join("")}</tr>`).join("")}</tbody></table>
 ${D.isBank?"":`<div style="margin-top:4px">${BS_CMP.map(m=>`${m.n}: <b>${fmt(me[m.k],m.f)}</b> (ngành ${fmt(mm(m.k),m.f)})`).join(" · ")}</div>`}`}
async function exportPdf(){const r=$("report");r.innerHTML=reportHtml();
 try{const canvas=await html2canvas(r,{scale:2,backgroundColor:"#FFFCF6"}),{jsPDF}=window.jspdf,pdf=new jsPDF({unit:"pt",format:"a4"});
  const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),M=28;
  const k=canvas.width/r.offsetWidth,top0=r.getBoundingClientRect().top,pxPerPt=canvas.width/pw;
  // Điểm được phép ngắt trang: đáy của từng dòng bảng, đoạn văn, khung, mục danh sách (không ngắt ngay sau tiêu đề h4 hay đầu bảng)
  const cuts=[...r.querySelectorAll("tbody tr,.box,p,li,.rhead,table")].map(el=>Math.round((el.getBoundingClientRect().bottom-top0)*k)).filter(v=>v>0);
  r.querySelectorAll("h4").forEach(h=>{const t=Math.round((h.getBoundingClientRect().top-top0)*k);cuts.push(t)});
  cuts.push(canvas.height);cuts.sort((a,b)=>a-b);
  // Mục ngắn (tiêu đề + bảng/khung ngay sau, cao dưới 60% trang) giữ trọn trên một trang
  const full=Math.floor((ph-2*M)*pxPerPt),keep=[...r.querySelectorAll("h4")].map(h=>{const n=h.nextElementSibling;if(!n)return null;
   const s=Math.round((h.getBoundingClientRect().top-top0)*k),e=Math.round((n.getBoundingClientRect().bottom-top0)*k);return e-s<full*0.6?[s,e]:null}).filter(Boolean);
  const okCut=c=>!keep.some(([s,e])=>c>s+2&&c<e-2);
  const pages=[];let y=0;
  while(y<canvas.height-4){const room=Math.floor(((pages.length?ph-2*M:ph-M))*pxPerPt);
   let cut=cuts.filter(c=>c>y+room*0.35&&c<=y+room&&okCut(c)).pop()||cuts.filter(c=>c>y+room*0.35&&c<=y+room).pop();if(!cut)cut=Math.min(y+room,canvas.height);
   pages.push([y,cut]);y=cut}
  pages.forEach(([a,b],i)=>{if(i)pdf.addPage();const c=document.createElement("canvas");c.width=canvas.width;c.height=b-a;
   const g=c.getContext("2d");g.fillStyle="#FFFCF6";g.fillRect(0,0,c.width,c.height);g.drawImage(canvas,0,a,c.width,b-a,0,0,c.width,b-a);
   pdf.setFillColor(255,252,246);pdf.rect(0,0,pw,ph,"F");
   pdf.addImage(c.toDataURL("image/jpeg",0.92),"JPEG",0,i?M:0,pw,(b-a)/pxPerPt);
   pdf.setFontSize(8);pdf.setTextColor(139,137,132);pdf.text(`${i+1}/${pages.length}`,pw-M,ph-12,{align:"right"})});
  await save(fileBase()+".pdf",pdf.output("blob"))}
 catch(e){status("warn","Không tạo được PDF: "+esc(e&&e.message||e))}finally{r.innerHTML=""}}


function getRecent(){try{return JSON.parse(localStorage.getItem("smtn-recent")||"[]")}catch(e){return[]}}
function pushRecent(t){try{const r=[t,...getRecent().filter(x=>x!==t)].slice(0,6);localStorage.setItem("smtn-recent",JSON.stringify(r))}catch(e){}renderRecent()}
function renderRecent(){const r=getRecent(),el=$("recent");if(!r.length){el.textContent="Ví dụ: HPG, VPB, KBC, DGC, MWG.";return}
 el.innerHTML='<span>Đã soi gần đây:</span>'+r.map(t=>`<button type="button" class="chip" data-t="${esc(t)}">${esc(t)}</button>`).join("");
 el.querySelectorAll("button").forEach(b=>b.onclick=()=>{$("q").value=b.dataset.t;$("f").requestSubmit?$("f").requestSubmit():$("f").dispatchEvent(new Event("submit",{cancelable:true}))})}
renderRecent();
/* ---------- gắn sự kiện ---------- */
const DK=["d_ratio","d_cap","d_room","d_pool","d_part","d_init","d_fs","d_peers"];
function loadDeal(t){try{const s=JSON.parse(localStorage.getItem("smtn-deal-"+t)||"null");DK.forEach(k=>{if(!["d_part","d_init","d_fs"].includes(k))$(k).value=s&&s[k]!=null?s[k]:""});$("d_part").value=s&&s.d_part?s.d_part:20;$("d_init").value=s&&s.d_init?s.d_init:70;$("d_fs").value=s&&s.d_fs?s.d_fs:45;if(s&&(s.d_room||s.d_cap||s.d_peers))$("dealbox").open=true}catch(e){}}
DK.forEach(k=>$(k).addEventListener("input",()=>{if(!STATE)return;try{const o={};DK.forEach(x=>o[x]=$(x).value);localStorage.setItem("smtn-deal-"+STATE.t,JSON.stringify(o))}catch(e){}if(k!=="d_peers")render()}));
$("f").addEventListener("submit",e=>{e.preventDefault();const t=$("q").value.trim().toUpperCase();
 if(!/^[A-Z0-9]{3,6}$/.test(t)){status("warn","Nhập mã cổ phiếu 3–6 ký tự, ví dụ VPI.");return}
 if(!STATE||STATE.t!==t)loadDeal(t);analyze(t)});
$("xl").onclick=()=>STATE&&STATE.finReady&&exportXlsx();$("pdf").onclick=()=>STATE&&STATE.finReady&&exportPdf();
(()=>{let last="";try{last=localStorage.getItem("smtn-last")||""}catch(e){}
 const qs=new URLSearchParams(location.search).get("ma");if(qs&&/^[A-Za-z0-9]{3,6}$/.test(qs))last=qs.toUpperCase();
 $("q").value=last;if(last){loadDeal(last);analyze(last)}})();
