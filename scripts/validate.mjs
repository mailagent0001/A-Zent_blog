// 使い方: node scripts/validate.mjs  (data/estat/*.json を検算し、data/pages.json を作る)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { DATASETS } from './estat-config.mjs';
import { PREFS } from '../src/lib/prefectures.js';
const EXPECT = { population: /歳/, establishments: /事業所/, income: /(収入|所得|円|給与|賃金|消費|貯蓄)/, leisure: /(時間|行動者|趣味|スポーツ|旅行|学習|ボランティア)/, okinawa_municipal_age: /(15歳|65歳|人口)/ };
const errors = [], warns = [], data = {};
const appId = process.env.ESTAT_APP_ID;
for (const ds of DATASETS) {
  const f = `data/estat/${ds.key}.json`;
  if (!existsSync(f)) { warns.push(`${ds.key}: ファイルなし(未取得)`); continue; }
  const raw = readFileSync(f, 'utf8');
  if (appId && raw.includes(appId)) errors.push(`${ds.key}: appId がファイルに含まれています!`);
  const d = JSON.parse(raw); data[ds.key] = d;
  console.log(`\n== ${ds.key} (${d.statisticsName} / ${d.title}) 取得日 ${d.fetchedAt}`);
  const first = Object.values(d.areas)[0];
  for (const c of ds.cat01) { const n = first.items[c]?.name; console.log(`  ${c}: ${n ?? '(名前なし)'}`); if (!n) errors.push(`${ds.key}: コード ${c} が存在しません`); else if (!EXPECT[ds.key].test(n)) warns.push(`${ds.key}: ${c} の名前「${n}」が想定と違う可能性`); }
  for (const a of ds.areas) {
    const ar = d.areas[a]; if (!ar?.name) { errors.push(`${ds.key}: 地域 ${a} がありません`); continue; }
    for (const c of ds.cat01) { const it = ar.items[c]; if (it.value != null && (!Number.isFinite(it.value) || it.value < 0)) errors.push(`${ds.key}/${a}/${c}: 異常値 ${it.value}`); }
  }
}
const pages = {}, noindex = [];
for (const p of PREFS) {
  const reasons = [];
  for (const ds of DATASETS.filter((x) => x.key !== 'okinawa_municipal_age')) {
    const ar = data[ds.key]?.areas?.[p.code];
    if (!ar) { reasons.push(`${ds.key}: データなし`); continue; }
    const items = Object.values(ar.items);
    if (items.some((i) => i.symbol === '取得なし')) reasons.push(`${ds.key}: 取得できない項目あり`);
    if (!items.some((i) => i.value != null)) reasons.push(`${ds.key}: 数値が1つもない`);
  }
  if (!existsSync(`data/commentary/${p.slug}.json`)) reasons.push('解説文(data/commentary)なし');
  if (p.code === '47000') { const m = data.okinawa_municipal_age; if (!m) reasons.push('市町村別: データなし'); else if (Object.keys(m.areas).length !== 41) reasons.push('市町村別: 41件でない'); }
  pages[p.slug] = { complete: reasons.length === 0, reasons };
  if (reasons.length) noindex.push(p.slug);
}
writeFileSync('data/pages.json', JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), noindex, pages }, null, 1));
console.log(`\n完全なページ: ${PREFS.length - noindex.length} / ${PREFS.length}(不完全は noindex・sitemap除外)`);
warns.forEach((w) => console.log('警告:', w)); errors.forEach((e) => console.log('エラー:', e));
process.exit(errors.length ? 1 : 0);
