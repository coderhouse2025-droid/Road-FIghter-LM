// ============================================================
//  SPRITE ENGINE — all drawn procedurally on offscreen canvas
//  Konami 1984 Road Fighter palette
// ============================================================
const Sprites = (() => {

  // Palette
  const C = {
    playerBody: '#d81c1c',
    playerAccent:'#8c0000',
    playerTop:  '#fff8dc',
    playerWheel:'#222',
    carRed:     '#e03020',
    carBlue:    '#2050e0',
    carYellow:  '#d0a000',
    carPurple:  '#7a1fa0',
    carGray:    '#888',
    carTruck:   '#4a3020',
    truckBody:  '#8b5e3c',
    wheel:      '#111',
    wheelRim:   '#666',
    fuelCan:    '#00c060',
    fuelShine:  '#80ffc0',
    boom1:      '#ff8800',
    boom2:      '#ffee00',
    boom3:      '#ff2200',
    smoke:      '#999',
  };

  function make(w,h,fn){
    const c=document.createElement('canvas');
    c.width=w; c.height=h;
    fn(c.getContext('2d'),w,h);
    return c;
  }

  // ---- PLAYER CAR (14x24) ----
  // Top-down view, Konami-style red racer (como el Corvette del original)
  const playerCar = make(14,24,(g)=>{
    // body
    g.fillStyle=C.playerBody;
    g.fillRect(2,2,10,20);
    // cockpit
    g.fillStyle=C.playerTop;
    g.fillRect(4,5,6,8);
    // windows border
    g.fillStyle=C.playerAccent;
    g.fillRect(3,4,8,1);
    g.fillRect(3,13,8,1);
    // windshield details
    g.fillStyle='#b0d8ff';
    g.fillRect(5,6,4,5);
    // nose
    g.fillStyle=C.playerAccent;
    g.fillRect(4,2,6,2);
    g.fillRect(5,1,4,1);
    // racing stripe
    g.fillStyle='#fff8dc';
    g.fillRect(6,2,2,20);
    // tail
    g.fillStyle=C.playerAccent;
    g.fillRect(3,21,8,1);
    // wheels
    g.fillStyle=C.playerWheel;
    g.fillRect(0,3,3,5);
    g.fillRect(11,3,3,5);
    g.fillRect(0,16,3,5);
    g.fillRect(11,16,3,5);
    // wheel rims
    g.fillStyle=C.wheelRim;
    g.fillRect(0,5,3,1);
    g.fillRect(11,5,3,1);
    g.fillRect(0,18,3,1);
    g.fillRect(11,18,3,1);
    // exhaust
    g.fillStyle='#666';
    g.fillRect(2,22,2,2);
    g.fillRect(10,22,2,2);
  });

  // ---- ENEMY CAR RED (14x22) ----
  const carRed = make(14,22,(g)=>{
    g.fillStyle=C.carRed;
    g.fillRect(2,1,10,20);
    g.fillStyle='#b02010';
    g.fillRect(3,0,8,1);
    g.fillRect(3,20,8,1);
    // windows
    g.fillStyle='#80aacc';
    g.fillRect(4,5,6,4);
    g.fillRect(4,11,6,3);
    g.fillStyle='rgba(255,255,255,0.3)';
    g.fillRect(4,5,2,2);
    // wheels
    g.fillStyle=C.wheel;
    g.fillRect(0,2,3,5); g.fillRect(11,2,3,5);
    g.fillRect(0,15,3,5); g.fillRect(11,15,3,5);
    g.fillStyle=C.wheelRim;
    g.fillRect(0,4,3,1); g.fillRect(11,4,3,1);
    g.fillRect(0,17,3,1); g.fillRect(11,17,3,1);
  });

  // ---- ENEMY CAR BLUE ----
  const carBlue = make(14,22,(g)=>{
    g.fillStyle=C.carBlue;
    g.fillRect(2,1,10,20);
    g.fillStyle='#1030b0';
    g.fillRect(3,0,8,1); g.fillRect(3,20,8,1);
    g.fillStyle='#aaddff';
    g.fillRect(4,5,6,4); g.fillRect(4,11,6,3);
    g.fillStyle='rgba(255,255,255,0.4)';
    g.fillRect(4,5,2,2);
    g.fillStyle=C.wheel;
    g.fillRect(0,2,3,5); g.fillRect(11,2,3,5);
    g.fillRect(0,15,3,5); g.fillRect(11,15,3,5);
    g.fillStyle=C.wheelRim;
    g.fillRect(0,4,3,1); g.fillRect(11,4,3,1);
    g.fillRect(0,17,3,1); g.fillRect(11,17,3,1);
  });

  // ---- ENEMY CAR PURPLE (agresivo, cambia de carril — el más peligroso) ----
  const carPurple = make(14,22,(g)=>{
    g.fillStyle=C.carPurple;
    g.fillRect(2,1,10,20);
    g.fillStyle='#4a1060';
    g.fillRect(3,0,8,1); g.fillRect(3,20,8,1);
    g.fillStyle='#d8a0ff';
    g.fillRect(4,5,6,4); g.fillRect(4,11,6,3);
    g.fillStyle='rgba(255,255,255,0.35)';
    g.fillRect(4,5,2,2);
    g.fillStyle=C.wheel;
    g.fillRect(0,2,3,5); g.fillRect(11,2,3,5);
    g.fillRect(0,15,3,5); g.fillRect(11,15,3,5);
    g.fillStyle=C.wheelRim;
    g.fillRect(0,4,3,1); g.fillRect(11,4,3,1);
    g.fillRect(0,17,3,1); g.fillRect(11,17,3,1);
  });

  // ---- MOTORCYCLE (8x16) — chica y rápida ----
  const moto = make(8,16,(g)=>{
    g.fillStyle='#222';
    g.fillRect(3,1,2,4);      // rueda delantera
    g.fillRect(3,11,2,4);     // rueda trasera
    g.fillStyle='#d02020';
    g.fillRect(2,5,4,7);      // cuerpo/tanque
    g.fillStyle='#ddd';
    g.fillRect(2,4,4,2);      // casco/manubrio
    g.fillStyle='#fff';
    g.fillRect(3,3,2,1);      // faro
    g.fillStyle=C.wheelRim;
    g.fillRect(3,2,2,1); g.fillRect(3,13,2,1);
  });

  // ---- BONUS: AVIÓN (18x12) ----
  const planeSprite = make(18,12,(g)=>{
    g.fillStyle='#dcdcdc';
    g.fillRect(7,1,4,10);          // fuselaje
    g.fillStyle='#b8b8b8';
    g.fillRect(0,5,18,2);          // alas
    g.fillRect(6,0,6,2);           // cola
    g.fillStyle='#e03020';
    g.fillRect(8,1,2,2);           // nariz roja
    g.fillStyle='#333';
    g.fillRect(8,10,2,2);
  });

  // ---- BONUS: TREN (28x14) ----
  const trainSprite = make(28,14,(g)=>{
    g.fillStyle='#333';
    g.fillRect(0,3,28,8);          // vagones
    g.fillStyle='#555';
    for(let i=0;i<4;i++) g.fillRect(2+i*7,4,5,4);  // ventanas
    g.fillStyle='#c00';
    g.fillRect(0,2,6,2);           // locomotora frente
    g.fillStyle='#222';
    g.fillRect(1,0,2,3);           // chimenea
    g.fillStyle=C.wheel;
    for(let i=0;i<5;i++) g.fillRect(1+i*6,11,4,3);
  });

  // ---- ENEMY CAR YELLOW ----
  const carYellow = make(14,22,(g)=>{
    g.fillStyle=C.carYellow;
    g.fillRect(2,1,10,20);
    g.fillStyle='#907000';
    g.fillRect(3,0,8,1); g.fillRect(3,20,8,1);
    g.fillStyle='#ffe080';
    g.fillRect(4,5,6,4); g.fillRect(4,11,6,3);
    g.fillStyle=C.wheel;
    g.fillRect(0,2,3,5); g.fillRect(11,2,3,5);
    g.fillRect(0,15,3,5); g.fillRect(11,15,3,5);
    g.fillStyle=C.wheelRim;
    g.fillRect(0,4,3,1); g.fillRect(11,4,3,1);
    g.fillRect(0,17,3,1); g.fillRect(11,17,3,1);
  });

  // ---- TRUCK (18x32) ----
  const truck = make(18,32,(g)=>{
    // cab
    g.fillStyle=C.truckBody;
    g.fillRect(2,0,14,12);
    g.fillStyle='#3a2010';
    g.fillRect(3,12,12,1);
    // windshield
    g.fillStyle='#80b0cc';
    g.fillRect(5,2,8,6);
    g.fillStyle='rgba(255,255,255,0.4)';
    g.fillRect(5,2,3,3);
    // trailer
    g.fillStyle=C.carGray;
    g.fillRect(2,13,14,18);
    g.fillStyle='#666';
    g.fillRect(3,15,12,1); g.fillRect(3,22,12,1); g.fillRect(3,29,12,1);
    g.fillRect(9,14,1,16);
    // wheels
    g.fillStyle=C.wheel;
    g.fillRect(0,3,3,6); g.fillRect(15,3,3,6);
    g.fillRect(0,18,3,7); g.fillRect(15,18,3,7);
    g.fillRect(0,26,3,5); g.fillRect(15,26,3,5);
    g.fillStyle=C.wheelRim;
    g.fillRect(0,6,3,1); g.fillRect(15,6,3,1);
    g.fillRect(0,21,3,1); g.fillRect(15,21,3,1);
    g.fillRect(0,28,3,1); g.fillRect(15,28,3,1);
  });

  // ---- FUEL CAN (10x14) ----
  const fuelCan = make(10,14,(g)=>{
    g.fillStyle=C.fuelCan;
    g.fillRect(2,3,6,10);
    g.fillRect(3,2,4,1);
    g.fillRect(4,1,2,1);
    g.fillRect(4,0,2,1);
    g.fillStyle=C.fuelShine;
    g.fillRect(3,4,2,4);
    g.fillStyle='#008040';
    g.fillRect(2,3,1,10); g.fillRect(8,3,1,10);
    g.fillRect(2,12,6,1);
    // label
    g.fillStyle='#fff';
    g.fillRect(3,7,4,2);
  });

  // ---- EXPLOSION FRAMES (32x32) ----
  const explosionFrames = [0,1,2,3,4,5].map(frame => make(32,32,(g)=>{
    const progress = frame / 5;
    const radius = 4 + progress * 12;
    const alpha = 1 - progress * 0.4;

    // Outer ring
    g.globalAlpha = alpha * 0.9;
    g.fillStyle = frame < 2 ? C.boom2 : frame < 4 ? C.boom1 : C.boom3;
    g.beginPath();
    g.arc(16,16,radius,0,Math.PI*2);
    g.fill();

    // Inner bright
    g.globalAlpha = alpha;
    g.fillStyle = frame < 3 ? '#ffffff' : C.boom2;
    g.beginPath();
    g.arc(16,16,radius*0.5,0,Math.PI*2);
    g.fill();

    // Sparks — deterministic via frame seed
    g.globalAlpha = alpha * 0.85;
    for(let i=0;i<8;i++){
      const angle = (i/8)*Math.PI*2 + frame*0.4;
      const dist = radius * 1.2;
      const sx = 16 + Math.cos(angle)*dist;
      const sy = 16 + Math.sin(angle)*dist;
      g.fillStyle = i%2===0 ? C.boom1 : C.boom2;
      g.fillRect(sx-1,sy-1,3,3);
    }

    // Smoke bits in later frames
    if(frame >= 3){
      g.globalAlpha = (progress - 0.5) * 0.6;
      g.fillStyle = C.smoke;
      for(let i=0;i<5;i++){
        const angle = (i/5)*Math.PI*2 + frame*0.7;
        const dist = radius * 1.5;
        g.beginPath();
        g.arc(16+Math.cos(angle)*dist, 16+Math.sin(angle)*dist, 3,0,Math.PI*2);
        g.fill();
      }
    }

    g.globalAlpha = 1;
  }));

  // ---- SMOKE PUFF (12x12) ----
  const smokePuffs = [0,1,2].map(f => make(12,12,(g)=>{
    const a = 0.5 - f*0.15;
    g.globalAlpha = a;
    g.fillStyle = '#aaa';
    g.beginPath();
    g.arc(6,6,3+f,0,Math.PI*2);
    g.fill();
    g.globalAlpha = 1;
  }));

  // ---- OIL SLICK (20x8) ----
  const oilSlick = make(20,8,(g)=>{
    g.fillStyle='#1a0a30';
    g.beginPath();
    g.ellipse(10,4,9,3,0,0,Math.PI*2);
    g.fill();
    // rainbow sheen
    const gr = g.createLinearGradient(0,0,20,0);
    gr.addColorStop(0,'rgba(255,0,0,0.3)');
    gr.addColorStop(0.33,'rgba(0,255,0,0.3)');
    gr.addColorStop(0.66,'rgba(0,0,255,0.3)');
    gr.addColorStop(1,'rgba(255,0,255,0.3)');
    g.fillStyle=gr;
    g.beginPath();
    g.ellipse(10,4,9,3,0,0,Math.PI*2);
    g.fill();
  });

  // ---- BUSES (fotos reales de colectivos de Buenos Aires, recortadas a sprite) ----
  // Uno por zona + 2 "comodín" que pueden aparecer en cualquier zona.
  function loadImg(src) {
    const i = new Image();
    i.src = src;
    return i;
  }
  const busLaMatanza = loadImg('Imagenes/buses/bus_lamatanza.png'); // línea 236
  const busLiniers   = loadImg('Imagenes/buses/bus_liniers.png');   // línea 86
  const busCaballito = loadImg('Imagenes/buses/bus_caballito.png'); // línea 88
  const busPalermo   = loadImg('Imagenes/buses/bus_palermo.png');   // línea 620
  const busRetiro    = loadImg('Imagenes/buses/bus_retiro.png');    // línea 622
  const busExtra1    = loadImg('Imagenes/buses/bus_extra1.png');    // línea 55
  const busExtra2    = loadImg('Imagenes/buses/bus_extra2.png');    // F1

  return {
    playerCar, carRed, carBlue, carYellow, carPurple, moto, truck, fuelCan, explosionFrames, smokePuffs, oilSlick,
    planeSprite, trainSprite,
    busLaMatanza, busLiniers, busCaballito, busPalermo, busRetiro, busExtra1, busExtra2
  };
})();
