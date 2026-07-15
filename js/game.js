// ============================================================
//  LA MATANZA ROAD FIGHTER v3
//  Perspectiva corregida: enemies spawnean en horizonte,
//  escalan con profundidad, nunca caen desde el cielo.
// ============================================================
(function(){
'use strict';

const W=224, H=320;
const HY=60;           // horizon Y
const RHL=W/2-16, RHR=W/2+16;   // road at horizon
const RBL=18,    RBR=206;        // road at base
const PLAYER_Y = H-52;

const DIFF={
  EASY:  {sm:0.7, er:0.015,fb:0.013,es:1.1},
  NORMAL:{sm:1.0, er:0.023,fb:0.019,es:1.5},
  HARD:  {sm:1.3, er:0.032,fb:0.027,es:2.0}
};
const ZONES=[
  {name:'LA MATANZA',sky:'#6ad4f0',grass:'#4a8a10',road:'#808080',line:'#fff',dist:0,   bus:'busLaMatanza',busLabel:'LINEA 236'},
  {name:'LINIERS',   sky:'#5ab8e0',grass:'#3a7010',road:'#787878',line:'#ffd700',dist:500, bus:'busLiniers',  busLabel:'LINEA 86'},
  {name:'CABALLITO', sky:'#4aa0d0',grass:'#2a6030',road:'#888',   line:'#ff8800',dist:1000,bus:'busCaballito',busLabel:'LINEA 88'},
  {name:'PALERMO',   sky:'#3a88c0',grass:'#1a5040',road:'#909090',line:'#fff',   dist:1500,bus:'busPalermo',  busLabel:'LINEA 620'},
  {name:'RETIRO',    sky:'#2a6090',grass:'#0a3050',road:'#707070',line:'#0cf',   dist:2000,bus:'busRetiro',   busLabel:'LINEA 622'},
];

const ETYPES=[
  {sp:'carRed',   bw:14,bh:22,spd:1.3},
  {sp:'carBlue',  bw:14,bh:22,spd:1.5},
  {sp:'carYellow',bw:14,bh:22,spd:0.7},
  {sp:'carPurple',bw:14,bh:22,spd:1.15,swerve:true},
  {sp:'moto',     bw:8, bh:16,spd:1.9},
  {sp:'truck',    bw:18,bh:32,spd:0.45,dropsOil:true},
];
// colectivos "comodín": pueden aparecer en cualquier zona, además del propio de la zona
const BUS_EXTRAS=['busExtra1','busExtra2'];

let canvas,ctx,sc=1,state='TITLE',diff=DIFF.NORMAL;
let hi=0;try{hi=parseInt(localStorage.getItem('rf_hi')||'0');}catch(e){}
let pl,enemies,parts,fcans,oils;
let score,fuel,lives,zone,zi,dist,spd,tspd,fc,lt,dtimer;
let keys,pad,co,ct,fwt,lfws;
let noCrash,bonus;
let overlay,msgbox;

// ---- PERSPECTIVE HELPERS ----
function prog(y){return Math.max(0,Math.min(1,(y-HY)/(H-HY)));}
function rX(side,y,curve){
  curve=curve||0;
  const p=prog(y);
  const tx=side==='L'?RHL:RHR, bx=side==='L'?RBL:RBR;
  return tx+(bx-tx)*p+curve*p*0.18;
}

// ---- INIT ----
function init(){
  canvas=document.getElementById('game');
  ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  resize();
  window.addEventListener('resize',resize);
  keys={};
  window.addEventListener('keydown',e=>{
    keys[e.code]=true;
    if(e.code==='KeyM')tmute();
    if(state==='TITLE'&&(e.code==='Enter'||e.code==='Space'))startGame();
  });
  window.addEventListener('keyup',e=>{keys[e.code]=false;});
  pad={left:false,right:false};
  buildOv();showTitle();requestAnimationFrame(loop);
}

function resize(){
  const vw=window.innerWidth,vh=window.innerHeight;
  const hudW=vw<480?0:(vw<700?90:130);
  sc=Math.max(1,Math.min(3,Math.floor(Math.min((vw-hudW)/W,vh/H))));
  canvas.width=W*sc;canvas.height=H*sc;
  canvas.style.width=(W*sc)+'px';canvas.style.height=(H*sc)+'px';
  ctx.imageSmoothingEnabled=false;
}

// ---- OVERLAY ----
function buildOv(){
  overlay=document.createElement('div');overlay.id='overlay';
  overlay.innerHTML=`
    <div class="ov-logo">LA MATANZA<br>ROAD FIGHTER</div>
    <div class="ov-sub">KONAMI-STYLE · LA MATANZA DEV</div>
    <div class="ov-diff">
      <button class="diff-btn" id="dEasy">EASY</button>
      <button class="diff-btn active" id="dNormal">NORMAL</button>
      <button class="diff-btn" id="dHard">HARD</button>
    </div>
    <div class="ov-menu">
      <button class="ov-btn" id="btnStart">&#9654;  PRESS START</button>
      <button class="ov-btn" id="btnMute">&#9834;  MUSIC: ON</button>
    </div>
    <div class="ov-hiscore">HI-SCORE: <span id="ovHi">000000</span></div>
    <div class="ov-copy">FLECHAS &#8592; &#8594; O BOTONES TACTILES</div>
  `;
  document.body.appendChild(overlay);

  msgbox=document.createElement('div');msgbox.id='msgbox';msgbox.className='hidden';
  msgbox.innerHTML=`<div class="msg-title" id="msgTitle"></div><div class="msg-sub" id="msgSub"></div>`;
  document.body.appendChild(msgbox);

  document.getElementById('btnStart').onclick=()=>{Audio8.init();Audio8.resume();startGame();};
  document.getElementById('btnMute').onclick=tmute;
  ['Easy','Normal','Hard'].forEach(d=>{
    document.getElementById('d'+d).onclick=()=>{
      diff=DIFF[d.toUpperCase()];
      document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('active'));
      document.getElementById('d'+d).classList.add('active');
    };
  });
  updHi();
}

function showTitle(){state='TITLE';overlay.classList.remove('hidden');msgbox.classList.add('hidden');updHi();}
function updHi(){
  const a=document.getElementById('ovHi');if(a)a.textContent=String(hi).padStart(6,'0');
  const b=document.getElementById('hiscore');if(b)b.textContent=String(hi).padStart(6,'0');
}
function tmute(){
  Audio8.init();Audio8.setMute(!Audio8.muted);
  const btn=document.getElementById('btnMute');
  if(btn)btn.textContent=Audio8.muted?'\u266a  MUSIC: OFF':'\u266a  MUSIC: ON';
  if(!Audio8.muted&&state==='PLAYING'){Audio8.startBGM();Audio8.startEngine();}
}
function showMsg(t,s){
  msgbox.classList.remove('hidden');
  document.getElementById('msgTitle').textContent=t;
  document.getElementById('msgSub').textContent=s;
}

// ---- START ----
function startGame(){
  overlay.classList.add('hidden');msgbox.classList.add('hidden');
  score=0;fuel=100;lives=3;zi=0;zone=ZONES[0];dist=0;spd=0;tspd=1.5*diff.sm;
  fc=0;lt=null;dtimer=0;co=0;ct=0;fwt=0;lfws=0;noCrash=0;bonus=null;
  pl={x:W/2-7,y:PLAYER_Y,w:14,h:24,vx:0,inv:0};
  enemies=[];parts=[];fcans=[];oils=[];
  state='PLAYING';
  Audio8.init();Audio8.resume();Audio8.sfxStart();
  setTimeout(()=>{Audio8.startBGM();Audio8.startEngine();},800);
  updHUD();
}

// ---- LOOP ----
function loop(ts){
  requestAnimationFrame(loop);
  const dt=lt?Math.min((ts-lt)/1000,0.05):0.016;lt=ts;fc++;
  ctx.save();ctx.scale(sc,sc);
  if(state==='PLAYING'||state==='DEAD'){upd(dt);draw();}
  else{drawTitle();}
  ctx.restore();
}

// ---- UPDATE ----
function upd(dt){
  if(state==='DEAD'){dtimer-=dt;updParts(dt);if(dtimer<=0)respawn();return;}

  if(spd<tspd)spd=Math.min(spd+dt*0.65*diff.sm,tspd);
  if(Math.random()<0.0035)ct=(Math.random()-0.5)*48;
  co+=(ct-co)*0.017;

  let onOil=oils.some(o=>ov2(pl,o));
  pl.vx+=(keys['ArrowLeft']||pad.left?-1:0)*(onOil?50:185)*dt;
  pl.vx+=(keys['ArrowRight']||pad.right?1:0)*(onOil?50:185)*dt;
  pl.vx*=onOil?0.987:0.79;
  pl.x+=pl.vx*dt*60;

  const rl=rX('L',pl.y,co),rr=rX('R',pl.y,co);
  if(pl.x<rl-5)pl.vx=Math.abs(pl.vx)*0.35;
  if(pl.x+pl.w>rr+5)pl.vx=-Math.abs(pl.vx)*0.35;
  if(pl.x<rl||pl.x+pl.w>rr){
    spd=Math.max(0.25,spd-dt*0.55);
    if(pl.x<3||pl.x+pl.w>W-3)die();
  }

  fuel-=dt*diff.fb*(1+spd*0.4);
  if(fuel<=0){fuel=0;die();}
  if(fuel<20&&fc-lfws>60){Audio8.sfxFuelWarning();lfws=fc;fwt=28;}
  if(fwt>0)fwt--;

  score+=Math.floor(spd*8*diff.sm);
  dist+=spd*dt*60;

  const nz=ZONES[zi+1];
  if(nz&&dist>=nz.dist){zi++;zone=ZONES[zi];tspd=(1.5+zi*0.27)*diff.sm;}
  if(zi>=ZONES.length-1&&dist>=2800)win();

  if(Math.random()<diff.er*spd)spawnE();
  if(Math.random()<0.003)spawnF();
  if(oils.length<2&&Math.random()<0.0007)spawnO();

  // bonus: si manejás sin chocar un rato, pasa un avión o tren (como en el original)
  if(!bonus){
    noCrash+=dt;
    if(noCrash>18){spawnBonus();noCrash=0;}
  } else {
    bonus.x+=bonus.vx*dt;
    bonus.ttl-=dt;
    const off=bonus.dir>0?bonus.x>W+40:bonus.x<-40;
    if(off||bonus.ttl<=0){
      score+=3000;txt(W/2-24,HY+22,'+3000 BONUS','#ffe080');
      Audio8.sfxCollect();bonus=null;
    }
  }

  // move enemies down — scroll speed
  enemies.forEach(e=>{
    e.y+=spd*dt*55*(1+(spd-e.spd)*0.15);
    if(e.swerve&&Math.random()<0.02)e.dr=(Math.random()-0.5)*1.6;
    e.x+=e.dr*dt*22;
    // keep within road at their current Y
    const el=rX('L',e.y,co)+2, er2=rX('R',e.y,co)-e.sw-2;
    if(e.x<el)e.dr=Math.abs(e.dr);
    if(e.x>er2)e.dr=-Math.abs(e.dr);
    // camiones: largan barriles de aceite en el camino
    if(e.dropsOil){
      e.oilT-=dt*60;
      if(e.oilT<=0&&e.y>HY+15&&oils.length<3){
        oils.push({x:e.x,y:e.y,w:20,h:8,life:220});
        e.oilT=140+Math.random()*140;
      }
    }
  });

  fcans.forEach(f=>{f.y+=spd*dt*55;});
  oils.forEach(o=>{o.y+=spd*dt*55;o.life--;});

  enemies=enemies.filter(e=>e.y<H+40);
  fcans=fcans.filter(f=>f.y<H+20);
  oils=oils.filter(o=>o.y<H+30&&o.life>0);

  // collisions — hitbox scaled to enemy perspective
  if(pl.inv<=0){
    for(let i=enemies.length-1;i>=0;i--){
      const e=enemies[i];
      const ep=prog(e.y);
      const ew=Math.max(4,Math.round(e.sw*ep));
      const eh=Math.max(3,Math.round(e.sh*ep));
      if(ov2({x:pl.x,y:pl.y,w:pl.w,h:pl.h},{x:e.x,y:e.y,w:ew,h:eh})){
        boom(e.x+ew/2,e.y+eh/2);enemies.splice(i,1);
        Audio8.sfxCrash();die();break;
      }
    }
  } else {pl.inv-=dt*60;}

  fcans=fcans.filter(f=>{
    if(ov2(pl,f)){
      fuel=Math.min(100,fuel+35);score+=500;
      Audio8.sfxCollect();txt(f.x,f.y,'+FUEL','#00ff80');
      return false;
    }
    return true;
  });

  updParts(dt);updHUD();Audio8.updateEngine(spd/4);
}

// ---- SPAWN ----
// All objects spawn at horizon Y so they slide naturally into view
function spawnE(){
  const r=Math.random();
  let t, spriteName, label=null;
  if(r<0.18){       t=ETYPES[0]; spriteName=t.sp; }        // carRed
  else if(r<0.36){  t=ETYPES[1]; spriteName=t.sp; }        // carBlue
  else if(r<0.49){  t=ETYPES[2]; spriteName=t.sp; }        // carYellow
  else if(r<0.59){  t=ETYPES[3]; spriteName=t.sp; }        // carPurple (agresivo)
  else if(r<0.70){  t=ETYPES[4]; spriteName=t.sp; }        // moto
  else if(r<0.82){  t=ETYPES[5]; spriteName=t.sp; }        // truck
  else if(r<0.94){  // colectivo propio de la zona actual
    t={bw:20,bh:34,spd:0.4};
    spriteName=zone.bus; label=zone.busLabel;
  } else {          // colectivo comodín (puede aparecer en cualquier zona)
    t={bw:20,bh:34,spd:0.4};
    spriteName=BUS_EXTRAS[Math.floor(Math.random()*BUS_EXTRAS.length)];
  }
  const isBusImg=spriteName&&spriteName.indexOf('bus')===0;
  const sprite=Sprites[spriteName];
  if(isBusImg&&(!sprite||!sprite.complete||sprite.naturalWidth===0)){
    // la foto todavía no cargó (o no existe) — usar el camión como respaldo para no romper el spawn
    t=ETYPES[5]; spriteName=t.sp; label=null;
  }
  const sy=HY+2;
  const el=rX('L',sy,co)+2, er2=rX('R',sy,co)-2;
  const x=el+Math.random()*Math.max(1,er2-el-4);
  enemies.push({
    sprite: Sprites[spriteName],
    sw:t.bw, sh:t.bh,
    spd:t.spd+Math.random()*0.8,
    x, y:sy,
    dr:(Math.random()-0.5)*0.3,
    swerve: !!t.swerve,
    dropsOil: !!t.dropsOil,
    oilT: t.dropsOil ? (60+Math.random()*80) : 0,
    label
  });
  if(label&&Math.random()<0.5)txt(x, sy-2, label, '#ffe080');
}

function spawnBonus(){
  const type=Math.random()<0.5?'plane':'train';
  const dir=Math.random()<0.5?1:-1;
  const y=type==='plane'?(8+Math.random()*18):(HY+5);
  bonus={
    type, dir,
    x: dir>0?-30:W+30,
    y,
    vx: (type==='plane'?70:50)*dir,
    ttl: 5.0
  };
}

function spawnF(){
  const sy=HY+2;
  const el=rX('L',sy,co)+4, er2=rX('R',sy,co)-4;
  fcans.push({x:el+Math.random()*Math.max(1,er2-el-10),y:sy,w:10,h:14});
}

function spawnO(){
  const sy=HY+(H-HY)*0.35;
  const el=rX('L',sy,co)+8, er2=rX('R',sy,co)-8;
  oils.push({x:el+Math.random()*Math.max(1,er2-el-20),y:sy,w:20,h:8,life:200});
}

// ---- PARTICLES ----
function boom(cx,cy){
  for(let i=0;i<6;i++)parts.push({t:'b',x:cx-16,y:cy-16,fr:0,tk:0});
  for(let i=0;i<8;i++){
    const a=(i/8)*Math.PI*2,s=16+Math.random()*42;
    parts.push({t:'d',x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-25,li:36,ml:36});
  }
}
function txt(x,y,s,c){parts.push({t:'tx',x,y,s,c,li:52,vy:-0.85});}
function updParts(dt){
  parts.forEach(p=>{
    if(p.t==='b'){p.tk++;if(p.tk%5===0)p.fr++;}
    else if(p.t==='d'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=72*dt;p.li--;}
    else if(p.t==='tx'){p.y+=p.vy;p.li--;}
  });
  parts=parts.filter(p=>{
    if(p.t==='b')return p.fr<Sprites.explosionFrames.length;
    return p.li>0;
  });
}

// ---- DEATH / WIN ----
function die(){
  if(state!=='PLAYING')return;
  state='DEAD';lives--;noCrash=0;
  boom(pl.x+pl.w/2,pl.y+pl.h/2);
  Audio8.sfxExplosion();Audio8.stopBGM();Audio8.stopEngine();
  dtimer=2.0;showMsg('CRASH!!','');
  setTimeout(()=>{msgbox.classList.add('hidden');},1100);
}

function respawn(){
  if(lives<=0){
    state='GAMEOVER';Audio8.sfxGameOver();saveHi();
    showMsg('GAME OVER','ENTER / TAP PARA REINTENTAR');
    setTimeout(()=>{
      const h=e=>{if(e.code==='Enter'||e.code==='Space'){window.removeEventListener('keydown',h);showTitle();}};
      window.addEventListener('keydown',h);
      canvas.addEventListener('click',()=>showTitle(),{once:true});
    },1500);
    return;
  }
  pl.x=W/2-7;pl.vx=0;pl.inv=108;
  fuel=Math.min(100,fuel+18);
  state='PLAYING';Audio8.startBGM();Audio8.startEngine();updHUD();
}

function win(){
  state='WIN';Audio8.stopBGM();Audio8.stopEngine();
  score+=10000;saveHi();
  showMsg('YOU WIN!!','SCORE: '+String(score).padStart(6,'0'));
  setTimeout(()=>{
    const h=e=>{if(e.code==='Enter'||e.code==='Space'){window.removeEventListener('keydown',h);showTitle();}};
    window.addEventListener('keydown',h);
    canvas.addEventListener('click',()=>showTitle(),{once:true});
  },2000);
}

function saveHi(){
  if(score>hi){hi=score;try{localStorage.setItem('rf_hi',hi);}catch(e){}updHi();}
}

// ================================================================
//  RENDER
// ================================================================
function draw(){
  drawSky();drawGrass();drawRoad();drawScenery();drawBonus();

  // oil slicks — scaled
  oils.forEach(o=>{
    const p=prog(o.y);
    const sw=Math.max(4,Math.round(20*p)),sh=Math.max(2,Math.round(8*p));
    ctx.globalAlpha=Math.min(1,o.life/40);
    ctx.drawImage(Sprites.oilSlick,Math.round(o.x),Math.round(o.y),sw,sh);
    ctx.globalAlpha=1;
  });

  // fuel cans — scaled
  fcans.forEach(f=>{
    const p=prog(f.y);
    const fw=Math.max(3,Math.round(10*p)),fh=Math.max(2,Math.round(14*p));
    ctx.drawImage(Sprites.fuelCan,Math.round(f.x),Math.round(f.y),fw,fh);
  });

  // enemies — back to front, each scaled by its Y position
  [...enemies].sort((a,b)=>a.y-b.y).forEach(e=>{
    const p=prog(e.y);
    const ew=Math.max(4,Math.round(e.sw*p));
    const eh=Math.max(3,Math.round(e.sh*p));
    ctx.drawImage(e.sprite,Math.round(e.x),Math.round(e.y),ew,eh);
  });

  // player — always full size at bottom
  if(state!=='DEAD'){
    const show=pl.inv<=0||(Math.floor(fc/4)%2===0);
    if(show)ctx.drawImage(Sprites.playerCar,Math.round(pl.x),Math.round(pl.y));
  }

  drawParts();
  if(spd>2.2)drawLines();
  if(fwt>0&&fc%8<4){ctx.fillStyle='rgba(255,0,0,0.12)';ctx.fillRect(0,0,W,H);}
}

function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,HY);
  g.addColorStop(0,drk(zone.sky,0.65));g.addColorStop(1,zone.sky);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,HY);
  ctx.fillStyle='rgba(255,255,255,0.48)';
  const cx=((fc*0.11)%(W+60))-30;
  cld(cx,12,26,8);cld(cx+68,20,18,7);cld(cx+145,8,32,10);
}
function cld(x,y,w,h){
  ctx.beginPath();
  ctx.ellipse(x,y,w*.5,h*.5,0,0,Math.PI*2);
  ctx.ellipse(x+w*.18,y-h*.18,w*.33,h*.42,0,0,Math.PI*2);
  ctx.ellipse(x-w*.18,y,w*.28,h*.38,0,0,Math.PI*2);
  ctx.fill();
}
function drawGrass(){ctx.fillStyle=zone.grass;ctx.fillRect(0,HY,W,H-HY);}

