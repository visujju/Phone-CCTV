#!/usr/bin/env python3
"""Generate StreamHub PWA icons and screenshots with Pillow.

Artwork: dark gradient background, TV body with amber-to-coral screen,
black play triangle, TV stand, and the StreamHub wordmark.
Maskable variants keep the artwork inside the 78% safe zone.
"""

import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS = os.path.join(ROOT, "public", "icons")
SHOTS = os.path.join(ROOT, "public", "screenshots")
os.makedirs(ICONS, exist_ok=True)
os.makedirs(SHOTS, exist_ok=True)

INK_TOP = (16, 13, 26)
INK_BOTTOM = (7, 6, 15)
AMBER = (255, 176, 96)
CORAL = (255, 92, 92)
BODY = (22, 18, 31)
BODY_EDGE = (42, 36, 56)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def font(size, bold=True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def vgrad(size, top, bottom):
    w, h = size
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        row = lerp(top, bottom, y / max(1, h - 1))
        for x in range(w):
            px[x, y] = row
    return img


def draw_tv(draw, cx, cy, scale, screen=True):
    """Draw the TV glyph centered at (cx, cy). scale = 1.0 -> ~340px wide TV."""
    tw = int(340 * scale)
    th = int(230 * scale)
    x0, y0 = cx - tw // 2, cy - th // 2
    r = int(28 * scale)
    # body
    draw.rounded_rectangle([x0, y0, x0 + tw, y0 + th], radius=r, fill=BODY,
                           outline=BODY_EDGE, width=max(2, int(6 * scale)))
    # screen with amber->coral gradient
    if screen:
        sx0, sy0 = x0 + int(24 * scale), y0 + int(24 * scale)
        sx1, sy1 = x0 + tw - int(24 * scale), y0 + th - int(24 * scale)
        sw, sh = sx1 - sx0, sy1 - sy0
        grad = vgrad((sw, sh), AMBER, CORAL).resize((sw, sh))
        mask = Image.new("L", (sw, sh), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1],
                                               radius=int(16 * scale), fill=255)
        screen_img = Image.new("RGB", (sw, sh))
        screen_img.paste(grad, (0, 0), mask)
        draw._image.paste(screen_img, (sx0, sy0)) if hasattr(draw, "_image") else None
        return (sx0, sy0, sx1, sy1)
    return None


