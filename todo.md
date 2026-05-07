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
