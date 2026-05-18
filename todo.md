# DT Brain Page Implementation Checklist

- [x] Extract the text content from the uploaded DT Brain PDF without re-opening the attached image file.
- [x] Use the visible user-provided slide preview as the first-slide content reference without using image-view tooling.
- [x] Review the current website routing and homepage navigation implementation.
- [x] Add a dedicated `/dt-brain` page that matches the existing premium light Digital Therapy visual system.
- [x] Integrate the DT Brain page into the main navigation and relevant calls to action.
- [x] Validate TypeScript, production build, and browser rendering.
- [x] Save a checkpoint and deliver the updated website version to the user.

# Team Page Implementation Checklist

- [x] Visit the provided Digital Therapy team URL, capture the available team member names and titles, and document that individual bios/profile image references were unavailable or not relied upon from the source page.
- [x] Save the sourced team information in a structured local notes file for implementation traceability.
- [x] Add a dedicated `/team` route and Team page component matching the current premium light website style.
- [x] Integrate the Team page into the main navigation and relevant internal links.
- [x] Validate TypeScript, production build, route rendering, and image availability.
- [x] Save a checkpoint and deliver the updated website version to the user.

# Navigation Logo Size Update

- [x] Increase the Digital Therapy logo height in the navigation header across Home, DT Brain, and Team pages.
- [x] Validate that the larger logo does not crowd the header, overlap nav links, or reduce CTA clarity.
- [x] Run TypeScript/build validation after the logo size change.
- [x] Save a new checkpoint and deliver the updated version link.

# Team Headshot Update

- [x] Upload the seven user-provided headshot files through the web asset workflow without re-opening the image previews.
- [x] Map the initially uploaded headshot set and document the later correction that the seventh image belongs to Kennedy Kraner rather than Stan Gretov.
- [x] Update the Team page so the matched headshots appear on the corresponding existing team entries.
- [x] Validate TypeScript, production build, and live Team page rendering.
- [x] Save a new checkpoint and deliver the updated website version to the user.

# Corrected Team Headshot Mapping

- [x] Remap the seventh uploaded headshot from Stan Gretov to Kennedy Kraner.
- [x] Add Kennedy Kraner’s bookkeeper bio to the Team page entry.
- [x] Ensure Stan Gretov remains listed without the seventh headshot unless another image is provided.
- [x] Validate the corrected headshot mapping, build, and Team page rendering before saving a checkpoint.

# Correct Rick Toussaint and Stan Gretov Headshots

- [x] Copy Rick Toussaint's provided headshot from `/home/ubuntu/upload/pasted_file_yadhTp_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/rick-toussaint.png` without re-viewing the image.
- [x] Copy Stan Gretov's provided headshot from `/home/ubuntu/upload/pasted_file_1RG68F_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/stan-gretov.png` without re-viewing the image.
- [x] Copy Kennedy Kraner's explicitly confirmed headshot from `/home/ubuntu/upload/pasted_file_YqJSua_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/kennedy-kraner.png` without re-viewing the image.
- [x] Upload the copied Rick Toussaint, Stan Gretov, and Kennedy Kraner headshots through the web asset workflow and capture the returned `/manus-storage/` paths.
- [x] Update `/home/ubuntu/digital-therapy-website/client/src/pages/Team.tsx` so Rick Toussaint, Stan Gretov, and Kennedy Kraner use their correct returned headshot paths.
- [x] Remove the duplicate Harry Dublinsky card from the alliances/advisors section so he is not listed twice on the Team page.
- [x] Update `/home/ubuntu/digital-therapy-website/team_headshot_mapping.md` with the confirmed mappings for Rick Toussaint, Stan Gretov, and Kennedy Kraner.
- [x] Run TypeScript and production build validation with `pnpm check && pnpm build`.
- [x] Confirm the `/team` page renders the corrected Rick Toussaint, Stan Gretov, Kennedy Kraner cards and removes Harry Dublinsky from Alliances & Advisors.
- [x] Save a new checkpoint and deliver the updated version.

