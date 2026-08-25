/* ============================================================
   LÍNEA DE VIDA — retroceso forense de 92 días hasta el origen
   Fase 1 del Sistema Maestro TM
   ============================================================ */
(function (w) {
  const I = w.svgIcon;

  /* Cada nodo es un punto donde la cadena causal pudo romperse. */
  const NODES = [
    {
      t: 'HOY', hora: '03:14 h', dia: 'Km 214 · Carretera federal 57',
      title: 'Volcadura y pérdida total',
      body: 'El dual interior del eje motriz estalla a 92 km/h. El segundo remolque se desplaza, arrastra al primero y la unidad sale de la carpeta. Arnulfo “el Borras” Peña, 34 años, tres meses de antigüedad, muere en el lugar.',
      corte: 'Aquí ya no había nada que decidir. La decisión se había tomado tres meses antes.',
      cortable: false,
      cam: 'crash', mood: 'danger', speed: 0.2
    },
    {
      t: 'T–1 DÍA', hora: '19:40 h', dia: 'Radio de despacho',
      title: '"El dual trasero se siente raro"',
      body: 'El operador reporta una vibración por radio. La respuesta de despacho queda grabada: "aguanta, ya casi llegas". No se abre reporte. No se documenta. No se detiene la unidad.',
      corte: 'Un reporte verbal atendido habría sacado la unidad de ruta esa noche.',
      cortable: true,
      cam: 'follow', mood: 'danger', speed: 0.7
    },
    {
      t: 'T–3 DÍAS', hora: '02:10 h', dia: 'Telemetría Samsara',
      title: '11 h 20 min de conducción continua',
      body: 'Segunda salida sin descanso reglamentario en la misma semana. El sistema de fatiga emite alerta amarilla y luego roja. Las dos alertas se cierran sin comentario desde el escritorio.',
      corte: 'La alerta existía y funcionaba. Lo que faltó fue alguien con criterio para obedecerla.',
      cortable: true,
      cam: 'rear', mood: 'warn', speed: 1
    },
    {
      t: 'T–11 DÍAS', hora: '08:55 h', dia: 'Taller · Orden de trabajo 7712',
      title: 'Pérdida lenta de aire en el dolly',
      body: 'El taller detecta y documenta una fuga en el sistema neumático del dolly. La orden se abre correctamente. Nadie la cierra. La unidad vuelve a ruta ocho veces con la orden abierta.',
      corte: 'El hallazgo técnico fue correcto. Lo que falló fue el seguimiento del hallazgo.',
      cortable: true,
      cam: 'top', mood: 'warn', speed: 0.6
    },
    {
      t: 'T–26 DÍAS', hora: '13:20 h', dia: 'Solicitud interna de capacitación',
      title: 'El operador pidió que lo enseñaran',
      body: 'Ramiro solicita por escrito capacitación en revisión de frenos de aire. La solicitud se marca como "pendiente de cupo" y permanece así hasta el día del siniestro.',
      corte: 'Pidió aprender y le contestamos con una lista de espera.',
      cortable: true,
      cam: 'wide', mood: 'warn', speed: 0.4
    },
    {
      t: 'T–48 DÍAS', hora: '10:00 h', dia: 'Auditoría interna de patio',
      title: 'Tres unidades liberadas sin checklist completo',
      body: 'La auditoría documenta el patrón y lo clasifica como observación menor. No se levanta plan de acción, no se asigna responsable, no se define fecha de cierre.',
      corte: 'El sistema ya sabía. Lo escribió, lo archivó y siguió operando igual.',
      cortable: true,
      cam: 'top', mood: 'warn', speed: 0.3
    },
    {
      t: 'T–92 DÍAS', hora: '07:12 h', dia: 'Patio de operaciones · Folio VC-0912',
      title: 'Validación de competencias del operador',
      body: 'Se valida a Ramiro como competente para operar configuración Full doble remolque. Duración registrada de la evaluación: cuatro minutos. Evaluación práctica: no realizada. Documento firmado y archivado.',
      corte: 'Aquí empieza todo. Esta es la primera pieza de la cadena y también la única que dependía de una sola persona.',
      cortable: true, origen: true,
      cam: 'lowfront', mood: 'danger', speed: 0
    }
  ];

  let step = 0, root = null;

  function mount(container) {
    root = document.createElement('div');
    root.className = 'lifeline';
    container.appendChild(root);
    paint();
    const nd = NODES[step];
    setTimeout(() => {
      if (!w.Scene3D || !w.Scene3D.ready()) return;
      w.Scene3D.focus(nd.cam, 1.6); w.Scene3D.mood(nd.mood); w.Scene3D.setSpeed(nd.speed);
    }, 30);

    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ll]');
      if (!b) return;
      const v = b.dataset.ll;
      if (v === 'back') go(step + 1);
      else go(parseInt(v, 10));
    });
    return root;
  }

  function go(n) {
    if (n < 0 || n >= NODES.length || n === step) return;
    step = n;
    const nd = NODES[step];
    if (w.Scene3D) {
      w.Scene3D.focus(nd.cam, 1.5);
      w.Scene3D.mood(nd.mood);
      w.Scene3D.setSpeed(nd.speed);
    }
    if (w.Audio3D) (nd.origen ? w.Audio3D.hit : w.Audio3D.tick)();
    if (nd.origen) {
      w.State.flag('lineaVidaCompleta');
      w.toast('Origen localizado. La cadena causal está completa.', 'bad');
    }
    paint(true);
  }

  function paint(animate) {
    const nd = NODES[step];
    const cortes = NODES.slice(0, step + 1).filter(n => n.cortable).length;
    const last = step === NODES.length - 1;

    root.innerHTML = `
      <div class="ll-head">
        <div>
          <div class="kicker c-red">Fase 1 · Reconstrucción forense en retroceso</div>
          <h2 class="title" style="margin:.35rem 0 0">Línea de Vida</h2>
        </div>
        <div class="ll-code">
          <span class="kicker">Retroceso</span>
          <b class="num${nd.origen ? ' c-red' : ''}">${nd.t}</b>
        </div>
      </div>

      <div class="ll-rail" role="list">
        ${NODES.map((n, i) => `
          <button class="ll-node${i === step ? ' now' : ''}${i < step ? ' past' : ''}${n.origen && i <= step ? ' origen' : ''}"
                  data-ll="${i}" role="listitem" title="${n.t} · ${n.title}">
            <span class="ll-dot"></span>
            <span class="ll-t">${n.t}</span>
          </button>`).join('')}
        <div class="ll-track"><div class="ll-fill" style="width:${(step / (NODES.length - 1)) * 100}%"></div></div>
      </div>

      <div class="ll-card${animate ? ' in' : ''}${nd.origen ? ' origen' : ''}">
        <div class="ll-meta">
          <span>${I('clock')} ${nd.hora}</span>
          <span>${I('doc')} ${nd.dia}</span>
        </div>
        <h3 class="ll-title">${nd.title}</h3>
        <p class="ll-body">${nd.body}</p>
        <div class="ll-corte ${nd.cortable ? 'cut' : 'nocut'}">
          <span class="ll-stamp">${nd.cortable ? 'Punto de corte perdido' : 'Sin margen de maniobra'}</span>
          <p>${nd.corte}</p>
        </div>
      </div>

      <div class="ll-foot">
        <div class="ll-count">
          <span class="kicker">Momentos en los que esto se pudo detener</span>
          <b class="num c-amber">${cortes}</b>
        </div>
        ${last
          ? `<div class="ll-done">${I('alert')} La cadena está completa. Avanza para ver quién firmó.</div>`
          : `<button class="btn danger" data-ll="back">${I('refresh')} Retroceder un paso más</button>`}
      </div>`;
    const st = document.getElementById('stage');
    if (st) st.scrollTop = 0;
  }

  function reset() { step = 0; if (root) paint(); }

  w.Lifeline = { mount, go, reset, total: NODES.length, step: () => step };
})(window);
