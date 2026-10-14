// 使い方: node scripts/make_facts.mjs  → data/facts/<県>.json (解説文の材料。数字はここにあるものだけを使う)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { PREFS } from '../src/lib/prefectures.js';
const load = (k) => { const f = `data/estat/${k}.json`; return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null; };
const KEYS = ['population', 'establishments', 'income', 'leisure'];
const r1 = (x) => Math.round(x * 10) / 10;
const per = {}; // slug -> {id: metric}
for (const p of PREFS) {
  const m = {};
  for (const k of KEYS) {
    const ds = load(k); const a = ds?.areas?.[p.code]; if (!a) continue;
    const items = ds.catOrder.map((c) => ({ c, ...a.items[c] })), all = items.every((i) => i.value != null);
    const add = (id, label, value, unit, kind, year) => { if (value != null) m[id] = { id, label, value, unit, kind, year, dataset: k }; };
    for (const i of items) add(`${k}:${i.c}`, i.name, i.value, i.unit, k === 'income' || k === 'leisure' ? 'value' : 'count', i.timeLabel);
    if ((k === 'establishments' || k === 'population') && all) {
      const tot = items.reduce((s, i) => s + i.value, 0);
      add(`${k}:total`, k === 'population' ? '人口(5歳階級の合計)' : '事業所数(民営・規模別の合計)', tot, '事業所', 'total', items[0].timeLabel);
      for (const i of items) add(`${k}:share:${i.c}`, `${i.name}の割合`, r1((i.value / tot) * 100), '%', 'share', i.timeLabel);
      if (k === 'population') {
        const band = (f) => items.filter((i) => { const n = parseInt((i.name.match(/\d+/) || [''])[0], 10); return Number.isFinite(n) && f(n); }).reduce((s, i) => s + i.value, 0);
        const ok = items.every((i) => /\d/.test(i.name));
        const B = [['young', '15歳未満の割合', (n) => n < 15], ['working', '15〜64歳の割合', (n) => n >= 15 && n < 65], ['elderly', '65歳以上の割合', (n) => n >= 65]].map(([id, lb, f]) => [id, lb, r1((band(f) / tot) * 100)]);
        if (ok && Math.abs(B.reduce((x, y) => x + y[2], 0) - 100) < 0.6) for (const [id, lb, v] of B) add(`population:band:${id}`, lb, v, '%', 'share', items[0].timeLabel);
        else console.warn(`警告 ${p.slug}: 年齢区分の名前から3区分を作れませんでした(スキップ)`);
      }
    }
  }
  per[p.slug] = m;
}
// 47都道府県の中での平均・順位
const ids = new Set(Object.values(per).flatMap((m) => Object.keys(m)));
const stat = {};
for (const id of ids) {
  const arr = PREFS.map((p) => [p.slug, per[p.slug][id]?.value]).filter(([, v]) => v != null);
  const mean = arr.reduce((s, [, v]) => s + v, 0) / arr.length;
  const sorted = [...arr].sort((a, b) => b[1] - a[1]);
  stat[id] = { n: arr.length, mean, rank: Object.fromEntries(sorted.map(([s], i) => [s, i + 1])) };
}
mkdirSync('data/facts', { recursive: true });
for (const p of PREFS) {
  const m = per[p.slug]; if (!Object.keys(m).length) continue;
  const metrics = Object.values(m).map((x) => { const s = stat[x.id]; return { ...x, mean47: r1(s.mean), ratio: s.mean ? Math.round((x.value / s.mean) * 100) / 100 : null, rank: s.rank[p.slug], of: s.n }; });
  const cand = metrics.filter((x) => (x.kind === 'share' || x.kind === 'value') && x.of >= 40 && x.ratio);
  const highlights = cand.sort((a, b) => Math.abs(Math.log(b.ratio)) - Math.abs(Math.log(a.ratio))).slice(0, 3).map((x) => ({ id: x.id, direction: x.ratio >= 1 ? '平均より高い' : '平均より低い' }));
  writeFileSync(`data/facts/${p.slug}.json`, JSON.stringify({ slug: p.slug, name: p.name, note: 'mean47=47都道府県の単純平均(全国値ではない)', highlights, metrics }, null, 1));
}
console.log('facts を作成しました(data/facts/)');
