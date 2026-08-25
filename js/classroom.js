/* ============================================================
   MODO AULA — votación multiusuario desde celular
   ============================================================ */
(function (w) {
  const I = w.svgIcon;
  const API = w.TM_API;
  let room = null, panel, open = false, timer = null, currentSlide = null, lastTotal = -1;

  async function ensureRoom() {
    if (room) return room;
    try {
      const r = await fetch(API + '/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilitator: w.State.get().facilitator || null })
      });
      if (!r.ok) throw 0;
      const j = await r.json();
      room = j.code;
      return room;
    } catch (e) { return null; }
  }

  function voteUrl() {
    const base = location.href.replace(/[^/]*$/, '');
    return base + 'vote.html?room=' + room;
  }

  function tallerUrl() {
    const base = location.href.replace(/[^/]*$/, '');
    return base + 'taller.html?room=' + room;
  }

  let qrMode = 'votacion';
  function showQr(mode) {
    qrMode = mode;
    document.getElementById('btn-qr-votacion').classList.toggle('on', mode === 'votacion');
    document.getElementById('btn-qr-taller').classList.toggle('on', mode === 'taller');
    document.getElementById('qr-caption').textContent = mode === 'taller'
      ? 'Cada participante escanea y arma su propia evaluación y su propia micro-clase, a su ritmo.'
      : 'Los participantes escanean el código y votan desde su celular.';
    if (room) drawQR(mode === 'taller' ? tallerUrl() : voteUrl());
  }

  function drawQR(url) {
    const box = document.getElementById('qr-box');
    if (!box) return;
    try {
      const q = w.qrcode(0, 'M');
      q.addData(url); q.make();
      box.innerHTML = q.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
      const svg = box.querySelector('svg');
      if (svg) { svg.style.width = '100%'; svg.style.height = '100%'; svg.setAttribute('shape-rendering', 'crispEdges'); }
    } catch (e) {
      box.innerHTML = `<div class="kicker" style="padding:1rem;text-align:center">Abre en el celular:<br><code style="font-size:.7rem;word-break:break-all">${url}</code></div>`;
    }
  }

  const PULSE = [
    { key: 'A', label: 'Me tensó' },
    { key: 'B', label: 'Tengo dudas' },
    { key: 'C', label: 'Lo tengo claro' },
    { key: 'D', label: 'No lo esperaba' }
  ];

  /* Pulso rápido: para las escenas que NO tienen una decisión formal (video, teoría,
     inspección 3D, etc.) igual permite abrir participación desde el celular. */
  async function openPulse() {
    if (!currentSlide) return;
    const c = await ensureRoom();
    if (!c) { w.toast && w.toast('El servidor de votación no está disponible.', 'bad'); return; }
    try {
      await fetch(API + '/session/' + room + '/poll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId: currentSlide.id, question: '¿Cómo vas con esto?', options: PULSE })
      });
    } catch (e) {}
    lastTotal = -1;
    if (!open) toggle();
    startPolling();
  }

  async function openPoll(slide) {
    if (!room) return;
    const options = slide.choices.map(c => ({ key: c.key, label: c.label }));
    try {
      await fetch(API + '/session/' + room + '/poll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId: slide.id, question: slide.question || 'Tu decisión', options })
      });
    } catch (e) {}
    lastTotal = -1;
    startPolling();
  }

  /* Abre la encuesta final de satisfacción en el mismo QR/sala: vote.html
     reconoce este slideId especial y muestra el formulario en vez de opciones. */
  async function openSatisfaction() {
    const c = await ensureRoom();
    if (!c) { w.toast && w.toast('El servidor de encuesta no está disponible.', 'bad'); return; }
    document.getElementById('room-code').textContent = c;
    drawQR(voteUrl());
    try {
      await fetch(API + '/session/' + room + '/poll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId: '__satisfaction__', question: 'Encuesta final', options: [] })
      });
    } catch (e) {}
    const box = document.getElementById('vote-results');
    if (box) box.innerHTML = '<p class="kicker c-cyan">Encuesta final abierta. Los participantes la ven al escanear o refrescar su celular.</p>';
    if (!open) toggle();
    stopPolling();
  }

  async function downloadGroupEvidence() {
    if (!room) { w.toast && w.toast('Abre la sala primero.', 'bad'); return; }
    w.Evidencia && w.Evidencia.downloadGroup(room, API);
  }

  async function downloadAllEvidence() {
    if (!room) { w.toast && w.toast('Abre la sala primero.', 'bad'); return; }
    w.Evidencia && w.Evidencia.downloadAllIndividual(room, API);
  }

  async function downloadOneEvidence() {
    if (!room) { w.toast && w.toast('Abre la sala primero.', 'bad'); return; }
    const sel = document.getElementById('sel-participante');
    if (!sel || !sel.value) { w.toast && w.toast('Elige un participante de la lista.', 'bad'); return; }
    w.Evidencia && w.Evidencia.downloadOneIndividual(room, API, sel.value);
  }

  function startPolling() {
    stopPolling();
    timer = setInterval(refresh, 1600);
    refresh();
  }
  function stopPolling() { if (timer) clearInterval(timer); timer = null; }

  async function refresh() {
    if (!room) return;
    try {
      const r = await fetch(API + '/session/' + room + '/poll');
      if (!r.ok) return;
      const j = await r.json();
      renderTally(j);
    } catch (e) { stopPolling(); }
  }

  function syncParticipantList(roster) {
    const sel = document.getElementById('sel-participante');
    if (!sel || !roster) return;
    const current = sel.value;
    const opts = '<option value="">Elegir participante…</option>' +
      roster.map(a => '<option value="' + a.id + '">' + a.name + '</option>').join('');
    if (sel.innerHTML !== opts) { sel.innerHTML = opts; sel.value = current; }
  }

  function renderTally(p) {
    const box = document.getElementById('vote-results');
    if (!box) return;
    syncParticipantList(p && p.roster);
    if (!p || !p.options || !p.options.length) { box.innerHTML = '<p class="kicker">Esta diapositiva no tiene votación abierta.</p>'; return; }
    const total = p.total || 0;
    if (total !== lastTotal) { lastTotal = total; w.Audio3D && total > 0 && w.Audio3D.tick(); }
    const top = p.options.reduce((a, b) => (b.count > a.count ? b : a), p.options[0]);

    // marcadores: quién ya contestó + cuántos bien vs mal según el tone de su opción
    const tones = {};
    (currentSlide && currentSlide.choices || []).forEach(c => { tones[c.key] = c.tone; });
    const hasTone = Object.keys(tones).length > 0;
    const roster = p.roster || [];
    const voters = p.voters || [];
    const votedIds = new Set(voters.map(v => v.attendeeId));
    let good = 0, bad = 0;
    voters.forEach(v => { const t = tones[v.optionKey]; if (t === 'good') good++; else if (t) bad++; });
    const marcadores = roster.length ? `
      ${hasTone ? `<div class="marker-line"><span class="kicker c-cyan">${good} bien</span><span class="kicker" style="opacity:.5">·</span><span class="kicker c-red">${bad} en riesgo</span></div>` : ''}
      <div class="marker-roster">${roster.map(r => `<span class="marker-chip${votedIds.has(r.id) ? ' on' : ''}">${votedIds.has(r.id) ? '✓ ' : ''}${r.name}</span>`).join('')}</div>` : '';

    box.innerHTML = `
      <div class="vote-head"><span class="kicker">${total} voto${total === 1 ? '' : 's'} recibido${total === 1 ? '' : 's'}</span>
        <span class="live">${I('users')} EN VIVO</span></div>
      ${marcadores}
      ${p.options.map(o => {
        const pct = total ? Math.round(o.count / total * 100) : 0;
        return `<div class="bar-row">
          <div class="bar-lbl"><b>${o.key}</b> ${o.label}</div>
          <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="bar-pct num">${pct}%</div>
        </div>`;
      }).join('')}
      ${total > 0 && hasTone ? `<button class="btn small" data-apply="${top.key}" style="margin-top:.9rem">${I('check')} Aplicar la opción más votada (${top.key})</button>` : ''}
      ${total > 0 && hasTone && top.count / total >= 0.5 && top.key !== bestKey() ? `<p class="kicker c-amber" style="margin-top:.7rem">El ${Math.round(top.count / total * 100)}% del grupo eligió una opción que no es la de mayor estándar. Ese es el material de la discusión.</p>` : ''}`;
  }

  function bestKey() {
    if (!currentSlide || !currentSlide.choices) return null;
    const g = currentSlide.choices.find(c => c.tone === 'good');
    return g ? g.key : null;
  }

  /* Limpia la votación activa en el servidor: sin esto, el celular de los
     participantes se queda viendo la última pregunta aunque el facilitador
     ya haya avanzado a una escena sin decisión (video, teoría, inspección). */
  async function clearPoll() {
    if (!room) return;
    try {
      await fetch(API + '/session/' + room + '/poll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId: '', question: '', options: [] })
      });
    } catch (e) {}
    lastTotal = -1;
  }

  function onSlide(slide) {
    currentSlide = slide;
    if (!room) return;
    if (slide.vote && slide.choices) openPoll(slide);
    else {
      clearPoll();
      if (open) { stopPolling(); renderTally(null); }
    }
  }

  async function toggle() {
    panel = document.getElementById('classroom');
    open = !open;
    panel.classList.toggle('on', open);
    document.body.classList.toggle('classroom-open', open);
    if (open) {
      const c = await ensureRoom();
      if (!c) {
        document.getElementById('room-code').textContent = '—';
        document.getElementById('vote-results').innerHTML = '<p class="kicker c-amber">El servidor de votación no está disponible en este momento. La presentación funciona igual sin él.</p>';
        return;
      }
      document.getElementById('room-code').textContent = c;
      showQr('votacion');
      onSlide(currentSlide);
    } else stopPolling();
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-apply]');
    if (a) { w.Deck.applyKey(a.dataset.apply); return; }
    if (e.target.closest('#classroom-close')) toggle();
    if (e.target.closest('#btn-pulso')) openPulse();
    if (e.target.closest('#btn-encuesta-final')) openSatisfaction();
    if (e.target.closest('#btn-qr-votacion')) showQr('votacion');
    if (e.target.closest('#btn-qr-taller')) showQr('taller');
    if (e.target.closest('#btn-evidencia-grupal')) downloadGroupEvidence();
    if (e.target.closest('#btn-evidencia-todos')) downloadAllEvidence();
    if (e.target.closest('#btn-evidencia-uno')) downloadOneEvidence();
  });

  w.Classroom = { toggle, onSlide, isOpen: () => open, roomCode: () => room, showQr };
})(window);
