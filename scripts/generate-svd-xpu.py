"""Generate local image-to-video candidates with Stable Video Diffusion on Intel XPU."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import torch
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import export_to_video, load_image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "source-assets" / "film-png"
OUTPUT_DIR = ROOT / ".tools" / "svd-generated"
CACHE_DIR = ROOT / ".tools" / "hf-cache-svd"
MODEL_ID = "stabilityai/stable-video-diffusion-img2vid"


def clip_ids() -> list[str]:
    return [f"{gender}-{shot:02d}" for gender in ("female", "male") for shot in range(1, 9)]


def generate(
    pipe: StableVideoDiffusionPipeline,
    clip_id: str,
    steps: int,
    output_dir: Path,
    seed_override: int | None,
    motion_bucket_id: int,
    noise_aug_strength: float,
    force: bool,
) -> Path:
    gender, shot_text = clip_id.split("-")
    shot = int(shot_text)
    source = SOURCE_DIR / f"{gender}-shot-{shot:02d}.png"
    destination = output_dir / f"{clip_id}.mp4"
    metadata_path = output_dir / f"{clip_id}.json"

    if not force and destination.exists() and metadata_path.exists():
        print(f"SKIP {clip_id}: candidate already exists", flush=True)
        return destination
    if not source.exists():
        raise FileNotFoundError(source)

    image = load_image(str(source)).resize((1024, 576))
    seed = seed_override if seed_override is not None else 38100 + shot + (100 if gender == "male" else 0)
    generator = torch.Generator(device="xpu").manual_seed(seed)
    torch.xpu.reset_peak_memory_stats()
    started = time.perf_counter()
    print(f"START {clip_id}", flush=True)
    frames = pipe(
        image,
        num_frames=14,
        num_inference_steps=steps,
        decode_chunk_size=2,
        motion_bucket_id=motion_bucket_id,
        noise_aug_strength=noise_aug_strength,
        generator=generator,
    ).frames[0]
    elapsed = time.perf_counter() - started
    export_to_video(frames, str(destination), fps=7)
    peak_memory = int(torch.xpu.max_memory_allocated())
    metadata_path.write_text(
        json.dumps(
            {
                "clip_id": clip_id,
                "source": str(source),
                "output": str(destination),
                "model": MODEL_ID,
                "seed": seed,
                "steps": steps,
                "num_frames": 14,
                "fps": 7,
                "motion_bucket_id": motion_bucket_id,
                "noise_aug_strength": noise_aug_strength,
                "elapsed_seconds": elapsed,
                "peak_xpu_memory_bytes": peak_memory,
                "status": "candidate_needs_review",
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(
        f"DONE {clip_id}: {destination} ({elapsed:.1f}s, peak {peak_memory / 2**30:.2f} GiB)",
        flush=True,
    )
    return destination


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", action="append", choices=clip_ids())
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--skip", action="append", choices=clip_ids(), default=[])
    parser.add_argument("--steps", type=int, default=18)
    parser.add_argument("--seed", type=int)
    parser.add_argument("--motion-bucket", type=int, default=105)
    parser.add_argument("--noise-strength", type=float, default=0.04)
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    if not args.only and not args.all:
        parser.error("use --only female-02 for a trial or --all after the trial passes")
    if not torch.xpu.is_available():
        raise SystemExit("Intel XPU is unavailable")

    output_dir = args.output_dir if args.output_dir.is_absolute() else ROOT / args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"LOAD {MODEL_ID} on {torch.xpu.get_device_name(0)}", flush=True)
    pipe = StableVideoDiffusionPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16,
        variant="fp16",
        cache_dir=CACHE_DIR,
        token=True,
    )
    pipe.unet.enable_forward_chunking()
    pipe.to("xpu")

    targets = args.only if args.only else [clip_id for clip_id in clip_ids() if clip_id not in args.skip]
    for clip_id in targets:
        generate(
            pipe,
            clip_id,
            args.steps,
            output_dir,
            args.seed,
            args.motion_bucket,
            args.noise_strength,
            args.force,
        )


if __name__ == "__main__":
    main()
