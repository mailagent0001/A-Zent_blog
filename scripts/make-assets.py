#!/usr/bin/env python3
"""使い方: python3 scripts/make-assets.py ~/assets public
~/assets に、次の5種類のファイルを入れておく(名前の一部で自動判定)
  ロゴ(横・黒文字) : FIXED_Logo_Horizontal_BlackText.png
  ロゴ(シンボルのみ): FIXED_Logo_Symbol_Only.png
  写真(About)      : 名前に 1522071820081 を含むjpg(または about.jpg)
  写真(サービス)   : 名前に 1519389950473 を含むjpg(または service.jpg)
  写真(自動化)     : 名前に 1518770660439 を含むjpg(または automation.jpg)
"""
import sys, glob, os, io, base64
from PIL import Image
src, pub = os.path.expanduser(sys.argv[1]), sys.argv[2]
def find(*keys):
    for k in keys:
        m = glob.glob(os.path.join(src, f'*{k}*'))
        if m: return m[0]
    sys.exit('見つかりません: ' + ' / '.join(keys))
def trim(im):
    bb = im.getchannel('A').getbbox() if im.mode == 'RGBA' else None
    return im.crop(bb) if bb else im
hor = trim(Image.open(find('Horizontal_BlackText')).convert('RGBA'))
sym = trim(Image.open(find('Symbol_Only')).convert('RGBA'))
os.makedirs(os.path.join(pub, 'images'), exist_ok=True)
h = hor.resize((round(hor.width * 128 / hor.height), 128), Image.LANCZOS)  # 高さ128px(表示32pxの4倍)
h.save(os.path.join(pub, 'logo.png'), optimize=True)
def square(im, n, pad=0.08):
    s = round(max(im.size) * (1 + pad * 2)); c = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    c.paste(im, ((s - im.width) // 2, (s - im.height) // 2), im); return c.resize((n, n), Image.LANCZOS)
sq = square(sym, 512)
sq.resize((256, 256), Image.LANCZOS).save(os.path.join(pub, 'favicon-256.png'))
sq.save(os.path.join(pub, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
bg = Image.new('RGB', (180, 180), 'white'); a = square(sym, 180, 0.18); bg.paste(a, (0, 0), a)
bg.save(os.path.join(pub, 'apple-touch-icon.png'))
buf = io.BytesIO(); sq.resize((128, 128), Image.LANCZOS).save(buf, 'PNG')
open(os.path.join(pub, 'favicon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><image href="data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode() + '" width="128" height="128"/></svg>')
og = Image.new('RGB', (1200, 630), 'white')
from PIL import ImageDraw
ImageDraw.Draw(og).rectangle([0, 0, 1200, 18], fill='#E8302A')
w = 760; lg = hor.resize((w, round(hor.height * w / hor.width)), Image.LANCZOS)
og.paste(lg, ((1200 - w) // 2, (630 - lg.height) // 2), lg)
og.save(os.path.join(pub, 'og-image.png'), optimize=True)
for name, keys in [('about', ('1522071820081', 'about')), ('service', ('1519389950473', 'service')), ('automation', ('1518770660439', 'automation'))]:
    im = Image.open(find(*keys)).convert('RGB')
    if im.width > 1200: im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    im.save(os.path.join(pub, 'images', name + '.jpg'), quality=82, optimize=True, progressive=True)
print('完了:', sorted(os.listdir(pub)))
