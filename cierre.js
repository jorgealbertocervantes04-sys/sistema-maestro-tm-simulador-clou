/* =======================================================================
   cierre.js · Ciclo de aprendizaje, mentoría correctiva por telemetría,
   diseño del curso PIEL y cierre financiero auditado.
   ======================================================================= */
(function (w) {
  'use strict';

  const money = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('es-MX');

  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }

  /* ==================================================================
     1) CICLO DE APRENDIZAJE REAL · ordenar las cuatro etapas
     ================================================================== */

  const CICLO = [
    {
      k: 'con', n: 1, t: 'Conexión', c: 'var(--cyan)',
      d: 'Abrir con un reto real de su propia operación para despertar interés.',
      x: 'Va primero porque el adulto no presta atención hasta que el tema es suyo. Si abres con teoría, ya lo perdiste.'
    },
    {
      k: 'sim', n: 2, t: 'Simulación', c: 'var(--amber)',
      d: 'Analizar su telemetría y su unidad para que él descubra el área de mejora.',
      x: 'Va después de conectar y antes de comprometer: la brecha tiene que aparecer en sus datos, no en tu discurso.'
    },
    {
      k: 'tra', n: 3, t: 'Transferencia', c: 'var(--orange)',
      d: 'Comprometer la aplicación concreta en su próximo viaje.',
      x: 'Sin este paso el ejercicio se queda en el aula. Aquí es donde el aprendizaje cruza a la carretera.'
    },
    {
      k: 'fee', n: 4, t: 'Retroalimentación', c: 'var(--green)',
      d: 'Estructurar los errores como oportunidades de desarrollo, con datos y fecha.',
      x: 'Cierra el ciclo y lo reinicia. Sin retroalimentación no hay segunda vuelta, solo un curso que se dio una vez.'
    }
  ];

  function mountCiclo(container) {
    const S = w.State;
    let placed = 0;
    let errs = 0;
    const order = shuffle(CICLO);

    const root = document.createElement('div');
    root.className = 'panel accent-cyan pad w-lg mx brackets';
    container.appendChild(root);

    function render() {
      root.innerHTML = `
        <div class="kicker c-cyan">Instrucción de alto impacto</div>
        <div class="title">Ordena el ciclo de aprendizaje real</div>
        <p class="lead" style="margin:.5rem 0 .9rem">
          Las cuatro etapas son correctas por separado. En el orden equivocado, el curso se vuelve una plática.
          Toca las tarjetas en la secuencia que sí transfiere. <strong>${placed} de 4 colocadas.</strong>
        </p>
        <div class="ciclo">
          ${order.map(c => {
            const done = c.n <= placed;
            return `<button class="ciclo-c ${done ? 'done' : ''}" data-k="${c.k}" style="--cc:${c.c}">
              <div class="ciclo-n">${done ? c.n : '?'}</div>
              <div class="ciclo-t">${c.t}</div>
              <div class="ciclo-d">${c.d}</div>
              ${done ? `<div class="ciclo-x">${c.x}</div>` : ''}
            </button>`;
          }).join('')}
        </div>
        ${placed === 4 ? `
          <div class="note" style="margin-top:.9rem;border-left:2px solid var(--green);padding-left:.85rem">
            <strong style="color:var(--green)">Ciclo completo.</strong>
            Conectar, simular, transferir y retroalimentar. Es un círculo, no una lista:
            la retroalimentación de hoy es la conexión de la próxima sesión.
            ${errs ? 'Errores de secuencia: ' + errs + '.' : 'Sin errores de secuencia.'}
          </div>` : ''}
      `;
    }

    root.addEventListener('click', e => {
      const b = e.target.closest('.ciclo-c'); if (!b) return;
      const c = CICLO.find(x => x.k === b.dataset.k);
      if (c.n <= placed) return;
      if (c.n === placed + 1) {
        placed++;
        w.Audio3D && w.Audio3D.good();
        render();
        if (placed === 4 && !S.has('cicloHecho')) {
          S.flag('cicloHecho'); S.flag('cicloErrores', errs);
          S.addXp(errs === 0 ? 60 : 35);
          w.toast && w.toast('Ciclo de aprendizaje ordenado · +' + (errs === 0 ? 60 : 35) + ' XP', 'good');
        }
      } else {
        errs++;
        w.Audio3D && w.Audio3D.hit();
        b.classList.add('bad');
        setTimeout(() => b.classList.remove('bad'), 340);
        w.toast && w.toast('Todavía no. Pregúntate qué necesita ocurrir antes para que esa etapa funcione.', 'bad');
      }
    });

    render();
  }

  /* ==================================================================
     2) MENTORÍA CORRECTIVA · diagnóstico por telemetría
     ================================================================== */

  function telemetria(S) {
    const s = S.get();
    const f = s.driver.fatigue, st = s.driver.stress;
    return [
      { m: 'Frenadas bruscas / 100 km', v: (s.truck.brakes === 'fault' ? 11 : 4), lim: 3, bad: true },
      { m: 'Exceso de velocidad sostenido', v: (st > 55 ? '9 eventos' : '2 eventos'), lim: '0', bad: st > 55 },
      { m: 'Horas continuas al volante', v: (f > 55 ? '9.4 h' : '4.8 h'), lim: '5.0 h', bad: f > 55 },
      { m: 'Uso de motor en descenso', v: (s.truck.brakes === 'fault' ? '18%' : '74%'), lim: '≥70%', bad: s.truck.brakes === 'fault' },
      { m: 'Ralentí en paradas', v: '22%', lim: '≤10%', bad: true }
    ];
  }

  const MC_STEPS = [
    {
      n: '01', h: 'Diagnóstico crítico',
      q: 'Con la telemetría enfrente, ¿por dónde abres la conversación?',
      opts: [
        { t: 'Por el dato que tiene consecuencia física inmediata, aunque no sea el peor porcentaje.', ok: true, v: 'Prioriza riesgo, no magnitud' },
        { t: 'Por todos los indicadores en rojo, de arriba abajo.', ok: false },
        { t: 'Por el ralentí, que es el más fácil de corregir.', ok: false }
      ],
      fb: {
        ok: 'Correcto. La telemetría entrega decenas de números; el instructor elige el que mata. Un desvío por hora se corrige después.',
        bad: 'No. Corregir cinco cosas a la vez es corregir cero. Y empezar por lo fácil enseña que lo grave es negociable.'
      }
    },
    {
      n: '02', h: 'Conversación raíz',
      q: 'Le muestras el dato. Responde: "así se maneja este tramo, todos lo hacemos".',
      opts: [
        { t: '"Puede ser. Cuéntame qué pasa en ese tramo que te obliga a manejarlo así."', ok: true, v: 'Explora la causa antes de corregir' },
        { t: '"No me importa lo que hagan los demás, la norma es la norma."', ok: false },
        { t: '"Si todos lo hacen, entonces hay que revisarlo con todo el grupo después."', ok: false }
      ],
      fb: {
        ok: 'Exacto. Detrás de casi todo mal hábito hay una razón operativa real. Si no la sacas, corriges el síntoma y regresa el lunes.',
        bad: 'No. Ganar la discusión no cambia la conducta: la esconde. Y diluirlo en el grupo le quita responsabilidad personal.'
      }
    },
    {
      n: '03', h: 'Modelado en cabina',
      q: 'Ya reconoció el riesgo. ¿Cómo le enseñas la técnica correcta?',
      opts: [
        { t: 'Demuestras una vez el descenso con motor, luego él lo repite y tú solo narras lo que observas.', ok: true, v: 'Demostrar, ejecutar, observar' },
        { t: 'Manejas tú todo el tramo mientras le explicas cada paso.', ok: false },
        { t: 'Le mandas el manual del fabricante y el video del curso.', ok: false }
      ],
      fb: {
        ok: 'Correcto. Una demostración, una ejecución suya y observación narrada. El volante regresa a sus manos lo antes posible.',
        bad: 'No. Verte manejar bien no le enseña a manejar bien, y un PDF nunca corrigió un hábito instalado en once años.'
      }
    },
    {
      n: '04', h: 'Seguimiento',
      q: 'Cierran con un acuerdo. ¿Cómo aseguras que el hábito se sostenga?',
      opts: [
        { t: 'Revisas la telemetría de sus siguientes tres viajes y le reportas el avance, mejore o no.', ok: true, v: 'Tres viajes verificados con reporte' },
        { t: 'Lo revisas en la evaluación semestral.', ok: false },
        { t: 'Confías en su palabra: ya lo reconoció.', ok: false }
      ],
      fb: {
        ok: 'Correcto. El hábito nuevo se cae entre la semana dos y la cuatro. Ahí es donde el acompañante existe o no existe.',
        bad: 'No. Sin verificación cercana, la conversación fue catarsis. A los seis meses ya no hay nada que corregir: hay un expediente.'
      }
    }
  ];

  function mountTelemetria(container) {
    const S = w.State;
    let i = 0;
    const picks = [];
    let hits = 0, tries = 0;
    const tel = telemetria(S);

    const root = document.createElement('div');
    root.className = 'panel accent-amber pad w-lg mx brackets';
    container.appendChild(root);

    function render(fb, ok) {
      const done = i >= MC_STEPS.length;
      const st = MC_STEPS[Math.min(i, MC_STEPS.length - 1)];
      root.innerHTML = `
        <div class="kicker c-amber">Mentoría correctiva · corrección de malas prácticas</div>
        <div class="title">${done ? 'Intervención documentada' : 'Telemetría del viaje que acabas de supervisar'}</div>
        <div class="tel-wrap">
          <table class="tz tel">
            <thead><tr><th>Indicador</th><th>Registrado</th><th>Estándar</th></tr></thead>
            <tbody>
              ${tel.map(t => `<tr><td class="tz-a">${t.m}</td><td class="${t.bad ? 'tz-c' : ''}" style="${t.bad ? '' : 'color:var(--green)'}">${t.v}</td><td>${t.lim}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="ie">
            <div class="ie-rail">
              ${MC_STEPS.map((s, k) => `
                <div class="ie-step ${k < i ? 'done' : ''} ${k === i ? 'on' : ''}">
                  <div class="ie-sn">${s.n}</div>
                  <div class="ie-sh">${s.h}</div>
                  ${picks[k] ? `<div class="ie-sv">${picks[k]}</div>` : ''}
                </div>`).join('')}
            </div>
            ${done ? `
              <div class="note" style="border-left:2px solid var(--green);padding-left:.85rem">
                <strong style="color:var(--green)">Mentoría completa · ${hits} de 4 a la primera.</strong>
                Diagnóstico con datos, conversación que busca la causa, modelado con sus manos y verificación en los siguientes tres viajes.
                Ese es el ciclo que convierte una mala práctica de once años en un hábito nuevo.
              </div>` : `
              <div>
                <p style="font-size:.9rem;color:var(--ink);margin:0 0 .55rem">${st.q}</p>
                <div class="ie-opts">${st.opts.map((o, k) => `<button class="ie-o" data-o="${k}">${o.t}</button>`).join('')}</div>
              </div>
              ${fb ? `<div class="ie-fb" style="border-color:${ok ? 'var(--green)' : 'var(--red)'}">${fb}</div>` : ''}`}
          </div>
        </div>
      `;
    }

    root.addEventListener('click', e => {
      const b = e.target.closest('.ie-o'); if (!b) return;
      const st = MC_STEPS[i];
      const o = st.opts[+b.dataset.o];
      if (o.ok) {
        if (tries === 0) hits++;
        tries = 0; picks[i] = o.v; i++;
        w.Audio3D && w.Audio3D.good();
        render(st.fb.ok, true);
        if (i >= MC_STEPS.length && !S.has('mentoriaHecha')) {
          S.flag('mentoriaHecha'); S.flag('mentoriaHits', hits);
          S.addXp(50 + hits * 12);
          S.driver({ trust: 8 });
          w.toast && w.toast('Mentoría correctiva documentada · +' + (50 + hits * 12) + ' XP', 'good');
        }
      } else {
        tries++;
        w.Audio3D && w.Audio3D.hit();
        render(st.fb.bad, false);
      }
    });

    render();
  }

  /* ==================================================================
     3) DISEÑA TU CURSO DE INDUCCIÓN PIEL · reto final
     ================================================================== */

  const CURSO = [
    {
      k: 'P', let: 'P', name: 'Pensar', c: 'var(--cyan)',
      q: '¿Con qué abres el bloque de anticipación de riesgos?',
      opts: [
        { t: 'Cálculo en pizarrón de distancia de frenado con el peso real de su unidad cargada.', v: 3, f: 'Su unidad, su peso, su número. La anticipación deja de ser abstracta.' },
        { t: 'Presentación de estadísticas nacionales de siniestralidad en autotransporte.', v: 1, f: 'Informa, no transfiere. Las estadísticas nacionales le pasan a otros.' },
        { t: 'Lectura comentada del reglamento de tránsito federal.', v: 0, f: 'Cero anticipación. Estás enseñando texto, no criterio.' }
      ]
    },
    {
      k: 'I', let: 'I', name: 'Interactuar', c: 'var(--amber)',
      q: '¿Cómo entrenas la observación aplicada?',
      opts: [
        { t: 'Video de tramo real en pausa: predecir qué va a hacer cada vehículo antes de reanudar.', v: 3, f: 'Obliga a interpretar, no a describir. Es la habilidad exacta que se usa en carretera.' },
        { t: 'Dinámica grupal de comunicación asertiva con tarjetas.', v: 1, f: 'Trabaja el trato, no la lectura del entorno. Útil, pero no es esta competencia.' },
        { t: 'Explicar los tipos de puntos ciegos con un diagrama.', v: 0, f: 'Conocimiento declarativo. Sabrá nombrarlos y seguirá sin verlos.' }
      ]
    },
    {
      k: 'E', let: 'E', name: 'Ejecutar', c: 'var(--orange)',
      q: '¿Cómo aseguras el dominio del proceso?',
      opts: [
        { t: 'Práctica en patio: acoplar, tirón de prueba y checklist firmado, repetido hasta hacerlo sin recordatorio.', v: 3, f: 'Repetición con criterio de dominio. Se acredita por ejecución, no por asistencia.' },
        { t: 'Demostración del instructor con los participantes observando y tomando nota.', v: 1, f: 'Ver ejecutar no es ejecutar. Sales con apuntes, no con habilidad.' },
        { t: 'Examen de opción múltiple sobre el procedimiento de acoplamiento.', v: 0, f: 'Mide memoria. El folio VC-0912 lo firmó alguien que habría sacado 100.' }
      ]
    },
    {
      k: 'L', let: 'L', name: 'Liderar', c: 'var(--green)',
      q: '¿Cómo evalúas la decisión profesional bajo presión?',
      opts: [
        { t: 'Simulacro con despacho presionando en vivo: debe rechazar la salida y sostenerlo tres minutos.', v: 3, f: 'La única forma de evaluar liderazgo es ponerlo a costar algo. Aquí cuesta incomodidad real.' },
        { t: 'Cuestionario de escenarios éticos por escrito.', v: 1, f: 'Todos contestan bien por escrito. La presión no cabe en una hoja.' },
        { t: 'Charla motivacional de cierre sobre valores y compromiso.', v: 0, f: 'Emoción sin conducta observable. El lunes no queda nada.' }
      ]
    }
  ];

  function mountCurso(container) {
    const S = w.State;
    let i = 0;
    const picks = [];
    let pts = 0;

    const root = document.createElement('div');
    root.className = 'panel accent-green pad w-lg mx brackets';
    container.appendChild(root);

    function tier(p) {
      if (p >= 11) return { l: 'CURSO QUE TRANSFIERE', c: 'var(--green)' };
      if (p >= 8) return { l: 'CURSO EN CONSOLIDACIÓN', c: 'var(--cyan)' };
      if (p >= 5) return { l: 'CURSO QUE INFORMA', c: 'var(--amber)' };
      return { l: 'CURSO QUE NO CAMBIA CONDUCTA', c: 'var(--red)' };
    }

    function render(fb, tone) {
      const done = i >= CURSO.length;
      const st = CURSO[Math.min(i, CURSO.length - 1)];
      const t = tier(pts);
      root.innerHTML = `
        <div class="kicker c-green">Reto final · demuestra lo aprendido</div>
        <div class="title">${done ? 'Tu curso de inducción' : 'Diseña tu curso bajo metodología PIEL'}</div>
        <p class="lead" style="margin:.5rem 0 .9rem">
          ${done
            ? 'Esta es la ficha que entregarías a dirección. Cuatro bloques, uno por competencia.'
            : 'Vas a formar operadores nuevos. Elige la actividad de cada bloque: no la más vistosa, la que deja conducta instalada.'}
        </p>
        <div class="cur-rail">
          ${CURSO.map((c, k) => `
            <div class="cur-b ${k < i ? 'done' : ''} ${k === i ? 'on' : ''}" style="--cc:${c.c}">
              <div class="cur-l">${c.let}</div>
              <div class="cur-n">${c.name}</div>
              ${picks[k] ? `<div class="cur-v">${picks[k].t}</div><div class="cur-p" style="color:${picks[k].v === 3 ? 'var(--green)' : picks[k].v === 1 ? 'var(--amber)' : 'var(--red)'}">${picks[k].v}/3</div>` : ''}
            </div>`).join('')}
        </div>
        ${done ? `
          <div class="cur-res">
            <div class="cur-score" style="color:${t.c}">${pts}<span style="font-size:.42em;color:var(--muted)">/12</span></div>
            <div>
              <div class="cur-tier" style="color:${t.c}">${t.l}</div>
              <p style="font-size:.87rem;line-height:1.55;color:var(--ink-2);margin:.35rem 0 0">
                ${pts >= 11
                  ? 'Cada bloque produce evidencia observable. Este curso se puede auditar y se puede repetir sin ti.'
                  : pts >= 8
                    ? 'Dos o tres bloques transfieren; el resto informa. Revisa los que puntuaron bajo: ahí es donde el operador sale con apuntes en lugar de habilidad.'
                    : 'La mayoría de tus bloques evalúa memoria o emoción. Un curso así aprueba a todos y no cambia a nadie.'}
              </p>
            </div>
          </div>` : `
          <div>
            <p style="font-size:.9rem;color:var(--ink);margin:0 0 .55rem"><strong style="color:${st.c}">${st.let} · ${st.name}</strong> — ${st.q}</p>
            <div class="ie-opts">${st.opts.map((o, k) => `<button class="ie-o" data-o="${k}">${o.t}</button>`).join('')}</div>
          </div>
          ${fb ? `<div class="ie-fb" style="border-color:${tone}">${fb}</div>` : ''}`}
      `;
    }

    root.addEventListener('click', e => {
      const b = e.target.closest('.ie-o'); if (!b) return;
      const st = CURSO[i];
      const o = st.opts[+b.dataset.o];
      picks[i] = o; pts += o.v; i++;
      const tone = o.v === 3 ? 'var(--green)' : o.v === 1 ? 'var(--amber)' : 'var(--red)';
      o.v === 3 ? (w.Audio3D && w.Audio3D.good()) : (w.Audio3D && w.Audio3D.hit());
      render(o.f, tone);
      if (i >= CURSO.length && !S.has('cursoHecho')) {
        S.flag('cursoHecho'); S.flag('cursoPts', pts);
        S.addXp(pts * 15);
        w.toast && w.toast('Curso PIEL diseñado: ' + pts + '/12 · +' + (pts * 15) + ' XP', pts >= 8 ? 'good' : 'mid');
      }
    });

    render();
  }

  /* ==================================================================
     4) CIERRE FINANCIERO AUDITADO
     ================================================================== */

  function mountAuditado(container) {
    const S = w.State;
    let open = false;

    const root = document.createElement('div');
    root.className = 'panel accent-red pad w-lg mx brackets';
    container.appendChild(root);

    function render() {
      const s = S.get();
      const log = s.log.filter(l => l.delta !== 0);
      const perdido = s.spent > 0 ? s.spent : 0;
      const pct = Math.max(0, Math.round((s.budget / S.START_BUDGET) * 100));
      root.innerHTML = `
        <div class="kicker c-red">Cierre auditado · impacto financiero de la instrucción</div>
        <div class="title">El viaje terminó. Ahora se paga.</div>
        <p class="lead" style="margin:.5rem 0 1rem">
          Cada renglón de abajo es una decisión formativa que tomaste o dejaste de tomar.
          Ninguno es una multa aleatoria: todos son consecuencia de un criterio.
        </p>
        <div class="aud-top">
          <div class="stat"><h4>Presupuesto inicial</h4><div class="v num">${money(S.START_BUDGET)}</div></div>
          <div class="stat"><h4>Movimientos registrados</h4><div class="v num">${log.length}</div></div>
          <div class="stat"><h4>Desempeño formativo</h4><div class="v num c-cyan">${s.xp}<span style="font-size:.5em;color:var(--muted)">/700</span></div></div>
        </div>
        ${!open ? `
          <button class="btn wide" data-run style="margin-top:1rem">Ejecutar cierre financiero</button>
          <p class="lead" style="margin-top:.7rem;font-size:.85rem;opacity:.65">Se auditarán ${log.length} movimientos contra el presupuesto autorizado.</p>
        ` : `
          <div class="aud-ledger">
            ${log.length ? log.map((l, k) => `
              <div class="aud-row" style="animation-delay:${k * 60}ms">
                <span class="aud-l">${l.label}</span>
                <span class="aud-v ${l.delta < 0 ? 'neg' : 'pos'}">${money(l.delta)}</span>
              </div>`).join('') : '<div class="aud-row"><span class="aud-l">Sin movimientos registrados.</span><span class="aud-v pos">$0</span></div>'}
          </div>
          <div class="aud-total">
            <div>
              <div class="rv-s">Balance real de operación</div>
              <div class="aud-big" style="color:${s.budget >= S.START_BUDGET * 0.88 ? 'var(--green)' : s.budget >= S.START_BUDGET * 0.6 ? 'var(--amber)' : 'var(--red)'}">${money(s.budget)}</div>
              <div class="rv-s" style="margin-top:.2rem">${pct}% del presupuesto conservado</div>
            </div>
            <div>
              <div class="rv-s">Costo de la formación incompleta</div>
              <div class="aud-big" style="color:var(--red)">${money(-perdido)}</div>
              <div class="rv-s" style="margin-top:.2rem">Exposición evitada al 100% de cumplimiento: $410,000</div>
            </div>
          </div>
          <p class="lead" style="margin-top:.9rem;font-size:.9rem;opacity:.85">
            Este número no mide tu habilidad de manejo. Mide <strong class="c-red">lo que cuesta una validación flexible</strong>
            cuando alguien confió en tu firma.
          </p>
        `}
      `;
    }

    root.addEventListener('click', e => {
      if (!e.target.closest('[data-run]')) return;
      open = true;
      w.Audio3D && w.Audio3D.hit();
      w.Scene3D && w.Scene3D.pulseLights && w.Scene3D.pulseLights(0xFF003C);
      render();
    });

    render();
  }

  w.Cierre = { mountCiclo, mountTelemetria, mountCurso, mountAuditado };
})(window);
