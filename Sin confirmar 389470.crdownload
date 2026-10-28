/* Golden League Simulador · interfaz */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TM = id => GL.S.teams.find(t => t.id === id) || { id, name: '(eliminado)', color: '#888', players: [] };
const chip = id => { const t = TM(id); return `<span class="chip" style="--c:${t.color}">${esc(t.name)}</span>`; };
const toast = m => { const e = $('#toast'); e.textContent = m; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2300); };
const TABS = [['liga', '🏆 Liga'], ['cal', '📅 Calendario'], ['jug', '🎯 Jugadores'], ['po', '⚔️ Playoffs'], ['eq', '👥 Equipos'], ['aj', '⚙️ Ajustes']];
const noSeason = () => `<div class="panel"><h2>Sin temporada</h2><p class="mu">Necesitas al menos 2 equipos.</p><button class="btn" data-a="newSeason">Crear temporada</button></div>`;

const roundName = g => {
  if (g.phase === 'liga') return 'Jornada ' + (g.round + 1);
  const n = GL.S.season.matches.filter(m => m.phase === 'po' && m.round === g.round).length;
  return n === 1 ? '🏆 Final' : n === 2 ? 'Semifinales' : n === 4 ? 'Cuartos de final' : 'Ronda ' + (g.round + 1);
};

const matchRow = m => `<div class="mrow">${chip(m.a)}<span class="vs">${m.res ? `<b>${m.res.ka}</b> – <b>${m.res.kb}</b>` : 'vs'}</span>${chip(m.b)}
<span class="acts">${m.res ? `<button class="sm alt" data-a="box" data-id="${m.id}">Ver</button>`
  : `<button class="sm" data-a="live" data-id="${m.id}">▶ En vivo</button><button class="sm alt" data-a="quick" data-id="${m.id}" title="Simular al instante">⚡</button>`}</span></div>`;

const boxHTML = m => {
  const r = m.res;
  const side = id => {
    const rows = Object.values(r.pl).filter(p => p.t === id).sort((a, b) => b.k - a.k);
    return `<div class="bx"><h4>${chip(id)} <span>${id === m.a ? r.ka : r.kb} kills</span></h4><div class="tw"><table><tr><th>Jugador</th><th>K</th><th>D</th><th>K/D</th></tr>
    ${rows.map(p => `<tr><td>${esc(p.n)}</td><td>${p.k}</td><td>${p.d}</td><td>${(p.d ? p.k / p.d : p.k).toFixed(2)}</td></tr>`).join('')}</table></div></div>`;
  };
  return `<div class="boxes">${side(m.a)}${side(m.b)}</div>`;
};

