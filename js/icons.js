/* Inline SVG icon system — no webfont dependency, works offline. */
(function (w) {
  const P = {
    truck: '<path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    alert: '<path d="M12 3 1.8 20h20.4z"/><path d="M12 9v5"/><path d="M12 17.4v.2"/>',
    phone: '<path d="M6.6 3h3l1.6 4-2 1.4a12 12 0 0 0 5.4 5.4l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3z"/>',
    scan: '<path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M3 12h18"/>',
    gauge: '<path d="M12 21a9 9 0 1 1 9-9"/><path d="m12 12 4-3"/>',
    brake: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>',
    link: '<path d="M9.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1-1"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/>',
    x: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 1.9"/>',
    left: '<path d="m14.5 5-7 7 7 7"/>',
    right: '<path d="m9.5 5 7 7-7 7"/>',
    play: '<path d="M7 4.5 19 12 7 19.5z"/>',
    film: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M7 4.5v15M17 4.5v15M2.5 12h19"/>',
    sound: '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M16 9a4.5 4.5 0 0 1 0 6"/><path d="M18.8 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="m16.5 9.5 5 5M21.5 9.5l-5 5"/>',
    notes: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 14.4A6 6 0 0 1 21 20"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
    shield: '<path d="M12 3 5 6v6c0 4.2 2.9 7.7 7 9 4.1-1.3 7-4.8 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    fire: '<path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.5-4 .2 1.2 1 2 1.8 2 1.2 0 1.2-1.5 1.2-3 0-2 .5-3.3.5-4z"/>',
    route: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5A2.5 2.5 0 0 0 8 10M16 5.5h2.5A2.5 2.5 0 0 1 16 10"/><path d="M12 13v3M9 20h6M10 16h4l.5 4h-5z"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
    home: '<path d="m3 10.5 9-7 9 7V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    people: '<circle cx="12" cy="7" r="3.4"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    brain: '<path d="M9.5 4.5a2.8 2.8 0 0 0-2.8 2.8 2.6 2.6 0 0 0-1.2 4.6A2.7 2.7 0 0 0 7 16.6a2.7 2.7 0 0 0 5.2.9V6.4a2.6 2.6 0 0 0-2.7-1.9z"/><path d="M14.5 4.5a2.8 2.8 0 0 1 2.8 2.8 2.6 2.6 0 0 1 1.2 4.6 2.7 2.7 0 0 1-1.5 4.7 2.7 2.7 0 0 1-5.2.9"/>',
    down: '<path d="m6 9.5 6 6 6-6"/>',
    qr: '<rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>',
    exit: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="m15 8 4 4-4 4M19 12H9"/>',
    save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h7V3M8 21v-6h8v6"/>'
  };
  w.svgIcon = function (name, cls) {
    const d = P[name] || P.alert;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"' +
      (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true">' + d + '</svg>';
  };
  w.ICONS = P;
})(window);
