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

## Corrected Rick, Stan, Kennedy, and duplicate Harry QA — May 05, 2026

Opened the live `/team` preview after applying the user-confirmed Rick Toussaint, Stan Gretov, and Kennedy Kraner image assignments. The first viewport showed the Team page loading normally with the existing hero and navigation. After scrolling into the leadership section, the leadership cards for Jonathan Kobrin, Milton Rodas, and Hunter Atkins rendered with headshots, and the enlarged navigation logo remained aligned. Further inspection is still required lower on the page for Kennedy Kraner, Rick Toussaint, Stan Gretov, and the alliances/advisors section after the duplicate Harry removal.

The Specialist Benches section was inspected after the latest corrections. Kennedy Kraner’s card displays her newly confirmed headshot, Bookkeeper role label, and the beginning of the provided bio. Rick Toussaint, CPA displays his newly confirmed headshot in the Accounting & Reporting group with the Tax + Pubco Reporting role label. Stan Gretov displays his newly confirmed headshot under Engineering & Digital Growth with the Team Lead: Websites + BPO role label. The Accounting & Reporting group still contains a single Harry Dublinsky, CPA card, which is expected; the duplicate advisor/alliance listing has been removed from the data and still requires bottom-section confirmation.

## Additional Vadim, Valerio, and Geoff headshot QA — May 05, 2026

After the latest Team page update, the live `/team` preview loaded successfully. The top of the page retained the intended Digital Therapy light ivory visual system and fixed navigation. A first scroll inspection confirmed the leadership cards still render correctly with headshots for Jonathan Kobrin, Milton Rodas, and Hunter Atkins before continuing toward the specialist benches where the newly updated Vadim Litvak and Valerio Mirof headshots should appear.

The next specialist-benches viewport showed the Accounting & Reporting area rendering correctly after the latest updates. Kennedy Kraner and Rick Toussaint, CPA are visible with their confirmed headshots, role labels, and card spacing intact. The page still shows no visible horizontal overflow or header overlap in this inspected position.

The Engineering & Digital Growth viewport was inspected in live preview. Stan Gretov displays the user-confirmed headshot, Vadim Litvak displays the newly confirmed headshot with the Director of SEO role label, and Valerio Mirof displays the newly confirmed headshot with the Engineer role label. The surrounding card system, role typography, and blue image treatment remain consistent with the rest of the Team page. The Accounting & Reporting area above still shows a single Harry Dublinsky, CPA card, which is expected and not a duplicate advisor entry.

The Alliances & Advisors section was inspected in the live preview. Geoff Horn now displays the newly confirmed headshot in the Payments card. Bruce Ditman and Liron David remain visible with advisor cards, and Harry Dublinsky is no longer present in this advisors section, eliminating the duplicate listing while preserving the single Harry Dublinsky, CPA card in Accounting & Reporting.
