// 使い方: node scripts/fetch_estat.mjs [--only population]  (ESTAT_APP_ID は環境変数か .env)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { DATASETS } from './estat-config.mjs';
import { readPage, normalize } from './lib/estat-normalize.mjs';
if (existsSync('.env')) for (const l of readFileSync('.env', 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const appId = process.env.ESTAT_APP_ID;
if (!appId) { console.error('ESTAT_APP_ID が設定されていません(チャットや公開リポジトリには書かないでください)'); process.exit(1); }
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const redact = (s) => String(s).split(appId).join('***');
const today = new Date().toISOString().slice(0, 10);
mkdirSync('data/estat', { recursive: true });
for (const ds of DATASETS) {
  if (only && ds.key !== only) continue;
  const pages = []; let start = null;
  try {
    do {
      const q = new URLSearchParams({ appId, lang: 'J', statsDataId: ds.statsDataId, cdArea: ds.areas.join(','), cdCat01: ds.cat01.join(','), metaGetFlg: 'Y', cntGetFlg: 'N', explanationGetFlg: 'Y', annotationGetFlg: 'Y', sectionHeaderFlg: '1', replaceSpChars: '0' });
      if (start) q.set('startPosition', start);
      const res = await fetch('https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?' + q);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const p = readPage(await res.json());
      pages.push(p); start = p.next;
    } while (start);
    const out = normalize(ds, pages, today);
    writeFileSync(`data/estat/${ds.key}.json`, JSON.stringify(out, null, 1));
    console.log(`OK ${ds.key}: ${out.rowCount}行 / ${out.statisticsName}`);
  } catch (e) { console.error(`NG ${ds.key}: ${redact(e.message)}`); process.exitCode = 1; }
}
