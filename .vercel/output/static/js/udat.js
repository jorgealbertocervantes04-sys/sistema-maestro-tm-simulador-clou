/* =======================================================================
   udat.js · Taxonomía PIEL aplicada + Ingeniería del Estrés
   Dos actividades interactivas del marco metodológico UDAT.
   ======================================================================= */
(function (w) {
  'use strict';

  /* ==================================================================
     1) PIEL APLICADO · Escenario "Visibilidad Nula"
     El instructor clasifica cuatro acciones en las cuatro dimensiones.
     ================================================================== */

  const SLOTS = [
    { k: 'P', let: 'P', name: 'Pensar', sub: 'Anticipar riesgos', c: 'var(--cyan)' },
    { k: 'I', let: 'I', name: 'Interactuar', sub: 'Observar para actuar', c: 'var(--amber)' },
    { k: 'E', let: 'E', name: 'Ejecutar', sub: 'Dominar procesos', c: 'var(--orange)' },
    { k: 'L', let: 'L', name: 'Liderar', sub: 'Decidir con profesionalismo', c: 'var(--green)' }
  ];

  const ACTS = [
    {
      id: 'a1', k: 'P',
      t: 'Antes de entrar al banco de niebla, calcula que a 90 km/h recorre 25 metros por segundo y su visibilidad real es de 40 metros.',
      why: 'Anticipación: convierte una condición ambiental en una cuenta de distancia y tiempo antes de que sea urgente.'
    },
    {
      id: 'a2', k: 'I',
      t: 'Lee que el auto de adelante encendió intermitentes sin frenar y entiende que hay algo detenido más allá de su campo visual.',
      why: 'Observación aplicada: no solo ve el entorno, lo interpreta para actuar antes de tener la evidencia directa.'
    },
    {
      id: 'a3', k: 'E',
      t: 'Reduce con motor y caja, sin pisar el freno de servicio, y activa luces bajas e intermitentes de emergencia.',
      why: 'Dominio del proceso: la maniobra técnica correcta, ejecutada sin transferir carga bruscamente al remolque.'
    },
    {
      id: 'a4', k: 'L',
      t: 'Reporta a despacho que se detiene en el acotamiento y sostiene la decisión aunque le adviertan que perderá la cita de descarga.',
      why: 'Liderazgo: la decisión profesional se sostiene frente a la presión comercial, y queda documentada.'
    }
  ];

  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }

  function mountPiel(container) {
    const S = w.State;
    let sel = null;
    let solved = {};
    let errors = 0;
    const order = shuffle(ACTS);

    const root = document.createElement('div');
    root.className = 'panel accent-cyan pad w-lg mx brackets piel-wrap';
    container.appendChild(root);

    function render() {
      const n = Object.keys(solved).length;
      root.innerHTML = `
        <div class="kicker">Aplicación PIEL · escenario visibilidad nula</div>
        <div class="title">Clasifica las cuatro acciones</div>
        <p class="lead" style="margin:.5rem 0 .9rem">
          Carretera federal, 05:40 h, banco de niebla cerrado. El operador ejecuta cuatro acciones correctas.
          Tu trabajo como instructor es <strong>nombrar qué competencia está usando en cada una</strong>: si no puedes nombrarla, no puedes enseñarla ni evaluarla.
        </p>
        <div class="piel">
          <div>
            <div class="rv-s" style="margin-bottom:.5rem">Acciones del operador · ${n} de 4 clasificadas</div>
            <div class="piel-acts">
              ${order.map(a => `
                <button class="piel-a ${solved[a.k] === a.id ? 'done' : ''} ${sel === a.id ? 'sel' : ''}" data-a="${a.id}">${a.t}</button>
              `).join('')}
            </div>
          </div>
          <div>
            <div class="rv-s" style="margin-bottom:.5rem">Dimensiones PIEL · elige la acción y luego su dimensión</div>
            <div class="piel-slots">
              ${SLOTS.map(s => {
                const a = ACTS.find(x => x.k === s.k);
                const ok = !!solved[s.k];
                return `<button class="piel-s ${ok ? 'ok' : ''}" data-s="${s.k}" style="--pc:${s.c}">
                  <div class="piel-sl">${s.let}</div>
                  <div class="piel-st">${s.name} · ${s.sub}</div>
                  ${ok ? `<div class="piel-sf">${a.why}</div>` : '<div class="piel-sf" style="color:var(--muted)">Sin asignar</div>'}
                </button>`;
              }).join('')}
            </div>
          </div>
        </div>
        ${n === 4 ? `
          <div class="note" style="margin-top:.9rem;border-left:2px solid var(--green);padding-left:.85rem">
            <strong style="color:var(--green)">Taxonomía completa.</strong>
            Las cuatro dimensiones ocurrieron en menos de veinte segundos y ninguna funciona sola:
            sin <strong>Pensar</strong> no hay margen, sin <strong>Interactuar</strong> no hay lectura, sin <strong>Ejecutar</strong> la decisión no se materializa
            y sin <strong>Liderar</strong> la presión de despacho borra todo lo anterior.
            ${errors === 0 ? 'Lo resolviste sin errores.' : 'Errores de clasificación: ' + errors + '.'}
          </div>` : ''}
      `;
    }

    root.addEventListener('click', e => {
      const b = e.target.closest('.piel-a');
      if (b) { sel = b.dataset.a; render(); return; }
      const s = e.target.closest('.piel-s');
      if (!s || solved[s.dataset.s]) return;
      if (!sel) { w.toast && w.toast('Primero elige una acción del operador.', 'mid'); return; }
      const act = ACTS.find(x => x.id === sel);
      if (act.k === s.dataset.s) {
        solved[act.k] = act.id; sel = null;
        w.Audio3D && w.Audio3D.good();
        render();
        if (Object.keys(solved).length === 4 && !S.has('pielHecho')) {
          S.flag('pielHecho'); S.flag('pielErrores', errors);
          S.addXp(errors === 0 ? 70 : 40);
          w.toast && w.toast('Taxonomía PIEL dominada · +' + (errors === 0 ? 70 : 40) + ' XP', 'good');
        }
      } else {
        errors++;
        w.Audio3D && w.Audio3D.hit();
        s.classList.add('bad');
        setTimeout(() => s.classList.remove('bad'), 340);
        w.toast && w.toast('Esa acción pertenece a otra dimensión. Pregúntate qué hace el operador: ¿calcula, lee, opera o decide?', 'bad');
      }
    });

    render();
  }

  /* ==================================================================
     2) INGENIERÍA DEL ESTRÉS · diseño de un simulacro formativo
     ================================================================== */

  const IE_STEPS = [
    {
      k: 'obj', n: '01', h: 'Objetivo',
      q: '¿Qué conducta observable quieres provocar en el simulacro de <strong>horas de conducción</strong>?',
      opts: [
        { t: 'Que el operador reconozca su límite de horas y rechace el viaje aunque le insistan.', ok: true, v: 'Reconocer el límite y rechazar el viaje' },
        { t: 'Que el operador recite de memoria el artículo de la NOM sobre tiempos de conducción.', ok: false },
        { t: 'Que el operador maneje más rápido para llegar antes de agotar sus horas.', ok: false }
      ],
      fb: {
        ok: 'Correcto. El objetivo de un simulacro nunca es que repita la norma: es que la conducta aparezca bajo presión, que es donde realmente se pierde.',
        bad: 'No. Recitar la norma se evalúa con un examen. La ingeniería del estrés existe para provocar la conducta, no el discurso.'
      }
    },
    {
      k: 'dis', n: '02', h: 'Distractor',
      q: '¿Qué elemento introduces para saturar su atención mientras decide?',
      opts: [
        { t: 'Radio de despacho insistiendo con la cita de descarga y el cliente en línea.', ok: true, v: 'Presión de despacho en tiempo real' },
        { t: 'Silencio absoluto en la cabina para que se concentre.', ok: false },
        { t: 'Un compañero explicándole la respuesta correcta.', ok: false }
      ],
      fb: {
        ok: 'Exacto. El distractor debe ser el mismo que enfrentará en operación real: la voz que le pide que siga.',
        bad: 'No. Sin carga cognitiva el simulacro mide conocimiento, no criterio. La realidad nunca llega en silencio.'
      }
    },
    {
      k: 'fal', n: '03', h: 'Falla inducida',
      q: '¿Qué falla controlada agregas para que el escenario se degrade?',
      opts: [
        { t: 'La bitácora ya marca 14 horas acumuladas y la ruta alterna suma 90 minutos más.', ok: true, v: 'Bitácora en 14 h + desvío de 90 min' },
        { t: 'Se poncha una llanta y el ejercicio se detiene.', ok: false },
        { t: 'Ninguna: si algo falla el operador se confunde.', ok: false }
      ],
      fb: {
        ok: 'Sí. La falla debe empujar hacia la decisión, no cancelarla. Los números lo obligan a elegir entre norma y compromiso.',
        bad: 'No. Una falla que termina el ejercicio elimina la decisión que querías observar. La falla degrada, no interrumpe.'
      }
    },
    {
      k: 'val', n: '04', h: 'Válvula de escape',
      q: '¿Cómo cierras el ejercicio para que el estrés se convierta en aprendizaje y no en trauma?',
      opts: [
        { t: 'Corte inmediato, debriefing con los datos observados y acuerdo escrito de qué hará distinto.', ok: true, v: 'Corte, debriefing con datos y acuerdo' },
        { t: 'Dejarlo terminar el turno estresado para que la lección "se le grabe".', ok: false },
        { t: 'Comentarlo la próxima semana en la junta general de seguridad.', ok: false }
      ],
      fb: {
        ok: 'Correcto. Sin válvula, un simulacro es una novatada. El debriefing inmediato es lo que convierte la tensión en criterio.',
        bad: 'No. El estrés sin cierre produce resentimiento y ocultamiento, no aprendizaje. Y a la semana ya no hay memoria emocional que trabajar.'
      }
    }
  ];

  function mountEstres(container) {
    const S = w.State;
    let i = 0;
    const picks = [];
    let hits = 0;

    const root = document.createElement('div');
    root.className = 'panel accent-orange pad w-lg mx brackets';
    container.appendChild(root);

    function render(fbTxt, fbOk) {
      const done = i >= IE_STEPS.length;
      const st = IE_STEPS[Math.min(i, IE_STEPS.length - 1)];
      root.innerHTML = `
        <div class="kicker">Ingeniería del estrés · diseño de simulacro</div>
        <div class="title">${done ? 'Tu simulacro está armado' : 'Horas de conducción'}</div>
        <p class="lead" style="margin:.5rem 0 .9rem">
          ${done
            ? 'Un simulacro no se improvisa: se diseña con cuatro piezas. Esto es lo que construiste.'
            : 'El aprendizaje profundo no ocurre en el aula tranquila, ocurre bajo presión controlada. Arma el ejercicio pieza por pieza.'}
        </p>
        <div class="ie">
          <div class="ie-rail">
            ${IE_STEPS.map((s, k) => `
              <div class="ie-step ${k < i ? 'done' : ''} ${k === i ? 'on' : ''}">
                <div class="ie-sn">${s.n}</div>
                <div class="ie-sh">${s.h}</div>
                ${picks[k] ? `<div class="ie-sv">${picks[k]}</div>` : ''}
              </div>`).join('')}
          </div>
          ${done ? `
            <div class="note" style="border-left:2px solid var(--green);padding-left:.85rem">
              <strong style="color:var(--green)">Diseño completo · ${hits} de 4 a la primera.</strong>
              La diferencia entre un simulacro y una novatada son estas cuatro piezas en orden.
              Quítale la válvula y produces miedo; quítale el distractor y produces teatro.
            </div>` : `
            <div>
              <p style="font-size:.9rem;color:var(--ink);margin:0 0 .55rem">${st.q}</p>
              <div class="ie-opts">
                ${st.opts.map((o, k) => `<button class="ie-o" data-o="${k}">${o.t}</button>`).join('')}
              </div>
            </div>`}
          ${(fbTxt && !done) ? `<div class="ie-fb" style="border-color:${fbOk ? 'var(--green)' : 'var(--red)'}">${fbTxt}</div>` : ''}
        </div>
      `;
    }

    let tries = 0;
    root.addEventListener('click', e => {
      const b = e.target.closest('.ie-o'); if (!b) return;
      const st = IE_STEPS[i];
      const o = st.opts[+b.dataset.o];
      if (o.ok) {
        if (tries === 0) hits++;
        tries = 0;
        picks[i] = o.v;
        i++;
        w.Audio3D && w.Audio3D.good();
        render(st.fb.ok, true);
        if (i >= IE_STEPS.length && !S.has('estresHecho')) {
          S.flag('estresHecho'); S.flag('estresHits', hits);
          S.addXp(40 + hits * 10);
          w.toast && w.toast('Simulacro diseñado · +' + (40 + hits * 10) + ' XP', 'good');
        }
      } else {
        tries++;
        b.classList.add('bad');
        w.Audio3D && w.Audio3D.hit();
        render(st.fb.bad, false);
      }
    });

    render();
  }

  w.Udat = { mountPiel, mountEstres, pielOk: () => !!(w.State && w.State.has('pielHecho')) };
})(window);
