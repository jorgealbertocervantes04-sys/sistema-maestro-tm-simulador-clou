/* ============================================================
   INSTRUMENTO DE EVALUACIÓN DEL OPERADOR
   1. mountConstructor — el participante arma su propio instrumento
   2. mountAplicar     — el instrumento califica a tres operadores
   3. mountCampo       — aplica el instrumento a un operador real
   ============================================================ */
(function (w) {
  const I = w.svgIcon;
  const MIN = 60;

  /* -------- perfiles ocultos de los operadores -------- */
  const OPS = [
    {
      id: 'ramiro', n: 'Arnulfo “el Borras” Peña', e: '34 años · 6 años de antigüedad',
      foto: 'R', tag: 'El operador del expediente 4471',
      base: { conducta:3, aspecto:3, tecnica:2, inspeccion:1, normativa:2, seguridad:1, comunicacion:3, fatiga:1, custodia:2, liderazgo:1 },
      ov: { c02:0, c04:1, c07:3, c08:3, c14:3, c23:3, c24:0, c25:0, c26:1, c27:0, c28:0,
            c31:0, c32:3, c39:2, c41:1, c44:0, c53:3, c54:1, c55:0, c59:3, c67:0, c70:1 },
      real: 38,
      verdad: 'El Borras es el operador mejor evaluado del patio en todo lo que se ve: puntual, uniformado, amable, nunca discute una orden. Y es el operador del expediente 4471. Nunca hizo un recorrido 360° completo, jamás sacó el manómetro y nunca dijo que estaba cansado.',
      color: '#FF003C'
    },
    {
      id: 'yaneth', n: 'Yaneth Robledo Cárdenas', e: '29 años · 3 años de antigüedad',
      foto: 'Y', tag: 'Poca antigüedad, método impecable',
      base: { conducta:3, aspecto:3, tecnica:2, inspeccion:3, normativa:3, seguridad:3, comunicacion:2, fatiga:3, custodia:3, liderazgo:2 },
      ov: { c07:1, c08:2, c14:3, c23:0, c32:0, c39:0, c53:1, c59:1,
            c18:3, c25:3, c26:3, c27:3, c28:3, c31:3, c52:1, c55:3, c67:3, c69:1 },
      real: 86,
      verdad: 'Yaneth tiene la mitad de antigüedad que el Borras y el doble de método. Detiene la unidad cuando algo no cuadra, dice en voz alta que está cansada y ha rechazado dos salidas. En un patio que evalúa obediencia, es la que más problemas parece dar.',
      color: '#00FF66'
    },
    {
      id: 'tono', n: 'Antonio "Toño" Villaseñor', e: '51 años · 22 años de antigüedad',
      foto: 'T', tag: 'Manos de oro, papeles en el olvido',
      base: { conducta:2, aspecto:2, tecnica:3, inspeccion:2, normativa:1, seguridad:2, comunicacion:2, fatiga:1, custodia:1, liderazgo:2 },
      ov: { c07:0, c08:1, c14:1, c23:2, c32:1, c39:3, c53:2, c59:3,
            c03:1, c35:0, c37:1, c41:2, c54:1, c56:1, c62:1, c65:1, c70:1, c71:1, c52:3, c68:3 },
      real: 61,
      verdad: 'Toño maneja mejor que nadie en la flota y enseña a los nuevos sin que se lo pidan. También lleva la bitácora de horas en blanco, resuelve solo en los retenes y no reporta puntos de control. Su riesgo no está en el volante: está en todo lo que no documenta.',
      color: '#FFC400'
    }
  ];

  const lvl = (op, c) => (op.ov[c.id] !== undefined ? op.ov[c.id] : (op.base[c.cat] !== undefined ? op.base[c.cat] : 2));

  /* -------- estado del instrumento -------- */
  let sel = {};          // id -> peso (1|2|3)
  let propios = [];      // criterios redactados por el participante
  let catAbierta = null;
  let rootC = null, rootA = null, rootF = null;
  let campo = { nombre: '', notas: {}, idx: 0, hecho: false };

  const BANCO = () => (w.CRITERIOS ? w.CRITERIOS.list : []);
  const CATS = () => (w.CRITERIOS ? w.CRITERIOS.cats : []);
  const todos = () => BANCO().concat(propios);
  const elegidos = () => todos().filter(c => sel[c.id]);
  const nSel = () => Object.keys(sel).length;

  /* ============================================================
     1. CONSTRUCTOR
     ============================================================ */
  function mountConstructor(container) {
    rootC = document.createElement('div');
    rootC.className = 'ev';
    container.appendChild(rootC);
    if (!catAbierta && CATS().length) catAbierta = CATS()[0].id;
    paintC();
    rootC.addEventListener('click', onClickC);
    rootC.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.matches('[data-prop-n]')) { e.preventDefault(); addPropio(); }
    });
    return rootC;
  }

  function onClickC(e) {
    const tab = e.target.closest('[data-evcat]');
    if (tab) { catAbierta = tab.dataset.evcat; return paintC(); }

    const t = e.target.closest('[data-evtog]');
    if (t) {
      const id = t.dataset.evtog;
      if (sel[id]) delete sel[id]; else sel[id] = 2;
      w.Audio3D && w.Audio3D.tick();
      return paintC();
    }

    const p = e.target.closest('[data-evpeso]');
    if (p) {
      e.stopPropagation();
      const [id, v] = p.dataset.evpeso.split(':');
      sel[id] = parseInt(v, 10);
      return paintC();
    }

    const all = e.target.closest('[data-evall]');
    if (all) {
      const cid = all.dataset.evall;
      const lote = BANCO().filter(c => c.cat === cid);
      const falta = lote.some(c => !sel[c.id]);
      lote.forEach(c => { if (falta) sel[c.id] = sel[c.id] || 2; else delete sel[c.id]; });
      return paintC();
    }

    if (e.target.closest('[data-evadd]')) return addPropio();

    const del = e.target.closest('[data-evdel]');
    if (del) {
      const id = del.dataset.evdel;
      propios = propios.filter(x => x.id !== id);
      delete sel[id];
      return paintC();
    }

    if (e.target.closest('[data-evcerrar]')) return cerrarInstrumento();
  }

  function addPropio() {
    const n = rootC.querySelector('[data-prop-n]');
    const j = rootC.querySelector('[data-prop-j]');
    const c = rootC.querySelector('[data-prop-c]');
    if (!n || !n.value.trim()) { w.toast('Escribe primero el enunciado del criterio.', 'bad'); return; }
    if (!j || j.value.trim().length < 25) { w.toast('Todo criterio propio necesita justificación. Mínimo una frase completa.', 'bad'); return; }
    const id = 'p' + (propios.length + 1).toString().padStart(2, '0');
    propios.push({ id, cat: c.value, n: n.value.trim().slice(0, 120), j: j.value.trim().slice(0, 300), e: 'Definida por el instructor.', propio: true });
    sel[id] = 2;
    n.value = ''; j.value = '';
    w.State.addXp(6);
    w.toast('Criterio propio agregado al instrumento. +6 XP', 'good');
    paintC();
  }

  function diagnostico() {
    const el = elegidos();
    const n = el.length;
    const cats = CATS();
    const porCat = {};
    cats.forEach(c => porCat[c.id] = el.filter(x => x.cat === c.id).length);
    const cubiertas = cats.filter(c => porCat[c.id] >= 3).length;
    const criticos = BANCO().filter(c => c.crit);
    const critIn = criticos.filter(c => sel[c.id]).length;
    const trampas = BANCO().filter(c => c.trampa);
    const trampasIn = trampas.filter(c => sel[c.id]);

    let pts = 0;
    pts += Math.min(30, Math.round(n / MIN * 30));                        // volumen
    pts += Math.round(cubiertas / cats.length * 25);                      // cobertura
    pts += Math.round(critIn / criticos.length * 30);                     // criticidad
    pts += 15 - Math.min(15, trampasIn.length * 2.5);                     // limpieza
    pts = Math.max(0, Math.min(100, Math.round(pts)));

    return { n, porCat, cubiertas, critIn, critTot: criticos.length, trampasIn, pts, propios: propios.length };
  }

  function cerrarInstrumento() {
    const d = diagnostico();
    if (d.n < MIN) { w.toast('Te faltan ' + (MIN - d.n) + ' criterios para cerrar el instrumento.', 'bad'); return; }
    const S = w.State.get();
    S.instrumento = {
      criterios: elegidos().map(c => ({ id: c.id, cat: c.cat, n: c.n, j: c.j, e: c.e, peso: sel[c.id], propio: !!c.propio, trampa: !!c.trampa })),
      pts: d.pts, cubiertas: d.cubiertas, critIn: d.critIn, critTot: d.critTot,
      trampas: d.trampasIn.map(t => t.n), propios: d.propios,
      total: d.n, cats: d.cubiertas, criticos: d.critIn
    };
    w.State.flag('instrumentoHecho');
    w.State.flag('instrumentoPts', d.pts);
    w.State.addXp(80 + Math.round(d.pts * 0.9) + d.propios * 4);
    w.State.note('Instrumento de evaluación construido · ' + d.n + ' criterios · calidad ' + d.pts + '%', d.pts >= 70 ? 'good' : 'mid');
    w.Audio3D && w.Audio3D.good();
    w.toast('Instrumento cerrado. Ahora califica con él.', 'good');
    paintC();
  }

  function paintC() {
    const d = diagnostico();
    const cats = CATS();
    const cerrado = w.State.has('instrumentoHecho');
    const cat = cats.find(c => c.id === catAbierta) || cats[0];
    const lote = BANCO().filter(c => c.cat === catAbierta);
    const míos = propios.filter(c => c.cat === catAbierta);
    const pctVol = Math.min(100, d.n / MIN * 100);

    rootC.innerHTML = `
      <div class="ev-top">
        <div>
          <div class="kicker c-cyan">Instrumento de evaluación del operador</div>
          <h2 class="ev-h">¿Qué evalúas tú de un buen operador?</h2>
          <p class="ev-lede">Arma tu propio instrumento con al menos ${MIN} criterios. Cada uno viene justificado: si no puedes defender por qué lo mides, no debería estar en la hoja. Después vas a calificar operadores reales con él y vas a ver qué tan bien discrimina.</p>
        </div>
        <div class="ev-meter">
          <div class="ev-big" style="color:${d.n >= MIN ? 'var(--green)' : 'var(--amber)'}">${d.n}</div>
          <div class="ev-sub">de ${MIN} mínimos</div>
          <div class="ev-bar"><div style="width:${pctVol}%;background:${d.n >= MIN ? 'var(--green)' : 'var(--amber)'}"></div></div>
          <div class="ev-kpis">
            <span><b>${d.cubiertas}</b>/10 dominios</span>
            <span><b>${d.propios}</b> propios</span>
          </div>
        </div>
      </div>

      <div class="ev-tabs">
        ${cats.map(c => {
          const k = d.porCat[c.id] || 0;
          return `<button class="ev-tab${c.id === catAbierta ? ' on' : ''}" data-evcat="${c.id}" style="--tc:${c.c}">
            <span class="ev-ab">${c.ab}</span>${c.n}<span class="ev-n${k >= 3 ? ' ok' : ''}">${k}</span></button>`;
        }).join('')}
      </div>

      <div class="ev-body">
        <div class="ev-listhead">
          <div><b style="color:${cat.c}">${cat.n}</b> · ${lote.length} criterios disponibles</div>
          <button class="btn ghost sm" data-evall="${cat.id}">${I('check')} Alternar dominio completo</button>
        </div>

        <div class="ev-list">
          ${lote.concat(míos).map(c => {
            const on = !!sel[c.id];
            return `<div class="ev-it${on ? ' on' : ''}${c.crit ? ' crit' : ''}" data-evtog="${c.id}">
              <div class="ev-box">${on ? I('check') : ''}</div>
              <div class="ev-txt">
                <div class="ev-n1">${c.n}${c.crit ? '<span class="ev-flag">CRÍTICO</span>' : ''}${c.propio ? '<span class="ev-flag mine">PROPIO</span>' : ''}</div>
                <div class="ev-j">${c.j}</div>
                <div class="ev-e">${I('scan')} Evidencia: ${c.e}</div>
              </div>
              <div class="ev-right">
                ${on ? `<div class="ev-peso">
                  ${[1,2,3].map(v => `<button class="ev-p${sel[c.id] === v ? ' on' : ''}" data-evpeso="${c.id}:${v}" title="Peso ${v}">${v}</button>`).join('')}
                </div>` : ''}
                ${c.propio ? `<button class="ev-x" data-evdel="${c.id}" title="Eliminar">${I('x')}</button>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>

        <div class="ev-add">
          <div class="kicker c-amber">${I('brain')} Agrega un criterio que el banco no tiene</div>
          <input class="ev-in" data-prop-n placeholder="Enunciado observable. Ejemplo: baja de la unidad para verificar el andén antes de meter reversa." maxlength="120">
          <textarea class="ev-in ev-ta" data-prop-j placeholder="Justificación: ¿qué consecuencia operativa o de riesgo previene este criterio? Sin justificación no entra." maxlength="300"></textarea>
          <div class="ev-addrow">
            <select class="ev-in ev-sel" data-prop-c>
              ${cats.map(c => `<option value="${c.id}"${c.id === catAbierta ? ' selected' : ''}>${c.n}</option>`).join('')}
            </select>
            <button class="btn ghost" data-evadd>+ Agregar al instrumento</button>
          </div>
        </div>
      </div>

      ${cerrado ? `
        <div class="ev-close done">
          <div class="ev-score" style="color:${d.pts >= 80 ? 'var(--green)' : d.pts >= 60 ? 'var(--cyan)' : 'var(--amber)'}">${d.pts}%</div>
          <div>
            <div class="kicker">Calidad de tu instrumento</div>
            <p class="ev-fb">${feedback(d)}</p>
          </div>
        </div>` : `
        <div class="ev-close">
          <p class="ev-hint">${d.n < MIN
            ? 'Te faltan <b>' + (MIN - d.n) + '</b> criterios. Recorre los diez dominios: un instrumento que solo mide lo que se ve desde la ventana del patio no sirve para prevenir nada.'
            : 'Ya tienes el mínimo. Antes de cerrar, revisa que hayas cubierto los diez dominios y no solo los cómodos.'}</p>
          <button class="btn${d.n >= MIN ? '' : ' ghost'}" data-evcerrar ${d.n >= MIN ? '' : 'disabled'}>${I('check')} Cerrar instrumento y calificar con él</button>
        </div>`}
    `;
  }

  function feedback(d) {
    const p = [];
    p.push('Seleccionaste <b>' + d.n + '</b> criterios y cubriste <b>' + d.cubiertas + ' de 10</b> dominios.');
    p.push('Incluiste <b>' + d.critIn + ' de ' + d.critTot + '</b> criterios críticos, los que separan un incidente de un funeral.');
    if (d.trampasIn.length) {
      p.push('<span style="color:var(--red)">Dejaste pasar ' + d.trampasIn.length + ' criterio' + (d.trampasIn.length > 1 ? 's' : '') + ' trampa</span>: suenan a profesionalismo y en realidad premian obediencia, apariencia o aguante. Los verás marcados al calificar.');
    } else {
      p.push('<span style="color:var(--green)">No cayó ninguna trampa</span>: ningún criterio de tu hoja premia obediencia ciega ni aguante silencioso.');
    }
    if (d.propios) p.push('Redactaste <b>' + d.propios + '</b> criterio' + (d.propios > 1 ? 's' : '') + ' propio' + (d.propios > 1 ? 's' : '') + '.');
    return p.join(' ');
  }

  /* ============================================================
     2. APLICAR — el instrumento califica a tres operadores
     ============================================================ */
  function calif(op) {
    const el = elegidos();
    if (!el.length) return { pct: 0, sum: 0, max: 0 };
    let sum = 0, max = 0;
    el.forEach(c => {
      const pe = sel[c.id] || 2;
      const L = c.propio ? 2 : lvl(op, c);
      sum += L * pe; max += 3 * pe;
    });
    return { pct: Math.round(sum / max * 100), sum, max };
  }

  function mountAplicar(container) {
    rootA = document.createElement('div');
    rootA.className = 'ev ap';
    container.appendChild(rootA);
    paintA(false);
    rootA.addEventListener('click', e => {
      if (e.target.closest('[data-apgo]')) { revelar(); }
    });
    return rootA;
  }

  function revelar() {
    const S = w.State.get();
    const res = OPS.map(o => ({ o, r: calif(o) })).sort((a, b) => b.r.pct - a.r.pct);
    const real = OPS.slice().sort((a, b) => b.real - a.real).map(o => o.id);
    const mio = res.map(x => x.o.id);
    const aciertos = mio.filter((id, i) => id === real[i]).length;
    const ramiroPos = mio.indexOf('ramiro');
    const ramiroPct = res.find(x => x.o.id === 'ramiro').r.pct;

    S.evaluados = res.map(x => ({ id: x.o.id, nombre: x.o.n, calif: x.r.pct, real: x.o.real }));
    w.State.flag('evalAplicada');
    w.State.flag('evalAciertos', aciertos);
    const xp = aciertos === 3 ? 90 : aciertos === 2 ? 55 : 25;
    w.State.addXp(xp + (ramiroPos === 2 ? 40 : 0));
    w.State.note('Instrumento aplicado · orden ' + (aciertos === 3 ? 'correcto' : 'con ' + (3 - aciertos) + ' desalineaciones') + ' · el Borras al ' + ramiroPct + '%', ramiroPos === 2 ? 'good' : 'bad');
    if (ramiroPos !== 2) w.Audio3D && w.Audio3D.hit(); else w.Audio3D && w.Audio3D.good();
    paintA(true, { res, aciertos, ramiroPos, ramiroPct });
  }

  function paintA(done, data) {
    if (!w.State.has('instrumentoHecho')) {
      rootA.innerHTML = `<div class="ev-lock"><div class="kicker c-amber">${I('alert')} Instrumento pendiente</div>
        <p class="ev-lede">Regresa a la pantalla anterior y cierra tu instrumento de evaluación. Sin criterios propios no hay nada con qué calificar.</p></div>`;
      return;
    }
    const el = elegidos();

    rootA.innerHTML = `
      <div class="ev-top">
        <div>
          <div class="kicker c-cyan">Aplicación del instrumento</div>
          <h2 class="ev-h">Tu hoja, tres operadores reales</h2>
          <p class="ev-lede">Tus ${el.length} criterios, con los pesos que tú les diste, se aplican ahora al desempeño documentado de tres operadores del patio. No vas a calificarlos a mano: los califica tu instrumento. Lo que se pone a prueba aquí no son ellos, es tu hoja.</p>
        </div>
      </div>

      <div class="ap-grid">
        ${OPS.map(o => {
          const r = done ? calif(o) : null;
          return `<div class="ap-card${done ? ' rev' : ''}" style="--oc:${o.color}">
            <div class="ap-head"><div class="ap-av">${o.foto}</div>
              <div><div class="ap-n">${o.n}</div><div class="ap-e">${o.e}</div></div></div>
            <div class="ap-tag">${o.tag}</div>
            ${done ? `
              <div class="ap-pcts">
                <div class="ap-p"><span class="kicker">Tu instrumento</span><b style="color:${r.pct >= 75 ? 'var(--green)' : r.pct >= 55 ? 'var(--amber)' : 'var(--red)'}">${r.pct}%</b></div>
                <div class="ap-p"><span class="kicker">Riesgo real documentado</span><b style="color:${o.real >= 75 ? 'var(--green)' : o.real >= 55 ? 'var(--amber)' : 'var(--red)'}">${o.real}%</b></div>
              </div>
              <div class="ap-gap ${Math.abs(r.pct - o.real) > 18 ? 'bad' : 'ok'}">
                ${Math.abs(r.pct - o.real) > 18
                  ? 'Desviación de ' + Math.abs(r.pct - o.real) + ' puntos: tu hoja lo lee distinto de como se comporta.'
                  : 'Coincidencia dentro de tolerancia: tu hoja lo lee bien.'}
              </div>
              <p class="ap-v">${o.verdad}</p>`
            : `<div class="ap-wait">${I('scan')}<span>Sin calificar</span></div>`}
          </div>`;
        }).join('')}
      </div>

      ${done ? veredicto(data) : `
        <div class="ev-close"><p class="ev-hint">El orden en que tu instrumento los acomode va a decir más de ti que de ellos.</p>
        <button class="btn" data-apgo>${I('scan')} Ejecutar la evaluación</button></div>`}
    `;
  }

  function veredicto(d) {
    const { res, aciertos, ramiroPos, ramiroPct } = d;
    const ok = ramiroPos === 2;
    return `
      <div class="ap-ver ${ok ? 'ok' : 'bad'}">
        <div class="kicker">${ok ? 'Tu instrumento discrimina' : 'Tu instrumento no discrimina'}</div>
        <h3 class="ap-vh">${ok ? 'Tu hoja detectó al Borras' : 'Tu hoja aprobó al Borras'}</h3>
        <div class="ap-rank">
          ${res.map((x, i) => `<div class="ap-r"><span class="ap-ri">${i + 1}</span><b>${x.o.n}</b><span class="ap-rp" style="color:${x.o.color}">${x.r.pct}%</span></div>`).join('')}
        </div>
        <p class="ap-vt">
          ${ok
            ? 'Tu instrumento colocó al Borras al final con ' + ramiroPct + '%. Eso significa que mediste inspección, fatiga declarada y capacidad de negarse a operar, no solo puntualidad y uniforme. Una hoja así habría abierto una conversación con él semanas antes del expediente 4471.'
            : 'Tu instrumento le dio al Borras ' + ramiroPct + '% y lo dejó en el lugar ' + (ramiroPos + 1) + '. El Borras es el operador del expediente 4471. Tu hoja lo habría aprobado, y esa es exactamente la razón por la que nadie lo detuvo: el patio entero lo evaluaba con criterios como los tuyos.'}
        </p>
        <p class="ap-vt2">
          ${aciertos === 3
            ? 'Además ordenaste a los tres exactamente como los ordena su desempeño documentado. El instrumento está calibrado.'
            : 'Coincidiste en ' + aciertos + ' de 3 posiciones con el desempeño documentado. Revisa qué dominios dejaste con menos de tres criterios: ahí está la ceguera de tu hoja.'}
        </p>
        <p class="ap-vt2">Un instrumento de evaluación no sirve para premiar al que se ve bien. Sirve para encontrar al que se ve bien y no lo está.</p>
      </div>`;
  }

  /* ============================================================
     3. CAMPO — calificar a un operador real con el instrumento
     ============================================================ */
  const NIV = [
    { v: 0, l: 'No lo hace', c: 'var(--red)' },
    { v: 1, l: 'Inconsistente', c: 'var(--orange)' },
    { v: 2, l: 'Cumple', c: 'var(--amber)' },
    { v: 3, l: 'Lo domina y lo enseña', c: 'var(--green)' }
  ];

  function mountCampo(container) {
    rootF = document.createElement('div');
    rootF.className = 'ev cp';
    container.appendChild(rootF);
    paintF();
    rootF.addEventListener('input', e => {
      if (e.target.matches('[data-cpn]')) campo.nombre = e.target.value;
    });
    rootF.addEventListener('click', e => {
      const n = e.target.closest('[data-cpv]');
      if (n) {
        const [id, v] = n.dataset.cpv.split(':');
        campo.notas[id] = parseInt(v, 10);
        w.Audio3D && w.Audio3D.tick();
        return paintF();
      }
      const q = e.target.closest('[data-cpcat]');
      if (q) {
        const [cid, v] = q.dataset.cpcat.split(':');
        elegidos().filter(c => c.cat === cid).forEach(c => campo.notas[c.id] = parseInt(v, 10));
        return paintF();
      }
      if (e.target.closest('[data-cpfin]')) return cerrarCampo();
      if (e.target.closest('[data-cppdf]')) return exportar();
    });
    return rootF;
  }

  function resCampo() {
    const el = elegidos();
    let sum = 0, max = 0, hechos = 0;
    const faltasCrit = [];
    el.forEach(c => {
      const pe = sel[c.id] || 2;
      max += 3 * pe;
      if (campo.notas[c.id] !== undefined) {
        hechos++; sum += campo.notas[c.id] * pe;
        if (c.crit && campo.notas[c.id] <= 1) faltasCrit.push(c);
      }
    });
    const pct = max ? Math.round(sum / max * 100) : 0;
    return { pct, hechos, tot: el.length, faltasCrit };
  }

  function tier(pct, faltas) {
    if (faltas >= 3) return { l: 'NO APTO PARA OPERAR SIN ACOMPAÑAMIENTO', c: 'var(--red)' };
    if (pct >= 85) return { l: 'OPERADOR QUE PUEDE ENSEÑAR', c: 'var(--green)' };
    if (pct >= 70) return { l: 'OPERADOR CONFIABLE', c: 'var(--cyan)' };
    if (pct >= 50) return { l: 'REQUIERE PLAN DE DESARROLLO', c: 'var(--amber)' };
    return { l: 'REQUIERE INTERVENCIÓN INMEDIATA', c: 'var(--red)' };
  }

  function cerrarCampo() {
    const r = resCampo();
    if (!campo.nombre.trim()) { w.toast('Escribe el nombre del operador que estás evaluando.', 'bad'); return; }
    if (r.hechos < r.tot) { w.toast('Faltan ' + (r.tot - r.hechos) + ' criterios por calificar.', 'bad'); return; }
    campo.hecho = true;
    const S = w.State.get();
    S.evalCampo = { nombre: campo.nombre.trim(), pct: r.pct, tier: tier(r.pct, r.faltasCrit.length).l, faltas: r.faltasCrit.map(c => c.n), notas: campo.notas };
    w.State.flag('evalCampoHecha');
    w.State.addXp(70);
    w.State.note('Evaluación aplicada a ' + campo.nombre.trim() + ' · ' + r.pct + '%', 'good');
    w.Audio3D && w.Audio3D.good();
    paintF();
  }

  function exportar() {
    const el = elegidos();
    const r = resCampo();
    const t = tier(r.pct, r.faltasCrit.length);
    const cats = CATS();
    const linea = '='.repeat(78);
    let txt = 'INSTRUMENTO DE EVALUACIÓN DEL OPERADOR\n';
    txt += 'Formando el Trayecto del Instructor · Sistema Maestro TM\n' + linea + '\n';
    txt += 'Operador evaluado: ' + (campo.nombre || '_______________________') + '\n';
    txt += 'Fecha: ' + new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) + '\n';
    txt += 'Criterios del instrumento: ' + el.length + '\n';
    if (campo.hecho) txt += 'Resultado: ' + r.pct + '%  ·  ' + t.l + '\n';
    txt += linea + '\n\n';
    cats.forEach(c => {
      const lote = el.filter(x => x.cat === c.id);
      if (!lote.length) return;
      txt += c.n.toUpperCase() + '  (' + lote.length + ')\n' + '-'.repeat(78) + '\n';
      lote.forEach((x, i) => {
        const nv = campo.notas[x.id];
        txt += (i + 1) + '. ' + x.n + (x.crit ? '  [CRÍTICO]' : '') + '  [peso ' + (sel[x.id] || 2) + ']\n';
        txt += '   Justificación: ' + x.j + '\n';
        txt += '   Evidencia: ' + x.e + '\n';
        txt += '   Calificación: ' + (nv !== undefined ? nv + ' — ' + NIV[nv].l : '[ 0 ] [ 1 ] [ 2 ] [ 3 ]') + '\n\n';
      });
    });
    txt += linea + '\nEscala: 0 no lo hace · 1 inconsistente · 2 cumple · 3 lo domina y lo enseña\n';
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'instrumento-evaluacion-operador.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    w.toast('Instrumento descargado. Es tuyo, úsalo en patio.', 'good');
  }

  function paintF() {
    if (!w.State.has('instrumentoHecho')) {
      rootF.innerHTML = `<div class="ev-lock"><div class="kicker c-amber">${I('alert')} Instrumento pendiente</div>
        <p class="ev-lede">Cierra primero tu instrumento de evaluación.</p></div>`;
      return;
    }
    const el = elegidos();
    const r = resCampo();
    const t = tier(r.pct, r.faltasCrit.length);
    const cats = CATS().filter(c => el.some(x => x.cat === c.id));

    rootF.innerHTML = `
      <div class="ev-top">
        <div>
          <div class="kicker c-cyan">Aplicación en campo</div>
          <h2 class="ev-h">Califica a un operador de tu flota</h2>
          <p class="ev-lede">Este es tu instrumento funcionando. Escribe el nombre de un operador que tengas hoy a tu cargo y califícalo con tus propios criterios. Al final puedes descargar la hoja para usarla en patio.</p>
        </div>
        <div class="ev-meter">
          <div class="ev-big" style="color:${campo.hecho ? t.c : 'var(--ink-2)'}">${campo.hecho ? r.pct + '%' : r.hechos + '/' + r.tot}</div>
          <div class="ev-sub">${campo.hecho ? t.l : 'criterios calificados'}</div>
          <div class="ev-bar"><div style="width:${r.tot ? r.hechos / r.tot * 100 : 0}%;background:var(--cyan)"></div></div>
        </div>
      </div>

      <input class="ev-in ev-name" data-cpn value="${campo.nombre.replace(/"/g, '&quot;')}" placeholder="Nombre del operador que vas a evaluar" maxlength="60">

      <div class="cp-scale">
        ${NIV.map(n => `<span style="color:${n.c}"><b>${n.v}</b> ${n.l}</span>`).join('')}
      </div>

      <div class="cp-cats">
        ${cats.map(c => {
          const lote = el.filter(x => x.cat === c.id);
          return `<div class="cp-cat" style="--tc:${c.c}">
            <div class="cp-ch"><b>${c.n}</b><span>${lote.length}</span>
              <div class="cp-quick">${NIV.map(n => `<button data-cpcat="${c.id}:${n.v}" title="Todo el dominio en ${n.l}">${n.v}</button>`).join('')}</div>
            </div>
            ${lote.map(x => {
              const nv = campo.notas[x.id];
              return `<div class="cp-row${nv !== undefined ? ' set' : ''}">
                <div class="cp-t">${x.n}${x.crit ? '<span class="ev-flag">CRÍTICO</span>' : ''}${x.trampa ? '<span class="ev-flag warn">CRITERIO DÉBIL</span>' : ''}</div>
                <div class="cp-btns">${NIV.map(n => `<button class="cp-b${nv === n.v ? ' on' : ''}" style="--nc:${n.c}" data-cpv="${x.id}:${n.v}">${n.v}</button>`).join('')}</div>
              </div>`;
            }).join('')}
          </div>`;
        }).join('')}
      </div>

      ${campo.hecho ? `
        <div class="cp-res" style="--rc:${t.c}">
          <div class="cp-rp">${r.pct}%</div>
          <div>
            <div class="cp-rt" style="color:${t.c}">${t.l}</div>
            <p class="ev-fb">${campo.nombre} fue evaluado con ${el.length} criterios definidos por ti.
            ${r.faltasCrit.length
              ? '<span style="color:var(--red)">Reprobó ' + r.faltasCrit.length + ' criterio' + (r.faltasCrit.length > 1 ? 's' : '') + ' crítico' + (r.faltasCrit.length > 1 ? 's' : '') + ':</span> ' + r.faltasCrit.slice(0, 4).map(c => c.n.toLowerCase()).join('; ') + '.'
              : '<span style="color:var(--green)">No reprobó ningún criterio crítico.</span>'}
            Esta hoja no es una sentencia: es el punto de partida de la conversación que vas a tener con él el lunes.</p>
          </div>
        </div>
        <div class="ev-close"><button class="btn ghost" data-cppdf>${I('doc')} Descargar el instrumento</button></div>`
      : `<div class="ev-close">
          <p class="ev-hint">${r.hechos < r.tot ? 'Faltan <b>' + (r.tot - r.hechos) + '</b> criterios por calificar.' : 'Instrumento completo. Cierra la evaluación.'}</p>
          <button class="btn${r.hechos === r.tot ? '' : ' ghost'}" data-cpfin>${I('check')} Cerrar evaluación</button>
          <button class="btn ghost" data-cppdf>Descargar hoja en blanco</button>
        </div>`}
    `;
  }

  w.Evaluacion = { mountConstructor, mountAplicar, mountCampo, OPS, get sel() { return sel; }, elegidos };
})(window);
