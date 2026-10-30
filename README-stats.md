# 統計データ(都道府県別)の取り込み手順
場所: /stats/ と /stats/<都道府県>/ (例: /stats/okinawa/)
## 手順(Cloud Shell)
1. appId を、画面に出さずに設定する: `read -s ESTAT_APP_ID && export ESTAT_APP_ID`(貼り付けて Enter)
2. 取得: `node scripts/fetch_estat.mjs`(1つだけなら `--only population`)
3. 検算: `node scripts/validate.mjs`
   - 各コードの名前の一覧が出る。仕様と違う名前がないか目で確認する
   - `data/pages.json` が作られ、データが不完全な県は noindex・sitemap除外になる
4. `npm run build` → 問題なければ commit・push
## 注意
- `.env` は Git に入れない(`grep -qxF .env .gitignore || echo .env >> .gitignore`)
- data/estat/*.json は公開統計の整形結果。appId は含まれない(validate が検査する)
- 取得は、表ごとに「数値のある項目が最も多い調査年」を1つ選び、その年で表を揃える
- 秘匿値(x,-,…)は「非公表」と表示し、推計しない
- statsDataId・項目コードは、e-Stat の応答の名前で必ず確認する(validate の一覧)
