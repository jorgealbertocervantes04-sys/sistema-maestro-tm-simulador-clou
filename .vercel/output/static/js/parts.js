/* ============================================================
   EXPLORADOR DE UNIDAD — intercambia entre todas las partes
   del tractocamión doble remolque y practica el punto de
   enseñanza de cada una.
   ============================================================ */
(function (w) {
  const I = w.svgIcon;

  const PARTS = [
    { id: 'front', g: 'Tractor', cam: 'front', mood: 'normal', n: 'Frente y faros',
      spec: 'Faros principales, defensa y punto de arranque del recorrido de inspección.',
      chk: 'Ambos faros encienden en bajas y altas, cristales sin opacidad ni fisura, defensa sin deformación.',
      ens: 'Aquí empieza el 360°. Si el operador arranca la revisión por otro lado, pierde la secuencia y siempre se le va la misma pieza.',
      risk: 'Un faro fundido en carretera nocturna es infracción y es el 40% del campo visual del operador.' },

    { id: 'cabin', g: 'Tractor', cam: 'cabin', mood: 'normal', n: 'Cabina y parabrisas',
      spec: 'Puesto de conducción, parabrisas, limpiadores y accesos.',
      chk: 'Parabrisas sin estrella en el campo visual, plumillas que no rayan, peldaños y agarraderas firmes.',
      ens: 'Pídele que suba y baje frente a ti. Tres puntos de apoyo siempre. Es la caída más común y la que nadie reporta.',
      risk: 'Las caídas al descender son la primera causa de incapacidad temporal en patio.' },

    { id: 'mirrors', g: 'Tractor', cam: 'mirrors', mood: 'normal', n: 'Espejos y visibilidad',
      spec: 'Espejo principal, convexo y espejo de acera en ambos costados.',
      chk: 'Ajustados con la unidad cargada, sin vibración, sin cinta ni improvisaciones.',
      ens: 'Que ajuste los espejos con la unidad ya enganchada, nunca vacía. El ángulo cambia por completo con el remolque puesto.',
      risk: 'El punto ciego del costado derecho es donde ocurre la mayoría de los enganches con vehículos ligeros.' },

    { id: 'galibo', g: 'Tractor', cam: 'galibo', mood: 'normal', n: 'Luces de gálibo',
      spec: 'Marcadores superiores de cabina y perfil de la unidad.',
      chk: 'Las cinco luces superiores encendidas y del color reglamentario.',
      ens: 'Enséñale que estas luces le dicen al resto del mundo qué tan alta y qué tan larga es la unidad. Es información, no adorno.',
      risk: 'Sin gálibo, un vehículo que rebasa de noche no calcula el largo real del Full.' },

    { id: 'stacks', g: 'Tractor', cam: 'stacks', mood: 'normal', n: 'Escapes verticales',
      spec: 'Ductos de escape y sistema de emisión.',
      chk: 'Sin fuga visible, abrazaderas apretadas, sin humo negro persistente en marcha mínima.',
      ens: 'El color del humo es un diagnóstico gratuito. Enséñale a leerlo antes de salir, no cuando ya está en la báscula.',
      risk: 'Una fuga de escape cerca de la cabina es riesgo de monóxido en trayectos largos.' },

    { id: 'tanks', g: 'Tractor', cam: 'tanks', mood: 'warn', n: 'Tanques de combustible',
      spec: 'Tanques laterales, tapones y soportes.',
      chk: 'Tapones apretados, sin escurrimiento, soportes sin fractura, nivel congruente con la ruta planeada.',
      ens: 'Que calcule el combustible contra la ruta antes de salir. Una parada no planeada es una parada insegura.',
      risk: 'Un escurrimiento sobre el escape es el origen más común de incendio en unidad.' },

    { id: 'tires', g: 'Rodada', cam: 'axle', mood: 'warn', n: 'Llantas y presión',
      spec: 'Doce posiciones de rodada entre tractor, caja 1, dolly y caja 2.',
      chk: 'Presión con manómetro en cada posición, profundidad mínima de dibujo, sin cortes ni abultamientos, sin piedra entre duales.',
      ens: 'Nada de patadas. Manómetro en mano y que él tome la lectura mientras tú anotas. Que la evidencia la genere el operador.',
      risk: 'El dual interior es la posición que más revienta porque es la única que no se ve desde afuera.' },

    { id: 'brakes', g: 'Rodada', cam: 'axle', mood: 'warn', n: 'Frenos de aire',
      spec: 'Cámaras, varillas de ajuste, líneas neumáticas y tambores.',
      chk: 'Prueba de fuga estática, corte de gobernador, recorrido de varilla dentro de tolerancia, tambores sin fisura térmica.',
      ens: 'Haz la prueba de fugas con él contando en voz alta los segundos. El número lo tiene que decir el operador, no tú.',
      risk: 'Una pérdida lenta de aire no se siente en el patio: se siente en la primera bajada larga.' },

    { id: 'axle', g: 'Rodada', cam: 'axle', mood: 'normal', n: 'Ejes y suspensión',
      spec: 'Eje direccional, dos motrices y ejes de remolque.',
      chk: 'Bolsas de aire sin fuga ni fisura, muelles completos, amortiguadores sin escurrimiento, tuercas con testigo alineado.',
      ens: 'Los testigos de tuerca son el truco más barato que le puedes enseñar: se leen en tres segundos desde lejos.',
      risk: 'Una tuerca floja anuncia el desprendimiento de rueda con varios días de anticipación.' },

    { id: 'kingpin', g: 'Acoplamiento', cam: 'kingpin', mood: 'danger', n: 'Quinta rueda y perno rey',
      spec: 'Plato de acoplamiento, mordaza, pasador de seguridad y engrase.',
      chk: 'Tirón de prueba en baja, mordaza cerrada y visible, pasador insertado, plato engrasado, sin luz entre plato y placa.',
      ens: 'Que haga el tirón de prueba contigo abajo mirando la mordaza. Es la única verificación que no se puede fingir.',
      risk: 'Un enganche mal cerrado es desacoplamiento en el primer tope: pérdida total y proyectil en carretera.' },

    { id: 'landing', g: 'Acoplamiento', cam: 'landing', mood: 'normal', n: 'Tren de aterrizaje',
      spec: 'Patines de apoyo de la caja 1 y su manivela.',
      chk: 'Completamente arriba antes de mover, manivela asegurada, patines sin dobladura ni base faltante.',
      ens: 'Recorre con él la secuencia: primero mordaza, luego líneas, al final patines. El orden evita el 90% de los errores.',
      risk: 'Un patín a media altura arranca de raíz al primer reductor de velocidad.' },

    { id: 'hoses', g: 'Acoplamiento', cam: 'hoses', mood: 'warn', n: 'Mangueras y conexiones',
      spec: 'Líneas de servicio y emergencia, cable eléctrico y soportes.',
      chk: 'Sin roce contra el chasis, empaques íntegros, conexiones a tope, sin cinta de reparación.',
      ens: 'Que jale suavemente cada línea frente a ti. Si una se mueve, la ve él mismo y ya no hay discusión.',
      risk: 'Una manguera rozada revienta en curva y aplica el freno de emergencia sin aviso.' },

    { id: 'dolly', g: 'Acoplamiento', cam: 'dolly', mood: 'danger', n: 'Dolly y lanza',
      spec: 'Conjunto convertidor entre caja 1 y caja 2.',
      chk: 'Lanza sin fisura en soldadura, pasador con seguro, quinta rueda del dolly cerrada, cadenas de seguridad cruzadas.',
      ens: 'Es la pieza que menos se revisa del Full y la que más lo desestabiliza. Dedícale tiempo explícito en cada validación.',
      risk: 'El efecto de latigazo del segundo remolque nace aquí y se amplifica con la velocidad.' },

    { id: 'trailer', g: 'Carga', cam: 'trailer', mood: 'normal', n: 'Caja 1',
      spec: 'Primera caja seca, costillas estructurales y travesaño inferior.',
      chk: 'Puertas con sello, carga amarrada y distribuida, sin abolladura estructural, techo sin perforación.',
      ens: 'Que te explique cómo distribuyó el peso. Si no lo sabe explicar, no lo sabe hacer.',
      risk: 'Carga mal distribuida cambia el centro de gravedad y adelanta el punto de volcadura.' },

    { id: 'box2', g: 'Carga', cam: 'box2', mood: 'normal', n: 'Caja 2',
      spec: 'Segunda caja del Full, la que más se amplifica en maniobra.',
      chk: 'Mismo criterio que la caja 1, más verificación de que la carga más pesada quedó al frente del convoy.',
      ens: 'Regla simple para que la recuerde: lo pesado adelante, lo ligero atrás. Que la repita en voz alta.',
      risk: 'Caja 2 más pesada que caja 1 es la receta exacta del efecto tijera.' },

    { id: 'mudflap', g: 'Carga', cam: 'mudflap', mood: 'normal', n: 'Faldones y guardapolvos',
      spec: 'Protecciones traseras de cada conjunto de rodada.',
      chk: 'Completos, a la altura reglamentaria, sin desgarre ni faltantes.',
      ens: 'Parece detalle menor y es la observación más frecuente en revisión de carretera. Enséñale que lo menor también se firma.',
      risk: 'Piedra proyectada contra un vehículo ligero: daño a tercero con responsabilidad directa.' },

    { id: 'taillamp', g: 'Carga', cam: 'taillamp', mood: 'warn', n: 'Luces traseras',
      spec: 'Cuartos, direccionales, luz de freno y reflejantes del último remolque.',
      chk: 'Prueba con apoyo: alguien afuera mientras el operador acciona. Reflejantes limpios y completos.',
      ens: 'Nunca dejes que verifique luces solo. Enséñale a pedir apoyo: pedir ayuda también es una competencia.',
      risk: 'Sin luz de freno, el vehículo que viene atrás calcula la distancia con información falsa.' },

    { id: 'rear', g: 'Carga', cam: 'rear', mood: 'normal', n: 'Vista de cierre',
      spec: 'Perspectiva final del convoy completo antes de liberar.',
      chk: 'Recorrido 360° cerrado, checklist firmado, evidencia fotográfica de los tres puntos críticos.',
      ens: 'Cierra siempre con la vista completa y una pregunta: "¿qué fue lo que más trabajo te costó hoy?". Ahí sale la verdad.',
      risk: 'Liberar sin cerrar el recorrido convierte tu firma en la única evidencia del proceso.' }
  ];

  const GROUPS = ['Tractor', 'Rodada', 'Acoplamiento', 'Carga'];
  let cur = 0, seen = {}, root = null;

  function mount(container) {
    root = document.createElement('div');
    root.className = 'expl';
    container.appendChild(root);
    apply();
    paint();
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-sim3d]')) {
        if (w.Inspeccion3D) w.Inspeccion3D.abrir();
        else w.toast('El simulador 3D no está disponible en este navegador.', 'bad');
        return;
      }
      const b = e.target.closest('[data-part]');
      if (b) { select(parseInt(b.dataset.part, 10)); return; }
      const s = e.target.closest('[data-step]');
      if (s) select((cur + parseInt(s.dataset.step, 10) + PARTS.length) % PARTS.length);
    });
    document.addEventListener('insp3d:closed', () => { if (root && root.isConnected) paint(); });
    return root;
  }

  function select(i) {
    if (i === cur) return;
    cur = i; apply(); paint(true);
  }

  function apply() {
    const p = PARTS[cur];
    seen[p.id] = true;
    if (w.Scene3D && w.Scene3D.ready()) {
      w.Scene3D.focus(p.cam, 1.5);
      w.Scene3D.mood(p.mood);
      w.Scene3D.setSpeed(0);
      w.Scene3D.pulseLights(p.mood === 'danger' ? 0xFF003C : p.mood === 'warn' ? 0xFFC400 : 0xFB6500);
    }
    w.Audio3D && w.Audio3D.tick();
    const n = Object.keys(seen).length;
    if (n === PARTS.length && !w.State.get().flags.unidadRecorrida) {
      w.State.flag('unidadRecorrida');
      w.State.addXp(90);
      w.State.note('Recorrido completo de la unidad · 18 puntos revisados', 'good');
      w.toast('Recorrido 360° completo. +90 XP de criterio técnico.', 'good');
    }
  }

  function paint(anim) {
    const p = PARTS[cur];
    const n = Object.keys(seen).length;
    root.innerHTML = `
      <div class="expl-side">
        <div class="kicker">Unidad Full doble remolque</div>
        <h2 class="title" style="margin:.3rem 0 .1rem;font-size:clamp(1.1rem,2vw,1.5rem)">Recorrido de la unidad</h2>
        <div class="expl-prog"><div style="width:${(n / PARTS.length) * 100}%"></div></div>
        <div class="expl-count kicker">${n} de ${PARTS.length} puntos revisados</div>
        ${GROUPS.map(g => `
          <div class="expl-g">
            <div class="expl-gh">${g}</div>
            ${PARTS.map((x, i) => x.g === g ? `
              <button class="expl-i${i === cur ? ' on' : ''}${seen[x.id] ? ' seen' : ''}" data-part="${i}">
                <span class="expl-tick">${seen[x.id] ? I('check') : ''}</span>${x.n}
              </button>` : '').join('')}
          </div>`).join('')}
      </div>

      <div class="expl-main${anim ? ' in' : ''}">
        <div class="expl-head">
          <div>
            <div class="kicker c-cyan">${p.g} &middot; punto ${cur + 1} de ${PARTS.length}</div>
            <h3 class="expl-t">${p.n}</h3>
          </div>
          <div class="expl-nav">
            <button class="ibtn" data-step="-1" title="Parte anterior">${I('left')}</button>
            <button class="ibtn" data-step="1" title="Parte siguiente">${I('right')}</button>
          </div>
        </div>
        <p class="expl-spec">${p.spec}</p>
        <div class="expl-cards">
          <div class="expl-c c-scan"><h4>${I('scan')} Qué se verifica</h4><p>${p.chk}</p></div>
          <div class="expl-c c-teach"><h4>${I('brain')} Cómo se enseña</h4><p>${p.ens}</p></div>
          <div class="expl-c c-risk"><h4>${I('alert')} Si se omite</h4><p>${p.risk}</p></div>
        </div>
        ${launcher()}
      </div>`;
  }

  function launcher() {
    const r = w.Inspeccion3D ? w.Inspeccion3D.resumen() : null;
    if (!r) return '';
    const cerrado = r.cerrado;
    const pct = Math.round(r.total / r.max * 100);
    return `
      <div class="ins-launch">
        <div>
          <h4>${cerrado ? 'Inspección cerrada' : 'Ahora hazlo sobre la unidad'}</h4>
          <p>${cerrado
            ? 'Cerraste la inspección con ' + pct + '% de precisión y un costo de $' + r.costo.toLocaleString('en-US') + '. Los veredictos ya quedaron en el expediente.'
            : 'Ya conoces los 18 puntos. Entra al simulador y emite un veredicto real en cada uno: conforme, observación o no conforme. La unidad trae fallas reales escondidas.'}</p>
        </div>
        <button class="btn${cerrado ? ' ghost' : ''}" data-sim3d>
          ${I('scan')} ${cerrado ? 'Revisar mis veredictos' : 'Abrir simulador de inspección'}
          ${!cerrado && r.hechos ? ' · ' + r.hechos + '/18' : ''}
        </button>
      </div>`;
  }

  w.Parts = { mount, list: PARTS, seen: () => Object.keys(seen).length, total: PARTS.length };
})(window);
