/* ============================================================
   ESCENA CINEMÁTICA DE FONDO
   Iluminación PBR + bloom + cámara narrativa dirigida por slide.
   ============================================================ */
(function (w) {
  const T = w.THREE;
  let renderer, scene, camera, composer, bloom, rig, ground, clock;
  let speed = 0, targetSpeed = 0, mood = 'normal', ok = false;
  let curveT = 0;
  let shake = 0, tilt = 0;

  const PRESETS = {
    opening: { p: [-23, 8.5, 27], l: [2.5, 5.6, -3] },
    wide:    { p: [-33, 14, 18],   l: [1.5, 4.6, -9] },
    follow:  { p: [-16, 5.6, 19],  l: [2.4, 4.2, 0] },
    hood:    { p: [9.5, 3.2, 14],  l: [0.5, 2.6, 6.2] },
    cabin:   { p: [-9.5, 4.4, 11], l: [1.2, 3.6, 4.2] },
    axle:    { p: [5.6, 1.15, 4.6],l: [1.3, 0.9, 1.3] },
    kingpin: { p: [4.4, 2.6, 3.6], l: [0, 1.45, 0.72] },
    dolly:   { p: [5.8, 2.3, -10.6], l: [0, 1.35, -13.3] },
    trailer: { p: [-15, 6.5, -1],  l: [1.5, 4.2, -9] },
    rear:    { p: [-12, 5.5, -36], l: [1.5, 3.6, -26] },
    crash:   { p: [5.5, 2.2, 13],  l: [0.4, 2.8, 4.5] },
    top:     { p: [2, 30, -8.5],   l: [0, 0, -9] },
    lowfront:{ p: [-6.5, 1.4, 15], l: [1.2, 3.0, 5] },
    mirrors: { p: [-5.4, 4.0, 10.4], l: [1.5, 3.05, 5.2] },
    stacks:  { p: [-5.8, 3.6, 7.6],  l: [1.42, 2.6, 2.9] },
    tanks:   { p: [6.4, 1.7, 6.4],   l: [1.28, 0.95, 3.0] },
    landing: { p: [5.4, 2.1, 2.2],   l: [0.85, 0.9, -1.6] },
    hoses:   { p: [4.6, 2.5, -10.0], l: [0.42, 1.62, -12.8] },
    taillamp:{ p: [-5.2, 3.0, -33.5],l: [0, 1.8, -25.9] },
    mudflap: { p: [5.8, 1.5, -9.0],  l: [1.2, 0.4, -12.3] },
    box2:    { p: [-14.5, 6.2, -13], l: [1.4, 3.5, -20.2] },
    galibo:  { p: [-5.2, 5.4, 10],   l: [0, 3.9, 5.1] },
    front:   { p: [0.5, 2.2, 16.5],  l: [0, 2.2, 6.6] }
  };

  const MOODS = {
    normal: { neon: 0xFB6500, fog: 0x03060F, key: 0x8FD8FF, rim: 0xFB6500, bloom: 0.7 },
    danger: { neon: 0xFF003C, fog: 0x0C0308, key: 0xFFA8BC, rim: 0xFF003C, bloom: 0.95 },
    warn:   { neon: 0xFF6D00, fog: 0x0A0602, key: 0xE8CBAE, rim: 0xFF6D00, bloom: 0.78 },
    safe:   { neon: 0x00FF66, fog: 0x020A06, key: 0xC4FFDE, rim: 0x00FF66, bloom: 0.72 }
  };

  let keyLight, rimA, rimB, ambient, fillLight;

  function init(canvas) {
    if (!T) return false;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(w.devicePixelRatio, 1.9));
    renderer.setSize(w.innerWidth, w.innerHeight, false);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    scene = new T.Scene();
    scene.fog = new T.FogExp2(0x03060F, 0.0138);

    camera = new T.PerspectiveCamera(42, w.innerWidth / w.innerHeight, 0.1, 600);
    setPreset('opening', 0);

    ambient = new T.AmbientLight(0x2C4A68, 0.9); scene.add(ambient);
    scene.add(new T.HemisphereLight(0x4E7FA6, 0x050A14, 0.45));
    keyLight = new T.DirectionalLight(0x8FD8FF, 1.25);
    keyLight.position.set(-18, 22, 14); scene.add(keyLight);
    fillLight = new T.DirectionalLight(0x3E6688, 0.6);
    fillLight.position.set(16, 9, -18); scene.add(fillLight);
    rimA = new T.PointLight(0xFB6500, 2.6, 40, 2); rimA.position.set(6, 3.4, 6); scene.add(rimA);
    rimB = new T.PointLight(0xFB6500, 2.2, 50, 2); rimB.position.set(-6, 3.2, -16); scene.add(rimB);

    rig = w.TMTruck.buildTruck({ neon: 0xFB6500, detail: true });
    scene.add(rig.group);
    ground = w.TMTruck.buildGround(0xFB6500);
    scene.add(ground);
    buildSmoke();

    // post-proceso
    try {
      composer = new T.EffectComposer(renderer);
      composer.addPass(new T.RenderPass(scene, camera));
      bloom = new T.UnrealBloomPass(new T.Vector2(w.innerWidth, w.innerHeight), 0.7, 0.62, 0.5);
      composer.addPass(bloom);
    } catch (e) { composer = null; }

    clock = new T.Clock();
    ok = true;
    resize();
    loop();
    return true;
  }

  const camGoal = { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 };
  const camNow = { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 };

  function setPreset(name, dur) {
    const p = PRESETS[name] || PRESETS.wide;
    camGoal.px = p.p[0]; camGoal.py = p.p[1]; camGoal.pz = p.p[2];
    camGoal.lx = p.l[0]; camGoal.ly = p.l[1]; camGoal.lz = p.l[2];
    if (dur === 0 || !w.gsap) {
      Object.assign(camNow, camGoal);
      camera.position.set(camNow.px, camNow.py, camNow.pz);
      camera.lookAt(camNow.lx, camNow.ly, camNow.lz);
      return;
    }
    w.gsap.to(camNow, {
      duration: dur || 1.9, ease: 'power3.inOut',
      px: camGoal.px, py: camGoal.py, pz: camGoal.pz,
      lx: camGoal.lx, ly: camGoal.ly, lz: camGoal.lz
    });
  }

  function setMood(name, instant) {
    if (mood === name) return;
    mood = name;
    const m = MOODS[name] || MOODS.normal;
    const dur = instant ? 0 : 1.1;
    const apply = (target, hex) => {
      const col = target.color || target;
      if (!w.gsap || !dur) { col.setHex(hex); return; }
      const c = new T.Color(hex);
      w.gsap.to(col, { duration: dur, r: c.r, g: c.g, b: c.b });
    };
    rig.neonMats.forEach(mt => apply(mt, m.neon));
    ground.userData.grid.material.color.setHex(m.neon);
    apply(rimA.color, m.rim); apply(rimB.color, m.rim);
    keyLight.color.setHex(m.key);
    if (w.gsap) {
      const fc = new T.Color(m.fog);
      w.gsap.to(scene.fog.color, { duration: dur, r: fc.r, g: fc.g, b: fc.b });
      if (bloom) w.gsap.to(bloom, { duration: dur, strength: m.bloom });
    } else {
      scene.fog.color.setHex(m.fog);
      if (bloom) bloom.strength = m.bloom;
    }
  }

  function setSpeed(v) { targetSpeed = v; }

  function impact(force) {
    shake = force || 1;
    if (bloom && w.gsap) w.gsap.fromTo(bloom, { strength: 2.6 }, { strength: MOODS[mood].bloom, duration: 1.3 });
  }

  function pulseLights(color) {
    rig.lightMats.forEach(m => {
      if (!w.gsap) return;
      const c = new T.Color(color);
      w.gsap.fromTo(m.color, { r: c.r, g: c.g, b: c.b }, { r: new T.Color(m.userData.base).r, g: new T.Color(m.userData.base).g, b: new T.Color(m.userData.base).b, duration: 1.1 });
    });
  }

  /* ---- humo de escape: nubes procedurales en los dos tubos verticales ---- */
  let smoke = [];
  const STACKS = [[1.42, 4.35, 2.9], [-1.42, 4.35, 2.9]];
  function buildSmoke() {
    const geo = new T.SphereGeometry(0.22, 7, 6);
    const N_PER_STACK = 9;
    STACKS.forEach(([sx, sy, sz]) => {
      for (let i = 0; i < N_PER_STACK; i++) {
        const mat = new T.MeshBasicMaterial({ color: 0x9AA6B0, transparent: true, opacity: 0 });
        const m = new T.Mesh(geo, mat);
        const life = 1.4 + Math.random() * 0.9;
        m.userData = { sx, sy, sz, age: (i / N_PER_STACK) * life, life, jx: (Math.random() - 0.5) * 0.3 };
        m.position.set(sx, sy, sz);
        rig.group.add(m);
        smoke.push(m);
      }
    });
  }
  function updateSmoke(dt) {
    const intensity = Math.min(speed, 1);
    smoke.forEach(m => {
      const u = m.userData;
      u.age += dt;
      if (u.age >= u.life) { u.age -= u.life; }
      const t2 = u.age / u.life;
      m.position.set(
        u.sx + u.jx * t2,
        u.sy + t2 * (0.7 + speed * 1.1),
        u.sz - t2 * (0.35 + speed * 0.9)
      );
      const scale = 0.5 + t2 * 2.1;
      m.scale.setScalar(scale);
      m.material.opacity = (1 - t2) * (0.1 + intensity * 0.4);
    });
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!ok) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    speed += (targetSpeed - speed) * Math.min(dt * 1.6, 1);

    rig.wheels.forEach(g => { g.rotation.x -= speed * dt * 2.3; });
    ground.userData.dashes.forEach(d => {
      d.position.z += speed * dt * 12;
      if (d.position.z > 120) d.position.z -= 230;
    });

    // vibración de motor y balanceo
    const idle = 0.5 + speed * 0.5;
    rig.group.position.y = Math.sin(t * 26) * 0.006 * idle + Math.sin(t * 1.7) * 0.02;

    // toma de curvas: solo se nota cuando el camión va en movimiento (speed > 0);
    // en las estaciones de inspección (speed = 0) el chasis queda perfectamente quieto.
    curveT += dt * (0.12 + speed * 0.3);
    const curve = Math.sin(curveT) * speed * 0.07;
    rig.group.rotation.z = Math.sin(t * 0.9) * 0.0035 * idle + tilt + curve;
    rig.group.rotation.y = Math.sin(t * 0.31) * 0.006 + Math.sin(curveT * 0.5) * speed * 0.02;
    rig.group.position.x = Math.sin(curveT) * speed * 0.55;

    updateSmoke(dt);

    // deriva sutil + sacudida de impacto
    let sx = 0, sy = 0;
    if (shake > 0.001) {
      shake *= Math.pow(0.0009, dt);
      sx = (Math.random() - 0.5) * shake * 2.2;
      sy = (Math.random() - 0.5) * shake * 1.6;
      if (shake < 0.002) shake = 0;
    }
    camera.position.set(
      camNow.px + Math.sin(t * 0.23) * 0.75 + sx,
      camNow.py + Math.cos(t * 0.29) * 0.35 + sy,
      camNow.pz + Math.cos(t * 0.19) * 0.6
    );
    camera.lookAt(camNow.lx, camNow.ly, camNow.lz);

    rimA.intensity = 2.5 + Math.sin(t * 2.1) * 0.4;
    rimB.intensity = 2.1 + Math.cos(t * 1.7) * 0.35;

    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  function resize() {
    if (!ok) return;
    const W = w.innerWidth, H = w.innerHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
    if (composer) composer.setSize(W, H);
  }

  w.Scene3D = {
    init, resize, setSpeed, impact, pulseLights,
    focus: setPreset, mood: setMood,
    lean(v) { tilt = v || 0; },
    ready() { return ok; }
  };
})(window);
