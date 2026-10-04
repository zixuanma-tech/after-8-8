"""Build first/middle/last-frame review sheets for all 16 motion candidates."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import imageio.v3 as iio
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SVD_DIR = ROOT / ".tools" / "svd-generated"
WAN_DIR = ROOT / ".tools" / "full-motion-generated"
OUTPUT_DIR = ROOT / ".tools" / "motion-review"
READY_DIR = ROOT / ".tools" / "motion-ready"


def candidate_path(gender: str, shot: int, ready: bool) -> tuple[Path, str]:
    clip_id = f"{gender}-{shot:02d}"
    if ready:
        return READY_DIR / f"{clip_id}.mp4", "ready"
    if gender == "female" and shot in {1, 7}:
        return WAN_DIR / f"{clip_id}.mp4", "wan"
    return SVD_DIR / f"{clip_id}.mp4", "svd"


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeui.ttf"),
    ):
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def read_frames(path: Path) -> tuple[list[np.ndarray], dict]:
    frames = [frame for frame in iio.imiter(path, plugin="FFMPEG")]
    metadata = iio.immeta(path, plugin="FFMPEG")
    return frames, metadata


def make_sheet(gender: str, ready: bool) -> list[dict]:
    cell_w, cell_h = 384, 216
    label_h = 34
    sheet = Image.new("RGB", (cell_w * 3, (cell_h + label_h) * 8), "black")
    draw = ImageDraw.Draw(sheet)
    label_font = font(22)
    report: list[dict] = []

    for row, shot in enumerate(range(1, 9)):
        path, source = candidate_path(gender, shot, ready)
        if not path.exists():
            raise FileNotFoundError(path)
        frames, metadata = read_frames(path)
        indices = [0, len(frames) // 2, len(frames) - 1]
        y = row * (cell_h + label_h)
        for col, (label, index) in enumerate(zip(("START", "MIDDLE", "END"), indices)):
            image = Image.fromarray(frames[index]).convert("RGB").resize((cell_w, cell_h), Image.Resampling.LANCZOS)
            sheet.paste(image, (col * cell_w, y + label_h))
            draw.text((col * cell_w + 8, y + 5), f"{gender.upper()} {shot:02d}  {source.upper()}  {label}", fill="white", font=label_font)

        first = frames[0].astype(np.float32)
        middle = frames[len(frames) // 2].astype(np.float32)
        last = frames[-1].astype(np.float32)
        report.append(
            {
                "clip_id": f"{gender}-{shot:02d}",
                "source": source,
                "path": str(path),
                "frames": len(frames),
                "fps": metadata.get("fps"),
                "size": metadata.get("size"),
                "mean_abs_diff_start_middle": float(np.mean(np.abs(first - middle))),
                "mean_abs_diff_start_end": float(np.mean(np.abs(first - last))),
            }
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    suffix = "ready-review-sheet" if ready else "review-sheet"
    sheet.save(OUTPUT_DIR / f"{gender}-{suffix}.jpg", quality=92, subsampling=0)
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ready", action="store_true")
    args = parser.parse_args()
    report = make_sheet("female", args.ready) + make_sheet("male", args.ready)
    report_name = "motion-ready-report.json" if args.ready else "motion-report.json"
    (OUTPUT_DIR / report_name).write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
