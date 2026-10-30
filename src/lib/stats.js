import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const cache = {};
export function loadDataset(key) {
  if (key in cache) return cache[key];
  const f = join(root, 'data', 'estat', key + '.json');
  return (cache[key] = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null);
}
export function pageStatus() {
  const f = join(root, 'data', 'pages.json');
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : { noindex: 'all', pages: {} };
}
// 秘匿値(x,-,…)は数値として表示せず「非公表」とする
export function show(item) {
  if (!item || item.value == null) return '非公表';
  return item.value.toLocaleString('ja-JP') + (item.unit ? ' ' + item.unit : '');
}
export function table(ds, code) {
  const a = ds?.areas?.[code]; if (!a) return null;
  return ds.catOrder.map((c) => ({ code: c, ...a.items[c] }));
}
export function hasAny(ds, code) { const t = table(ds, code); return !!t && t.some((r) => r.value != null); }
export function loadJson(rel) { const f = join(root, rel); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null; }
export const loadFacts = (slug) => loadJson(`data/facts/${slug}.json`);
export const loadCommentary = (slug) => loadJson(`data/commentary/${slug}.json`);
// 本番(STATS_COMMENTED_ONLY=1)では、解説文のある県だけをページとして公開する
export function prefPublished(slug) {
  if (!loadFacts(slug)) return false;
  return process.env.STATS_COMMENTED_ONLY === '1' ? !!loadCommentary(slug) : true;
}
export const metricOf = (facts, id) => facts?.metrics?.find((m) => m.id === id) ?? null;
