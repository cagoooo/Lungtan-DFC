"""
生成 PWA icons：icon-192.png + icon-512.png
執行：python generate-icons.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.dirname(__file__)
FONT_BOLD = "C:/Windows/Fonts/msjhbd.ttc"
FONT_REG  = "C:/Windows/Fonts/msjh.ttc"

def font(size, bold=True):
    p = FONT_BOLD if bold else FONT_REG
    if os.path.exists(p):
        try: return ImageFont.truetype(p, size, index=0)
        except: pass
    return ImageFont.load_default()

def gen(size, out):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 紅色圓底 + 漸層
    bg_color = (192, 57, 43)         # primary
    # 主底色（純色，PIL 對 RGBA 漸層不友善，用單色就好）
    draw.ellipse((0, 0, size, size), fill=bg_color)
    # 高光（左上角微亮）— 用一個小白色透明 ellipse
    hi_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    hi_draw = ImageDraw.Draw(hi_layer)
    hi_draw.ellipse(
        (int(size * 0.1), int(size * 0.05), int(size * 0.55), int(size * 0.4)),
        fill=(255, 255, 255, 35)
    )
    img.alpha_composite(hi_layer)
    draw = ImageDraw.Draw(img)

    # 中間 "DFC" 文字
    fs = int(size * 0.42)
    f = font(fs, bold=True)
    text = "DFC"
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0]
    ty = (size - th) // 2 - bbox[1] - int(size * 0.03)
    # 陰影
    draw.text((tx + int(size*0.01), ty + int(size*0.02)), text, font=f, fill=(0, 0, 0, 80))
    # 主文字
    draw.text((tx, ty), text, font=f, fill=(255, 255, 255))

    # 右上角金色徽章 + ✓ 對勾
    badge_r = int(size * 0.16)
    bx = size - badge_r - int(size * 0.08)
    by = badge_r + int(size * 0.08)
    # 徽章外白圈
    draw.ellipse(
        (bx - badge_r - 3, by - badge_r - 3, bx + badge_r + 3, by + badge_r + 3),
        fill=(255, 255, 255)
    )
    # 徽章金色內
    draw.ellipse(
        (bx - badge_r, by - badge_r, bx + badge_r, by + badge_r),
        fill=(212, 160, 23)
    )
    # 對勾線條
    w = int(size * 0.04)
    cx1 = bx - int(badge_r * 0.45)
    cy1 = by + int(badge_r * 0.05)
    cx2 = bx - int(badge_r * 0.10)
    cy2 = by + int(badge_r * 0.35)
    cx3 = bx + int(badge_r * 0.45)
    cy3 = by - int(badge_r * 0.30)
    draw.line([(cx1, cy1), (cx2, cy2)], fill=(255, 255, 255), width=w)
    draw.line([(cx2, cy2), (cx3, cy3)], fill=(255, 255, 255), width=w)

    img.save(out, 'PNG', optimize=True)
    print(f"  [ok] {out} ({size}x{size}) {os.path.getsize(out) // 1024} KB")

print("Generating PWA icons...")
gen(192, os.path.join(ROOT, 'icon-192.png'))
gen(512, os.path.join(ROOT, 'icon-512.png'))
# Apple touch icon (180 是 iOS 預設)
gen(180, os.path.join(ROOT, 'apple-touch-icon.png'))
print("Done.")
