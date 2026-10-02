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

  // Sin camiones en escena: toda la narrativa se ve sobre el trayecto del instructor
  const ROUTE_CAMS = {
    route:      { p: [-9.5, 4.6, 20],  l: [0, 1.0, -8] },
    opening:    { p: [-9.5, 4.6, 20],  l: [0, 1.0, -8] },
    wide:       { p: [-12, 6.2, 15],   l: [0, 1.0, -10] },
    follow:     { p: [-7, 3.4, 16],    l: [0, 1.0, -4] },
    hood:       { p: [5.5, 2.6, 14],   l: [0, 0.9, 0] },
    cabin:      { p: [-6.5, 3.0, 12],  l: [0, 1.0, -2] },
    axle:       { p: [4.5, 1.6, 8],    l: [0, 0.5, 0] },
    kingpin:    { p: [4.0, 1.8, 6],    l: [0, 0.6, -1] },
    dolly:      { p: [-4.5, 1.8, -4],  l: [0, 0.5, -10] },
    trailer:    { p: [-10, 5.0, 2],    l: [0, 1.0, -8] },
    rear:       { p: [8, 3.0, -22],    l: [0, 0.9, -14] },
    crash:      { p: [4.0, 1.5, 9],    l: [0, 0.6, 1] },
    top:        { p: [0.5, 16, 4],     l: [0, 0, -6] },
    lowfront:   { p: [-3.5, 1.3, 12],  l: [0, 0.7, 2] },
    mirrors:    { p: [-5.0, 2.2, 9],   l: [0, 0.9, 1] },
    stacks:     { p: [-4.0, 2.0, 7],   l: [0, 0.8, -1] },
    tanks:      { p: [4.2, 1.4, 6],    l: [0, 0.5, -1] },
    landing:    { p: [4.4, 1.6, 4],    l: [0, 0.5, -3] },
    hoses:      { p: [-4.2, 1.7, -2],  l: [0, 0.5, -9] },
    taillamp:   { p: [5.0, 2.0, -20],  l: [0, 0.7, -12] },
    mudflap:    { p: [-4.6, 1.4, -6],  l: [0, 0.4, -12] },
    box2:       { p: [-9, 4.2, -8],    l: [0, 0.8, -16] },
    galibo:     { p: [-4.5, 2.6, 8],   l: [0, 1.0, 0] },
    front:      { p: [0.5, 2.4, 14],   l: [0, 0.8, 2] }
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

    ambient = new T.AmbientLight(0x3E5A78, 1.25); scene.add(ambient);
    scene.add(new T.HemisphereLight(0x4E7FA6, 0x050A14, 0.45));
    keyLight = new T.DirectionalLight(0x8FD8FF, 1.25);
    keyLight.position.set(-18, 22, 14); scene.add(keyLight);
    fillLight = new T.DirectionalLight(0x3E6688, 0.6);
    fillLight.position.set(16, 9, -18); scene.add(fillLight);
    rimA = new T.PointLight(0xFB6500, 2.6, 40, 2); rimA.position.set(6, 3.4, 6); scene.add(rimA);
    rimB = new T.PointLight(0xFB6500, 2.2, 50, 2); rimB.position.set(-6, 3.2, -16); scene.add(rimB);

    // Portada sin camiones: el fondo muestra únicamente el trayecto del instructor
    rig = { group: new T.Group(), wheels: [], neonMats: [], lightMats: [] };
    scene.add(rig.group);
    ground = w.TMTruck ? w.TMTruck.buildRoute(0xFB6500) : null;
    if (ground) scene.add(ground);

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
    const p = ROUTE_CAMS[name] || ROUTE_CAMS.route;
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
    if (ground && ground.userData.grid) ground.userData.grid.material.color.setHex(m.neon);
    if (ground && ground.userData.edges) ground.userData.edges.forEach(e => apply(e.material, m.neon));
    if (ground && ground.userData.glow) ground.userData.glow.forEach(p => apply(p.material, m.neon));
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
    // Sin faroles de camión: el destello se da en los bordes del trayecto
    if (!ground || !ground.userData.edges || !w.gsap) return;
    const c = new T.Color(color);
    ground.userData.edges.forEach(e => {
      w.gsap.fromTo(e.material.color, { r: c.r, g: c.g, b: c.b }, { r: new T.Color(0xFB6500).r, g: new T.Color(0xFB6500).g, b: new T.Color(0xFB6500).b, duration: 1.1 });
    });
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!ok) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    speed += (targetSpeed - speed) * Math.min(dt * 1.6, 1);

    // El trayecto avanza como si el instructor lo estuviera recorriendo
    if (ground && ground.userData.dashes) {
      ground.userData.dashes.forEach(d => {
        d.position.z += (0.35 + speed * 12) * dt;
        if (d.position.z > 120) d.position.z -= 230;
      });
    }
    if (ground && ground.userData.glow) {
      ground.userData.glow.forEach((gEl, i) => {
        gEl.material.opacity = 0.14 + 0.08 * Math.sin(t * (1.3 + i * 0.4));
      });
    }
    // El tráiler fantasma viaja en el trayecto: avanza con la narrativa y respira con los pulsos
    if (ground && ground.userData.trailerGroup) {
      const tg = ground.userData.trailerGroup;
      tg.position.z += (0.25 + speed * 9) * dt;
      if (tg.position.z > 60) tg.position.z = -170;
      tg.position.y = Math.sin(t * 0.9) * 0.05;
      if (ground.userData.trailer) {
        ground.userData.trailer.forEach((p, i) => {
          p.material.opacity = 0.35 + 0.3 * Math.abs(Math.sin(t * (1.6 + i * 0.5)));
        });
      }
    }

    // ligera sensación de conducción (sin vehículo: solo deriva sutil de cámara)
    curveT += dt * (0.12 + speed * 0.3);

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
