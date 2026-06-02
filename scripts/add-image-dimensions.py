#!/usr/bin/env python3
"""
Codemod that injects width and height attributes onto every <img> tag in the
codebase, based on the true intrinsic dimensions of the source file.

Setting width/height lets the browser reserve correct space for the image
BEFORE it loads, eliminating Cumulative Layout Shift (CLS) — one of the
three Core Web Vitals.

For images with a literal string src ("/welcome-hero.webp" etc.) we look up
the file directly. For dynamic srcs (leader.imageUrl, layer.image, etc.) we
use a heuristic map based on the variable name, since all images in that
category share the same approximate aspect ratio.

If a tag already has width/height, it is left alone.
"""

from __future__ import annotations

import re
from pathlib import Path
from PIL import Image

REPO = Path("/Users/karina/DT MAN SITE/digital-therapy-website")
PUBLIC = REPO / "client" / "public"
SRC = REPO / "client" / "src"


def measure(rel_path: str) -> tuple[int, int]:
    p = PUBLIC / rel_path.lstrip("/")
    with Image.open(p) as im:
        return im.size


# Map every literal-string src we use to its intrinsic (width, height).
LITERAL_SRC: dict[str, tuple[int, int]] = {
    "/sigmund-bot.webp": (400, 400),
    "/sigmund-clean.webp": (400, 400),
    "/sigmund-connect.webp": (400, 400),
    "/sigmund-report.webp": (400, 400),
    "/sigmund-search.webp": (400, 400),
    "/aicutsheads.webp": (1200, 800),
    "/balance-scale.webp": (1200, 800),
    "/close-faster.webp": (1600, 757),
    "/consolidated-financials.webp": (1600, 914),
    "/discovery-program.webp": (1448, 1086),
    "/dt-mark.webp": (197, 227),
    "/dt-talk-to-your-data.webp": (1536, 1024),
    "/dtlogo.webp": (600, 192),
    "/entity-cashflow-mapping.webp": (1535, 1024),
    "/fragmented-route.webp": (1200, 800),
    "/insights.webp": (1535, 1024),
    "/invoice-ocr-ai.webp": (1535, 1024),
    "/process-sme.webp": (600, 600),
    "/arap-sme.webp": (600, 600),
    "/tech-sme.webp": (600, 600),
    "/warehouse.webp": (1536, 1024),
    "/welcome-hero.webp": (1536, 1024),
}

# Map module-level variable srcs to their (W, H). These come from the
# `const xxxVisual = "/file.webp"` declarations in each page.
PAGE_VARS: dict[tuple[str, str], tuple[int, int]] = {
    # (file path suffix, variable name) -> (W, H)
    ("PublicHeader.tsx", "logoUrl"): (600, 192),
    ("SiteFooter.tsx", "logoUrl"): (600, 192),
    ("SiteFooter.tsx", "markUrl"): (197, 227),
    # Per-page wealthMapVisual aliases to different files:
    ("Capabilities.tsx", "wealthMapVisual"): (1536, 1024),  # dt-talk-to-your-data
    ("OurApproach.tsx", "wealthMapVisual"): (1448, 1086),  # discovery-program
    ("Thesis.tsx", "wealthMapVisual"): (1200, 800),        # fragmented-route
    # CloudFront photos (1920x1080) loaded as remote URLs:
    ("Home.tsx", "boardroomVisual"): (1920, 1080),
    ("Home.tsx", "heroVisual"): (1920, 1080),
    ("Home.tsx", "welcomeVisual"): (1536, 1024),  # local welcome-hero.webp
    ("Home.tsx", "markUrl"): (197, 227),
    ("Capabilities.tsx", "securityVisual"): (1920, 1080),
    ("Capabilities.tsx", "markUrl"): (197, 227),
    ("DTBrain.tsx", "heroVisual"): (1920, 1080),
    ("DTBrain.tsx", "securityVisual"): (1920, 1080),
    ("DTBrain.tsx", "markUrl"): (197, 227),
    ("Partners.tsx", "boardroomVisual"): (1920, 1080),
    ("Team.tsx", "boardroomVisual"): (1920, 1080),
    ("Team.tsx", "markUrl"): (197, 227),
    ("Thesis.tsx", "boardroomVisual"): (1920, 1080),
    ("Thesis.tsx", "markUrl"): (197, 227),
    ("OurApproach.tsx", "markUrl"): (197, 227),
    ("OurApproach.tsx", "trackImage"): (600, 600),  # SME illustrations
}

