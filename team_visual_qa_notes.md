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
