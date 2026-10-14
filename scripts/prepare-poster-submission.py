from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "assets" / "hero-v2.jpg"
OUT_DIR = ROOT / "submission" / "poster"
PNG_OUT = OUT_DIR / "8.8元到账之后-主题海报-300dpi.png"
JPG_OUT = OUT_DIR / "8.8元到账之后-主题海报-300dpi.jpg"
CLEAN_PNG_OUT = OUT_DIR / "8.8元到账之后-主题海报-无文字-300dpi.png"
CLEAN_JPG_OUT = OUT_DIR / "8.8元到账之后-主题海报-无文字-300dpi.jpg"
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
FONT_REGULAR = Path(r"C:\Windows\Fonts\msyh.ttc")


def font(path: Path, size: int):
    return ImageFont.truetype(str(path), size, index=0)


def draw_centered(draw, xy, text, typeface, fill, stroke_fill=None, stroke_width=0):
    box = draw.textbbox((0, 0), text, font=typeface, stroke_width=stroke_width)
    width = box[2] - box[0]
    draw.text((xy[0] - width / 2, xy[1]), text, font=typeface, fill=fill,
              stroke_width=stroke_width, stroke_fill=stroke_fill)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGB")
    image = source.resize((3072, 4608), Image.Resampling.LANCZOS)
    image.save(CLEAN_PNG_OUT, format="PNG", dpi=(300, 300), optimize=True)
    image.save(CLEAN_JPG_OUT, format="JPEG", quality=96, subsampling=0, dpi=(300, 300), optimize=True)

    # Make a restrained dark lower field for legible title typography without
    # hiding the original student, glass path, or warning symbols.
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    pixels = overlay.load()
    start = int(image.height * 0.62)
    for y in range(start, image.height):
        amount = (y - start) / (image.height - start)
        alpha = int(35 + 180 * amount)
        for x in range(image.width):
            pixels[x, y] = (12, 6, 22, alpha)
    overlay = overlay.filter(ImageFilter.GaussianBlur(1.4))
    image = Image.alpha_composite(image.convert("RGBA"), overlay)

    draw = ImageDraw.Draw(image)
    title = "8.8元到账之后"
    slogan = "第一笔返款先给甜头，连环收割随后登场。"
    label = "校园反诈主题 AI 海报"

    left = 255
    title_y = 3730
    slogan_y = 4075
    label_y = 4420
    gold = (247, 220, 116, 255)
    white = (250, 246, 252, 255)
    muted = (214, 199, 225, 255)
    shadow = (8, 4, 15, 215)

    draw.line((left, title_y - 55, left + 620, title_y - 55), fill=gold, width=12)
    title_font = font(FONT_BOLD, 210)
    slogan_font = font(FONT_REGULAR, 88)
    label_font = font(FONT_BOLD, 52)
    draw.text((left + 7, title_y + 12), title, font=title_font, fill=shadow)
    draw.text((left, title_y), title, font=title_font, fill=gold)
    draw.text((left + 5, slogan_y + 9), slogan, font=slogan_font, fill=shadow)
    draw.text((left, slogan_y), slogan, font=slogan_font, fill=white)
    draw.text((left, label_y), label, font=label_font, fill=muted)

    image = image.convert("RGB")
    image.save(PNG_OUT, format="PNG", dpi=(300, 300), optimize=True)
    image.save(JPG_OUT, format="JPEG", quality=96, subsampling=0, dpi=(300, 300), optimize=True)
    print(PNG_OUT)
    print(JPG_OUT)
    print(CLEAN_PNG_OUT)
    print(CLEAN_JPG_OUT)


if __name__ == "__main__":
    main()
