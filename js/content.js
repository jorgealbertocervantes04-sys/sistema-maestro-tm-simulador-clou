/* ============================================================
   CONTENIDO — mazo declarativo con ramificación por estado
   ============================================================ */
(function (w) {
  const I = w.svgIcon;
  const money = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US');

  const media = (file, label, poster) => `
    <div class="media" data-media>
      <div class="scanline"></div>
      <video src="${file}" ${poster ? `poster="${poster}"` : ''} controls preload="metadata" playsinline></video>
      <div class="media-fallback">${I('film')}<div class="kicker">Archivo de video no encontrado</div><code>${file}</code>
        <div class="kicker" style="opacity:.7">${label}</div></div>
    </div>`;

  const mods = (list) => `<div class="modules"><div class="kicker">Módulos de competencia cubiertos en esta estación</div>
    ${list.map(m => `<span class="mod-chip">${m}</span>`).join('')}</div>`;

  const cost = n => `<div class="money sev-2 c-red">${money(-n)}</div>`;

  /* ---------- Eventos de ruta condicionales ---------- */
  const routeEvent = (o) => ({
    id: o.id, chapter: 'Ruta', cam: o.cam || 'follow', mood: o.mood || 'danger',
    speed: 1, anim: 'impact', when: o.when,
    html: (S) => `
      <div class="panel accent-red pad w-md mx brackets c-red">
        <div class="kicker c-red">Evento de ruta · consecuencia de una decisión previa</div>
        <h2 class="title glow-red" style="margin-top:.6rem">${o.title}</h2>
        <p class="lede">${o.body(S)}</p>
        ${o.video ? media(o.video, o.title) : ''}
        <div class="money sev-2 c-red" style="margin-top:1rem">${money(-o.amount(S))}</div>
        <p class="lede" style="margin-top:.9rem;font-size:.95rem;opacity:.75">${o.trace}</p>
      </div>`,
    onEnter: (ctx, S) => {
      const amt = o.amount(S);
      w.State.charge(amt, o.title, 'bad');
      if (o.effect) o.effect(S);
      ctx.damage();
      w.Scene3D.impact(1.1);
    }
  });

  const SLIDES = [

    /* ============ APERTURA ============ */
    {
      id: 'portada', chapter: 'Apertura', cam: 'opening', mood: 'normal', speed: 0, anim: 'enter',
      html: () => `
        <div class="cover cover-bg" id="cover-bg-wrap">
          <img class="cover-bg-img" src="portada (2).png" alt="Formando el Trayecto del Instructor"
               onerror="this.closest('.cover-bg').classList.add('cover-bg-missing')">
          <div class="cover-bg-tint"></div>
          <div class="panel accent-cyan pad brackets c-cyan cover-txt">
            <div class="kicker">Sistema Maestro TM &middot; Mentores Operativos</div>
            <h1 class="hero glow-cyan" style="margin-top:.9rem">Formando el Trayecto del Instructor</h1>
            <p class="lede">Dos fases. Primero vas a <strong class="c-amber">reconstruir hacia atr&aacute;s</strong> un siniestro real hasta encontrar a quien lo autoriz&oacute;.
            Despu&eacute;s vas a <strong class="c-cyan">ocupar su lugar</strong>: operar la unidad, auditarla pieza por pieza y dar clase frente a un operador de verdad.</p>
            <div class="grid-3" style="margin-top:1.5rem">
              <div class="stat"><h4>Fase 1 &middot; L&iacute;nea de Vida</h4><div class="v c-amber num">92 d&iacute;as</div></div>
              <div class="stat"><h4>Fase 2 &middot; Simulador</h4><div class="v c-cyan num">$80,000</div></div>
              <div class="stat"><h4>Desenlaces posibles</h4><div class="v num">6</div></div>
            </div>
            <p class="lede" style="margin-top:1.3rem;font-size:.9rem;opacity:.7">&larr; &rarr; o barra espaciadora. <strong>I</strong> &iacute;ndice &middot; <strong>N</strong> notas &middot; <strong>V</strong> votaci&oacute;n &middot; <strong>R</strong> retroceso.</p>
          </div>
        </div>`
    },

    /* ============ FASE 1 · LÍNEA DE VIDA ============ */
    {
      title: 'Fase 1 · Línea de Vida', id: 'fase-1', chapter: 'Línea de Vida', cam: 'lowfront', mood: 'warn', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel pad w-md mx phase brackets c-amber accent-orange">
          <div class="pn c-amber">01</div>
          <div class="pt">Línea de Vida</div>
          <p class="lede" style="margin-top:1.1rem">Antes de comenzar, vas a mirar. Un siniestro real, una llamada real y noventa y dos días
          de historia que se van a rebobinar frente a ti hasta llegar al punto exacto donde esto se pudo evitar
          <strong class="c-amber">y a la persona que estaba ahí</strong>.</p>
          <div class="steps">
            <span class="on c-amber">1 · Sensibilización</span>
            <span>2 · Retroceso forense</span>
            <span>3 · El error</span>
          </div>
          <p class="lede" style="margin-top:1.5rem;font-size:.95rem;opacity:.68">Esta fase no se califica. Se siente. El tablero de decisiones abre en la Fase 2.</p>
        </div>`,
      note: 'Baja la luz del aula antes de avanzar. Di solo esto: "lo que van a ver pasó, y alguien firmó para que pasara". Nada más.'
    },

    {
      id: 'elborras', chapter: 'Línea de Vida', cam: 'crash', mood: 'danger', speed: 0.2, anim: 'impact',
      html: () => `
        <div class="panel accent-red pad w-lg mx" style="text-align:center">
          <div class="kicker c-red">Expediente 4471 · Carretera federal · 03:14 h</div>
          <h2 class="title glow-red" style="margin-top:.5rem">Él es el Borras</h2>
          ${media('videos/elborras.mp4', 'Presentación del operador antes del siniestro')}
        </div>`,
      note: 'Antes de mostrar el choque, dale una cara y un nombre. Que el grupo lo conozca como persona antes de conocerlo como expediente.'
    },

    {
      id: 'siniestro', chapter: 'Línea de Vida', cam: 'crash', mood: 'danger', speed: 0.2, anim: 'impact',
      html: () => `
        <div class="panel accent-red pad w-lg mx" style="text-align:center">
          <div class="kicker c-red">Expediente 4471 · Carretera federal · 03:14 h</div>
          <h2 class="title glow-red" style="margin-top:.5rem">El Siniestro</h2>
          ${media('videos/siniestro.mp4', 'Evidencia audiovisual del siniestro')}
        </div>`,
      onEnter: (ctx) => { ctx.damage(0.6); w.Scene3D.impact(0.8); },
      note: 'No expliques nada todavía. Deja correr el video completo y guarda silencio 5 segundos al terminar. El silencio es parte del método.'
    },

    {
      id: 'llamada', chapter: 'Línea de Vida', cam: 'rear', mood: 'danger', speed: 0, anim: 'right',
      html: () => `
        <div class="panel accent-red pad w-lg mx" style="text-align:center">
          <div class="kicker c-red">Reporte crítico · 03:00 h</div>
          <h2 class="title" style="margin-top:.5rem">La Llamada</h2>
          <p class="lede">Pérdida total de la unidad. El operador tiene tres meses en la empresa.</p>
          ${media('videos/llamada.mp4', 'Llamada de emergencia al instructor')}
        </div>`,
      note: 'Pregunta al grupo: ¿quién ha recibido una llamada así? Levanten la mano. Ese es el ancla emocional del curso.'
    },

    {
      id: 'la-familia', chapter: 'Línea de Vida', cam: 'top', mood: 'normal', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel pad w-md mx" style="border-color:rgba(255,196,0,.28)">
          <div class="kicker c-amber">Lo que el expediente 4471 no contabiliza</div>
          <h2 class="title" style="margin-top:.5rem">La Familia</h2>
          <p class="lede">El reporte de siniestro registra una unidad, una carga y un monto. Esto es lo que quedó del otro lado del teléfono esa madrugada.</p>
          ${media('videos/la-familia.mp4', 'Marisol recibe la llamada esa madrugada')}
          <div class="fam">
            <div class="fam-c"><div class="n">Arnulfo “el Borras” Peña</div><div class="r">Operador · 34 años</div></div>
            <div class="fam-c"><div class="n">Marisol Aguilar</div><div class="r">Esposa · 31 años</div></div>
            <div class="fam-c"><div class="n">Emiliano</div><div class="r">Hijo · 7 años</div></div>
            <div class="fam-c"><div class="n">Renata</div><div class="r">Hija · 4 años</div></div>
          </div>
          <p class="fam-note">Este simulador va a medirte en pesos porque es el único lenguaje que la operación entiende.
          Pero el número que acabas de ver no aparece en ningún tablero: <strong class="c-amber">no hay presupuesto que lo reponga</strong>.</p>
        </div>`,
      onEnter: () => { w.Scene3D.pulseLights(0xFFC400); },
      note: 'Lee los cuatro nombres en voz alta, uno por uno, con pausa. No agregues comentario. Deja diez segundos de silencio antes de avanzar.'
    },

    {
      id: 'poll-causa', chapter: 'Línea de Vida', cam: 'wide', mood: 'warn', speed: 0, anim: 'enter',
      vote: true, question: '¿Cuál fue la falla raíz del siniestro?',
      html: () => `
        <div class="panel accent-orange pad w-md mx">
          <div class="kicker c-orange">Análisis clínico inicial</div>
          <h2 class="title" style="margin-top:.5rem">¿Cuál fue el error que se cometió para llegar a esto?</h2>
          <p class="lede">La telemetría descarta falla de mantenimiento: los servicios estaban vigentes. El operador no tenía reportes previos.</p>
        </div>`,
      choices: [
        { key: 'A', label: 'Falla mecánica imprevisible', hint: 'Nada pudo anticiparse', tone: 'bad', cost: 12000,
          verdict: 'La telemetría descarta la falla mecánica. Atribuirla al azar es la forma más cara de no aprender: cierra la investigación antes de encontrar la causa.' },
        { key: 'B', label: 'Exceso de confianza en ruta', hint: 'El operador se relajó', tone: 'mid', cost: 5000, xp: 30,
          verdict: 'Es un síntoma, no la causa. El exceso de confianza no nace en la carretera: se autoriza en el patio cuando nadie corrige la primera desviación.' },
        { key: 'C', label: 'Se firmó sin verificar, bajo presión de patio', hint: 'La validación se dio por hecha', tone: 'good', xp: 120, flag: 'diagnosticoCorrecto',
          verdict: 'Vamos a descubrir juntos qué pasó exactamente. Toda la cadena de fallas nace en el proceso formativo, y hoy tu experiencia nos va a ayudar a reconstruirla. Hoy vas a estar del otro lado de esa firma.' }
      ],
      note: 'Si el grupo elige A o B, no los corrijas de inmediato: pregunta "¿y qué tuvo que pasar antes para que eso fuera posible?".'
    },

    {
      id: 'linea-vida', chapter: 'Línea de Vida', cam: 'crash', mood: 'danger', speed: 0.2, anim: 'enter',
      build: 'lifeline',
      html: () => '',
      note: 'No avances tú. Pide a un participante distinto que presione "Retroceder" en cada paso y que lea la tarjeta en voz alta. Después de cada nodo pregunta: ¿quién en esta sala ocupa ese puesto?'
    },

    {
      id: 'veredicto-linea', chapter: 'Línea de Vida', cam: 'wide', mood: 'warn', speed: 0, anim: 'left',
      html: (S) => {
        const ok = !!S.flags.diagnosticoCorrecto;
        return `
        <div class="panel pad w-md mx accent-${ok ? 'cyan' : 'orange'}">
          <div class="kicker c-${ok ? 'cyan' : 'orange'}">Contraste con el diagnóstico del grupo</div>
          <h2 class="title" style="margin-top:.5rem">${ok ? 'El grupo lo vio antes que el expediente' : 'El expediente contradijo al grupo'}</h2>
          ${media('videos/veredicto-linea.mp4', 'Reconstrucción de los seis avisos ignorados')}
          <p class="lede">${ok
            ? 'Señalaron la validación flexible en patio antes de ver la línea de tiempo. Ese instinto es exactamente la competencia que este curso viene a convertir en hábito medible.'
            : 'El grupo apuntó a la carretera y la carretera solo ejecutó lo que el patio autorizó. No es un error del grupo: es el sesgo natural de toda la industria y por eso el curso empieza aquí.'}</p>
          <div class="grid-3" style="margin:1.6rem 0">
            <div class="stat"><h4>Días de aviso</h4><div class="v num c-amber">92</div></div>
            <div class="stat"><h4>Puntos de corte perdidos</h4><div class="v num c-amber">6</div></div>
            <div class="stat"><h4>Personas que pudieron parar</h4><div class="v num c-red">5</div></div>
          </div>
          <p class="fam-note">Ningún siniestro grave nace de un solo error. Nace de seis avisos ignorados y de una firma que los volvió legales.
          <strong class="c-cyan">A partir de aquí, esa firma es la tuya.</strong></p>
        </div>`;
      },
      note: 'Si el grupo acertó, refuerza sin celebrar. Si falló, protege al grupo: el sesgo es de la industria, no de ellos.'
    },

    {
      id: 'el-culpable', chapter: 'Línea de Vida', cam: 'lowfront', mood: 'danger', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel accent-red pad w-md mx brackets c-red">
          <div class="kicker c-red">T–92 días · 07:12 h · origen de la cadena causal</div>
          <h2 class="title glow-red" style="margin:.5rem 0 1.3rem">El Origen</h2>
          <div class="doc">
            <div class="doc-h">
              <b>Validación de competencias del operador</b>
              <span>Folio VC-0912</span>
            </div>
            <div class="doc-rows">
              <div class="doc-row"><span>Operador evaluado</span><b>Arnulfo “el Borras” Peña</b></div>
              <div class="doc-row"><span>Configuración autorizada</span><b>Full doble remolque</b></div>
              <div class="doc-row bad"><span>Duración de la evaluación</span><b>4 minutos</b></div>
              <div class="doc-row bad"><span>Evaluación práctica en unidad</span><b>No realizada</b></div>
              <div class="doc-row bad"><span>Verificación de frenos de aire</span><b>Omitida</b></div>
              <div class="doc-row"><span>Dictamen emitido</span><b>Competente</b></div>
            </div>
            <div class="doc-sig">
              <div class="lbl">Firma de validación</div>
              <svg class="sig-svg" viewBox="0 0 340 96" aria-label="Firma manuscrita">
                <path d="M14 70 C34 22, 52 16, 58 40 C64 64, 48 78, 44 62 C40 46, 62 30, 82 52 C96 68, 108 56, 112 38 C116 20, 130 22, 132 44 C134 64, 148 66, 158 48 C168 30, 184 28, 188 50 C192 70, 208 72, 220 52 C232 32, 252 30, 258 52 C263 70, 278 66, 292 44 C300 31, 312 30, 322 40"/>
                <path d="M96 82 C142 74, 214 72, 286 78"/>
              </svg>
              <div class="doc-line">Instructor responsable de la validación</div>
            </div>
            <div class="doc-stamp">Cadena rota aquí</div>
          </div>
          ${media('videos/el-culpable.mp4', 'Reconstrucción de la validación de 4 minutos')}
          <p class="lede" style="margin-top:1.6rem;font-size:clamp(1.05rem,1.9vw,1.35rem)">
            El culpable no iba manejando esa noche. El culpable <strong class="c-red">firmó</strong>, noventa y dos días antes,
            en un patio tranquilo, con prisa y sin mala intención.
          </p>
        </div>`,
      onEnter: (ctx) => { w.Scene3D.impact(0.5); w.Audio3D && w.Audio3D.hit(); },
      note: 'Deja que la firma se dibuje completa antes de hablar. Cuando caiga el sello, pregunta: "¿cuántas validaciones firmaron ustedes esta semana y cuántas duraron más de cuatro minutos?".'
    },
    {
      title: 'Fase 2 · Ahora firmas tú', id: 'fase-2', chapter: 'Patio', cam: 'lowfront', mood: 'safe', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel pad w-md mx phase brackets c-cyan accent-cyan">
          <div class="pn c-cyan">02</div>
          <div class="pt">Ahora firmas tú</div>
          <p class="lede" style="margin-top:1.1rem">Retrocedemos los noventa y dos días completos. Mismo patio, misma unidad, misma presión de despacho,
          mismo operador vivo esperando tu dictamen. La diferencia es que esta vez
          <strong class="c-cyan">el expediente lo escribes tú</strong>.</p>
          <div class="grid-3" style="margin-top:1.8rem">
            <div class="stat"><h4>Presupuesto de ruta</h4><div class="v c-cyan num">$80,000</div></div>
            <div class="stat"><h4>Decisiones críticas</h4><div class="v num">13</div></div>
            <div class="stat"><h4>Desenlaces posibles</h4><div class="v num">6</div></div>
          </div>
          <div class="steps">
            <span>1 · Auditoría forense</span><span>2 · Cinco estaciones</span><span>3 · Ruta y desenlace</span><span>4 · Dictamen</span>
          </div>
          <p class="lede" style="margin-top:1.5rem;font-size:.95rem;opacity:.68">Desde aquí cada decisión cuesta dinero, cambia el estado físico de la unidad y queda registrada en tu dictamen individual.</p>
        </div>`,
      onEnter: () => { w.Scene3D.pulseLights(0xFB6500); },
      note: 'Aquí cambia la energía del aula. Sube la luz, pide que se sienten derechos. Frase de entrada: "la Fase 1 fue de alguien más; la Fase 2 es de ustedes".'
    },

    /* ============ AUDITORÍA FORENSE (INICIO DE LA CADENA) ============ */
    {
      id: 'patio-brief', chapter: 'Patio', cam: 'top', mood: 'warn', speed: 0, anim: 'enter',
      html: (S) => `
        <div class="panel accent-cyan pad w-md mx brackets c-cyan" style="text-align:center">
          <div style="width:56px;height:56px;color:var(--cyan);margin:0 auto .9rem">${I('scan')}</div>
          <div class="kicker">05:40 h · Patio de maniobras · Antes de que todo ocurra</div>
          <h2 class="title glow-cyan" style="margin-top:.6rem">Auditoría Forense de Patio</h2>
          <p class="lede">El Full está cargado y el operador espera la liberación. Tienes el escáner 3D y <strong>tres fallas ocultas</strong> que localizar.</p>
          <p class="lede"><strong class="c-amber">Esta es la decisión que determina todo lo demás.</strong> Lo que liberes aquí viajará contigo 640 kilómetros.</p>
          <button class="btn" data-act="forensic" style="margin-top:1.2rem">${I('scan')} Iniciar escáner 3D holográfico</button>
          <p class="lede ${S.forensicDone ? '' : 'hidden'}" id="forensic-done" style="margin-top:1rem;color:var(--green)">Auditoría registrada. Continúa con → para revisar el dossier.</p>
        </div>`,
      note: 'Entrega el control a un participante distinto para cada hallazgo. Pide que argumente en voz alta antes de decidir.'
    },

    {
      id: 'dossier', chapter: 'Patio', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter',
      html: (S) => {
        const map = { tires: ['Presión de llantas', 'gauge'], brakes: ['Frenos de aire (dolly)', 'brake'], kingpin: ['Quinta rueda / perno rey', 'link'] };
        const rows = Object.keys(map).map(k => {
          const st = S.truck[k];
          const c = st === 'ok' ? 'c-green' : st === 'fault' ? 'c-red' : 'c-dim';
          const txt = st === 'ok' ? 'CORREGIDO EN TALLER' : st === 'fault' ? 'LIBERADO CON FALLA' : 'NO AUDITADO';
          return `<div class="dossier-row"><span>${map[k][0]}</span><b class="${c}">${txt}</b></div>`;
        }).join('');
        const faults = w.State.partsFaulty().length;
        const auditada = Object.keys(map).some(k => S.truck[k] !== 'pending');
        const verdict = !auditada
          ? '<span class="c-amber">La unidad sale sin auditoría documentada. No sabes qué llevas: cada anomalía no vista viaja contigo 640 km.</span>'
          : faults === 0
          ? '<span class="c-green">La unidad sale del patio en condición íntegra. Has cortado la cadena causal en su origen.</span>'
          : `<span class="c-red">La unidad sale con ${faults} falla${faults > 1 ? 's' : ''} activa${faults > 1 ? 's' : ''}. Estas fallas no desaparecen: esperan el kilómetro adecuado para cobrarse.</span>`;
        return `
        <div class="panel pad w-md mx">
          <div class="kicker">Dossier de despacho · Estado real de la unidad</div>
          <h2 class="title" style="margin-top:.5rem">Lo que sale a la carretera</h2>
          <div class="dossier" style="margin:1.2rem 0">${rows}</div>
          <p class="lede">${verdict}</p>
        </div>`;
      },
      onEnter: (ctx, S) => { w.Scene3D.mood(w.State.partsFaulty().length ? 'danger' : 'safe'); }
    },

    /* ============ ESTACIÓN 1 ============ */
    {
      title: 'Recorrido de la unidad', id: 'explorador', chapter: 'Patio', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter',
      build: 'parts',
      notes: 'Deja que el grupo elija por dónde empezar. Cuando alguien salte una parte, no lo corrijas: pregúntale al final qué se le fue. La unidad completa son 18 puntos y el recorrido se acredita solo cuando los ve todos.'
    },

    {
      id: 'evidencia-patio', chapter: 'Patio', cam: 'trailer', mood: 'warn', speed: 0, anim: 'left',
      html: () => `
        <div class="panel accent-orange pad w-lg mx" style="text-align:center">
          <div class="kicker c-orange">Evidencia de audio · Interacción real bajo presión</div>
          <h2 class="title" style="margin-top:.5rem">"Hazme el favor, ya vamos tarde"</h2>
          ${media('videos/evidencia-patio.mp4', 'Interacción operador–instructor en patio')}
        </div>`,
      note: 'Pregunta: ¿cuántas veces esta semana escucharon esa frase exacta? Ahí vive el riesgo.'
    },

    /* ============ MARCO ============ */
    {
      id: 'competencias', chapter: 'Marco', cam: 'cabin', mood: 'normal', speed: 0, anim: 'left',
      html: () => `
        <div class="panel accent-cyan pad w-md mx brackets c-cyan">
          <div class="kicker">Perfil del instructor TM</div>
          <h2 class="title" style="margin-top:.5rem">No eres un firmante de papeles</h2>
          <p class="lede">Un instructor certificado no transmite datos: <strong class="c-cyan">audita condiciones físico-mecánicas, regula el estrés operativo y sostiene el criterio bajo presión comercial.</strong></p>
          <div class="grid-3" style="margin-top:1.6rem">
            <div class="stat"><h4>Auditor técnico</h4><p class="lede" style="font-size:.95rem;margin:0">Verifica lo que el operador afirma. La palabra no sustituye a la medición.</p></div>
            <div class="stat"><h4>Regulador humano</h4><p class="lede" style="font-size:.95rem;margin:0">Absorbe la presión de despacho para que no llegue al volante.</p></div>
            <div class="stat"><h4>Última muralla</h4><p class="lede" style="font-size:.95rem;margin:0">Es el único con autoridad para detener una operación en marcha.</p></div>
          </div>
        </div>`
    },

    ,

    /* ============ MARCO · METODOLOGÍA UDAT ============ */
    {
      id: 'udat', chapter: 'Marco', cam: 'cabin', mood: 'normal', speed: 0, anim: 'left',
      html: () => `
        <div class="panel accent-cyan pad w-lg mx brackets">
          <div class="kicker c-cyan">Metodología UDAT · marco de formación</div>
          <h2 class="title">Cuatro competencias, no cuatro temas</h2>
          <p class="lede" style="margin-bottom:.4rem">Un operador no falla por no saber. Falla porque una de estas cuatro dimensiones estaba apagada en el momento exacto. La taxonomía <strong class="c-cyan">PIEL</strong> te da el lenguaje para nombrarlo.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1.1rem">Toca cada letra para abrirla.</p>
          <div class="rv-set c4" data-set="piel">
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">P</div>
              <div class="rv-t">Pensar</div>
              <div class="rv-s">Anticipar riesgos</div>
              <div class="rv-body">
                <p>Calcular antes de que sea urgente: distancia de frenado, ventana de descanso, clima en el kilómetro 300.</p>
                <p><em>Se enseña</em> obligando a decir el número en voz alta, no la intención.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">I</div>
              <div class="rv-t">Interactuar</div>
              <div class="rv-s">Observar para actuar</div>
              <div class="rv-body">
                <p>Leer el entorno y a las personas: el auto que titubea, el despachador que presiona, el compañero que oculta una falla.</p>
                <p><em>Se enseña</em> pidiendo interpretación, no descripción: "¿qué va a hacer ese carro?".</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--orange)">
              <div class="rv-let">E</div>
              <div class="rv-t">Ejecutar</div>
              <div class="rv-s">Dominar procesos</div>
              <div class="rv-body">
                <p>La maniobra técnica hecha bien bajo carga: tirón de prueba, descenso con motor, acoplamiento verificado.</p>
                <p><em>Se enseña</em> con las manos del operador, nunca con las tuyas.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">L</div>
              <div class="rv-t">Liderar</div>
              <div class="rv-s">Decidir con profesionalismo</div>
              <div class="rv-body">
                <p>Sostener la decisión correcta cuando cuesta dinero, tiempo o incomodidad frente a un superior.</p>
                <p><em>Se enseña</em> respaldando públicamente al que se detuvo.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
          <p class="lede" style="margin-top:1.2rem;font-size:.92rem;opacity:.8">El folio VC-0912 no falló en <strong>E</strong>: el Borras sabía operar. Falló en <strong class="c-green">L</strong>, y nadie se lo había enseñado nunca.</p>
        </div>`,
      notes: 'No expliques las cuatro letras: haz que el grupo las abra. Al cerrar, pregunta en cuál de las cuatro falló el caso de la Fase 1 y deja que discutan. La respuesta es L.'
    },
    {
      title: 'Taxonomía PIEL aplicada', id: 'piel-aplicado', chapter: 'Marco', cam: 'hood', mood: 'warn', speed: 0.4, anim: 'enter',
      build: 'piel',
      notes: 'Ejercicio de lenguaje común. Si el instructor no sabe nombrar la competencia, su retroalimentación se queda en "hazlo bien". Insiste: la clasificación correcta es la que permite diseñar el ejercicio de refuerzo.'
    },
    {
      id: 'andragogia', chapter: 'Marco', cam: 'wide', mood: 'normal', speed: 0, anim: 'right',
      html: () => `
        <div class="panel pad w-sm mx" style="text-align:center">
          <div style="width:56px;height:56px;color:var(--cyan);margin:0 auto 1rem">${I('brain')}</div>
          <h2 class="title">¿Cómo aprende un adulto?</h2>
          <p class="lede">El adulto rechaza la teoría abstracta. Necesita <strong class="c-cyan">relevancia inmediata, experimentación guiada y consecuencia visible.</strong></p>
          <p class="lede" style="opacity:.8">Por eso a partir de aquí no hay diapositivas que leer: hay una unidad que auditar, un operador que acompañar y un presupuesto que puedes destruir.</p>
        </div>`,
      note: 'Aquí cambia el contrato con el grupo: de espectadores a operadores. Dilo explícitamente.'
    },

    /* ============ FASE 2 · SIMULADOR ============ */

    /* ============ MARCO · LOGRAR EL CAMBIO REAL ============ */
    {
      id: 'cambio-real', chapter: 'Marco', cam: 'wide', mood: 'normal', speed: 0, anim: 'right',
      html: () => `
        <div class="panel accent-cyan pad w-lg mx brackets">
          <div class="kicker c-cyan">Cómo se logra un cambio que dura</div>
          <h2 class="title">Informar no cambia a nadie</h2>
          <p class="lede" style="margin-bottom:.4rem">Un operador no modifica una conducta porque le dijeron que estaba mal. La modifica cuando se juntan tres condiciones. Si falta una, la conducta regresa en dos semanas.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1.1rem">Toca cada condición.</p>
          <div class="rv-set c3" data-set="cambio">
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">01</div>
              <div class="rv-t">Motivación interna</div>
              <div class="rv-s">Que le importe a él</div>
              <div class="rv-body">
                <p>El operador tiene que encontrar su propia razón. La tuya no le sirve. La de la empresa, menos.</p>
                <p><em>Se activa</em> preguntando por lo que sí valora: su casa, sus hijos, su licencia, su nombre en el patio.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">02</div>
              <div class="rv-t">Avance progresivo</div>
              <div class="rv-s">Un escalón a la vez</div>
              <div class="rv-body">
                <p>Nadie cambia doce hábitos el lunes. Se elige uno, se practica hasta que deja de costar, y hasta entonces sigue el siguiente.</p>
                <p><em>Se activa</em> definiendo un solo compromiso medible por semana.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">03</div>
              <div class="rv-t">Soporte activo</div>
              <div class="rv-s">Que no esté solo</div>
              <div class="rv-body">
                <p>El hábito nuevo es frágil. Si nadie lo acompaña las primeras semanas, la presión del patio lo borra.</p>
                <p><em>Se activa</em> con seguimiento en fechas fijas, no con la promesa de estar disponible.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
        </div>`,
      notes: 'Pregunta directa al grupo: de las tres, ¿cuál es la que su empresa nunca da? Casi siempre responden soporte activo. Ese es el hallazgo del bloque.'
    },
    {
      title: 'Ciclo del aprendizaje real', id: 'ciclo', chapter: 'Marco', cam: 'cabin', mood: 'normal', speed: 0, anim: 'enter',
      build: 'ciclo',
      notes: 'Este orden no es negociable. La mayoría de los instructores empieza en simulación y termina en conexión, y por eso el operador practica sin saber para qué.'
    },
    {
      id: 'retro-empatia', chapter: 'Estación 2', cam: 'wide', mood: 'normal', speed: 0, anim: 'right',
      html: () => `
        <div class="panel accent-green pad w-lg mx brackets">
          <div class="kicker c-green">Herramientas del instructor</div>
          <h2 class="title">Retroalimentar sin romper el vínculo</h2>
          ${media('videos/retro-pablo-lelluvia.mp4', 'Pablo Lelluvia retroalimenta a un operador con actitud defensiva, sin perder el vínculo')}
          <p class="lede" style="margin-bottom:.4rem">Antes de pararte frente a un operador con malos hábitos necesitas dos secuencias. No son consejos: son un orden que no se puede invertir.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1rem">Toca cada paso.</p>
          <div class="rv-s" style="margin-bottom:.5rem">Retroalimentación efectiva</div>
          <div class="rv-set c3" data-set="retro">
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">1</div>
              <div class="rv-t">Empieza por lo que sostiene</div>
              <div class="rv-s">Reconocimiento real</div>
              <div class="rv-body">
                <p>Nombra un acierto verificable suyo. No es cortesía: baja la defensa para que lo siguiente entre.</p>
                <p><em>Trampa:</em> el elogio genérico ("vas bien") se lee como preámbulo de regaño y produce el efecto contrario.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">2</div>
              <div class="rv-t">Sé específico con datos</div>
              <div class="rv-s">Hechos, no adjetivos</div>
              <div class="rv-body">
                <p>"El martes saliste con 78 psi en el eje 3" se puede discutir con evidencia. "Eres descuidado" solo se puede pelear.</p>
                <p><em>Regla:</em> fecha, dato, consecuencia. En ese orden.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">3</div>
              <div class="rv-t">Cierra con plan de acción</div>
              <div class="rv-s">Qué, cómo y cuándo</div>
              <div class="rv-body">
                <p>Una conversación sin acuerdo verificable es desahogo. Define la conducta, la forma de comprobarla y la fecha.</p>
                <p><em>Y que lo diga él.</em> El compromiso que verbaliza el operador se cumple; el que impones se negocia.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
          <div class="rv-s" style="margin:1.2rem 0 .5rem">Persuadir con empatía · cuando hay resistencia</div>
          <div class="rv-set c3" data-set="empatia">
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">1</div>
              <div class="rv-t">Escucha activamente</div>
              <div class="rv-s">Primero su versión</div>
              <div class="rv-body">
                <p>Deja que explique por qué lo hace así. Casi siempre hay una razón operativa real detrás del mal hábito.</p>
                <p><em>Si no la conoces</em>, tu corrección ataca un síntoma y el hábito regresa el lunes.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">2</div>
              <div class="rv-t">El cambio es protección</div>
              <div class="rv-s">No es castigo</div>
              <div class="rv-body">
                <p>Enmarca la norma como lo que le cuida la licencia, el patrimonio y el regreso a casa. No como lo que la empresa exige.</p>
                <p><em>Frase útil:</em> "esto no es para que no te multen, es para que no lo pagues tú".</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--orange)">
              <div class="rv-let">3</div>
              <div class="rv-t">Construye ganar-ganar</div>
              <div class="rv-s">Beneficio mutuo explícito</div>
              <div class="rv-body">
                <p>Que quede claro qué gana él: menos desgaste, menos reportes, bono íntegro, menos tiempo en retén.</p>
                <p><em>Si solo gana la empresa</em>, cumple mientras lo ves.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
        </div>`,
      notes: 'Estas seis piezas son el kit que van a usar en la micro-clase de la siguiente escena. Pide que anoten las dos secuencias antes de avanzar: se les van a olvidar en cuanto tengan al operador enfrente.'
    },
    {
      id: 'micro-brief', chapter: 'Estación 2', cam: 'cabin', mood: 'warn', speed: 0, anim: 'left',
      html: () => `
        <div class="panel accent-amber pad w-lg mx brackets c-amber">
          <div class="kicker c-amber">Estación 2 · Factor humano</div>
          <h2 class="title">Saber no es enseñar</h2>
          <p class="lede">Acabas de recorrer los 18 puntos de la unidad y sabes exactamente qué se revisa en cada uno.
          Eso te vuelve un buen técnico. No te vuelve todavía un instructor.</p>
          <p class="lede">El folio VC-0912 no lo firmó alguien que ignorara el procedimiento. Lo firmó alguien que lo sabía
          <strong class="c-red">y no logró transferirlo</strong>. La diferencia entre esas dos cosas es lo que se evalúa a continuación.</p>
          <div class="grid-3" style="margin-top:1.6rem">
            <div class="stat"><h4>Operadores disponibles</h4><div class="v c-cyan num">3</div></div>
            <div class="stat"><h4>Momentos a diseñar</h4><div class="v num">4</div></div>
            <div class="stat"><h4>Tiempo de clase</h4><div class="v c-amber num">3:00</div></div>
          </div>
          <p class="lede" style="margin-top:1.4rem;opacity:.75;font-size:.94rem">Se evalúa el diseño andragógico de tu intervención (60%) y lo que el grupo observa cuando la impartes de verdad (40%).</p>
        </div>`,
      notes: 'Aquí se cambia el chip. Hasta ahora auditaron una unidad; ahora los audita el grupo a ellos. Pide que el participante realmente se pare y hable: el ejercicio pierde todo si solo se hace mentalmente.'
    },
    {
      title: 'Micro-clase en piso', id: 'microclase', chapter: 'Estación 2', cam: 'follow', mood: 'normal', speed: 0, anim: 'enter',
      build: 'microclase',
      notes: 'Elige un voluntario para hacer de operador. El resto del grupo marca la rúbrica en tiempo real, tú no. Al terminar, la primera pregunta es siempre para el que hizo de operador: "¿te dieron ganas de cambiar?".'
    },
    {
      title: 'Ingeniería del estrés', id: 'ing-estres', chapter: 'Estación 2', cam: 'follow', mood: 'warn', speed: 0.5, anim: 'left',
      build: 'estres',
      notes: 'Aquí suelen resistirse: "no quiero estresar a mi gente". Aclara que el estrés ya existe en la carretera; lo único que decides es si aparece por primera vez contigo o solo cuando ya no puedes ayudarlo.'
    },
    {
      id: 'pc-06', chapter: 'Estación 2', cam: 'axle', mood: 'warn', speed: 0, anim: 'right', vote: true, question: 'El Borras se va a equivocar frente al grupo: ¿qué haces?',
      html: () => `
        <div class="panel accent-amber pad w-md mx brackets c-amber">
          <div class="kicker c-amber">Punto de control 06 · rol del instructor</div>
          <h2 class="title" style="margin-top:.5rem">Se va a equivocar frente a ti</h2>
          <p class="lede">Simulacro de acoplamiento en patio cerrado. El operador acopla y se dispone a salir <strong class="c-red">sin hacer el tirón de prueba</strong>. No hay riesgo inmediato: el patio está despejado y vas a bordo.</p>
          <p class="lede" style="opacity:.8">Tienes tres segundos para decidir qué tipo de instructor eres.</p>
        </div>`,
      choices: [
        { key: 'A', label: 'Tomar el volante y detener la unidad tú', hint: 'Corriges el riesgo de inmediato', tone: 'bad', cost: 2500, driver: { trust: -12, stress: 10 }, flag: 'intervinoFisico',
          verdict: 'Salvaste el ejercicio y perdiste la lección. Cuando el instructor pone las manos, el operador aprende que alguien más lo va a atrapar. En carretera no hay nadie en ese asiento.' },
        { key: 'B', label: 'Dejarlo salir y reclamarle después', hint: 'Que sienta la consecuencia completa', tone: 'mid', cost: 1500, driver: { trust: -4 }, xp: 20,
          verdict: 'Tienes evidencia, pero la conseguiste a costa de un desacople posible en patio. La falla inducida debe degradar el escenario, no ponerlo en riesgo real.' },
        { key: 'C', label: 'Preguntar: "¿qué te falta antes de mover?"', hint: 'Inducir la decisión sin darla', tone: 'good', cost: 0, xp: 150, driver: { trust: 14, stress: -4 }, flag: 'indujoDecision',
          verdict: 'Correcto. La pregunta devuelve la responsabilidad al operador y deja intacto el aprendizaje. El instructor no evita el error: lo convierte en el momento donde se decide bien.' }
      ],
      note: 'Este es el punto donde se separa el capacitador del acompañante. Pregunta al grupo cuántos hubieran tomado el volante: casi todos. Ese reflejo es el que hay que desmontar.'
    },
    {
      id: 'est-1', chapter: 'Estación 1', cam: 'trailer', mood: 'warn', speed: 0, anim: 'left', vote: true, question: 'La carta porte no cuadra: ¿qué decides?',
      html: () => `
        <div class="panel accent-orange pad w-md mx">
          <div class="kicker c-orange">Estación 1 de 5 · Patio, normatividad y activos</div>
          <h2 class="title" style="margin-top:.5rem">La Carta Porte No Cuadra</h2>
          <p class="lede">La báscula marca <strong>28.4 t</strong>; la carta porte declara <strong>26.0 t</strong>. Despacho responde por radio: "así la mandó el cliente, no le muevas". El retén de la Guardia Nacional está a 90 km.</p>
          ${mods(['Marco normativo SCT y Ley de Caminos', 'Inspección físico-mecánica avanzada', 'Auditoría de carga, pesos y dimensiones', 'Custodia y cuidado de activos'])}
        </div>`,
      choices: [
        { key: 'A', label: 'Salir con el documento como está', hint: 'Es responsabilidad del cliente, no tuya', tone: 'bad', cost: 9000, driver: { stress: 12, trust: -10 }, flag: 'firmoPresion',
          verdict: 'La responsabilidad solidaria del transportista no se delega por radio. Sobrepeso no declarado: multa federal y, si hubiera siniestro, la aseguradora tiene causal de rechazo.' },
        { key: 'B', label: 'Corregir el documento sin volver a pesar', hint: 'Ajustar el número y avanzar', tone: 'mid', cost: 3000, driver: { stress: 5 }, xp: 20,
          verdict: 'Resuelves el papel, no el hecho. Si el peso real difiere del corregido, falsificaste un documento oficial en lugar de cometer un error administrativo.' },
        { key: 'C', label: 'Re-pesar, documentar y escalar al cliente', hint: 'Cuesta tiempo, protege a todos', tone: 'good', cost: 1200, xp: 140, driver: { trust: 10, stress: -5 },
          verdict: 'Correcto. Perdiste 40 minutos y $1,200 de estadía. Evitaste una multa federal, una causal de rechazo de seguro y le enseñaste al operador dónde está la línea.' }
      ],
      note: 'Estación 1 cubre 4 módulos normativos. Si eligen C, subraya que la decisión correcta SÍ tuvo costo: el liderazgo no es gratis, es barato.'
    },

    {
      id: 'f1', chapter: 'Estación 1', cam: 'axle', mood: 'normal', speed: 0.3, anim: 'right',
      html: () => `
        <div class="panel accent-cyan pad w-lg mx" style="text-align:center">
          <div class="kicker">Referencia de estándar</div>
          <h2 class="title" style="margin-top:.5rem">Velocidad Con Proceso</h2>
          <p class="lede">En Fórmula 1 nadie improvisa por ir tarde. Van rápido <strong class="c-cyan">porque</strong> el proceso es inviolable, no a pesar de él.</p>
          ${media('videos/f1.mp4', 'Sincronía de pits como estándar de proceso')}
        </div>`
    },

    /* ============ ESTACIÓN 2 ============ */
    {
      id: 'est-2', chapter: 'Estación 2', cam: 'cabin', mood: 'warn', speed: 0, anim: 'left', vote: true, question: 'El operador no durmió: ¿lo dejas salir a ruta?',
      html: () => `
        <div class="panel pad w-md mx">
          <div class="kicker c-cyan">Estación 2 de 5 · Factor humano</div>
          <h2 class="title" style="margin-top:.5rem">El Operador Que No Durmió</h2>
          <p class="lede">Tres meses de antigüedad. Llega evasivo, con los ojos irritados; afirma que descansó ocho horas. Su prueba de reacción salió en rango rojo y su compañero comenta que anduvo de mudanza toda la noche. Cuando le preguntas, se pone a la defensiva delante de tres compañeros.</p>
          ${mods(['Psicología del operador de quinta rueda', 'Inteligencia emocional del capacitador', 'Manejo de objeciones y resistencia', 'Comunicación asertiva operativa', 'Prevención de adicciones y salud ocupacional'])}
        </div>`,
      choices: [
        { key: 'A', label: 'Sancionarlo ahí mismo, frente a todos', hint: 'Que sirva de ejemplo', tone: 'bad', driver: { trust: -28, stress: 22 }, cost: 0,
          verdict: 'Ganaste obediencia y perdiste información. A partir de hoy este operador te va a ocultar exactamente lo que necesitas saber para protegerlo.' },
        { key: 'B', label: 'Anotarlo en bitácora y dejarlo salir', hint: 'Queda documentado', tone: 'mid', driver: { fatigue: 18, trust: -6 },
          verdict: 'La bitácora te protege legalmente a ti, no protege al operador ni a la unidad. Documentar un riesgo sin mitigarlo es administrarlo, no gestionarlo.' },
        { key: 'C', label: 'Entrevista 1:1, escucha activa, decisión conjunta', hint: 'Apartarlo del grupo y preguntar de verdad', tone: 'good', xp: 150, driver: { trust: 22, stress: -12, fatigue: -6 },
          verdict: 'Correcto. Al sacarlo del escenario público desactivaste la defensa. Reconoció el desvelo y aceptó salir dos horas después. Eso es andragogía aplicada bajo presión.' }
      ],
      note: 'Momento clave del curso. Pregunta al grupo: ¿por qué el operador mintió? Respuesta: porque decir la verdad le costaba el viaje.'
    },

    /* ============ RUTA ============ */
    {
      id: 'ruta-inicio', chapter: 'Ruta', cam: 'follow', mood: 'normal', speed: 1, anim: 'enter',
      html: (S) => `
        <div class="panel accent-cyan pad w-sm to-left brackets c-cyan">
          <div class="kicker">Km 0 · Salida autorizada</div>
          <h2 class="title" style="margin-top:.5rem">La Ruta Comienza</h2>
          ${media('videos/ruta-inicio.mp4', 'La presión de la ventana de entrega crece kilómetro a kilómetro')}
          <p class="lede">640 kilómetros por delante. Presupuesto disponible: <strong class="c-cyan num">${money(S.budget)}</strong>.</p>
          <p class="lede" style="opacity:.8">Desde aquí, la unidad ya no responde a lo que digas: responde a lo que decidiste.</p>
        </div>`,
      onEnter: (ctx) => { ctx.engine(true); }
    },

    /* ============ ESTACIÓN 3 ============ */
    {
      id: 'est-3', chapter: 'Estación 3', cam: 'lowfront', mood: 'warn', speed: 1.2, anim: 'right', vote: true, question: 'Km 320, la telemetría habla: ¿qué haces?',
      html: (S) => `
        <div class="panel accent-orange pad w-md mx">
          <div class="kicker c-orange">Estación 3 de 5 · Fatiga y ritmo de ruta</div>
          <h2 class="title" style="margin-top:.5rem">Km 320 · La Telemetría Habla</h2>
          <p class="lede">Samsara reporta <strong>4 desviaciones de carril en 40 minutos</strong> y <strong>9 h 40 min</strong> de conducción acumulada. Faltan 260 km y el cliente exige llegada en 2 horas. Fatiga estimada del operador: <strong class="num ${S.driver.fatigue > 60 ? 'c-red' : S.driver.fatigue >= 40 ? 'c-amber' : 'c-green'}">${S.driver.fatigue}%</strong>.</p>
          ${mods(['Control de fatiga y microsueños', 'Conducción defensiva en Fulles', 'Lectura de telemetría (Samsara / Geotab)'])}
        </div>`,
      choices: [
        { key: 'A', label: 'Que continúe, ya casi llega', hint: 'Cumplir la ventana del cliente', tone: 'bad', driver: { fatigue: 30, stress: 22 },
          verdict: 'Cuatro desviaciones de carril en 40 minutos es la firma de un microsueño en formación. Acabas de convertir una alerta en un pronóstico.' },
        { key: 'B', label: 'Relevo de operador en el siguiente CEDIS', hint: 'Cuesta $4,500 y 2 horas', tone: 'good', cost: 4500, xp: 160, driver: { fatigue: -38, stress: -6 },
          verdict: 'Correcto y caro, en ese orden. $4,500 contra una unidad de $2.4 millones y una vida. La ventana del cliente se renegocia; un microsueño no.' },
        { key: 'C', label: 'Parada obligatoria de 45 min y renegociar', hint: 'Descanso corto y llamada al cliente', tone: 'mid', cost: 2000, xp: 90, driver: { fatigue: -16, stress: -10 },
          verdict: 'Mitigas parcialmente. 45 minutos recuperan reflejos, no horas de sueño. Aceptable si el relevo era inviable, insuficiente si solo era incómodo.' }
      ]
    },

    /* ============ EVENTOS CONDICIONALES DE RUTA ============ */
    routeEvent({
      id: 'ev-tires', title: 'Estallido térmico en eje motriz', cam: 'axle', amount: (S) => S.driver.fatigue > 55 ? 46000 : 19000,
      when: (S) => S.truck.tires === 'fault',
      body: (S) => `El dual interior que liberaste a 62 psi acumuló temperatura durante 4 horas de rodado continuo. Reventó a 95 km/h${S.driver.fatigue > 55 ? ', y con el operador en fatiga alta la corrección de volante llegó tarde: daño en costado del primer remolque.' : '. El operador controló la unidad y la orilló sin daños mayores.'}`,
      trace: 'Trazabilidad: Auditoría de patio → llanta liberada con presión fuera de norma.',
      effect: (S) => { w.State.driver({ stress: 18 }); }
    }),

    routeEvent({
      id: 'ev-brakes', title: 'Pérdida de aire en descenso', cam: 'dolly', amount: (S) => S.driver.fatigue > 55 ? 96000 : 58000,
      when: (S) => S.truck.brakes === 'fault',
      body: () => 'La manguera de servicio del dolly cedió por completo en la bajada. El segundo remolque perdió capacidad de frenado y empujó al conjunto. El operador logró usar la rampa de emergencia, pero el dolly y el tren trasero quedaron inservibles.',
      trace: 'Trazabilidad: Auditoría de patio → fuga neumática detectada y liberada.',
      effect: (S) => { w.State.driver({ stress: 30, fatigue: 10 }); }
    }),

    routeEvent({
      id: 'ev-celular', title: 'Distracción por celular', cam: 'cabin', amount: () => 20000,
      when: (S) => S.driver.stress >= 58,
      body: () => 'Con la ventana de entrega encima, el operador respondió mensajes de despacho en movimiento. Invadió el carril contiguo y derribó el espejo de un vehículo particular.',
      trace: 'Trazabilidad: Estrés operativo elevado por presión de entrega no absorbida por el instructor.',
      effect: (S) => { w.State.driver({ stress: 8 }); }
    }),

    routeEvent({
      id: 'ev-velocidad', title: 'Exceso de velocidad sostenido', cam: 'follow', amount: () => 7500,
      when: (S) => S.driver.stress >= 45 && S.driver.stress < 58,
      body: () => 'La telemetría registra 34 minutos por encima del límite en tramo de curvas. Consumo excedido, desgaste acelerado de balatas y una infracción capturada por radar fijo.',
      trace: 'Trazabilidad: Presión de tiempo trasladada íntegra al volante.',
      video: 'videos/ev-velocidad.mp4'
    }),

    /* Retén: el resultado depende de la confianza construida */
    {
      id: 'ev-reten', chapter: 'Ruta', cam: 'hood', speed: 0.8, anim: 'enter',
      mood: 'warn',
      html: (S) => {
        const bien = S.driver.trust >= 55;
        return `
        <div class="panel ${bien ? 'accent-green' : 'accent-red'} pad w-md mx">
          <div class="kicker ${bien ? 'c-green' : 'c-red'}">Km 480 · Inspección de Guardia Nacional</div>
          <h2 class="title" style="margin-top:.5rem">${bien ? 'Inspección Sin Observaciones' : 'Retén: Actitud Defensiva'}</h2>
          <p class="lede">${bien
            ? 'El operador presenta documentación completa, cinturón puesto y trato institucional. La inspección dura once minutos y termina sin observaciones. La confianza que construiste en patio se convirtió en conducta en carretera.'
            : 'El operador va sin cinturón y responde a la autoridad con la misma actitud defensiva que aprendió contigo en el patio. La inspección se alarga a 90 minutos y termina en infracción.'}</p>
          ${bien ? '<div class="money sev-1 c-green">+150 XP</div>' : cost(7000)}
          <p class="lede" style="margin-top:.9rem;font-size:.95rem;opacity:.75">Trazabilidad: nivel de confianza operador–instructor construido en la Estación 2.</p>
        </div>`;
      },
      onEnter: (ctx, S) => {
        if (S.driver.trust >= 55) { w.State.addXp(150); w.State.note('Inspección federal sin observaciones', 'good'); w.Scene3D.mood('safe'); }
        else { w.State.charge(7000, 'Infracción en retén federal', 'bad'); ctx.damage(); w.Scene3D.mood('danger'); }
      }
    },

    /* ============ ESTACIÓN 4 ============ */
    {
      id: 'est-4', chapter: 'Estación 4', cam: 'hood', mood: 'danger', speed: 0.4, anim: 'impact', vote: true, question: '"No lo reporte, yo lo arreglo": ¿aceptas?',
      html: () => `
        <div class="panel accent-red pad w-md mx">
          <div class="kicker c-red">Estación 4 de 5 · Crisis en carretera</div>
          <h2 class="title" style="margin-top:.5rem">"No lo reporte, yo lo arreglo"</h2>
          <p class="lede">Roce con un vehículo particular en la caseta. Sin lesionados. El operador te llama en pánico: el particular acepta <strong>$12,000 en efectivo</strong> para no involucrar seguros. Si se reporta, el operador pierde su bono y queda en el historial.</p>
          ${mods(['Protocolo de reacción ante accidentes', 'El costo real de un siniestro vial'])}
        </div>`,
      choices: [
        { key: 'A', label: 'Autorizar el arreglo en efectivo', hint: 'Rápido, discreto, sin expediente', tone: 'bad', cost: 12000, driver: { trust: -14, stress: 10 }, flag: 'encubrimiento',
          verdict: 'Acabas de enseñarle que los siniestros se ocultan. El día que haya lesionados, tu operador tomará esa misma decisión solo y en la carretera.' },
        { key: 'B', label: 'Reportar y dejarlo resolver solo', hint: 'Se siguió el protocolo', tone: 'mid', cost: 6000, driver: { stress: 18 },
          verdict: 'Cumpliste el procedimiento y abandonaste a la persona. El expediente quedó limpio; la relación formativa, no.' },
        { key: 'C', label: 'Reportar, activar protocolo y acompañarlo por teléfono', hint: 'Deducible $3,500 y presencia real', tone: 'good', cost: 3500, xp: 160, driver: { trust: 18, stress: -14 },
          verdict: 'Correcto. El deducible costó menos que el arreglo en efectivo y el operador aprendió que reportar no lo destruye. Eso es lo que hará la próxima vez, cuando sí sea grave.' }
      ],
      note: 'Dato duro para el grupo: el arreglo en efectivo cuesta más que el deducible en la mayoría de las pólizas. Lo barato es reportar.'
    },

    /* ============ ESTACIÓN 5 ============ */
    {
      id: 'est-5', chapter: 'Estación 5', cam: 'cabin', mood: 'normal', speed: 0.2, anim: 'left', vote: true, question: 'Veinte minutos que valen la ruta: ¿qué decides?',
      html: () => `
        <div class="panel accent-cyan pad w-md mx">
          <div class="kicker">Estación 5 de 5 · Cierre formativo</div>
          <h2 class="title" style="margin-top:.5rem">Veinte Minutos Que Valen la Ruta</h2>
          <p class="lede">Unidad descargada. Tienes veinte minutos con el operador antes de su descanso. Es la única ventana real de aprendizaje del viaje completo.</p>
          ${mods(['Andragogía: el ciclo de Kolb en cabina', 'Metodología de retroalimentación activa', 'Liderazgo de cero tolerancia', 'Evaluación por competencias CONOCER', 'Trascendencia y bienestar familiar'])}
        </div>`,
      choices: [
        { key: 'A', label: 'Entregarle el reporte de faltas por escrito', hint: 'Firmado de enterado y a descansar', tone: 'bad', driver: { trust: -16 },
          verdict: 'Un documento no es retroalimentación. Cerraste el expediente y dejaste la experiencia sin procesar: el ciclo de Kolb quedó incompleto en la etapa de observación.' },
        { key: 'B', label: 'Felicitarlo en general para no desmotivarlo', hint: 'Llegamos, es lo que importa', tone: 'mid', xp: 40, driver: { trust: 6 },
          verdict: 'El elogio inespecífico no modifica conducta. Se siente bien hoy y no cambia nada mañana.' },
        { key: 'C', label: 'Ciclo completo: qué pasó, qué sentiste, qué harías distinto, compromiso escrito', hint: 'Kolb aplicado en 20 minutos', tone: 'good', xp: 190, driver: { trust: 26, stress: -12 },
          verdict: 'Correcto. Experiencia concreta → observación reflexiva → conceptualización → experimentación activa. El compromiso escrito y firmado por él, no por ti, es lo que convierte el viaje en competencia.' }
      ]
    },

    /* ============ DESENLACES RAMIFICADOS ============ */
    {
      id: 'fin-desacople', chapter: 'Desenlace', cam: 'crash', mood: 'danger', speed: 0, anim: 'impact',
      when: (S) => w.State.ending() === 'desacople',
      html: () => `
        <div class="panel accent-red pad w-lg mx brackets c-red" style="text-align:center">
          <div class="kicker c-red">Km 612 · Desenlace</div>
          <h2 class="hero glow-red" style="margin-top:.5rem">Desacople Catastrófico</h2>
          <p class="lede">El perno rey que liberaste sin verificar cedió en una curva descendente. El primer remolque se separó del tractor a 88 km/h e invadió el carril contrario. Pérdida total del conjunto y responsabilidad civil frente a terceros.</p>
          <div class="money sev-3 c-red" style="margin-top:1rem">-$260,000</div>
        </div>`,
      onEnter: (ctx) => { w.State.charge(260000, 'Desacople catastrófico del semirremolque', 'bad'); ctx.damage(1); w.Scene3D.impact(1.8); ctx.engine(false); }
    },
    {
      id: 'fin-descenso', chapter: 'Desenlace', cam: 'crash', mood: 'danger', speed: 0, anim: 'impact',
      when: (S) => w.State.ending() === 'descenso',
      html: () => `
        <div class="panel accent-red pad w-lg mx brackets c-red" style="text-align:center">
          <div class="kicker c-red">Km 588 · Desenlace</div>
          <h2 class="hero glow-red" style="margin-top:.5rem">Colapso en el Descenso</h2>
          <p class="lede">Frenos comprometidos más un operador en fatiga extrema. La combinación que autorizaste en el patio y sostuviste en la ruta se materializó en la bajada larga.</p>
          <div class="money sev-3 c-red" style="margin-top:1rem">-$180,000</div>
        </div>`,
      onEnter: (ctx) => { w.State.charge(180000, 'Colapso en descenso por frenos y fatiga', 'bad'); ctx.damage(1); w.Scene3D.impact(1.6); ctx.engine(false); }
    },
    {
      id: 'fin-microsueno', chapter: 'Desenlace', cam: 'crash', mood: 'danger', speed: 0, anim: 'impact',
      when: (S) => w.State.ending() === 'microsueno',
      html: (S) => `
        <div class="panel accent-red pad w-lg mx brackets c-red" style="text-align:center">
          <div class="kicker c-red">Km 546 · Desenlace</div>
          <h2 class="hero glow-red" style="margin-top:.5rem">Microsueño</h2>
          ${media('videos/fin-microsueno.mp4', 'Conducción errática segundos antes del microsueño')}
          <p class="lede">Fatiga acumulada del operador: <strong class="num">${S.driver.fatigue}%</strong>. Cuatro segundos con los ojos cerrados a 92 km/h son 102 metros conducidos por nadie. Salida de camino y volcadura del segundo remolque.</p>
          <div class="money sev-3 c-red" style="margin-top:1rem">-$95,000</div>
        </div>`,
      onEnter: (ctx) => { w.State.charge(95000, 'Salida de camino por microsueño', 'bad'); ctx.damage(1); w.Scene3D.impact(1.5); ctx.engine(false); }
    },
    {
      id: 'fin-incidente', chapter: 'Desenlace', cam: 'rear', mood: 'warn', speed: 0.3, anim: 'impact',
      when: (S) => w.State.ending() === 'incidente',
      html: (S) => `
        <div class="panel accent-orange pad w-lg mx" style="text-align:center">
          <div class="kicker c-orange">Km 601 · Desenlace</div>
          <h2 class="title" style="margin-top:.5rem">Llegada Con Incidente Menor</h2>
          <p class="lede">La unidad llegó, pero el índice de riesgo acumulado (<strong class="num">${w.State.risk()}%</strong>) se cobró en la maniobra final: daño al portón del andén del cliente y una relación comercial tensada.</p>
          <div class="money sev-2 c-orange" style="margin-top:1rem">-$38,000</div>
        </div>`,
      onEnter: (ctx) => { w.State.charge(38000, 'Incidente en maniobra de andén', 'bad'); ctx.damage(0.7); ctx.engine(false); }
    },
    {
      id: 'fin-utilidad', chapter: 'Desenlace', cam: 'rear', mood: 'warn', speed: 0.2, anim: 'enter',
      when: (S) => w.State.ending() === 'utilidad',
      html: (S) => `
        <div class="panel accent-orange pad w-md mx" style="text-align:center">
          <div class="kicker c-orange">Km 640 · Desenlace</div>
          <h2 class="title" style="margin-top:.5rem">Llegaste, Pero Sin Utilidad</h2>
          <p class="lede">Sin siniestro y sin lesionados: eso ya es un logro. Pero de los $80,000 proyectados quedan <strong class="c-amber num">${money(S.budget)}</strong>. El viaje se hizo por cumplir, no por rentabilidad.</p>
          <p class="lede" style="opacity:.8">Una flota que opera así sobrevive el mes y no sobrevive el año.</p>
        </div>`,
      onEnter: (ctx) => { ctx.engine(false); }
    },
    {
      id: 'fin-seguro', chapter: 'Desenlace', cam: 'rear', mood: 'safe', speed: 0.2, anim: 'enter',
      when: (S) => w.State.ending() === 'seguro',
      html: (S) => `
        <div class="panel accent-green pad w-md mx brackets c-green" style="text-align:center">
          <div style="width:56px;height:56px;color:var(--green);margin:0 auto .8rem">${I('shield')}</div>
          <div class="kicker c-green">Km 640 · Desenlace</div>
          <h2 class="hero" style="margin-top:.5rem;color:var(--green)">Ruta Íntegra</h2>
          <p class="lede">Cero siniestros, cero infracciones, operador descansado y cliente atendido en ventana. Presupuesto conservado: <strong class="c-green num">${money(S.budget)}</strong>.</p>
          <p class="lede">La dirección de operaciones libera el <strong>bono de desempeño de $6,000</strong>. Nadie va a notar el accidente que no ocurrió: ese es el trabajo.</p>
          <div class="money sev-1 c-green" style="margin-top:1rem">+$6,000</div>
        </div>`,
      onEnter: (ctx) => { w.State.credit(6000, 'Bono de desempeño por ruta íntegra'); w.State.addXp(200); w.Scene3D.pulseLights(0x00FF66); ctx.engine(false); }
    },

    /* ============ ESTACIÓN 5 · MEDICIÓN Y ROLES ============ */

    {
      title: 'Mentoría correctiva', id: 'telemetria', chapter: 'Estación 5', cam: 'follow', mood: 'warn', speed: 0.3, anim: 'left',
      build: 'telemetria',
      notes: 'La telemetría no acusa: abre la conversación. Si la usas como prueba en un juicio, el operador aprende a esconderse del sensor, no a manejar mejor.'
    },
    {
      id: 'roles-3', chapter: 'Estación 5', cam: 'cabin', mood: 'normal', speed: 0.2, anim: 'left',
      html: () => `
        <div class="panel accent-cyan pad w-lg mx brackets">
          <div class="kicker c-cyan">Estación 5 · Cierre formativo</div>
          <h2 class="title">Tus tres sombreros</h2>
          <p class="lede" style="margin-bottom:.4rem">El mismo día usas los tres. El error no es usar uno de más: es <strong class="c-amber">usar el equivocado en el momento equivocado</strong> y no avisar cuál traes puesto.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1rem">Toca cada rol.</p>
          <div class="rv-set c3" data-set="roles">
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">01</div>
              <div class="rv-t">Evaluador</div>
              <div class="rv-s">Mide contra estándar</div>
              <div class="rv-body">
                <p>Verifica, documenta y acredita o no acredita. Necesita distancia, rúbrica y evidencia.</p>
                <p><em>Riesgo:</em> si vives aquí, el operador te oculta las fallas para no reprobar y pierdes toda visibilidad real.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">02</div>
              <div class="rv-t">Capacitador</div>
              <div class="rv-s">Transfiere la competencia</div>
              <div class="rv-body">
                <p>Diseña la práctica, demuestra, corrige y hace que el otro ejecute hasta dominarlo.</p>
                <p><em>Riesgo:</em> si solo capacitas, enseñas la técnica y no el criterio para usarla cuando nadie mira.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">03</div>
              <div class="rv-t">Acompañante</div>
              <div class="rv-s">Sostiene el cambio</div>
              <div class="rv-body">
                <p>Escucha, respalda la decisión difícil y sigue ahí tres meses después, cuando el hábito nuevo se está cayendo.</p>
                <p><em>Riesgo:</em> si solo acompañas, te vuelves cómplice y el estándar se erosiona sin que lo notes.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
          <p class="lede" style="margin-top:1.1rem;font-size:.92rem;opacity:.82">Regla práctica: <strong>di en voz alta con qué sombrero llegas</strong>. "Hoy vengo a evaluar" y "hoy vengo a acompañarte" producen conversaciones distintas con la misma persona.</p>
        </div>`,
      notes: 'Pregunta al grupo cuál es su sombrero por default. Casi siempre es evaluador, porque es el que la empresa premia. Ahí está el problema cultural completo.'
    },
    {
      id: 'medicion', chapter: 'Estación 5', cam: 'top', mood: 'warn', speed: 0.2, anim: 'right',
      html: () => `
        <div class="panel accent-orange pad w-lg mx brackets">
          <div class="kicker c-orange">Medición conductual</div>
          <h2 class="title">Lo que sí se puede medir</h2>
          <p class="lede" style="margin-bottom:.4rem">La actitud no se mide. La conducta sí. Estas tres se observan en campo y se documentan con hechos fechados.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1rem">Toca cada indicador.</p>
          <div class="rv-set c3" data-set="medicion">
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">R</div>
              <div class="rv-t">Resiliencia</div>
              <div class="rv-s">Bajo presión sostiene el proceso</div>
              <div class="rv-body">
                <p><em>Evidencia:</em> con retraso acumulado, ¿siguió haciendo la inspección completa o la recortó?</p>
                <p>Se observa el día malo, nunca el día tranquilo.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">I</div>
              <div class="rv-t">Integridad</div>
              <div class="rv-s">Reporta lo que nadie vio</div>
              <div class="rv-body">
                <p><em>Evidencia:</em> ¿reportó el golpe menor, la fuga leve o el error propio sin que se lo detectaran?</p>
                <p>Este indicador solo sube si reportar nunca se castiga.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">C</div>
              <div class="rv-t">Custodia</div>
              <div class="rv-s">Cuida el activo como propio</div>
              <div class="rv-body">
                <p><em>Evidencia:</em> estado de la cabina, manejo del embrague, resguardo de la carga y de la documentación.</p>
                <p>Es el indicador que mejor predice el costo de mantenimiento por unidad.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
          <div class="rv-s" style="margin:1.3rem 0 .5rem">Tolerancia cero · omisiones que no se negocian</div>
          <table class="tz">
            <thead><tr><th>Conducta omitida</th><th>Consecuencia técnica</th><th>Acción del instructor</th></tr></thead>
            <tbody>
              <tr><td class="tz-a">Escaneo de espejos cada 8 segundos</td><td class="tz-c">Atropellamiento en punto ciego</td><td>Detener la unidad y reentrenar en el momento</td></tr>
              <tr><td class="tz-a">Regeneración de GNC / sistema de emisiones</td><td class="tz-c">Daño térmico al motor</td><td>Bloquear la salida hasta completar el ciclo</td></tr>
              <tr><td class="tz-a">Tirón de prueba tras acoplar remolque</td><td class="tz-c">Desprendimiento en movimiento</td><td>No acreditar la práctica, repetir la secuencia completa</td></tr>
            </tbody>
          </table>
          <p class="lede" style="margin-top:1rem;font-size:.92rem;opacity:.8">Tolerancia cero no significa castigo automático. Significa que <strong class="c-orange">la operación se detiene</strong> y nadie negocia el estándar por una cita de descarga.</p>
        </div>`,
      notes: 'Pide que agreguen una cuarta fila con la omisión más frecuente de su propio patio. Ese ejercicio convierte la tabla genérica en su tabla.'
    },

    /* ============ ESTACIÓN 5 · INSTRUMENTO DE EVALUACIÓN ============ */
    {
      id: 'eval-brief', chapter: 'Estación 5', cam: 'top', mood: 'warn', speed: 0, anim: 'right',
      html: () => `
        <div class="panel accent-amber pad w-lg mx brackets c-amber">
          <div class="kicker c-amber">Estación 5 · construye tu instrumento</div>
          <h2 class="title">Dime qué evalúas y te digo a quién vas a perder</h2>
          ${media('videos/eval-brief-carlos-capillas.mp4', 'Carlos Capillas aplica su instrumento de evaluación a un operador real')}
          <p class="lede">Todo instructor evalúa. La mayoría lo hace sin haber escrito nunca qué evalúa, y termina calificando lo que se ve desde la ventana de la oficina: puntualidad, uniforme y que no dé problemas.</p>
          <p class="lede">Arnulfo “el Borras” Peña habría sacado calificación alta en esa hoja. Fue puntual seis años.</p>
          <p class="lede" style="opacity:.8">Vas a construir tu propio instrumento con al menos <strong class="c-amber">60 criterios justificados</strong> en diez dominios: conducta, aspecto, técnica, inspección, normatividad, seguridad, comunicación, fatiga, custodia y criterio ético. Después vas a calificar operadores con él y vas a ver si tu hoja los distingue.</p>
        </div>`,
      notes: 'Advierte antes de empezar: en el banco hay criterios que suenan bien y son trampa. No les digas cuáles. El hallazgo tiene que ser suyo al final.'
    },
    {
      title: 'Constructor del instrumento', id: 'evconstruye', chapter: 'Estación 5', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter',
      build: 'evconstruye',
      notes: 'Dales tiempo real: 12 a 15 minutos. Recorre el salón y pregunta por qué eligieron un criterio y no otro. Insiste en que redacten al menos dos criterios propios.'
    },
    {
      title: 'Tu hoja frente a tres operadores', id: 'evaplica', chapter: 'Estación 5', cam: 'cabin', mood: 'warn', speed: 0, anim: 'left',
      build: 'evaplica',
      notes: 'Momento clave del bloque. Si su instrumento aprueba al Borras, no los rescates: deja que el silencio haga el trabajo antes de explicar.'
    },
    {
      title: 'Aplícalo a tu gente', id: 'evcampo', chapter: 'Estación 5', cam: 'top', mood: 'normal', speed: 0, anim: 'right',
      build: 'evcampo',
      notes: 'Que escriban el nombre real de un operador de su flota. Al terminar pueden descargar la hoja y usarla el lunes. Eso convierte el curso en herramienta.'
    },
    {
      id: 'pc-07', chapter: 'Estación 5', cam: 'lowfront', mood: 'warn', speed: 0.2, anim: 'left', vote: true, question: 'El operador se detuvo: ¿cómo respondes?',
      html: () => `
        <div class="panel accent-red pad w-md mx brackets c-red">
          <div class="kicker c-red">Punto de control 07 · liderazgo</div>
          <h2 class="title" style="margin-top:.5rem">El operador se detuvo</h2>
          <p class="lede">Tu operador rechazó salir: detectó una fuga leve en el dolly y la bitácora ya suma 13 horas. Tenía razón. Despacho te llama: el cliente amenaza con cancelar la cuenta y te piden que <strong>convenzas al operador</strong>.</p>
          <p class="lede" style="opacity:.8">Está escuchando la llamada desde el otro lado del cofre.</p>
        </div>`,
      choices: [
        { key: 'A', label: 'Pedirle al operador que reconsidere', hint: 'Solo por esta vez, es un cliente clave', tone: 'bad', cost: 12000, driver: { trust: -25, stress: 18 }, flag: 'firmoPresion',
          verdict: 'Acabas de enseñarle que el estándar aplica hasta que un cliente se enoja. Ninguna capacitación futura va a recuperar lo que se perdió en esa frase, y él ya no te va a reportar nada.' },
        { key: 'B', label: 'Pausar la decisión y escalar a la dirección', hint: 'Que otro lo resuelva', tone: 'mid', cost: 4000, driver: { trust: -6, stress: 8 }, xp: 25,
          verdict: 'No cediste, pero tampoco lo respaldaste. El operador aprendió que cuando se detiene queda solo esperando un permiso. La próxima vez lo va a pensar dos veces.' },
        { key: 'C', label: 'Asumir la autoridad y respaldarlo en la llamada', hint: 'La unidad no sale, yo lo firmo', tone: 'good', cost: 2800, xp: 180, driver: { trust: 22, stress: -10 }, flag: 'respaldoOperador',
          verdict: 'Correcto. Pagaste la estadía y una llamada incómoda. A cambio, todo el patio se enteró en veinte minutos de que detenerse tiene respaldo. Eso es lo que faltó en el expediente 4471.' }
      ],
      note: 'Este es el punto de control más importante del curso. El folio VC-0912 se firmó porque nadie tomó la opción C ese día. Dilo así, sin suavizarlo.'
    },
    {
      id: 'indicador', chapter: 'Estación 5', cam: 'trailer', mood: 'safe', speed: 0.3, anim: 'enter',
      html: () => `
        <div class="panel pad w-sm mx" style="text-align:center">
          <div class="kicker">El verdadero indicador</div>
          <h2 class="title" style="margin:.6rem 0 1rem">Tu resultado no se mide en el aula</h2>
          <p class="lede">No lo mide la lista de asistencia, ni la calificación del examen, ni la encuesta de satisfacción del curso.</p>
          <p class="lede" style="font-size:1.12rem;color:var(--ink)">Se mide en la decisión que ese operador toma <strong class="c-green">a las 03:40 h, en el kilómetro 210, cuando está solo</strong> y nadie va a enterarse de lo que elija.</p>
          <p class="lede" style="opacity:.75">Todo lo que hiciste en este simulador existe para ese instante.</p>
        </div>`,
      notes: 'Silencio de tres segundos después de leerlo. No lo expliques.'
    },

    /* ============ CIERRE ============ */

    /* ============ CIERRE · MULTIPLICAR EL VALOR ============ */
    {
      id: 'multiplicador', chapter: 'Cierre', cam: 'trailer', mood: 'safe', speed: 0.3, anim: 'left',
      html: () => `
        <div class="panel accent-green pad w-lg mx brackets c-green">
          <div class="kicker c-green">El efecto multiplicador del instructor</div>
          <h2 class="title">Formas a uno, proteges a cientos</h2>
          <p class="lede" style="margin-bottom:.4rem">Cada operador que formas bien no es un caso: es un nodo. Su conducta se propaga a la flota, a su familia y a cada persona que se cruza con esas cincuenta toneladas.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1.1rem">Toca cada nivel de impacto.</p>
          <div class="rv-set c3" data-set="multiplica">
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">$</div>
              <div class="rv-t">Rentabilidad</div>
              <div class="rv-s">La empresa sobrevive</div>
              <div class="rv-body">
                <p>Un operador formado consume menos combustible, rompe menos, no genera siniestros y conserva a los clientes.</p>
                <p>Los $410,000 de exposición evitada de hoy son un solo viaje de un solo operador.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">◈</div>
              <div class="rv-t">Estabilidad familiar</div>
              <div class="rv-s">El sustento no se rompe</div>
              <div class="rv-body">
                <p>Detrás de cada operador hay un ingreso del que dependen tres o cuatro personas. Una incapacidad o una licencia suspendida lo corta de un día para otro.</p>
                <p>Marisol y dos niños son la unidad de medida real de tu trabajo.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">◎</div>
              <div class="rv-t">Bienestar colectivo</div>
              <div class="rv-s">Todos los que van al lado</div>
              <div class="rv-body">
                <p>El automovilista que rebasa, el que viene de frente, el que va detrás en la bajada. Ninguno eligió estar ahí.</p>
                <p>Tu firma en un checklist es la única cosa que los protege y ellos nunca van a saberlo.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
        </div>`,
      notes: 'Aquí baja el ritmo. Es el momento emocional del cierre: no lo apures y no lo adornes.'
    },
    {
      title: 'Curso de inducción PIEL', id: 'curso-final', chapter: 'Cierre', cam: 'cabin', mood: 'normal', speed: 0, anim: 'enter',
      build: 'curso',
      notes: 'Prueba final de transferencia. Aquí demuestran si entendieron el marco o solo lo escucharon.'
    },
    {
      title: 'Cierre financiero auditado', id: 'cierre-auditado', chapter: 'Cierre', cam: 'wide', mood: 'normal', speed: 0, anim: 'right',
      build: 'auditado',
      notes: 'El dinero cierra el argumento con la dirección. La seguridad no es un gasto: es la única inversión con retorno garantizado.'
    },
    { id: 'scoreboard', chapter: 'Cierre', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter', build: 'scoreboard' },
    { id: 'dictamen', chapter: 'Cierre', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter', build: 'dictamen' },


    {
      id: 'espejo', chapter: 'Cierre', cam: 'lowfront', mood: 'normal', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel accent-cyan pad w-md mx brackets" style="text-align:center">
          <div class="kicker c-cyan">El espejo de la realidad</div>
          <h2 class="title" style="margin:.8rem 0 1.2rem;line-height:1.25">"El operador que sale mañana<br>del patio va a manejar exactamente<br>como tú le enseñaste a manejar."</h2>
          <p class="lede" style="opacity:.78">No como le dijiste que manejara. Como te vio hacerlo, como te vio dejarlo pasar, como te vio firmar.</p>
          <p class="lede" style="margin-top:1.1rem;font-size:.92rem;opacity:.62">Formando el Trayecto del Instructor · Sistema Maestro TM</p>
        </div>`,
      notes: 'Lee la frase completa en voz alta y quédate callado cinco segundos antes de avanzar. Ese silencio es parte del diseño.'
    },
    {
      id: 'reflexion', chapter: 'Cierre', cam: 'trailer', mood: 'normal', speed: 0, anim: 'right',
      html: () => `
        <div class="panel pad w-sm mx" style="text-align:center">
          <div style="width:52px;height:52px;color:var(--ink-2);margin:0 auto 1rem;opacity:.55">${I('refresh')}</div>
          <div class="kicker">Ciclo de Kolb · Experimentación activa</div>
          <h2 class="title" style="margin-top:.6rem">La Pregunta Que Se Llevan</h2>
          <p class="lede" style="font-size:clamp(1.15rem,2.2vw,1.7rem);font-style:italic;color:var(--ink)">"¿Cuál de las decisiones que tomé hoy en la simulación ya la tomé mal la semana pasada en mi patio real?"</p>
          <p class="lede" style="opacity:.75">La experiencia sin reflexión es ciega. Denle nombre, fecha y unidad.</p>
        </div>`,
      note: 'Da 90 segundos de silencio real. Luego pide 3 respuestas en voz alta, sin comentarlas.'
    },
    {
      id: 'plan', chapter: 'Cierre', cam: 'cabin', mood: 'normal', speed: 0, anim: 'left',
      html: () => `
        <div class="panel accent-orange pad w-md mx">
          <div class="kicker c-orange">Compromiso institucional</div>
          <h2 class="title" style="margin-top:.5rem">Plan de Acción · Lunes por la Mañana</h2>
          <div class="dossier" style="margin-top:1.2rem">
            <div class="dossier-row"><span>01 · Cero validaciones apresuradas en patio, sin excepción por presión de despacho.</span><b class="c-orange">Inmediato</b></div>
            <div class="dossier-row"><span>02 · Auditoría semanal de telemetría: velocidad, frenado brusco y desviación de carril.</span><b class="c-orange">Semanal</b></div>
            <div class="dossier-row"><span>03 · Conversación andragógica de 20 minutos con cada operador al cierre de ruta.</span><b class="c-orange">Por viaje</b></div>
            <div class="dossier-row"><span>04 · Escalamiento documentado cuando despacho presione contra un criterio técnico.</span><b class="c-orange">Cada caso</b></div>
          </div>
        </div>`
    },{
      id: 'cierre', chapter: 'Cierre', cam: 'opening', mood: 'safe', speed: 0.6, anim: 'enter',
      html: () => `
        <div class="panel accent-green pad w-md mx brackets c-green" style="text-align:center">
          <div style="width:60px;height:60px;color:var(--green);margin:0 auto 1rem">${I('trophy')}</div>
          <h2 class="hero" style="color:var(--green)">Última Muralla</h2>
          <p class="lede" style="font-size:clamp(1.05rem,1.9vw,1.45rem)">Nadie te va a agradecer el accidente que no ocurrió. Esa es exactamente la medida de tu trabajo.</p>
          <div class="kicker c-green" style="margin-top:1.6rem">Sistema Maestro TM · Mentores Operativos</div>
        </div>`,
      onEnter: (ctx) => { ctx.engine(false); }
    }];

  w.CONTENT = { SLIDES, money };
})(window);
