/* Golden League Simulador v3 · motor: competiciones, partidas, valoraciones, palmarés y Golden Awards */
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const WEAPONS = ['Arco', 'Rifle', 'Escopeta', 'Francotirador', 'Pistola', 'Ballesta', 'Subfusil'];
const r2 = n => Math.round(n * 100) / 100;

GL.comp = id => GL.S.comps.find(c => c.id === id);
GL.natOf = pid => GL.S.nations.find(n => n.roster.includes(pid));
GL.rk = r => r.c + '|' + r.t;

// Una "run" = una competición en una temporada
GL.getRun = (c, t) => {
  const S = GL.S, k = c + '|' + t, cp = GL.comp(c);
  if (!S.runs[k]) S.runs[k] = {
    c, t, done: false,
    part: cp.kind === 'nacion' ? S.nations.filter(n => n.roster.length).map(n => n.id) : (cp.src ? [] : S.players.map(p => p.id)),
    matches: Array.from({ length: cp.partidas }, (_, i) => ({ id: 'm' + i, n: i + 1, res: null }))
  };
  return S.runs[k];
};
GL.runsSel = () => {
  const { c, t } = GL.cur, S = GL.S;
  if (c !== 'all' && t !== 'all' && GL.comp(c)) return [GL.getRun(c, t)];
  return Object.values(S.runs).filter(r => GL.comp(r.c) && (c === 'all' || r.c === c) && (t === 'all' || r.t == t));
};
GL.entrants = run => {
  const S = GL.S, cp = GL.comp(run.c);
  return cp.kind === 'nacion' ? S.players.filter(p => S.nations.some(n => run.part.includes(n.id) && n.roster.includes(p.id))) : S.players.filter(p => run.part.includes(p.id));
};
GL.next = run => run.matches.find(m => !m.res);

GL.alloc = (total, w) => {
  const sum = w.reduce((a, b) => a + b, 0), o = w.map(() => 0);
  for (let i = 0; i < total; i++) { let r = Math.random() * sum, j = 0; while (j < w.length - 1 && r > w[j]) { r -= w[j]; j++; } o[j]++; }
  return o;
};

// Una partida: todos los participantes en la arena. Kills totales = muertes totales, dentro de [min,max].
GL.gen = run => {
  const S = GL.S, cp = GL.comp(run.c), P = GL.entrants(run); if (P.length < 2) return null;
  const { min: lo, max: hi } = S.settings, mid = (lo + hi) / 2, sp = (hi - lo) / 2;
  const T = Math.max(lo, Math.min(hi, Math.round(mid + gauss() * sp * .45)));
  const base = P.map(p => Math.pow(p.rating, 1.5)), bs = base.reduce((a, b) => a + b, 0);
  const k = GL.alloc(T, base.map(b => b * (.4 + Math.random() * 1.2)));
  const d = P.length === 2 ? [k[1], k[0]] : GL.alloc(T, P.map(p => (125 - p.rating) * (.5 + Math.random())));
  const idx = P.map((_, i) => i).sort((a, b) => k[b] - k[a] || d[a] - d[b]);
  const pl = {}, sq = {}, nt = {}, isN = cp.kind === 'nacion';
  idx.forEach((i, pos) => {
    const p = P[i], exp = T * base[i] / bs, pts = r2((cp.pts[pos] || 0) + (cp.pk || 0) * k[i]), nat = isN ? GL.natOf(p.id) : null;
    const dr = Math.max(-3, Math.min(3, (k[i] - exp) / Math.sqrt(exp + 1) * .8)) - (p.rating - 70) * .01;
    const r = Math.max(30, Math.min(99, Math.round((p.rating + dr) * 10) / 10));
    pl[p.id] = { n: p.name, s: p.squad, nt: nat ? nat.id : null, k: k[i], d: d[i], pos: pos + 1, pts, r0: p.rating, r, dr: Math.round((r - p.rating) * 10) / 10 };
    const add = (o, id) => { const q = o[id] || (o[id] = { k: 0, d: 0, pts: 0 }); q.k += k[i]; q.d += d[i]; q.pts = r2(q.pts + pts); };
    add(sq, p.squad); if (nat) add(nt, nat.id);
  });
  const ks = [], vs = [];
  P.forEach((p, i) => { for (let j = 0; j < k[i]; j++) ks.push(p.id); for (let j = 0; j < d[i]; j++) vs.push(p.id); });
  GL.shuffle(vs);
  for (let i = 0; i < ks.length; i++) if (ks[i] === vs[i]) for (let t = 0; t < 12; t++) { const j = rint(0, vs.length - 1); if (vs[j] !== ks[i] && ks[j] !== vs[i]) { [vs[i], vs[j]] = [vs[j], vs[i]]; break; } }
  const ev = GL.shuffle(ks.map((kid, i) => ({ k: kid, v: vs[i], w: WEAPONS[rint(0, WEAPONS.length - 1)] })));
  const ent = isN ? nt : sq, ws = Object.keys(ent).sort((a, b) => ent[b].pts - ent[a].pts)[0];
  const res = { tk: T, pl, sq, w: P[idx[0]].id, ws, ev };
  if (isN) res.nt = nt;
  return res;
};

