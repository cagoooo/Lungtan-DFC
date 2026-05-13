"""
生成 og-preview.png (1200x630) — 給 FB / LINE / Twitter 分享卡片用
執行方式：python generate-og.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), 'og-preview.png')

# Windows 中文字型路徑（Microsoft JhengHei 微軟正黑體）
FONT_PATH = "C:/Windows/Fonts/msjh.ttc"

def font(size, index=0):
    """載入字型，找不到就 fallback 到 default"""
    for p in (FONT_PATH, "C:/Windows/Fonts/msjhbd.ttc", "C:/Windows/Fonts/msyh.ttc"):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size, index=index)
            except Exception:
                pass
    return ImageFont.load_default()

# === 漸層背景 ===
img = Image.new('RGB', (W, H), '#c0392b')
draw = ImageDraw.Draw(img)
for y in range(H):
    # 紅色由淺到深漸層
    t = y / H
    r = int(231 - (231 - 110) * t)   # e7 -> 6e
    g = int(76  - (76  - 31)  * t)   # 4c -> 1f
    b = int(60  - (60  - 23)  * t)   # 3c -> 17
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# === 角落光暈 ===
overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
overlay_draw = ImageDraw.Draw(overlay)
# 左上金光
for r in range(360, 0, -20):
    alpha = max(0, int(40 - r / 10))
    overlay_draw.ellipse((-180 - r//2, -180 - r//2, 180 + r//2, 180 + r//2),
                         fill=(255, 224, 160, alpha))
# 右下紅光
for r in range(360, 0, -20):
    alpha = max(0, int(50 - r / 8))
    overlay_draw.ellipse((W - 180 - r//2, H - 180 - r//2, W + 180 + r//2, H + 180 + r//2),
                         fill=(255, 100, 100, alpha))
img.paste(overlay, (0, 0), overlay)
draw = ImageDraw.Draw(img)

# === 學校名小標籤（左上） ===
school_tag_font = font(28)
tag_text = "龍潭國小"
tag_padding_x, tag_padding_y = 24, 12
bbox = draw.textbbox((0, 0), tag_text, font=school_tag_font)
tag_w = bbox[2] - bbox[0] + tag_padding_x * 2
tag_h = bbox[3] - bbox[1] + tag_padding_y * 2
tag_x, tag_y = 60, 60
# 半透明白底
tag_overlay = Image.new('RGBA', (tag_w, tag_h), (255, 255, 255, 50))
img.paste(tag_overlay, (tag_x, tag_y), tag_overlay)
draw.rounded_rectangle(
    (tag_x, tag_y, tag_x + tag_w, tag_y + tag_h),
    radius=tag_h // 2, outline=(255, 255, 255, 200), width=2
)
draw.text((tag_x + tag_padding_x, tag_y + tag_padding_y - bbox[1]),
          tag_text, font=school_tag_font, fill='#fff')

# === 主標題 ===
title_font = font(96, index=1)  # bold
title1 = "第 123 屆"
title2 = "自治市小市長選舉"

# Title 1
bbox1 = draw.textbbox((0, 0), title1, font=title_font)
t1_w = bbox1[2] - bbox1[0]
draw.text(((W - t1_w) // 2, 175), title1, font=title_font, fill='#fff',
          stroke_width=3, stroke_fill=(0, 0, 0, 80))

# Title 2
bbox2 = draw.textbbox((0, 0), title2, font=title_font)
t2_w = bbox2[2] - bbox2[0]
draw.text(((W - t2_w) // 2, 290), title2, font=title_font, fill='#fff',
          stroke_width=3, stroke_fill=(0, 0, 0, 80))

# === 副標籤條 ===
subtitle = "DFC 行動方案 · 即時投票與監票系統"
sub_font = font(40)
sub_bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
sub_w = sub_bbox[2] - sub_bbox[0]
sub_h = sub_bbox[3] - sub_bbox[1]
sub_pad_x, sub_pad_y = 36, 18
sub_box_w = sub_w + sub_pad_x * 2
sub_box_h = sub_h + sub_pad_y * 2
sub_box_x = (W - sub_box_w) // 2
sub_box_y = 430
# 金色底
draw.rounded_rectangle(
    (sub_box_x, sub_box_y, sub_box_x + sub_box_w, sub_box_y + sub_box_h),
    radius=sub_box_h // 2, fill='#ffe0a0'
)
draw.text((sub_box_x + sub_pad_x, sub_box_y + sub_pad_y - sub_bbox[1]),
          subtitle, font=sub_font, fill='#6e1f17')

# === 底部裝飾 ===
footer_font = font(22)
footer = "全校教室即時連線  ·  透明開票  ·  公平選舉"
fb_bbox = draw.textbbox((0, 0), footer, font=footer_font)
fb_w = fb_bbox[2] - fb_bbox[0]
draw.text(((W - fb_w) // 2, 555), footer, font=footer_font, fill=(255, 255, 255, 200))

# === 右下浮水印 ===
wm_font = font(18)
wm = "cagoooo.github.io/Lungtan-DFC"
wm_bbox = draw.textbbox((0, 0), wm, font=wm_font)
draw.text((W - (wm_bbox[2] - wm_bbox[0]) - 30, H - 30 - (wm_bbox[3] - wm_bbox[1])),
          wm, font=wm_font, fill=(255, 224, 160, 180))

# === 輸出 ===
img.save(OUT, 'PNG', optimize=True)
size_kb = os.path.getsize(OUT) / 1024
print(f"OK  {OUT}  {W}x{H}  {size_kb:.1f} KB")
