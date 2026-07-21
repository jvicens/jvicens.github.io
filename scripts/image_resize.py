#!/usr/bin/env python3
"""Resize and compress source images from images/original/ for web use.

Usage:
    python3 scripts/image_resize.py [--max-width 1080] [--output-dir images/720] [--quality 82]

Reads every image in images/original/, resizes it (preserving aspect ratio) so its
width is at most --max-width, and saves an optimized JPEG with the same base filename
into --output-dir. Existing files are skipped unless --force is passed, so re-running
is safe. Source files in images/original/ are never modified.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
SOURCE_DIR = REPO_ROOT / "images" / "original"

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".jp2"}


def resize_one(src_path: Path, output_dir: Path, max_width: int, quality: int, force: bool) -> None:
    dest_path = output_dir / (src_path.stem + ".jpg")
    if dest_path.exists() and not force:
        print(f"skip (exists): {dest_path}")
        return

    im = Image.open(src_path)
    if getattr(im, "n_frames", 1) > 1:
        im.seek(0)
    im = im.convert("RGB")

    if im.width > max_width:
        new_height = round(im.height * (max_width / im.width))
        im = im.resize((max_width, new_height), Image.LANCZOS)

    output_dir.mkdir(parents=True, exist_ok=True)
    im.save(dest_path, "JPEG", quality=quality, optimize=True)
    print(f"{src_path.name} -> {dest_path} "
          f"({im.width}x{im.height}, {dest_path.stat().st_size / 1024:.0f}KB)")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--max-width", type=int, default=1080, help="Max output width in pixels (default: 1080)")
    parser.add_argument("--output-dir", type=Path, default=None,
                         help="Output directory (default: images/<max-width>/)")
    parser.add_argument("--quality", type=int, default=82, help="JPEG quality 1-95 (default: 82)")
    parser.add_argument("--force", action="store_true", help="Overwrite existing output files")
    args = parser.parse_args()

    output_dir = args.output_dir or (REPO_ROOT / "images" / str(args.max_width))

    if not SOURCE_DIR.is_dir():
        print(f"Source directory not found: {SOURCE_DIR}", file=sys.stderr)
        return 1

    sources = sorted(p for p in SOURCE_DIR.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS)
    if not sources:
        print(f"No images found in {SOURCE_DIR}")
        return 0

    for src_path in sources:
        try:
            resize_one(src_path, output_dir, args.max_width, args.quality, args.force)
        except Exception as exc:
            print(f"error processing {src_path.name}: {exc}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
