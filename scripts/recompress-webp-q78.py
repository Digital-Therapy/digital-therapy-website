#!/usr/bin/env python3
"""
Re-encode public/*.webp from the pristine PNG originals in _originals/ at
WebP quality 78 (down from the previous 85), for ~15-25% smaller files with
no visible quality loss on the illustration / diagram content.

Additionally, generates responsive variants of welcome-hero at 800/1200/1600
widths for use in a srcset (drives the LCP win for mobile).

Idempotent: skips any target whose PNG original is missing.
"""
from __future__ import annotations

import sys
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parent.parent
ORIGINALS = REPO / "client" / "public" / "_originals"
PUBLIC = REPO / "client" / "public"

QUALITY = 78

# Same display-driven max widths as the original pass.
TARGETS: dict[str, int] = {
    "welcome-hero.png": 1600,
    "dt-talk-to-your-data.png": 1600,
    "balance-scale.png": 1200,
    "aicutsheads.png": 1200,
    "fragmented-route.png": 1200,
    "discovery-program.png": 1600,
    "entity-cashflow-mapping.png": 1600,
    "warehouse.png": 1600,
    "insights.png": 1600,
    "invoice-ocr-ai.png": 1600,
    "close-faster.png": 1600,
    "consolidated-financials.png": 1600,
    "process-sme.png": 600,
    "arap-sme.png": 600,
    "tech-sme.png": 600,
    "sigmund-bot.png": 400,
    "sigmund-clean.png": 400,
    "sigmund-connect.png": 400,
    "sigmund-report.png": 400,
    "sigmund-search.png": 400,
}

# Hero srcset variants — small = mobile, large = desktop.
HERO_SRCSET_WIDTHS = [800, 1200, 1600]


def encode_webp(src: Path, dest: Path, max_width: int) -> tuple[int, int]:
    """Encode src PNG to dest webp at max_width. Returns (orig_bytes, new_bytes)."""
    orig_bytes = src.stat().st_size
    img = Image.open(src)
    w, h = img.size
    if w > max_width:
        ratio = max_width / w
        img = img.resize((max_width, int(h * ratio)), Image.LANCZOS)
    # Preserve alpha for RGBA/LA/transparent-P sources.
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
        img.save(dest, "WEBP", quality=QUALITY, method=6, lossless=False)
    else:
        img = img.convert("RGB")
        img.save(dest, "WEBP", quality=QUALITY, method=6, lossless=False)
    new_bytes = dest.stat().st_size
    return orig_bytes, new_bytes


def main() -> int:
    total_before = 0
    total_after = 0

    print(f"Re-encoding {len(TARGETS)} images from _originals/ at WebP q={QUALITY}...\n")
    print(f"{'IMAGE':<38} {'BEFORE':>10} {'AFTER':>10} {'DELTA':>10}")
    print("-" * 72)

    for rel, target_w in TARGETS.items():
        src = ORIGINALS / rel
        if not src.exists():
            print(f"{rel:<38} {'--':>10} {'--':>10} {'(skip: no orig)':>10}")
            continue
        dest = PUBLIC / rel.replace(".png", ".webp")
        # Track size of the existing webp so we can measure the delta from the
        # SHIPPED version (not the original PNG, which is much larger).
        old_shipped = dest.stat().st_size if dest.exists() else 0
        _orig_bytes, new_bytes = encode_webp(src, dest, target_w)
        delta = new_bytes - old_shipped
        arrow = "+" if delta >= 0 else "-"
        total_before += old_shipped
        total_after += new_bytes
        print(f"{rel:<38} {old_shipped/1024:>8.1f}K {new_bytes/1024:>8.1f}K {arrow}{abs(delta)/1024:>8.1f}K")

    # Hero srcset variants
    print()
    print(f"Generating hero srcset variants at q={QUALITY}...")
    hero_src = ORIGINALS / "welcome-hero.png"
    if hero_src.exists():
        for w in HERO_SRCSET_WIDTHS:
            dest = PUBLIC / f"welcome-hero-{w}.webp"
            old = dest.stat().st_size if dest.exists() else 0
            _o, new = encode_webp(hero_src, dest, w)
            print(f"  welcome-hero-{w}.webp   {new/1024:.1f}K"
                  + ("" if old == 0 else f"  (was {old/1024:.1f}K)"))

    print()
    print(f"Retargeted total: {total_before/1024:.1f}K -> {total_after/1024:.1f}K")
    savings = total_before - total_after
    if total_before > 0:
        print(f"Savings: {savings/1024:.1f}K ({100 * savings / total_before:.1f}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
