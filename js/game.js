// ============================================================
//  LA MATANZA ROAD FIGHTER v2
//  Full arcade engine — Konami 1984 style
// ============================================================

(function(){
'use strict';

// ---- CONFIG ----
const W = 224, H = 320;   // logical game resolution (NES-ish)
const ROAD_LEFT  = 32;
const ROAD_RIGHT = 192;
const ROAD_W     = ROAD_RIGHT - ROAD_LEFT;
const PLAYER_Y   = H - 70;
const SCALE_MAX  = 3;

// ---- DIFFICULTY ----
const DIFF = {
  EASY:   { label:'EASY',   speedMult:0.7, enemyRate:0.018, fuelBurn:0.015, enemySpeed:1.2, name:'ROOKIE'   },
  NORMAL: { label:'NORMAL', speedMult:1.0, enemyRate:0.026, fuelBurn:0.022, enemySpeed:1.6, name:'DRIVER'   },
  HARD:   { label:'HARD',   speedMult:1.4, enemyRate:0.036, fuelBurn:0.030, enemySpeed:2.2, name:'CHAMPION' },
};

// ---- ZONES ----
const ZONES = [
  { name:'LA MATANZA',  bg:'#5a8a00', road:'#888', line:'#fff', dist:0    },
  { name:'LINIERS',     bg:'#4a7020', road:'#7a7a7a', line:'#ffd700', dist:500  },
  { name:'CABALLITO',   bg:'#3a6040', road:'#888', line:'#ff8800', dist:1000 },
  { name:'PALERMO',     bg:'#2a5050', road:'#999', line:'#fff', dist:1500 },
  { name:'RETIRO',      bg:'#1a4060', road:'#777', line:'#0cf', dist:2000 },
];

// ---- STATE ----
let canvas, ctx, scale=1;
let state = 'TITLE'; // TITLE | PLAYING | DEAD | GAMEOVER | WIN
let diff = DIFF.NORMAL;
let hiScore = parseInt(localStorage.getItem('rf_hi')||'0');

// game vars
let player, road, enemies, particles, fuelCans, oilSlicks;
let score, fuel, lives, zone, zoneIdx, totalDist;
let speed, targetSpeed;
let frameCount, lastTime;
let deathTimer, deathPhase;
let keys, mobilePad;
let curveOffset, curveTarget, curveSpeed;
let flashTimer = 0;
let fuelWarnTimer = 0;
let lastFuelWarnSfx = 0;

// ---- INIT ----
function init(){
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  resize();
  window.addEventListener('resize', resize);

  keys = {};
  window.addEventListener('keydown', e=>{
    keys[e.code]=true;
    if(e.code==='KeyM') toggleMute();
    if(state==='TITLE' && (e.code==='Enter'||e.code==='Space')) startGame();
  });
  window.addEventListener('keyup',  e=>keys[e.code]=false);

  mobilePad = {left:false, right:false};

  buildOverlay();
  showTitle();

  requestAnimationFrame(loop);
}

function resize(){
  const vw = window.innerWidth, vh = window.innerHeight;
  // reserve space for HUD on wider screens
  const hudW = vw < 480 ? 0 : (vw < 700 ? 90 : 130);
  const avail = vw - hudW;
  scale = Math.max(1, Math.min(SCALE_MAX, Math.floor(Math.min(avail/W, vh/H))));
  canvas.width  = W * scale;
  canvas.height = H * scale;
  canvas.style.width  = (W*scale)+'px';
  canvas.style.height = (H*scale)+'px';
  ctx.imageSmoothingEnabled = false;
}

// ---- OVERLAY UI ----
let overlay, msgbox;

function buildOverlay(){
  overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.innerHTML = `
    <div class="ov-logo">LA MATANZA<br>ROAD FIGHTER</div>
    <div class="ov-sub">© 1984  KONAMI-STYLE  BY LA MATANZA DEV</div>
    <div class="ov-diff">
      <button class="diff-btn" id="dEasy">EASY</button>
      <button class="diff-btn active" id="dNormal">NORMAL</button>
      <button class="diff-btn" id="dHard">HARD</button>
    </div>
    <div class="ov-menu">
      <button class="ov-btn" id="btnStart">▶  PRESS START</button>
      <button class="ov-btn" id="btnMute">♪  MUSIC: ON</button>
    </div>
    <div class="ov-hiscore">HI-SCORE: <span id="ovHi">000000</span></div>
    <div class="ov-copy">USE ← → ARROWS OR BUTTONS TO STEER</div>
  `;
  document.body.appendChild(overlay);

  msgbox = document.createElement('div');
  msgbox.id = 'msgbox';
  msgbox.className = 'hidden';
  msgbox.innerHTML = `<div class="msg-title" id="msgTitle"></div><div class="msg-sub" id="msgSub"></div>`;
  document.body.appendChild(msgbox);

  document.getElementById('btnStart').onclick = ()=>{ Audio8.init(); Audio8.resume(); startGame(); };
  document.getElementById('btnMute').onclick  = toggleMute;

  ['Easy','Normal','Hard'].forEach(d=>{
    document.getElementById('d'+d).onclick = ()=>{
      diff = DIFF[d.toUpperCase()];
      document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('active'));
      document.getElementById('d'+d).classList.add('active');
    };
  });

  updateHiScoreDisplay();
}

function showTitle(){
  state = 'TITLE';
  overlay.classList.remove('hidden');
  msgbox.classList.add('hidden');
  updateHiScoreDisplay();
}

function updateHiScoreDisplay(){
  const el = document.getElementById('ovHi');
  if(el) el.textContent = String(hiScore).padStart(6,'0');
  const hel = document.getElementById('hiscore');
  if(hel) hel.textContent = String(hiScore).padStart(6,'0');
}

function toggleMute(){
  Audio8.init();
  Audio8.setMute(!Audio8.muted);
  const btn = document.getElementById('btnMute');
  if(btn) btn.textContent = Audio8.muted ? '♪  MUSIC: OFF' : '♪  MUSIC: ON';
  if(!Audio8.muted && state==='PLAYING'){ Audio8.startBGM(); Audio8.startEngine(); }
}

// ---- GAME START ----
function startGame(){
  overlay.classList.add('hidden');
  msgbox.classList.add('hidden');

  // reset state
  score = 0;
  fuel  = 100;
  lives = 3;
  zoneIdx = 0;
  zone  = ZONES[0];
  totalDist = 0;
  speed = 0;
  targetSpeed = 1.5 * diff.speedMult;
  frameCount = 0;
  lastTime = null;
  deathTimer = 0;
  deathPhase = 0;
  curveOffset = 0;
  curveTarget = 0;
  curveSpeed = 0.004;
  flashTimer = 0;
  fuelWarnTimer = 0;

  player = {
    x: W/2 - 7,
    y: PLAYER_Y,
    w: 14, h: 24,
    vx: 0,
    animTick: 0,
    alive: true,
    invincible: 0,
    skidding: false,
  };

  road = buildRoad();
  enemies = [];
  particles = [];
  fuelCans = [];
  oilSlicks = [];

  state = 'PLAYING';
  Audio8.init();
  Audio8.resume();
  Audio8.sfxStart();
  setTimeout(()=>{ Audio8.startBGM(); Audio8.startEngine(); }, 800);

  updateHUD();
}

// ---- ROAD GEOMETRY ----
function buildRoad(){
  return { segments: [], scrollY: 0 };
}

// ---- MAIN LOOP ----
function loop(ts){
  requestAnimationFrame(loop);

  const dt = lastTime ? Math.min((ts - lastTime)/1000, 0.05) : 0.016;
  lastTime = ts;
  frameCount++;

  ctx.save();
  ctx.scale(scale, scale);

  if(state === 'PLAYING' || state === 'DEAD'){
    updateGame(dt);
    renderGame();
  } else if(state === 'TITLE' || state === 'GAMEOVER' || state === 'WIN'){
    renderIdleBackground();
  }

  ctx.restore();
}

// ---- UPDATE ----
function updateGame(dt){
  if(state === 'DEAD'){
    deathTimer -= dt;
    // animate explosion continuing
    updateParticles(dt);
    if(deathTimer <= 0) respawnOrGameOver();
    return;
  }

  frameCount++;

  // speed ramp
  if(speed < targetSpeed) speed = Math.min(speed + dt * 0.8 * diff.speedMult, targetSpeed);

  // curve
  if(Math.random() < 0.005) curveTarget = (Math.random()-0.5) * 60;
  curveOffset += (curveTarget - curveOffset) * 0.02;

  // player input
  const spd = 120 * dt;
  const onRoad = player.x > ROAD_LEFT - 4 && player.x + player.w < ROAD_RIGHT + 4;
  let isOil = false;

  // oil slick check
  oilSlicks.forEach(o=>{
    if(rectsOverlap(player, o)) isOil = true;
  });

  player.skidding = isOil;

  if(keys['ArrowLeft']  || mobilePad.left)  player.vx -= (isOil ? 60 : 200) * dt;
  if(keys['ArrowRight'] || mobilePad.right) player.vx += (isOil ? 60 : 200) * dt;

  // friction
  player.vx *= isOil ? 0.98 : 0.82;
  player.x += player.vx * dt * 60;

  // road boundaries
  const roadLeft  = ROAD_LEFT  + curveOffset * 0.1;
  const roadRight = ROAD_RIGHT + curveOffset * 0.1;

  if(player.x < roadLeft  - 8) player.vx = Math.abs(player.vx) * 0.5;
  if(player.x + player.w > roadRight + 8) player.vx = -Math.abs(player.vx) * 0.5;

  // off road slowdown
  if(player.x < roadLeft || player.x + player.w > roadRight){
    speed = Math.max(0.3, speed - dt * 0.5);
    if(player.x < 10 || player.x + player.w > W - 10) playerDie();
  }

  // fuel
  fuel -= dt * diff.fuelBurn * (1 + speed * 0.5);
  if(fuel <= 0){ fuel = 0; playerDie(); }

  if(fuel < 20 && frameCount - lastFuelWarnSfx > 60){
    Audio8.sfxFuelWarning();
    lastFuelWarnSfx = frameCount;
    fuelWarnTimer = 30;
  }
  if(fuelWarnTimer > 0) fuelWarnTimer--;

  // score from distance
  score += Math.floor(speed * 10 * diff.speedMult);

  // total distance
  totalDist += speed * dt * 60;

  // zone progression
  const nextZone = ZONES[zoneIdx + 1];
  if(nextZone && totalDist >= nextZone.dist){
    zoneIdx++;
    zone = ZONES[zoneIdx];
    targetSpeed = (1.5 + zoneIdx * 0.3) * diff.speedMult;
  }
  if(zoneIdx >= ZONES.length - 1 && totalDist >= 2800) playerWin();

  // enemy spawning
  if(Math.random() < diff.enemyRate * speed) spawnEnemy();

  // fuel cans
  if(Math.random() < 0.004) spawnFuelCan();

  // oil slicks (from trucks)
  if(frameCount % 90 === 0 && oilSlicks.length < 3) spawnOilSlick();

  // update enemies
  enemies.forEach(e=>{
    e.y += (speed - e.speed) * dt * 60 * diff.enemySpeed * 0.5 + speed * dt * 30;
    e.x += e.drift * dt * 30;
    // keep enemies on road
    if(e.x < ROAD_LEFT + 4) e.drift = Math.abs(e.drift);
    if(e.x + e.w > ROAD_RIGHT - 4) e.drift = -Math.abs(e.drift);
  });

  // update fuel cans
  fuelCans.forEach(f=>{ f.y += speed * dt * 60; });

  // update oil slicks
  oilSlicks.forEach(o=>{ o.y += speed * dt * 60; });

  // cleanup off-screen
  enemies   = enemies.filter(e=>e.y < H+50);
  fuelCans  = fuelCans.filter(f=>f.y < H+20);
  oilSlicks = oilSlicks.filter(o=>o.y < H+20);

  // collisions
  if(player.invincible <= 0){
    enemies.forEach(e=>{
      if(rectsOverlap(player, e)){
        spawnExplosion(e.x + e.w/2, e.y + e.h/2);
        enemies = enemies.filter(x=>x!==e);
        Audio8.sfxCrash();
        playerDie();
      }
    });
  } else {
    player.invincible -= dt * 60;
  }

  fuelCans = fuelCans.filter(f=>{
    if(rectsOverlap(player, f)){
      fuel = Math.min(100, fuel + 35);
      score += 500;
      Audio8.sfxCollect();
      spawnText(f.x, f.y, '+FUEL', '#0f0');
      return false;
    }
    return true;
  });

  updateParticles(dt);
  updateHUD();
  Audio8.updateEngine(speed / 4);
}

function spawnEnemy(){
  const types = [
    {sprite: Sprites.carRed,    w:14, h:22, speed:1+Math.random()*1.5, pts:100},
    {sprite: Sprites.carBlue,   w:14, h:22, speed:1+Math.random()*2,   pts:150},
    {sprite: Sprites.carYellow, w:14, h:22, speed:0.5+Math.random(),    pts:200},
    {sprite: Sprites.truck,     w:18, h:32, speed:0.4+Math.random()*0.5,pts:300},
  ];
  // weighted pick (trucks less common)
  const roll = Math.random();
  const t = roll < 0.35 ? types[0] : roll < 0.65 ? types[1] : roll < 0.85 ? types[2] : types[3];
  const margin = 20;
  enemies.push({
    ...t,
    x: ROAD_LEFT + margin + Math.random() * (ROAD_W - t.w - margin*2),
    y: -t.h - 10,
    drift: (Math.random()-0.5) * 0.4,
  });
}

function spawnFuelCan(){
  fuelCans.push({
    x: ROAD_LEFT + 20 + Math.random() * (ROAD_W - 30),
    y: -20,
    w: 10, h: 14,
  });
}

function spawnOilSlick(){
  // place where truck recently was
  oilSlicks.push({
    x: ROAD_LEFT + 20 + Math.random() * (ROAD_W - 40),
    y: H * 0.3,
    w: 20, h: 8,
    life: 180,
  });
}

// ---- PARTICLES ----
function spawnExplosion(cx, cy){
  for(let i=0;i<6;i++){
    particles.push({type:'boom', x:cx-16, y:cy-16, frame:0, timer:0, maxFrame:6, speed:0.15});
  }
  for(let i=0;i<6;i++){
    const angle = Math.random()*Math.PI*2;
    const spd = 20 + Math.random()*50;
    particles.push({type:'debris', x:cx, y:cy, vx:Math.cos(angle)*spd, vy:Math.sin(angle)*spd - 30, life:40, maxLife:40});
  }
}

function spawnText(x,y,text,color){
  particles.push({type:'text', x, y, text, color, life:60, vy:-1});
}

function updateParticles(dt){
  particles.forEach(p=>{
    if(p.type==='boom'){
      p.timer++;
      if(p.timer % Math.round(p.speed*60/6+1) === 0) p.frame++;
    } else if(p.type==='debris'){
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt;
      p.life--;
    } else if(p.type==='text'){
      p.y += p.vy;
      p.life--;
    }
  });
  particles = particles.filter(p=>{
    if(p.type==='boom') return p.frame < p.maxFrame;
    if(p.type==='debris') return p.life > 0;
    if(p.type==='text') return p.life > 0;
    return false;
  });
}

// ---- DEATH / RESPAWN ----
function playerDie(){
  if(state !== 'PLAYING') return;
  state = 'DEAD';
  lives--;
  spawnExplosion(player.x + player.w/2, player.y + player.h/2);
  Audio8.sfxExplosion();
  Audio8.stopBGM();
  Audio8.stopEngine();
  deathTimer = 2.2;
  deathPhase = 0;

  showMsg('CRASH!!', '');
  setTimeout(()=>{ msgbox.classList.add('hidden'); }, 1200);
}

function respawnOrGameOver(){
  if(lives <= 0){
    state = 'GAMEOVER';
    Audio8.sfxGameOver();
    saveHiScore();
    showMsg('GAME OVER', 'PRESS ENTER TO RETRY');
    setTimeout(()=>{
      const handler = (e)=>{
        if(e.code==='Enter'||e.code==='Space'){ window.removeEventListener('keydown',handler); showTitle(); }
      };
      window.addEventListener('keydown', handler);
      // mobile tap
      canvas.addEventListener('click', ()=>showTitle(), {once:true});
    }, 1500);
    return;
  }
  // respawn
  player.x = W/2 - 7;
  player.vx = 0;
  player.alive = true;
  player.invincible = 120;
  fuel = Math.min(100, fuel + 20);
  state = 'PLAYING';
  Audio8.startBGM();
  Audio8.startEngine();
  updateHUD();
}

function playerWin(){
  state = 'WIN';
  Audio8.stopBGM();
  Audio8.stopEngine();
  score += 10000;
  saveHiScore();
  showMsg('YOU WIN!!', 'SCORE: ' + String(score).padStart(6,'0'));
  setTimeout(()=>{
    const handler=(e)=>{
      if(e.code==='Enter'||e.code==='Space'){ window.removeEventListener('keydown',handler); showTitle(); }
    };
    window.addEventListener('keydown', handler);
    canvas.addEventListener('click',()=>showTitle(),{once:true});
  }, 2000);
}

function saveHiScore(){
  if(score > hiScore){
    hiScore = score;
    localStorage.setItem('rf_hi', hiScore);
    updateHiScoreDisplay();
  }
}

function showMsg(title, sub){
  msgbox.classList.remove('hidden');
  document.getElementById('msgTitle').textContent = title;
  document.getElementById('msgSub').textContent   = sub;
}

// ---- RENDER ----
function renderGame(){
  // Background sky/grass
  ctx.fillStyle = zone.bg || '#5a8a00';
  ctx.fillRect(0,0,W,H);

  // Horizon sky strip
  const skyH = Math.floor(H*0.18);
  ctx.fillStyle = '#87ceeb';
  ctx.fillRect(0,0,W,skyH);

  // treeline
  renderTrees(skyH);

  // Road
  renderRoad(skyH);

  // Oil slicks
  oilSlicks.forEach(o=>{ ctx.drawImage(Sprites.oilSlick, Math.round(o.x), Math.round(o.y)); });

  // Fuel cans
  fuelCans.forEach(f=>{ ctx.drawImage(Sprites.fuelCan, Math.round(f.x), Math.round(f.y)); });

  // Enemies
  enemies.forEach(e=>{ ctx.drawImage(e.sprite, Math.round(e.x), Math.round(e.y)); });

  // Player (with invincible flicker)
  if(state !== 'DEAD'){
    const show = player.invincible <= 0 || (Math.floor(frameCount/4)%2===0);
    if(show) ctx.drawImage(Sprites.playerCar, Math.round(player.x), Math.round(player.y));
  }

  // Particles
  renderParticles();

  // Speed lines overlay at high speed
  if(speed > 2.5) renderSpeedLines();

  // Fuel warning flash
  if(fuelWarnTimer > 0 && frameCount%8 < 4){
    ctx.fillStyle='rgba(255,0,0,0.15)';
    ctx.fillRect(0,0,W,H);
  }
}

function renderRoad(skyH){
  const roadY = skyH;
  const co = curveOffset;

  // Road body — trapezoid perspective
  ctx.fillStyle = zone.road || '#888';
  ctx.beginPath();
  ctx.moveTo(ROAD_LEFT + co*0.5, roadY);
  ctx.lineTo(ROAD_RIGHT + co*0.5, roadY);
  ctx.lineTo(ROAD_RIGHT, H);
  ctx.lineTo(ROAD_LEFT, H);
  ctx.closePath();
  ctx.fill();

  // Road edge stripes
  ctx.fillStyle = '#fff';
  ctx.fillRect(ROAD_LEFT - 4, roadY, 4, H - roadY);
  ctx.fillRect(ROAD_RIGHT, roadY, 4, H - roadY);

  // Center dashes — scrolling
  const dashH = 24, dashGap = 20;
  const dashTotal = dashH + dashGap;
  const scroll = (frameCount * speed * 2) % dashTotal;
  ctx.fillStyle = zone.line || '#fff';
  for(let y = roadY - scroll; y < H + dashH; y += dashTotal){
    const prog = Math.max(0, (y - roadY) / (H - roadY));
    const cx = W/2 + co * prog * 0.5;
    const dw = 3;
    const dh = Math.max(4, dashH * (0.3 + 0.7 * prog));
    ctx.fillRect(cx - dw/2, y, dw, dh);
  }

  // Curb stripes at edge
  const segH = 16;
  const curvSeg = Math.floor(frameCount * speed) % (segH*2);
  for(let y = roadY - curvSeg; y < H; y += segH*2){
    const col = (Math.floor(y/segH)) % 2 === 0 ? '#e00' : '#fff';
    ctx.fillStyle=col;
    ctx.fillRect(ROAD_LEFT - 8, y, 8, segH);
    ctx.fillRect(ROAD_RIGHT, y, 8, segH);
  }
}

function renderTrees(skyH){
  // Simple pixel trees on shoulders
  const treeSpacing = 48;
  const scroll = (frameCount * speed * 1.5) % treeSpacing;

  for(let y = skyH - scroll; y < H; y += treeSpacing){
    const prog = Math.max(0,(y - skyH)/(H - skyH));
    const treeH = Math.max(6, 18 * prog);
    const treeW = Math.max(4, 12 * prog);
    // left trees
    ctx.fillStyle='#1a6000';
    ctx.fillRect(8, y, treeW, treeH);
    ctx.fillStyle='#2a8000';
    ctx.fillRect(6, y + treeH*0.3, treeW+4, treeH*0.5);
    // right trees
    ctx.fillRect(W - 8 - treeW, y, treeW, treeH);
    ctx.fillStyle='#2a8000';
    ctx.fillRect(W - 10 - treeW, y + treeH*0.3, treeW+4, treeH*0.5);
  }
}

function renderParticles(){
  particles.forEach(p=>{
    if(p.type==='boom'){
      const frame = Math.min(p.frame, Sprites.explosionFrames.length-1);
      ctx.drawImage(Sprites.explosionFrames[frame], Math.round(p.x), Math.round(p.y));
    } else if(p.type==='debris'){
      const a = p.life/p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = Math.random() > 0.5 ? '#ff8800' : '#ffee00';
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
      ctx.globalAlpha = 1;
    } else if(p.type==='text'){
      const a = p.life/60;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.fillText(p.text, Math.round(p.x), Math.round(p.y));
      ctx.globalAlpha = 1;
    }
  });
}

function renderSpeedLines(){
  const alpha = Math.min(0.4, (speed - 2.5) * 0.15);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  for(let i=0;i<12;i++){
    const x = ROAD_LEFT + 10 + Math.random() * ROAD_W;
    const y1 = Math.random() * H;
    const y2 = y1 + 10 + Math.random()*20;
    ctx.beginPath();
    ctx.moveTo(x,y1);
    ctx.lineTo(x-1,y2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function renderIdleBackground(){
  // animated title screen background
  ctx.fillStyle='#000018';
  ctx.fillRect(0,0,W,H);

  // scrolling road for title
  ctx.fillStyle='#444';
  ctx.fillRect(ROAD_LEFT, 0, ROAD_W, H);
  ctx.fillStyle='#fff';
  ctx.fillRect(ROAD_LEFT, 0, 4, H);
  ctx.fillRect(ROAD_RIGHT-4, 0, 4, H);

  const dashH=24, dashGap=20, dashTotal=dashH+dashGap;
  const scroll = (frameCount * 1.5) % dashTotal;
  ctx.fillStyle='#ffd700';
  for(let y = -scroll; y < H+dashH; y+=dashTotal){
    ctx.fillRect(W/2-2, y, 4, dashH);
  }

  // idle car
  ctx.drawImage(Sprites.playerCar, W/2-7, PLAYER_Y + Math.sin(frameCount*0.05)*2);
}

// ---- HUD ----
function updateHUD(){
  document.getElementById('score').textContent = String(score).padStart(6,'0');
  document.getElementById('hiscore').textContent = String(Math.max(hiScore,score)).padStart(6,'0');
  document.getElementById('speed').textContent = Math.round(speed * 80);
  document.getElementById('fuelnum').textContent = Math.ceil(fuel);
  document.getElementById('zone').textContent = zone.name;

  const fi = document.getElementById('fuelinner');
  fi.style.width = fuel + '%';
  fi.style.background = fuel > 40 ? '#0c0' : fuel > 20 ? '#cc0' : '#c00';

  const lv = document.getElementById('lives');
  lv.innerHTML = '';
  for(let i=0;i<Math.max(0,lives);i++){
    const d=document.createElement('div');
    d.className='life-icon';
    lv.appendChild(d);
  }
}

// ---- UTILS ----
function rectsOverlap(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

// ---- MOBILE ----
window.mobileBtn = (dir, down)=>{
  mobilePad[dir] = down;
};

// ---- BOOT ----
window.addEventListener('DOMContentLoaded', init);
})();