function drawRoad(){
  const rlt=rX('L',HY,co),rrt=rX('R',HY,co);
  const rlb=rX('L',H,co), rrb=rX('R',H,co);

  ctx.fillStyle=zone.road;
  ctx.beginPath();ctx.moveTo(rlt,HY);ctx.lineTo(rrt,HY);ctx.lineTo(rrb,H);ctx.lineTo(rlb,H);ctx.closePath();ctx.fill();

  dstr(rlt-0.4,HY,rlb-4,H,4,'#fff');
  dstr(rrt,HY,rrb,H,4,'#fff');
  dcurb(rlt-0.4,HY,rlb-4,H,5);
  dcurb(rrt,HY,rrb,H,5);
  ddash(rlt,rrt,rlb,rrb);
}
function dstr(x1,y1,x2,y2,bw,c){
  ctx.fillStyle=c;ctx.beginPath();
  ctx.moveTo(x1,y1);ctx.lineTo(x1+bw*.08,y1);ctx.lineTo(x2+bw,y2);ctx.lineTo(x2,y2);
  ctx.closePath();ctx.fill();
}
function dcurb(x1,y1,x2,y2,bw){
  const n=14,s2=Math.floor(fc*spd*0.4)%2;
  for(let i=0;i<n;i++){
    const t0=i/n,t1=(i+1)/n;
    const ya=y1+(y2-y1)*t0,yb=y1+(y2-y1)*t1;
    const xa=x1+(x2-x1)*t0,xb=x1+(x2-x1)*t1;
    const w0=bw*(t0*.28+.08),w1=bw*(t1*.28+.08);
    ctx.fillStyle=((i+s2)%2===0)?'#cc0000':'#fff';
    ctx.beginPath();ctx.moveTo(xa,ya);ctx.lineTo(xa+w0,ya);ctx.lineTo(xb+w1,yb);ctx.lineTo(xb,yb);ctx.closePath();ctx.fill();
  }
}
function ddash(rlt,rrt,rlb,rrb){
  const n=10,s2=(fc*spd*0.054)%(1/n);
  ctx.fillStyle=zone.line;
  for(let i=0;i<n+1;i++){
    const t=(i/n+s2)%1,t2=Math.min(1,t+1/n*.48);
    if(t>=1||t2>1)continue;
    const y1=HY+(H-HY)*t,y2=HY+(H-HY)*t2;
    const cx1=(rlt+(rlb-rlt)*t+rrt+(rrb-rrt)*t)/2;
    const cx2=(rlt+(rlb-rlt)*t2+rrt+(rrb-rrt)*t2)/2;
    const dw1=Math.max(.5,1.8*t),dw2=Math.max(.5,1.8*t2);
    ctx.beginPath();ctx.moveTo(cx1-dw1/2,y1);ctx.lineTo(cx1+dw1/2,y1);ctx.lineTo(cx2+dw2/2,y2);ctx.lineTo(cx2-dw2/2,y2);ctx.closePath();ctx.fill();
  }
}

