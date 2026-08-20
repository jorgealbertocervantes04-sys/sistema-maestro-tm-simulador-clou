/* ============================================================
   MODO FACILITADOR — notas privadas y cronómetro de sesión
   ============================================================ */
(function (w) {
  let open = false, t0 = Date.now(), paused = false, pausedAt = 0, acc = 0, tick = null;

  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function elapsed() { return (paused ? pausedAt : Date.now()) - t0 - acc; }

  function loop() {
    const el = document.getElementById('p-timer');
    if (el) { el.textContent = fmt(elapsed()); el.classList.toggle('paused', paused); }
  }

  function toggle() {
    const p = document.getElementById('presenter');
    open = !open;
    p.classList.toggle('on', open);
    document.body.classList.toggle('presenter-open', open);
    if (open && !tick) tick = setInterval(loop, 500);
    loop();
  }

  function sync(slide, n, total) {
    const note = document.getElementById('p-note');
    const meta = document.getElementById('p-meta');
    const nxt = document.getElementById('p-next');
    if (!note) return;
    note.textContent = slide.note || 'Sin nota específica. Sostén el silencio y deja que el grupo argumente antes de avanzar.';
    meta.textContent = `${slide.chapter || ''} · ${n} de ${total}`;
    const S = w.State.get();
    nxt.innerHTML = `Riesgo actual <b>${w.State.risk()}%</b> · Fatiga <b>${S.driver.fatigue}%</b> · Estrés <b>${S.driver.stress}%</b> · Confianza <b>${S.driver.trust}%</b><br>
      Desenlace proyectado si nada cambia: <b>${w.State.ending().toUpperCase()}</b>`;
  }

  document.addEventListener('click', e => {
    if (e.target.closest('#p-close')) toggle();
    if (e.target.closest('#p-reset-timer')) { t0 = Date.now(); acc = 0; paused = false; loop(); }
    if (e.target.closest('#p-pause')) {
      if (paused) { acc += Date.now() - pausedAt; paused = false; }
      else { pausedAt = Date.now(); paused = true; }
      const b = document.getElementById('p-pause');
      if (b) b.textContent = paused ? 'Reanudar' : 'Pausar';
      loop();
    }
  });

  w.Presenter = { toggle, sync };
})(window);