# Add Vadim Litvak, Valerio Mirof, and Geoff Horn Headshots

- [x] Copy Vadim Litvak's explicitly confirmed headshot from `/home/ubuntu/upload/pasted_file_esI3jh_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/vadim-litvak.png` without re-viewing the image.
- [x] Copy Valerio Mirof's explicitly confirmed headshot from `/home/ubuntu/upload/pasted_file_4Qyn6P_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/valerio-mirof.png` without re-viewing the image.
- [x] Copy Geoff Horn's explicitly confirmed headshot from `/home/ubuntu/upload/pasted_file_8K9TvX_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/geoff-horn.png` without re-viewing the image.
- [x] Upload the copied Vadim Litvak, Valerio Mirof, and Geoff Horn headshots through the web asset workflow and capture the returned `/manus-storage/` paths.
- [x] Update `/home/ubuntu/digital-therapy-website/client/src/pages/Team.tsx` so Vadim Litvak, Valerio Mirof, and Geoff Horn use their correct returned headshot paths.
- [x] Update `/home/ubuntu/digital-therapy-website/team_headshot_mapping.md` with the confirmed mappings for Vadim Litvak, Valerio Mirof, and Geoff Horn.
- [x] Run TypeScript and production build validation.
- [x] Confirm the `/team` page renders the corrected Vadim Litvak, Valerio Mirof, and Geoff Horn cards and that Harry Dublinsky is not duplicated in Alliances & Advisors.
- [x] Save a new checkpoint and deliver the updated version.

# Add Book 30 Min CTA

- [x] Locate existing CTA text, navigation labels, and landing-page CTA sections that should be updated or extended.
- [x] Add a compelling “Book 30 Min” CTA for family office leaders and advisors, emphasizing pain-point discovery, first-value prioritization, and a tour of successful custom solutions used by discerning NYC family offices.
- [x] Ensure the CTA interaction is clear and consistent with the current frontend pattern, without adding unsupported backend functionality.
- [x] Validate the updated frontend with TypeScript and production build checks.
- [x] Visually inspect the relevant page or pages where the CTA appears.
- [x] Save a new checkpoint and deliver the updated version.

# Replace Email-Launching CTAs with Form and Booking Widget

- [x] Audit all Contact and Book 30 Min CTA destinations across Home, Team, DT Brain, navigation, and footer surfaces.
- [x] Replace Book 30 Min email-launch behavior with an on-site booking experience using the Apollo meeting link: https://app.apollo.io/#/meet/jonathan_kobrin_67f/30-min
- [x] Replace Contact email-launch behavior with an on-site contact form experience that does not open the visitor’s email client.
- [x] Ensure the contact form clearly handles submissions without misleading users about delivery until backend or form-service routing is connected.
- [x] Validate TypeScript and production build checks after the interaction changes.
- [x] Visually inspect the updated Contact and Book 30 Min flows in the live preview.
- [x] Save a checkpoint and deliver the updated version.

# Homepage Headline Copy Update

- [x] Verify the homepage hero headline was updated from “One private operating layer for modern family offices.” to “Private operating solutions for modern family offices.”
- [x] Validate the homepage copy change does not introduce source, TypeScript, build, or preview issues.
- [x] Save a new checkpoint for the verified visual-edit update.

# Homepage Headline Copy Update — Data Solutions

- [x] Verify the homepage hero headline was updated from “Private operating solutions for modern family offices.” to “Private data solutions that empower family offices.”
- [x] Validate the revised homepage headline does not introduce source, TypeScript, build, test, or live-preview issues.
- [x] Save a new checkpoint for the verified revised headline update.

# Homepage Hero Subheadline Data Intelligence Update

- [x] Update the homepage hero subheadline to emphasize data intelligence and practical benefits for family offices.
- [x] Verify the updated subheadline appears correctly in the homepage source and live preview.
- [x] Validate the copy update with TypeScript, production build, and existing tests.
- [x] Save a new checkpoint for the verified hero subheadline update.

# Thesis Page Implementation

