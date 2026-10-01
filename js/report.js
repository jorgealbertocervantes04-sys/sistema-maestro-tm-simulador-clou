/* ============================================================
   DICTAMEN INDIVIDUAL EN PDF
   ============================================================ */
(function (w) {
  const money = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US');

  function build() {
    const jsPDFctor = w.jspdf && w.jspdf.jsPDF;
    if (!jsPDFctor) { w.toast('El generador de PDF no está disponible.', 'bad'); return; }
    const S = w.State.get();
    const doc = new jsPDFctor({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 46;
    let y = 0;

    const C = { void: [11, 35, 65], cyan: [251, 101, 0], ink: [30, 38, 50], dim: [110, 124, 140], red: [200, 20, 60], green: [0, 140, 70], amber: [176, 124, 0], line: [214, 222, 230] };

    function page(first) {
      if (!first) { doc.addPage(); }
      doc.setFillColor(...C.void); doc.rect(0, 0, W, 74, 'F');
      doc.setFillColor(...C.cyan); doc.rect(0, 74, W, 2.5, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(13.5);
      doc.text('FORMANDO EL TRAYECTO DEL INSTRUCTOR', M, 34);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(150, 205, 225);
      doc.text('DICTAMEN INDIVIDUAL DE COMPETENCIAS · SIMULADOR FORENSE DE DECISIÓN', M, 52);
      doc.setFontSize(8); doc.setTextColor(...C.dim);
      doc.text(new Date().toLocaleString('es-MX'), W - M, 34, { align: 'right' });
      y = 108;
    }
    function need(h) { if (y + h > H - 56) page(false); }
    function h2(t) {
      need(38); doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...C.ink);
      doc.text(t.toUpperCase(), M, y); y += 7;
      doc.setDrawColor(...C.cyan); doc.setLineWidth(1.4); doc.line(M, y, M + 46, y);
      doc.setDrawColor(...C.line); doc.setLineWidth(0.6); doc.line(M + 50, y, W - M, y);
      y += 17;
    }
    function para(t, color) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.6); doc.setTextColor(...(color || C.ink));
      const lines = doc.splitTextToSize(t, W - M * 2);
      lines.forEach(l => { need(15); doc.text(l, M, y); y += 13.4; });
      y += 5;
    }
    function bullets(arr, color) {
      doc.setFontSize(9.6);
      arr.forEach(t => {
        const lines = doc.splitTextToSize(t, W - M * 2 - 16);
        lines.forEach((l, i) => {
          need(15);
          if (i === 0) { doc.setFillColor(...(color || C.cyan)); doc.circle(M + 3.5, y - 3.2, 2.1, 'F'); }
          doc.setTextColor(...C.ink); doc.setFont('helvetica', 'normal');
          doc.text(l, M + 16, y); y += 13.4;
        });
        y += 3;
      });
      y += 4;
    }
    function kpi(cells) {
      need(66);
      const wCell = (W - M * 2 - 12 * (cells.length - 1)) / cells.length;
      cells.forEach((c, i) => {
        const x = M + i * (wCell + 12);
        doc.setFillColor(246, 249, 251); doc.setDrawColor(...C.line); doc.setLineWidth(0.6);
        doc.roundedRect(x, y, wCell, 54, 4, 4, 'FD');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); doc.setTextColor(...C.dim);
        doc.text(c[0].toUpperCase(), x + 10, y + 17);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(...(c[2] || C.ink));
        doc.text(String(c[1]), x + 10, y + 40);
      });
      y += 70;
    }

    page(true);

    /* --- veredicto / semáforo determinante --- */
    const diag = w.State.diagnostico();
    const g = { l: diag.nivel, d: diag.accion };
    const gradeColor = diag.col === 'var(--green)' ? C.green : diag.col === 'var(--red)' ? C.red : diag.col === 'var(--amber)' ? C.amber : C.cyan;
    doc.setFillColor(250, 252, 253); doc.setDrawColor(...gradeColor); doc.setLineWidth(1.2);
    doc.roundedRect(M, y, W - M * 2, 74, 5, 5, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(...C.dim);
    doc.text('SEMÁFORO OPERATIVO · ¿PUEDE LIBERAR OPERACIONES HOY?', M + 14, y + 17);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14.5); doc.setTextColor(...gradeColor);
    doc.text(g.l, M + 14, y + 35);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); doc.setTextColor(...C.ink);
    doc.splitTextToSize(g.d, W - M * 2 - 28).slice(0, 2).forEach((l, i) => doc.text(l, M + 14, y + 50 + i * 11));
    y += 92;

    kpi([
      ['Índice de criterio', diag.score + '/100', gradeColor],
      ['Hallazgos críticos', String(diag.criticas.length), diag.criticas.length ? C.red : C.green],
      ['Brechas a reforzar', String(diag.brechas.length), diag.brechas.length ? C.amber : C.green],
      ['Presupuesto final', money(S.budget), S.budget < 40000 ? C.red : C.green]
    ]);

    /* --- hallazgos críticos sobre su firma --- */
    h2('Hallazgos críticos que pesan sobre su firma');
    if (diag.criticas.length) bullets(diag.criticas, C.red);
    else bullets(['Sin hallazgos críticos: ninguna decisión de esta sesión inhabilita su firma.'], C.green);

    /* --- perfil de pensamiento --- */
    h2('Cómo piensa: perfil de decisión bajo presión');
    diag.perfil.forEach(p => {
      need(30);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.6); doc.setTextColor(...C.ink);
      doc.text('▸ ' + p.t, M, y); y += 12.5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...C.dim);
      doc.splitTextToSize(p.d, W - M * 2 - 10).forEach(l => { need(13); doc.text(l, M + 10, y); y += 11.6; });
      y += 5;
    });

    /* --- dimensiones con evidencia --- */
    h2('Diagnóstico por dimensión (evidencia observable)');
    diag.dims.forEach(x => {
      need(34);
      const colX = x.v >= 75 ? C.green : x.v >= 65 ? C.cyan : x.v >= 45 ? C.amber : C.red;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.4); doc.setTextColor(...C.ink);
      doc.text(doc.splitTextToSize(x.k, W - M * 2 - 70)[0], M, y);
      doc.setTextColor(...colX);
      doc.text(String(x.v) + '/100', W - M, y, { align: 'right' });
      y += 6;
      doc.setFillColor(236, 240, 244); doc.roundedRect(M, y, W - M * 2, 3.4, 1.7, 1.7, 'F');
      doc.setFillColor(...colX); doc.roundedRect(M, y, (W - M * 2) * Math.max(2, x.v) / 100, 3.4, 1.7, 1.7, 'F');
      y += 8;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4); doc.setTextColor(...C.dim);
      doc.splitTextToSize(x.ev, W - M * 2).forEach(l => { need(12); doc.text(l, M, y); y += 11; });
      y += 6;
    });

    /* --- fortalezas y áreas a reforzar --- */
    h2('Evidencia que sí respalda su firma (fortalezas ≥75)');
    if (diag.fuertes.length) bullets(diag.fuertes.map(f => f.k + ' (' + f.v + '/100): ' + f.ev), C.green);
    else bullets(['Sin fortaleza ≥75: la sesión no produjo evidencia suficiente en ninguna dimensión.'], C.dim);

    h2('Áreas a reforzar (con la evidencia en que falló)');
    if (diag.brechas.length) bullets(diag.brechas.map(gb => gb.k + ' (' + gb.v + '/100): ' + gb.ev), C.red);
    else bullets(['Sin brechas bajo 65: todas las dimensiones evaluadas están dentro de rango operativo.'], C.green);

    /* --- estado de la unidad --- */
    h2('Estado de la unidad al salir del patio');
    const names = { tires: 'Presión de llantas (dual interior)', brakes: 'Frenos de aire del dolly', kingpin: 'Quinta rueda y perno rey' };
    Object.keys(names).forEach(k => {
      const st = S.truck[k];
      const txt = st === 'ok' ? 'Corregida en taller' : st === 'fault' ? 'LIBERADA CON FALLA ACTIVA' : 'No auditada';
      const col = st === 'ok' ? C.green : st === 'fault' ? C.red : C.dim;
      need(18);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.6); doc.setTextColor(...C.ink);
      doc.text(names[k], M, y);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...col);
      doc.text(txt, W - M, y, { align: 'right' });
      doc.setDrawColor(...C.line); doc.setLineWidth(0.4); doc.line(M, y + 5, W - M, y + 5);
      y += 20;
    });
    y += 8;

    /* --- bitácora económica --- */
    h2('Bitácora de decisiones y consecuencia económica');
    const rows = S.log.filter(l => l.delta !== 0);
    if (!rows.length) para('No se registraron movimientos económicos en esta sesión.', C.dim);
    rows.forEach(l => {
      need(17);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.2); doc.setTextColor(...C.ink);
      const lines = doc.splitTextToSize(l.label, W - M * 2 - 96);
      doc.text(lines[0], M, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(l.delta < 0 ? C.red : C.green));
      doc.text(money(l.delta), W - M, y, { align: 'right' });
      doc.setDrawColor(...C.line); doc.setLineWidth(0.35); doc.line(M, y + 4.5, W - M, y + 4.5);
      y += 18;
    });
    y += 6;
    need(30);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...C.ink);
    doc.text('Costo total materializado', M, y);
    doc.setTextColor(...C.red);
    doc.text(money(-S.spent), W - M, y, { align: 'right' });
    y += 24;

    /* --- costo evitado --- */
    h2('Costo evitado frente a costo materializado');
    const evitado = estimarEvitado(S);
    para(`Las correcciones aplicadas en patio y en ruta evitaron una exposición estimada de ${money(evitado)}. El costo materializado de la sesión fue de ${money(S.spent)}. Diferencia neta a favor de la operación: ${money(evitado - S.spent)}.`);

    /* --- simulador de inspección 3D --- */
    const ins = S.inspeccion3d;
    if (ins) {
      h2('Simulador de inspección · veredictos en los 18 puntos de la unidad');
      para(`Precisión de veredicto: ${ins.pct}% (${ins.total} de ${ins.max} puntos). Defectos críticos detectados y bloqueados: ${ins.detectados} de ${ins.criticos}. Costo generado por veredictos incorrectos: ${money(-ins.costo)}.`,
        ins.detectados === ins.criticos ? C.green : C.red);
      const VL = { ok: 'Conforme', obs: 'Observación', no: 'No conforme' };
      ins.detalle.forEach(d => {
        need(17);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...C.ink);
        doc.text(doc.splitTextToSize(d.g + ' · ' + d.n, W - M * 2 - 190)[0], M, y);
        doc.setFontSize(8.4); doc.setTextColor(...C.dim);
        doc.text('Real: ' + VL[d.real], W - M - 96, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...(d.pts === 3 ? C.green : d.pts === 0 ? C.red : C.amber));
        doc.text((d.dado ? VL[d.dado] : 'Sin veredicto') + '  ' + d.pts + '/3', W - M, y, { align: 'right' });
        doc.setDrawColor(...C.line); doc.setLineWidth(0.35); doc.line(M, y + 4.5, W - M, y + 4.5);
        y += 17;
      });
      y += 10;
    }

    /* --- instrumento de evaluación del participante --- */
    const inst = S.instrumento;
    if (inst) {
      h2('Instrumento de evaluación diseñado por el participante');
      para(`El participante construyó un instrumento con ${inst.total} criterios distribuidos en ${inst.cats} categorías, de los cuales ${inst.criticos} fueron marcados como críticos. Calidad del instrumento: ${inst.pts}/100.`);
      if (inst.trampas && inst.trampas.length) {
        para('Criterios incluidos que premian conductas de riesgo (trampas del banco):', C.red);
        bullets(inst.trampas, C.red);
      }
    }

    const evs = S.evaluados;
    if (evs && evs.length) {
      h2('Operadores calificados con el instrumento del participante');
      evs.forEach(o => {
        need(19);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9.4); doc.setTextColor(...C.ink);
        doc.text(o.nombre, M, y);
        doc.setFontSize(8.4); doc.setTextColor(...C.dim);
        doc.text('Desempeño real: ' + o.real + '%', W - M - 96, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        const dif = Math.abs(o.real - o.calif);
        doc.setTextColor(...(dif <= 10 ? C.green : dif <= 22 ? C.amber : C.red));
        doc.text('Tu hoja: ' + o.calif + '%', W - M, y, { align: 'right' });
        doc.setDrawColor(...C.line); doc.setLineWidth(0.35); doc.line(M, y + 4.5, W - M, y + 4.5);
        y += 19;
      });
      y += 10;
    }

    const ec = S.evalCampo;
    if (ec) {
      h2('Evaluación de campo aplicada');
      para(`Operador evaluado: ${ec.nombre}. Resultado: ${ec.pct}% · ${ec.tier}. Criterios críticos reprobados: ${ec.faltas.length}.`,
        ec.faltas.length > 0 ? C.red : C.green);
    }

    /* --- competencias --- */
    h2('Competencias demostradas');
    bullets(w.State.strengths(), C.green);

    h2('Áreas de mejora derivadas de esta sesión');
    bullets(w.State.gaps().slice(0, 4), C.red);

    /* --- compromiso --- */
    h2('Compromiso de aplicación');
    para('Selecciona dos acciones concretas a implementar en tu patio durante los próximos siete días. Este dictamen no acredita por sí solo: acredita la conducta observable posterior.');
    need(150);
    doc.setDrawColor(...C.line); doc.setLineWidth(0.6);
    [1, 2].forEach((n, i) => {
      const ly = y + i * 34 + 20;
      doc.setFontSize(9); doc.setTextColor(...C.dim); doc.setFont('helvetica', 'bold');
      doc.text('Acción ' + n, M, ly - 4);
      doc.line(M + 54, ly, W - M, ly);
    });
    y += 84;
    doc.line(M, y + 30, M + 200, y + 30);
    doc.line(W - M - 200, y + 30, W - M, y + 30);
    doc.setFontSize(8); doc.setTextColor(...C.dim);
    doc.text('Firma del participante', M, y + 44);
    doc.text('Firma del facilitador', W - M - 200, y + 44);

    /* --- pie en todas las páginas --- */
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(7.4); doc.setTextColor(...C.dim); doc.setFont('helvetica', 'normal');
      doc.text('Formando el Trayecto del Instructor · Sistema Maestro TM · Mentores Operativos', M, H - 26);
      doc.text(p + ' / ' + total, W - M, H - 26, { align: 'right' });
    }

    doc.save('Dictamen-Instructor-TM.pdf');
    w.toast('Dictamen generado en PDF', 'good');
  }

  function estimarEvitado(S) {
    let t = 0;
    if (S.truck.tires === 'ok') t += 19000;
    if (S.truck.brakes === 'ok') t += 58000;
    if (S.truck.kingpin === 'ok') t += 260000;
    if (S.driver.fatigue <= 55) t += 95000;
    if (S.driver.stress < 58) t += 20000;
    if (S.driver.trust >= 55) t += 7000;
    if (!S.flags.firmoPresion) t += 9000;
    return t;
  }

  w.Report = { build };
})(window);
