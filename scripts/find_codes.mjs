// 使い方: node scripts/find_codes.mjs <statsDataId> <キーワード>   例: node scripts/find_codes.mjs 0000010103 事業所
const [id, kw] = process.argv.slice(2); const appId = process.env.ESTAT_APP_ID;
if (!appId || !id || !kw) { console.error('ESTAT_APP_ID と、statsDataId・キーワードが必要です'); process.exit(1); }
const res = await fetch('https://api.e-stat.go.jp/rest/3.0/app/json/getMetaInfo?' + new URLSearchParams({ appId, statsDataId: id, lang: 'J' }));
const j = await res.json(); const objs = [].concat(j.GET_META_INFO?.METADATA_INF?.CLASS_INF?.CLASS_OBJ ?? []);
const cat = objs.find((o) => o['@id'] === 'cat01'); const list = [].concat(cat?.CLASS ?? []).filter((c) => String(c['@name']).includes(kw));
console.log(`${list.length}件`); for (const c of list.slice(0, 60)) console.log(c['@code'], String(c['@name']).replace(/^[A-Za-z]*\\d+_/, ''), c['@unit'] || '');