- [x] Create a new `/thesis` page presenting The Problem and Digital Therapy’s Solution from the user-provided pasted content.
- [x] Integrate the Thesis page into the public site navigation across Home, DT Brain, and Team pages.
- [x] Ensure the page matches the existing premium light Digital Therapy visual system and remains responsive.
- [x] Validate the Thesis page with TypeScript, production build, existing tests, and live preview checks.
- [x] Save a new checkpoint for the verified Thesis page update.

# Home Page Visual Edit Verification

- [x] Review the deterministic visual edits applied to `client/src/pages/Home.tsx` and confirm they match the requested copy and typography changes.
- [x] Validate the updated Home page with TypeScript, existing tests, production build, and development environment status.
- [x] Save a new checkpoint for the verified Home page visual edits.

# Fusion Team Model Function Leader Copy Update

- [x] Replace the Operations, Accounting, and Technology box descriptions in the Home page Fusion Team Model section with the user-provided expanded function-leader copy.
- [x] Add or integrate the Traditional Options vs. DT's Fusion Teams contrast copy in the same section without breaking the existing premium layout.
- [x] Validate the updated Home page with TypeScript, Vitest, production build, and development environment status.
- [x] Save a new checkpoint for the verified Fusion Team Model copy update.

# Capabilities Page Migration

- [x] Move the existing Capabilities content from the Home page into a dedicated `/capabilities` page.
- [x] Add the user-provided Typical Customer Requests content to the dedicated Capabilities page.
- [x] Update site navigation across Home, Thesis, DT Brain, Team, and related headers so Capabilities links to `/capabilities` instead of the Home page anchor.
- [x] Preserve the premium Digital Therapy visual system and ensure the new page remains responsive.
- [x] Validate the updated site with TypeScript, Vitest, production build, and development environment status.
- [x] Save a new checkpoint for the verified Capabilities page migration.

# Our Approach Page Implementation

- [x] Locate the existing “Meet the team” CTA and change its label to “Understand our approach.”
- [x] Create a new `/approach` page that opens from the updated CTA.
- [x] Add Section 1, “Discovery,” with the Diagnostics-First framing and the eight user-provided Discovery process parts.
- [x] Wire the new Our Approach route into the application router without disrupting existing public navigation.
- [x] Preserve the premium Digital Therapy visual system and ensure the page remains responsive.
- [x] Add or update tests that verify the new route, CTA label, and Discovery content.
- [x] Validate the updated site with TypeScript, Vitest, production build, and development environment status.
- [x] Save a new checkpoint for the verified Our Approach page update.

# Discovery Process Output Deliverables Update

- [x] Add the Discovery Process output section to `/approach` with the three deliverables: Graded Priorities List; Visualized Operations | Current State with Pain Points Heat Map + New State; and Project Plan | Implementation Roadmap.
- [x] Include the detailed Current State Mapping, Operational Heat Map, Future State Design, and implementation-roadmap sub-deliverables exactly in the Our Approach page content.
- [x] Preserve the existing premium Digital Therapy page style and responsive layout while adding the new Discovery outputs content.
- [x] Update or extend tests to verify the Discovery output deliverables appear in the source.
- [x] Validate the updated site with Vitest, TypeScript, production build, and development environment status.
- [x] Save a new checkpoint for the verified Discovery Process outputs update.

# AP & AR Close-System Redesign Section

- [x] Add Section 2 to the Our Approach page for AP & AR close-system redesign, preserving the client context that offices often operate 15 to 30+ days behind, DT redesigns close systems and processes, DT often builds custom tools to reduce monthly close burden, and the target outcome is closing in the first 3–5 days of the next month.
- [x] Update approach page test coverage to assert the new AP & AR close-system redesign content.
- [x] Validate the AP & AR Our Approach update with Vitest, TypeScript, production build, live preview, and environment health checks before checkpointing.

# AP & AR Case-Study Impact Example

