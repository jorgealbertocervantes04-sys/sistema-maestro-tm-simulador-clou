/* ============================================================
   CONTENIDO — mazo declarativo con ramificación por estado
   ============================================================ */
(function (w) {
  const I = w.svgIcon;
  const money = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US');

  const media = (file, label, poster, caption) => `
    <div class="media" data-media>
      <div class="scanline"></div>
      <video src="${file}" ${poster ? `poster="${poster}"` : ''} controls preload="metadata" playsinline></video>
      <div class="media-fallback">${I('film')}<div class="kicker">Archivo de video no encontrado</div><code>${file}</code>
        <div class="kicker" style="opacity:.7">${label}</div></div>
    </div>
    ${caption ? `<p class="media-cap kicker">${caption}</p>` : ''}`;

  /* Recuadro "aquí va una foto": el instructor lee la descripción y pone su propia
     imagen real después. No se conecta a ningún archivo, es solo una guía visual. */
  const imgSlot = (desc) => `
    <div class="img-slot">
      ${I('film')}
      <div class="img-slot-txt"><div class="kicker">Foto sugerida para este momento</div><p>${desc}</p></div>
    </div>`;

  /* Pregunta visible para el grupo (no solo para las notas del facilitador):
     el objetivo es que cada tema termine en una pregunta real que el instructor
     lance en voz alta, para ir viendo cómo piensan y desarrollando su criterio. */
  const pregunta = (texto) => `
    <div class="q-audience">
      <div class="q-mark">?</div>
      <div><div class="kicker">Pregunta para el grupo</div><p>${texto}</p></div>
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
            <p class="lede">Te vamos a contar una historia real. Un camión tuvo un accidente grave. Primero vamos a investigar juntos, paso a paso, qu&eacute; pas&oacute; y qui&eacute;n pudo haberlo evitado &mdash;como hace un detective.
            Despu&eacute;s te vas a poner en los zapatos de esa persona: vas a manejar la unidad, revisarla pieza por pieza, y dar una clase de verdad a un operador real.</p>
            <div class="grid-3" style="margin-top:1.5rem">
              <div class="stat"><h4>Parte 1 &middot; La Historia</h4><div class="v c-amber num">92 d&iacute;as</div></div>
              <div class="stat"><h4>Parte 2 &middot; Tu Turno</h4><div class="v c-cyan num">$80,000</div></div>
              <div class="stat"><h4>Finales posibles</h4><div class="v num">6</div></div>
            </div>
            <p class="lede" style="margin-top:1.3rem;font-size:.9rem;opacity:.7">&larr; &rarr; o barra espaciadora para avanzar. <strong>I</strong> ver el mapa &middot; <strong>N</strong> notas &middot; <strong>V</strong> votaci&oacute;n &middot; <strong>R</strong> regresar.</p>
          </div>
        </div>`
    },

    /* ============ FASE 1 · LÍNEA DE VIDA ============ */
    {
      title: 'Parte 1 · La Historia', id: 'fase-1', chapter: 'Línea de Vida', cam: 'lowfront', mood: 'warn', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel pad w-md mx phase brackets c-amber accent-orange">
          <div class="pn c-amber">01</div>
          <div class="pt">La Historia</div>
          <p class="lede" style="margin-top:1.1rem">Antes de empezar, solo vas a mirar y escuchar. Vamos a mostrarte un accidente real, una llamada real, y noventa y dos d&iacute;as de historia que vamos a regresar como pel&iacute;cula hasta el momento exacto donde esto se pudo haber evitado
          <strong class="c-amber">&mdash;y a la persona que estaba ah&iacute;</strong>.</p>
          <div class="steps">
            <span class="on c-amber">1 · Conoce la historia</span>
            <span>2 · Regresamos el tiempo</span>
            <span>3 · Encontramos el error</span>
          </div>
          ${pregunta('¿Alguna vez viste algo en el trabajo que te pareció peligroso, pero nadie dijo nada? Guarda esa idea, la vamos a usar más adelante.')}
          <p class="lede" style="margin-top:1.5rem;font-size:.95rem;opacity:.68">Esta primera parte no se califica. Solo se vive. Las decisiones y los puntos empiezan en la Parte 2.</p>
        </div>`,
      note: 'Baja la luz del aula antes de avanzar. Di solo esto: "lo que van a ver pasó, y alguien firmó para que pasara". Nada más.'
    },

    {
      id: 'elborras', chapter: 'Línea de Vida', cam: 'crash', mood: 'danger', speed: 0.2, anim: 'impact',
      html: () => `
        <div class="panel accent-red pad w-lg mx" style="text-align:center">
          <div class="kicker c-red">Un camión, una madrugada, las 3:14 a.m.</div>
          <h2 class="title glow-red" style="margin-top:.5rem">Este es Arnulfo, "el Borras"</h2>
          ${media('videos/elborras.mp4', 'Presentación del operador antes del siniestro')}
        </div>`,
      note: 'Antes de mostrar el choque, dale una cara y un nombre. Que el grupo lo conozca como persona antes de conocerlo como expediente.'
    },

    {
      id: 'siniestro', chapter: 'Línea de Vida', cam: 'crash', mood: 'danger', speed: 0.2, anim: 'impact',
      html: () => `
        <div class="panel accent-red pad w-lg mx" style="text-align:center">
          <div class="kicker c-red">Un camión, una madrugada, las 3:14 a.m.</div>
          <h2 class="title glow-red" style="margin-top:.5rem">Lo Que Pasó</h2>
          ${media('videos/siniestro.mp4', 'Evidencia audiovisual del siniestro')}
        </div>`,
      onEnter: (ctx) => { ctx.damage(0.6); w.Scene3D.impact(0.8); },
      note: 'No expliques nada todavía. Deja correr el video completo y guarda silencio 5 segundos al terminar. El silencio es parte del método.'
    },

    {
      id: 'llamada', chapter: 'Línea de Vida', cam: 'rear', mood: 'danger', speed: 0, anim: 'right',
      html: () => `
        <div class="panel accent-red pad w-lg mx" style="text-align:center">
          <div class="kicker c-red">Esa misma madrugada</div>
          <h2 class="title" style="margin-top:.5rem">La Llamada</h2>
          <p class="lede">El camión se perdió por completo. Arnulfo llevaba apenas tres meses trabajando en la empresa.</p>
          ${media('videos/llamada.mp4', 'Llamada de emergencia al instructor')}
          ${pregunta('¿Quién de ustedes ha recibido una llamada así, de madrugada, por un accidente? Levanten la mano.')}
        </div>`,
      note: 'Haz la pregunta en voz alta y espera manos levantadas. Ese es el ancla emocional del curso: que sientan que esto les puede pasar a ellos.'
    },

    {
      id: 'la-familia', chapter: 'Línea de Vida', cam: 'top', mood: 'normal', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel pad w-md mx" style="border-color:rgba(255,196,0,.28)">
          <div class="kicker c-amber">Lo que ningún reporte cuenta</div>
          <h2 class="title" style="margin-top:.5rem">La Familia</h2>
          <p class="lede">El reporte del accidente solo anota un camión, una carga y un monto en pesos. Esto es lo que quedó del otro lado del teléfono esa madrugada.</p>
          ${media('videos/la-familia.mp4', 'Marisol recibe la llamada esa madrugada')}
          <div class="fam">
            <div class="fam-c"><div class="n">Arnulfo "el Borras" Peña</div><div class="r">Operador · 34 años</div></div>
            <div class="fam-c"><div class="n">Marisol Aguilar</div><div class="r">Esposa · 31 años</div></div>
            <div class="fam-c"><div class="n">Emiliano</div><div class="r">Hijo · 7 años</div></div>
            <div class="fam-c"><div class="n">Renata</div><div class="r">Hija · 4 años</div></div>
          </div>
          <p class="fam-note">En este curso te vamos a medir con números y con pesos, porque es el idioma que todos en la empresa entienden.
          Pero lo que acabas de ver no cabe en ningún número: <strong class="c-amber">no hay dinero que lo repare</strong>.</p>
        </div>`,
      onEnter: () => { w.Scene3D.pulseLights(0xFFC400); },
      note: 'Lee los cuatro nombres en voz alta, uno por uno, con pausa. No agregues comentario. Deja diez segundos de silencio antes de avanzar.'
    },

    {
      id: 'poll-causa', chapter: 'Línea de Vida', cam: 'wide', mood: 'warn', speed: 0, anim: 'enter',
      vote: true, question: '¿Cuál creen que fue el verdadero error que llevó a este accidente?',
      html: () => `
        <div class="panel accent-orange pad w-md mx">
          <div class="kicker c-orange">Piensen como detectives</div>
          <h2 class="title" style="margin-top:.5rem">¿Cuál fue el error que llevó a esto?</h2>
          <p class="lede">Ya revisamos el camión: no era una falla mecánica, todo estaba en regla. Arnulfo tampoco tenía ningún reporte de mal comportamiento antes de esa noche.</p>
        </div>`,
      choices: [
        { key: 'A', label: 'Una falla del camión que nadie pudo prever', hint: 'Mala suerte, nada se pudo hacer', tone: 'bad', cost: 12000,
          verdict: 'Ya revisamos el camión: no era una falla mecánica. Culpar a la mala suerte es la forma más cara de no aprender nada: cierra la investigación antes de encontrar la verdadera causa.' },
        { key: 'B', label: 'Arnulfo se confió de más en el camino', hint: 'Bajó la guardia', tone: 'mid', cost: 5000, xp: 30,
          verdict: 'Eso es un síntoma, no la causa. Confiarse de más no nace en el camino: nace cuando, en el patio, nadie corrige el primer descuido pequeño.' },
        { key: 'C', label: 'Alguien firmó su aprobación sin revisar bien, con prisa', tone: 'good', xp: 120, flag: 'diagnosticoCorrecto',
          hint: 'Nadie comprobó de verdad que él supiera manejar',
          verdict: 'Vamos a descubrirlo juntos, paso a paso. Toda la cadena de errores empieza en cómo se formó a Arnulfo, y hoy tu experiencia como instructor nos va a ayudar a reconstruirla. Hoy vas a estar del otro lado de esa firma.' }
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
          <div class="kicker c-${ok ? 'cyan' : 'orange'}">Comparando con lo que dijo el grupo</div>
          <h2 class="title" style="margin-top:.5rem">${ok ? 'El grupo lo vio antes que el reporte' : 'El reporte les dio la vuelta'}</h2>
          ${media('videos/veredicto-linea.mp4', 'Reconstrucción de los seis avisos ignorados')}
          <p class="lede">${ok
            ? 'Ustedes señalaron la firma apurada en el patio antes de ver toda la línea del tiempo. Ese instinto es exactamente lo que este curso quiere convertir en un hábito, algo que hagan siempre, sin pensarlo.'
            : 'El grupo apuntó al camino, y el camino solo terminó lo que el patio ya había autorizado. No es un error de ustedes: es algo que le pasa a toda la industria, y por eso el curso empieza justo aquí.'}</p>
          <div class="grid-3" style="margin:1.6rem 0">
            <div class="stat"><h4>Días de aviso</h4><div class="v num c-amber">92</div></div>
            <div class="stat"><h4>Momentos donde se pudo parar</h4><div class="v num c-amber">6</div></div>
            <div class="stat"><h4>Personas que pudieron detenerlo</h4><div class="v num c-red">5</div></div>
          </div>
          <p class="fam-note">Ningún accidente grave nace de un solo error. Nace de varios avisos que nadie atendió, y de una firma que los volvió "aprobados".
          <strong class="c-cyan">Desde aquí, esa firma va a ser la tuya.</strong></p>
        </div>`;
      },
      note: 'Si el grupo acertó, refuerza sin celebrar de más. Si falló, protege al grupo: el error es de la industria completa, no de ellos.'
    },

    {
      id: 'el-culpable', chapter: 'Línea de Vida', cam: 'lowfront', mood: 'danger', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel accent-red pad w-md mx brackets c-red">
          <div class="kicker c-red">92 días antes del accidente · 7:12 a.m. · aquí empezó todo</div>
          <h2 class="title glow-red" style="margin:.5rem 0 1.5rem">Aquí Empezó Todo</h2>
          <div class="doc">
            <div class="doc-h">
              <b>Examen de manejo de Arnulfo</b>
              <span>Folio VC-0912</span>
            </div>
            <div class="doc-rows">
              <div class="doc-row"><span>Operador evaluado</span><b>Arnulfo "el Borras" Peña</b></div>
              <div class="doc-row"><span>Tipo de camión autorizado</span><b>Doble remolque completo</b></div>
              <div class="doc-row bad"><span>Cuánto duró el examen</span><b>4 minutos</b></div>
              <div class="doc-row bad"><span>¿Se probó manejando de verdad?</span><b>No</b></div>
              <div class="doc-row bad"><span>¿Se revisaron los frenos de aire?</span><b>No, se saltó ese paso</b></div>
              <div class="doc-row"><span>Resultado del examen</span><b>Aprobado</b></div>
            </div>
            <div class="doc-sig">
              <div class="lbl">Firma de quien lo aprobó</div>
              <svg class="sig-svg" viewBox="0 0 340 96" aria-label="Firma manuscrita">
                <path d="M14 70 C34 22, 52 16, 58 40 C64 64, 48 78, 44 62 C40 46, 62 30, 82 52 C96 68, 108 56, 112 38 C116 20, 130 22, 132 44 C134 64, 148 66, 158 48 C168 30, 184 28, 188 50 C192 70, 208 72, 220 52 C232 32, 252 30, 258 52 C263 70, 278 66, 292 44 C300 31, 312 30, 322 40"/>
                <path d="M96 82 C142 74, 214 72, 286 78"/>
              </svg>
              <div class="doc-line">Instructor responsable de aprobarlo</div>
            </div>
            <div class="doc-stamp">Aquí se rompió la cadena</div>
          </div>
          <p class="lede" style="margin-top:1.8rem;font-size:clamp(1.05rem,1.9vw,1.35rem)">
            El verdadero responsable no iba manejando esa noche. El verdadero responsable <strong class="c-red">firmó</strong>, noventa y dos días antes,
            en un patio tranquilo, con prisa y sin mala intención.
          </p>
          ${pregunta('¿Cuántos exámenes o revisiones han firmado ustedes esta semana? ¿Cuántos de esos duraron más de cuatro minutos?')}
        </div>`,
      onEnter: (ctx) => { w.Scene3D.impact(0.5); w.Audio3D && w.Audio3D.hit(); },
      note: 'Deja que la firma se dibuje completa antes de hablar. Cuando caiga el sello, haz la pregunta de la pantalla en voz alta y deja que respondan con confianza, sin juzgarlos. El video de esta reconstrucción ("el-culpable.mp4") ya no se usa aquí para que la escena respire; puedes mostrarlo aparte si lo necesitas para otro fin.'
    },
    {
      id: 'la-formula-1', chapter: 'Línea de Vida', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel accent-cyan pad w-md mx brackets c-cyan" style="text-align:center">
          <div class="kicker">Antes de que tú empieces a firmar</div>
          <h2 class="title" style="margin-top:.5rem">El Equipo Que Nunca Se Salta un Paso</h2>
          ${media('videos/la-formula-1.mp4', 'Un pit stop de Fórmula 1: menos de dos segundos, cero improvisación')}
          <p class="lede" style="margin-top:1.6rem">Mira a un equipo de mecánicos de carreras: veinte personas mueven un auto de 800 kilos en menos de dos segundos. Nadie se salta un paso "porque ya lo ha hecho mil veces". Seguir el proceso no los hace lentos: es justo lo que los hace capaces de hacerlo tan rápido y tan bien.</p>
          <p class="lede" style="opacity:.8;margin-top:.9rem">Eso es lo que vas a firmar en la Parte 2. No es puro papeleo. Es la diferencia entre que algo salga bien o que alguien salga lastimado.</p>
        </div>`,
      note: 'Puente entre la Parte 1 y la Parte 2. El grupo acaba de ver el costo de saltarse el proceso; ahora les muestras qué se ve cuando el proceso sí se respeta bajo presión real, antes de que ellos mismos empiecen a firmar.'
    },
    {
      title: 'Ahora Firmas Tú', id: 'fase-2', chapter: 'Patio', cam: 'lowfront', mood: 'safe', speed: 0, anim: 'enter',
      html: () => `
        <div class="panel pad w-md mx phase brackets c-cyan accent-cyan">
          <div class="pn c-cyan">02</div>
          <div class="pt">Ahora Firmas Tú</div>
          <p class="lede" style="margin-top:1.1rem">Vamos a regresar esos noventa y dos días completos. Mismo patio, mismo camión, la misma prisa de siempre, el mismo operador esperando tu palabra.
          La diferencia es que esta vez <strong class="c-cyan">tú tomas las decisiones</strong>.</p>
          <div class="grid-3" style="margin-top:1.8rem">
            <div class="stat"><h4>Dinero disponible</h4><div class="v c-cyan num">$80,000</div></div>
            <div class="stat"><h4>Decisiones importantes</h4><div class="v num">13</div></div>
            <div class="stat"><h4>Finales posibles</h4><div class="v num">6</div></div>
          </div>
          <div class="steps">
            <span>1 · Revisa el camión</span><span>2 · Cinco pruebas</span><span>3 · La ruta y su final</span><span>4 · Tu resultado</span>
          </div>
          <p class="lede" style="margin-top:1.5rem;font-size:.95rem;opacity:.68">Desde aquí, cada decisión cuesta dinero de verdad, cambia el estado del camión, y queda anotada en tu resultado final.</p>
        </div>`,
      onEnter: () => { w.Scene3D.pulseLights(0xFB6500); },
      note: 'Aquí cambia la energía del aula. Sube la luz, pide que se sienten derechos. Frase de entrada: "la primera parte fue de alguien más; esta parte es de ustedes".'
    },

    /* ============ REVISIÓN DEL CAMIÓN (INICIO DE LA CADENA) ============ */
    {
      id: 'patio-brief', chapter: 'Patio', cam: 'top', mood: 'warn', speed: 0, anim: 'enter',
      html: (S) => `
        <div class="panel accent-cyan pad w-md mx brackets c-cyan" style="text-align:center">
          <div style="width:56px;height:56px;color:var(--cyan);margin:0 auto .9rem">${I('scan')}</div>
          <div class="kicker">5:40 de la mañana · Patio · Antes de que todo ocurra</div>
          <h2 class="title glow-cyan" style="margin-top:.6rem">Revisa el Camión Antes de Dejarlo Salir</h2>
          <p class="lede">El camión ya está cargado y el operador está esperando la luz verde. Tienes un escáner 3D y hay <strong>tres fallas escondidas</strong> por encontrar.</p>
          <p class="lede"><strong class="c-amber">Esta es la decisión que arrastra todo lo demás.</strong> Lo que dejes pasar aquí viaja contigo los 640 kilómetros de la ruta.</p>
          <button class="btn" data-act="forensic" style="margin-top:1.2rem">${I('scan')} Abrir el escáner 3D</button>
          <p class="lede ${S.forensicDone ? '' : 'hidden'}" id="forensic-done" style="margin-top:1rem;color:var(--green)">Revisión registrada. Avanza con → para ver el resumen.</p>
        </div>`,
      note: 'Entrega el control a un participante distinto para cada hallazgo. Pide que argumente en voz alta antes de decidir.'
    },

    {
      id: 'dossier', chapter: 'Patio', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter',
      html: (S) => {
        const map = { tires: ['Presión de las llantas', 'gauge'], brakes: ['Frenos de aire', 'brake'], kingpin: ['Enganche del remolque', 'link'] };
        const rows = Object.keys(map).map(k => {
          const st = S.truck[k];
          const c = st === 'ok' ? 'c-green' : st === 'fault' ? 'c-red' : 'c-dim';
          const txt = st === 'ok' ? 'CORREGIDO' : st === 'fault' ? 'SE DEJÓ PASAR ASÍ' : 'NO SE REVISÓ';
          return `<div class="dossier-row"><span>${map[k][0]}</span><b class="${c}">${txt}</b></div>`;
        }).join('');
        const faults = w.State.partsFaulty().length;
        const auditada = Object.keys(map).some(k => S.truck[k] !== 'pending');
        const verdict = !auditada
          ? '<span class="c-amber">El camión sale sin que nadie lo haya revisado a fondo. No sabes qué le pasa: cualquier cosa que no viste, viaja contigo los 640 km.</span>'
          : faults === 0
          ? '<span class="c-green">El camión sale en buenas condiciones. Cortaste el problema desde su origen.</span>'
          : `<span class="c-red">El camión sale con ${faults} falla${faults > 1 ? 's' : ''} sin corregir. Esa falla no desaparece: solo espera el momento justo para aparecer.</span>`;
        return `
        <div class="panel pad w-md mx">
          <div class="kicker">Antes de que salga a la carretera</div>
          <h2 class="title" style="margin-top:.5rem">Así Sale el Camión</h2>
          <div class="dossier" style="margin:1.2rem 0">${rows}</div>
          <p class="lede">${verdict}</p>
        </div>`;
      },
      onEnter: (ctx, S) => { w.Scene3D.mood(w.State.partsFaulty().length ? 'danger' : 'safe'); }
    },

    /* ============ ESTACIÓN 1 ============ */
    {
      title: 'Conoce el Camión de Memoria', id: 'explorador', chapter: 'Patio', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter',
      build: 'parts',
      notes: 'Deja que el grupo elija por dónde empezar. Cuando alguien salte una parte, no lo corrijas: pregúntale al final qué se le fue. El camión completo son 18 puntos y solo se acredita cuando los ve todos.'
    },

    {
      id: 'evidencia-patio', chapter: 'Patio', cam: 'trailer', mood: 'warn', speed: 0, anim: 'left',
      pulse: { question: '¿Cuántas veces esta semana te dijeron algo como "hazme el favor, ya vamos tarde"?', options: [
        { key: 'A', label: 'Ninguna vez' }, { key: 'B', label: 'Una o dos veces' }, { key: 'C', label: 'Varias veces' }, { key: 'D', label: 'Prácticamente todos los días' }
      ] },
      html: () => `
        <div class="panel accent-orange pad w-lg mx" style="text-align:center">
          <div class="kicker c-orange">Grabación real · Así presiona la prisa en el patio</div>
          <h2 class="title" style="margin-top:.5rem">"Hazme el Favor, Ya Vamos Tarde"</h2>
          ${media('videos/evidencia-patio.mp4', 'Interacción operador–instructor en patio')}
          ${pregunta('¿Cuántas veces esta semana te dijeron algo parecido? Ya te lo estamos preguntando en tu celular.')}
        </div>`,
      note: 'La pregunta ya se manda directo al celular de cada quien como votación real, no hace falta que la leas en voz alta si no quieres — pero ayuda mucho verla contestada en vivo frente al grupo.'
    },

    /* ============ MARCO ============ */
    {
      id: 'competencias', chapter: 'Marco', cam: 'cabin', mood: 'normal', speed: 0, anim: 'left',
      html: () => `
        <div class="panel accent-cyan pad w-md mx brackets c-cyan">
          <div class="kicker">Quién es de verdad un instructor</div>
          <h2 class="title" style="margin-top:.5rem">No Eres Solo Quien Firma los Papeles</h2>
          <p class="lede">Un instructor de verdad no solo explica cosas: <strong class="c-cyan">revisa que el camión esté bien de verdad, ayuda a que el operador no traiga tanta presión encima, y se mantiene firme aunque cueste dinero o tiempo.</strong></p>
          <div class="grid-3" style="margin-top:1.6rem">
            <div class="stat"><h4>El que revisa de verdad</h4><p class="lede" style="font-size:.95rem;margin:0">Comprueba lo que el operador dice. Que te digan "está bien" no es lo mismo que verlo tú mismo.</p></div>
            <div class="stat"><h4>El que baja la presión</h4><p class="lede" style="font-size:.95rem;margin:0">Se encarga de que la prisa de la empresa no le llegue al operador cuando va manejando.</p></div>
            <div class="stat"><h4>El último que puede decir "no"</h4><p class="lede" style="font-size:.95rem;margin:0">Es quien tiene la autoridad de detener algo que ya estaba en marcha.</p></div>
          </div>
        </div>`
    },

    /* ============ MARCO · CUATRO COSAS QUE NUNCA SE DEBEN APAGAR ============ */
    {
      id: 'udat', chapter: 'Marco', cam: 'cabin', mood: 'normal', speed: 0, anim: 'left',
      html: () => `
        <div class="panel accent-cyan pad w-lg mx brackets">
          <div class="kicker c-cyan">El tablero de un buen operador</div>
          <h2 class="title">Cuatro Cosas Que Nunca Deben Apagarse</h2>
          <p class="lede" style="margin-bottom:.4rem">Cuando un operador comete un error, casi nunca es porque "no sabía". Es porque, justo en ese momento, algo en él se apagó. Hay 4 cosas que siempre deben estar encendidas, como los focos de un tablero.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1.1rem">Toca cada letra para abrirla.</p>
          <div class="rv-set c4" data-set="piel">
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">P</div>
              <div class="rv-t">Pensar antes</div>
              <div class="rv-s">Anticipar el riesgo</div>
              <div class="rv-body">
                <p>Calcular con tiempo, antes de que sea urgente: cuánto le queda de combustible, cuándo necesita parar a descansar, cómo va a estar el clima más adelante.</p>
                <p><em>Se enseña</em> pidiéndole que diga el número exacto en voz alta, no solo "voy bien".</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">I</div>
              <div class="rv-t">Poner atención</div>
              <div class="rv-s">Ver para poder reaccionar</div>
              <div class="rv-body">
                <p>Fijarse en lo que pasa alrededor: el carro que se mueve raro, el que le está presionando por radio, el compañero que esconde una falla.</p>
                <p><em>Se enseña</em> preguntando "¿qué crees que va a hacer ese carro?", no solo "¿qué ves?".</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--orange)">
              <div class="rv-let">E</div>
              <div class="rv-t">Hacerlo bien</div>
              <div class="rv-s">Dominar la maniobra</div>
              <div class="rv-body">
                <p>La maniobra hecha bien aunque nadie esté viendo: el tirón de prueba, bajar usando el motor, comprobar que el enganche quedó firme.</p>
                <p><em>Se enseña</em> con las manos del operador, nunca haciéndolo tú por él.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">L</div>
              <div class="rv-t">Saber decir "no"</div>
              <div class="rv-s">Sostener la decisión correcta</div>
              <div class="rv-body">
                <p>Mantener la decisión correcta aunque cueste dinero, tiempo, o quedar mal con un jefe.</p>
                <p><em>Se enseña</em> respaldando en público al operador que se detuvo a tiempo.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
          <p class="lede" style="margin-top:1.2rem;font-size:.92rem;opacity:.8">Arnulfo no falló en "Hacerlo bien": él sí sabía manejar. Falló en <strong class="c-green">saber decir "no"</strong>, y nadie se lo había enseñado nunca.</p>
        </div>`,
      notes: 'No expliques las cuatro letras: haz que el grupo las abra. Al cerrar, pregunta en cuál de las cuatro falló el caso de la Parte 1 y deja que discutan. La respuesta es "saber decir no".'
    },
    {
      title: 'Practica reconocerlas', id: 'piel-aplicado', chapter: 'Marco', cam: 'hood', mood: 'warn', speed: 0.4, anim: 'enter',
      build: 'piel',
      notes: 'Ejercicio de lenguaje común. Si el instructor no sabe reconocer cuál de las 4 falló, su corrección se queda en "hazlo bien" y no cambia nada. Insiste: reconocerla bien es lo que te permite diseñar el ejercicio correcto para reforzarla.'
    },
    {
      id: 'andragogia', chapter: 'Marco', cam: 'wide', mood: 'normal', speed: 0, anim: 'right',
      html: () => `
        <div class="panel pad w-sm mx" style="text-align:center">
          <div style="width:56px;height:56px;color:var(--cyan);margin:0 auto 1rem">${I('brain')}</div>
          <h2 class="title">¿Cómo Aprende un Adulto?</h2>
          <p class="lede">Un adulto no aprende con teoría abstracta. Necesita <strong class="c-cyan">algo que le sirva ya, poder practicarlo con guía, y ver la consecuencia con sus propios ojos.</strong></p>
          <p class="lede" style="opacity:.8">Por eso a partir de aquí ya no hay más diapositivas que leer: hay un camión que revisar, un operador que acompañar, y un presupuesto que puedes gastar de más.</p>
        </div>`,
      note: 'Aquí cambia el contrato con el grupo: de espectadores a operadores. Dilo explícitamente.'
    },

    /* ============ FASE 2 · SIMULADOR ============ */

    /* ============ MARCO · LOGRAR EL CAMBIO REAL ============ */
    {
      id: 'cambio-real', chapter: 'Marco', cam: 'wide', mood: 'normal', speed: 0, anim: 'right',
      html: () => `
        <div class="panel accent-cyan pad w-lg mx brackets">
          <div class="kicker c-cyan">Cómo se logra un cambio que sí dura</div>
          <h2 class="title">Solo Explicarle No Cambia a Nadie</h2>
          <p class="lede" style="margin-bottom:.4rem">Un operador no cambia una costumbre solo porque le dijeron que estaba mal. Cambia cuando se juntan tres cosas. Si falta una, la costumbre regresa en dos semanas.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1.1rem">Toca cada una.</p>
          <div class="rv-set c3" data-set="cambio">
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">01</div>
              <div class="rv-t">Que a él le importe</div>
              <div class="rv-s">No que te importe a ti</div>
              <div class="rv-body">
                <p>El operador tiene que encontrar su propia razón. La tuya no le sirve. La de la empresa, menos.</p>
                <p><em>Se logra</em> preguntándole por lo que sí le importa a él: su casa, sus hijos, su licencia, su nombre en el patio.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">02</div>
              <div class="rv-t">Un paso a la vez</div>
              <div class="rv-s">No todo junto</div>
              <div class="rv-body">
                <p>Nadie cambia doce costumbres el lunes. Se elige una, se practica hasta que ya no cuesta trabajo, y hasta entonces se sigue con la siguiente.</p>
                <p><em>Se logra</em> acordando un solo compromiso, medible, por semana.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">03</div>
              <div class="rv-t">Que no esté solo</div>
              <div class="rv-s">Acompañamiento real</div>
              <div class="rv-body">
                <p>La costumbre nueva es frágil. Si nadie le pregunta cómo le va las primeras semanas, la prisa del patio se la borra.</p>
                <p><em>Se logra</em> con seguimiento en fechas fijas, no con la promesa de "cualquier cosa me buscas".</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
        </div>`,
      notes: 'Pregunta directa al grupo: de las tres, ¿cuál es la que su empresa nunca da? Casi siempre responden "acompañamiento real". Ese es el hallazgo del bloque.'
    },
    {
      title: 'Cómo se aprende de verdad', id: 'ciclo', chapter: 'Marco', cam: 'cabin', mood: 'normal', speed: 0, anim: 'enter',
      build: 'ciclo',
      notes: 'Este orden no es negociable. La mayoría de los instructores empieza practicando la maniobra y termina explicando el porqué, y por eso el operador practica sin saber para qué.'
    },
    /* ============ ESTACIÓN 1 ============ */
    {
      id: 'est-1', chapter: 'Estación 1', cam: 'trailer', mood: 'warn', speed: 0, anim: 'left', vote: true, question: 'El papel no cuadra con el peso real: ¿qué decides?',
      html: () => `
        <div class="panel accent-orange pad w-md mx">
          <div class="kicker c-orange">Estación 1 de 5 · El papel, el peso, y lo que traes cargando</div>
          <h2 class="title" style="margin-top:.5rem">El Papel No Cuadra</h2>
          <p class="lede">La báscula marca <strong>28.4 toneladas</strong>; el papel de la carga dice <strong>26.0 toneladas</strong>. Por radio te dicen: "así la mandó el cliente, no le muevas". Hay un retén de la Guardia Nacional a 90 kilómetros.</p>
          ${mods(['Las reglas que sí tienes que conocer', 'Revisar el camión a fondo, no por encima', 'Cómo pesar y medir bien una carga', 'Cuidar lo que te confían'])}
        </div>`,
      choices: [
        { key: 'A', label: 'Salir con el papel tal como está', hint: 'Es problema del cliente, no tuyo', tone: 'bad', cost: 9000, driver: { stress: 12, trust: -10 }, flag: 'firmoPresion',
          verdict: 'Que te lo digan por radio no te quita la responsabilidad: si algo pasa, tú también respondes. Sobrepeso no declarado: multa federal, y si hay un accidente, el seguro puede negarse a pagar.' },
        { key: 'B', label: 'Corregir el papel sin volver a pesar', hint: 'Cambiar el número y avanzar', tone: 'mid', cost: 3000, driver: { stress: 5 }, xp: 20,
          verdict: 'Arreglas el papel, no el hecho. Si el peso real es distinto al que anotaste, ya no es un error: es un documento oficial alterado.' },
        { key: 'C', label: 'Volver a pesar, dejarlo por escrito, y avisarle al cliente', hint: 'Cuesta tiempo, pero protege a todos', tone: 'good', cost: 1200, xp: 140, driver: { trust: 10, stress: -5 },
          verdict: 'Correcto. Perdiste 40 minutos y $1,200 de espera. A cambio evitaste una multa federal, que el seguro se negara a pagar, y le enseñaste al operador dónde está el límite.' }
      ],
      note: 'Estación 1 cubre 4 temas normativos. Si eligen C, subraya que la decisión correcta SÍ tuvo un costo: hacer lo correcto no es gratis, pero sí es barato comparado con lo otro.'
    },

    {
      id: 'f1', chapter: 'Estación 1', cam: 'axle', mood: 'normal', speed: 0.3, anim: 'right',
      html: () => `
        <div class="panel accent-cyan pad w-lg mx" style="text-align:center">
          <div class="kicker">Una pausa para pensarlo</div>
          <h2 class="title" style="margin-top:.5rem">¿Y Si Nadie Se Hubiera Dado Cuenta?</h2>
          <p class="lede">Nadie iba a saber que el papel no cuadraba con el peso real. El retén estaba lejos. El cliente ya lo había mandado así. Nadie te lo iba a reclamar si lo dejabas pasar.</p>
          ${pregunta('¿Cuántas veces han dejado pasar algo así, sabiendo que "probablemente" nadie se iba a dar cuenta? ¿Qué fue lo que los hizo decidir así?')}
        </div>`,
      pulse: { question: '¿Qué tan seguido dejas pasar algo pensando "de todos modos nadie se va a dar cuenta"?', options: [
        { key: 'A', label: 'Casi nunca' }, { key: 'B', label: 'De vez en cuando' }, { key: 'C', label: 'Más seguido de lo que quisiera' }
      ] }
    },

    /* ============ ESTACIÓN 2 ============ */
    {
      id: 'est-2', chapter: 'Estación 2', cam: 'cabin', mood: 'warn', speed: 0, anim: 'left', vote: true, question: 'El operador no durmió: ¿lo dejas salir a la ruta?',
      html: () => `
        <div class="panel pad w-md mx">
          <div class="kicker c-cyan">Estación 2 de 5 · Lo que le pasa por dentro al operador</div>
          <h2 class="title" style="margin-top:.5rem">El Operador Que No Durmió</h2>
          <p class="lede">Lleva tres meses trabajando contigo. Llega esquivo, con los ojos rojos; dice que sí durmió sus ocho horas. Su prueba de reacción salió mal, y un compañero comenta que se pasó la noche haciendo una mudanza. Cuando le preguntas, se pone a la defensiva frente a otros tres compañeros.</p>
          ${mods(['Entender por qué actúan así los operadores', 'Mantener la calma y saber leer el momento', 'Qué hacer cuando alguien se pone a la defensiva', 'Hablar claro sin generar pleito', 'Detectar cuando algo más serio está pasando'])}
        </div>`,
      choices: [
        { key: 'A', label: 'Regañarlo ahí mismo, frente a todos', hint: 'Que sirva de ejemplo para los demás', tone: 'bad', driver: { trust: -28, stress: 22 }, cost: 0,
          verdict: 'Conseguiste que te obedezca, pero perdiste que te cuente la verdad. Desde hoy, este operador te va a esconder exactamente lo que necesitas saber para poder ayudarlo.' },
        { key: 'B', label: 'Anotarlo en la bitácora y dejarlo salir', hint: 'Al menos queda registrado', tone: 'mid', driver: { fatigue: 18, trust: -6 },
          verdict: 'La bitácora te cubre a ti legalmente. No protege al operador, ni al camión. Anotar un riesgo sin resolverlo es solo dejarlo por escrito, no evitarlo.' },
        { key: 'C', label: 'Hablar con él a solas, escucharlo de verdad, y decidir juntos', hint: 'Apartarlo del grupo y preguntarle en serio', tone: 'good', xp: 150, driver: { trust: 22, stress: -12, fatigue: -6 },
          verdict: 'Correcto. Al sacarlo de enfrente de sus compañeros, dejó de tener que defenderse. Aceptó que no había dormido y accedió a salir dos horas después. Así se maneja esto bajo presión.' }
      ],
      note: 'Momento clave del curso. Pregunta al grupo: ¿por qué creen que el operador mintió? Respuesta: porque decir la verdad le iba a costar el viaje, y el viaje es lo que le paga la quincena.'
    },

    {
      id: 'retro-empatia', chapter: 'Estación 2', cam: 'wide', mood: 'normal', speed: 0, anim: 'right',
      html: () => `
        <div class="panel accent-green pad w-lg mx brackets">
          <div class="kicker c-green">Herramientas del instructor</div>
          <h2 class="title">Corregir Sin Romper la Confianza</h2>
          ${media('videos/retro-pablo-lelluvia.mp4', 'Pablo Lelluvia corrige a un operador a la defensiva, sin perder su confianza')}
          <p class="lede" style="margin-bottom:.4rem">Antes de pararte frente a un operador con malas costumbres, necesitas seguir un orden. No son consejos sueltos: es una secuencia que no se puede saltar.</p>
          <p class="lede" style="opacity:.72;font-size:.9rem;margin-bottom:1rem">Toca cada paso.</p>
          <div class="rv-s" style="margin-bottom:.5rem">Cómo corregir sin que se cierre</div>
          <div class="rv-set c3" data-set="retro">
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">1</div>
              <div class="rv-t">Empieza por algo bueno, real</div>
              <div class="rv-s">Que sea cierto, no un cumplido</div>
              <div class="rv-body">
                <p>Menciona algo que sí hizo bien y que puedas comprobar. No es por cortesía: es lo que le baja la guardia para poder escuchar lo demás.</p>
                <p><em>Cuidado:</em> el cumplido genérico ("vas bien") se siente como el anuncio de un regaño, y logra el efecto contrario.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">2</div>
              <div class="rv-t">Sé claro y con datos</div>
              <div class="rv-s">Hechos, no calificativos</div>
              <div class="rv-body">
                <p>"El martes saliste con la llanta del eje 3 baja de presión" se puede platicar. "Eres descuidado" solo genera pleito.</p>
                <p><em>Orden:</em> primero la fecha, después el hecho, y al final qué pudo pasar.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--amber)">
              <div class="rv-let">3</div>
              <div class="rv-t">Termina con un plan</div>
              <div class="rv-s">Qué, cómo y cuándo</div>
              <div class="rv-body">
                <p>Una plática sin un acuerdo concreto es solo desahogo. Define qué va a hacer distinto, cómo lo vas a comprobar, y para cuándo.</p>
                <p><em>Y que lo diga él,</em> no tú. El compromiso que dice el propio operador se cumple; el que se le impone, se negocia.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
          <div class="rv-s" style="margin:1.2rem 0 .5rem">Cuando se pone a la defensiva</div>
          <div class="rv-set c3" data-set="empatia">
            <div class="rv" style="--rvc:var(--cyan)">
              <div class="rv-let">1</div>
              <div class="rv-t">Escúchalo primero</div>
              <div class="rv-s">Antes de hablar tú</div>
              <div class="rv-body">
                <p>Déjalo explicar por qué lo hace así. Casi siempre hay una razón real de trabajo detrás de la mala costumbre.</p>
                <p><em>Si no la conoces,</em> vas a corregir el síntoma, y la costumbre regresa el lunes.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--green)">
              <div class="rv-let">2</div>
              <div class="rv-t">Es para cuidarlo, no para castigarlo</div>
              <div class="rv-s">Cambia cómo se lo dices</div>
              <div class="rv-body">
                <p>Explícale que la regla existe para cuidar su licencia, su patrimonio, y que llegue bien a su casa. No para que la empresa quede bien.</p>
                <p><em>Frase que funciona:</em> "esto no es para que no te multen, es para que no lo pagues tú".</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
            <div class="rv" style="--rvc:var(--orange)">
              <div class="rv-let">3</div>
              <div class="rv-t">Que gane algo, no solo la empresa</div>
              <div class="rv-s">Beneficio claro para él</div>
              <div class="rv-body">
                <p>Que le quede claro qué gana él con hacerlo bien: menos desgaste, menos reportes, su bono completo, menos tiempo parado en retenes.</p>
                <p><em>Si solo gana la empresa,</em> él va a cumplir nada más cuando lo estés viendo.</p>
              </div>
              <div class="rv-hint">Ver</div>
            </div>
          </div>
        </div>`,
      notes: 'Estas seis piezas son el kit que van a usar en la micro-clase de la siguiente escena. Pide que anoten los dos órdenes antes de avanzar: se les va a olvidar en cuanto tengan al operador enfrente.'
    },
    {
      id: 'micro-brief', chapter: 'Estación 2', cam: 'cabin', mood: 'warn', speed: 0, anim: 'left',
      html: () => `
        <div class="panel accent-amber pad w-lg mx brackets c-amber">
          <div class="kicker c-amber">Estación 2 · Lo que le pasa por dentro al operador</div>
          <h2 class="title">Saber No Es lo Mismo Que Enseñar</h2>
          <p class="lede">Ya recorriste los 18 puntos del camión y sabes exactamente qué se revisa en cada uno.
          Eso te hace un buen técnico. Todavía no te hace instructor.</p>
          <p class="lede">Quien firmó el examen de Arnulfo en 4 minutos no era alguien que no supiera el procedimiento. Era alguien que lo sabía
          <strong class="c-red">y no logró transmitírselo</strong>. Esa diferencia es justo lo que se pone a prueba ahora.</p>
          <div class="grid-3" style="margin-top:1.6rem">
            <div class="stat"><h4>Operadores disponibles</h4><div class="v c-cyan num">3</div></div>
            <div class="stat"><h4>Momentos a preparar</h4><div class="v num">4</div></div>
            <div class="stat"><h4>Tiempo de la clase</h4><div class="v c-amber num">3:00</div></div>
          </div>
          <p class="lede" style="margin-top:1.4rem;opacity:.75;font-size:.94rem">Se evalúa cómo preparaste tu clase (60%) y lo que el grupo observa cuando la das de verdad frente a ellos (40%).</p>
        </div>`,
      notes: 'Aquí se cambia el chip. Hasta ahora revisaron un camión; ahora los va a revisar el grupo a ellos. Pide que el participante realmente se pare y hable: el ejercicio pierde todo su valor si solo se hace mentalmente.'
    },
    {
      title: 'Da tu primera clase', id: 'microclase', chapter: 'Estación 2', cam: 'follow', mood: 'normal', speed: 0, anim: 'enter',
      build: 'microclase',
      notes: 'Elige un voluntario para hacer de operador. El resto del grupo marca la rúbrica en tiempo real, tú no. Al terminar, la primera pregunta es siempre para el que hizo de operador: "¿te dieron ganas de cambiar?".'
    },
    {
      title: 'Practica bajo presión', id: 'ing-estres', chapter: 'Estación 2', cam: 'follow', mood: 'warn', speed: 0.5, anim: 'left',
      build: 'estres',
      notes: 'Aquí suelen resistirse: "no quiero estresar a mi gente". Aclara que el estrés ya existe en la carretera; lo único que se decide aquí es si aparece por primera vez contigo, o solo cuando ya no puedas ayudarlo.'
    },
    {
      id: 'pc-06', chapter: 'Estación 2', cam: 'axle', mood: 'warn', speed: 0, anim: 'right', vote: true, question: 'Se va a equivocar frente al grupo: ¿qué haces?',
      html: () => `
        <div class="panel accent-amber pad w-md mx brackets c-amber">
          <div class="kicker c-amber">Punto de control 06 · qué tipo de instructor eres</div>
          <h2 class="title" style="margin-top:.5rem">Se Va a Equivocar Frente a Ti</h2>
          <p class="lede">Ensayo de enganche en un patio cerrado. El operador engancha y va a arrancar <strong class="c-red">sin hacer el tirón de prueba</strong>. No hay riesgo inmediato: el patio está despejado y vas subido con él.</p>
          <p class="lede" style="opacity:.8">Tienes tres segundos para decidir qué tipo de instructor eres.</p>
        </div>`,
      choices: [
        { key: 'A', label: 'Tomar tú el volante y detener el camión', hint: 'Corriges el riesgo de inmediato', tone: 'bad', cost: 2500, driver: { trust: -12, stress: 10 }, flag: 'intervinoFisico',
          verdict: 'Salvaste el ejercicio y perdiste la lección. Cuando el instructor toma el control, el operador aprende que alguien más lo va a atrapar si se equivoca. En la carretera, ahí no va nadie más.' },
        { key: 'B', label: 'Dejarlo salir así y reclamarle después', hint: 'Que sienta la consecuencia completa', tone: 'mid', cost: 1500, driver: { trust: -4 }, xp: 20,
          verdict: 'Tienes la prueba de lo que hizo mal, pero la conseguiste arriesgando un posible accidente en el patio. El error se debe dejar ver, no dejar que pase de verdad.' },
        { key: 'C', label: 'Preguntarle: "¿qué te falta antes de moverte?"', hint: 'Que él mismo se dé cuenta', tone: 'good', cost: 0, xp: 150, driver: { trust: 14, stress: -4 }, flag: 'indujoDecision',
          verdict: 'Correcto. La pregunta le regresa la responsabilidad al operador y no arruina el aprendizaje. El instructor no evita el error: lo convierte en el momento donde se aprende a decidir bien.' }
      ],
      note: 'Este es el punto donde se separa al instructor real del que solo acompaña. Pregunta al grupo cuántos hubieran tomado el volante: casi todos. Ese reflejo es el que hay que quitarles.'
    },

    /* ============ RUTA ============ */
    {
      id: 'ruta-inicio', chapter: 'Ruta', cam: 'follow', mood: 'normal', speed: 1, anim: 'enter',
      html: (S) => `
        <div class="panel accent-cyan pad w-md to-left brackets c-cyan">
          <div class="kicker">Km 0 · Salida autorizada</div>
          <h2 class="title" style="margin-top:.5rem">La Ruta Comienza</h2>
          <div class="media-row">
            ${media('videos/ruta-inicio.mp4', 'La presión de la ventana de entrega crece kilómetro a kilómetro', null, 'La presión de la ventana de entrega')}
            ${media('videos/maniobra.mp4', 'Maniobra de salida verificada antes de tomar la ruta', null, 'La maniobra de salida')}
          </div>
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
      id: 'est-5', chapter: 'Cierre Formativo', cam: 'cabin', mood: 'normal', speed: 0.2, anim: 'left', vote: true, question: 'Veinte minutos que valen la ruta: ¿qué decides?',
      html: () => `
        <div class="panel accent-cyan pad w-md mx">
          <div class="kicker">El viaje ya terminó · Cierre formativo</div>
          <h2 class="title" style="margin-top:.5rem">Veinte Minutos Que Valen la Ruta</h2>
          <p class="lede">El viaje ya terminó, haya salido bien o mal. Tienes veinte minutos con el operador antes de que se vaya a descansar. Es la única ventana real de aprendizaje de todo lo que acaba de pasar.</p>
          ${mods(['El ciclo de aprendizaje de Kolb, explicado simple', 'Cómo dar retroalimentación que sí cambia conducta', 'Liderazgo de cero tolerancia', 'Evaluación por competencias', 'Trascendencia y bienestar familiar'])}
        </div>`,
      choices: [
        { key: 'A', label: 'Entregarle el reporte de faltas por escrito', hint: 'Firmado de enterado y a descansar', tone: 'bad', driver: { trust: -16 },
          verdict: 'Un documento no es retroalimentación. Cerraste el expediente y dejaste la experiencia sin procesar: nadie aprendió nada de lo que acaba de pasar.' },
        { key: 'B', label: 'Felicitarlo en general para no desmotivarlo', hint: 'Ya pasó, no hay que darle más vueltas', tone: 'mid', xp: 40, driver: { trust: 6 },
          verdict: 'El elogio genérico no cambia nada. Se siente bien hoy y va a repetir exactamente lo mismo mañana.' },
        { key: 'C', label: 'Platicar completo: qué pasó, qué sintió, qué haría distinto, y un compromiso por escrito', hint: 'La conversación completa, en 20 minutos', tone: 'good', xp: 190, driver: { trust: 26, stress: -12 },
          verdict: 'Correcto. Primero lo que pasó, después cómo se sintió, luego qué aprendió, y al final un compromiso concreto. El compromiso escrito y firmado por él, no por ti, es lo que convierte el viaje en aprendizaje real.' }
      ]
    },
    {
      title: 'Mentoría correctiva', id: 'telemetria', chapter: 'Cierre Formativo', cam: 'follow', mood: 'warn', speed: 0.3, anim: 'left',
      build: 'telemetria',
      notes: 'La telemetría no acusa: abre la conversación. Si la usas como prueba en un juicio, el operador aprende a esconderse del sensor, no a manejar mejor.'
    },
    {
      id: 'roles-3', chapter: 'Cierre Formativo', cam: 'cabin', mood: 'normal', speed: 0.2, anim: 'left',
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
      id: 'medicion', chapter: 'Cierre Formativo', cam: 'top', mood: 'warn', speed: 0.2, anim: 'right',
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
      id: 'eval-brief', chapter: 'Cierre Formativo', cam: 'top', mood: 'warn', speed: 0, anim: 'right',
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
      title: 'Constructor del instrumento', id: 'evconstruye', chapter: 'Cierre Formativo', cam: 'wide', mood: 'normal', speed: 0, anim: 'enter',
      build: 'evconstruye',
      notes: 'Dales tiempo real: 12 a 15 minutos. Recorre el salón y pregunta por qué eligieron un criterio y no otro. Insiste en que redacten al menos dos criterios propios.'
    },
    {
      title: 'Tu hoja frente a tres operadores', id: 'evaplica', chapter: 'Cierre Formativo', cam: 'cabin', mood: 'warn', speed: 0, anim: 'left',
      build: 'evaplica',
      notes: 'Momento clave del bloque. Si su instrumento aprueba al Borras, no los rescates: deja que el silencio haga el trabajo antes de explicar.'
    },
    {
      title: 'Aplícalo a tu gente', id: 'evcampo', chapter: 'Cierre Formativo', cam: 'top', mood: 'normal', speed: 0, anim: 'right',
      build: 'evcampo',
      notes: 'Que escriban el nombre real de un operador de su flota. Al terminar pueden descargar la hoja y usarla el lunes. Eso convierte el curso en herramienta.'
    },
    {
      id: 'pc-07', chapter: 'Cierre Formativo', cam: 'lowfront', mood: 'warn', speed: 0.2, anim: 'left', vote: true, question: 'El operador se detuvo: ¿cómo respondes?',
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
      id: 'indicador', chapter: 'Cierre Formativo', cam: 'trailer', mood: 'safe', speed: 0.3, anim: 'enter',
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