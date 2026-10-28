/* Golden League Simulador · motor: partidas todos contra todos, valoraciones, estadísticas y Golden Awards */
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const WEAPONS = ['Arco', 'Rifle', 'Escopeta', 'Francotirador', 'Pistola', 'Ballesta', 'Subfusil'];
const BONUS = [12, 9, 7, 5, 3, 2, 1]; // puntos extra por posición en la partida (1º..7º)

GL.alloc = (total, w) => {
  const sum = w.reduce((a, b) => a + b, 0), o = w.map(() => 0);
  for (let i = 0; i < total; i++) { let r = Math.random() * sum, j = 0; while (j < w.length - 1 && r > w[j]) { r -= w[j]; j++; } o[j]++; }
  return o;
};

// Una partida: todos los Borrushers en la misma arena. Kills totales = muertes totales, dentro de [min,max].
GL.gen = () => {
  const S = GL.S, { min: lo, max: hi } = S.settings, P = S.players, mid = (lo + hi) / 2, sp = (hi - lo) / 2;
  const T = Math.max(lo, Math.min(hi, Math.round(mid + gauss() * sp * .45)));
  const base = P.map(p => Math.pow(p.rating, 1.5)), bs = base.reduce((a, b) => a + b, 0);
  const k = GL.alloc(T, base.map(b => b * (.4 + Math.random() * 1.2)));
  const d = GL.alloc(T, P.map(p => (125 - p.rating) * (.5 + Math.random())));
  const idx = P.map((_, i) => i).sort((a, b) => k[b] - k[a] || d[a] - d[b]);
  const pl = {}, sq = {};
  S.squads.forEach(s => sq[s.id] = { k: 0, d: 0, pts: 0 });
  idx.forEach((i, pos) => {
    const p = P[i], exp = T * base[i] / bs, pts = k[i] + (BONUS[pos] || 0);
    // La valoración sube/baja según el rendimiento frente a lo esperado, con tendencia a la media
    let dr = Math.max(-3, Math.min(3, (k[i] - exp) / Math.sqrt(exp + 1) * .8)) - (p.rating - 70) * .01;
    const r = Math.max(30, Math.min(99, Math.round((p.rating + dr) * 10) / 10));
    pl[p.id] = { n: p.name, s: p.squad, k: k[i], d: d[i], pos: pos + 1, pts, r0: p.rating, r, dr: Math.round((r - p.rating) * 10) / 10 };
    const q = sq[p.squad]; if (q) { q.k += k[i]; q.d += d[i]; q.pts += pts; }
  });
  // Eventos para la partida en vivo (cada kill = una muerte de otro jugador)
  const ks = [], vs = [];
  P.forEach((p, i) => { for (let j = 0; j < k[i]; j++) ks.push(p.id); for (let j = 0; j < d[i]; j++) vs.push(p.id); });
  GL.shuffle(vs);
  for (let i = 0; i < ks.length; i++) if (ks[i] === vs[i]) for (let t = 0; t < 10; t++) { const j = rint(0, vs.length - 1); if (vs[j] !== ks[i] && ks[j] !== vs[i]) { [vs[i], vs[j]] = [vs[j], vs[i]]; break; } }
  const ev = GL.shuffle(ks.map((kid, i) => ({ k: kid, v: vs[i], w: WEAPONS[rint(0, WEAPONS.length - 1)] })));
  const ws = Object.keys(sq).sort((a, b) => sq[b].pts - sq[a].pts)[0];
  return { tk: T, pl, sq, w: P[idx[0]].id, ws, ev };
};

GL.commit = (m, res) => {
  m.res = res;
  Object.entries(res.pl).forEach(([id, r]) => { const p = GL.S.players.find(x => x.id === id); if (p) p.rating = r.r; });
  GL.advance();
};
GL.quick = m => { if (GL.S.players.length < 2) return false; const r = GL.gen(); delete r.ev; GL.commit(m, r); return true; };
GL.next = () => { const se = GL.S.season; return se ? se.matches.find(m => !m.res) : null; };