GL.commit = (run, m, res) => {
  m.res = res;
  Object.entries(res.pl).forEach(([id, r]) => { const p = GL.S.players.find(x => x.id === id); if (p) p.rating = r.r; });
  GL.advance(run);
};
GL.quick = (run, m) => { const r = GL.gen(run); if (!r) return false; delete r.ev; GL.commit(run, m, r); return true; };
GL.advance = run => { if (!run.done && run.matches.every(m => m.res)) { run.done = true; GL.finish(run); } };

// ---------- Estadísticas ----------
GL.cmp = cp => { const tb = cp && cp.tb || 'kills'; return (a, b) => b.pts - a.pts || (tb === 'vic' ? b.vic - a.vic : tb === 'kd' ? b.kd - a.kd : b.k - a.k) || b.k - a.k || a.n.localeCompare(b.n); };
GL.cmpE = (a, b) => b.pts - a.pts || b.k - a.k;

GL.pstats = (runs = GL.runsSel()) => {
  const S = GL.S, m = {};
  const ent = p => m[p.id] || (m[p.id] = { id: p.id, n: p.name, sid: p.squad, rating: p.rating, pj: 0, k: 0, d: 0, pts: 0, vic: 0, pod: 0, best: 0, dr: 0, hist: [] });
  runs.forEach(r => {
    if (runs.length === 1) GL.entrants(r).forEach(ent);
    r.matches.filter(x => x.res).forEach(x => Object.entries(x.res.pl).forEach(([id, q]) => {
      const p = S.players.find(z => z.id === id); if (!p) return;
      const e = ent(p); e.pj++; e.k += q.k; e.d += q.d; e.pts = r2(e.pts + q.pts); if (q.pos === 1) e.vic++; if (q.pos <= 3) e.pod++;
      e.best = Math.max(e.best, q.k); e.dr += q.dr; e.hist.push({ c: r.c, t: r.t, mn: x.n, ...q });
    }));
  });
  return Object.values(m).map(e => ({ ...e, kd: e.d ? e.k / e.d : e.k, dr: Math.round(e.dr * 10) / 10 }));
};

// key: 'sq' (Borrusquads) o 'nt' (Borrunations)
GL.estats = (runs = GL.runsSel(), key = 'sq') => {
  const S = GL.S, m = {}, list = key === 'sq' ? S.squads : S.nations;
  const mem = e => key === 'sq' ? S.players.filter(p => p.squad === e.id) : S.players.filter(p => e.roster.includes(p.id));
  list.forEach(e => m[e.id] = { id: e.id, n: e.name, pj: 0, k: 0, d: 0, pts: 0, vic: 0, mem: mem(e) });
  runs.forEach(r => r.matches.filter(x => x.res && x.res[key]).forEach(x => {
    let best = null;
    Object.entries(x.res[key]).forEach(([id, q]) => { const e = m[id]; if (!e) return; e.pj++; e.k += q.k; e.d += q.d; e.pts = r2(e.pts + q.pts); if (!best || q.pts > best[1]) best = [id, q.pts]; });
    if (best) m[best[0]].vic++;
  }));
  return Object.values(m).map(e => ({ ...e, kd: e.d ? e.k / e.d : e.k, val: e.mem.length ? e.mem.reduce((a, p) => a + p.rating, 0) / e.mem.length : 0 }));
};

// Clasificados de una run según la regla {de, n, modo:'jug'|'sq'}
GL.qualified = (run, src) => {
  const cp = GL.comp(run.c);
  if (src.modo === 'sq') {
    const ids = GL.estats([run], 'sq').filter(s => s.pj).sort(GL.cmpE).slice(0, src.n).map(s => s.id);
    return GL.S.players.filter(p => ids.includes(p.squad)).map(p => p.id);
  }
  return GL.pstats([run]).filter(p => p.pj).sort(GL.cmp(cp)).slice(0, src.n).map(p => p.id);
};

