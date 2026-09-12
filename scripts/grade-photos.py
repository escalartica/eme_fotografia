"""EME cinematic grade — one reproducible look for every photo on the site.

Design (kept deliberately subtle so it sits well with the images already
published and with the site-wide CSS --photo-grade of saturate(1.06)
contrast(1.04) brightness(1.01) that is applied on top in the browser):

  1. filmic tone curve with a slightly lifted black point (matte, "print" feel)
     and soft highlight roll-off — never crushes shadows, never clips whites
  2. split toning: warm highlights (Sevilla light), cool-neutral shadows
  3. viraje + un 2% de saturación: los colores leen filmicos, no digitales
  4. very light vignette + fine luminance grain
  5. B&W frames get the tone curve + grain only (no tint), so they stay B&W

Usage: python grade.py <in> <out.webp> [--long 1600] [--quality 82]
Also importable: grade_image(PIL.Image) -> PIL.Image
"""
import sys, argparse
import numpy as np
from PIL import Image, ImageOps

RNG = np.random.default_rng(1234)

def _lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722

def tone_curve(x, black=0.045, white=0.99, contrast=0.42):
    # smoothstep-blended S curve, then remap into [black, white]
    s = x * x * (3.0 - 2.0 * x)
    y = x * (1.0 - contrast) + s * contrast
    return black + y * (white - black)

def grade_array(a, is_bw):
    """a: float32 HxWx3 in [0,1]"""
    a = tone_curve(a)
    if not is_bw:
        l = _lum(a)[..., None]
        hi = np.clip(l, 0, 1) ** 2.0
        sh = np.clip(1.0 - l, 0, 1) ** 2.0
        warm = np.array([1.000, 0.980, 0.935], dtype=np.float32)
        cool = np.array([0.955, 0.985, 1.055], dtype=np.float32)
        a = a * (1.0 + (warm - 1.0) * hi * 0.9 + (cool - 1.0) * sh * 0.9)
        # desaturate 6%
        l2 = _lum(a)[..., None]
        a = l2 + (a - l2) * 1.02
    # vignette
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    vig = 1.0 - 0.16 * np.clip(r - 0.30, 0, 1) ** 1.5 / (0.70 ** 1.5)
    a = a * vig[..., None]
    # grain (luminance only)
    grain = RNG.normal(0.0, 2.8 / 255.0, size=(h, w, 1)).astype(np.float32)
    a = a + grain
    return np.clip(a, 0, 1)

def is_blackwhite(im):
    small = im.convert("RGB").resize((64, 64))
    hsv = np.asarray(small.convert("HSV"), dtype=np.float32)
    return float(hsv[..., 1].mean()) < 12.0

def grade_image(im, long_edge=None):
    im = ImageOps.exif_transpose(im).convert("RGB")
    if long_edge:
        im.thumbnail((long_edge, long_edge), Image.LANCZOS)
    bw = is_blackwhite(im)
    a = np.asarray(im, dtype=np.float32) / 255.0
    a = grade_array(a, bw)
    out = Image.fromarray((a * 255.0 + 0.5).astype(np.uint8), "RGB")
    if bw:
        out = out.convert("L").convert("RGB")
    return out

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("dst")
    ap.add_argument("--long", type=int, default=1600)
    ap.add_argument("--quality", type=int, default=82)
    args = ap.parse_args()
    im = Image.open(args.src)
    if args.src.lower().endswith((".jpg", ".jpeg")):
        im.draft("RGB", (args.long * 2, args.long * 2))
    out = grade_image(im, args.long)
    out.save(args.dst, "WEBP", quality=args.quality, method=6)
    print(args.dst, out.size)