function drawScenery(){
  const sp=52,s2=(fc*spd*1.75)%sp;
  for(let i=-1;i<8;i++){
    const by=HY+i*sp+s2;
    if(by<HY-8||by>H+8)continue;
    const p=Math.max(0,(by-HY)/(H-HY));
    const tw=Math.max(2,Math.round(13*p)),th=Math.max(3,Math.round(34*p));
    const lx=rX('L',by,co)-tw-3, rx=rX('R',by,co)+3;
    dtree(lx,by,tw,th);dtree(rx,by,tw,th);
    if(i%2===0&&p>0.04){
      const ph=Math.max(2,Math.round(20*p)),pw=Math.max(1,Math.round(2*p));
      ctx.fillStyle='#aaa';
      ctx.fillRect(Math.round(lx+tw+2),Math.round(by-ph),pw,ph);
      ctx.fillRect(Math.round(rx-2-pw),Math.round(by-ph),pw,ph);
      ctx.fillStyle='#ffe080';
      const lh=Math.max(1,Math.round(2*p));
      ctx.fillRect(Math.round(lx+tw+1),Math.round(by-ph),pw+2,lh);
      ctx.fillRect(Math.round(rx-3-pw),Math.round(by-ph),pw+2,lh);
    }
  }
}
function dtree(x,y,w,h){
  x=Math.round(x);y=Math.round(y);
  const tw=Math.max(1,Math.round(w*.24)),th=Math.round(h*.33);
  ctx.fillStyle='#5c3a1e';ctx.fillRect(x+Math.round((w-tw)/2),y-th,tw,th);
  const ch1=Math.round(h*.54);
  ctx.fillStyle='#1e6e00';ctx.fillRect(x,y-th-ch1,w,ch1);
  const cw2=Math.round(w*.73),ch2=Math.round(h*.43);
  ctx.fillStyle='#2ea000';ctx.fillRect(x+Math.round((w-cw2)/2),y-th-ch1-ch2+Math.round(ch1*.28),cw2,ch2);
  ctx.fillStyle='#3cc010';
  if(w>=4)ctx.fillRect(x+Math.round(w*.18),y-th-ch1+1,Math.max(1,Math.round(w*.23)),Math.max(1,Math.round(ch1*.28)));
}

