#!/usr/bin/env python3
"""Store screenshots for Wash — soft overlapping color fields."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "screenshots"

PALETTES = {
    "harbor": {
        "bg": (15, 42, 50),
        "washes": [(31, 111, 122), (126, 184, 162), (61, 142, 160)],
        "fg": (242, 247, 245),
        "dim": (170, 190, 186),
    },
    "blush": {
        "bg": (243, 221, 212),
        "washes": [(232, 160, 144), (240, 196, 168), (217, 139, 122)],
        "fg": (42, 33, 31),
        "dim": (120, 90, 84),
    },
    "night": {
        "bg": (12, 11, 18),
        "washes": [(42, 31, 85), (107, 45, 110), (61, 26, 74)],
        "fg": (217, 198, 239),
        "dim": (140, 120, 170),
    },
    "paper": {
        "bg": (244, 239, 230),
        "washes": [(217, 210, 196), (235, 228, 214), (207, 198, 182)],
        "fg": (22, 21, 19),
        "dim": (120, 114, 104),
    },
    "ochre": {
        "bg": (42, 36, 24),
        "washes": [(196, 154, 60), (168, 90, 58), (74, 90, 50)],
        "fg": (245, 240, 230),
        "dim": (180, 160, 120),
    },
    "fog": {
        "bg": (197, 204, 212),
        "washes": [(154, 168, 192), (183, 208, 200), (142, 154, 171)],
        "fg": (30, 36, 44),
        "dim": (80, 90, 104),
    },
}


def font(size: int, bold: bool = False):
    for path in (
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def round_rect(draw, box, radius, fill):
    x0, y0, x1, y1 = box
    r = max(0, min(radius, (x1 - x0) // 2, (y1 - y0) // 2))
    draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill)


def fields_for(mode: str, w: int, h: int, round_mask: bool):
    r = 36 if round_mask else 18
    if mode == "bloom":
        return [
            (-20 + 38, 22, w - 18, int(h * 0.48) + 22, r),
            (40, int(h * 0.34), w - 30, int(h * 0.34) + int(h * 0.42), r),
            (-12, h - int(h * 0.42), int(w * 0.72) - 12, h + 8, r),
        ]
    if mode == "edge":
        return [
            (-40, -20, int(w * 0.78) - 40, int(h * 0.62) - 20, r + 8),
            (w - int(w * 0.58), int(h * 0.18), w + 40, int(h * 0.18) + int(h * 0.58), r + 8),
            (16, h - int(h * 0.48), w - 4, h + 20, r),
        ]
    if mode == "editorial":
        return [
            (w - int(w * 0.62), -12, w + 20, int(h * 0.5) - 12, r),
            (-20, int(h * 0.3), int(w * 0.62) - 20, int(h * 0.3) + int(h * 0.48), r),
            (w - int(w * 0.78), h - int(h * 0.4), w + 10, h + 10, r),
        ]
    # cascade
    return [
        (-18, -12, int(w * 0.78) - 18, int(h * 0.58) - 12, r),
        (w - int(w * 0.7), int(h * 0.22), w + 20, int(h * 0.22) + int(h * 0.55), r),
        (8, h - int(h * 0.46), int(w * 0.9) + 8, h + 10, r),
    ]


def draw_face(
    size,
    *,
    palette="harbor",
    mode="cascade",
    hour=14,
    minute=32,
    caption="SAT 7",
    place="center",
    round_mask=False,
    soft=True,
):
    w, h = size
    p = PALETTES[palette]
    img = Image.new("RGB", size, p["bg"])
    draw = ImageDraw.Draw(img)

    for i, (x0, y0, x1, y1, rad) in enumerate(fields_for(mode, w, h, round_mask)):
        color = p["washes"][i % len(p["washes"])]
        if soft:
            halo = mix(p["bg"], color, 0.4)
            round_rect(draw, [x0 - 6, y0 - 6, x1 + 6, y1 + 6], rad + 4, halo)
        round_rect(draw, [x0, y0, x1, y1], rad, color)

    time_font = font(52 if w >= 240 else 48, bold=True)
    small_font = font(13)
    text = f"{hour:02d}:{minute:02d}"
    tb = draw.textbbox((0, 0), text, font=time_font)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    cb = draw.textbbox((0, 0), caption, font=small_font) if caption else (0, 0, 0, 0)
    cw = cb[2] - cb[0]
    gap = 6
    block_h = th + (gap + 14 if caption else 0)
    pad = 40 if round_mask else 14

    if place == "editorial":
        x, y = pad, h - pad - block_h - (10 if round_mask else 4)
    elif place == "banner":
        x, y = (w - tw) // 2, pad + (18 if round_mask else 8)
    else:
        x, y = (w - tw) // 2, (h - block_h) // 2

    draw.text((x, y), text, font=time_font, fill=p["fg"])
    if caption:
        cx = x if place == "editorial" else (w - cw) // 2
        draw.text((cx, y + th + gap), caption, font=small_font, fill=p["dim"])

    if round_mask:
        mask = Image.new("L", size, 0)
        ImageDraw.Draw(mask).ellipse([0, 0, w - 1, h - 1], fill=255)
        out = Image.new("RGB", size, (0, 0, 0))
        out.paste(img, mask=mask)
        return out
    return img


def save(img, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}")


def main():
    shots = [
        dict(name="01_harbor", palette="harbor", mode="cascade", hour=14, minute=32, caption="SAT 7"),
        dict(name="02_blush", palette="blush", mode="bloom", hour=9, minute=41, caption="FRI 7"),
        dict(name="03_night", palette="night", mode="edge", hour=22, minute=14, caption="BATTERY 64%"),
        dict(
            name="04_paper",
            palette="paper",
            mode="editorial",
            hour=11,
            minute=5,
            caption="SAT 7 NOV",
            place="editorial",
        ),
        dict(
            name="05_ochre",
            palette="ochre",
            mode="cascade",
            hour=18,
            minute=7,
            caption="STEPS 6.2K",
            place="banner",
        ),
    ]
    for shot in shots:
        name = shot.pop("name")
        save(draw_face((200, 228), round_mask=False, **shot), OUT / "emery" / f"{name}.png")
        save(draw_face((260, 260), round_mask=True, **shot), OUT / "gabbro" / f"{name}.png")


if __name__ == "__main__":
    main()
