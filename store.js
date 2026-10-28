/* Golden League Simulador · estado global y persistencia (localStorage) */
const GL = { tab: 'liga', filter: '', sort: 'k', timer: null, spd: 3, skip: null };
const uid = () => Math.random().toString(36).slice(2, 9);
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const COLORS = ['#e0a912', '#e5484d', '#3e9bff', '#30c48d', '#b266ff', '#ff8a3d', '#18c5d8', '#ff5fa2', '#9aa0a6', '#7ed957'];
const NICKS = ['Zeus','Blaze','Nova','Viper','Ghost','Rex','Luna','Hawk','Titan','Echo','Pixel','Raven','Storm','Frost','Dash','Ace','Cobra','Drift','Onyx','Jinx','Kilo','Mamba','Neo','Orion','Panda','Quark','Rogue','Sable','Tango','Umbra','Vex','Wolf','Xeno','Yeti','Zed','Atlas','Bolt','Comet','Dusk','Ember','Fang','Gale','Halo','Iris','Jade','Knox','Lynx','Mako'];

GL.KEY = 'goldenleague_sim_v1';
GL.shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

GL.mkPlayers = names => names.map(n => ({ id: uid(), name: n, skill: rint(50, 90) }));

GL.defaults = () => {
  const base = [['Golden Wolves', COLORS[0]], ['Borrush FC', COLORS[1]], ['Night Hawks', COLORS[2]], ['Iron Vipers', COLORS[3]],
                ['Crimson Tide', COLORS[4]], ['Storm Riders', COLORS[5]], ['Shadow Pact', COLORS[6]], ['Solar Kings', COLORS[7]]];
  const pool = GL.shuffle(NICKS.slice());
  return {
    settings: { min: 150, max: 300, vueltas: 1, topN: 4 },
    teams: base.map(([name, color], i) => ({ id: uid(), name, color, players: GL.mkPlayers(pool.slice(i * 6, i * 6 + 6)) })),
    season: null
  };
};

GL.load = () => {
  try { const s = JSON.parse(localStorage.getItem(GL.KEY)); if (s && s.teams && s.settings) return s; } catch (e) {}
  return GL.defaults();
};
GL.save = () => { try { localStorage.setItem(GL.KEY, JSON.stringify(GL.S)); } catch (e) {} };
GL.S = GL.load();