function drawParts(){
  parts.forEach(p=>{
    if(p.t==='b'){
      const f=Math.min(p.fr,Sprites.explosionFrames.length-1);
      ctx.drawImage(Sprites.explosionFrames[f],Math.round(p.x),Math.round(p.y));
    } else if(p.t==='d'){
      ctx.globalAlpha=p.li/p.ml;
      ctx.fillStyle=(p.li%3<2)?'#ff8800':'#ffee00';
      ctx.fillRect(Math.round(p.x),Math.round(p.y),3,3);
      ctx.globalAlpha=1;
    } else if(p.t==='tx'){
      ctx.globalAlpha=Math.min(1,p.li/40);
      ctx.fillStyle=p.c;
      ctx.font='7px "Press Start 2P", monospace';
      ctx.fillText(p.s,Math.round(p.x),Math.round(p.y));
      ctx.globalAlpha=1;
    }
  });
}
function drawLines(){
  const a=Math.min(0.3,(spd-2.2)*.12);
  ctx.globalAlpha=a;ctx.strokeStyle='#fff';ctx.lineWidth=1;
  for(let i=0;i<10;i++){
    const x=RBL+8+Math.random()*(RBR-RBL-16),y1=HY+Math.random()*(H-HY);
    ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x-1,y1+10+Math.random()*16);ctx.stroke();
  }
  ctx.globalAlpha=1;
}
function drawBonus(){
  if(!bonus)return;
  const spr=bonus.type==='plane'?Sprites.planeSprite:Sprites.trainSprite;
  ctx.save();
  if(bonus.dir<0){
    ctx.translate(Math.round(bonus.x)+spr.width,Math.round(bonus.y));
    ctx.scale(-1,1);
    ctx.drawImage(spr,0,0);
  } else {
    ctx.drawImage(spr,Math.round(bonus.x),Math.round(bonus.y));
  }
  ctx.restore();
}

