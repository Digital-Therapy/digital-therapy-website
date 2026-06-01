#!/usr/bin/env python3
"""
Codemod sweep that flips every `*.png` reference to `*.webp` in the codebase
for the set of images we just converted. Leaves untouched:

  - /manus-storage/* (external CDN)
  - /og-image.png   (SEO OpenGraph card — needs to stay large PNG, often
                    standard 1200x630 for social-share previews)
  - /shadcn.png     (showcase demo asset)
  - any other path not in CONVERTED_FILES

It also adds `loading="lazy"` + `decoding="async"` to every `<img>` element
that doesn't already have them, EXCEPT a small safelist of above-the-fold
images (welcome hero, logo in nav/footer) where eager loading is desired
for the LCP element.
"""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path("/Users/karina/DT MAN SITE/digital-therapy-website")
SRC = REPO / "client" / "src"

CONVERTED_FILES = [
    "/dt-mark.png",
    "/dtlogo.png",
    "/welcome-hero.png",
    "/dt-talk-to-your-data.png",
    "/balance-scale.png",
    "/aicutsheads.png",
    "/fragmented-route.png",
    "/discovery-program.png",
    "/entity-cashflow-mapping.png",
    "/warehouse.png",
    "/insights.png",
    "/invoice-ocr-ai.png",
    "/close-faster.png",
    "/consolidated-financials.png",
    "/process-sme.png",
    "/arap-sme.png",
    "/tech-sme.png",
    "/sigmund-bot.png",
    "/sigmund-clean.png",
    "/sigmund-connect.png",
    "/sigmund-report.png",
    "/sigmund-search.png",
    "/team/doug-blue.png",
    "/team/bruce-blue.png",
    "/team/geoff-blue.png",
    "/team/hunter.png",
    "/team/milton.png",
    "/team/stan.png",
]

# Eager-load these — they're above the fold or critical for LCP.
EAGER_PATHS = {
    "/welcome-hero.webp",  # hero on Home
    "/dtlogo.webp",        # nav + footer logos (multi-instance, always visible)
}


def swap_extensions(text: str) -> tuple[str, int]:
    """Replace each known PNG path with its WebP equivalent."""
    count = 0
    for png in CONVERTED_FILES:
        webp = png[:-4] + ".webp"
        new_text, n = re.subn(re.escape(png), webp, text)
        if n:
            count += n
            text = new_text
    return text, count


IMG_OPEN_RE = re.compile(r"<img\b([^>]*?)/?>", re.DOTALL)


def add_lazy_to_img_tags(text: str) -> tuple[str, int]:
    """For each <img …> tag missing loading/decoding, append the attrs.

    Skipped when the src is in EAGER_PATHS (we want eager + decoding=sync for
    above-the-fold imagery).
    """
    additions = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal additions
        attrs = match.group(1)
        # Check src value (single or double quoted)
        src_match = re.search(r"""src\s*=\s*['"]([^'"]+)['"]""", attrs)
        if not src_match:
            return match.group(0)
        src = src_match.group(1).strip()
        if src in EAGER_PATHS:
            return match.group(0)
        has_loading = "loading=" in attrs
        has_decoding = "decoding=" in attrs
        if has_loading and has_decoding:
            return match.group(0)
        # Inject missing attrs at the end of the attribute list.
        new_attrs = attrs.rstrip()
        if not has_loading:
            new_attrs += ' loading="lazy"'
        if not has_decoding:
            new_attrs += ' decoding="async"'
        # Preserve trailing slash if the tag was self-closing.
        suffix = " />" if match.group(0).rstrip().endswith("/>") else ">"
        additions += 1
        return f"<img{new_attrs}{suffix}"

    return IMG_OPEN_RE.sub(replace, text), additions


def main() -> None:
    candidate_files: list[Path] = []
    for ext in (".tsx", ".ts"):
        candidate_files.extend(SRC.rglob(f"*{ext}"))

    total_path_swaps = 0
    total_lazy_added = 0
    files_changed: list[str] = []

    for path in candidate_files:
        original = path.read_text()
        after_swap, n_swap = swap_extensions(original)
        after_lazy, n_lazy = add_lazy_to_img_tags(after_swap)
        if after_lazy != original:
            path.write_text(after_lazy)
            files_changed.append(str(path.relative_to(REPO)))
            total_path_swaps += n_swap
            total_lazy_added += n_lazy
            print(
                f"  {path.relative_to(REPO)}  (paths: {n_swap}, +loading/decoding: {n_lazy})"
            )

    print()
    print(f"Files modified: {len(files_changed)}")
    print(f"PNG → WebP references swapped: {total_path_swaps}")
    print(f"<img> tags gained loading=lazy + decoding=async: {total_lazy_added}")


if __name__ == "__main__":
    main()
