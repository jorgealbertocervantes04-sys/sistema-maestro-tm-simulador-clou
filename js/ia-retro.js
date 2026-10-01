/* ============================================================
   IA DE RETROALIMENTACIÓN — narrativas personalizadas por participante
   Motor determinista local: NO inventa datos. Toma la evidencia real
   de cada persona (votos, paquete del taller, encuesta) y redacta para
   él su propia retroalimentación, como si un evaluador experto revisara
   su caso. Se usa dentro de los PDFs individuales y grupales.
   ============================================================ */
(function (w) {
  const toneWord = { good: 'estándar alto', mid: 'mitigación parcial', bad: 'alto riesgo' };

  /* ---------- micro-redactores: frases generadas del dato real ---------- */
  function opener(name, fb) {
    if (!fb.totalVotes) {
      return name + ', en esta sesión no registraste votos en las escenas de decisión, así que la evidencia disponible es insuficiente para evaluar tu criterio. La instrucción directa es simple: la próxima sesión cada decisión queda registrada desde tu celular. Sin voto no hay expediente, y sin expediente no hay forma de defenderte ni de acreditarte.';
    }
    const ratio = fb.tally.good / fb.totalVotes;
    if (ratio >= 0.8) {
      return name + ', de tus ' + fb.totalVotes + ' decisiones votadas, ' + fb.tally.good + ' fueron de estándar alto (' + Math.round(ratio * 100) + '%). Tu patrón dominante es el de alguien que conoce el procedimiento y no lo negocia: eso es base sólida, y ahora falta que se vea también cuando el costo de decidir bien es tuyo, no del simulador.';
    }
    if (ratio >= 0.5) {
      return name + ', tus ' + fb.totalVotes + ' decisiones se repartieron así: ' + fb.tally.good + ' de estándar alto, ' + fb.tally.mid + ' de mitigación parcial y ' + fb.tally.bad + ' de alto riesgo. Estás decidiendo bien cuando el escenario te es favorable y cediendo cuando aparece la presión de tiempo o de cliente. Ese margen —no el desconocimiento— es exactamente donde nacen los expedientes.';
    }
    return name + ', sobre ' + fb.totalVotes + ' decisiones votadas, solo ' + fb.tally.good + ' fueron de estándar alto y ' + fb.tally.bad + ' quedaron en alto riesgo. El patrón no es de inexperiencia: es de criterio negociable. Cada opción que elegiste prioriza salir a tiempo sobre salir verificado, y esa es la lógica que produjo el expediente 4471.';
  }

  function patternLine(fb) {
    const slides = Array.from(new Set(fb.risky.map(r => r.slide)));
    if (!slides.length) return 'No hubo cesiones documentadas en ninguna escena votada: sostiene el estándar incluso en los escenarios diseñados para romperlo.';
    if (slides.length === 1) return 'Toda tu exposición se concentró en un solo tipo de momento (' + slides[0] + '). Eso acota el trabajo: no necesitas cambiar tu criterio completo, necesitas un guion preparado para ese momento exacto antes de que vuelva a ocurrir.';
    return 'Las cesiones se repitieron en ' + slides.length + ' momentos distintos de la sesión. Cuando el mismo error aparece en escenarios diferentes, ya no es una situación difícil: es un patrón propio.';
  }

  function sceneComment(r, i) {
    const why = [
      'porque protege el horario o al cliente antes que a la unidad',
      'porque confías en que el operador «se va a dar cuenta» en lugar de verificar tú',
      'porque evitas el conflicto inmediato aunque deje el problema intacto',
      'porque tratas el síntoma visible y no la causa que lo autorizó'
    ][i % 4];
    const fix = {
      bad: 'La corrección no es «decidir distinto»: es tener dicho, antes de que suene la radio, cuál es tu línea y qué vas a responderle a quien te presione.',
      mid: 'Estabas cerca: te faltó el paso que convierte una buena intención en evidencia cerrada — documentar, medir o acompañar hasta el final, no a medias.'
    }[r.tone] || '';
    return 'En [' + r.slide + '] elegiste «' + r.label + '» — decidiste así ' + why + '. ' + (r.verdict ? r.verdict + ' ' : '') + fix;
  }

  function tallerNarrative(p) {
    const out = [];
    const inst = p.instrumentoDetalle;
    if (inst) {
      const trampas = (inst.trampas || []).length;
      out.push('Tu instrumento: ' + inst.total + ' criterios con ' + (inst.cats || 0) + '/10 dominios cubiertos y calidad ' + inst.pts + '%. ' +
        (trampas
          ? 'Arrastra ' + trampas + ' criterio(s) trampa que premian obediencia o apariencia por encima de conducta verificable; una hoja así aprueba al operador equivocado.'
          : 'Sin criterios trampa detectados: mides conducta, no impresión.') +
        (inst.propios ? ' Redejaste además ' + inst.propios + ' criterio(s) propio(s), señal de que ya tradujiste tu patio a estándar.' : ''));
    } else {
      out.push('No construiste un instrumento de evaluación: hoy decides ingresos de operadores con criterios implícitos que nunca has escrito ni defendido ante nadie.');
    }
    const ev = p.evaluadosDetalle;
    if (ev && ev.length) {
      const ram = ev.find(o => o.id === 'ramiro');
      if (ram) {
        out.push(ram.calif >= 60
          ? 'Tu hoja le dio al Borras ' + ram.calif + '%. El Borras es el operador del expediente 4471: tu instrumento, tal como está, habría firmado su salida.'
          : 'Tu hoja reprobó al Borras con ' + ram.calif + '%: tu instrumento distingue al operador que se ve bien y no lo está. Esa es la competencia central del puesto.');
      }
      if (p.evalAciertos !== null && p.evalAciertos !== undefined) {
        out.push('Ordenaste ' + p.evalAciertos + '/3 posiciones contra el desempeño documentado. ' + (p.evalAciertos === 3 ? 'Instrumento calibrado.' : 'Revisa los dominios con menos peso: ahí está la ceguera de tu hoja.'));
      }
    }
    if (p.microclasePct !== null && p.microclasePct !== undefined) {
      out.push(p.microclasePct >= 65
        ? 'Tu micro-clase alcanzó ' + p.microclasePct + '% de transferencia: el operador salió habiendo practicado, no solo habiendo escuchado.'
        : 'Tu micro-clase quedó en ' + p.microclasePct + '%: informaste el procedimiento pero no lo transfieres. Un operador que te entiende no es un operador que cambia; el folio VC-0912 lo firmó alguien que sabía explicar.');
    } else {
      out.push('No se registró tu micro-clase: no hay evidencia de cómo enseñas en un onboarding.');
    }
    if (p.simuladorGrado) out.push('Semaforo del simulador: ' + p.simuladorGrado + ' (índice ' + (p.simuladorDiagScore !== null && p.simuladorDiagScore !== undefined ? p.simuladorDiagScore : '—') + '/100 · desenlace ' + (p.simuladorEnding || 'no concluido') + ').');
    return out.join('\n');
  }

  function satComment(sat) {
    if (!sat) return 'No respondiste la encuesta final: te quedaste con la sesión sin cerrar tu propia lectura de ella. Completa la reflexión pendiente —qué decisión de hoy te incomodó y por qué— porque ahí vive el aprendizaje.';
    const rs = Object.values(sat.ratings || {}).map(Number).filter(n => !isNaN(n));
    const prom = rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length) : null;
    let s = prom !== null ? 'Tu encuesta promedio ' + prom.toFixed(1) + '/5. ' : '';
    if (sat.comment && sat.comment.trim()) s += 'Lo que escribiste («' + sat.comment.trim() + '») me dice dónde pusiste el foco; úsalo como punto de partida de la conversación con tu facilitador.';
    else s += 'Sin comentario abierto: la próxima vez escribe una frase concreta —qué te llevas y qué vas a cambiar el lunes— porque eso es lo que hace evaluable tu compromiso.';
    return s;
  }

  function compromisos(fb, p) {
    const list = [];
    const riskySlides = Array.from(new Set(fb.risky.map(r => r.slide)));
    if (riskySlides.length) list.push('Antes de tu próxima ruta, ten escrito el guion exacto (una frase tuya) con el que vas a sostener la decisión correcta en los momentos ' + riskySlides.slice(0, 3).map(s => '«' + s + '»').join(', ') + '. No se improvisan: se ensayan.');
    if (!p || !p.instrumentoDetalle) list.push('Redacta tu instrumento de evaluación de ingreso con mínimo 60 criterios justificados en los 10 dominios. Si no puedes defender por qué mides algo, no pertenece a tu hoja.');
    else if ((p.instrumentoDetalle.trampas || []).length) list.push('Elimina de tu hoja los criterios trampa detectados y sustitúyelos por conductas verificables (medición, fecha, dato).');
    if (p && p.evaluadosDetalle) {
      const ram = p.evaluadosDetalle.find(o => o.id === 'ramiro');
      if (ram && ram.calif >= 60) list.push('Calibra tu hoja contra el caso del Borras: debe reprobarlo. Si tu instrumento lo aprueba, no está midiendo riesgo, está midiendo simpatía.');
    }
    if (!p || p.microclasePct === null || p.microclasePct === undefined || p.microclasePct < 65) list.push('Diseña tu próxima plática de onboarding con los cuatro momentos (apertura, evidencia, práctica, compromiso) y termina SIEMPRE con el operador ejecutando la conducta, no escuchándote ejecutarla.');
    list.push('Documenta una decisión difícil que sostuviste esta semana en tu patio real —con fecha, unidad y consecuencia— y llévala a la siguiente sesión.');
    return list.slice(0, 5);
  }

  /* API: genera la narrativa completa de UN participante con su evidencia real */
  function generar({ attendee, feedback, paquete }) {
    const name = (attendee && attendee.name) || 'Participante';
    const fb = feedback || { totalVotes: 0, tally: { good: 0, mid: 0, bad: 0 }, risky: [], satisfaction: null };
    const p = paquete || null;
    const blocks = [];
    blocks.push({ k: 'Cómo decidiste', t: opener(name, fb) });
    blocks.push({ k: 'Tu patrón', t: patternLine(fb) });
    if (fb.risky.length) {
      blocks.push({ k: 'Tus cesiones, una por una', t: fb.risky.slice(0, 6).map((r, i) => sceneComment(r, i)).join('\n'), bullets: true });
    }
    if (p) blocks.push({ k: 'Tu evidencia del taller individual', t: tallerNarrative(p), bullets: true });
    blocks.push({ k: 'Tu cierre personal', t: satComment(fb.satisfaction) });
    return { blocks, compromisos: compromisos(fb, p) };
  }

  /* Narrativa grupal: síntesis del grupo calculada de los votos reales */
  function generarGrupo(data, slidesById) {
    const bySlide = {};
    (data.votes || []).forEach(v => {
      const s = slidesById[v.slide_id];
      const ch = s && s.choices[v.option_key];
      if (!ch) return;
      (bySlide[v.slide_id] = bySlide[v.slide_id] || []).push(ch.tone);
    });
    const escenas = Object.keys(bySlide);
    if (!escenas.length) return 'Sin votaciones registradas: no hay evidencia grupal de criterio para este grupo.';
    const fragiles = escenas
      .map(id => ({ id, pctBad: Math.round(bySlide[id].filter(t => t === 'bad').length / bySlide[id].length * 100), n: bySlide[id].length }))
      .sort((a, b) => b.pctBad - a.pctBad);
    const totalBad = escenas.reduce((a, id) => a + bySlide[id].filter(t => t === 'bad').length, 0);
    const totalV = escenas.reduce((a, id) => a + bySlide[id].length, 0);
    let s = 'El grupo tomó ' + totalV + ' decisiones colectivas en ' + escenas.length + ' puntos de control; ' + totalBad + ' (' + Math.round(totalBad / totalV * 100) + '%) fueron de alto riesgo. ';
    s += 'La escena más frágil fue «' + fragiles[0].id + '» con ' + fragiles[0].pctBad + '% del grupo en alto riesgo';
    if (fragiles.length > 1) s += ', seguida de «' + fragiles[1].id + '» (' + fragiles[1].pctBad + '%)';
    s += '. Esa es la conversación que este grupo necesita tener antes de volver al patio: no les falta conocimiento del procedimiento, les falta un guion prepuesto para el momento en que el procedimiento cuesta tiempo o dinero.';
    return s;
  }

  w.IARetro = { generar, generarGrupo };
})(window);