function drawTitle(){
  ctx.fillStyle='#3a88c0';ctx.fillRect(0,0,W,HY);
  ctx.fillStyle='#2a6040';ctx.fillRect(0,HY,W,H-HY);
  ctx.fillStyle='#666';
  ctx.beginPath();ctx.moveTo(RHL,HY);ctx.lineTo(RHR,HY);ctx.lineTo(RBR,H);ctx.lineTo(RBL,H);ctx.closePath();ctx.fill();
  const dH=20,dT=38,s2=(fc*1.4)%dT;
  ctx.fillStyle='#ffd700';
  for(let y=HY-s2;y<H+dH;y+=dT){
    const p=(y-HY)/(H-HY);
    const dw=Math.max(.5,2.2*p),dh=Math.max(2,dH*(0.28+0.72*p));
    ctx.fillRect(W/2-dw/2,y,dw,dh);
  }
  ctx.drawImage(Sprites.playerCar,W/2-7,PLAYER_Y+Math.round(Math.sin(fc*.06)*2));
}

// ---- HUD ----
function updHUD(){
  document.getElementById('score').textContent=String(score).padStart(6,'0');
  document.getElementById('hiscore').textContent=String(Math.max(hi,score)).padStart(6,'0');
  document.getElementById('speed').textContent=Math.round(spd*80);
  document.getElementById('fuelnum').textContent=Math.ceil(fuel);
  document.getElementById('zone').textContent=zone.name;
  const fi=document.getElementById('fuelinner');
  fi.style.width=fuel+'%';
  fi.style.background=fuel>40?'#0c0':fuel>20?'#cc0':'#c00';
  const lv=document.getElementById('lives');lv.innerHTML='';
  for(let i=0;i<Math.max(0,lives);i++){
    const d=document.createElement('div');d.className='life-icon';lv.appendChild(d);
  }
}

// ---- UTILS ----
function ov2(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function drk(hex,am){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return'rgb('+Math.round(r*am)+','+Math.round(g*am)+','+Math.round(b*am)+')';
}

// ---- MOBILE ----
window.mobileBtn=(dir,down)=>{pad[dir]=down;};

// ---- BOOT ----
window.addEventListener('DOMContentLoaded',init);
})();
