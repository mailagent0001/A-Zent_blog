// 使い方: node scripts/print_facts.mjs okinawa aomori tokyo   (複数の県を続けて表示。解説文を書くAIに渡す)
import { readFileSync, existsSync } from 'node:fs';
for (const slug of process.argv.slice(2)) {
  const fp = `data/facts/${slug}.json`;
  if (!existsSync(fp)) { console.log(`# ${slug}: 事実シートがありません`); continue; }
  const f = JSON.parse(readFileSync(fp, 'utf8'));
  console.log(`\n# ${f.name} (slug: ${slug})  ※mean47=47都道府県の単純平均 / ratio=値÷平均 / rank=47都道府県中の順位(1位が最大)`);
  console.log('# highlights(この県の特徴の候補): ' + JSON.stringify(f.highlights));
  console.log('# id|項目名|値|47都道府県の平均|比|順位|調査年');
  for (const m of f.metrics) console.log([m.id, m.label, m.value + m.unit, m.mean47, m.ratio, m.rank + '/' + m.of, m.year].join('|'));
}
