/* ============================================================
   SIMULADOR DE INSPECCIÓN 3D — los 18 puntos del Full, clicables
   directamente sobre el modelo. El participante emite un veredicto
   real por cada punto y el sistema lo califica contra la condición
   verdadera de la unidad.
   ============================================================ */
(function (w) {
  const T = w.THREE, I = w.svgIcon;
  let renderer, scene, camera, controls, rig, raycaster, mouse, composer;
  let root, canvas, labelLayer, spots = [], running = false, booted = false;
  let clock, activeId = null, filtro = 'todos';

  /* ---- estado verdadero de cada punto (oculto al participante) ----
     cond: 'ok'   -> la pieza cumple
           'obs'  -> desviación menor: se corrige y se documenta, no bloquea
           'no'   -> defecto crítico: la unidad no debe salir
  */
  const PT = [
    { id: 'front', g: 'Tractor', n: 'Frente y faros', p: [0, 1.7, 7.1], dy: -40, cond: 'ok',
      ev: [['Faro izquierdo', 'Bajas y altas OK'], ['Faro derecho', 'Bajas y altas OK'], ['Cristales', 'Sin fisura ni opacidad'], ['Defensa', 'Sin deformación']],
      q: '"Los prendí los dos antes de que llegara, jefe."',
      why: 'Todo dentro de norma. Bloquear aquí cuesta tiempo de patio sin ganar seguridad.' },

    { id: 'cabin', g: 'Tractor', n: 'Cabina y parabrisas', p: [-1.4, 3.0, 4.2], dy: -46, cond: 'obs',
      ev: [['Parabrisas', 'Estrella de 2 cm fuera del campo visual'], ['Plumillas', 'Hule endurecido, deja película'], ['Peldaño izquierdo', 'Firme'], ['Agarradera', 'Firme']],
      q: '"Esa estrellita ya tiene meses, no crece."',
      why: 'La estrella fuera del campo visual no bloquea, pero se marca, se sella y se le pone fecha. Las plumillas se cambian hoy: es la falla que se cobra en la primera lluvia.' },

    { id: 'mirrors', g: 'Tractor', n: 'Espejos y visibilidad', p: [1.8, 2.9, 5.1], dy: -44, cond: 'no',
      ev: [['Espejo convexo derecho', 'Sujeto con cinta, vibra al ralentí'], ['Ajuste', 'Hecho con la unidad vacía'], ['Espejo de acera', 'Faltante'], ['Punto ciego derecho', 'Sin cobertura']],
      q: '"Con el principal me arreglo, ya conozco la unidad."',
      why: 'Sin espejo de acera y con el convexo suelto, el costado derecho del Full queda ciego. Es defecto que impide la salida, no una observación.' },

    { id: 'galibo', g: 'Tractor', n: 'Luces de gálibo', p: [0, 3.7, 4.5], dy: -40, cond: 'obs',
      ev: [['Marcadores superiores', '4 de 5 encendidos'], ['Color', 'Reglamentario'], ['Cableado', 'Sin empalme improvisado'], ['Perfil lateral', 'Completo']],
      q: '"Nomás es una, ni se nota."',
      why: 'Una luz fundida se repone en el momento, se documenta y se sale. No amerita bloqueo, pero tampoco se firma como conforme.' },

    { id: 'stacks', g: 'Tractor', n: 'Escapes verticales', p: [-1.4, 3.1, 2.5], dy: -40, cond: 'ok',
      ev: [['Abrazaderas', 'Apretadas'], ['Fugas visibles', 'Ninguna'], ['Humo en mínima', 'Transparente'], ['Aislante térmico', 'Íntegro']],
      q: '"Ese lo revisaron en el servicio pasado."',
      why: 'Sistema en condición. La verificación fue correcta y el resultado es conforme.' },

    { id: 'tanks', g: 'Tractor', n: 'Tanques de combustible', p: [1.6, 1.2, 2.1], dy: 34, cond: 'obs',
      ev: [['Tapón izquierdo', 'Apretado'], ['Tapón derecho', 'Sin empaque, escurre al llenar'], ['Soportes', 'Sin fractura'], ['Nivel', 'Suficiente para la ruta']],
      q: '"Nada más gotea tantito cuando lo lleno."',
      why: 'El empaque se cambia en cinco minutos. Escurrimiento sobre el escape es origen de incendio: se corrige antes de salir y se deja registrado.' },

    { id: 'tires', g: 'Rodada', n: 'Llantas y presión', p: [1.7, 0.6, 1.5], dy: 34, cond: 'no',
      ev: [['Dual interior eje motriz', '62 psi (norma 105)'], ['Temperatura de banda', '71 °C en reposo'], ['Profundidad de dibujo', '3 mm en posición 6'], ['Piedra entre duales', 'Presente en posición 4']],
      q: '"Así viene desde la semana pasada y aguanta bien."',
      why: 'Presión 40% abajo de norma y banda caliente en reposo. Ese dual revienta en rodado continuo: no conforme, no sale.' },

    { id: 'brakes', g: 'Rodada', n: 'Frenos de aire', p: [-1.6, 1.0, 0.8], dy: 34, cond: 'no',
      ev: [['Prueba de fuga estática', '18 psi en 3 min'], ['Corte de gobernador', 'Dentro de rango'], ['Recorrido de varilla', '52 mm (máx. 50 mm)'], ['Tambores', 'Sin fisura térmica']],
      q: '"Es una fuguita, con que le den aire en la caseta se aguanta."',
      why: 'Fuga confirmada y varilla fuera de tolerancia. Una pérdida lenta de aire no se siente en patio: se siente en la primera bajada larga.' },

    { id: 'axle', g: 'Rodada', n: 'Ejes y suspensión', p: [1.5, 0.95, 0.1], dy: 34, cond: 'ok',
      ev: [['Bolsas de aire', 'Sin fuga ni fisura'], ['Muelles', 'Completos'], ['Amortiguadores', 'Sin escurrimiento'], ['Testigos de tuerca', 'Alineados en las 12 posiciones']],
      q: '"Los testigos los alineé yo el lunes."',
      why: 'Los testigos alineados son evidencia válida y verificable. Conforme.' },

    { id: 'kingpin', g: 'Acoplamiento', n: 'Quinta rueda y perno rey', p: [0, 1.6, 0.7], dy: -40, cond: 'no',
      ev: [['Juego lateral medido', '9 mm (tolerancia 3 mm)'], ['Seguro de quijada', 'No asienta por completo'], ['Engrase del plato', 'Deficiente'], ['Último servicio', 'Hace 14 meses']],
      q: '"Ya enganchó, se escuchó el clic. Vámonos que se hace tarde."',
      why: 'El clic no es evidencia. Con 9 mm de juego y quijada sin asentar, el semirremolque se desacopla en marcha. Cero tolerancia.' },

    { id: 'landing', g: 'Acoplamiento', n: 'Tren de aterrizaje', p: [1.0, 1.3, -2.3], dy: 34, cond: 'ok',
      ev: [['Patines', 'Completamente arriba'], ['Manivela', 'Asegurada en su gancho'], ['Bases', 'Ambas presentes'], ['Estructura', 'Sin dobladura']],
      q: '"Los subí antes del tirón de prueba."',
      why: 'Secuencia correcta y estado conforme. Aquí no hay hallazgo.' },

    { id: 'hoses', g: 'Acoplamiento', n: 'Mangueras y conexiones', p: [-0.8, 2.0, 1.3], dy: -40, cond: 'obs',
      ev: [['Línea de servicio', 'Roce leve contra travesaño'], ['Línea de emergencia', 'Íntegra'], ['Empaques glad-hand', 'Uno reseco'], ['Cable eléctrico', 'Sin cinta de reparación']],
      q: '"Ese roce siempre ha estado ahí."',
      why: 'Roce incipiente y empaque reseco: se reposiciona la línea y se cambia el empaque hoy. Todavía no es bloqueo, pero se documenta con fecha.' },

    { id: 'dolly', g: 'Acoplamiento', n: 'Dolly y lanza', p: [0, 1.5, -13.2], dy: -40, cond: 'no',
      ev: [['Soldadura de lanza', 'Fisura de 4 cm en cordón'], ['Pasador', 'Con seguro'], ['Quinta rueda del dolly', 'Cerrada'], ['Cadenas de seguridad', 'Sin cruzar']],
      q: '"Esa marca es de la pintura, no es fisura."',
      why: 'Fisura en cordón de soldadura de la lanza más cadenas sin cruzar. Es el punto que menos se revisa del Full y el que lo desestabiliza. No conforme.' },

    { id: 'trailer', g: 'Carga', n: 'Caja 1', p: [1.5, 3.0, -6.0], dy: -42, cond: 'ok',
      ev: [['Sello de puertas', 'Íntegro, folio coincide'], ['Amarre de carga', 'Correcto y tensado'], ['Distribución', 'Peso mayor al frente'], ['Techo', 'Sin perforación']],
      q: '"El peso lo puse adelante como me enseñaron."',
      why: 'Carga distribuida y sellada correctamente. El operador además sabe explicar por qué. Conforme.' },

    { id: 'box2', g: 'Carga', n: 'Caja 2', p: [-1.5, 3.0, -20.0], dy: -42, cond: 'no',
      ev: [['Peso caja 1', '11.2 t'], ['Peso caja 2', '14.8 t'], ['Relación de convoy', 'Invertida'], ['Amarre interior', 'Dos tensores flojos']],
      q: '"Así la cargaron en el almacén, yo nomás la traje."',
      why: 'Caja 2 más pesada que caja 1 es la receta exacta del efecto tijera. Se reacomoda antes de salir: no es negociable aunque venga así del almacén.' },

    { id: 'mudflap', g: 'Carga', n: 'Faldones y guardapolvos', p: [1.4, 0.6, -10.5], dy: 32, cond: 'obs',
      ev: [['Faldón trasero derecho', 'Desgarrado a la mitad'], ['Faldón izquierdo', 'Completo'], ['Altura reglamentaria', 'Cumple en el completo'], ['Sujeción', 'Firme']],
      q: '"Es un pedazo de hule, no pasa nada."',
      why: 'Se repone en patio y se documenta. Es la observación más frecuente en revisión de carretera: lo menor también se firma.' },

    { id: 'taillamp', g: 'Carga', n: 'Luces traseras', p: [0, 2.0, -25.9], dy: -40, cond: 'no',
      ev: [['Luz de freno izquierda', 'No enciende'], ['Direccional derecha', 'Intermitencia rápida'], ['Cuartos', 'Encienden'], ['Reflejantes', 'Cubiertos de lodo']],
      q: '"Ahorita en la primera parada los limpio."',
      why: 'Sin luz de freno, el que viene atrás calcula la distancia con información falsa. Es defecto de salida, no un pendiente de camino.' },

    { id: 'rear', g: 'Carga', n: 'Vista de cierre', p: [0, 3.4, -26.6], dy: -44, cond: 'ok',
      ev: [['Recorrido 360°', 'Cerrado'], ['Checklist', 'Firmado por operador e instructor'], ['Evidencia fotográfica', 'Tres puntos críticos'], ['Folio de despacho', 'Coincide con la orden']],
      q: '"Ya quedó todo, jefe."',
      why: 'La documentación cierra correctamente. Conforme: el proceso quedó auditable.' }
  ];

  const VER = {
    ok:  { l: 'CONFORME',    d: 'La pieza cumple. Firmo y sigo.',                 c: 0x00FF66, css: 'var(--green)' },
    obs: { l: 'OBSERVACIÓN', d: 'Corrijo hoy, documento y la unidad sale.',        c: 0xFFC400, css: 'var(--amber)' },
    no:  { l: 'NO CONFORME', d: 'Bloqueo la unidad. No sale hasta corregirse.',    c: 0xFF003C, css: 'var(--red)' }
  };

  const veredictos = {};   // id -> 'ok'|'obs'|'no' emitido por el participante
  let costo = 0, aciertos = 0;

  /* ---------- puntuación de cada decisión ---------- */
  function juzgar(real, dado) {
    if (real === dado) return { pts: 3, tone: 'good', cost: 0,
      t: 'Veredicto correcto', m: 'Tu lectura coincide con la condición real de la pieza.' };

    if (real === 'no' && dado === 'ok') return { pts: 0, tone: 'bad', cost: 3500,
      t: 'Falso conforme sobre defecto crítico', m: 'Firmaste como buena una pieza que impide la salida. Este es el error que termina en expediente.' };
    if (real === 'no' && dado === 'obs') return { pts: 1, tone: 'bad', cost: 1800,
      t: 'Subestimaste el hallazgo', m: 'Detectaste algo, pero lo dejaste salir. Un defecto crítico no se documenta: se bloquea.' };

    if (real === 'obs' && dado === 'ok') return { pts: 0, tone: 'bad', cost: 900,
      t: 'Desviación pasada por alto', m: 'La firmaste sin registro. La desviación menor de hoy es la falla mayor de la próxima semana.' };
    if (real === 'obs' && dado === 'no') return { pts: 2, tone: 'mid', cost: 700,
      t: 'Bloqueo excesivo', m: 'Detectaste bien, pero paraste una unidad que se corregía en minutos. Bloquear de más también cuesta y desgasta tu autoridad.' };

    if (real === 'ok' && dado === 'obs') return { pts: 2, tone: 'mid', cost: 300,
      t: 'Observación sin sustento', m: 'Registraste un hallazgo donde no lo había. Documentar de más diluye lo que sí importa.' };
    if (real === 'ok' && dado === 'no') return { pts: 0, tone: 'bad', cost: 800,
      t: 'Bloqueo sin evidencia', m: 'Detuviste la unidad sin dato que lo respalde. Cuando bloqueas sin evidencia, la siguiente vez nadie te cree.' };

    return { pts: 0, tone: 'bad', cost: 0, t: '', m: '' };
  }

  /* ================= 3D ================= */
  function boot() {
    if (booted) return true;
    root = document.getElementById('insp3d');
    canvas = document.getElementById('icanvas');
    labelLayer = document.getElementById('ilabels');
    if (!T || !canvas) return false;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true }); } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(w.devicePixelRatio, 1.8));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    scene = new T.Scene();
    scene.fog = new T.FogExp2(0x03060F, 0.011);
    camera = new T.PerspectiveCamera(46, 1, 0.1, 600);
    camera.position.set(19, 12, 12);

    scene.add(new T.AmbientLight(0x1E3348, 0.95));
    const key = new T.DirectionalLight(0xBFE9FF, 1.25); key.position.set(-14, 22, 14); scene.add(key);
    const fill = new T.DirectionalLight(0x24435F, 0.6); fill.position.set(16, 9, -18); scene.add(fill);
    const p1 = new T.PointLight(0xFB6500, 2.0, 60, 2); p1.position.set(5, 4, 4); scene.add(p1);
    const p2 = new T.PointLight(0xFB6500, 1.6, 70, 2); p2.position.set(-5, 4, -18); scene.add(p2);

    rig = w.TMTruck.buildTruck({ neon: 0xFB6500, detail: true });
    scene.add(rig.group);
    scene.add(w.TMTruck.buildGround(0xFB6500));

    try {
      controls = new T.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = 0.07;
      controls.minDistance = 5; controls.maxDistance = 70;
      controls.maxPolarAngle = Math.PI * 0.49;
      controls.target.set(0, 2.0, -9.5);
    } catch (e) { controls = null; }

    try {
      composer = new T.EffectComposer(renderer);
      composer.addPass(new T.RenderPass(scene, camera));
      composer.addPass(new T.UnrealBloomPass(new T.Vector2(1, 1), 0.55, 0.7, 0.24));
    } catch (e) { composer = null; }

    raycaster = new T.Raycaster(); mouse = new T.Vector2();
    build();
    bind();
    clock = new T.Clock();
    booted = true;
    resize();
    loop();
    return true;
  }

  function build() {
    PT.forEach((h, idx) => {
      const g = new T.Group();
      g.position.set(h.p[0], h.p[1], h.p[2]);
      const core = new T.Mesh(new T.SphereGeometry(0.2, 18, 18), new T.MeshBasicMaterial({ color: 0xFB6500 }));
      const halo = new T.Mesh(new T.SphereGeometry(0.5, 20, 20),
        new T.MeshBasicMaterial({ color: 0xFB6500, transparent: true, opacity: 0.16, side: T.BackSide }));
      const ring = new T.Mesh(new T.RingGeometry(0.56, 0.66, 40),
        new T.MeshBasicMaterial({ color: 0xFB6500, transparent: true, opacity: 0.7, side: T.DoubleSide }));
      const pick = new T.Mesh(new T.SphereGeometry(0.95, 10, 10),
        new T.MeshBasicMaterial({ visible: false }));
      g.add(core, halo, ring, pick);
      g.userData = { hot: h, core, halo, ring, phase: idx * 0.42 };
      scene.add(g);

      const el = document.createElement('div');
      el.className = 'ins-chip';
      el.addEventListener('click', () => open(h.id));
      labelLayer.appendChild(el);
      g.userData.el = el;
      spots.push(g);
    });
    sync();
  }

  function sync() {
    let hechos = 0;
    spots.forEach(g => {
      const h = g.userData.hot;
      const v = veredictos[h.id];
      const oculto = filtro !== 'todos' && ((filtro === 'pend' && v) || (filtro === 'hecho' && !v));
      const col = !v ? 0xFB6500 : VER[v].c;
      [g.userData.core, g.userData.halo, g.userData.ring].forEach(m => m.material.color.setHex(col));
      g.visible = !oculto;
      const el = g.userData.el;
      const i = PT.findIndex(x => x.id === h.id) + 1;
      el.className = 'ins-chip' + (v ? ' v-' + v : '');
      el.innerHTML = `<i>${i}</i><em>${h.n}${v ? ' · ' + VER[v].l : ''}</em>`;
      if (v) hechos++;
    });
    pintaLista();
    const c = document.getElementById('i-count'); if (c) c.textContent = hechos + ' / ' + PT.length;
    const b = document.getElementById('i-progress'); if (b) b.style.width = (hechos / PT.length * 100) + '%';
    const f = document.getElementById('i-finish'); if (f) f.classList.toggle('hidden', hechos < PT.length);
    const cc = document.getElementById('i-cost');
    if (cc) { cc.textContent = costo ? '-$' + costo.toLocaleString('en-US') : '$0'; cc.style.color = costo ? 'var(--red)' : 'var(--green)'; }
  }

  function pintaLista() {
    const box = document.getElementById('i-list'); if (!box) return;
    const gs = ['Tractor', 'Rodada', 'Acoplamiento', 'Carga'];
    box.innerHTML = gs.map(gr => `
      <div class="ins-lg">
        <div class="ins-lgh">${gr}</div>
        ${PT.map((h, i) => h.g !== gr ? '' : `
          <button class="ins-li${veredictos[h.id] ? ' v-' + veredictos[h.id] : ''}" data-goto="${h.id}">
            <i>${i + 1}</i><span>${h.n}</span>
            <em>${veredictos[h.id] ? VER[veredictos[h.id]].l : '—'}</em>
          </button>`).join('')}
      </div>`).join('');
  }

  function irA(id) {
    const h = PT.find(x => x.id === id); if (!h) return;
    if (controls && w.gsap) {
      const tgt = new T.Vector3(h.p[0], h.p[1], h.p[2]);
      const dir = new T.Vector3(1.5, 0.85, 1.2).normalize().multiplyScalar(9);
      w.gsap.to(controls.target, { duration: .7, x: tgt.x, y: tgt.y, z: tgt.z, ease: 'power3.out' });
      w.gsap.to(camera.position, { duration: .7, x: tgt.x + dir.x, y: tgt.y + dir.y, z: tgt.z + dir.z, ease: 'power3.out' });
    }
    open(id);
  }

  function open(id) {
    const h = PT.find(x => x.id === id); if (!h) return;
    activeId = id;
    const v = veredictos[id];
    const m = document.getElementById('i-modal');
    const r = v ? juzgar(h.cond, v) : null;
    m.innerHTML = `
      <div class="panel accent-cyan pad ins-modal">
        <div class="kicker c-cyan">${h.g} · punto ${PT.findIndex(x => x.id === id) + 1} de ${PT.length}</div>
        <h3 class="title" style="font-size:clamp(1.2rem,2.3vw,1.7rem);margin:.35rem 0 .9rem">${h.n}</h3>
        <div class="dossier">
          ${h.ev.map(e => `<div class="dossier-row"><span>${e[0]}</span><b>${e[1]}</b></div>`).join('')}
        </div>
        <p class="lede" style="font-style:italic;margin-top:.9rem;opacity:.85">${h.q}</p>
        ${v ? `
          <div class="ins-fb ${r.tone}">
            <b>${r.t}</b>
            <span>${r.m}</span>
            <span class="ins-why">${h.why}</span>
            <div class="ins-meta">
              <span>Tu veredicto: <b style="color:${VER[v].css}">${VER[v].l}</b></span>
              <span>Condición real: <b style="color:${VER[h.cond].css}">${VER[h.cond].l}</b></span>
              <span>${r.pts} / 3 pts</span>
            </div>
          </div>
          <div class="f-actions"><button class="btn ghost" data-iclose>Cerrar</button></div>
        ` : `
          <p class="lede" style="margin:1rem 0 .5rem;font-size:.88rem;opacity:.75">Emite tu veredicto. Es irreversible y queda en el expediente.</p>
          <div class="ins-vs">
            ${Object.keys(VER).map(k => `
              <button class="ins-v v-${k}" data-v="${k}">
                <b>${VER[k].l}</b><span>${VER[k].d}</span>
              </button>`).join('')}
          </div>`}
      </div>`;
    m.classList.add('on');
  }

  function decidir(v) {
    const h = PT.find(x => x.id === activeId); if (!h || veredictos[h.id]) return;
    veredictos[h.id] = v;
    const r = juzgar(h.cond, v);
    aciertos += (r.pts === 3 ? 1 : 0);
    if (r.cost) { costo += r.cost; w.State.charge(r.cost, 'Inspección · ' + h.n + ': ' + r.t, 'bad'); }
    w.State.addXp(r.pts * 8);
    if (r.pts === 3) { w.Audio3D && w.Audio3D.good(); } else { w.Audio3D && w.Audio3D.hit(); }
    if (h.cond === 'no' && v === 'ok') { w.State.risk && w.State.risk(9); w.State.driver({ trust: -3 }); }
    open(h.id);
    sync();
  }

  function cerrarModal() {
    const m = document.getElementById('i-modal');
    m.classList.remove('on'); m.innerHTML = ''; activeId = null;
  }

  function bind() {
    const m = document.getElementById('i-modal');
    m.addEventListener('click', e => {
      if (e.target === m) return cerrarModal();
      const v = e.target.closest('[data-v]');
      if (v) return decidir(v.dataset.v);
      if (e.target.closest('[data-iclose]')) return cerrarModal();
    });
    const lb = document.getElementById('i-list');
    lb.addEventListener('click', e => {
      const b = e.target.closest('[data-goto]'); if (b) irA(b.dataset.goto);
    });
    document.addEventListener('keydown', e => {
      if (!running) return;
      if (e.key === 'Escape') { e.stopPropagation(); if (activeId) cerrarModal(); else salir(); }
    }, true);
    document.getElementById('i-exit').addEventListener('click', salir);
    document.getElementById('i-finish').addEventListener('click', cerrar);
    document.querySelectorAll('#insp3d [data-filtro]').forEach(b => {
      b.addEventListener('click', () => {
        filtro = b.dataset.filtro;
        document.querySelectorAll('#insp3d [data-filtro]').forEach(x => x.classList.toggle('on', x === b));
        sync();
      });
    });
    canvas.addEventListener('pointerdown', onPick);
    canvas.addEventListener('pointermove', onHover);
  }

  function pickAt(e) {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(spots.filter(s => s.visible), true);
    if (!hits.length) return null;
    let o = hits[0].object;
    while (o && !o.userData.hot) o = o.parent;
    return o;
  }
  function onPick(e) { const g = pickAt(e); if (g) open(g.userData.hot.id); }
  function onHover(e) { canvas.style.cursor = pickAt(e) ? 'pointer' : 'grab'; }

  const vv = new T.Vector3();
  function loop() {
    requestAnimationFrame(loop);
    if (!running) return;
    const t = clock.getElapsedTime();
    if (controls) controls.update();
    const r = canvas.getBoundingClientRect();
    spots.forEach(g => {
      const u = g.userData;
      if (!g.visible) { u.el.style.display = 'none'; return; }
      const pend = !veredictos[u.hot.id];
      const s = 1 + Math.sin(t * 2.2 + u.phase) * (pend ? 0.18 : 0.05);
      u.core.scale.setScalar(s);
      u.halo.scale.setScalar(1 + Math.sin(t * 2.2 + u.phase) * (pend ? 0.3 : 0.08));
      u.ring.lookAt(camera.position);
      const ph = pend ? (t * 0.5 + u.phase) % 1 : 0;
      u.ring.scale.setScalar(0.75 + ph * 2.0);
      u.ring.material.opacity = pend ? 0.7 * (1 - ph) : 0.5;
      vv.copy(g.position); vv.project(camera);
      const vis = vv.z < 1;
      u.el.style.display = vis ? 'flex' : 'none';
      u.el.style.left = ((vv.x * 0.5 + 0.5) * r.width) + 'px';
      u.el.style.top = ((-vv.y * 0.5 + 0.5) * r.height + (u.hot.dy || 0)) + 'px';
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

  function abrir() {
    if (!boot()) { w.toast('Tu navegador no soporta el simulador 3D.', 'bad'); return; }
    root.classList.add('on');
    running = true;
    sync();
    setTimeout(resize, 30);
    if (w.gsap) {
      camera.position.set(48, 26, 40);
      w.gsap.to(camera.position, { duration: 2.4, x: 19, y: 12, z: 12, ease: 'power3.out' });
    }
  }

  function salir() {
    running = false;
    root.classList.remove('on');
    document.dispatchEvent(new CustomEvent('insp3d:closed'));
  }

  function cerrar() {
    const total = PT.reduce((a, h) => a + juzgar(h.cond, veredictos[h.id] || 'ok').pts, 0);
    const max = PT.length * 3;
    const pct = Math.round(total / max * 100);
    const criticos = PT.filter(h => h.cond === 'no');
    const detectados = criticos.filter(h => veredictos[h.id] === 'no').length;
    const S = w.State;
    S.flag('inspeccion3dHecha');
    S.flag('inspeccion3dPct', pct);
    S.flag('inspeccion3dCriticos', detectados);
    S.get().inspeccion3d = {
      pct, total, max, costo, detectados, criticos: criticos.length,
      detalle: PT.map(h => ({ n: h.n, g: h.g, real: h.cond, dado: veredictos[h.id] || null, pts: juzgar(h.cond, veredictos[h.id] || 'ok').pts }))
    };
    S.addXp(pct >= 80 ? 140 : pct >= 60 ? 70 : 20);
    if (detectados === criticos.length) S.note('Los ' + criticos.length + ' defectos críticos de la unidad fueron detectados y bloqueados', 'good');
    else S.note('Salieron a ruta ' + (criticos.length - detectados) + ' defectos críticos sin bloquear', 'bad');
    w.toast('Inspección cerrada: ' + pct + '% de precisión · ' + detectados + '/' + criticos.length + ' críticos detectados',
      pct >= 80 ? 'good' : pct >= 60 ? 'mid' : 'bad');
    salir();
  }

  function resumen() {
    const total = PT.reduce((a, h) => a + juzgar(h.cond, veredictos[h.id] || 'ok').pts, 0);
    const hechos = Object.keys(veredictos).length;
    return { hechos, total, max: PT.length * 3, costo, cerrado: !!(w.State.get().flags.inspeccion3dHecha) };
  }

  w.Inspeccion3D = { abrir, salir, resize: () => { if (running) resize(); }, PT, resumen, veredictos };
})(window);
