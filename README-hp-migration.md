# A-Zent HP 移行パッケージ(Astro)

このzipは、既存のAstroリポジトリ(A-Zent_blog)のルートに重ねて置く「追加ファイル」です。
既存のブログ用ファイルは含まれていません。

## 中身
- src/layouts/HpLayout.astro … HP共通の枠(メタ情報・OGP・パンくず・検索用データ)
- src/components/hp/Header.astro, Footer.astro … ヘッダー・フッター(ここ1か所を直せば全ページに反映)
- src/styles/hp.css … HP用のCSS(HPのページだけで読み込む。ブログには影響しない設計)
- src/pages/ … 各ページ(下表)
- public/og-image.png … OGP画像(仮)
- public/downloads/ … テンプレート・チェックリスト(Excel・PDF)

## URL一覧
/ , /service/ , /service/it-dx/ , /service/automation/ , /area/ , /area/naha/ , /area/okinawa/ , /area/online/ ,
/industry/construction/ , /industry/food/ , /industry/retail/ , /industry/professional/ ,
/contact/ , /works/ , /simulator/ , /about/ , /security/ , /terms/ , /privacy/
- エリア・業種の個別ページ(7枚)は、データが揃うまで noindex(layoutの `noindex` 指定を外すと解除)
- 特定商取引法ページは、非掲載方針のため含めていません

## 置く前の確認(重要)
既存と同じ名前のファイルがあると、上書きされます。
1. `ls src/pages src/layouts src/components public` で、既存の構成を見る
2. 特に `src/pages/index.astro`(今のトップ)、`public/og-image.png`、`public/downloads/` の有無を確認
3. 既存にある場合は、上書きせず、先に名前を変えて退避する(例: index.astro → index.old.astro.bak)
4. 既存の `/blog/` のURLが、変わらないことを確認する

## 公開前に直すこと
- 問い合わせフォームは、まだどこにも保存されません(送信すると、Googleカレンダーの予約画面が開くだけ)。保存先(Googleスプレッドシート等)の設定が必要
- ロゴ、写真(Unsplash素材)は未実装
- OGP画像は仮。公式ロゴが届いたら差し替え
- 沖縄の統計データによるエリア・業種ページは、データ作成後に、noindexを外す
- sitemapは、既存の設定(@astrojs/sitemap)を使う場合、noindexのページを除く設定が要る
