const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const txt = (v) => (v && typeof v === 'object' ? v.$ ?? '' : v ?? '');
export function classMap(classObj, id) {
  const o = arr(classObj).find((c) => c['@id'] === id);
  const m = {};
  for (const c of arr(o?.CLASS)) m[c['@code']] = { name: String(c['@name']).replace(/^[A-Za-z]*\d+_/, ''), unit: c['@unit'] || '' };
  return m;
}
export function parseValue(raw) {
  const s = String(raw ?? '').trim();
  if (/^-?[\d,]+(\.\d+)?$/.test(s)) return { value: Number(s.replace(/,/g, '')), symbol: null };
  return { value: null, symbol: s === '' ? '…' : s };
}
export function readPage(json) {
  const g = json.GET_STATS_DATA;
  if (!g) throw new Error('GET_STATS_DATA がありません');
  if (String(g.RESULT?.STATUS) !== '0') throw new Error(`APIエラー(STATUS ${g.RESULT?.STATUS}): ${g.RESULT?.ERROR_MSG}`);
  const sd = g.STATISTICAL_DATA;
  const t = sd.TABLE_INF || {};
  return {
    meta: { statisticsName: txt(t.STATISTICS_NAME), title: txt(t.TITLE), organization: txt(t.GOV_ORG), surveyDate: txt(t.SURVEY_DATE), updatedDate: txt(t.UPDATED_DATE) },
    classObj: sd.CLASS_INF?.CLASS_OBJ,
    rows: arr(sd.DATA_INF?.VALUE),
    notes: arr(sd.DATA_INF?.NOTE).map((n) => ({ char: n['@char'], text: n.$ })),
    next: sd.RESULT_INF?.NEXT_KEY ?? null,
  };
}
// 地域ごとに「数値のある項目が最も多い調査年(同数なら新しい年)」を1つ選び、表の全項目をその年で揃える
export function normalize(ds, pages, fetchedAt) {
  const first = pages[0];
  const cats = classMap(first.classObj, 'cat01'), areas = classMap(first.classObj, 'area'), times = classMap(first.classObj, 'time');
  const rowsBy = {}; let rowCount = 0;
  for (const p of pages) for (const r of p.rows) { rowCount++; ((rowsBy[r['@area']] ??= {})[r['@time']] ??= {})[r['@cat01']] = { ...parseValue(r.$), unit: r['@unit'] || '' }; }
  const out = {};
  for (const a of ds.areas) {
    out[a] = { name: areas[a]?.name ?? null, items: {} };
    const byTime = rowsBy[a] || {};
    let bt = null, bn = -1;
    for (const t of Object.keys(byTime).sort()) { const n = ds.cat01.filter((c) => byTime[t][c]?.value != null).length; if (n >= bn) { bn = n; bt = t; } }
    for (const c of ds.cat01) {
      const r = bt ? byTime[bt][c] : null;
      out[a].items[c] = { name: cats[c]?.name ?? null, unit: r?.unit || cats[c]?.unit || '', time: r ? bt : null, timeLabel: r ? times[bt]?.name ?? bt : null, value: r?.value ?? null, symbol: r ? r.symbol : '取得なし' };
    }
  }
  return { key: ds.key, label: ds.label, statsDataId: ds.statsDataId, sourceUrl: `https://www.e-stat.go.jp/dbview?sid=${ds.statsDataId}`, fetchedAt, ...first.meta, notes: first.notes, rowCount, catOrder: ds.cat01, areas: out };
}
