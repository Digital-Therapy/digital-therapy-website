# Digital Therapy Website Asset Manifest

## Brand Assets

| Asset | URL |
|---|---|
| Official logo | `/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png` |
| Picture mark | `/manus-storage/DTLOGO_PICMARKpng_2cf51494.png` |

## Page Visual Assets

All page imagery is self-hosted from `client/public/` and referenced by a
root-relative path. To change the artwork in a slot, replace the file — no code
change is required.

| Asset | Intended Use | Path |
|---|---|---|
| Operating layer | Homepage final CTA + DT Brain abstract visual | `/dt-operating-layer.webp` |
| Family-office boardroom | Home complexity, Thesis, Team, Partners sections | `/dt-family-office-boardroom.webp` |
| Wealth map visual | Total wealth visibility section | `/dt-talk-to-your-data.webp` |
| Security automation visual | Capabilities delivery architecture + DT Brain | `/dt-security-automation.webp` |

## Rule: never reference images from an external CDN

Do **not** point components at an external/sandbox asset URL. Images must live in
`client/public/` and be referenced as `/name.webp`.

Earlier revisions of this manifest instructed the opposite ("reference these
directly, do not copy into `client/public`"). Those four images were hosted on a
build-sandbox CloudFront bucket; that bucket is private and now returns
`403 AccessDenied` for unsigned requests, so every one of those images broke on
the live site while the self-hosted images kept working.

Keep the full-resolution source in `client/public/_originals/` and generate the
optimized `.webp` with `scripts/convert-images-to-webp.py`.
