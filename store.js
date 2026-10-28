/* Golden League Simulador · estado global y persistencia (localStorage) */
const GL = { tab: 'inicio', sort: 'pts', filter: '', timer: null, spd: 3, skip: null };
const uid = () => Math.random().toString(36).slice(2, 9);
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const COLORS = ['#e0a912', '#e5484d', '#3e9bff', '#30c48d', '#b266ff', '#ff8a3d', '#18c5d8', '#ff5fa2', '#9aa0a6', '#7ed957'];
const NICKS = ['Zeus','Blaze','Nova','Viper','Ghost','Rex','Luna','Hawk','Titan','Echo','Pixel','Raven','Storm','Frost','Dash','Ace','Cobra','Drift','Onyx','Jinx','Kilo','Mamba','Neo','Orion','Panda','Quark','Rogue','Sable','Tango','Umbra','Vex','Wolf','Xeno','Yeti','Zed','Atlas','Bolt','Comet','Dusk','Ember','Fang','Gale','Halo','Iris','Jade','Knox','Lynx','Mako'];

GL.KEY = 'goldenleague_sim_v2';
GL.shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
GL.mkPlayer = (name, squad, rating) => { const r = rating || rint(55, 92); return { id: uid(), name, squad, rating: r, r0: r }; };

// Borrusquads = equipos · Borrushers = jugadores individuales
GL.defaults = () => {
  const names = ['Golden Wolves', 'Night Hawks', 'Iron Vipers', 'Crimson Tide', 'Storm Riders', 'Shadow Pact'];
  const pool = GL.shuffle(NICKS.slice());
  const squads = names.map((name, i) => ({ id: uid(), name, color: COLORS[i] }));
  const players = [];
  squads.forEach((s, i) => pool.slice(i * 4, i * 4 + 4).forEach(n => players.push(GL.mkPlayer(n, s.id))));
  return { settings: { min: 150, max: 300, partidas: 10 }, squads, players, season: null, history: [] };
};

GL.load = () => {
  try { const s = JSON.parse(localStorage.getItem(GL.KEY)); if (s && s.squads && s.players && s.settings) return s; } catch (e) {}
  return GL.defaults();
};
GL.save = () => { try { localStorage.setItem(GL.KEY, JSON.stringify(GL.S)); } catch (e) {} };
GL.S = GL.load();
