/* Golden League Simulador v3 · estado global y persistencia (localStorage) */
const GL = { cur: { c: 'GL', t: 1 }, tab: 'clas', sort: 'pts', filter: '', timer: null, spd: 3, skip: null };
const uid = () => Math.random().toString(36).slice(2, 9);
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const COLORS = ['#e0a912', '#e5484d', '#3e9bff', '#30c48d', '#b266ff', '#ff8a3d', '#18c5d8', '#ff5fa2', '#9aa0a6', '#7ed957'];
const NICKS = ['Zeus','Blaze','Nova','Viper','Ghost','Rex','Luna','Hawk','Titan','Echo','Pixel','Raven','Storm','Frost','Dash','Ace','Cobra','Drift','Onyx','Jinx','Kilo','Mamba','Neo','Orion','Panda','Quark','Rogue','Sable','Tango','Umbra','Vex','Wolf','Xeno','Yeti','Zed','Atlas','Bolt','Comet','Dusk','Ember','Fang','Gale','Halo','Iris','Jade','Knox','Lynx','Mako'];

GL.KEY = 'goldenleague_sim_v3';
GL.shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
GL.mkPlayer = (name, squad, rating) => ({ id: uid(), name, squad, rating: rating || rint(55, 92) });

// Competiciones: 'liga' (Borrushers + Borrusquads) o 'nacion' (torneo de Borrunations)
GL.defComps = () => [
  { id: 'GL', name: 'Golden League', icon: '⭐', kind: 'liga', pts: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1], pk: 0.1, tb: 'kills', partidas: 10, equipos: true, src: null },
  { id: 'GC', name: 'Golden Champions', icon: '🏆', kind: 'liga', pts: [20, 16, 13, 10, 8, 6, 5, 4, 3, 2, 1], pk: 0.2, tb: 'kills', partidas: 6, equipos: true, src: { de: 'GL', n: 8, modo: 'jug' } },
  { id: 'BN', name: 'Copa Borrunations', icon: '🌍', kind: 'nacion', pts: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1], pk: 0.1, tb: 'kills', partidas: 5, equipos: false, src: null }
];
GL.NATS = [['Hispania', 'HIS', '#e5484d'], ['Galia', 'GAL', '#3e9bff'], ['Nórdica', 'NOR', '#30c48d'], ['Atlántida', 'ATL', '#b266ff']];

GL.defaults = () => {
  const names = ['Golden Wolves', 'Night Hawks', 'Iron Vipers', 'Crimson Tide', 'Storm Riders', 'Shadow Pact', 'Solar Kings', 'Frost Giants'];
  const pool = GL.shuffle(NICKS.slice());
  const squads = names.map((name, i) => ({ id: uid(), name, color: COLORS[i % COLORS.length] }));
  const players = [];
  squads.forEach((s, i) => [0, 1].forEach(j => players.push(GL.mkPlayer(pool[i * 2 + j], s.id))));
  const ids = GL.shuffle(players.map(p => p.id));
  const nations = GL.NATS.map(([name, code, color], i) => ({ id: uid(), name, code, color, roster: ids.slice(i * 3, i * 3 + 3) }));
  return { settings: { min: 150, max: 300, perSquad: 2 }, squads, players, nations, comps: GL.defComps(), temp: 1, runs: {}, palmares: [] };
};

GL.load = () => {
  try { const s = JSON.parse(localStorage.getItem(GL.KEY)); if (s && s.squads && s.players && s.nations && s.comps && s.runs) return s; } catch (e) {}
  return GL.defaults();
};
GL.save = () => { try { localStorage.setItem(GL.KEY, JSON.stringify(GL.S)); } catch (e) {} };
GL.S = GL.load();
GL.cur = { c: GL.S.comps[0] ? GL.S.comps[0].id : 'GL', t: GL.S.temp };
