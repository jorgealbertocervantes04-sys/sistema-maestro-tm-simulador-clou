/* ============================================================
   ESTADO PERSISTENTE DE LA SIMULACIÓN
   La unidad "recuerda": cada decisión modifica condición mecánica
   y factor humano, y eso determina qué eventos ocurren en ruta.
   ============================================================ */
(function (w) {
  // Backend real: Edge Function en Supabase (sesiones de aula, asistencia,
  // votación en vivo y encuesta final). El sitio sigue siendo estático en Vercel;
  // esta es la única URL absoluta que necesita.
  const API = 'https://qykubittvlwsavrhljek.supabase.co/functions/v1/tm-api';
  const START_BUDGET = 80000;

  const fresh = () => ({
    v: 3,
    budget: START_BUDGET,
    spent: 0,
    xp: 0,
    truck: { tires: 'pending', brakes: 'pending', kingpin: 'pending' },
    driver: { fatigue: 18, stress: 22, trust: 45 },
    km: 0,
    log: [],
    flags: {},
    forensicDone: false,
    startedAt: Date.now()
  });

  const S = fresh();
  const listeners = [];
  let saveTimer = null;
  let backendOk = null;

  function emit() {
    listeners.forEach(fn => { try { fn(S); } catch (e) { console.warn(e); } });
    queueSave();
  }

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const State = {
    START_BUDGET,
    get s() { return S; },
    get() { return S; },
    onChange(fn) { listeners.push(fn); fn(S); },
    setForensicDone() { S.forensicDone = true; emit(); },

    /* ---- dinero ---- */
    charge(amount, label, kind) {
      S.spent += amount;
      S.budget = START_BUDGET - S.spent;
      S.log.push({ label, delta: -amount, kind: kind || 'bad', t: Date.now() });
      emit();
      return amount;
    },
    credit(amount, label) {
      S.spent -= amount;
      S.budget = START_BUDGET - S.spent;
      S.log.push({ label, delta: amount, kind: 'good', t: Date.now() });
      emit();
    },
    note(label, kind) { S.log.push({ label, delta: 0, kind: kind || 'mid', t: Date.now() }); emit(); },

    /* ---- puntaje ---- */
    addXp(n) { S.xp += n; emit(); return n; },

    /* ---- condición de la unidad ---- */
    setPart(part, status) { S.truck[part] = status; emit(); },
    partsFaulty() { return Object.keys(S.truck).filter(k => S.truck[k] === 'fault'); },

    /* ---- factor humano ---- */
    driver(delta) {
      if (delta.fatigue) S.driver.fatigue = clamp(S.driver.fatigue + delta.fatigue, 0, 100);
      if (delta.stress) S.driver.stress = clamp(S.driver.stress + delta.stress, 0, 100);
      if (delta.trust) S.driver.trust = clamp(S.driver.trust + delta.trust, 0, 100);
      emit();
    },
    flag(k, v) { S.flags[k] = v === undefined ? true : v; emit(); },
    has(k) { return !!S.flags[k]; },

    /* ---- riesgo compuesto: alimenta el desenlace ---- */
    risk() {
      const d = S.driver;
      const mech = State.partsFaulty().length * 22;
      const human = d.fatigue * 0.42 + d.stress * 0.3 - d.trust * 0.16;
      return clamp(Math.round(mech + human), 0, 100);
    },

    /* ---- desenlace ramificado ---- */
    ending() {
      const r = State.risk();
      if (S.truck.kingpin === 'fault') return 'desacople';
      if (S.truck.brakes === 'fault' && S.driver.fatigue > 55) return 'descenso';
      if (S.driver.fatigue > 74) return 'microsueno';
      if (r >= 55) return 'incidente';
      if (S.spent > 42000) return 'utilidad';
      return 'seguro';
    },

    grade() {
      const pct = S.budget / START_BUDGET;
      if (S.truck.kingpin === 'fault' || pct < 0) return { l: 'NO ACREDITADO', c: 'var(--red)' };
      if (pct >= 0.88 && S.xp >= 700) return { l: 'INSTRUCTOR ESTRATÉGICO', c: 'var(--green)' };
      if (pct >= 0.7) return { l: 'INSTRUCTOR COMPETENTE', c: 'var(--cyan)' };
      if (pct >= 0.45) return { l: 'REQUIERE REFUERZO', c: 'var(--amber)' };
      return { l: 'NO ACREDITADO', c: 'var(--red)' };
    },

    /* ---- áreas de mejora derivadas de errores reales ---- */
    gaps() {
      const g = [];
      if (S.truck.tires === 'fault') g.push('Inspección físico-mecánica: liberó la unidad con presión fuera del rango normativo de 90–100 psi.');
      if (S.truck.brakes === 'fault') g.push('Sistema de frenos de aire: no detuvo la operación ante una fuga detectada en el dolly.');
      if (S.truck.kingpin === 'fault') g.push('Acoplamiento de quinta rueda: omitió la verificación de enganche y pasador de seguridad.');
      if (S.driver.fatigue > 60) g.push('Gestión de fatiga: permitió acumulación de horas de conducción sin descanso reglamentario.');
      if (S.driver.stress > 60) g.push('Regulación del estrés operativo: la presión de despacho se trasladó íntegra al operador.');
      if (S.driver.trust < 40) g.push('Vínculo formativo: el operador no percibe al instructor como aliado, sino como auditor punitivo.');
      if (S.flags.firmoPresion) g.push('Liderazgo de cero tolerancia: cedió ante la presión comercial en al menos una decisión.');
      if (!S.flags.unidadRecorrida) g.push('Conocimiento de la unidad: no completó el recorrido de los 18 puntos del tractocamión doble remolque.');
      if (S.flags.microclaseHecha && S.flags.microclasePct < 65) g.push('Competencia docente: la micro-clase alcanzó ' + S.flags.microclasePct + '% — informó el procedimiento pero no logró transferirlo al operador.');
      if (!S.flags.microclaseHecha) g.push('Competencia docente: no se documentó evidencia de intervención formativa frente a operador.');
      if (!S.flags.pielHecho) g.push('Marco de competencias: no completó la clasificación PIEL, por lo que carece de lenguaje común para nombrar la falla que corrige.');
      if (S.flags.pielHecho && S.flags.pielErrores >= 3) g.push('Marco de competencias: clasificó la taxonomía PIEL con ' + S.flags.pielErrores + ' errores; confunde ejecución técnica con criterio de liderazgo.');
      if (!S.flags.estresHecho) g.push('Diseño instruccional: no diseñó el simulacro bajo presión controlada; su formación se queda en explicación de aula.');
      if (S.flags.intervinoFisico) g.push('Rol del instructor: intervino físicamente en lugar de inducir la decisión, sustituyendo al operador en el momento de aprender.');
      if (!S.flags.respaldoOperador && S.flags.firmoPresion) g.push('Liderazgo visible: no respaldó públicamente al operador que se detuvo, debilitando el estándar frente a todo el patio.');
      if (!g.length) g.push('Sin brechas críticas detectadas. Mantener el estándar y documentar el criterio aplicado como caso de referencia.');
      return g;
    },
    strengths() {
      const s = [];
      if (S.truck.tires === 'ok') s.push('Verificación de presión y estado de llantas conforme a norma.');
      if (S.truck.brakes === 'ok') s.push('Auditoría del sistema neumático de frenado antes de liberar.');
      if (S.truck.kingpin === 'ok') s.push('Validación del acoplamiento de quinta rueda y pasador de seguridad.');
      if (S.driver.fatigue <= 45) s.push('Control efectivo de la fatiga en la planeación de ruta.');
      if (S.driver.trust >= 60) s.push('Construcción de confianza: retroalimentación andragógica efectiva.');
      if (S.flags.pielHecho && (S.flags.pielErrores || 0) === 0) s.push('Dominio de la taxonomía PIEL: clasificó las cuatro competencias sin error.');
      if (S.flags.estresHecho) s.push('Diseño de simulacros con presión controlada: objetivo, distractor, falla inducida y válvula de escape.');
      if (S.flags.indujoDecision) s.push('Rol de acompañante: indujo la decisión correcta con una pregunta en lugar de sustituir al operador.');
      if (S.flags.respaldoOperador) s.push('Liderazgo de cero tolerancia: respaldó públicamente al operador que detuvo la unidad.');
      if (S.flags.unidadRecorrida) s.push('Dominio técnico de la unidad: recorrido completo de los 18 puntos de inspección del Full doble remolque.');
      if (S.flags.microclasePct >= 65) s.push('Competencia docente demostrada: micro-clase con ' + S.flags.microclasePct + '% de desempeño andragógico ante operador con hábito de riesgo.');
      if (S.xp >= 600) s.push('Consistencia de criterio bajo presión operativa sostenida.');
      return s.length ? s : ['Participación completa en el ciclo de simulación.'];
    },

    reset() { Object.assign(S, fresh()); emit(); },

    /* ---- persistencia en backend (localStorage no disponible) ---- */
    async load() {
      try {
        const r = await fetch(API + '/api/progress', { headers: { 'Accept': 'application/json' } });
        if (!r.ok) throw 0;
        const j = await r.json();
        backendOk = true;
        if (j && j.state && j.state.v === S.v && j.state.log && j.state.log.length) return j.state;
      } catch (e) { backendOk = false; }
      return null;
    },
    restore(snap) { Object.assign(S, snap); emit(); },
    backendAvailable() { return backendOk; }
  };

  function queueSave() {
    if (backendOk === false) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        const r = await fetch(API + '/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: S })
        });
        backendOk = r.ok;
      } catch (e) { backendOk = false; }
    }, 700);
  }

  w.State = State;
  w.API_BASE = API;
  // Backend real de sesiones de aula (asistencia, votación en vivo y encuesta
  // final de satisfacción). Corre en una Edge Function de Supabase, separado
  // del backend de progreso individual (que este sitio estático no tiene).
  w.TM_API = 'https://qykubittvlwsavrhljek.supabase.co/functions/v1/tm-api';
})(window);
