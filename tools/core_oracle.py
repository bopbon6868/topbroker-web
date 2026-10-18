import math
rows=[('HPG',2000,27000),('VPB',3000,20500),('NVL',5000,13000),('SSI',2000,33000),('MWG',500,120000)]
C,D=20e6,150e6
def tick(p): return 10 if p<10000 else 50 if p<50000 else 100
def fl(p):
    raw=p*0.93; t=tick(raw); f=math.ceil(raw/t-1e-9)*t
    return f
def rtt(px,excl=()):
    A=sum(q*px[s] for s,q,_ in rows if s not in excl)+C
    return (A-D)/A
def sessions(thr,only=None,excl=()):
    px={s:p for s,_,p in rows}
    for n in range(1,31):
        for s,_,_ in rows:
            if only is None or s==only: px[s]=fl(px[s])
        if rtt(px,excl)<thr: return n,dict(px)
    return None
print('all->call',sessions(.4)); print('all->force',sessions(.3))
for s,_,_ in rows: print(s,'alone->call',sessions(.4,s))
print('NVL excl all->call',sessions(.4,excl=('NVL',)))
# S4 stressed target .45 HPG
mv=306.5e6*.75;A=mv+C;n=A-D;need=.45*A-n;S=need/(.45-.0025);print('S4 rtt',n/A,'need',need,'S',S,'sh',S/20250)
print('legacy S3', 1-(D/(1-.4/((111.5/261.5)/(176.5/326.5)))-C)/306.5e6)
