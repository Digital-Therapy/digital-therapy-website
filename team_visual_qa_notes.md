# Team Page Visual QA Notes

## Initial hero viewport

The `/team` page loads successfully in the live preview. The fixed ivory navigation appears at the top with Home, DT Brain, Team, Contact, and a blue “Meet the fusion team” CTA. The hero uses the premium light/ivory visual language, charcoal display typography, and a boardroom visual in the right column. The hero copy and CTAs are visible, with good contrast against the light background.

## Leadership and fusion model viewport

After scrolling down one viewport, the leadership cards for Jon Kobrin, Milton Rodas, and Hunter Atkins, CPA render in a three-column layout with initials, roles, and descriptions. The fusion model section renders below with a left editorial text column and three white principle modules for Technology, Operations, and Accounting. The layout remains consistent with the quiet luxury private-banking aesthetic and no obvious clipping or overflow is visible in the inspected viewport.

## Specialist benches viewport

The Specialist Benches section renders correctly with the ivory/off-white card system. The Accounting & Reporting group displays the sourced bookkeeper, tax/reporting, and real-estate accounting members. The Engineering & Digital Growth and Transformation & Automation benches also render in responsive two-column member grids, with initials-based placeholders avoiding unreliable external headshots. Typography, spacing, and blue accent icon treatments remain visually consistent with the homepage and DT Brain page.

## Advisor and CTA area preview

Further scrolling shows the Alliances & Advisors heading and the lower CTA area beginning to render. No visible horizontal overflow, missing images, or broken nav state appeared during the inspected scroll positions. The browser preview banner remains at the bottom because the site is in preview mode, not because of website code.

## Bottom viewport

At the bottom of `/team`, the advisor cards for Geoff Horn, Harry Dublinsky, Bruce Ditman, and Liron David render cleanly in a four-column row on desktop. The final dark CTA section preserves the allowable dark-footer treatment, with visible white headline text, Digital Therapy blue accents, four contextual engagement tiles, and working CTA links. The page reaches the bottom without layout breakage or visible horizontal overflow.

## Navigation validation

The Team page header successfully navigates to `/dt-brain`, and the DT Brain page header now includes a Team link that successfully returns to `/team`. The subpage navigation is therefore consistent between DT Brain and Team, while the homepage navigation also includes the new Team link in its primary nav array.

## Navigation logo size update QA

The homepage preview shows the enlarged navigation logo rendering at the new responsive size without crowding the primary navigation links or the right-side briefing CTA. The fixed header remains 80px tall, the logo remains aligned vertically, and the larger brand mark improves visibility while preserving the existing quiet-luxury spacing system. TypeScript and production build validation passed after using `pnpm check && pnpm build`; an earlier shorthand command was rejected by pnpm and replaced with the correct scripts.

## Corrected team headshot update QA — May 05, 2026

Live preview reviewed at `/team` after the corrected headshot update. TypeScript and production build validation passed. The leadership section displays the mapped headshots for Jonathan Kobrin, Milton Rodas, and Hunter Atkins, CPA in the intended card layout, with no visible header overlap or broken image placeholders in the first inspected viewport after scrolling.

The Specialist Benches section was inspected in live preview after scrolling. Kennedy Kraner now appears in the Accounting & Reporting group with the seventh uploaded headshot, the Bookkeeper role label, and the beginning of the provided property-management accounting bio visible in the card. The image renders as a rounded square thumbnail and aligns cleanly with the updated card structure.

Further live preview inspection confirmed that Harry Dublinsky, CPA displays with the first uploaded headshot in the Accounting & Reporting section. Stan Gretov remains listed under Engineering & Digital Growth with an initials-based card rather than the seventh uploaded headshot, matching the corrected mapping requirement that the last provided image belongs to Kennedy Kraner.

The Alliances & Advisors section was inspected in live preview. Bruce Ditman and Liron David render with their uploaded advisor headshots in the correct cards, with names and Advisor role labels visible beneath the images. Geoff Horn remains an initials/icon-style card, and the separate Harry Dublinsky advisor card remains text-only while the CPA-specific Harry Dublinsky card above carries the uploaded Harry headshot.
