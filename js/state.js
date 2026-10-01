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
    v: 4,
    nombre: '',
    presupuestoRef: START_BUDGET,
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
    /* ---- identificación del instructor evaluado ---- */
    setNombre(n) { S.nombre = String(n || '').trim().slice(0, 60); emit(); },
    setPresupuestoRef(n) {
      n = Math.max(10000, Math.min(5000000, Math.round(Number(n) || START_BUDGET)));
      S.presupuestoRef = n;
      S.budget = n - S.spent;
      emit();
    },

    /* ---- dinero ---- */
    charge(amount, label, kind) {
      S.spent += amount;
      S.budget = (S.presupuestoRef || START_BUDGET) - S.spent;
      S.log.push({ label, delta: -amount, kind: kind || 'bad', t: Date.now() });
      emit();
      return amount;
    },
    credit(amount, label) {
      S.spent -= amount;
      S.budget = (S.presupuestoRef || START_BUDGET) - S.spent;
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
      const d = State.diagnostico();
      // Compatible con el generador de PDF: devuelve etiqueta y descripción.
      return { l: d.nivel, d: d.accion, score: d.score, col: d.col };
    },

    /* ============================================================
       DIAGNÓSTICO DETERMINANTE DEL INSTRUCTOR
       Cruza TODA la evidencia observable de la sesión y responde
       las tres preguntas que un director necesita:
       1) ¿Puede estar liberando operaciones hoy? (semáforo)
       2) ¿Cómo piensa?: qué privilegia cuando decide bajo presión.
       3) ¿Qué necesita reforzar, con en qué evidencia falló?
       ============================================================ */
    diagnostico() {
      const F = S.flags, T = S.truck, D = S.driver;
      const money = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US');

      /* ---- dimensiones (0-100) con su evidencia textual ---- */
      const dims = [];
      function dim(nombre, val, ev) {
        val = Math.max(0, Math.min(100, Math.round(val)));
        dims.push({ k: nombre, v: val, ev: ev });
        return val;
      }

      // 1 · Rigor de inspección física (auditoría de patio + simulador 18 puntos)
      {
        let v = null, ev;
        if (F.inspeccion3dHecha) {
          const critTot = (S.inspeccion3d && S.inspeccion3d.criticos) || 4;
          const ratio = (F.inspeccion3dCriticos || 0) / critTot;
          v = (F.inspeccion3dPct || 0) * 0.55 + ratio * 100 * 0.45;
          ev = 'Simulador de inspección: ' + (F.inspeccion3dPct || 0) + '% de precisión · ' + (F.inspeccion3dCriticos || 0) + '/' + critTot + ' defectos críticos bloqueados.';
        } else if (S.forensicDone) {
          const okCount = ['tires', 'brakes', 'kingpin'].filter(k => T[k] === 'ok').length;
          const faultCount = ['tires', 'brakes', 'kingpin'].filter(k => T[k] === 'fault').length;
          v = faultCount ? 100 - faultCount * 33 : 78 + okCount * 7;
          ev = 'Auditoría forense: ' + okCount + ' fallas corregidas, ' + faultCount + ' liberadas con falla activa.';
        } else {
          v = 0;
          ev = 'No ejecutó la auditoría de patio: liberó una unidad sin verificar físicamente nada. Es exactamente el patrón del folio VC-0912.';
        }
        dim('Inspección y verificación física', v, ev);
      }

      // 2 · Criterio bajo presión comercial
      {
        let v = 78, hits = [];
        if (F.firmoPresion) { v -= 45; hits.push('cedió ante la presión de despacho/cliente al menos una vez'); }
        if (F.encubrimiento) { v -= 30; hits.push('autorizó encubrimiento de un siniestro (arreglo en efectivo)'); }
        if (F.intervinoFisico) { v -= 12; hits.push('sustituyó al operador en el momento de decisión'); }
        if (F.respaldoOperador) { v += 16; hits.push('respaldó públicamente al operador que detuvo la unidad'); }
        if (F.indujoDecision) { v += 8; hits.push('indujo la decisión con pregunta en lugar de darla'); }
        const cedidas = S.log.filter(l => l.kind === 'bad').length;
        if (cedidas >= 4) v -= 8;
        dim('Criterio bajo presión', v, hits.length
          ? 'Durante la ruta ' + hits.join('; ') + '. Decisiones registradas como costo por criterio comprometido: ' + cedidas + '.'
          : 'Sostuvo el estándar en todos los puntos de control sin cesiones documentadas.');
      }

      // 3 · Peso real de la firma (responsabilidad sobre la validación)
      {
        let v = 50, ev;
        if (T.kingpin === 'fault') { v = 12; ev = 'Liberó la quinta rueda con falla activa: firmó una salida que podía costar vidas. El desacople es la falla más cara de la cadena.'; }
        else if (Object.keys(T).some(k => T[k] === 'fault')) { v = 38; ev = 'Liberó la unidad sabiendo que tenía una falla activa documentada: la firma no se sostuvo ante la presión de horario.'; }
        else if (S.forensicDone || F.inspeccion3dHecha) { v = 88; ev = 'No autorizó ninguna unidad con falla conocida: entendió que su firma es el último filtro antes de la carretera.'; }
        else { v = 25; ev = 'Firmó la salida sin evidencia de verificación. Una firma sin medición es un trámite, no una autorización.'; }
        if (F.diagnosticoCorrecto) { v = Math.min(100, v + 8); ev += ' Además identificó correctamente la causa raíz del expediente 4471: la validación flexible en patio.'; }
        else { ev += ' No identificó la causa raíz del expediente 4471 en el análisis inicial: atribuyó el siniestro a la carretera o al azar.'; }
        dim('Peso de la firma', v, ev);
      }

      // 4 · Gestión del factor humano (fatiga, estrés, confianza)
      {
        const v = (100 - D.fatigue) * 0.4 + (100 - D.stress) * 0.3 + D.trust * 0.3;
        let ev = 'Al cierre de ruta: fatiga ' + D.fatigue + '% · estrés ' + D.stress + '% · confianza operador-instructor ' + D.trust + '%.';
        if (D.fatigue > 60) ev += ' Permitió que el operador acumulara fatiga fuera de rango sin relevo ni parada obligatoria.';
        else if (D.fatigue <= 40) ev += ' Contuvo la carga de fatiga dentro de rango reglamentario.';
        if (D.trust < 40) ev += ' El nivel de confianza indica un vínculo punitivo: el operador aprendió a ocultar, no a reportar.';
        dim('Gestión del factor humano', v, ev);
      }

      // 5 · Competencia docente (micro-clase + curso PIEL + ciclo + mentoría + estrés)
      {
        const partes = [];
        if (F.microclaseHecha) partes.push(F.microclasePct);
        if (F.cursoHecho) partes.push((F.cursoPts || 0) / 12 * 100);
        if (F.estresHecho) partes.push(Math.min(100, (F.estresHits || 0) * 25 + 25));
        if (F.mentoriaHecha) partes.push(Math.min(100, (F.mentoriaHits || 0) * 25 + 20));
        if (F.cicloHecho) partes.push(Math.max(40, 100 - (F.cicloErrores || 0) * 18));
        const v = partes.length ? partes.reduce((a, b) => a + b, 0) / partes.length : 0;
        let ev;
        if (!partes.length) ev = 'No generó ninguna evidencia de intervención formativa: no dio la micro-clase ni diseñó inducción.';
        else {
          ev = 'Micro-clase ' + (F.microclaseHecha ? (F.microclasePct + '%') : 'no aplicada') +
            ' · curso PIEL ' + (F.cursoHecho ? ((F.cursoPts || 0) + '/12') : 'no diseñado') +
            ' · mentoría con telemetría ' + (F.mentoriaHecha ? ((F.mentoriaHits || 0) + '/4 a la primera') : 'no documentada') +
            ' · simulacro de presión ' + (F.estresHecho ? 'diseñado' : 'omitido') + '.';
          if (F.microclaseHecha && F.microclasePct < 65) ev += ' Su clase informó el procedimiento pero no lo transfirió: el operador salió entendiéndolo, no haciéndolo.';
        }
        dim('Competencia docente (onboarding)', v, ev);
      }

      // 6 · Instrumento propio para evaluar operadores que ingresan
      {
        let v = 0, ev;
        if (F.instrumentoHecho) {
          const I = S.instrumento || {};
          v = I.pts || 0;
          ev = 'Instrumento de ' + (I.total || 0) + ' criterios · calidad ' + (I.pts || 0) + '% · ' + (I.cats || 0) + '/10 dominios cubiertos · ' + (I.propios || 0) + ' criterios redactados por él';
          ev += (I.trampas && I.trampas.length)
            ? ' · incluyó ' + I.trampas.length + ' criterios trampa que premian obediencia o apariencia'
            : ' · sin criterios trampa';
          ev += '.';
        } else {
          ev = 'No construyó un instrumento de evaluación: evalúa operadores con criterios implícitos que nunca ha escrito ni defendido.';
        }
        dim('Instrumento de evaluación de ingreso', v, ev);
      }

      // 7 · Detección de perfiles de riesgo (discriminación del instrumento)
      {
        let v = null, ev;
        if (F.evalAplicada) {
          const aciertos = F.evalAciertos || 0;
          const ramiro = (S.evaluados || []).find(o => o.id === 'ramiro');
          const aprob60 = ramiro && ramiro.calif >= 60;
          v = aciertos * 25 + (aprob60 ? 0 : 25);
          ev = 'Orden correcto de operadores: ' + aciertos + '/3 posiciones contra el desempeño documentado. ';
          ev += aprob60
            ? 'Su hoja aprobó al Borras con ' + ramiro.calif + '%: un instrumento así habría dejado pasar al operador del expediente 4471.'
            : 'Su hoja reprobó al Borras (' + (ramiro ? ramiro.calif : 0) + '%): detecta al operador que se ve bien y no lo está.';
        } else {
          ev = 'No aplicó su instrumento a los tres operadores del patio: no hay evidencia de que su hoja distinga perfil de riesgo.';
        }
        dim('Detección de perfiles de riesgo', v === null ? (F.instrumentoHecho ? 30 : 0) : v, ev);
      }

      // 8 · Marco conceptual (PIEL)
      {
        let v, ev;
        if (F.pielHecho) {
          const e = F.pielErrores || 0;
          v = 100 - e * 22;
          ev = 'Taxonomía PIEL: ' + e + ' error(es) de clasificación' + (e >= 3 ? ': confunde ejecución técnica con criterio de liderazgo.' : '. Usa el lenguaje común para nombrar y corregir la conducta.');
        } else {
          v = 0; ev = 'No completó la clasificación PIEL: carece de lenguaje común para nombrar la competencia que debe reforzar en cada operador.';
        }
        dim('Dominio del marco de competencias', v, ev);
      }

      // 9 · Conocimiento de la unidad
      {
        let v, ev;
        if (F.unidadRecorrida) { v = 85; ev = 'Recorrido completo de los 18 puntos del doble remolque.'; }
        else { v = 30; ev = 'No completó el recorrido de los 18 puntos: verifica desde la memoria, no desde el estándar.'; }
        if (F.inspeccion3dHecha) { v = Math.min(100, v + (F.inspeccion3dPct >= 75 ? 15 : 5)); ev += ' Veredictos del simulador: ' + F.inspeccion3dPct + '% de precisión.'; }
        dim('Conocimiento técnico de la unidad', v, ev);
      }

      // 10 · Impacto económico (utilidad)
      {
        const ref = S.presupuestoRef || START_BUDGET;
        const pctConservado = Math.max(-20, Math.min(100, S.budget / ref * 100));
        const v = Math.max(0, Math.min(100, pctConservado));
        dim('Impacto en la utilidad', v, 'Presupuesto de $' + ref.toLocaleString('en-US') + ' → conservó ' + pctConservado.toFixed(0) + '% · costo materializado ' + money(S.spent) + ' por decisiones propias.');
      }

      /* ---- pesos por dimensión (lo que más pesa es lo que más cuesta) ---- */
      const PESOS = {
        'Inspección y verificación física': 14,
        'Criterio bajo presión': 16,
        'Peso de la firma': 16,
        'Gestión del factor humano': 8,
        'Competencia docente (onboarding)': 10,
        'Instrumento de evaluación de ingreso': 10,
        'Detección de perfiles de riesgo': 12,
        'Dominio del marco de competencias': 4,
        'Conocimiento técnico de la unidad': 5,
        'Impacto en la utilidad': 5
      };
      const totalPeso = dims.reduce((a, d) => a + (PESOS[d.k] || 0), 0);
      const score = dims.reduce((a, d) => a + d.v * (PESOS[d.k] || 0), 0) / (totalPeso || 1);

      /* ---- banderas críticas: determinan el semáforo sin importar el promedio ---- */
      const criticas = [];
      if (T.kingpin === 'fault') criticas.push('Liberó una unidad con falla de quinta rueda: riesgo de desacople en movimiento.');
      if (F.firmoPresion) criticas.push('Cedió el estándar ante presión comercial o de cliente.');
      if (F.encubrimiento) criticas.push('Autorizó ocultar un siniestro: rompió la cadena de reporte.');
      if (S.budget < 0) criticas.push('Destrozó el presupuesto operativo de la ruta: impacto directo contra la utilidad.');
      if (F.evalAplicada) {
        const r = (S.evaluados || []).find(o => o.id === 'ramiro');
        if (r && r.calif >= 60) criticas.push('Su instrumento de evaluación aprueba al operador del expediente 4471.');
      }
      if (F.instrumentoHecho && S.instrumento && S.instrumento.trampas && S.instrumento.trampas.length >= 3) {
        criticas.push('Su hoja de evaluación premia obediencia ciega o apariencia en ' + S.instrumento.trampas.length + ' criterios.');
      }
      if (F.microclaseHecha && F.microclasePct < 45) criticas.push('Su clase de onboarding no transfiere la competencia: desempeño docente ' + F.microclasePct + '%.');

      /* ---- semáforo determinante ---- */
      let nivel, accion, col;
      if (criticas.length >= 2 || score < 42) {
        nivel = 'NO AUTORIZADO PARA LIBERAR OPERACIONES'; col = 'var(--red)';
        accion = 'Retiro temporal de la función de validación hasta completar el plan de refuerzo y reprobar/aprobar el escenario crítico. Sus firmas actuales no son confiables para autorizar salidas.';
      } else if (score < 62 || criticas.length === 1) {
        nivel = 'AUTORIZADO CON SUPERVISIÓN'; col = 'var(--amber)';
        accion = 'Puede operar, pero sus validaciones de ingreso deben ser auditadas por un segundo instructor durante 60 días, junto con el plan de refuerzo enfocado en sus dos dimensiones más bajas.';
      } else if (score < 78) {
        nivel = 'AUTORIZADO CON REFUERZO DIRIGIDO'; col = 'var(--cyan)';
        accion = 'Puede firmar y validar ingresos. Asignarle coaching puntual en las dimensiones marcadas en amarillo y reevaluar en 90 días.';
      } else {
        nivel = 'AUTORIZADO · PERFECTO MULTIPLICADOR'; col = 'var(--green)';
        accion = 'Criterio estable bajo presión y evidencia docente completa. Candidato a validar a otros instructores y a auditar las hojas de ingreso de la plaza.';
      }

      /* ---- perfil de pensamiento: cómo decide cuando nadie mira ---- */
      const perf = [];
      if (F.intervinoFisico && !F.indujoDecision) perf.push({ t: 'Control directo en lugar de transferencia', d: 'Resuelve el riesgo con sus manos y elimina la oportunidad de aprendizaje del operador. Corrige el hecho, pierde la lección.' });
      if (F.encubrimiento) perf.push({ t: 'Evitar el expediente antes que resolver el problema', d: 'Prefiere el arreglo invisible al reporte formal: enseña que los incidentes se ocultan y deja a la empresa sin datos para prevenir.' });
      if (F.firmoPresion) perf.push({ t: 'La presión externa define su estándar', d: 'Su criterio es negociable frente a cliente o despacho: el operador aprende que la norma aplica hasta que alguien presiona.' });
      if (F.respaldoOperador && F.indujoDecision) perf.push({ t: 'Mediador socrático con autoridad', d: 'Pregunta antes de ordenar y asume el costo de respaldar la decisión correcta: forma criterio, no obediencia.' });
      if (F.diagnosticoCorrecto) perf.push({ t: 'Pensamiento sistémico de cadena causal', d: 'Va hacia atrás hasta el origen del siniestro en lugar de culpar al volante: piensa en procesos, no en culpables.' });
      else perf.push({ t: 'Diagnóstico sintomático', d: 'Se queda en la causa visible (operador, clima, mecánica) en lugar de rastrear quién autorizó que llegara a la carretera.' });
      if (F.instrumentoHecho && S.instrumento) {
        if (S.instrumento.trampas && S.instrumento.trampas.length) perf.push({ t: 'Confunde cumplimiento visible con competencia', d: 'Su hoja pesa más lo que se ve desde la oficina del patio (uniforme, puntualidad, actitud) que lo que evita el funeral (inspección, fatiga declarada, capacidad de negarse).' });
        else perf.push({ t: 'Mide conducta, no impresión', d: 'Sus criterios son observables, justificados y discriminatorios: evalúa con evidencia en lugar de con agrado personal.' });
      }
      if (!perf.length) perf.push({ t: 'Perfil mixto sin sesgo dominante marcado', d: 'Combina criterio técnico con acompañamiento; revisar las dimensiones bajas para afinar su estilo de decisión.' });

      /* ---- fortalezas y brechas priorizadas ---- */
      const orden = dims.slice().sort((a, b) => a.v - b.v);
      const brechas = orden.filter(d => d.v < 65).map(d => ({ k: d.k, v: d.v, ev: d.ev }));
      const fuertes = orden.slice().reverse().filter(d => d.v >= 75).map(d => ({ k: d.k, v: d.v, ev: d.ev }));

      return {
        dims, score: Math.round(score), nivel, col, accion, criticas,
        perfil: perf, brechas, fuertes,
        completed: {
          linea: !!F.lineaVidaCompleta, forensic: !!S.forensicDone, inspeccion: !!F.inspeccion3dHecha,
          unidad: !!F.unidadRecorrida, piel: !!F.pielHecho, estres: !!F.estresHecho, microclase: !!F.microclaseHecha,
          ciclo: !!F.cicloHecho, mentoria: !!F.mentoriaHecha, curso: !!F.cursoHecho, instrumento: !!F.instrumentoHecha || !!F.instrumentoHecho,
          evalAplicada: !!F.evalAplicada, evalCampo: !!F.evalCampoHecha
        }
      };
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