- [x] Add a brief case-study style example beneath the AP & AR section that illustrates the before-state, DT intervention, and measurable-style impact without presenting fictional client data as verified fact.
- [x] Update approach page test coverage to assert the new AP & AR case-study example content.
- [x] Validate the case-study example update with Vitest, TypeScript, production build, live preview, and environment health checks before checkpointing.

# Site-Wide Footer Sitemap

- [x] Add a reusable site-wide footer with sitemap links for the main public pages: Home, Approach, Capabilities, Thesis, DT Brain, Team, Contact, and Book 30 Min.
- [x] Integrate the footer across the Digital Therapy public pages without disrupting the existing premium light visual system, navigation, CTAs, or responsive layouts.
- [x] Add or update test coverage to verify the footer sitemap component and links are present.
- [x] Validate the footer sitemap update with Vitest, TypeScript, production build, live preview, and environment health checks before checkpointing.

# Footer Sitemap Remediation

- [x] Remove any legacy page-specific footers, including the existing footer in the Capabilities page, so the reusable SiteFooter is the single footer across public routes.
- [x] Verify the reusable footer on Home, Capabilities, Thesis, DT Brain, and Team live previews to confirm there are no duplicate footers or layout/CTA regressions.

# Top Navigation Operating Layer Removal

- [x] Remove the “Operating Layer” item from the top navigation across the Digital Therapy public site while preserving the existing footer sitemap and page content.
- [x] Validate the navigation update with tests, TypeScript, production build, preview, and environment health checks before checkpointing.

# Partner Model Button Relocation

- [x] Remove the “Partner model” button from the Home page top navigation while keeping the primary Book 30 Min CTA in the header.
- [x] Add the “Partner model” button to the Partners section so visitors can access the partner-model modal in contextual content.
- [x] Validate the relocation with Vitest, TypeScript, production build, live preview, and environment health checks before checkpointing.

# Contact Detail Sizing Update

- [x] Increase the visual size of the displayed email and phone number while preserving the existing contact content and layout hierarchy.
- [x] Validate the contact detail sizing update with tests, TypeScript, production build, preview, and environment health checks before checkpointing.

# Top Menu Link Reorder

- [x] Reorder the top menu page links to Thesis, Capabilities, DT Brain, Security, Team, Partners while preserving existing link destinations and labels.
- [x] Validate the reordered menu with regression tests, TypeScript, production build, live preview, and environment health checks before checkpointing.

# Responsive Top Navigation Fix

- [x] Fix the public top navigation so menu links remain accessible when the website width is reduced.
- [x] Preserve the requested page-link order: Thesis, Capabilities, DT Brain, Security, Team, Partners across desktop and narrow-width navigation.
- [x] Validate the responsive navigation fix with regression tests, TypeScript, production build, live preview, and environment health checks before checkpointing.

# Collaboration Thesis Callout

- [x] Add the sentence “For more on this topic, check out our Thesis Page.” after the paragraph beneath “Collaboration cannot be an afterthought.”
- [x] Add a “View Our Thesis” button linking to the Thesis page in the same section.
- [x] Validate the callout update with regression tests, TypeScript, production build, preview, and environment health checks before checkpointing.

# Approach Menu Link Update

- [x] Add an “Approach” link to the public site menu immediately after “Capabilities.”
- [x] Preserve the existing desktop and reduced-width responsive menu behavior after adding the Approach link.
- [x] Validate the Approach menu update with regression tests, TypeScript, production build, preview, and environment health checks before checkpointing.

# Footer Company Column Alignment

- [x] Adjust the footer Company column so the Contact and Book 30 Min links are evenly laid out with the adjacent sitemap columns.
- [x] Preserve the existing footer visual style, responsive behavior, and CTA destinations while fixing the spacing.
- [x] Validate the footer alignment fix with regression coverage, TypeScript, production build, preview, and environment health checks before checkpointing.

# Homepage Hero CTA Layout Update

- [x] Move the blue Book 30 Min button from beneath the left-side welcome copy to the right side beneath the hero image.
- [x] Make the relocated Book 30 Min button more prominent and wide enough to keep its label on one line.
- [x] Change the hero button label from “Explore the operating layer” to “View our capabilities” while preserving the intended navigation destination to capabilities.
- [x] Validate the hero CTA layout update with regression coverage, TypeScript, production build, preview, and environment health checks before checkpointing.

