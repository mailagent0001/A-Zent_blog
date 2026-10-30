# HpLayout.astro に、(1)アクセス解析タグ (2)RSS・sitemapのリンク (3)記事ごとのOGP画像 を追加する
p = 'src/layouts/HpLayout.astro'
s = open(p, encoding='utf-8').read()
if 'googletagmanager' in s:
    print('すでに適用済みです'); raise SystemExit
def R(a, b):
    global s
    assert a in s, '見つかりません: ' + a[:50]
    s = s.replace(a, b, 1)
R("ld = [] } = Astro.props;", "ld = [], ogImage = null } = Astro.props;")
R("const url = base + path;", "const url = base + path;\nconst og = ogImage ? new URL(ogImage, Astro.url).href : base + '/og-image.png';")
R('<meta property="og:image" content="https://a-zent.com/og-image.png" />', '<meta property="og:image" content={og} />')
R('<meta name="twitter:image" content="https://a-zent.com/og-image.png" />', '''<meta name="twitter:image" content={og} />
<link rel="alternate" type="application/rss+xml" title="A-Zent コラム" href="/rss.xml" />
<link rel="sitemap" href="/sitemap-index.xml" />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K6YB5FJXRX"></script>
<script is:inline>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-K6YB5FJXRX');</script>''')
open(p, 'w', encoding='utf-8').write(s)
print('HpLayout.astro を更新しました')
