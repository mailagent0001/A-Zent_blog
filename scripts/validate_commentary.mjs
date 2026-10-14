// 使い方: node scripts/validate_commentary.mjs  (data/commentary/<県>.json を検査)
import { readdirSync, readFileSync, existsSync } from 'node:fs';
const BAN = ['No.1', 'ナンバーワン', '最安', '業界最大', '必ず', '絶対', '無料', '契約してください', '今すぐ契約', '限定'];
const dir = 'data/commentary'; if (!existsSync(dir)) { console.log('data/commentary がありません'); process.exit(0); }
const files = readdirSync(dir).filter((f) => f.endsWith('.json')); const texts = {}; let bad = 0;
for (const f of files) {
  const slug = f.replace('.json', ''), c = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  const fp = `data/facts/${slug}.json`; if (!existsSync(fp)) { console.log(`NG ${slug}: facts がありません`); bad++; continue; }
  const facts = JSON.parse(readFileSync(fp, 'utf8')), ok = new Set();
  for (const m of facts.metrics) for (const v of [m.value, m.mean47, m.ratio, m.rank, m.of]) if (v != null) { ok.add(String(v)); ok.add(String(Math.round(v))); ok.add(Number(v).toLocaleString('ja-JP')); ok.add((Math.round(v * 10) / 10).toFixed(1)); }
  for (const m of facts.metrics) for (const y of [...String(m.year ?? '').match(/\d+/g) || [], ...String(m.label ?? '').match(/\d+/g) || []]) ok.add(y); // 調査年(2020など)と、区分の名前に含まれる数字(1～4人など)は書いてよい
  const text = [c.summary, ...(c.insights || []), ...(c.faq || []).flatMap((x) => [x.q, x.a])].join('\n'); texts[slug] = text;
  const nums = (text.match(/\d[\d,]*(\.\d+)?/g) || []).map((s) => s.replace(/,/g, '')).filter((s) => !['47', '15', '64', '65'].includes(s));
  const unknown = [...new Set(nums.filter((n) => ![...ok].some((o) => o.replace(/,/g, '') === n)))];
  const ban = BAN.filter((b) => text.includes(b));
  if (unknown.length || ban.length) { bad++; console.log(`NG ${slug}: 材料にない数字 ${unknown.join(',') || 'なし'} / 禁止表現 ${ban.join(',') || 'なし'}`); } else console.log(`OK ${slug}`);
}
const gram = (t) => new Set(Array.from({ length: Math.max(0, t.length - 4) }, (_, i) => t.slice(i, i + 5)));
const s = Object.keys(texts);
for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) { const a = gram(texts[s[i]]), b = gram(texts[s[j]]); let n = 0; for (const x of a) if (b.has(x)) n++; const sim = n / Math.max(1, Math.min(a.size, b.size)); if (sim > 0.35) { bad++; console.log(`NG 似すぎ: ${s[i]} と ${s[j]} (${Math.round(sim * 100)}%)`); } }
process.exit(bad ? 1 : 0);