// ---------- Golden Awards ----------
GL.awards = (runs = GL.runsSel()) => {
  const ps = GL.pstats(runs).filter(p => p.pj); if (!ps.length) return [];
  const ss = GL.estats(runs, 'sq').filter(s => s.pj), ns = GL.estats(runs, 'nt').filter(s => s.pj);
  const top = (a, f) => a.slice().sort((x, y) => f(y) - f(x))[0];
  const P = (ic, name, p, val) => ({ ic, name, t: 'p', id: p.id, n: p.n, sid: p.sid, val });
  const E = (ic, name, t, e, val) => ({ ic, name, t, id: e.id, n: e.n, val });
  const o = []; let a;
  a = top(ps, p => p.pts + p.k * 1e-3); o.push(P('⭐', 'Golden Borrusher', a, r2(a.pts) + ' pts'));
  if (ss.length) { a = top(ss, s => s.pts + s.k * 1e-3); o.push(E('🛡️', 'Golden Borrusquad', 's', a, r2(a.pts) + ' pts')); }
  if (ns.length) { a = top(ns, s => s.pts + s.k * 1e-3); o.push(E('🌍', 'Golden Borrunation', 'n', a, r2(a.pts) + ' pts')); }
  a = top(ps, p => p.k); o.push(P('🎯', 'Máximo Asesino', a, a.k + ' kills'));
  a = top(ps, p => p.kd); o.push(P('🔫', 'Francotirador', a, 'K/D ' + a.kd.toFixed(2)));
  a = top(ps, p => -p.d); o.push(P('🧱', 'Inmortal', a, a.d + ' muertes'));
  a = top(ps, p => p.best); o.push(P('💥', 'Mejor Partida', a, a.best + ' kills en una partida'));
  a = top(ps, p => p.dr); o.push(P('📈', 'Revelación', a, (a.dr >= 0 ? '+' : '') + a.dr.toFixed(1) + ' valoración'));
  a = top(ps, p => p.rating); o.push(P('💎', 'Mejor Valorado', a, a.rating.toFixed(1) + ' de valoración'));
  a = top(ps, p => p.vic * 1000 + p.pts); o.push(P('👑', 'Rey de Partidas', a, a.vic + ' victorias'));
  if (ss.length) { a = top(ss, s => s.k); o.push(E('⚔️', 'Borrusquad Letal', 's', a, a.k + ' kills')); }
  return o;
};
GL.awWho = a => a.t === 'p' ? `${a.n} (${(GL.S.squads.find(s => s.id === a.sid) || { name: '?' }).name})` : a.n;

// ---------- Cierre de competición: palmarés + clasificados a otras competiciones ----------
GL.finish = run => {
  const S = GL.S, cp = GL.comp(run.c), runs = [run], ps = GL.pstats(runs).filter(p => p.pj).sort(GL.cmp(cp));
  const nm = i => ps[i] ? ps[i].n : '', e = { t: run.t, c: run.c, campeon: nm(0), sub: nm(1), tercero: nm(2) };
  const mv = ps.slice().sort((a, b) => b.vic - a.vic || b.pts - a.pts)[0], kl = ps.slice().sort((a, b) => b.k - a.k)[0];
  e.mvp = mv ? mv.n : ''; e.killer = kl ? kl.n : ''; e.kk = kl ? kl.k : 0;
  const ent = (key, f) => { const l = GL.estats(runs, key).filter(x => x.pj).sort(GL.cmpE); e[f[0]] = l[0] ? l[0].n : ''; e[f[1]] = l[1] ? l[1].n : ''; e[f[2]] = l[2] ? l[2].n : ''; };
  if (cp.kind === 'nacion') ent('nt', ['nC', 'nS', 'nT']); else if (cp.equipos !== false) ent('sq', ['eqC', 'eqS', 'eqT']);
  e.aw = GL.awards(runs).map(a => ({ ic: a.ic, name: a.name, who: GL.awWho(a), val: a.val }));
  S.palmares = S.palmares.filter(x => !(x.t === run.t && x.c === run.c)); S.palmares.push(e);
  S.comps.filter(c => c.src && c.src.de === run.c).forEach(c => { const r = GL.getRun(c.id, run.t); if (!r.matches.some(m => m.res)) r.part = GL.qualified(run, c.src); });
};

GL.newSeason = () => { GL.S.temp++; GL.cur.t = GL.S.temp; GL.save(); };
