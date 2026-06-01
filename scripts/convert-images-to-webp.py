#!/usr/bin/env python3
"""
One-shot image-weight reduction pass for Digital Therapy.

For every PNG in client/public/ (and client/public/team/) that we ship with the
site, this script:
  1. Backs the original up to client/public/_originals/ (gitignored).
  2. Resizes the image to a configured max width (so we stop sending users
     1500-px source files for 80-px avatars).
  3. Re-encodes as WebP at quality 85 — that gives near-PNG visual fidelity
     while typically cutting weight by 80-90%.
  4. Writes <name>.webp next to the original.

Transparency is preserved (Sigmund characters, dt-mark, etc. stay alpha-correct).

After this runs, a follow-up codemod swaps every `.png` reference in the
codebase to `.webp` so the new files actually get served.

The TARGETS map below is hand-tuned per image based on how it is actually
displayed on the site. Bump a value if a particular image looks soft after
the pass; lower it if you want even more savings.
"""

from __future__ import annotations

import os
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path("/Users/karina/DT MAN SITE/digital-therapy-website/client/public")
ORIGINALS = ROOT / "_originals"
ORIGINALS.mkdir(exist_ok=True)

# Display-driven width targets (~2× the largest visible size for retina).
# Keys are paths relative to client/public/.
TARGETS: dict[str, int] = {
    # Brand mark + logo
    "dt-mark.png": 200,
    "dtlogo.png": 600,

    # Hero photographs / full-bleed visuals
    "welcome-hero.png": 1600,
    "dt-talk-to-your-data.png": 1600,
    "balance-scale.png": 1200,
    "aicutsheads.png": 1200,
    "fragmented-route.png": 1200,
    "discovery-program.png": 1600,

    # Capability popup diagrams (shown in modals at ~800px wide)
    "entity-cashflow-mapping.png": 1600,
    "warehouse.png": 1600,
    "insights.png": 1600,
    "invoice-ocr-ai.png": 1600,
    "close-faster.png": 1600,
    "consolidated-financials.png": 1600,

    # Hand-drawn SME illustrations (Fusion Team card ~260px max display)
    "process-sme.png": 600,
    "arap-sme.png": 600,
    "tech-sme.png": 600,

    # Sigmund characters — small avatars only (60-150px display)
    "sigmund-bot.png": 400,
    "sigmund-clean.png": 400,
    "sigmund-connect.png": 400,
    "sigmund-report.png": 400,
    "sigmund-search.png": 400,

    # Team headshots — leader cards display at 280px, dialog at 320px
    "team/doug-blue.png": 800,
    "team/bruce-blue.png": 800,
    "team/geoff-blue.png": 800,
    "team/hunter.png": 800,
    "team/milton.png": 800,
    "team/stan.png": 600,
}

QUALITY = 85  # WebP quality. 85 is the sweet spot for photos + line art.


def human(bytes_: int) -> str:
    for unit in ("B", "KB", "MB"):
        if bytes_ < 1024 or unit == "MB":
            return f"{bytes_:.0f} {unit}" if unit == "B" else f"{bytes_/1024:.1f} {unit}"
        bytes_ //= 1024
    return f"{bytes_} MB"


def convert(rel_path: str, max_width: int) -> tuple[int, int, int, int]:
    """Returns (orig_bytes, new_bytes, orig_w, new_w)."""
    src = ROOT / rel_path
    if not src.exists():
        raise FileNotFoundError(src)

    # Mirror the relative path into _originals/ so the backup tree matches.
    backup_dest = ORIGINALS / rel_path
    backup_dest.parent.mkdir(parents=True, exist_ok=True)
    if not backup_dest.exists():
        shutil.copy2(src, backup_dest)

    orig_bytes = src.stat().st_size

    with Image.open(src) as im:
        orig_w, orig_h = im.size
        # Resize only if the source is wider than our target.
        if orig_w > max_width:
            ratio = max_width / orig_w
            new_w = max_width
            new_h = int(round(orig_h * ratio))
            im = im.resize((new_w, new_h), Image.LANCZOS)
        else:
            new_w, new_h = orig_w, orig_h

        # Output sits next to the PNG so the old file remains as a fallback
        # until we run the codemod (and beyond — we will gitignore the .png
        # versions of the files we converted in a follow-up sweep).
        out_path = src.with_suffix(".webp")
        # Quality 85 + method 6 (slowest, best compression) — single-run script
        # so the extra encoding time is well spent.
        save_kwargs: dict = {"quality": QUALITY, "method": 6}
        # Preserve alpha when the source has it (Sigmund characters, dt-mark).
        if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
            save_kwargs["lossless"] = False  # lossy WebP still supports alpha
        im.save(out_path, "WEBP", **save_kwargs)

    new_bytes = out_path.stat().st_size
    return orig_bytes, new_bytes, orig_w, new_w


def main() -> None:
    total_orig = 0
    total_new = 0
    print(f"{'File':<40} {'Dim':<15} {'Before':>10} {'After':>10} {'Save':>7}")
    print("-" * 86)
    for rel, target_w in TARGETS.items():
        try:
            orig_b, new_b, orig_w, new_w = convert(rel, target_w)
        except FileNotFoundError:
            print(f"{rel:<40} (missing — skipped)")
            continue
        total_orig += orig_b
        total_new += new_b
        pct = 100 - (new_b / orig_b * 100) if orig_b else 0
        print(
            f"{rel:<40} {orig_w}→{new_w:<10} {human(orig_b):>10} {human(new_b):>10} {pct:>6.0f}%"
        )

    print("-" * 86)
    pct_total = 100 - (total_new / total_orig * 100) if total_orig else 0
    print(
        f"{'TOTAL':<40} {'':<15} {human(total_orig):>10} {human(total_new):>10} {pct_total:>6.0f}%"
    )


if __name__ == "__main__":
    main()
