
## Visual QA observations — May 04, 2026

The homepage renders successfully in the live preview with the intended light ivory/off-white background system, charcoal editorial typography, restrained blue CTA accents, and image-led hero composition. The top navigation is visible, Digital Therapy logo is present, and the hero image appears as a large premium abstract operating-layer visual. The first content section renders with a large boardroom visual on the left and concise explanatory copy on the right, maintaining the requested move away from a text-heavy presentation style.

The operating-layer card section and Fusion Team model section render cleanly, with four concise cards and three discipline blocks. The copy is shorter than the prior deck and the visual hierarchy is stronger, although these middle sections are more typographic than the hero, complexity, capabilities, automation, partner, and CTA sections. The overall design still reads as a premium, light, private-banking style website.

The capabilities section is strongly visual, pairing concise capability labels with a large wealth-map image and ample negative space. The lower automation section begins below the fold and appears to continue the image-led rhythm. The design remains aligned with the user’s request for light backgrounds, black/gray text, and blue accent color.

Technical QA confirms the homepage has the expected title, 11 page sections, 7 header navigation links, and 9 rendered images with zero broken image assets. The browser console showed no client-side runtime errors in the latest output. TypeScript validation and production build completed successfully; the build produced only a standard large-chunk warning from bundled dependencies, not a blocking error.

## DT Brain Page QA — 2026-05-04

The new `/dt-brain` route renders successfully in the live preview. The page displays the requested “Your Secure Automation Hub” positioning, the on-premises Apple M4 Pro automation environment language, local control/privacy messaging, hardware specification row, sandbox architecture, VPN/Tailscale perimeter, and DT Brain briefing calls to action. The visual review confirms that the page follows the existing premium light Digital Therapy style with ivory/off-white surfaces, charcoal typography, and blue accent treatments. TypeScript and production build validation passed before browser review.

## Book 30 Min CTA Visual QA — May 05, 2026

The homepage preview at `/` rendered the updated header and hero CTA as **Book 30 Min** with the established warm ivory background, Digital Therapy blue accent button, and no visible contrast or spacing issue in the first viewport. The extracted page text also confirmed the final conversion section now reads **“Book 30 minutes to find the first high-value win.”** with supporting copy about pain-point discovery, first-value prioritization, and tours of custom operating-layer solutions for discerning New York City family offices.

The Team page preview at `/team` rendered the header CTA and hero CTA as **Book 30 Min** in the same blue button treatment. The final dark conversion section text was updated to **“Book 30 minutes with the team built to find your first high-value win.”** and included the requested pain-point, solution-tour, first-value, and delivery-fit messaging. The first viewport preserved the premium light layout and readable contrast.

The DT Brain preview at `/dt-brain` rendered the updated **Book 30 Min** CTA in both the header and hero area, with the expected product-specific accessible label for discussing DT Brain. The extracted page text confirmed the final conversion section now says **“Book 30 minutes to see where private automation should create value first.”** and includes the requested pain-point, solution-tour, and first-value prioritization language. The first viewport preserved the premium light style, blue accent button, readable contrast, and balanced product imagery.


## Manual visual QA — no-email CTA dialogs

The homepage booking dialog opens as an in-page modal overlay with the Apollo meeting scheduler visible, while the surrounding page is dimmed; this confirms the Book 30 Min action keeps visitors inside the site experience instead of launching an email client.

The homepage contact dialog opens as an in-page contact form modal with visible form fields and a submit button. The form is compact, centered, and visually consistent with the homepage styling, with no `mailto:` behavior visible.

The Team page booking dialog opens above the hero section as a centered Apollo scheduler modal with the background dimmed. The modal inherits the site’s restrained premium feel, keeps the Book 30 Min action on-site, and does not expose or trigger an email launch.

The Team page contact dialog opens as a centered on-site form with visible name, role, organization, email, and message fields plus a clear submit button. A non-destructive status notice is visible near the bottom, indicating the flow remains web-form based rather than email-client based.

The DT Brain page booking dialog opens as a larger centered Apollo scheduler modal over the DT Brain hero section. The modal clearly frames a focused 30-minute briefing, uses the provided Apollo link inside the site experience, and shows no sign of `mailto:` behavior or email-client launch.