# Homepage Data Empowerment Copy Update

- [x] Change the homepage section headline from “A coherent layer above fragmented systems” to “Data Empowerment in four steps.”
- [x] Replace the four step-box titles with “01 Search & Find,” “02 Connect & Pull,” “03 Clean & Structure,” and “04 Analyze & Leverage.”
- [x] Preserve the existing section layout, visual style, and responsive behavior while updating the copy.
- [x] Validate the Data Empowerment copy update with regression coverage, TypeScript, production build, preview, and environment health checks before checkpointing.

# Homepage Data Empowerment Step Context Update

- [x] Add a short explanatory sentence beneath each of the four Data Empowerment step titles on the homepage.
- [x] Preserve the existing four-step section layout, quiet-luxury visual system, and responsive behavior while adding the context sentences.
- [x] Update regression coverage to verify the new explanatory sentences are present in the homepage source.
- [x] Validate the step-context update with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Homepage Data Empowerment Mobile Card Spacing Refinement

- [x] Adjust mobile spacing and padding of the four Data Empowerment step cards for a cleaner, more readable stacked layout.
- [x] Preserve the desktop four-card layout, quiet-luxury visual system, and existing content while refining mobile responsiveness.
- [x] Update regression coverage to verify the responsive spacing and padding classes for the Data Empowerment cards.
- [x] Validate the mobile spacing refinement with Vitest, TypeScript, production build, mobile preview, and environment health checks before checkpointing.

# Homepage Engagement Section Removal

- [x] Remove the homepage section titled “How engagements begin — Diagnose first. Then build.”
- [x] Delete the three boxes beneath the section titled “Diagnostic Briefing,” “Discovery Sprint,” and “Focused Pilot.”
- [x] Remove related unused homepage data or code while preserving surrounding homepage layout and visual continuity.
- [x] Update regression coverage to verify the removed engagement section and boxes no longer appear in the homepage source.
- [x] Validate the engagement-section removal with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Homepage Hero Copy and CTA Update

- [x] Update the hero headline in Home.tsx to title-cased "Tech, Ops + Accounting Solutions for Family Offices." and reduce the responsive font-size clamp so the upper bound is approximately 75px.
- [x] Update the hero paragraph in Home.tsx to the confirmed new copy about delivering accounting-firm value, comprehending the client's eco-system and unique nuances, achieving collective understanding, and sending a team on-site for the first two to four weeks.
- [x] Rename the two secondary hero CTAs to "Learn what DT can do" (linking to the operating-layer section) and "What is DT Brain?" (linking to the DT Brain page) while keeping the primary "Book 30 Min" CTA unchanged.
- [x] Update regression coverage so the homepage tests assert the new hero headline, paragraph, CTA labels, and tighter font-size clamp.
- [x] Validate the hero copy and CTA update with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Thesis Page Heading and Consistency Update

- [x] Update the Thesis heading in Thesis.tsx from "Family offices need one integrated team for one interconnected systems problem." to "Family offices need one team to tackle one systems problem." with single spacing and no hyphen.
- [x] Reword related Thesis page copy that referenced the previous "integrated team" or "interconnected systems" framing so the page reads consistently with the new heading.
- [x] Update regression coverage so the Thesis page tests assert the new heading and any reworded supporting copy.
- [x] Validate the Thesis heading and consistency update with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Thesis Hero Paragraph Visual Edit

- [x] Verify the Thesis hero paragraph in Thesis.tsx now reads the confirmed "one Fusion Team — custom built and trained..." copy with the softened "And these days, that includes basically everything." closing line.
- [x] Update regression coverage so the Thesis page tests assert the new hero paragraph and that the previous "one Fusion Pod" hero copy is removed.
- [x] Validate the Thesis hero paragraph update with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Thesis Page Fusion Pod -> Fusion Team Cleanup

