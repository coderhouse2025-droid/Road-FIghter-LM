// ============================================================
//  AUDIO ENGINE — 8-bit chiptune via Web Audio API
// ============================================================
const Audio8 = (() => {
  let ctx = null;
  let masterGain = null;
  let musicNode = null;
  let musicInterval = null;
  let muted = false;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.25;
    masterGain.connect(ctx.destination);
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // ---- low-level tone ----
  function playTone(freq, type, start, dur, vol=0.3, dest=null) {
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(g);
    g.connect(dest || masterGain);
    osc.start(start);
    osc.stop(start + dur + 0.01);
  }

  // ---- SFX ----
  function sfxExplosion() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    // noise burst via rapid freq sweep
    for (let i = 0; i < 8; i++) {
      playTone(80 + Math.random()*200, 'sawtooth', t + i*0.04, 0.08, 0.4);
    }
    playTone(55, 'square', t, 0.4, 0.5);
  }

  function sfxEngine(speedRatio) {
    // called every frame — handled by continuous oscillator via engineOsc
  }

  function sfxCollect() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [523,659,784,1047].forEach((f,i)=>playTone(f,'square',t+i*0.06,0.1,0.3));
  }

  function sfxCrash() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    playTone(110,'sawtooth',t,0.3,0.5);
    playTone(55,'square',t+0.05,0.4,0.4);
    for(let i=0;i<6;i++) playTone(200+Math.random()*400,'sawtooth',t+i*0.05,0.07,0.3);
  }

  function sfxStart() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [262,330,392,523,659,784].forEach((f,i)=>playTone(f,'square',t+i*0.1,0.15,0.3));
  }

  function sfxGameOver() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [392,330,262,196,147].forEach((f,i)=>playTone(f,'square',t+i*0.18,0.25,0.35));
  }

  function sfxFuelWarning() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    playTone(880,'square',t,0.1,0.3);
    playTone(880,'square',t+0.2,0.1,0.3);
  }

  // ---- ENGINE DRONE (continuous) ----
  let engOsc = null, engGain = null;
  function startEngine() {
    if (!ctx || muted || engOsc) return;
    engOsc = ctx.createOscillator();
    engGain = ctx.createGain();
    engOsc.type = 'sawtooth';
    engOsc.frequency.value = 60;
    engGain.gain.value = 0.05;
    engOsc.connect(engGain);
    engGain.connect(masterGain);
    engOsc.start();
  }
  function updateEngine(speedRatio) {
    if (!engOsc) return;
    engOsc.frequency.value = 40 + speedRatio * 160;
    engGain.gain.value = 0.03 + speedRatio * 0.07;
  }
  function stopEngine() {
    if (engOsc) { try { engOsc.stop(); } catch(e){} engOsc = null; }
  }

  // ---- BGM: simple 8-bit melody loop ----
  // Road Fighter-style driving theme
  const BGM_TEMPO = 0.13; // seconds per 16th note
  const BGM_NOTES = [
    // bar 1
    [330,1],[294,1],[262,1],[294,1],[330,1],[330,1],[330,2],
    [294,1],[294,1],[294,2],[330,1],[392,1],[392,2],
    [330,1],[294,1],[262,1],[294,1],[330,1],[330,1],[330,1],[330,1],
    [294,1],[294,1],[330,1],[294,1],[262,2],null,
    // bar 2 (higher)
    [523,1],[494,1],[440,1],[494,1],[523,1],[523,1],[523,2],
    [494,1],[494,1],[494,2],[523,1],[587,1],[587,2],
    [523,1],[494,1],[440,1],[494,1],[523,1],[523,1],[523,1],[523,1],
    [494,1],[494,1],[523,1],[494,1],[440,2],null,
  ];

  let bgmIdx = 0, bgmTimer = null;

  function playBGMNote() {
    if (!ctx || muted) return;
    const n = BGM_NOTES[bgmIdx % BGM_NOTES.length];
    bgmIdx++;
    if (!n) return;
    const [freq, beats] = n;
    playTone(freq, 'square', ctx.currentTime, BGM_TEMPO * beats * 0.85, 0.18);
  }

  function startBGM() {
    if (bgmTimer) return;
    bgmIdx = 0;
    bgmTimer = setInterval(playBGMNote, BGM_TEMPO * 1000);
  }

  function stopBGM() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  }

  function setMute(val) {
    muted = val;
    if (muted) { stopBGM(); stopEngine(); }
  }

  return { init, resume, sfxExplosion, sfxCollect, sfxCrash, sfxStart, sfxGameOver, sfxFuelWarning, startEngine, updateEngine, stopEngine, startBGM, stopBGM, setMute, get muted(){ return muted; } };
})();
