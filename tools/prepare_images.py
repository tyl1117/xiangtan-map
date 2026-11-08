# -*- coding: utf-8 -*-
"""从大创素材包中裁切并压缩 H5 所需图片（可重复执行）。

用法: python tools/prepare_images.py
输入: 素材/H5广告/**
输出: h5/assets/img/*.jpg
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "素材" / "H5广告"
OUT = ROOT / "h5" / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

P1 = SRC / "基本图" / "P4（两分支）" / "景点导览" / "P5" / "P6（八个分支）" / "01毛泽东故居" / "P7" / "P8实景照片（三个分支）"
GUJU = P1 / "01故居"
TX = P1 / "03铜像广场"
JG = P1 / "02纪念馆"

# (源文件, 输出名, 宽, 高, 锚点)
JOBS = [
    (GUJU / "故居正面照.png", "cover.jpg", 900, 1200, "top"),
    (GUJU / "故居.jpg", "poi-guju.jpg", 1200, 800, "center"),
    (GUJU / "故居正面照.png", "poi-guju-face.jpg", 900, 1200, "top"),
    (GUJU / "故居牌匾.jpg", "plaque.jpg", 1000, 563, "center"),
    (GUJU / "稻田牌.jpg", "poi-daotian.jpg", 1200, 800, "center"),
    (GUJU / "全图.jpg", "guju-pano.jpg", 1400, 700, "center"),
    (TX / "铜像广场.png", "poi-tongxiang.jpg", 640, 800, "top"),
    (TX / "诗词碑刻.png", "story-shike.jpg", 578, 433, "center"),
    (TX / "石刻.jpg", "poi-beilin.jpg", 1200, 800, "center"),
    (JG / "纪念馆雕像.jpg", "poi-jinianguan.jpg", 1200, 800, "center"),
    (JG / "纪念馆碑像.png", "poi-jinianguan-2.jpg", 550, 733, "center"),
    (SRC / "基本图" / "P1" / "001封面海报.PNG", "poster-sample.jpg", 540, 960, "center"),
    (SRC / "基本图" / "P2" / "003湘潭简介.JPEG", "xiangtan.jpg", 720, 1280, "center"),
]


def crop_to(path: Path, w: int, h: int, anchor: str) -> Image.Image:
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    target = w / h
    sw, sh = im.size
    if sw / sh > target:
        ch, cw = sh, round(sh * target)
    else:
        cw, ch = sw, round(sw / target)
    x = (sw - cw) // 2
    y = 0 if anchor == "top" else (sh - ch if anchor == "bottom" else (sh - ch) // 2)
    im = im.crop((x, y, x + cw, y + ch))
    if im.size != (w, h):
        im = im.resize((w, h), Image.LANCZOS)
    return im


total = 0
for src, name, w, h, anchor in JOBS:
    if not src.exists():
        print("MISSING", src)
        continue
    img = crop_to(src, w, h, anchor)
    dst = OUT / name
    img.save(dst, "JPEG", quality=84, optimize=True, progressive=True)
    kb = dst.stat().st_size / 1024
    total += kb
    print(f"{name:24s} {w}x{h}  {kb:7.1f} KB")

print(f"TOTAL {total/1024:.2f} MB")