def draw_play(draw, box, scale):
    sx0, sy0, sx1, sy1 = box
    cx, cy = (sx0 + sx1) // 2, (sy0 + sy1) // 2
    h = int(90 * scale)
    w = int(80 * scale)
    pts = [(cx - w // 3, cy - h // 2), (cx - w // 3, cy + h // 2), (cx + w // 2, cy)]
    draw.polygon(pts, fill=(10, 8, 18))


def draw_stand(draw, cx, tv_bottom, scale):
    neck_w, neck_h = int(80 * scale), int(18 * scale)
    draw.rounded_rectangle(
        [cx - neck_w // 2, tv_bottom, cx + neck_w // 2, tv_bottom + neck_h],
        radius=neck_h // 2, fill=BODY)
    base_w, base_h = int(180 * scale), int(14 * scale)
    draw.rounded_rectangle(
        [cx - base_w // 2, tv_bottom + neck_h + int(6 * scale),
         cx + base_w // 2, tv_bottom + neck_h + int(6 * scale) + base_h],
        radius=base_h // 2, fill=BODY)


def make_icon(size, maskable=False, wordmark=True):
    img = vgrad((size, size), INK_TOP, INK_BOTTOM).convert("RGBA")
    if maskable:
        # full-bleed background, artwork scaled into the 78% safe zone
        inner = int(size * 0.78)
        art = make_icon(inner, maskable=False, wordmark=wordmark)
        img.paste(art, ((size - inner) // 2, (size - inner) // 2))
        return img.convert("RGB")
    draw = ImageDraw.Draw(img)
    # soft glow behind TV
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([size * 0.12, size * 0.1, size * 0.88, size * 0.78],
               fill=(255, 140, 80, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.08))
    img.alpha_composite(glow)
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, int(size * 0.42)
    scale = size / 512.0
    # TV body + screen
    tw, th = int(340 * scale), int(230 * scale)
    x0, y0 = cx - tw // 2, cy - th // 2
    draw.rounded_rectangle([x0, y0, x0 + tw, y0 + th], radius=int(28 * scale),
                           fill=BODY, outline=BODY_EDGE, width=max(2, int(6 * scale)))
    sx0, sy0 = x0 + int(24 * scale), y0 + int(24 * scale)
    sx1, sy1 = x0 + tw - int(24 * scale), y0 + th - int(24 * scale)
    sw, sh = sx1 - sx0, sy1 - sy0
    grad = vgrad((max(1, sw), max(1, sh)), AMBER, CORAL)
    mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1],
                                           radius=int(16 * scale), fill=255)
    screen_img = Image.new("RGB", (sw, sh))
    screen_img.paste(grad, (0, 0), mask)
    img.paste(screen_img, (sx0, sy0))
    draw = ImageDraw.Draw(img)
    draw_play(draw, (sx0, sy0, sx1, sy1), scale)
    draw_stand(draw, cx, y0 + th, scale)
    if wordmark:
        f = font(int(size * 0.085), bold=True)
        text = "StreamHub"
        bbox = draw.textbbox((0, 0), text, font=f)
        tw_text = bbox[2] - bbox[0]
        draw.text((cx - tw_text // 2, int(size * 0.82)), text, font=f, fill=(245, 243, 250))
    return img.convert("RGB")


def make_screenshot(w, h):
    img = vgrad((w, h), INK_TOP, INK_BOTTOM)
    draw = ImageDraw.Draw(img)
    # ambient glow
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([w * 0.55, -h * 0.25, w * 1.15, h * 0.45], fill=(255, 176, 96, 46))
    glow = glow.filter(ImageFilter.GaussianBlur(min(w, h) * 0.12))
    img.paste(glow, (0, 0), glow)
    draw = ImageDraw.Draw(img)
    # top bar
    f_brand = font(int(h * 0.028))
    draw.text((int(w * 0.04), int(h * 0.045)), "StreamHub", font=f_brand, fill=(250, 248, 252))
    draw.text((int(w * 0.04), int(h * 0.085)), "GOOD EVENING", font=font(int(h * 0.012)), fill=(150, 146, 165))
    # hero title
    f_hero = font(int(h * 0.085))
    draw.text((int(w * 0.04), int(h * 0.2)), "CineJoy", font=f_hero, fill=(255, 176, 96))
    draw.text((int(w * 0.04), int(h * 0.32)), "Cinema — the big screen, one remote away",
              font=font(int(h * 0.022)), fill=(210, 206, 222))
    # card row
    card_w = int(w * 0.16) if w > h else int(w * 0.4)
    card_h = int(card_w * 0.62)
    y = int(h * 0.52)
    x = int(w * 0.04)
    accents = [(244, 63, 94), (139, 92, 246), (16, 185, 129), (0, 168, 225), (229, 160, 13)]
    for i, acc in enumerate(accents):
        cx = x + i * (card_w + int(w * 0.015))
        if cx + card_w > w:
            break
        draw.rounded_rectangle([cx, y, cx + card_w, y + card_h], radius=int(card_w * 0.06),
                               fill=lerp(BODY, acc, 0.25), outline=lerp(BODY_EDGE, acc, 0.5),
                               width=2)
        draw.rounded_rectangle([cx + int(card_w * 0.06), y + int(card_h * 0.08),
                                cx + card_w - int(card_w * 0.06), y + int(card_h * 0.5)],
                               radius=int(card_w * 0.04), fill=lerp(acc, (255, 255, 255), 0.1))
    # wordmark bottom
    draw.text((int(w * 0.04), int(h * 0.9)), "StreamHub — TV Browser", font=font(int(h * 0.02)), fill=(170, 166, 185))
    return img


def main():
    jobs = [
        ("icon-192.png", make_icon(192)),
        ("icon-512.png", make_icon(512)),
        ("icon-192-maskable.png", make_icon(192, maskable=True)),
        ("icon-512-maskable.png", make_icon(512, maskable=True)),
        ("icon-1024-maskable.png", make_icon(1024, maskable=True)),
        ("apple-touch-icon.png", make_icon(180, wordmark=False)),
        ("favicon-32.png", make_icon(32, wordmark=False)),
    ]
    for name, img in jobs:
        img.save(os.path.join(ICONS, name))
        print("wrote", os.path.join("public/icons", name))
    make_screenshot(1920, 1080).save(os.path.join(SHOTS, "wide.png"))
    print("wrote public/screenshots/wide.png")
    make_screenshot(1080, 1920).save(os.path.join(SHOTS, "narrow.png"))
    print("wrote public/screenshots/narrow.png")

    # vector icon for the manifest
    svg = open(os.path.join(ROOT, "app", "icon.svg")).read()
    with open(os.path.join(ICONS, "icon.svg"), "w") as fh:
        fh.write(svg)
    print("wrote public/icons/icon.svg")


if __name__ == "__main__":
    main()
