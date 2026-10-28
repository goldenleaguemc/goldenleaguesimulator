/* Golden League Simulador · motor de partidas, temporada, clasificación y playoffs */
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const WEAPONS = ['Arco', 'Rifle', 'Escopeta', 'Francotirador', 'Pistola', 'Ballesta', 'Subfusil'];

GL.rating = t => t.players.reduce((s, p) => s + p.skill, 0) / t.players.length;

// Reparte `total` unidades enteras entre elementos según pesos (con azar)
GL.alloc = (total, w) => {
  const sum = w.reduce((a, b) => a + b, 0), o = w.map(() => 0);
  for (let i = 0; i < total; i++) { let r = Math.random() * sum, j = 0; while (j < w.length - 1 && r > w[j]) { r -= w[j]; j++; } o[j]++; }
  return o;
};

// Genera un partido: kills totales de cada equipo dentro de [min,max]; muertes de uno = kills del rival
GL.gen = (A, B) => {
  const { min: lo, max: hi } = GL.S.settings, mid = (lo + hi) / 2, sp = (hi - lo) / 2;
  const ra = GL.rating(A), rb = GL.rating(B), pa = ra * ra / (ra * ra + rb * rb);
  const cl = v => Math.max(lo, Math.min(hi, Math.round(v)));
  let ka = cl(mid + (pa - .5) * sp * 1.2 + gauss() * sp * .22);
  let kb = cl(mid + (.5 - pa) * sp * 1.2 + gauss() * sp * .22);
  if (ka === kb) { if (Math.random() < pa && ka < hi) ka++; else if (kb < hi) kb++; else ka--; }
  const wk = t => t.players.map(p => Math.pow(p.skill, 1.8) * (.6 + Math.random() * .8));
  const wd = t => t.players.map(p => (115 - p.skill) * (.5 + Math.random()));
  const kA = GL.alloc(ka, wk(A)), kB = GL.alloc(kb, wk(B)), dA = GL.alloc(kb, wd(A)), dB = GL.alloc(ka, wd(B));
  const pl = {};
  const mk = (t, k, d) => t.players.forEach((p, i) => { pl[p.id] = { n: p.name, t: t.id, k: k[i], d: d[i] }; });
  mk(A, kA, dA); mk(B, kB, dB);
  const list = (t, arr) => arr.flatMap((n, i) => Array(n).fill(t.players[i].id));
  const evs = (T, kArr, VT, dArr) => { const ks = list(T, kArr), vs = GL.shuffle(list(VT, dArr)); return ks.map((k, i) => ({ k, v: vs[i], t: T.id, w: WEAPONS[rint(0, WEAPONS.length - 1)] })); };
  const ev = GL.shuffle([...evs(A, kA, B, dB), ...evs(B, kB, A, dA)]);
  return { ka, kb, w: ka > kb ? A.id : B.id, pl, ev };
};

// ---------- Temporada ----------
GL.newSeason = () => {
  const S = GL.S;
  if (S.teams.length < 2) { S.season = null; GL.save(); return; }
  const ts = S.teams.map(t => t.id); if (ts.length % 2) ts.push(null);
  const n = ts.length, rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const rr = [];
    for (let i = 0; i < n / 2; i++) { const a = ts[i], b = ts[n - 1 - i]; if (a && b) rr.push(r % 2 ? [b, a] : [a, b]); }
    rounds.push(rr); ts.splice(1, 0, ts.pop());
  }
  const all = [...rounds];
  if (S.settings.vueltas === 2) rounds.forEach(rr => all.push(rr.map(([a, b]) => [b, a])));
  let c = 0; const matches = [];
  all.forEach((rr, ri) => rr.forEach(([a, b]) => matches.push({ id: 'm' + (c++), a, b, phase: 'liga', round: ri, res: null })));
  S.season = { matches, phase: 'liga', champion: null, seq: c };
  GL.save();
};

GL.poSize = () => { let n = GL.S.settings.topN; const max = GL.S.teams.length; while (n > max || (n & (n - 1))) n--; return n >= 2 ? n : 0; };
GL.next = () => { const se = GL.S.season; return se ? se.matches.find(m => !m.res) : null; };

GL.advance = () => {
  const S = GL.S, se = S.season; if (!se) return;
  if (se.phase === 'listo' && !GL.poSize()) { se.phase = 'fin'; se.champion = GL.standings()[0].t.id; }
  else if (se.phase === 'liga' && se.matches.every(m => m.res)) {
    if (GL.poSize()) se.phase = 'listo'; else { se.phase = 'fin'; se.champion = GL.standings()[0].t.id; }
  } else if (se.phase === 'po') {
    const po = se.matches.filter(m => m.phase === 'po'), r = Math.max(...po.map(m => m.round)), cur = po.filter(m => m.round === r);
    if (cur.every(m => m.res)) {
      if (cur.length === 1) { se.phase = 'fin'; se.champion = cur[0].res.w; }
      else for (let i = 0; i < cur.length; i += 2) se.matches.push({ id: 'm' + (se.seq++), a: cur[i].res.w, b: cur[i + 1].res.w, phase: 'po', round: r + 1, res: null });
    }
  }
};

GL.startPO = () => {
  const se = GL.S.season, n = GL.poSize(), seeds = GL.standings().slice(0, n).map(x => x.t.id);
  let o = [1]; while (o.length < n) { const m = o.length * 2 + 1; o = o.flatMap(x => [x, m - x]); }
  for (let i = 0; i < n; i += 2) se.matches.push({ id: 'm' + (se.seq++), a: seeds[o[i] - 1], b: seeds[o[i + 1] - 1], phase: 'po', round: 0, res: null });
  se.phase = 'po'; GL.save();
};

// Simula un partido al instante (sin animación)
GL.quick = m => {
  const A = GL.S.teams.find(t => t.id === m.a), B = GL.S.teams.find(t => t.id === m.b);
  if (!A || !B || !A.players.length || !B.players.length) return false;
  const r = GL.gen(A, B); delete r.ev; m.res = r; GL.advance(); return true;
};

// ---------- Estadísticas ----------
GL.standings = () => {
  const m = {}; GL.S.teams.forEach(t => m[t.id] = { t, pj: 0, g: 0, p: 0, k: 0, d: 0, pts: 0 });
  (GL.S.season ? GL.S.season.matches : []).filter(x => x.phase === 'liga' && x.res).forEach(x => {
    const r = x.res;
    [[x.a, r.ka, r.kb], [x.b, r.kb, r.ka]].forEach(([id, k, d]) => {
      const e = m[id]; if (!e) return; e.pj++; e.k += k; e.d += d;
      if (r.w === id) { e.g++; e.pts += 3; } else e.p++;
    });
  });
  return Object.values(m).sort((a, b) => b.pts - a.pts || (b.k - b.d) - (a.k - a.d) || b.k - a.k);
};

GL.players = () => {
  const m = {};
  (GL.S.season ? GL.S.season.matches : []).filter(x => x.res).forEach(x => Object.entries(x.res.pl).forEach(([id, p]) => {
    const e = m[id] || (m[id] = { id, n: p.n, t: p.t, pj: 0, k: 0, d: 0 });
    e.pj++; e.k += p.k; e.d += p.d; e.n = p.n; e.t = p.t;
  }));
  return Object.values(m);
};
