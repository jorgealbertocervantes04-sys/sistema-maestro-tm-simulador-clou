/* ============================================================
   EVIDENCIA DE SESIÓN — asistencia, votación y encuesta en PDF
   Tres formas de descarga: reporte grupal, todos los individuales
   de un jalón, o uno solo elegido de una lista.
   ============================================================ */
(function (w) {
  const C = { void: [11, 35, 65], cyan: [251, 101, 0], ink: [30, 38, 50], dim: [110, 124, 140], line: [214, 222, 230] };

  async function fetchReport(room, api) {
    const r = await fetch(api + '/session/' + room + '/report');
    if (!r.ok) throw new Error('no se pudo leer el reporte');
    return r.json();
  }

  function avg(list, key) {
    const nums = list.map(x => Number(x.ratings && x.ratings[key])).filter(n => !isNaN(n));
    if (!nums.length) return null;
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  }

  function slideIndex() {
    const idx = {};
    const slides = (w.CONTENT && w.CONTENT.SLIDES) || [];
    slides.forEach(s => {
      if (!s.choices) return;
      const byKey = {};
      s.choices.forEach(c => { byKey[c.key] = c; });
      idx[s.id] = { choices: byKey };
    });
    return idx;
  }

  /* Retro personalizada: cruza cada voto del asistente con el tono (bueno/medio/riesgo)
     de la opción que eligió en esa escena, para explicar qué se detectó y por qué. */
  function buildPersonalFeedback(attendee, votes, satisfaction, slidesById) {
    const mine = votes.filter(v => v.attendee_id === attendee.id);
    const tally = { good: 0, mid: 0, bad: 0 };
    const risky = [];
    mine.forEach(v => {
      const slide = slidesById[v.slide_id];
      const choice = slide && slide.choices[v.option_key];
      const tone = choice ? choice.tone : null;
      if (tone && tally[tone] !== undefined) tally[tone]++;
      if (choice && tone !== 'good') {
        risky.push({ slide: v.slide_id, label: choice.label, tone, verdict: choice.verdict || '' });
      }
    });
    const sat = satisfaction.find(s => s.attendee_id === attendee.id);
    return { totalVotes: mine.length, tally, risky, satisfaction: sat || null };
  }

  /* -------- helpers comunes de maquetado del PDF -------- */
  function newDoc(subtitle) {
    const jsPDFctor = w.jspdf && w.jspdf.jsPDF;
    if (!jsPDFctor) return null;
    const doc = new jsPDFctor({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 46;
    const ctx = { doc, W, H, M, y: 0, subtitle };

    ctx.page = (first) => {
      if (!first) doc.addPage();
      doc.setFillColor(...C.void); doc.rect(0, 0, W, 74, 'F');
      doc.setFillColor(...C.cyan); doc.rect(0, 74, W, 2.5, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(13.5);
      doc.text('FORMANDO EL TRAYECTO DEL INSTRUCTOR', M, 34);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(150, 205, 225);
      doc.text(ctx.subtitle, M, 52);
      doc.setFontSize(8); doc.setTextColor(...C.dim);
      doc.text(new Date().toLocaleString('es-MX'), W - M, 34, { align: 'right' });
      ctx.y = 108;
    };
    ctx.need = (h) => { if (ctx.y + h > H - 56) ctx.page(false); };
    ctx.h2 = (t) => {
      ctx.need(38); doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...C.ink);
      doc.text(t.toUpperCase(), M, ctx.y); ctx.y += 7;
      doc.setDrawColor(...C.cyan); doc.setLineWidth(1.4); doc.line(M, ctx.y, M + 46, ctx.y);
      doc.setDrawColor(...C.line); doc.setLineWidth(0.6); doc.line(M + 50, ctx.y, W - M, ctx.y);
      ctx.y += 17;
    };
    ctx.row = (t, size) => {
      ctx.need(size || 14); doc.setFont('helvetica', 'normal'); doc.setFontSize(9.6); doc.setTextColor(...C.ink);
      doc.text(t, M, ctx.y); ctx.y += (size || 14);
    };
    return ctx;
  }

  /* -------- PDF grupal: sesión, asistencia, votación, encuesta agregada -------- */
  function buildGroupDoc(data) {
    const ctx = newDoc('EVIDENCIA DE SESIÓN · SALA ' + data.session.code);
    if (!ctx) return null;
    const { doc, W, M } = ctx;
    ctx.page(true);

    ctx.h2('Datos de la sesión');
    ctx.row('Código de sala: ' + data.session.code);
    ctx.row('Facilitador: ' + (data.session.facilitator || '—'));
    ctx.row('Grupo: ' + (data.session.groupName || '—'));
    ctx.row('Inicio: ' + new Date(data.session.createdAt).toLocaleString('es-MX'));
    ctx.row('Cierre: ' + (data.session.closedAt ? new Date(data.session.closedAt).toLocaleString('es-MX') : 'sesión abierta'));
    ctx.y += 6;

    ctx.h2('Lista de asistencia (' + data.attendance.length + ')');
    if (!data.attendance.length) ctx.row('Sin registros de asistencia.');
    data.attendance.forEach((a, i) => ctx.row((i + 1) + '. ' + a.name + '  ·  ' + new Date(a.joined_at).toLocaleTimeString('es-MX')));
    ctx.y += 6;

    ctx.h2('Votación por escena');
    if (!data.votes.length) ctx.row('Sin votos registrados.');
    else {
      const bySlide = {};
      data.votes.forEach(v => { (bySlide[v.slide_id] = bySlide[v.slide_id] || []).push(v.option_key); });
      Object.keys(bySlide).forEach(slideId => {
        const opts = bySlide[slideId];
        const counts = {};
        opts.forEach(o => counts[o] = (counts[o] || 0) + 1);
        const summary = Object.keys(counts).map(k => k + ': ' + counts[k]).join('   ');
        ctx.row(slideId + '  —  ' + summary + '  (' + opts.length + ' votos)');
      });
    }
    ctx.y += 6;

    ctx.h2('Encuesta final de satisfacción (' + data.satisfaction.length + ' respuestas)');
    if (!data.satisfaction.length) ctx.row('Sin respuestas de encuesta.');
    else {
      const keys = Array.from(new Set(data.satisfaction.flatMap(s => Object.keys(s.ratings || {}))));
      keys.forEach(k => { const a = avg(data.satisfaction, k); if (a) ctx.row(k + ': promedio ' + a + ' / 5'); });
      ctx.y += 6;
      const comments = data.satisfaction.filter(s => s.comment && s.comment.trim());
      if (comments.length) {
        ctx.row('Comentarios:');
        comments.forEach(c => doc.splitTextToSize('· ' + c.comment, W - 2 * M).forEach(l => ctx.row(l)));
      }
    }
    return doc;
  }

  /* -------- PDF individual: retro de un solo participante -------- */
  function buildIndividualDoc(data, attendee, slidesById) {
    const ctx = newDoc('RETRO INDIVIDUAL · SALA ' + data.session.code);
    if (!ctx) return null;
    const { doc, W, M } = ctx;
    ctx.page(true);

    ctx.h2(attendee.name);
    ctx.row('Sala: ' + data.session.code + '   ·   Grupo: ' + (data.session.groupName || '—'));
    ctx.row('Asistencia registrada: ' + new Date(attendee.joined_at).toLocaleString('es-MX'));
    ctx.y += 10;

    const fb = buildPersonalFeedback(attendee, data.votes, data.satisfaction, slidesById);
    ctx.h2('Decisiones tomadas en la sesión');
    if (!fb.totalVotes) {
      ctx.row('No se registraron votos de este participante en esta sesión.');
    } else {
      ctx.row('Estándar alto: ' + fb.tally.good + '   ·   Riesgo medio: ' + fb.tally.mid + '   ·   Alto riesgo: ' + fb.tally.bad + '   (de ' + fb.totalVotes + ' decisiones votadas)');
      ctx.y += 6;
      if (fb.risky.length) {
        ctx.row('Momentos a revisar con esta persona:');
        fb.risky.forEach(r => {
          doc.splitTextToSize('· [' + r.slide + '] eligió "' + r.label + '"' + (r.verdict ? ' — ' + r.verdict : ''), W - 2 * M - 10).forEach(l => ctx.row(l, 13));
        });
      } else {
        ctx.row('Consistencia en decisiones de estándar alto en todas las escenas votadas.');
      }
    }
    ctx.y += 10;

    ctx.h2('Encuesta final de satisfacción');
    if (!fb.satisfaction) {
      ctx.row('No respondió la encuesta final.');
    } else {
      const r = fb.satisfaction.ratings || {};
      Object.keys(r).forEach(k => ctx.row(k + ': ' + r[k] + ' / 5'));
      if (fb.satisfaction.comment) doc.splitTextToSize('Comentario: "' + fb.satisfaction.comment + '"', W - 2 * M).forEach(l => ctx.row(l));
    }
    return doc;
  }

  async function withReport(room, api) {
    if (!(w.jspdf && w.jspdf.jsPDF)) { w.toast && w.toast('El generador de PDF no está disponible.', 'bad'); return null; }
    try { return await fetchReport(room, api); }
    catch (e) { w.toast && w.toast('No se pudo descargar la evidencia.', 'bad'); return null; }
  }

  async function downloadGroup(room, api) {
    const data = await withReport(room, api);
    if (!data) return;
    const doc = buildGroupDoc(data);
    if (doc) doc.save('evidencia-grupal-' + data.session.code + '.pdf');
  }

  async function downloadAllIndividual(room, api) {
    const data = await withReport(room, api);
    if (!data) return;
    if (!data.attendance.length) { w.toast && w.toast('Todavía no hay participantes registrados.', 'bad'); return; }
    const slidesById = slideIndex();
    for (const a of data.attendance) {
      const doc = buildIndividualDoc(data, a, slidesById);
      if (doc) doc.save('retro-' + a.name.replace(/[^a-z0-9]+/gi, '-') + '-' + data.session.code + '.pdf');
      await new Promise(res => setTimeout(res, 350)); // evita que el navegador bloquee descargas simultáneas
    }
  }

  async function downloadOneIndividual(room, api, attendeeId) {
    const data = await withReport(room, api);
    if (!data) return;
    const a = data.attendance.find(x => x.id === attendeeId);
    if (!a) { w.toast && w.toast('No se encontró ese participante.', 'bad'); return; }
    const doc = buildIndividualDoc(data, a, slideIndex());
    if (doc) doc.save('retro-' + a.name.replace(/[^a-z0-9]+/gi, '-') + '-' + data.session.code + '.pdf');
  }

  async function listAttendees(room, api) {
    const data = await withReport(room, api);
    return data ? data.attendance : [];
  }

  w.Evidencia = { downloadGroup, downloadAllIndividual, downloadOneIndividual, listAttendees };
})(window);
