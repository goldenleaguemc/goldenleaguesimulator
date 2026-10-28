/* Golden League Simulador · interfaz */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SQ = id => GL.S.squads.find(s => s.id === id) || { id, name: '(sin squad)', color: '#888' };
const chip = id => { const t = SQ(id); return `<span class="chip" style="--c:${t.color}">${esc(t.name)}</span>`; };
const plink = (id, n) => `<a class="pl" data-a="pl" data-id="${id}">${esc(n)}</a>`;
const dlt = v => `<span class="${v > 0.04 ? 'up' : v < -0.04 ? 'dn' : 'mu'}">${v > 0.04 ? '▲' : v < -0.04 ? '▼' : '•'} ${Math.abs(v).toFixed(1)}</span>`;
const kd = (k, d) => (d ? k / d : k).toFixed(2);
const toast = m => { const e = $('#toast'); e.textContent = m; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2300); };
const TABS = [['inicio', '🏠 Inicio'], ['bor', '🎯 Borrushers'], ['sq', '🛡️ Borrusquads'], ['par', '🎮 Partidas'], ['awd', '⭐ Golden Awards'], ['eq', '👥 Equipos'], ['aj', '⚙️ Ajustes']];
const noSeason = () => `<div class="panel"><h2>Sin temporada</h2><p class="mu">Necesitas al menos 2 Borrushers.</p><button class="btn" data-a="newSeason">Crear temporada</button></div>`;
const mById = id => GL.S.season.matches.find(m => m.id === id);
const played = () => GL.S.season ? GL.S.season.matches.filter(m => m.res) : [];

