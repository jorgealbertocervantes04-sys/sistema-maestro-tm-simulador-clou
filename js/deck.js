/* ============================================================
   MOTOR DEL MAZO — navegación, ramificación y HUD
   ============================================================ */
(function (w) {
  const I = w.svgIcon;
  const { SLIDES, money } = w.CONTENT;
  let idx = 0, stage, rail, lastDir = 1;

  /* ---------------- utilidades UI ---------------- */
  w.toast = function (msg, kind) {
    const c = document.getElementById('toasts'); if (!c) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || 'mid');
    el.innerHTML = `${I(kind === 'good' ? 'check' : kind === 'bad' ? 'alert' : 'clock')}<span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 420); }, 4200);
  };

  const ctx = {
    damage(f) {
      const d = document.getElementById('damage');
      d.style.opacity = String(Math.min(0.85, 0.45 + (f || 0.6) * 0.4));
      d.classList.add('on'); stage.classList.add('shake');
      setTimeout(() => { d.classList.remove('on'); d.style.opacity = ''; stage.classList.remove('shake'); }, 700);
      w.Audio3D && w.Audio3D.hit();
    },
    engine(on) { w.Audio3D && w.Audio3D.engine(on); }
  };

  /* ---------------- visibilidad y navegación ---------------- */
  function visible() {
    const S = w.State.get();
    return SLIDES.filter(s => !s.when || s.when(S));
  }
  function currentList() { return visible(); }

  function go(dir) {
    const list = currentList();
    const cur = list[idx];
    let n = idx + dir;
    if (n < 0) n = 0;
    if (n > list.length - 1) n = list.length - 1;
    if (n === idx) return;
    lastDir = dir;
    idx = n;
    render();
  }
  function jump(i) {
    if (typeof i === 'string') { const k = currentList().findIndex(s => s.id === i); if (k < 0) return; i = k; }
    lastDir = i > idx ? 1 : -1; idx = Math.max(0, Math.min(i, currentList().length - 1)); render(); }

  /* ---------------- render ---------------- */
  function render() {
    const S = w.State.get();
    const list = currentList();
    const s = list[Math.min(idx, list.length - 1)];
    if (!s) return;

    const anim = s.anim === 'impact' ? 'impact' : (lastDir < 0 ? 'left' : (s.anim || 'enter'));
    stage.innerHTML = '';
    const wrap = document.createElement('section');
    wrap.className = 'slide ' + anim;
    wrap.dataset.id = s.id;

    if (s.build === 'scoreboard') wrap.innerHTML = buildScoreboard(S);
    else if (s.build === 'dictamen') wrap.innerHTML = buildDictamen(S);
    else wrap.innerHTML = typeof s.html === 'function' ? s.html(S) : (s.html || '');
    if (s.build === 'lifeline' && w.Lifeline) w.Lifeline.mount(wrap);
    if (s.build === 'parts' && w.Parts) w.Parts.mount(wrap);
    if (s.build === 'microclase' && w.Microclase) w.Microclase.mount(wrap);
    if (s.build === 'piel' && w.Udat) w.Udat.mountPiel(wrap);
    if (s.build === 'estres' && w.Udat) w.Udat.mountEstres(wrap);
    if (s.build === 'ciclo' && w.Cierre) w.Cierre.mountCiclo(wrap);
    if (s.build === 'telemetria' && w.Cierre) w.Cierre.mountTelemetria(wrap);
    if (s.build === 'curso' && w.Cierre) w.Cierre.mountCurso(wrap);
    if (s.build === 'auditado' && w.Cierre) w.Cierre.mountAuditado(wrap);
    if (s.build === 'evconstruye' && w.Evaluacion) w.Evaluacion.mountConstructor(wrap);
    if (s.build === 'evaplica' && w.Evaluacion) w.Evaluacion.mountAplicar(wrap);
    if (s.build === 'evcampo' && w.Evaluacion) w.Evaluacion.mountCampo(wrap);

    if (s.choices) wrap.appendChild(buildChoices(s, S));
    stage.appendChild(wrap);

    if (w.Scene3D.ready()) {
      w.Scene3D.focus(s.cam || 'wide', 1.9);
      w.Scene3D.mood(s.mood || 'normal');
      w.Scene3D.setSpeed(s.speed || 0);
    }
    if (s.onEnter) { try { s.onEnter(ctx, S); } catch (e) { console.warn(e); } }

    hookMedia(wrap);
    updateRail();
    w.Presenter && w.Presenter.sync(s, idx + 1, list.length);
    w.Classroom && w.Classroom.onSlide(s);
  }

  /* ---------------- decisiones ---------------- */
  function buildChoices(s, S) {
    const box = document.createElement('div');
    box.className = 'choices';
    const done = S.flags['choice:' + s.id];
    s.choices.forEach(c => {
      const b = document.createElement('button');
      b.className = 'choice tone-' + c.tone + (done ? (done === c.key ? ' picked' : ' dim') : '');
      b.disabled = !!done;
      b.innerHTML = `<span class="ck">${c.key}</span>
        <span class="ct"><b>${c.label}</b><i>${c.hint || ''}</i></span>
        <span class="cc">${c.cost ? money(-c.cost) : c.credit ? money(c.credit) : ''}</span>`;
      b.addEventListener('click', () => pick(s, c));
      box.appendChild(b);
    });
    if (done) {
      const chosen = s.choices.find(c => c.key === done);
      if (chosen) box.appendChild(verdictEl(chosen));
    }
    return box;
  }

  function verdictEl(c) {
    const v = document.createElement('div');
    v.className = 'verdict tone-' + c.tone;
    v.innerHTML = `<div class="kicker">${c.tone === 'good' ? 'Criterio correcto' : c.tone === 'mid' ? 'Mitigación parcial' : 'Criterio comprometido'}</div>
      <p>${c.verdict}</p>`;
    return v;
  }

  function pick(s, c) {
    const S = w.State.get();
    if (S.flags['choice:' + s.id]) return;
    w.State.flag('choice:' + s.id, c.key);
    if (c.cost) w.State.charge(c.cost, s.id.toUpperCase() + ' · ' + c.label, c.tone);
    else if (c.credit) w.State.credit(c.credit, c.label);
    else w.State.note(s.id.toUpperCase() + ' · ' + c.label, c.tone);
    if (c.xp) w.State.addXp(c.xp);
    if (c.driver) w.State.driver(c.driver);
    if (c.part) w.State.setPart(c.part[0], c.part[1]);
    if (c.flag) w.State.flag(c.flag);
    if (c.tone === 'bad') { ctx.damage(0.5); w.Scene3D.mood('danger'); }
    if (c.tone === 'good') { w.Scene3D.pulseLights(0x00FF66); w.Audio3D && w.Audio3D.good(); }
    render();
    setTimeout(() => {
      const v = stage.querySelector('.verdict');
      if (v) v.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
  }

  /* ---------------- tablero final ---------------- */
  function buildScoreboard(S) {
    const d = w.State.diagnostico();
    const pct = Math.max(0, Math.round(S.budget / (S.presupuestoRef || w.State.START_BUDGET) * 100));
    const colFor = v => v >= 75 ? 'var(--green)' : v >= 65 ? 'var(--cyan)' : v >= 45 ? 'var(--amber)' : 'var(--red)';
    const items = d.dims.map(x => `
      <div class="dim-row">
        <span class="dim-l">${x.k}</span>
        <div class="dim-bar"><div style="width:${x.v}%;background:${colFor(x.v)}"></div></div>
        <b style="color:${colFor(x.v)}">${x.v}</b>
      </div>`).join('');
    return `
      <div class="panel pad w-lg mx">
        <div class="kicker">Evaluación determinante del instructor · evidencia observable</div>
        <h2 class="title" style="margin-top:.4rem">Tablero de Resultados — ${S.nombre || 'Instructor sin nombre'}</h2>
        <div class="grid-4" style="margin:1.4rem 0">
          <div class="stat"><h4>Índice de criterio</h4><div class="v num" style="color:${d.col}">${d.score}/100</div></div>
          <div class="stat"><h4>Presupuesto final</h4><div class="v num" style="color:${S.budget < 0 ? 'var(--red)' : S.budget < 40000 ? 'var(--amber)' : 'var(--green)'}">${money(S.budget)}</div></div>
          <div class="stat"><h4>Capital conservado</h4><div class="v num">${pct}%</div></div>
          <div class="stat"><h4>XP de criterio</h4><div class="v num c-cyan">${S.xp}</div></div>
        </div>
        <div class="grade" style="border-color:${d.col};color:${d.col}">${d.nivel}</div>
        <div class="dims">${items}</div>
        <div class="timeline">${S.log.filter(l => l.delta !== 0).map(l => `
          <div class="tl-item ${l.kind}">
            <span>${l.label}</span>
            <b class="${l.delta < 0 ? 'c-red' : 'c-green'}">${money(l.delta)}</b>
          </div>`).join('') || '<div class="tl-item mid"><span>Sin movimientos registrados</span><b>$0</b></div>'}</div>
        <div class="row" style="margin-top:1.4rem;gap:.7rem;flex-wrap:wrap">
          <button class="btn" data-act="next"><span data-icon="right"></span> Ver dictamen individual completo</button>
        </div>
      </div>`;
  }

  function buildDictamen(S) {
    const d = w.State.diagnostico();
    const money8 = n => '$' + Math.abs(n).toLocaleString('en-US');
    const critHtml = d.criticas.length
      ? d.criticas.map(c => `<li class="dg-crit">${c}</li>`).join('')
      : '<li style="color:var(--green)">Sin hallazgos críticos: ninguna decisión de esta sesión inhabilita su firma.</li>';
    const perfilHtml = d.perfil.map(p => `<div class="dg-perf"><b>${p.t}</b><i>${p.d}</i></div>`).join('');
    const refHtml = d.fuertes.length
      ? d.fuertes.map(f => `<li><b>${f.k}</b> (${f.v}/100) — ${f.ev}</li>`).join('')
      : '<li class="c-dim">Sin fortaleza ≥75: la sesión no produjo evidencia suficiente en ninguna dimensión.</li>';
    const gapHtml = d.brechas.length
      ? d.brechas.map(g => `<li><b>${g.k}</b> (${g.v}/100) — ${g.ev}</li>`).join('')
      : '<li class="c-dim">Sin brechas bajo 65: todas las dimensiones evaluadas están dentro de rango operativo.</li>';
    return `
      <div class="panel accent-cyan pad w-lg mx brackets c-cyan">
        <div class="row" style="justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap">
          <div>
            <div class="kicker">Documento individual de evaluación · uso directivo</div>
            <h2 class="title" style="margin-top:.4rem">Dictamen del Instructor ${S.nombre ? '— ' + S.nombre : ''}</h2>
            <p class="lede" style="max-width:60ch">Generado de la evidencia observable de esta sesión: decisiones tomadas, instrumento construido, clase impartida y resultados contra el expediente 4471. No describe intención: describe conducta registrada.</p>
          </div>
          <div style="text-align:right">
            <div class="kicker">Semáforo operativo</div>
            <div class="dg-score" style="color:${d.col}">${d.score}<span>/100</span></div>
            <div class="dg-nivel" style="border-color:${d.col};color:${d.col}">${d.nivel}</div>
          </div>
        </div>

        <div class="dg-accion" style="border-left:3px solid ${d.col}">
          <div class="kicker">Acción institucional recomendada</div>
          <p>${d.accion}</p>
        </div>

        <div class="dg-block">
          <div class="kicker c-red">Hallazgos críticos que pesan sobre su firma</div>
          <ul class="mini dg-list">${critHtml}</ul>
        </div>

        <div class="dg-block">
          <div class="kicker c-cyan">Cómo piensa: perfil de decisión bajo presión</div>
          ${perfilHtml}
        </div>

        <div class="grid-2" style="margin-top:1.2rem">
          <div class="stat"><h4>Evidencia que sí respalda su firma</h4><ul class="mini">${refHtml}</ul></div>
          <div class="stat"><h4>Áreas a reforzar (con la evidencia en que falló)</h4><ul class="mini">${gapHtml}</ul></div>
        </div>

        ${(() => {
          const F = S.flags;
          if (!F.detuvoCabina && !F.cedioCabina && !F.reganoCabina) return '';
          const estado = F.detuvoCabina
            ? '<span class="c-green">Detuvo la operación en marcha con datos en la mano y separó fatiga de conducta: el descargo se hizo en frío, con hoja de evaluación enfrente.</span>'
            : F.reganoCabina
            ? '<span class="c-amber">Acompañó corrigiendo todo sobre la marcha: los hechos se señalaron, pero el operador salió a defenderse, no a cambiar. La corrección en caliente funciona con una sola conducta prioritaria.</span>'
            : '<span class="c-red">Cinco horas en el asiento del lado sin detener ninguna de las cuatro fallas observadas: el acompañamiento registró el riesgo y lo dejó pasar. El silencio del acompañante también es autorización — es el patrón exacto del folio VC-0912.</span>';
          return `
          <div class="dg-block">
            <div class="kicker c-cyan">Evidencia de acompañamiento en cabina · Estación 3</div>
            <p class="lede" style="font-size:.95rem;margin:.3rem 0 0">${estado}</p>
          </div>`;
        })()}

        <div class="grid-2" style="margin-top:1.2rem">
          <div class="stat"><h4>Utilidad materializada por sus decisiones</h4>
            <div class="v num" style="color:${S.budget < 0 ? 'var(--red)' : 'var(--green)'}">${S.spent > 0 ? '-' + money8(S.spent) : money8(0)}</div>
            <p class="lede" style="font-size:.85rem;margin:.4rem 0 0">Cada peso perdido aquí fue una cesión de criterio documentada. Un instructor que sostiene el estándar cuesta menos que el accidente que previene.</p>
          </div>
          <div class="stat"><h4>Evidencias generadas en la sesión</h4>
            <ul class="mini">
              <li>Instrumento de evaluación: ${w.State.has('instrumentoHecho') ? 'construido con ' + ((S.instrumento && S.instrumento.total) || 0) + ' criterios' : 'NO construido'}</li>
              <li>Detección del Borras: ${w.State.has('evalAplicada') ? ((S.evaluados || []).find(o => o.id === 'ramiro') || {}).calif + '%' : 'no probada'}</li>
              <li>Clase de onboarding: ${w.State.has('microclaseHecha') ? (S.flags.microclasePct + '% de transferencia') : 'no impartida'}</li>
              <li>Curso PIEL de inducción: ${w.State.has('cursoHecho') ? ((S.flags.cursoPts || 0) + '/12 bloques transferibles') : 'no diseñado'}</li>
              <li>Evaluación en campo a operador real: ${w.State.has('evalCampoHecha') ? (S.evalCampo ? S.evalCampo.nombre + ' · ' + S.evalCampo.pct + '%' : 'hecha') : 'no aplicada'}</li>
            </ul>
          </div>
        </div>

        <div class="row" style="margin-top:1.5rem;gap:.7rem;flex-wrap:wrap">
          <button class="btn" data-act="pdf">${I('doc')} Descargar dictamen en PDF</button>
          <button class="btn ghost" data-act="restart">${I('refresh')} Reiniciar simulación</button>
        </div>
      </div>`;
  }

  /* ---------------- HUD superior ---------------- */
  function updateRail() {
    const S = w.State.get();
    const list = currentList();
    const s = list[Math.min(idx, list.length - 1)] || {};
    const pct = Math.max(0, Math.min(100, S.budget / (S.presupuestoRef || w.State.START_BUDGET) * 100));
    const fill = rail.querySelector('.budget-fill');
    fill.style.width = pct + '%';
    fill.classList.toggle('warn', pct < 60 && pct >= 28);
    fill.classList.toggle('crit', pct < 28);
    rail.querySelector('[data-budget]').textContent = money(S.budget);
    rail.querySelector('[data-xp]').textContent = S.xp + ' XP';
    rail.querySelector('[data-chapter]').textContent = s.chapter || '';
    document.body.classList.toggle('phase1', s.chapter === 'Línea de Vida');
    rail.querySelector('[data-count]').textContent = (idx + 1) + ' / ' + list.length;
    const risk = w.State.risk();
    const rEl = rail.querySelector('[data-risk]');
    rEl.textContent = 'Riesgo ' + risk + '%';
    rEl.style.color = risk > 55 ? 'var(--red)' : risk > 30 ? 'var(--amber)' : 'var(--green)';
    ['tires', 'brakes', 'kingpin'].forEach(k => {
      const d = rail.querySelector(`[data-cond="${k}"]`);
      d.className = 'dot ' + S.truck[k];
    });
    const bar = document.getElementById('progress-line');
    if (bar) bar.style.width = ((idx + 1) / list.length * 100) + '%';
  }

  /* ---------------- media con fallback ---------------- */
  function hookMedia(scope) {
    scope.querySelectorAll('[data-media]').forEach(box => {
      const v = box.querySelector('video');
      if (!v) return;
      const fail = () => box.classList.add('missing');
      v.addEventListener('error', fail);
      setTimeout(() => { if (!v.videoWidth && v.readyState === 0) fail(); }, 2600);
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    stage = document.getElementById('stage');
    rail = document.getElementById('rail');

    document.addEventListener('keydown', e => {
      if (document.getElementById('forensic').classList.contains('on')) {
        if (e.key === 'Escape') w.Forensic.close();
        return;
      }
      if (e.key.toLowerCase() === 'r' && currentList()[idx] && currentList()[idx].build === 'lifeline') {
        e.preventDefault(); w.Lifeline.go(w.Lifeline.step() + 1); return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      if (e.key.toLowerCase() === 'n') w.Presenter && w.Presenter.toggle();
      if (e.key.toLowerCase() === 'v') w.Classroom && w.Classroom.toggle();
      if (e.key === 'Home') jump(0);
      if (e.key === 'End') jump(currentList().length - 1);
      if (e.key.toLowerCase() === 'i') toggleIndex();
      if (e.key === 'Escape') closeIndex();
    });

    document.getElementById('btn-index').addEventListener('click', toggleIndex);
    document.getElementById('idx-close').addEventListener('click', closeIndex);
    document.getElementById('index-ov').addEventListener('click', e => {
      if (e.target.id === 'index-ov') closeIndex();
    });

    document.body.addEventListener('click', e => {
      const rv = e.target.closest('.rv');
      if (rv && !rv.classList.contains('open')) {
        rv.classList.add('open');
        w.Audio3D && w.Audio3D.tick();
        const box = rv.closest('.rv-set');
        if (box && [...box.querySelectorAll('.rv')].every(x => x.classList.contains('open'))) {
          const id = box.dataset.set;
          if (id && !w.State.has('rv:' + id)) { w.State.flag('rv:' + id); w.State.addXp(25); }
        }
        return;
      }
      const a = e.target.closest('[data-act]'); if (!a) return;
      const act = a.dataset.act;
      if (act === 'forensic') w.Forensic.open();
      if (act === 'pdf') w.Report && w.Report.build();
      if (act === 'restart') { w.State.reset(); idx = 0; render(); w.toast('Simulación reiniciada', 'mid'); }
      if (act === 'next') go(1);
      if (act === 'prev') go(-1);
    });

    document.getElementById('nav-next').addEventListener('click', () => go(1));
    document.getElementById('nav-prev').addEventListener('click', () => go(-1));

    document.addEventListener('forensic:closed', () => {
      const el = document.getElementById('forensic-done');
      if (el) el.classList.remove('hidden');
      updateRail();
      w.toast('Auditoría cerrada. Avanza para ver el dossier de despacho.', 'mid');
    });

    w.State.onChange(() => { if (stage) updateRail(); });

    let sx = 0;
    stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1);
    }, { passive: true });

    render();
  }

  /* ---- índice de escenas ---- */
  function titleOf(s) {
    if (s.build === 'scoreboard') return 'Tablero de resultados';
    if (s.build === 'dictamen') return 'Dictamen del instructor';
    if (s.build === 'lifeline') return 'Línea de Vida · retroceso 92 días';
    if (s.build === 'parts') return 'Recorrido de la unidad';
    if (s.build === 'microclase') return 'Micro-clase en piso';
    if (s.build === 'piel') return 'Taxonomía PIEL aplicada';
    if (s.build === 'estres') return 'Ingeniería del estrés';
    if (s.build === 'ciclo') return 'Ciclo del aprendizaje real';
    if (s.build === 'telemetria') return 'Mentoría correctiva con telemetría';
    if (s.build === 'curso') return 'Diseño del curso de inducción PIEL';
    if (s.build === 'auditado') return 'Cierre financiero auditado';
    if (s.build === 'evconstruye') return 'Constructor del instrumento de evaluación';
    if (s.build === 'evaplica') return 'Aplicación del instrumento a tres operadores';
    if (s.build === 'evcampo') return 'Evaluación de un operador de tu flota';
    const raw = typeof s.html === 'function' ? s.html(w.State.get()) : (s.html || '');
    const m = String(raw).match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
    return m ? m[1].replace(/<[^>]+>/g, '').trim() : (s.title || s.id);
  }
  function closeIndex() { document.getElementById('index-ov').hidden = true; }

  /* Mapa del curso: agrupa los capítulos en actos con intención pedagógica,
     para que el instructor vea la arquitectura completa, no solo una lista plana. */
  const ACTS = [
    { name: 'Acto I · El expediente', chapters: ['Apertura', 'Línea de Vida'] },
    { name: 'Acto II · La reconstrucción', chapters: ['Patio'] },
    { name: 'Acto III · El marco', chapters: ['Marco', 'Estación 2', 'Estación 1'] },
    { name: 'Acto IV · La ruta en vivo', chapters: ['Ruta', 'Estación 3', 'Estación 4'] },
    { name: 'Acto V · El desenlace', chapters: ['Desenlace', 'Estación 5'] },
    { name: 'Acto VI · El cierre', chapters: ['Cierre'] }
  ];
  function actOf(chapter) {
    const a = ACTS.find(a => a.chapters.includes(chapter));
    return a ? a.name : 'Otros';
  }

  function toggleIndex() {
    const ov = document.getElementById('index-ov');
    if (!ov.hidden) { ov.hidden = true; return; }
    const list = currentList();
    const grid = document.getElementById('idx-grid');
    let html = '', lastAct = null;
    list.forEach((s, i) => {
      const act = actOf(s.chapter);
      if (act !== lastAct) {
        html += '<div class="idx-act">' + act + '</div>';
        lastAct = act;
      }
      html += '<button class="idx-item' + (i === idx ? ' now' : '') + '" data-jump="' + i + '">' +
        '<span class="idx-n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="idx-t"><span class="idx-c">' + (s.chapter || '') + '</span>' + titleOf(s) + '</span></button>';
    });
    grid.innerHTML = html;
    grid.querySelectorAll('[data-jump]').forEach(b => {
      b.addEventListener('click', () => { closeIndex(); jump(parseInt(b.dataset.jump, 10)); });
    });
    ov.hidden = false;
  }

  function applyKey(key) {
    const s = currentList()[idx];
    if (!s || !s.choices) return false;
    const c = s.choices.find(x => x.key === key);
    if (!c) return false;
    pick(s, c);
    return true;
  }

  w.Deck = { init, render, go, jump, applyKey, current: () => currentList()[idx], index: () => idx };
})(window);