- [x] Replace every remaining "Fusion Pod" mention in client/src/pages/Thesis.tsx with "Fusion Team", preserving sentence structure and surrounding copy.
- [x] Update regression coverage so server/thesis.page.test.ts asserts the new "Fusion Team" copy and explicitly fails if any "Fusion Pod" string returns to Thesis.tsx.
- [x] Validate the Fusion Pod -> Fusion Team cleanup with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Two-Track Discovery Restructure

- [x] Survey every existing "Discovery" reference across the site (Approach, Home, DT Brain, Capabilities, Thesis, Team, Partners, Security, footer/sitemap, and tests) and capture exact current copy for each location. (Survey result: substantive Discovery copy lives only on the Approach page; other pages reference Discovery only as nav labels or output narrative, with no track-specific copy that needs migration.)
- [x] Propose the new two-track Discovery copy ("Technology Discovery" lead by the Technology SME and "Finance & Accounting Discovery" lead by the Finance + Accounting SME, with the Operations & Process SME splitting time across both, all three on-site for two to four weeks and present in every kickoff and review) and confirm wording with the user.
- [x] Treat the Approach page as the canonical home for the two-track Discovery section (parallel tracks, on-site framing, swim-lane / future-state architecture detail).
- [x] Update shorter Discovery references on Home, DT Brain, Capabilities, Thesis, and any other pages so they match the new two-track structure. (Verified survey above: no other page currently carries single-track Discovery copy that conflicts with the new model.)
- [x] Update regression coverage so the relevant page tests assert the new two-track Discovery copy and that the previous single-track Discovery wording is removed.
- [x] Validate the two-track Discovery restructure with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Founder Card Click-To-Story On Team Page

- [x] Read the Team page and inventory existing dialog/modal patterns (e.g. ManusDialog, shadcn/ui Dialog) to align the founder-story interaction with the rest of the site.
- [x] Draft Jonathan Kobrin's founder story copy (entrepreneurship + software background, EisnerAmper Director of Software Solutions & Transformation 2021-2024, Fusion Team origin) and confirm the wording with the user before implementing.
- [x] Make Jonathan Kobrin's Team card clickable so opening it presents the confirmed founder story in an accessible dialog (keyboard reachable, focus trapped, escape closes).
- [x] Update regression coverage so the Team page tests assert the clickable founder card, the dialog trigger, and the founder story content.
- [x] Validate the founder card click-to-story update with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Top Nav Logo Size Increase

- [x] Find every top-nav logo declaration across pages and shared components (Home, Thesis, OurApproach, DTBrain, Capabilities, Security, Team, Partners, NotFound, footer/sitemap, and any Header component) so the size increase is applied consistently. (Survey result: top-nav logo is centralized in PublicHeader.tsx with a desktop slot and a mobile-sheet slot; SiteFooter has its own logo intentionally left unchanged.)
- [x] Increase the top-nav logo height by 50% (h-10 → h-[60px], lg:h-11 → lg:h-[66px]) for both the desktop header and the mobile sheet, preserving `object-contain`.
- [x] Add or update regression coverage so the relevant page tests assert the new top-nav logo size and explicitly fail if the previous size returns.
- [x] Validate the top-nav logo enlargement with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.

# Fusion Team Model Headline Swap

- [x] Locate the Fusion Team Model section's current "The handoff problem is the transformation problem." headline and its subheadline, plus the black callout block with "Collaboration cannot be an afterthought."
- [x] Confirm the exact replacement copy with the user (use the black callout copy as the new headline and subheadline; decide what to do with the now-redundant black callout).
- [x] Replace the headline and subheadline in the Fusion Team Model section with the confirmed "Collaboration cannot be an afterthought." copy and remove the redundant black callout, relocating the View Our Thesis link beneath the new subheadline.
- [x] Update regression coverage so the relevant page tests assert the new headline/subheadline and explicitly fail if the previous "handoff problem is the transformation problem" copy returns.
- [x] Validate the Fusion Team Model headline swap with Vitest, TypeScript, production build, preview, and environment health checks before checkpointing.
