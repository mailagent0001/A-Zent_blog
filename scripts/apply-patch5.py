# 速度・読みやすさ・構造化データの改善(HpLayout / Header / Footer / BlogPost / 色 / astro.config を、その場で書き換える)
import re, os, glob
def rd(p): return open(p, encoding='utf-8').read()
def wr(p, s): open(p, 'w', encoding='utf-8').write(s)
log = []

# 1) Google Fonts を、表示をじゃましない読み込みにする(速度)
p = 'src/layouts/HpLayout.astro'; s = rd(p)
if 'media="print"' in s: log.append('フォント: 適用済み')
else:
    m = re.search(r'<link[^>]*fonts\.googleapis\.com[^>]*>', s)
    assert m, 'Google Fonts の link が見つかりません'
    href = re.search(r'href="([^"]+)"', m.group(0)).group(1)
    if 'display=swap' not in href: href += '&display=swap'
    new = ('<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
           f'<link rel="stylesheet" href="{href}" media="print" onload="this.media=\'all\'" />\n<noscript><link rel="stylesheet" href="{href}" /></noscript>')
    s = s.replace(m.group(0), new, 1); log.append('フォント: 非ブロッキングに変更')
    wr(p, s)

# 2) ロゴ画像に、幅と高さを付ける(表示のずれ防止)
try:
    from PIL import Image
    w, h = Image.open('public/logo.png').size
    for p, hh in [('src/components/hp/Header.astro', 32), ('src/components/hp/Footer.astro', 28)]:
        s = rd(p)
        if 'width=' in re.search(r'<img src="/logo.png"[^>]*>', s).group(0): log.append(f'{p}: 適用済み'); continue
        s = re.sub(r'<img src="/logo.png"([^>]*?)height="\d+"', lambda m: f'<img src="/logo.png"{m.group(1)}width="{round(w*hh/h)}" height="{hh}"', s, count=1)
        wr(p, s); log.append(f'{p}: ロゴに幅・高さを追加')
except Exception as e: log.append(f'ロゴ: スキップ({e})')

# 3) 薄い灰色の文字を、少し濃くする(読みやすさ)
n = 0
for p in glob.glob('src/**/*.astro', recursive=True) + glob.glob('src/**/*.css', recursive=True):
    s = rd(p)
    if '#7A7570' in s: wr(p, s.replace('#7A7570', '#66615C')); n += 1
log.append(f'文字色: {n}ファイルを更新')

# 4) 記事に、BlogPosting の構造化データを追加
p = 'src/layouts/BlogPost.astro'; s = rd(p)
if 'BlogPosting' in s: log.append('BlogPosting: 適用済み')
else:
    a = "const fmt = (d: Date)"
    assert a in s, 'BlogPost.astro の目印が見つかりません'
    ld = ("const ld = [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title, description, datePublished: pubDate.toISOString(), dateModified: (updatedDate ?? pubDate).toISOString(), mainEntityOfPage: 'https://a-zent.com' + path, image: heroImage ? new URL(heroImage.src, Astro.url).href : undefined, author: { '@type': 'Organization', name: 'A-Zent' }, publisher: { '@type': 'Organization', name: 'A-Zent', url: 'https://a-zent.com/' } }];\n")
    s = s.replace(a, ld + a, 1)
    assert 'ogImage={heroImage?.src}>' in s, 'HpLayout の呼び出しが見つかりません'
    s = s.replace('ogImage={heroImage?.src}>', 'ogImage={heroImage?.src} ld={ld}>', 1)
    wr(p, s); log.append('BlogPosting: 追加')

# 5) CSSを、HTMLに埋め込む(読み込み待ちを減らす)
p = 'astro.config.mjs'; s = rd(p)
if 'inlineStylesheets' in s: log.append('CSS埋め込み: 適用済み')
else:
    a = "site: 'https://a-zent.com',"
    assert a in s, 'astro.config.mjs の目印が見つかりません'
    wr(p, s.replace(a, a + "\n        build: { inlineStylesheets: 'always' },", 1)); log.append('CSS埋め込み: 追加')
print('\n'.join(log))
