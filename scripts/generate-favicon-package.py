#!/usr/bin/env python3
"""Genera el paquete favicon de anclora-energyscan segun ANCLORA_BRANDING_FAVICON_SPEC.

Proceso: mascara circular (supersampling x4), recorte al bounding box + 5px,
resize LANCZOS, .ico multi-resolucion (16, 32, 48, 64, 128, 256).
Fuente: icono canonico 1024x1024 RGBA (identico al de anclora-design-system).
"""
from PIL import Image

SRC = "public/brand/anclora-energyscan.png"

def circular_crop(src_path: str) -> Image.Image:
    im = Image.open(src_path).convert("RGBA")
    w, h = im.size
    # Supersampling x4 para la mascara circular con antialiasing
    ss = 4
    mask = Image.new("L", (w * ss, h * ss), 0)
    from PIL import ImageDraw
    d = ImageDraw.Draw(mask)
    d.ellipse((0, 0, w * ss, h * ss), fill=255)
    mask = mask.resize((w, h), Image.LANCZOS)
    im.putalpha(mask)
    # Bounding box del circulo + 5px de padding
    bbox = im.getbbox()
    l, t, r, b = bbox
    l = max(0, l - 5); t = max(0, t - 5)
    r = min(w, r + 5); b = min(h, b + 5)
    return im.crop((l, t, r, b))

def main() -> None:
    icon = circular_crop(SRC)

    # favicon-32 -> app/icon.png (Next.js App Router)
    icon.resize((32, 32), Image.LANCZOS).save("src/app/icon.png")
    # apple-touch-icon 180 -> app/apple-icon.png
    icon.resize((180, 180), Image.LANCZOS).save("src/app/apple-icon.png")
    # favicon-512 para PWA/social -> public/
    icon.resize((512, 512), Image.LANCZOS).save("public/favicon-512.png")
    # favicon.ico multi-resolucion: 16, 32, 48, 64, 128, 256
    icon.save(
        "src/app/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print("OK: favicon.ico, icon.png (32), apple-icon.png (180), favicon-512.png")

if __name__ == "__main__":
    main()