const spark = vals => {
  const w = 300, h = 60, mn = Math.min(...vals) - 1, mx = Math.max(...vals) + 1;
  const pts = vals.map((v, i) => `${(i / Math.max(1, vals.length - 1) * (w - 10) + 5).toFixed(1)},${(h - 5 - (v - mn) / (mx - mn) * (h - 10)).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" class="spark"><polyline points="${pts}" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
};

const boxHTML = m => {
  const r = m.res, rows = Object.entries(r.pl).sort((a, b) => a[1].pos - b[1].pos);
  const sq = Object.entries(r.sq).sort((a, b) => b[1].pts - a[1].pts);
  return `<div class="boxes"><div class="bx"><h4>Borrusquads</h4><div class="tw"><table><tr><th>#</th><th class="l">Squad</th><th>K</th><th>D</th><th>PTS</th></tr>
    ${sq.map(([id, q], i) => `<tr><td>${i + 1}</td><td class="l">${chip(id)}</td><td>${q.k}</td><td>${q.d}</td><td><b>${q.pts}</b></td></tr>`).join('')}</table></div></div>
    <div class="bx"><h4>Borrushers <span>MVP: ${esc(r.pl[r.w].n)}</span></h4><div class="tw"><table><tr><th>#</th><th class="l">Jugador</th><th>K</th><th>D</th><th>PTS</th><th>VAL</th></tr>
    ${rows.map(([id, p]) => `<tr><td>${p.pos}</td><td class="l">${plink(id, p.n)} <span class="dot" style="--c:${SQ(p.s).color}"></span></td><td>${p.k}</td><td>${p.d}</td><td><b>${p.pts}</b></td><td>${p.r.toFixed(1)} ${dlt(p.dr)}</td></tr>`).join('')}</table></div></div></div>`;
};

const matchRow = m => `<div class="mrow"><b>Partida ${m.n}</b>${m.res
  ? `<span class="mu">MVP <b style="color:var(--tx)">${esc(m.res.pl[m.res.w].n)}</b> (${m.res.pl[m.res.w].k}K) · ${chip(m.res.ws)} · ${m.res.tk} kills</span><span class="acts"><button class="sm alt" data-a="box" data-id="${m.id}">Ver</button></span>`
  : `<span class="acts"><button class="sm" data-a="live" data-id="${m.id}">▶ En vivo</button><button class="sm alt" data-a="quick" data-id="${m.id}" title="Simular al instante">⚡</button></span>`}</div>`;

const hist = () => GL.S.history.length ? `<div class="panel"><h3>📜 Palmarés</h3><div class="tw"><table><tr><th class="l">Temporada</th><th class="l">Golden Borrusher</th><th class="l">Golden Borrusquad</th></tr>
  ${GL.S.history.slice().reverse().map(h => `<tr><td class="l">${h.n}</td><td class="l">${esc(h.bor)} ${h.bs ? chip(h.bs) : ''}</td><td class="l">${h.sq ? chip(h.sq) : '-'}</td></tr>`).join('')}</table></div></div>` : '';

const VIEWS = {
  inicio() {
    const se = GL.S.season; if (!se) return noSeason();
    const pm = played(), tk = pm.reduce((s, m) => s + m.res.tk, 0);
    const ps = GL.pstats().sort((a, b) => b.pts - a.pts || b.k - a.k), ss = GL.sstats().sort((a, b) => b.pts - a.pts || b.k - a.k);
    const bestV = GL.pstats().sort((a, b) => b.rating - a.rating)[0];
    const ctrl = se.done
      ? `<div class="champ">🏆 Golden Borrusher: ${esc(ps[0].n)} ${chip(ps[0].s)}</div><div class="champ">🛡️ Golden Borrusquad: ${chip(ss[0].s)}</div><button class="btn" data-a="newSeason">Nueva temporada</button>`
      : `<div class="row"><button class="btn" data-a="live">▶ Siguiente partida en vivo</button><button class="btn alt" data-a="simOne">⚡ Simular partida</button><button class="btn alt" data-a="simAll">⏭ Simular hasta el final</button></div>`;
    return `<div class="stats"><div class="stat"><b>${pm.length}/${se.matches.length}</b>Partidas · Temp. ${se.num}</div><div class="stat"><b>${tk}</b>Kills totales</div>
      <div class="stat"><b>${pm.length ? Math.round(tk / pm.length) : '–'}</b>Kills / partida</div><div class="stat"><b>${bestV ? bestV.rating.toFixed(1) : '–'}</b>Mejor valoración · ${bestV ? esc(bestV.n) : ''}</div></div>
      <div class="panel">${ctrl}</div>
      <div class="grid2"><div class="panel"><h3>🎯 Top Borrushers</h3><div class="tw"><table><tr><th>#</th><th class="l">Jugador</th><th>K</th><th>PTS</th></tr>
      ${ps.slice(0, 5).map((p, i) => `<tr><td>${i + 1}</td><td class="l">${plink(p.id, p.n)} <span class="dot" style="--c:${SQ(p.s).color}"></span></td><td>${p.k}</td><td><b>${p.pts}</b></td></tr>`).join('')}</table></div></div>
      <div class="panel"><h3>🛡️ Top Borrusquads</h3><div class="tw"><table><tr><th>#</th><th class="l">Squad</th><th>K</th><th>PTS</th></tr>
      ${ss.slice(0, 5).map((s, i) => `<tr><td>${i + 1}</td><td class="l">${chip(s.s)}</td><td>${s.k}</td><td><b>${s.pts}</b></td></tr>`).join('')}</table></div></div></div>
      ${pm.length ? `<div class="panel"><h3>Última partida</h3>${matchRow(pm[pm.length - 1])}</div>` : ''}`;
  },
  bor() {
    if (!GL.S.season) return noSeason();
    let ps = GL.pstats(); if (GL.filter) ps = ps.filter(p => p.s === GL.filter);
    const K = { pts: p => p.pts, k: p => p.k, d: p => p.d, kd: p => p.d ? p.k / p.d : p.k, rating: p => p.rating, w: p => p.w, pj: p => p.pj };
    ps.sort((a, b) => K[GL.sort](b) - K[GL.sort](a) || b.pts - a.pts);
    const th = (k, l) => `<th data-sort="${k}" class="${GL.sort === k ? 'on' : ''}">${l}${GL.sort === k ? ' ▾' : ''}</th>`;
    return `<div class="panel"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Campeonato de Borrushers</h2>
      <select data-a="filter"><option value="">Todas las squads</option>${GL.S.squads.map(s => `<option value="${s.id}" ${GL.filter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
      <div class="tw"><table><tr><th>#</th><th class="l">Borrusher</th><th class="l">Squad</th>${th('rating', 'VAL')}${th('pj', 'PJ')}${th('k', 'K')}${th('d', 'D')}${th('kd', 'K/D')}${th('w', '🥇')}${th('pts', 'PTS')}</tr>
      ${ps.map((p, i) => `<tr><td>${i + 1}</td><td class="l">${plink(p.id, p.n)}</td><td class="l">${chip(p.s)}</td><td><b>${p.rating.toFixed(1)}</b> ${dlt(p.rating - p.r0)}</td><td>${p.pj}</td><td>${p.k}</td><td>${p.d}</td><td>${kd(p.k, p.d)}</td><td>${p.w}</td><td><b>${p.pts}</b></td></tr>`).join('')}</table></div>
      <p class="mu">Puntos por partida = kills + bonus por posición (1º +12, 2º +9, 3º +7, 4º +5, 5º +3, 6º +2, 7º +1). VAL = valoración actual y cambio desde el inicio de temporada. Pulsa un nombre para ver su historial.</p></div>`;
  },
  sq() {
    if (!GL.S.season) return noSeason();
    const ss = GL.sstats().sort((a, b) => b.pts - a.pts || b.k - a.k), ps = GL.pstats();
    return `<div class="panel"><h2>Campeonato de Borrusquads</h2><div class="tw"><table><tr><th>#</th><th class="l">Squad</th><th>Jug.</th><th>VAL med.</th><th>K</th><th>D</th><th>K/D</th><th>🥇</th><th>PTS</th></tr>
      ${ss.map((s, i) => { const m = ps.filter(p => p.s === s.s), v = m.length ? m.reduce((a, p) => a + p.rating, 0) / m.length : 0; return `<tr><td>${i + 1}</td><td class="l">${chip(s.s)}</td><td>${s.mem}</td><td>${v.toFixed(1)}</td><td>${s.k}</td><td>${s.d}</td><td>${kd(s.k, s.d)}</td><td>${s.w}</td><td><b>${s.pts}</b></td></tr>`; }).join('')}</table></div>
      <p class="mu">Los puntos de una squad son la suma de los puntos de sus Borrushers en cada partida. 🥇 = partidas en las que fue la squad con más puntos.</p></div>`;
  },
  par() {
    const se = GL.S.season; if (!se) return noSeason();
    return `<div class="panel"><h2>Partidas · Temporada ${se.num}</h2>${se.matches.map(matchRow).join('')}</div>`;
  },
  awd() {
    const se = GL.S.season, aw = GL.awards(), ps = GL.pstats();
    if (!aw.length) return `<div class="panel"><h2>⭐ Golden Awards</h2><p class="mu">Se desbloquean al jugar la primera partida.</p></div>` + hist();
    const who = a => a.t === 'p' ? `${plink(a.id, a.n)} ${chip(a.s)}` : chip(a.id);
    return `<div class="panel"><h2>⭐ Golden Awards · Temporada ${se.num}</h2><p class="mu">${se.done ? '🏆 Temporada terminada: ganadores definitivos.' : 'Líderes provisionales: cambian partida a partida.'}</p></div>
      <div class="awards">${aw.map(a => `<div class="award ${se.done ? 'won' : ''}"><div class="ic">${a.ic}</div><div><small>${a.name}</small><div>${who(a)}</div><span class="mu">${a.val}</span></div></div>`).join('')}</div>${hist()}`;
  },
  eq() {
    const S = GL.S;
    return `<div class="panel"><h2>Borrusquads y Borrushers</h2><p class="mu">Edita nombres, colores y la valoración (30-99). La valoración cambia sola después de cada partida según el rendimiento.</p>
      <div class="row"><button class="btn" data-a="addSq">＋ Borrusquad</button><button class="btn alt" data-a="rand">🎲 Valoraciones aleatorias</button></div></div>
      <div class="grid">${S.squads.map(s => `<div class="tcard panel" data-t="${s.id}"><div class="thead"><input type="color" data-f="color" value="${s.color}"><input data-f="tname" value="${esc(s.name)}"><button class="sm alt" data-a="delSq" title="Eliminar squad">✕</button></div>
      ${S.players.filter(p => p.squad === s.id).map(p => `<div class="prow" data-p="${p.id}"><input data-f="pname" value="${esc(p.name)}"><input type="range" min="30" max="99" value="${Math.round(p.rating)}" data-f="rating"><span class="sk">${Math.round(p.rating)}</span><button class="sm alt" data-a="delP">✕</button></div>`).join('')}
      <button class="sm" data-a="addP">＋ Borrusher</button></div>`).join('')}</div>`;
  },
  aj() {
    const s = GL.S.settings;
    return `<div class="panel"><h2>Ajustes</h2><div class="row">
      <label class="fld">Kills mín. por partida<input type="number" data-set="min" min="1" value="${s.min}"></label>
      <label class="fld">Kills máx. por partida<input type="number" data-set="max" min="2" value="${s.max}"></label>
      <label class="fld">Partidas por temporada<input type="number" data-set="partidas" min="1" max="60" value="${s.partidas}"></label></div>
      <p class="mu">En cada partida juegan todos los Borrushers a la vez. Total de kills = total de muertes, dentro del rango (por defecto 150-300). El nº de partidas se aplica al crear una temporada nueva.</p></div>
      <div class="panel"><h3>Importar desde texto</h3><p class="mu">Una línea por Borrusquad: <code>Squad: jugador=85, jugador2=70, jugador3</code> (valoración opcional).</p>
      <textarea id="bulk" placeholder="Golden Wolves: Zeus=90, Blaze=75, Nova=60&#10;Night Hawks: Hawk=80, Echo, Raven=70"></textarea>
      <div class="row" style="margin-top:8px"><button class="btn" data-a="bulk">Importar y reiniciar temporada</button></div></div>
      <div class="panel"><h3>Datos</h3><div class="row"><button class="btn alt" data-a="newSeason">🔄 Nueva temporada</button><button class="btn alt" data-a="exp">⬇ Exportar JSON</button>
      <label class="btn alt">⬆ Importar JSON<input type="file" id="imp" accept=".json" hidden></label><button class="btn alt" data-a="reset">🗑 Restaurar todo</button></div></div>`;
  }
};

function render() {
  $('#nav').innerHTML = TABS.map(([k, l]) => `<button class="${GL.tab === k ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('');
  $('#view').innerHTML = VIEWS[GL.tab]();
}
const modal = h => { const e = $('#modal'); e.innerHTML = `<div class="mbox"><button class="x" data-a="close">✕</button>${h}</div>`; e.classList.remove('hidden'); };

const A = {
  close() { clearInterval(GL.timer); $('#modal').classList.add('hidden'); render(); },
  newSeason() {
    const se = GL.S.season;
    if (se && !se.done && se.matches.some(m => m.res) && !confirm('Se perderá el progreso de la temporada actual. ¿Continuar?')) return;
    GL.newSeason(); render();
  },
  quick(t) { if (!GL.quick(mById(t.dataset.id))) return toast('Necesitas al menos 2 Borrushers'); GL.save(); render(); },
  simOne() { const n = GL.next(); if (n && GL.quick(n)) { GL.save(); render(); } },
  simAll() { let n; while ((n = GL.next())) if (!GL.quick(n)) return toast('Necesitas al menos 2 Borrushers'); GL.save(); render(); },
  box(t) {
    const m = mById(t.dataset.id), r = m.res;
    modal(`<h2 style="text-align:center">Partida ${m.n} · ${r.tk} kills</h2><div class="winner">⭐ MVP ${esc(r.pl[r.w].n)} · Squad ganadora ${chip(r.ws)}</div>${boxHTML(m)}`);
  },
  pl(t) {
    const p = GL.pstats().find(x => x.id === t.dataset.id); if (!p) return;
    const vals = [p.r0, ...p.hist.map(h => h.r)];
    modal(`<h2>${esc(p.n)} ${chip(p.s)}</h2><div class="stats"><div class="stat"><b>${p.rating.toFixed(1)}</b>Valoración ${dlt(p.rating - p.r0)}</div><div class="stat"><b>${p.pts}</b>Puntos</div><div class="stat"><b>${p.k}/${p.d}</b>K / D</div><div class="stat"><b>${p.w}</b>Victorias</div></div>
      ${p.hist.length ? `<h4>Evolución de la valoración</h4>${spark(vals)}<div class="tw"><table><tr><th>Partida</th><th>Pos.</th><th>K</th><th>D</th><th>PTS</th><th>VAL</th></tr>
      ${p.hist.map(h => `<tr><td>${h.n}</td><td>${h.pos}º</td><td>${h.k}</td><td>${h.d}</td><td>${h.pts}</td><td>${h.r.toFixed(1)} ${dlt(h.dr)}</td></tr>`).join('')}</table></div>` : '<p class="mu">Aún no ha jugado partidas.</p>'}`);
  },
  spd(t) { GL.spd = +t.dataset.v; },
  skip() { if (GL.skip) GL.skip(); },
  live(t) {
    const se = GL.S.season, m = t && t.dataset && t.dataset.id ? mById(t.dataset.id) : GL.next();
    if (!m) return toast('No quedan partidas');
    if (m.res) return A.box({ dataset: { id: m.id } });
    if (GL.S.players.length < 2) return toast('Necesitas al menos 2 Borrushers');
    const r = GL.gen(), ev = r.ev; delete r.ev; GL.commit(m, r); GL.save();
    const K = {}, D = {}, SK = {}, streak = {}, lines = []; let i = 0; GL.spd = 3;
    modal(`<h2 style="text-align:center">Partida ${m.n} · <span class="gold"><b id="tk">0</b> / ${r.tk}</span> kills</h2>
      <div class="ctl" id="ctl"><button class="sm alt" data-a="spd" data-v="1">x1</button><button class="sm alt" data-a="spd" data-v="3">x3</button><button class="sm alt" data-a="spd" data-v="10">x10</button><button class="sm" data-a="skip">Saltar ⏭</button></div>
      <div class="boxes"><div class="feed" id="feed"></div><div><div class="lb" id="lb"></div><div class="lb" id="lbs"></div></div></div><div id="boxwrap"></div>`);
    const upd = () => {
      $('#tk').textContent = i; $('#feed').innerHTML = lines.slice(-14).reverse().join('');
      const top = Object.keys(K).sort((a, b) => K[b] - K[a]).slice(0, 8);
      $('#lb').innerHTML = '<h4>Top Borrushers</h4>' + top.map((id, j) => `<div><span>${j + 1}. ${esc(r.pl[id].n)}</span><b>${K[id]}</b><em>${D[id] || 0} muertes</em></div>`).join('');
      $('#lbs').innerHTML = '<h4>Borrusquads</h4>' + Object.keys(SK).sort((a, b) => SK[b] - SK[a]).map(id => `<div style="--c:${SQ(id).color}"><span>${esc(SQ(id).name)}</span><b>${SK[id]}</b></div>`).join('');
    };
    const step = () => {
      const e = ev[i++], kn = r.pl[e.k], vn = r.pl[e.v];
      K[e.k] = (K[e.k] || 0) + 1; D[e.v] = (D[e.v] || 0) + 1; SK[kn.s] = (SK[kn.s] || 0) + 1; streak[e.k] = (streak[e.k] || 0) + 1; streak[e.v] = 0; const s = streak[e.k];
      lines.push(`<div style="--c:${SQ(kn.s).color}"><b>${esc(kn.n)}</b> 🔫 ${esc(vn.n)} <em>${e.w}${s >= 5 && s % 5 === 0 ? ' · 🔥 racha ' + s : ''}</em></div>`);
    };
    const fin = () => {
      clearInterval(GL.timer); GL.skip = null; upd(); const c = $('#ctl'); if (c) c.remove();
      $('#boxwrap').innerHTML = `<div class="winner">⭐ MVP ${esc(r.pl[r.w].n)} · Squad ganadora ${chip(r.ws)}</div>` + boxHTML(m);
    };
    GL.timer = setInterval(() => { for (let n = 0; n < GL.spd && i < ev.length; n++) step(); upd(); if (i >= ev.length) fin(); }, 60);
    GL.skip = () => { while (i < ev.length) step(); fin(); };
  },
  // ---- Editor ----
  addSq() { const S = GL.S, id = uid(); S.squads.push({ id, name: 'Borrusquad ' + (S.squads.length + 1), color: COLORS[S.squads.length % COLORS.length] }); GL.shuffle(NICKS.slice()).slice(0, 4).forEach(n => S.players.push(GL.mkPlayer(n, id))); GL.save(); render(); },
  delSq(t) {
    const id = t.closest('.tcard').dataset.t, S = GL.S;
    if (S.squads.length <= 1) return toast('Mínimo 1 Borrusquad');
    if (!confirm('Se eliminará la squad y todos sus Borrushers. ¿Continuar?')) return;
    S.squads = S.squads.filter(s => s.id !== id); S.players = S.players.filter(p => p.squad !== id); GL.save(); render();
  },
  addP(t) { const id = t.closest('.tcard').dataset.t, n = GL.S.players.filter(p => p.squad === id).length; GL.S.players.push(GL.mkPlayer('Borrusher ' + (n + 1), id)); GL.save(); render(); },
  delP(t) { if (GL.S.players.length <= 2) return toast('Mínimo 2 Borrushers'); GL.S.players = GL.S.players.filter(p => p.id !== t.closest('.prow').dataset.p); GL.save(); render(); },
  rand() { GL.S.players.forEach(p => { p.rating = rint(40, 95); if (!played().length) p.r0 = p.rating; }); GL.save(); render(); },
  filter(t) { GL.filter = t.value; render(); },
  bulk() {
    const squads = [], players = [];
    $('#bulk').value.split('\n').forEach(ln => {
      const ix = ln.indexOf(':'); if (ix < 1) return;
      const name = ln.slice(0, ix).trim(), id = uid(); let c = 0;
      ln.slice(ix + 1).split(',').map(s => s.trim()).filter(Boolean).forEach(s => { const [n, k] = s.split('='); players.push(GL.mkPlayer(n.trim(), id, Math.max(30, Math.min(99, parseInt(k) || rint(55, 92))))); c++; });
      if (name && c) squads.push({ id, name, color: COLORS[squads.length % COLORS.length] });
    });
    if (!squads.length || players.length < 2) return toast('Formato: Squad: jugador=80, jugador2');
    if (!confirm('Esto reemplaza squads y jugadores y reinicia la temporada. ¿Continuar?')) return;
    GL.S.squads = squads; GL.S.players = players; GL.newSeason(); render();
  },
  exp() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(GL.S, null, 1)], { type: 'application/json' })); a.download = 'golden-league-sim.json'; a.click(); },
  reset() { if (!confirm('¿Restaurar todo (squads, jugadores, palmarés)?')) return; GL.S = GL.defaults(); GL.newSeason(); render(); }
};

document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-a],[data-sort]');
  if (!t) { if (e.target.id === 'modal') A.close(); return; }
  if (t.dataset.tab) { GL.tab = t.dataset.tab; render(); return; }
  if (t.dataset.sort) { GL.sort = t.dataset.sort; render(); return; }
  if (t.tagName === 'SELECT') return;
  const f = A[t.dataset.a]; if (f) f(t);
});

document.addEventListener('input', e => {
  const el = e.target, f = el.dataset.f; if (!f) return;
  const card = el.closest('.tcard'), sq = SQ(card.dataset.t);
  if (f === 'tname') sq.name = el.value;
  else if (f === 'color') sq.color = el.value;
  else {
    const p = GL.S.players.find(x => x.id === el.closest('.prow').dataset.p); if (!p) return;
    if (f === 'pname') p.name = el.value;
    else if (f === 'rating') { p.rating = +el.value; if (!played().length) p.r0 = p.rating; el.nextElementSibling.textContent = el.value; }
  }
  GL.save();
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.a === 'filter') return A.filter(el);
  if (el.id === 'imp') {
    const r = new FileReader();
    r.onload = () => { try { const s = JSON.parse(r.result); if (!s.squads || !s.players || !s.settings) throw 0; GL.S = s; GL.save(); render(); toast('Datos importados'); } catch (x) { toast('Archivo no válido'); } };
    r.readAsText(el.files[0]); return;
  }
  const k = el.dataset.set; if (!k) return;
  const s = GL.S.settings, v = parseInt(el.value);
  if (k === 'min' || k === 'max') {
    const mn = k === 'min' ? v : s.min, mx = k === 'max' ? v : s.max;
    if (!(mn >= 1 && mx > mn)) { toast('El mínimo debe ser menor que el máximo'); return render(); }
    s[k] = v; GL.save(); toast('Se aplica a las próximas partidas');
  } else if (k === 'partidas') {
    if (!(v >= 1 && v <= 60)) return render();
    s.partidas = v; GL.save(); toast('Se aplicará en la próxima temporada');
  }
});

document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) A.close(); });

if (!GL.S.season) GL.newSeason();
render();
