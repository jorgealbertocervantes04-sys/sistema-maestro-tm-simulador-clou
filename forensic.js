/* ============================================================
   AUDITORÍA FORENSE 3D — escáner interactivo de patio
   ============================================================ */
(function (w) {
  const T = w.THREE, I = w.svgIcon;
  let renderer, scene, camera, controls, rig, raycaster, mouse, composer, bloom;
  let root, canvas, labelLayer, hotspots = [], running = false, booted = false;
  let clock, activeId = null;

  const HOT = [
    {
      id: 'tires', anchor: 'tires', label: 'Eje motriz · duales interiores', dy: 52,
      title: 'Presión fuera de norma en dual interior',
      evidence: [
        ['Presión medida', '62 psi'],
        ['Presión de norma', '105 psi'],
        ['Temperatura de banda', '71 °C en reposo'],
        ['Riesgo asociado', 'Fatiga térmica y estallido en rodado continuo']
      ],
      quote: '"Así viene desde la semana pasada, jefe, aguanta bien."',
      fixCost: 2800, fixTime: '45 min de taller',
      fixText: 'Enviar a taller · inflado y válvula',
      skipText: 'Liberar y revisar al regreso',
      skipWarn: 'La falla queda activa y viajará 640 km contigo.'
    },
    {
      id: 'brakes', anchor: 'brakes', label: 'Dolly · sistema neumático', dy: -6,
      title: 'Fuga de aire en manguera de servicio del dolly',
      evidence: [
        ['Caída de presión', '18 psi en 3 min con motor apagado'],
        ['Ubicación', 'Acoplamiento glad-hand del dolly'],
        ['Estado visual', 'Manguera con craquelado longitudinal'],
        ['Riesgo asociado', 'Pérdida de frenado del segundo remolque en descenso']
      ],
      quote: '"Es una fuguita, con que le den aire en la caseta se aguanta."',
      fixCost: 4200, fixTime: '1 h 20 min de taller',
      fixText: 'Reemplazo de manguera y prueba de estanqueidad',
      skipText: 'Liberar: el aire alcanza para el viaje',
      skipWarn: 'Sin frenado del segundo remolque en la primera bajada larga.'
    },
    {
      id: 'kingpin', anchor: 'kingpin', label: 'Quinta rueda · perno rey', dy: -54,
      title: 'Juego excesivo en el perno rey',
      evidence: [
        ['Juego lateral medido', '9 mm (tolerancia máx. 3 mm)'],
        ['Seguro de quijada', 'No asienta por completo'],
        ['Último servicio registrado', 'Hace 14 meses'],
        ['Riesgo asociado', 'Desacople del semirremolque en marcha']
      ],
      quote: '"Ya enganchó, se escuchó el clic. Vámonos que se hace tarde."',
      fixCost: 6500, fixTime: '2 h de taller y cambio de unidad',
      fixText: 'Bloquear la unidad y ajustar quinta rueda',
      skipText: 'Liberar: enganchó y se escuchó el seguro',
      skipWarn: 'Un desacople en marcha no tiene mitigación posible.'
    }
  ];

  function boot() {
    if (booted) return true;
    root = document.getElementById('forensic');
    canvas = document.getElementById('fcanvas');
    labelLayer = document.getElementById('flabels');
    if (!T || !canvas) return false;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true }); } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(w.devicePixelRatio, 1.8));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    scene = new T.Scene();
    scene.fog = new T.FogExp2(0x03060F, 0.014);
    camera = new T.PerspectiveCamera(45, 1, 0.1, 500);
    camera.position.set(16, 8, 18);

    scene.add(new T.AmbientLight(0x1E3348, 0.9));
    const key = new T.DirectionalLight(0xBFE9FF, 1.25); key.position.set(-14, 20, 12); scene.add(key);
    const fill = new T.DirectionalLight(0x24435F, 0.55); fill.position.set(14, 8, -14); scene.add(fill);
    const p1 = new T.PointLight(0xFB6500, 2.2, 46, 2); p1.position.set(5, 3, 5); scene.add(p1);
    const p2 = new T.PointLight(0xFB6500, 1.8, 56, 2); p2.position.set(-5, 3, -16); scene.add(p2);

    rig = w.TMTruck.buildTruck({ neon: 0xFB6500, detail: true });
    scene.add(rig.group);
    scene.add(w.TMTruck.buildGround(0xFB6500));

    try {
      controls = new T.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = 0.07;
      controls.minDistance = 6; controls.maxDistance = 48;
      controls.maxPolarAngle = Math.PI * 0.49;
      controls.target.set(0, 1.8, -4);
    } catch (e) { controls = null; }

    try {
      composer = new T.EffectComposer(renderer);
      composer.addPass(new T.RenderPass(scene, camera));
      bloom = new T.UnrealBloomPass(new T.Vector2(1, 1), 0.62, 0.7, 0.22);
      composer.addPass(bloom);
    } catch (e) { composer = null; }

    raycaster = new T.Raycaster(); mouse = new T.Vector2();
    buildHotspots();
    bindUI();
    clock = new T.Clock();
    booted = true;
    resize();
    loop();
    return true;
  }

  function buildHotspots() {
    HOT.forEach(h => {
      const pos = rig.anchors[h.anchor] || new T.Vector3(0, 2, 0);
      const g = new T.Group();
      g.position.copy(pos);
      const core = new T.Mesh(
        new T.SphereGeometry(0.22, 20, 20),
        new T.MeshBasicMaterial({ color: 0xFF003C })
      );
      const halo = new T.Mesh(
        new T.SphereGeometry(0.55, 22, 22),
        new T.MeshBasicMaterial({ color: 0xFF003C, transparent: true, opacity: 0.18, side: T.BackSide })
      );
      const ringGeo = new T.RingGeometry(0.62, 0.72, 42);
      const ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: 0xFF003C, transparent: true, opacity: 0.75, side: T.DoubleSide }));
      const ring2 = ring.clone(); ring2.material = ring.material.clone();
      g.add(core, halo, ring, ring2);
      g.userData = { hot: h, core, halo, ring, ring2, phase: Math.random() * 6.28 };
      scene.add(g);

      const el = document.createElement('div');
      el.className = 'hotlabel';
      el.innerHTML = `<b>${h.label}</b><span>Anomalía detectada · clic para inspeccionar</span>`;
      el.addEventListener('click', () => open(h.id));
      labelLayer.appendChild(el);
      g.userData.el = el;
      hotspots.push(g);
    });
    syncMarkers();
  }

  function syncMarkers() {
    const S = w.State.get();
    hotspots.forEach(g => {
      const id = g.userData.hot.id;
      const st = S.truck[id];
      const col = st === 'ok' ? 0x00FF66 : st === 'fault' ? 0xFF6D00 : 0xFF003C;
      [g.userData.core, g.userData.halo, g.userData.ring, g.userData.ring2].forEach(m => m.material.color.setHex(col));
      const el = g.userData.el;
      el.classList.toggle('done', st !== 'pending');
      const sub = st === 'ok' ? 'Corregida en taller' : st === 'fault' ? 'Liberada con falla activa' : 'Anomalía detectada · clic para inspeccionar';
      el.innerHTML = `<b>${g.userData.hot.label}</b><span>${sub}</span>`;
      el.onclick = () => open(id);
    });
    const done = HOT.filter(h => S.truck[h.id] !== 'pending').length;
    const cnt = document.getElementById('f-count');
    if (cnt) cnt.textContent = done + ' / 3';
    const bar = document.getElementById('f-progress');
    if (bar) bar.style.width = (done / 3 * 100) + '%';
    const fin = document.getElementById('f-finish');
    if (fin) fin.classList.toggle('hidden', done < 3);
  }

  function open(id) {
    const h = HOT.find(x => x.id === id); if (!h) return;
    const S = w.State.get();
    activeId = id;
    const decided = S.truck[id] !== 'pending';
    const modal = document.getElementById('f-modal');
    modal.innerHTML = `
      <div class="panel accent-red pad" style="max-width:640px;width:100%">
        <div class="kicker c-red">${h.label}</div>
        <h3 class="title" style="font-size:clamp(1.3rem,2.4vw,1.9rem);margin:.4rem 0 1rem">${h.title}</h3>
        <div class="dossier">
          ${h.evidence.map(e => `<div class="dossier-row"><span>${e[0]}</span><b>${e[1]}</b></div>`).join('')}
        </div>
        <p class="lede" style="font-style:italic;margin-top:1rem;opacity:.85">${h.quote}</p>
        ${decided ? `<p class="lede" style="margin-top:1rem;color:${S.truck[id] === 'ok' ? 'var(--green)' : 'var(--orange)'}">
            ${S.truck[id] === 'ok' ? 'Ya enviaste esta falla a taller.' : 'Ya liberaste esta falla. La decisión es irreversible.'}</p>
          <div class="f-actions"><button class="btn ghost" data-fclose>Cerrar</button></div>`
        : `<div class="f-actions">
            <button class="btn" data-fix>${I('check')} ${h.fixText} · -$${h.fixCost.toLocaleString('en-US')}</button>
            <button class="btn danger" data-skip>${I('x')} ${h.skipText} · $0 hoy</button>
          </div>
          <p class="lede" style="margin-top:.8rem;font-size:.9rem;opacity:.65">Liberar no cuesta nada en este momento. ${h.skipWarn}</p>`}
      </div>`;
    modal.classList.add('on');
  }

  function decide(fix) {
    const h = HOT.find(x => x.id === activeId); if (!h) return;
    if (fix) {
      w.State.charge(h.fixCost, 'Taller: ' + h.title, 'good');
      w.State.setPart(h.id, 'ok');
      w.State.addXp(120);
      w.toast('Falla corregida en taller · ' + h.fixTime, 'good');
    } else {
      w.State.setPart(h.id, 'fault');
      w.State.note('Liberada con falla activa: ' + h.title, 'bad');
      w.State.driver({ trust: -4 });
      w.toast('Falla liberada. Costo hoy: $0. La cuenta llega en ruta.', 'bad');
    }
    closeModal();
    syncMarkers();
  }

  function closeModal() {
    const m = document.getElementById('f-modal');
    m.classList.remove('on'); m.innerHTML = ''; activeId = null;
  }

  function bindUI() {
    const modal = document.getElementById('f-modal');
    modal.addEventListener('click', e => {
      if (e.target === modal) return closeModal();
      if (e.target.closest('[data-fix]')) return decide(true);
      if (e.target.closest('[data-skip]')) return decide(false);
      if (e.target.closest('[data-fclose]')) return closeModal();
    });
    document.getElementById('f-exit').addEventListener('click', close);
    document.getElementById('f-finish').addEventListener('click', close);
    canvas.addEventListener('pointerdown', onPick);
    canvas.addEventListener('pointermove', onHover);
  }

  function pickAt(e) {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(hotspots, true);
    if (!hits.length) return null;
    let o = hits[0].object;
    while (o && !o.userData.hot) o = o.parent;
    return o;
  }
  function onPick(e) { const g = pickAt(e); if (g) open(g.userData.hot.id); }
  function onHover(e) { canvas.style.cursor = pickAt(e) ? 'pointer' : 'grab'; }

  const v = new T.Vector3 ? new T.Vector3() : null;
  function loop() {
    requestAnimationFrame(loop);
    if (!running) return;
    const t = clock.getElapsedTime();
    if (controls) controls.update();
    hotspots.forEach(g => {
      const u = g.userData;
      const s = 1 + Math.sin(t * 2.4 + u.phase) * 0.16;
      u.core.scale.setScalar(s);
      u.halo.scale.setScalar(1 + Math.sin(t * 2.4 + u.phase) * 0.3);
      u.ring.lookAt(camera.position); u.ring2.lookAt(camera.position);
      const p1 = (t * 0.55 + u.phase) % 1, p2 = (t * 0.55 + u.phase + 0.5) % 1;
      u.ring.scale.setScalar(0.7 + p1 * 2.4); u.ring.material.opacity = 0.75 * (1 - p1);
      u.ring2.scale.setScalar(0.7 + p2 * 2.4); u.ring2.material.opacity = 0.75 * (1 - p2);
      // proyección de etiqueta HTML
      v.copy(g.position); v.project(camera);
      const vis = v.z < 1;
      const r = canvas.getBoundingClientRect();
      u.el.style.display = vis ? 'block' : 'none';
      u.el.style.left = ((v.x * 0.5 + 0.5) * r.width) + 'px';
      u.el.style.top = ((-v.y * 0.5 + 0.5) * r.height + (u.hot.dy || 0)) + 'px';
    });
    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  function resize() {
    if (!booted) return;
    const r = canvas.getBoundingClientRect();
    const W = Math.max(r.width, 1), H = Math.max(r.height, 1);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
    if (composer) composer.setSize(W, H);
  }

  function open3D() {
    if (!boot()) { w.toast('Tu navegador no soporta el escáner 3D.', 'bad'); return; }
    root.classList.add('on');
    running = true;
    syncMarkers();
    setTimeout(resize, 30);
    if (w.gsap) {
      camera.position.set(30, 16, 32);
      w.gsap.to(camera.position, { duration: 2.2, x: 16, y: 8, z: 18, ease: 'power3.out' });
    }
  }

  function close() {
    running = false;
    root.classList.remove('on');
    const S = w.State.get();
    if (HOT.every(h => S.truck[h.id] !== 'pending')) w.State.setForensicDone();
    document.dispatchEvent(new CustomEvent('forensic:closed'));
  }

  w.Forensic = { open: open3D, close, resize: () => { if (running) resize(); }, HOT };
})(window);
