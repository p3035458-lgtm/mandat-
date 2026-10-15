// Створює tests/golden.tsv — еталонні значення, пораховані ОРИГІНАЛЬНИМ JS-кодом.
// C++-тест (tests/core_tests.cpp) звіряє з ними свої результати.
//
//   node tests/make_golden.mjs <шлях до mandate-react> > tests/golden.tsv
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2]);
await import(pathToFileURL(path.join(root, 'test/dom-stub.mjs')).href);

// Тимчасова копія game.js з додатковим експортом внутрішніх функцій
const srcDir = path.join(root, 'src');
const tmp = path.join(srcDir, '__golden_game.mjs');
fs.writeFileSync(tmp, fs.readFileSync(path.join(srcDir, 'game.js'), 'utf8') +
  '\nexport {newGame,shares,appeal,national,evProjection,topIssues,money,f1,pct,num,sgn,plural,dstr,hashStr,seeded,surname,initials,regenNoise};\n');
let G;
try { G = await import(pathToFileURL(tmp).href); } finally { fs.unlinkSync(tmp); }

const out = [];
const row = (...a) => out.push(a.join('\t'));
const nums = a => a.map(x => (x === null ? 'null' : String(x))).join(' ');

// ---------- форматування ----------
for (const v of [0, 0.04, 0.05, 0.25, 1.05, 2.345, 12.96, 99.95, 100, -0.04, -0.05, -1.25, -12.34, 1234.56])
  row('f1', v, G.f1(v));
for (const v of [0, 0.5, 4.04, 57.25, 100]) row('pct', v, G.pct(v));
for (const v of [0, 1, 12, 999, 1000, 1234, 12345, 123456, 1234567, 999999.4, 999999.5, 2500000000])
  row('num', v, G.num(v));
for (const v of [0, 0.049, 0.05, 1.234, -0.049, -0.05, -3.21, 15]) row('sgn', v, G.sgn(v));
for (const v of [0, 5, 999, 1000, 1500, 999499, 999500, 1e6, 1.5e6, 2.04e6, 9.99e8, 1e9, 1.234e9, -5, -2500, -3.3e6, -4e9, 180e3, 744e9])
  row('money', v, G.money(v));
for (const n of [0, 1, 2, 4, 5, 11, 12, 14, 19, 21, 22, 25, 101, 111, 112, 121, 1.4, 1.6, -3])
  row('plural', n, G.plural(n, 'неделя', 'недели', 'недель'));
const D = Date.UTC;
for (const ms of [D(2028, 10, 7), D(2032, 10, 2), D(2028, 0, 1), D(2028, 1, 29), D(2028, 11, 31), D(2000, 2, 1), D(1999, 11, 31) + 12345678])
  row('dstr', ms, G.dstr(ms));
for (const s of ['', 'a', 'Илья Руденко', 'Дэниел Картер', 'Ольга Миллер', 'north', 'r_north', 'Марк Уилсон 123'])
  row('hash', s, G.hashStr(s));
for (const s of ['seed1', 'Анна Белова', 'r_north:0']) {
  const r = G.seeded(s); const a = []; for (let i = 0; i < 8; i++) a.push(r());
  row('seeded', s, nums(a));
}
for (const s of ['Илья Руденко', 'Анна', '  Мария   Ивановна Петрова ', 'Иван'])
  row('surname', JSON.stringify(s), G.surname(s));
for (const s of ['Илья Руденко', 'Анна', 'Мария Ивановна Петрова'])
  row('initials', JSON.stringify(s), G.initials(s));

// ---------- виборча модель ----------
const bios = ['biz', 'gov', 'jour', 'mil', 'doc'];
const getS = G.getS;   // той самий екземпляр модуля, що й newGame/shares

for (const bio of bios) for (const age of [34, 48, 65]) for (const days of [182, 365]) for (const scen of [0, 1]) {
  G.newGame({ name: 'Илья Руденко', party: 'Новый курс', bio, days, age, look: 0 });
  const s = getS();
  if (scen === 1) {
    s.econ.unemp = 8.2; s.econ.infl = 9.1; s.econ.energy = 150;
    s.flags.secBoost = 0.3; s.flags.healthBoost = 0.15;
    s.regions.forEach((r, i) => { r.effort.player = i * 0.7; r.effort.carter = 5 - i * 0.4; r.und = i % 3; });
    s.c.carter.trust = 40; s.c.miller.rec = 70; s.c.player.leanMod = 1.5;
    s.c.wilson.out = true;
    s.camp.left = Math.floor(days / 3);
  }
  const tag = `${bio}/${age}/${days}/${scen}`;
  const P = s.c.player;
  row('player', tag, nums([P.cha, P.comp, P.trust, P.rec, s.budget]));
  s.regions.forEach((_, i) => row('shares', tag + '/' + i, nums(['player', 'carter', 'miller', 'wilson', 'und'].map(k => G.shares(i)[k]))));
  const nat = G.national(false);
  row('national', tag, nums(['player', 'carter', 'miller', 'wilson', 'und'].map(k => nat[k])));
  const ev = G.evProjection(false);
  row('ev', tag, nums(['player', 'carter', 'miller', 'wilson'].map(k => ev[k])));
  row('top', tag, G.topIssues(7).join(' '));
  row('debates', tag, s.camp.debates.map(d => d.at).join(' '));
}
process.stdout.write(out.join('\n') + '\n');
