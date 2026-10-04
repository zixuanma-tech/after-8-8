"""Generate the 16 full-motion story clips through a public Wan I2V Space.

The script never prints the Hugging Face token. It writes candidates outside
the public site tree so every clip can be reviewed before replacing a fallback.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
from pathlib import Path

from gradio_client import Client, handle_file
from huggingface_hub import get_token


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "source-assets" / "film-png"
OUTPUT_DIR = ROOT / ".tools" / "full-motion-generated"
DEFAULT_SPACE = "Upsampler/wan-2-2-14b-image-to-video"

NEGATIVE_PROMPT = (
    "static image, only face moving, frozen shoulders, frozen arms, frozen hands, "
    "camera zoom, camera pan, identity change, different person, different clothes, "
    "missing THU letters, distorted THU letters, deformed hands, extra fingers, fused "
    "fingers, warped phone, floating phone, duplicated limbs, broken joints, text, "
    "subtitles, flicker, jitter, low quality, plastic skin, cartoon, anime"
)

SHOT_ACTIONS = {
    1: (
        "The phone vibrates softly on the desk. The student reaches forward, picks it "
        "up with one hand, unlocks it with the thumb, and begins reading a new message. "
        "The shoulders and forearms move naturally and the eyes track the phone."
    ),
    2: (
        "The student holds the phone securely, scrolls through a task page with the "
        "thumb, pauses, then taps one sample. Both hands, wrists, and upper body move "
        "naturally while the student stays seated."
    ),
    3: (
        "A small payment notification appears on the phone. The student notices it, "
        "leans forward slightly, raises the phone for a closer look, and briefly relaxes "
        "with a restrained smile before returning to a cautious expression."
    ),
    4: (
        "The student compares information on the phone with documents on the laptop, "
        "moving the phone closer, scrolling once, then pointing toward a suspicious "
        "detail on the laptop. Natural torso, shoulder, arm, and hand movement."
    ),
    5: (
        "A new message arrives. The student stops scrolling, turns the head and upper "
        "body toward an off-screen roommate, hesitates, then looks back at the phone "
        "without forwarding the link. The phone remains stable in the hand."
    ),
    6: (
        "The student prepares to tap a payment button. The index finger approaches the "
        "phone screen, hovers, trembles slightly, then pulls back as the shoulders tense. "
        "Show a clear decision pause with realistic hand and wrist motion."
    ),
    7: (
        "The student reads a red account-freeze warning. The hand holding the phone "
        "suddenly stops, shoulders tense, upper body leans backward in alarm, and the "
        "free hand lifts in a defensive stop gesture. Then the student steadies and "
        "looks back at the screen with alert caution."
    ),
    8: (
        "The student realizes the screen is being shared. The free hand rises in a firm "
        "stop gesture, the phone is moved away from the body, the thumb taps to end the "
        "sharing session, and the student lowers the phone while remaining alert."
    ),
}


def prompt_for(gender: str, shot: int) -> str:
    description = (
        "young Chinese female university student with a tied high ponytail"
        if gender == "female"
        else "tall young Chinese male university student with natural tousled dark hair"
    )
    return (
        f"Photorealistic cinematic medium-wide shot of the same {description}, wearing "
        "the exact purple-and-white THU varsity jacket from the reference image, seated "
        "at the same dorm desk in the same night-time campus dorm room. "
        f"{SHOT_ACTIONS[shot]} Preserve the face, hairstyle, body proportions, clothing, "
        "THU lettering, smartphone, furniture, lighting, and background. Locked camera, "
        "natural breathing, realistic fabric and hair secondary motion, realistic hands "
        "and phone interaction, smooth temporal motion, no dialogue, no newly generated text."
    )


def clip_ids() -> list[str]:
    return [f"{gender}-{shot:02d}" for gender in ("female", "male") for shot in range(1, 9)]


def generate(client: Client, clip_id: str, steps: int, duration: float) -> Path:
    gender, shot_text = clip_id.split("-")
    shot = int(shot_text)
    source = SOURCE_DIR / f"{gender}-shot-{shot:02d}.png"
    destination = OUTPUT_DIR / f"{clip_id}.mp4"
    metadata_path = OUTPUT_DIR / f"{clip_id}.json"

    if destination.exists() and metadata_path.exists():
        print(f"SKIP {clip_id}: candidate already exists")
        return destination
    if not source.exists():
        raise FileNotFoundError(source)

    print(f"START {clip_id}", flush=True)
    result = client.predict(
        input_image=handle_file(source),
        prompt=prompt_for(gender, shot),
        steps=steps,
        negative_prompt=NEGATIVE_PROMPT,
        duration_seconds=duration,
        guidance_scale=1.2,
        guidance_scale_2=1.2,
        seed=17700 + shot + (100 if gender == "male" else 0),
        randomize_seed=False,
        end_image=None,
        api_name="/generate_video",
    )
    video_path, returned_seed = result
    shutil.copy2(video_path, destination)
    metadata_path.write_text(
        json.dumps(
            {
                "clip_id": clip_id,
                "source": str(source),
                "output": str(destination),
                "seed": returned_seed,
                "steps": steps,
                "duration_seconds": duration,
                "prompt": prompt_for(gender, shot),
                "negative_prompt": NEGATIVE_PROMPT,
                "status": "candidate_needs_review",
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"DONE {clip_id}: {destination}")
    return destination


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=clip_ids())
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--steps", type=int, default=6, choices=range(4, 13))
    parser.add_argument("--duration", type=float, default=4.0)
    parser.add_argument("--space", default=os.environ.get("WAN_SPACE", DEFAULT_SPACE))
    args = parser.parse_args()

    if not args.only and not args.all:
        parser.error("use --only female-07 for a trial or --all after the trial passes")
    if not 0.5 <= args.duration <= 5.0:
        parser.error("--duration must be between 0.5 and 5.0 seconds")

    token = (
        os.environ.get("HF_TOKEN")
        or os.environ.get("HUGGINGFACE_HUB_TOKEN")
        or get_token()
    )
    if not token:
        raise SystemExit(
            "HF_TOKEN is not configured. Create a read token at "
            "https://huggingface.co/settings/tokens and set it in the current shell."
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    client = Client(args.space, hf_token=token, download_files=OUTPUT_DIR / "downloads")
    targets = [args.only] if args.only else clip_ids()
    for clip_id in targets:
        generate(client, clip_id, args.steps, args.duration)


if __name__ == "__main__":
    main()
