/* ============================================================
   ARRANQUE
   ============================================================ */
(function (w) {
  const I = w.svgIcon;

  function paintIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
      el.innerHTML = I(el.dataset.icon);
    });
  }

  async function boot() {
    paintIcons();

    const canvas = document.getElementById('bgcanvas');
    const okGL = w.Scene3D.init(canvas);
    if (!okGL) {
      document.body.classList.add('no-gl');
      w.toast && w.toast('Tu navegador no soporta WebGL; la presentación funciona en modo plano.', 'mid');
    }

    // ---- pantalla de arranque = desbloqueo de audio (los navegadores bloquean autoplay)
    const bootEl = document.getElementById('boot');
    const snap = await w.State.load();

    const resumeBox = document.getElementById('boot-resume');
    if (snap) {
      resumeBox.classList.remove('hidden');
      document.getElementById('resume-info').textContent =
        `Sesión previa detectada: ${snap.log.length} decisiones registradas, presupuesto en $${snap.budget.toLocaleString('en-US')}.`;
      document.getElementById('btn-resume').addEventListener('click', () => start(snap));
    }
    document.getElementById('btn-start').addEventListener('click', () => start(null));

    function start(restoreSnap) {
      w.Audio3D.unlock();
      if (restoreSnap) { w.State.restore(restoreSnap); }
      bootEl.classList.add('gone');
      setTimeout(() => bootEl.remove(), 800);
      w.Deck.init();
      if (restoreSnap) w.toast('Progreso restaurado', 'good');
      if (!w.State.backendAvailable()) {
        setTimeout(() => w.toast('Sin servidor: el progreso no se guardará y la votación por celular estará desactivada.', 'mid'), 1400);
      }
    }

    // controles superiores
    document.getElementById('btn-mute').addEventListener('click', e => {
      const m = w.Audio3D.toggleMute();
      e.currentTarget.innerHTML = I(m ? 'mute' : 'sound');
      e.currentTarget.title = m ? 'Activar sonido' : 'Silenciar';
    });
    document.getElementById('btn-notes').addEventListener('click', () => w.Presenter.toggle());
    document.getElementById('btn-vote').addEventListener('click', () => w.Classroom.toggle());

    let rt = null;
    w.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { w.Scene3D.resize(); w.Forensic.resize(); w.Inspeccion3D && w.Inspeccion3D.resize(); }, 140);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
