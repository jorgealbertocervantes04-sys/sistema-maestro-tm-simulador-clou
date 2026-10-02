/* ============================================================
   AUDIO SINTETIZADO (sin archivos binarios)
   Motor, impactos y confirmaciones vía WebAudio.
   ============================================================ */
(function (w) {
  let ac = null, master = null, engineNodes = null, muted = false, unlocked = false;

  function unlock() {
    if (unlocked) return true;
    const Ctor = w.AudioContext || w.webkitAudioContext;
    if (!Ctor) return false;
    try {
      ac = new Ctor();
      master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
      if (ac.state === 'suspended') ac.resume();
      unlocked = true;
      return true;
    } catch (e) { return false; }
  }

  function noiseBuffer(sec) {
    const len = Math.floor(ac.sampleRate * sec);
    const b = ac.createBuffer(1, len, ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    return b;
  }

  function engine(on) {
    if (!unlocked || muted) return;
    if (on && !engineNodes) {
      const o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 52;
      const o2 = ac.createOscillator(); o2.type = 'square'; o2.frequency.value = 78;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; lp.Q.value = 0.9;
      const g = ac.createGain(); g.gain.value = 0;
      const lfo = ac.createOscillator(); lfo.frequency.value = 6.5;
      const lg = ac.createGain(); lg.gain.value = 6;
      lfo.connect(lg); lg.connect(o1.frequency);
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(master);
      o1.start(); o2.start(); lfo.start();
      g.gain.linearRampToValueAtTime(0.075, ac.currentTime + 1.4);
      engineNodes = { o1, o2, lfo, g };
    } else if (!on && engineNodes) {
      const { g, o1, o2, lfo } = engineNodes;
      g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.9);
      setTimeout(() => { try { o1.stop(); o2.stop(); lfo.stop(); } catch (e) {} }, 1100);
      engineNodes = null;
    }
  }

  function hit() {
    if (!unlocked || muted) return;
    const s = ac.createBufferSource(); s.buffer = noiseBuffer(0.55);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    const g = ac.createGain(); g.gain.value = 0.5;
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.55);
    s.connect(f); f.connect(g); g.connect(master); s.start();
    const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(120, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(32, ac.currentTime + 0.4);
    const og = ac.createGain(); og.gain.value = 0.42;
    og.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
    o.connect(og); og.connect(master); o.start(); o.stop(ac.currentTime + 0.5);
  }

  function good() { blip(660, 0.1); setTimeout(() => blip(990, 0.14), 90); }
  function tick() { blip(1320, 0.05, 0.12); }

  function blip(freq, dur, vol) {
    if (!unlocked || muted) return;
    const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    const g = ac.createGain(); g.gain.value = vol || 0.18;
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (dur || 0.12));
    o.connect(g); g.connect(master); o.start(); o.stop(ac.currentTime + (dur || 0.12) + 0.02);
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.5;
    return muted;
  }

  w.Audio3D = { unlock, engine, hit, good, tick, toggleMute, isMuted: () => muted, ready: () => unlocked };
})(window);