GL.newSeason = () => {
  const S = GL.S; if (S.players.length < 2) { S.season = null; GL.save(); return; }
  S.players.forEach(p => p.r0 = p.rating);
  S.season = { num: S.history.length + 1, done: false, matches: Array.from({ length: S.settings.partidas }, (_, i) => ({ id: 'm' + i, n: i + 1, res: null })) };
  GL.save();
};

GL.advance = () => {
  const se = GL.S.season; if (!se || se.done || !se.matches.every(m => m.res)) return;
  se.done = true;
  const aw = GL.awards(), gb = aw.find(a => a.name === 'Golden Borrusher'), gs = aw.find(a => a.name === 'Golden Borrusquad');
  GL.S.history.push({ n: se.num, bor: gb ? gb.n : '-', bs: gb ? gb.s : null, sq: gs ? gs.id : null });
};

// ---------- Estadísticas ----------
GL.pstats = () => {
  const m = {}, se = GL.S.season;
  GL.S.players.forEach(p => m[p.id] = { id: p.id, n: p.name, s: p.squad, rating: p.rating, r0: p.r0, pj: 0, k: 0, d: 0, pts: 0, w: 0, best: 0, hist: [] });
  (se ? se.matches : []).filter(x => x.res).forEach(x => Object.entries(x.res.pl).forEach(([id, r]) => {
    const e = m[id]; if (!e) return; e.pj++; e.k += r.k; e.d += r.d; e.pts += r.pts; if (r.pos === 1) e.w++; e.best = Math.max(e.best, r.k); e.hist.push({ n: x.n, ...r });
  }));
  return Object.values(m);
};

GL.sstats = () => {
  const m = {}, se = GL.S.season;
  GL.S.squads.forEach(s => m[s.id] = { s: s.id, mem: GL.S.players.filter(p => p.squad === s.id).length, pj: 0, k: 0, d: 0, pts: 0, w: 0 });
  (se ? se.matches : []).filter(x => x.res).forEach(x => {
    const best = x.res.ws;
    Object.entries(x.res.sq).forEach(([id, r]) => { const e = m[id]; if (!e) return; e.pj++; e.k += r.k; e.d += r.d; e.pts += r.pts; if (id === best) e.w++; });
  });
  return Object.values(m);
};

// ---------- Golden Awards ----------
GL.awards = () => {
  const ps = GL.pstats().filter(p => p.pj), ss = GL.sstats().filter(s => s.pj); if (!ps.length) return [];
  const top = (a, f) => a.slice().sort((x, y) => f(y) - f(x))[0];
  const P = (ic, name, p, val) => ({ ic, name, t: 'p', id: p.id, n: p.n, s: p.s, val });
  const S = (ic, name, s, val) => ({ ic, name, t: 's', id: s.s, val });
  const kd = p => p.d ? p.k / p.d : p.k;
  let a, b;
  const out = [];
  a = top(ps, p => p.pts + p.k * 1e-3); out.push(P('⭐', 'Golden Borrusher', a, a.pts + ' pts'));
  b = top(ss, s => s.pts + s.k * 1e-3); out.push(S('🛡️', 'Golden Borrusquad', b, b.pts + ' pts'));
  a = top(ps, p => p.k); out.push(P('🎯', 'Máximo Asesino', a, a.k + ' kills'));
  a = top(ps, kd); out.push(P('🔫', 'Francotirador', a, 'K/D ' + kd(a).toFixed(2)));
  a = top(ps, p => -p.d); out.push(P('🧱', 'Inmortal', a, a.d + ' muertes'));
  a = top(ps, p => p.best); out.push(P('💥', 'Mejor Partida', a, a.best + ' kills en una partida'));
  a = top(ps, p => p.rating - p.r0); out.push(P('📈', 'Revelación', a, (a.rating - a.r0 >= 0 ? '+' : '') + (a.rating - a.r0).toFixed(1) + ' valoración'));
  a = top(ps, p => p.rating); out.push(P('💎', 'Mejor Valorado', a, a.rating.toFixed(1) + ' de valoración'));
  a = top(ps, p => p.w * 1000 + p.pts); out.push(P('👑', 'Rey de Partidas', a, a.w + ' victorias'));
  b = top(ss, s => s.k); out.push(S('⚔️', 'Borrusquad Letal', b, b.k + ' kills'));
  return out;
};
