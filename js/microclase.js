/* ============================================================
   MICRO-CLASE — el instructor demuestra que sabe enseñar.
   Elige un operador con mal hábito, diseña la intervención en
   cuatro momentos andragógicos y la imparte contra reloj.
   ============================================================ */
(function (w) {
  const I = w.svgIcon;

  const CASES = [
    {
      id: 'ramiro', n: 'Arnulfo “el Borras” Peña', e: '11 años de experiencia', cam: 'axle',
      habito: 'Patea las llantas en lugar de usar manómetro',
      perfil: 'Nunca ha tenido un incidente. Considera que el manómetro es pérdida de tiempo y que "la patada nunca le ha fallado".',
      dice: '"Llevo once años haciéndolo así, jefe. Yo con la patada sé si va baja."',
      trampa: 'Su experiencia es real y le funcionó hasta hoy. Si la niegas de frente, cierra la puerta.',
      clave: 'experiencia'
    },
    {
      id: 'yaneth', n: 'Yaneth Robles', e: '2 años de experiencia', cam: 'cabin',
      habito: 'Contesta el celular en ruta con manos libres y sigue en tráfico denso',
      perfil: 'Joven, cumplida, con excelente puntualidad. Cree que el manos libres elimina el riesgo porque no suelta el volante.',
      dice: '"Pero si no lo agarro con la mano, es igual que platicar con un copiloto."',
      trampa: 'Tiene una creencia técnica equivocada, no una actitud desafiante. Necesita evidencia, no sanción.',
      clave: 'evidencia'
    },
    {
      id: 'toño', n: 'Antonio Barrera', e: '19 años de experiencia', cam: 'kingpin',
      habito: 'Omite el tirón de prueba del enganche cuando va retrasado',
      perfil: 'Operador respetado, referente del patio. Los nuevos lo imitan. Solo lo omite bajo presión de tiempo.',
      dice: '"Cuando traigo el tiempo encima hay que decidir. Y ese enganche yo lo siento cuando arranco."',
      trampa: 'Es líder informal. Lo que le corrijas a él se replica en todo el patio, para bien o para mal.',
      clave: 'liderazgo'
    }
  ];

  const STEPS = [
    {
      k: 'apertura', t: 'Momento 1 · Apertura',
      q: '¿Cómo abres la conversación?',
      why: 'El adulto decide en los primeros treinta segundos si te va a escuchar o si se va a defender.',
      opts: [
        { t: 'Le pides que te explique cómo lo hace él y por qué le ha funcionado hasta hoy.', v: 3, f: 'Correcto. Abres reconociendo su experiencia; eso baja la defensa y te da el diagnóstico real de su lógica.' },
        { t: 'Le dices de entrada que ese hábito está mal y va contra el procedimiento.', v: 0, f: 'Abriste con juicio. El adulto se defiende y todo lo que sigue lo va a escuchar como regaño, no como aprendizaje.' },
        { t: 'Empiezas explicando el fundamento normativo y el artículo que aplica.', v: 1, f: 'La norma es cierta pero no es puerta de entrada. Sin conexión con su experiencia, la norma suena a burocracia.' }
      ]
    },
    {
      k: 'evidencia', t: 'Momento 2 · Evidencia',
      q: '¿Cómo le muestras la brecha?',
      why: 'La evidencia que el propio operador genera vale diez veces más que la que tú le presentas.',
      opts: [
        { t: 'Le pides que estime primero y después que mida él mismo con el instrumento, y comparan.', v: 3, f: 'Correcto. Él descubre la brecha con sus manos. Ya no es tu palabra contra la suya: es su propio dato.' },
        { t: 'Le muestras la estadística de siniestros y las fotos del caso reciente.', v: 1, f: 'Impacta pero no lo involucra. La estadística le pasa a otros; el dato de su propia unidad le pasa a él.' },
        { t: 'Le dices cuánto cuesta la multa y el deducible si se le revienta.', v: 1, f: 'El costo motiva un rato. No genera criterio y se apaga en cuanto vuelve la presión de tiempo.' }
      ]
    },
    {
      k: 'practica', t: 'Momento 3 · Práctica guiada',
      q: '¿Cómo aseguras que lo sabe hacer?',
      why: 'Entender no es poder hacer. Sin ejecución observada, la clase no cerró.',
      opts: [
        { t: 'Él ejecuta el procedimiento completo mientras tú observas en silencio y solo intervienes al final.', v: 3, f: 'Correcto. El silencio es tu mejor herramienta: te deja ver el error real en lugar de corregir antes de que aparezca.' },
        { t: 'Tú lo demuestras completo y le preguntas si quedó claro.', v: 1, f: '"¿Quedó claro?" siempre se responde que sí. Demostrar sin que él ejecute no genera evidencia de competencia.' },
        { t: 'Le entregas el formato del procedimiento para que lo lea y lo aplique después.', v: 0, f: 'Delegaste el aprendizaje a un papel. Esto es exactamente lo que pasó con el folio VC-0912.' }
      ]
    },
    {
      k: 'cierre', t: 'Momento 4 · Cierre y compromiso',
      q: '¿Cómo cierras para que dure?',
      why: 'Un compromiso sin fecha, sin evidencia y sin quién verifica es una buena intención.',
      opts: [
        { t: 'Él dice en voz alta qué va a cambiar, con qué evidencia y en qué fecha lo revisas juntos.', v: 3, f: 'Correcto. Compromiso verbalizado por él, con evidencia y con fecha. Eso sí se puede auditar.' },
        { t: 'Le pides que firme la constancia de la plática y registras la asistencia.', v: 0, f: 'Firmaste un papel, no un cambio. Es la misma trampa de la validación que rompió la cadena.' },
        { t: 'Le dices que vas a estar pendiente y que si lo vuelves a ver le levantas reporte.', v: 1, f: 'Cerraste con amenaza. Vas a lograr cumplimiento cuando lo veas, no criterio cuando esté solo.' }
      ]
    }
  ];

  const RUBRICA = [
    'Habló el operador más que el instructor',
    'Se conectó con la experiencia previa del operador',
    'El operador generó la evidencia con sus manos',
    'Hubo ejecución observada, no solo explicación',
    'El compromiso lo verbalizó el operador',
    'Se cerró con fecha y forma de verificación'
  ];

  const LOGRO = {
    apertura: 'entraste por su experiencia en lugar de por el juicio.',
    evidencia: 'la brecha la descubrió él con sus propias manos.',
    practica: 'hubo ejecución observada, no una explicación tuya.',
    cierre: 'el compromiso quedó verbalizado, con evidencia y con fecha.'
  };

  const DUR = 180;
  let root = null, phase = 0, sel = null, picks = {}, marks = {}, tLeft = DUR, timer = null, done = false;

  function mount(container) {
    root = document.createElement('div');
    root.className = 'mc';
    container.appendChild(root);
    paint();
    root.addEventListener('click', onClick);
    return root;
  }

  function onClick(e) {
    const c = e.target.closest('[data-case]');
    if (c) { sel = CASES.find(x => x.id === c.dataset.case); focusCam(); phase = 1; paint(); return; }
    const o = e.target.closest('[data-opt]');
    if (o) { pick(parseInt(o.dataset.step, 10), parseInt(o.dataset.opt, 10)); return; }
    if (e.target.closest('[data-go="clase"]')) { phase = 2; paint(); return; }
    if (e.target.closest('[data-go="start"]')) { startTimer(); return; }
    if (e.target.closest('[data-go="stop"]')) { stopTimer(); return; }
    const m = e.target.closest('[data-mark]');
    if (m) { const k = m.dataset.mark; marks[k] = !marks[k]; w.Audio3D && w.Audio3D.tick(); paint(); return; }
    if (e.target.closest('[data-go="cerrar"]')) { finish(); return; }
  }

  function focusCam() {
    if (w.Scene3D && w.Scene3D.ready()) {
      w.Scene3D.focus(sel.cam, 1.6); w.Scene3D.mood('normal'); w.Scene3D.setSpeed(0);
    }
  }

  function pick(si, oi) {
    if (picks[si] !== undefined) return;
    picks[si] = oi;
    const o = STEPS[si].opts[oi];
    w.Audio3D && (o.v === 3 ? w.Audio3D.good() : w.Audio3D.hit());
    if (o.v === 3) w.State.addXp(45); else if (o.v === 1) w.State.addXp(15);
    paint();
  }

  function startTimer() {
    if (timer) return;
    tLeft = DUR;
    timer = setInterval(() => {
      tLeft--;
      const el = root.querySelector('.mc-clock');
      if (el) {
        el.textContent = fmt(tLeft);
        el.classList.toggle('warn', tLeft <= 45 && tLeft > 15);
        el.classList.toggle('danger', tLeft <= 15);
      }
      if (tLeft <= 0) { stopTimer(); w.toast('Se acabó el tiempo de la micro-clase. Cierra con el compromiso.', 'mid'); }
    }, 1000);
    paint();
  }

  function stopTimer() { clearInterval(timer); timer = null; paint(); }

  function fmt(s) {
    s = Math.max(0, s);
    return String(Math.floor(s / 60)) + ':' + String(s % 60).padStart(2, '0');
  }

  function diseno() { return STEPS.reduce((a, s, i) => a + (picks[i] !== undefined ? s.opts[picks[i]].v : 0), 0); }
  function ejec() { return RUBRICA.filter((_, i) => marks['r' + i]).length; }

  function finish() {
    if (done) return;
    done = true; stopTimer();
    const d = diseno(), ex = ejec();
    const pct = Math.round(((d / 12) * 0.6 + (ex / 6) * 0.4) * 100);
    const bonus = pct >= 85 ? 160 : pct >= 65 ? 100 : pct >= 45 ? 55 : 20;
    w.State.addXp(bonus);
    w.State.flag('microclaseHecha');
    w.State.flag('microclasePct', pct);
    w.State.driver({ trust: pct >= 65 ? 12 : -8 });
    w.State.note('Micro-clase impartida a ' + sel.n + ' · desempeño ' + pct + '%', pct >= 65 ? 'good' : 'bad');
    w.Audio3D && (pct >= 65 ? w.Audio3D.good() : w.Audio3D.hit());
    w.toast('Micro-clase evaluada: ' + pct + '% · +' + bonus + ' XP', pct >= 65 ? 'good' : 'mid');
    phase = 3; paint();
  }

  /* ------------------------- render ------------------------- */
  function paint() {
    if (phase === 0) return paintCases();
    if (phase === 1) return paintDesign();
    if (phase === 2) return paintClass();
    return paintResult();
  }

  function paintCases() {
    root.innerHTML = `
      <div class="mc-intro">
        <div class="kicker c-amber">Evaluación de competencia docente</div>
        <h2 class="title mc-h">Ahora te toca dar la clase</h2>
        <p class="lede">Tres operadores reales de tu patio. Cada uno con un hábito que nadie le ha corregido bien.
        Elige a uno, diseña tu intervención en cuatro momentos y luego <strong class="c-cyan">impártela frente al grupo contra reloj</strong>.
        No se evalúa lo que sabes: se evalúa cómo lo transfieres.</p>
      </div>
      <div class="mc-cases">
        ${CASES.map(c => `
          <button class="mc-case" data-case="${c.id}">
            <div class="mc-avatar">${I('people')}</div>
            <div class="mc-nm">${c.n}</div>
            <div class="kicker">${c.e}</div>
            <div class="mc-hab">${c.habito}</div>
            <p class="mc-per">${c.perfil}</p>
            <div class="mc-pick">Trabajar con ${c.n.split(' ')[0]} ${I('right')}</div>
          </button>`).join('')}
      </div>`;
  }

  function paintDesign() {
    const all = STEPS.every((_, i) => picks[i] !== undefined);
    root.innerHTML = `
      <div class="mc-op">
        <div class="mc-avatar sm">${I('people')}</div>
        <div>
          <div class="mc-nm">${sel.n} <span class="kicker">&middot; ${sel.e}</span></div>
          <div class="mc-hab">${sel.habito}</div>
        </div>
        <div class="mc-quote">${sel.dice}<em>${sel.trampa}</em></div>
      </div>
      <div class="mc-steps">
        ${STEPS.map((s, i) => {
          const p = picks[i];
          return `
          <div class="mc-step${p !== undefined ? ' answered' : ''}">
            <div class="mc-sh"><span class="mc-num">${i + 1}</span><div><div class="kicker c-cyan">${s.t}</div><h4>${s.q}</h4></div></div>
            <p class="mc-why">${s.why}</p>
            <div class="mc-opts">
              ${s.opts.map((o, j) => {
                const on = p === j;
                const cls = p === undefined ? '' : (o.v === 3 ? ' good' : o.v === 0 ? ' bad' : ' mid');
                return `<button class="mc-opt${on ? ' chosen' : ''}${cls}" data-step="${i}" data-opt="${j}" ${p !== undefined ? 'disabled' : ''}>
                  <span class="mc-dot">${p === undefined ? '' : (o.v === 3 ? I('check') : I('x'))}</span>
                  <span>${o.t}</span></button>`;
              }).join('')}
            </div>
            ${p !== undefined ? `<div class="mc-fb ${STEPS[i].opts[p].v === 3 ? 'good' : STEPS[i].opts[p].v === 0 ? 'bad' : 'mid'}">${STEPS[i].opts[p].f}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div class="mc-foot">
        <div><div class="kicker">Diseño de la intervención</div><div class="mc-score num">${diseno()}<em>/12</em></div></div>
        <button class="btn${all ? '' : ' ghost'}" data-go="clase" ${all ? '' : 'disabled'}>${I('play')} Impartir la micro-clase</button>
      </div>`;
  }

  function paintClass() {
    root.innerHTML = `
      <div class="mc-live">
        <div class="mc-stage">
          <div class="kicker c-amber">Frente al grupo &middot; ${sel.n}</div>
          <h3 class="mc-h2">Tu guion</h3>
          <ol class="mc-guion">
            ${STEPS.map((s, i) => `<li><span class="kicker c-cyan">${s.t.split('·')[1].trim()}</span><p>${s.opts[picks[i]].t}</p></li>`).join('')}
          </ol>
          <p class="mc-tip">${I('brain')} Habla directo al operador, no al grupo. Tres minutos es el tiempo real que tienes en un patio.</p>
        </div>
        <div class="mc-panel">
          <div class="mc-clockbox">
            <div class="kicker">Tiempo de clase</div>
            <div class="mc-clock num${tLeft <= 15 ? ' danger' : tLeft <= 45 ? ' warn' : ''}">${fmt(tLeft)}</div>
            ${timer
              ? `<button class="btn ghost sm" data-go="stop">${I('x')} Detener</button>`
              : `<button class="btn sm" data-go="start">${I('play')} ${tLeft === DUR ? 'Iniciar' : 'Continuar'}</button>`}
          </div>
          <div class="kicker" style="margin-top:1.1rem">Rúbrica de observación</div>
          <p class="mc-sub">El grupo marca lo que realmente ocurrió.</p>
          <div class="mc-rub">
            ${RUBRICA.map((r, i) => `
              <button class="mc-r${marks['r' + i] ? ' on' : ''}" data-mark="r${i}">
                <span class="mc-box">${marks['r' + i] ? I('check') : ''}</span>${r}</button>`).join('')}
          </div>
          <div class="mc-rcount kicker">${ejec()} de 6 criterios observados</div>
          <button class="btn wide" data-go="cerrar">${I('doc')} Cerrar y evaluar</button>
        </div>
      </div>`;
  }

  function paintResult() {
    const d = diseno(), ex = ejec();
    const pct = Math.round(((d / 12) * 0.6 + (ex / 6) * 0.4) * 100);
    const nivel = pct >= 85 ? ['INSTRUCTOR QUE TRANSFIERE', 'green'] :
                  pct >= 65 ? ['INSTRUCTOR EN CONSOLIDACIÓN', 'cyan'] :
                  pct >= 45 ? ['INSTRUCTOR QUE INFORMA', 'amber'] :
                              ['REQUIERE ACOMPAÑAMIENTO', 'red'];
    const faltan = RUBRICA.filter((_, i) => !marks['r' + i]);
    const malos = STEPS.map((s, i) => ({ s, o: s.opts[picks[i]] })).filter(x => x.o.v < 3);
    root.innerHTML = `
      <div class="mc-res">
        <div class="kicker">Evaluación de competencia docente &middot; ${sel.n}</div>
        <div class="mc-big num c-${nivel[1]}">${pct}<em>%</em></div>
        <div class="mc-nivel c-${nivel[1]}">${nivel[0]}</div>
        <div class="mc-bars">
          <div><div class="kicker">Diseño andragógico (60%)</div><div class="mc-bar"><div style="width:${(d / 12) * 100}%"></div></div><span class="num">${d}/12</span></div>
          <div><div class="kicker">Ejecución observada (40%)</div><div class="mc-bar"><div style="width:${(ex / 6) * 100}%"></div></div><span class="num">${ex}/6</span></div>
        </div>
        <div class="mc-res-grid">
          <div class="panel pad accent-green">
            <div class="kicker c-green">Lo que sostuviste</div>
            <ul class="mc-ul">
              ${STEPS.filter((s, i) => s.opts[picks[i]].v === 3).map(s => `<li><strong>${s.t.split('·')[1].trim()}:</strong> ${LOGRO[s.k]}</li>`).join('') || '<li>Ninguno de los cuatro momentos alcanzó la ruta que transfiere.</li>'}
              ${RUBRICA.filter((_, i) => marks['r' + i]).map(r => `<li>${r}.</li>`).join('')}
            </ul>
          </div>
          <div class="panel pad accent-amber">
            <div class="kicker c-amber">Tu plan de mejora</div>
            <ul class="mc-ul">
              ${malos.map(x => `<li><strong>${x.s.t.split('·')[1].trim()}:</strong> ${x.o.f}</li>`).join('')}
              ${faltan.map(f => `<li>No se observó: ${f.toLowerCase()}.</li>`).join('')}
              ${(!malos.length && !faltan.length) ? '<li>Clase impecable. Ahora repítela con el operador más difícil del patio.</li>' : ''}
            </ul>
          </div>
        </div>
        <p class="mc-cierre">${I('brain')} Esta evaluación entra en tu dictamen final. La diferencia entre informar y transferir es exactamente la diferencia entre el folio VC-0912 y un operador que llega a su casa.</p>
      </div>`;
  }

  /* Detalle completo para evidencia: qué eligió en cada momento y qué marcó
     de la rúbrica de ejecución, para el PDF y para la fila en Sheets. */
  function getDetalle() {
    if (!done) return null;
    return {
      operador: sel ? sel.n : null,
      clave: sel ? sel.clave : null,
      pct: Math.round(((diseno() / 12) * 0.6 + (ejec() / 6) * 0.4) * 100),
      pasos: STEPS.map((s, i) => ({
        momento: s.t,
        eleccion: picks[i] !== undefined ? s.opts[picks[i]].t : null,
        valor: picks[i] !== undefined ? s.opts[picks[i]].v : null,
        feedback: picks[i] !== undefined ? s.opts[picks[i]].f : null
      })),
      rubrica: RUBRICA.map((r, i) => ({ item: r, cumplido: !!marks['r' + i] }))
    };
  }

  w.Microclase = { mount, pct: () => (done ? Math.round(((diseno() / 12) * 0.6 + (ejec() / 6) * 0.4) * 100) : null), done: () => done, getDetalle };
})(window);