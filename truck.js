/* ============================================================
   TRACTOCAMIÓN DOBLE REMOLQUE (FULL) — geometría procedural
   Se comparte entre el fondo cinemático y el escáner forense.
   Unidades ≈ metros. El morro apunta hacia +Z.
   ============================================================ */
(function (w) {
  const T = w.THREE;

  function buildTruck(opts) {
    opts = opts || {};
    const neon = opts.neon !== undefined ? opts.neon : 0xFB6500;
    const detail = opts.detail !== false;

    const root = new T.Group();
    const wheels = [];
    const neonMats = [];
    const lightMats = [];

    const body = new T.MeshStandardMaterial({ color: 0x1B3350, metalness: 0.78, roughness: 0.3 });
    const bodyDark = new T.MeshStandardMaterial({ color: 0x0E1B2E, metalness: 0.65, roughness: 0.48 });
    const chrome = new T.MeshStandardMaterial({ color: 0xC3D8E6, metalness: 1.0, roughness: 0.14 });
    const rubber = new T.MeshStandardMaterial({ color: 0x14171E, metalness: 0.15, roughness: 0.9 });
    const glass = new T.MeshStandardMaterial({ color: 0x0B2230, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.62 });

    function edgeMat() {
      const m = new T.LineBasicMaterial({ color: neon, transparent: true, opacity: 1 });
      neonMats.push(m); return m;
    }
    function lampMat(color, intensity) {
      const m = new T.MeshBasicMaterial({ color: color });
      m.userData.base = color; m.userData.i = intensity || 1;
      lightMats.push(m); return m;
    }

    /* --- helpers --- */
    function slab(w_, h_, d_, x, y, z, mat, outline) {
      const g = new T.BoxGeometry(w_, h_, d_);
      const m = new T.Mesh(g, mat || body);
      m.position.set(x, y, z);
      root.add(m);
      if (outline !== false) {
        const e = new T.LineSegments(new T.EdgesGeometry(g), edgeMat());
        e.position.set(x, y, z);
        root.add(e);
      }
      return m;
    }

    function lamp(w_, h_, d_, x, y, z, color, i) {
      const m = new T.Mesh(new T.BoxGeometry(w_, h_, d_), lampMat(color, i));
      m.position.set(x, y, z);
      root.add(m);
      return m;
    }

    /* --- rueda con rin y neumático --- */
    function wheel(x, z, r) {
      r = r || 0.52;
      const g = new T.Group();
      const tire = new T.Mesh(new T.TorusGeometry(r * 0.82, r * 0.3, 8, 22), rubber);
      tire.rotation.y = Math.PI / 2;
      const drum = new T.Mesh(new T.CylinderGeometry(r * 0.62, r * 0.62, 0.34, 16), bodyDark);
      drum.rotation.z = Math.PI / 2;
      const rim = new T.Mesh(new T.CylinderGeometry(r * 0.44, r * 0.44, 0.38, 12), chrome);
      rim.rotation.z = Math.PI / 2;
      const spokes = new T.LineSegments(
        new T.EdgesGeometry(new T.CylinderGeometry(r * 0.46, r * 0.46, 0.4, 8)), edgeMat()
      );
      spokes.rotation.z = Math.PI / 2;
      g.add(tire, drum, rim, spokes);
      g.position.set(x, r, z);
      root.add(g);
      wheels.push(g);
      return g;
    }
    function axle(z, x1, dual, r) {
      wheel(x1, z, r); wheel(-x1, z, r);
      if (dual) { wheel(x1 + 0.42, z, r); wheel(-x1 - 0.42, z, r); }
      const bar = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, x1 * 2 + 0.6, 8), bodyDark);
      bar.rotation.z = Math.PI / 2; bar.position.set(0, r || 0.52, z);
      root.add(bar);
    }

    /* ================= TRACTOR ================= */
    // chasis
    slab(0.16, 0.26, 8.6, 0.95, 0.98, 2.9, bodyDark, false);
    slab(0.16, 0.26, 8.6, -0.95, 0.98, 2.9, bodyDark, false);
    // defensa y parrilla
    slab(2.62, 0.42, 0.3, 0, 0.86, 7.28, chrome);
    slab(2.3, 1.18, 0.16, 0, 1.72, 7.16, bodyDark);
    for (let i = 0; i < 5; i++) slab(2.06, 0.07, 0.06, 0, 1.28 + i * 0.22, 7.26, chrome, false);
    // cofre
    slab(2.46, 1.28, 1.9, 0, 1.85, 6.15, body);
    slab(2.3, 0.34, 1.5, 0, 2.6, 6.3, body);
    // cabina + dormitorio
    slab(2.52, 2.26, 2.35, 0, 2.35, 4.1, body);
    slab(2.52, 2.05, 1.9, 0, 2.3, 2.05, body);
    // parabrisas y ventanas
    slab(2.16, 1.0, 0.1, 0, 2.92, 5.28, glass, false);
    slab(0.08, 0.86, 1.3, 1.27, 2.7, 4.2, glass, false);
    slab(0.08, 0.86, 1.3, -1.27, 2.7, 4.2, glass, false);
    // techo aerodinámico
    slab(2.4, 0.5, 3.9, 0, 3.68, 3.2, body);
    // faros
    lamp(0.5, 0.26, 0.1, 0.92, 1.62, 7.24, 0xFFF3D0, 1.6);
    lamp(0.5, 0.26, 0.1, -0.92, 1.62, 7.24, 0xFFF3D0, 1.6);
    // luces de gálibo
    for (let i = -2; i <= 2; i++) lamp(0.13, 0.09, 0.09, i * 0.42, 3.95, 5.1, 0xFFB020, 1.1);

    if (detail) {
      // escapes verticales
      [1.42, -1.42].forEach(x => {
        const st = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 3.5, 10), chrome);
        st.position.set(x, 2.6, 2.9); root.add(st);
        const e = new T.LineSegments(new T.EdgesGeometry(new T.CylinderGeometry(0.11, 0.11, 3.5, 10)), edgeMat());
        e.position.copy(st.position); root.add(e);
      });
      // tanques de combustible
      [1.28, -1.28].forEach(x => {
        const tk = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 1.7, 14), chrome);
        tk.rotation.x = Math.PI / 2; tk.position.set(x, 0.95, 3.0); root.add(tk);
        const e = new T.LineSegments(new T.EdgesGeometry(new T.CylinderGeometry(0.42, 0.42, 1.7, 14)), edgeMat());
        e.rotation.x = Math.PI / 2; e.position.copy(tk.position); root.add(e);
      });
      // espejos
      [1.5, -1.5].forEach(x => {
        slab(0.1, 0.72, 0.16, x, 3.0, 5.15, bodyDark);
        slab(0.06, 0.06, 0.5, x * 0.94, 3.35, 5.35, chrome, false);
      });
    }

    // ejes del tractor
    axle(6.0, 1.22, false, 0.56);   // direccional
    axle(1.55, 1.18, true, 0.54);   // motriz 1
    axle(0.28, 1.18, true, 0.54);   // motriz 2

    // quinta rueda
    const fw = slab(1.9, 0.16, 1.5, 0, 1.24, 0.72, chrome);
    const kp = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.3, 10), chrome);
    kp.position.set(0, 1.4, 0.72); root.add(kp);

    /* ================= CAJA 1 ================= */
    function boxTrailer(zc, len) {
      slab(2.56, 2.9, len, 0, 2.95, zc, body);
      // costillas
      if (detail) {
        const n = Math.floor(len / 1.35);
        for (let i = 0; i < n; i++) {
          const z = zc + len / 2 - 0.7 - i * 1.35;
          slab(2.62, 2.7, 0.07, 0, 2.95, z, bodyDark, false);
        }
      }
      // travesaño inferior
      slab(2.3, 0.22, len - 0.4, 0, 1.42, zc, bodyDark, false);
      // luces traseras
      lamp(0.32, 0.16, 0.08, 0.95, 1.75, zc - len / 2 - 0.06, 0xFF1030, 1.4);
      lamp(0.32, 0.16, 0.08, -0.95, 1.75, zc - len / 2 - 0.06, 0xFF1030, 1.4);
    }

    boxTrailer(-6.0, 11.4);
    axle(-10.3, 1.2, true, 0.54);
    axle(-11.6, 1.2, true, 0.54);
    // tren de aterrizaje
    [0.85, -0.85].forEach(x => slab(0.16, 1.1, 0.16, x, 0.85, -1.6, bodyDark, false));

    /* ================= DOLLY ================= */
    slab(0.14, 0.2, 2.3, 0.7, 1.02, -13.4, bodyDark);
    slab(0.14, 0.2, 2.3, -0.7, 1.02, -13.4, bodyDark);
    const lanza = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 1.6, 8), chrome);
    lanza.rotation.x = Math.PI / 2; lanza.position.set(0, 1.05, -12.55); root.add(lanza);
    const fw2 = slab(1.6, 0.14, 1.3, 0, 1.28, -13.9, chrome);
    axle(-14.05, 1.18, true, 0.54);
    // mangueras neumáticas del dolly
    const hose = new T.Mesh(new T.TorusGeometry(0.34, 0.045, 6, 18, Math.PI * 1.2), new T.MeshStandardMaterial({ color: 0x1a2c3a, roughness: .9 }));
    hose.position.set(0.42, 1.62, -12.8); hose.rotation.set(0, 0.4, 0.6); root.add(hose);

    /* ================= CAJA 2 ================= */
    boxTrailer(-20.2, 11.4);
    axle(-24.5, 1.2, true, 0.54);
    axle(-25.8, 1.2, true, 0.54);

    // faldones / mudflaps
    if (detail) {
      [[-12.3, 1.2], [-26.5, 1.2], [-0.4, 1.4]].forEach(([z, x]) => {
        slab(0.75, 0.6, 0.05, x, 0.34, z, bodyDark, false);
        slab(0.75, 0.6, 0.05, -x, 0.34, z, bodyDark, false);
      });
    }

    /* ---- puntos de anclaje para cámara y hotspots ---- */
    const anchors = {
      wide: new T.Vector3(0, 2.4, -9),
      hood: new T.Vector3(0, 2.0, 6.4),
      cabin: new T.Vector3(0, 2.8, 4.0),
      axle: new T.Vector3(1.5, 0.9, 0.9),
      kingpin: new T.Vector3(0, 1.5, 0.72),
      dolly: new T.Vector3(0, 1.3, -13.3),
      trailer: new T.Vector3(0, 2.9, -6.0),
      rear: new T.Vector3(0, 2.4, -26.2),
      tires: new T.Vector3(1.6, 0.55, 1.55),
      brakes: new T.Vector3(0.5, 1.5, -12.9)
    };

    root.userData = { wheels, neonMats, lightMats, anchors };
    return { group: root, wheels, neonMats, lightMats, anchors };
  }

  /* ---- piso técnico: rejilla + dashes de carretera ---- */
  function buildGround(neon) {
    const g = new T.Group();
    const grid = new T.GridHelper(220, 88, neon, 0x0C1C2A);
    grid.material.transparent = true; grid.material.opacity = 0.16;
    g.add(grid);

    const dashes = [];
    const dashMat = new T.MeshBasicMaterial({ color: 0x1F3A4A });
    for (let i = 0; i < 34; i++) {
      const d = new T.Mesh(new T.BoxGeometry(0.22, 0.02, 3.6), dashMat.clone());
      d.position.set(i % 2 ? 5.6 : -5.6, 0.01, -110 + i * 7);
      g.add(d); dashes.push(d);
    }
    g.userData = { dashes, grid };
    return g;
  }

  w.TMTruck = { buildTruck, buildGround };
})(window);
