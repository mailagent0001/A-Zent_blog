// 使い方: node scripts/split_commentary.mjs batch.json
// batch.json は {"okinawa": {summary, insights, faq}, "aomori": {...}} の形。県ごとに data/commentary/<slug>.json へ分けて保存する
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { PREFS } from '../src/lib/prefectures.js';
const batch = JSON.parse(readFileSync(process.argv[2], 'utf8')); mkdirSync('data/commentary', { recursive: true });
const slugs = new Set(PREFS.map((p) => p.slug)); let ok = 0, ng = 0;
for (const [slug, c] of Object.entries(batch)) {
  const bad = !slugs.has(slug) ? '県の英字名が違います' : typeof c.summary !== 'string' ? 'summary がありません' : !Array.isArray(c.insights) || c.insights.length < 2 ? 'insights は2本以上必要です' : !Array.isArray(c.faq) || c.faq.length < 2 || c.faq.some((x) => !x.q || !x.a) ? 'faq は2問必要です' : null;
  if (bad) { console.log(`NG ${slug}: ${bad}`); ng++; continue; }
  writeFileSync(`data/commentary/${slug}.json`, JSON.stringify({ summary: c.summary, insights: c.insights, faq: c.faq }, null, 2)); ok++;
}
console.log(`保存: ${ok}件 / 形式エラー: ${ng}件`); process.exit(ng ? 1 : 0);