# Heuristic map for dynamic src expressions. Keyed by the JSX expression
# (minus surrounding braces) — covers the dynamic image renderings.
EXPRESSION_HINTS: dict[str, tuple[int, int]] = {
    "leader.imageUrl": (800, 800),
    "member.imageUrl": (800, 800),
    "person.imageUrl": (800, 800),
    "layer.image": (400, 400),
    "member.image": (600, 600),
    "discipline.image": (600, 600),
    "openTool.src": (1536, 1024),
    "logo": (200, 200),
}


def dimensions_for(src_value: str, file: Path) -> tuple[int, int] | None:
    """Return (W, H) for a given src value, or None if unmappable."""
    # Literal string
    if src_value in LITERAL_SRC:
        return LITERAL_SRC[src_value]
    # Module-level variable (e.g. `logoUrl`, `welcomeVisual`)
    fname = file.name
    if (fname, src_value) in PAGE_VARS:
        return PAGE_VARS[(fname, src_value)]
    # Expression hint
    if src_value in EXPRESSION_HINTS:
        return EXPRESSION_HINTS[src_value]
    return None


IMG_RE = re.compile(r"<img\b([^>]*?)(/?)>", re.DOTALL)
SRC_RE = re.compile(r"""src\s*=\s*(?:\{([^}]+)\}|["']([^"']+)["'])""")


def transform(text: str, file: Path) -> tuple[str, int, list[str]]:
    """Add width/height attributes to img tags missing them. Returns
    (new text, count of tags modified, list of unmapped sources)."""
    modified = 0
    unmapped: list[str] = []

    def replace(m: re.Match[str]) -> str:
        nonlocal modified
        attrs = m.group(1)
        self_closing = m.group(2)
        # Skip if already has both
        if re.search(r"\bwidth\s*=", attrs) and re.search(r"\bheight\s*=", attrs):
            return m.group(0)
        sm = SRC_RE.search(attrs)
        if not sm:
            return m.group(0)
        src_value = (sm.group(1) or sm.group(2)).strip()
        dims = dimensions_for(src_value, file)
        if dims is None:
            unmapped.append(f"{file.name}:{src_value}")
            return m.group(0)
        w, h = dims
        # Inject width/height just before the closing of the tag attributes.
        # Insert as plain string attrs (not JSX {} expressions).
        new_attrs = attrs.rstrip()
        if not re.search(r"\bwidth\s*=", attrs):
            new_attrs += f' width={{{w}}} height={{{h}}}'
        modified += 1
        return f"<img{new_attrs}{self_closing}>"

    new_text = IMG_RE.sub(replace, text)
    return new_text, modified, unmapped


def main() -> None:
    total_modified = 0
    all_unmapped: list[str] = []
    changed_files: list[str] = []

    for f in sorted(SRC.rglob("*.tsx")):
        original = f.read_text()
        new_text, modified, unmapped = transform(original, f)
        if modified > 0 and new_text != original:
            f.write_text(new_text)
            rel = str(f.relative_to(REPO))
            changed_files.append(rel)
            print(f"  {rel}: +{modified}")
            total_modified += modified
        if unmapped:
            all_unmapped.extend(unmapped)

    print()
    print(f"Files changed: {len(changed_files)}")
    print(f"<img> tags modified: {total_modified}")
    if all_unmapped:
        print(f"Unmapped (left untouched, no dimension lookup):")
        for u in all_unmapped:
            print(f"  - {u}")
    else:
        print("All <img> tags resolved successfully.")


if __name__ == "__main__":
    main()