const VIEWS = {
  liga() {
    const se = GL.S.season; if (!se) return noSeason();
    const st = GL.standings(), played = se.matches.filter(m => m.res), z = GL.poSize();
    const tk = played.reduce((s, m) => s + m.res.ka + m.res.kb, 0);
    let ctrl;
    if (se.phase === 'fin') ctrl = `<div class="champ">🏆 Campeón: ${chip(se.champion)}</div><button class="btn" data-a="newSeason">Nueva temporada</button>`;
    else if (se.phase === 'listo') ctrl = `<p>Liga regular terminada.</p><div class="row"><button class="btn" data-a="startPO">🏆 Iniciar playoffs</button><button class="btn alt" data-a="simAll">⏭ Simular playoffs</button></div>`;
    else ctrl = `<div class="row"><button class="btn" data-a="live">▶ Siguiente partido en vivo</button><button class="btn alt" data-a="simRound">⏩ Simular jornada</button><button class="btn alt" data-a="simAll">⏭ Simular hasta el final</button></div>`;
    return `<div class="stats"><div class="stat"><b>${played.length}/${se.matches.length}</b>Partidos</div><div class="stat"><b>${tk}</b>Kills totales</div>
      <div class="stat"><b>${played.length ? Math.round(tk / played.length / 2) : '–'}</b>Kills / equipo</div><div class="stat"><b>${esc(se.phase === 'po' ? 'Playoffs' : se.phase === 'liga' ? 'Liga' : se.phase === 'listo' ? 'Pre-playoffs' : 'Final')}</b>Fase</div></div>
      <div class="panel">${ctrl}</div>
      <div class="panel"><h2>Clasificación</h2><div class="tw"><table><tr><th>#</th><th class="l">Equipo</th><th>PJ</th><th>G</th><th>P</th><th>K</th><th>D</th><th>+/-</th><th>PTS</th></tr>
      ${st.map((r, i) => `<tr class="${i < z ? 'zone' : ''}"><td>${i + 1}</td><td class="l">${chip(r.t.id)}</td><td>${r.pj}</td><td>${r.g}</td><td>${r.p}</td><td>${r.k}</td><td>${r.d}</td><td>${r.k - r.d}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div>
      ${z ? `<p class="mu">Franja dorada: clasifican a playoffs (top ${z}). Victoria = 3 pts.</p>` : ''}</div>
      ${played.length ? `<div class="panel"><h3>Últimos resultados</h3>${played.slice(-5).reverse().map(matchRow).join('')}</div>` : ''}`;
  },
  cal() {
    const se = GL.S.season; if (!se) return noSeason();
    const g = {}; se.matches.forEach(m => { const k = m.phase + m.round; (g[k] = g[k] || { m: [], phase: m.phase, round: m.round }).m.push(m); });
    return Object.values(g).map(x => `<div class="panel"><h3>${roundName(x)}</h3>${x.m.map(matchRow).join('')}</div>`).join('');
  },
  jug() {
    let pl = GL.players(); if (GL.filter) pl = pl.filter(p => p.t === GL.filter);
    const kd = p => p.d ? p.k / p.d : p.k;
    const keys = { k: p => p.k, d: p => p.d, kd, pj: p => p.pj, kpj: p => p.pj ? p.k / p.pj : 0 };
    pl.sort((a, b) => keys[GL.sort](b) - keys[GL.sort](a));
    const th = (k, l) => `<th data-sort="${k}" class="${GL.sort === k ? 'on' : ''}">${l}${GL.sort === k ? ' ▾' : ''}</th>`;
    return `<div class="panel"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Jugadores</h2>
      <select data-a="filter"><option value="">Todos los equipos</option>${GL.S.teams.map(t => `<option value="${t.id}" ${GL.filter === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
      ${pl.length ? `<div class="tw"><table><tr><th>#</th><th class="l">Jugador</th><th class="l">Equipo</th>${th('pj', 'PJ')}${th('k', 'Kills')}${th('d', 'Muertes')}${th('kd', 'K/D')}${th('kpj', 'K/PJ')}</tr>
      ${pl.map((p, i) => `<tr><td>${i + 1}</td><td class="l">${esc(p.n)}</td><td class="l">${chip(p.t)}</td><td>${p.pj}</td><td><b>${p.k}</b></td><td>${p.d}</td><td>${kd(p).toFixed(2)}</td><td>${(p.k / p.pj).toFixed(1)}</td></tr>`).join('')}</table></div>`
      : '<p class="mu">Aún no hay partidos jugados.</p>'}</div>`;
  },
  po() {
    const se = GL.S.season; if (!se) return noSeason();
    const po = se.matches.filter(m => m.phase === 'po');
    if (!po.length) {
      const n = GL.poSize();
      return `<div class="panel"><h2>Playoffs</h2>${n ? `<p>Clasifican los <b>${n}</b> primeros de la liga (eliminatoria directa, 1 partido por cruce).</p>` : '<p class="mu">Los playoffs están desactivados (Ajustes).</p>'}
      ${se.phase === 'listo' ? '<button class="btn" data-a="startPO">🏆 Iniciar playoffs</button>' : ''}</div>`;
    }
    const r = {}; po.forEach(m => (r[m.round] = r[m.round] || []).push(m));
    return `<div class="bracket">${Object.values(r).map(ms => `<div class="col"><h3>${roundName({ phase: 'po', round: ms[0].round })}</h3>${ms.map(matchRow).join('')}</div>`).join('')}</div>
      ${se.champion ? `<div class="panel"><div class="champ">🏆 Campeón: ${chip(se.champion)}</div></div>` : ''}`;
  },
  eq() {
    return `<div class="panel"><h2>Equipos y jugadores</h2><p class="mu">Edita nombre, color y habilidad (1-100) de cada jugador. Más habilidad = más kills y menos muertes.</p>
      <div class="row"><button class="btn" data-a="addTeam">＋ Equipo</button><button class="btn alt" data-a="rand">🎲 Habilidades aleatorias</button></div></div>
      <div class="grid">${GL.S.teams.map(t => `<div class="tcard panel" data-t="${t.id}"><div class="thead"><input type="color" data-f="color" value="${t.color}"><input data-f="tname" value="${esc(t.name)}"><button class="sm alt" data-a="delTeam" title="Eliminar equipo">✕</button></div>
      ${t.players.map(p => `<div class="prow" data-p="${p.id}"><input data-f="pname" value="${esc(p.name)}"><input type="range" min="1" max="100" value="${p.skill}" data-f="skill"><span class="sk">${p.skill}</span><button class="sm alt" data-a="delP">✕</button></div>`).join('')}
      <button class="sm" data-a="addP">＋ Jugador</button></div>`).join('')}</div>`;
  },
  aj() {
    const s = GL.S.settings;
    return `<div class="panel"><h2>Ajustes de simulación</h2><div class="row">
      <label class="fld">Kills mín. por equipo<input type="number" data-set="min" min="1" value="${s.min}"></label>
      <label class="fld">Kills máx. por equipo<input type="number" data-set="max" min="2" value="${s.max}"></label>
      <label class="fld">Vueltas de liga<select data-set="vueltas"><option value="1" ${s.vueltas === 1 ? 'selected' : ''}>1 (todos contra todos)</option><option value="2" ${s.vueltas === 2 ? 'selected' : ''}>2 (ida y vuelta)</option></select></label>
      <label class="fld">Playoffs<select data-set="topN"><option value="0" ${!s.topN ? 'selected' : ''}>Sin playoffs</option><option value="2" ${s.topN === 2 ? 'selected' : ''}>Final (top 2)</option><option value="4" ${s.topN === 4 ? 'selected' : ''}>Top 4</option><option value="8" ${s.topN === 8 ? 'selected' : ''}>Top 8</option></select></label></div>
      <p class="mu">Las muertes de un equipo son las kills del rival. El rango se aplica a las kills totales de cada equipo por partido (por defecto 150-300).</p></div>
      <div class="panel"><h3>Importar equipos desde texto</h3><p class="mu">Una línea por equipo: <code>Equipo: jugador=85, jugador2=70, jugador3</code> (la habilidad es opcional).</p>
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
const mById = id => GL.S.season.matches.find(m => m.id === id);
const struct = fn => {
  const se = GL.S.season;
  if (se && se.matches.some(m => m.res) && !confirm('Este cambio reinicia la temporada actual. ¿Continuar?')) return;
  fn(); GL.newSeason(); render();
};

const A = {
  close() { clearInterval(GL.timer); $('#modal').classList.add('hidden'); render(); },
  newSeason() { struct(() => {}); },
  startPO() { GL.startPO(); GL.tab = 'po'; render(); },
  quick(t) { const m = mById(t.dataset.id); if (!GL.quick(m)) return toast('Cada equipo necesita jugadores'); GL.save(); render(); },
  simRound() {
    const n = GL.next(); if (!n) return; let c = 0;
    GL.S.season.matches.filter(m => !m.res && m.phase === n.phase && m.round === n.round).forEach(m => { if (GL.quick(m)) c++; });
    GL.save(); toast(c + ' partidos simulados'); render();
  },
  simAll() {
    const se = GL.S.season; let g = 0;
    while (se.phase !== 'fin' && g++ < 3000) {
      if (se.phase === 'listo') { GL.startPO(); continue; }
      const n = GL.next(); if (!n) break;
      if (!GL.quick(n)) { toast('Hay un equipo sin jugadores'); break; }
    }
    GL.save(); render();
  },
  box(t) {
    const m = mById(t.dataset.id), r = m.res;
    modal(`<div class="score"><div>${chip(m.a)}<b>${r.ka}</b></div><span>VS</span><div><b>${r.kb}</b>${chip(m.b)}</div></div><div class="winner">🏆 Gana ${chip(r.w)}</div>${boxHTML(m)}`);
  },
  spd(t) { GL.spd = +t.dataset.v; },
  skip() { if (GL.skip) GL.skip(); },
  live(t) {
    const m = t.dataset.id ? mById(t.dataset.id) : GL.next();
    if (!m) return toast('No quedan partidos');
    if (m.res) return A.box({ dataset: { id: m.id } });
    const a = TM(m.a), b = TM(m.b);
    if (!a.players.length || !b.players.length) return toast('Cada equipo necesita jugadores');
    const r = GL.gen(a, b), ev = r.ev; delete r.ev; m.res = r; GL.advance(); GL.save();
    const cnt = { ka: 0, kb: 0 }, streak = {}, lines = []; let i = 0; GL.spd = 3;
    modal(`<div class="score"><div>${chip(m.a)}<b id="ka">0</b></div><span>VS</span><div><b id="kb">0</b>${chip(m.b)}</div></div>
      <div class="ctl" id="ctl"><button class="sm alt" data-a="spd" data-v="1">x1</button><button class="sm alt" data-a="spd" data-v="3">x3</button><button class="sm alt" data-a="spd" data-v="10">x10</button><button class="sm" data-a="skip">Saltar ⏭</button></div>
      <div class="feed" id="feed"></div><div id="boxwrap"></div>`);
    const upd = () => { $('#ka').textContent = cnt.ka; $('#kb').textContent = cnt.kb; $('#feed').innerHTML = lines.slice(-14).reverse().join(''); };
    const step = () => {
      const e = ev[i++], kn = r.pl[e.k], vn = r.pl[e.v];
      cnt[e.t === m.a ? 'ka' : 'kb']++; streak[e.k] = (streak[e.k] || 0) + 1; streak[e.v] = 0; const s = streak[e.k];
      lines.push(`<div style="--c:${TM(e.t).color}"><b>${esc(kn.n)}</b> 🔫 ${esc(vn.n)} <em>${e.w}${s >= 5 && s % 5 === 0 ? ' · 🔥 racha ' + s : ''}</em></div>`);
    };
    const fin = () => { clearInterval(GL.timer); GL.skip = null; upd(); const c = $('#ctl'); if (c) c.remove(); $('#boxwrap').innerHTML = `<div class="winner">🏆 Gana ${chip(r.w)}</div>` + boxHTML(m); };
    GL.timer = setInterval(() => { for (let n = 0; n < GL.spd && i < ev.length; n++) step(); upd(); if (i >= ev.length) fin(); }, 60);
    GL.skip = () => { while (i < ev.length) step(); fin(); };
  },
  // ---- Editor de equipos ----
  addTeam() {
    struct(() => { const pool = GL.shuffle(NICKS.slice()).slice(0, 6); GL.S.teams.push({ id: uid(), name: 'Equipo ' + (GL.S.teams.length + 1), color: COLORS[GL.S.teams.length % COLORS.length], players: GL.mkPlayers(pool) }); });
  },
  delTeam(t) {
    if (GL.S.teams.length <= 2) return toast('Mínimo 2 equipos');
    const id = t.closest('.tcard').dataset.t; struct(() => { GL.S.teams = GL.S.teams.filter(x => x.id !== id); });
  },
  addP(t) { const tm = TM(t.closest('.tcard').dataset.t); tm.players.push({ id: uid(), name: 'Jugador ' + (tm.players.length + 1), skill: rint(50, 90) }); GL.save(); render(); },
  delP(t) {
    const tm = TM(t.closest('.tcard').dataset.t); if (tm.players.length <= 1) return toast('Mínimo 1 jugador');
    tm.players = tm.players.filter(p => p.id !== t.closest('.prow').dataset.p); GL.save(); render();
  },
  rand() { GL.S.teams.forEach(t => t.players.forEach(p => p.skill = rint(40, 95))); GL.save(); render(); },
  filter(t) { GL.filter = t.value; render(); },
  bulk() {
    const teams = [];
    $('#bulk').value.split('\n').forEach((ln, i) => {
      const ix = ln.indexOf(':'); if (ix < 1) return;
      const name = ln.slice(0, ix).trim();
      const pl = ln.slice(ix + 1).split(',').map(s => s.trim()).filter(Boolean).map(s => { const [n, k] = s.split('='); return { id: uid(), name: n.trim(), skill: Math.max(1, Math.min(100, parseInt(k) || rint(50, 90))) }; });
      if (name && pl.length) teams.push({ id: uid(), name, color: COLORS[teams.length % COLORS.length], players: pl });
    });
    if (teams.length < 2) return toast('Formato: Equipo: jugador=80, jugador2 (mín. 2 equipos)');
    struct(() => { GL.S.teams = teams; });
  },
  exp() {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(GL.S, null, 1)], { type: 'application/json' }));
    a.download = 'golden-league-sim.json'; a.click();
  },
  reset() { if (!confirm('¿Restaurar equipos y temporada por defecto?')) return; GL.S = GL.defaults(); GL.newSeason(); render(); }
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
  const tm = TM(el.closest('.tcard').dataset.t);
  if (f === 'tname') tm.name = el.value;
  else if (f === 'color') tm.color = el.value;
  else {
    const p = tm.players.find(x => x.id === el.closest('.prow').dataset.p);
    if (f === 'pname') p.name = el.value; else if (f === 'skill') { p.skill = +el.value; el.nextElementSibling.textContent = el.value; }
  }
  GL.save();
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.a === 'filter') return A.filter(el);
  if (el.id === 'imp') {
    const r = new FileReader();
    r.onload = () => { try { const s = JSON.parse(r.result); if (!s.teams || !s.settings) throw 0; GL.S = s; GL.save(); render(); toast('Datos importados'); } catch (x) { toast('Archivo no válido'); } };
    r.readAsText(el.files[0]); return;
  }
  const k = el.dataset.set; if (!k) return;
  const s = GL.S.settings, v = parseInt(el.value);
  if (k === 'min' || k === 'max') {
    const mn = k === 'min' ? v : s.min, mx = k === 'max' ? v : s.max;
    if (!(mn >= 1 && mx > mn)) { toast('El mínimo debe ser menor que el máximo'); return render(); }
    s[k] = v; GL.save(); toast('Se aplica a los próximos partidos');
  } else if (k === 'vueltas') struct(() => { s.vueltas = v; });
  else { s.topN = v; GL.save(); if (GL.S.season) { GL.advance(); GL.save(); } toast('Playoffs actualizados'); render(); }
});

document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) A.close(); });

if (!GL.S.season) GL.newSeason();
render();
