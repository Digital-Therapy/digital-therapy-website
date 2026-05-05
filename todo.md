# DT Brain Page Implementation Checklist

- [ ] Extract the text content from the uploaded DT Brain PDF without re-opening the attached image file.
- [ ] Use the visible user-provided slide preview as the first-slide content reference without using image-view tooling.
- [ ] Review the current website routing and homepage navigation implementation.
- [ ] Add a dedicated `/dt-brain` page that matches the existing premium light Digital Therapy visual system.
- [ ] Integrate the DT Brain page into the main navigation and relevant calls to action.
- [ ] Validate TypeScript, production build, and browser rendering.
- [ ] Save a checkpoint and deliver the updated website version to the user.

# Team Page Implementation Checklist

- [ ] Visit the provided Digital Therapy team URL and capture the team member names, titles, bios, and available profile image references.
- [ ] Save the sourced team information in a structured local notes file for implementation traceability.
- [ ] Add a dedicated `/team` route and Team page component matching the current premium light website style.
- [ ] Integrate the Team page into the main navigation and relevant internal links.
- [ ] Validate TypeScript, production build, route rendering, and image availability.
- [ ] Save a checkpoint and deliver the updated website version to the user.

# Navigation Logo Size Update

- [ ] Increase the Digital Therapy logo height in the navigation header across Home, DT Brain, and Team pages.
- [ ] Validate that the larger logo does not crowd the header, overlap nav links, or reduce CTA clarity.
- [ ] Run TypeScript/build validation after the logo size change.
- [ ] Save a new checkpoint and deliver the updated version link.

# Team Headshot Update

- [ ] Upload the seven user-provided headshot files through the web asset workflow without re-opening the image previews.
- [ ] Map the uploaded images in order to Harry Dublinsky, Bruce Ditman, Liron David, Jonathan Kobrin, Hunter Atkins, Milton Rodas, and Stan Gretov.
- [ ] Update the Team page so the matched headshots appear on the corresponding existing team entries.
- [ ] Validate TypeScript, production build, and live Team page rendering.
- [ ] Save a new checkpoint and deliver the updated website version to the user.

# Corrected Team Headshot Mapping

- [ ] Remap the seventh uploaded headshot from Stan Gretov to Kennedy Kraner.
- [ ] Add Kennedy Kraner’s bookkeeper bio to the Team page entry.
- [ ] Ensure Stan Gretov remains listed without the seventh headshot unless another image is provided.
- [ ] Validate the corrected headshot mapping, build, and Team page rendering before saving a checkpoint.

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
- [ ] Save a new checkpoint and deliver the updated version.

# Add Vadim Litvak, Valerio Mirof, and Geoff Horn Headshots

- [x] Copy Vadim Litvak's explicitly confirmed headshot from `/home/ubuntu/upload/pasted_file_esI3jh_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/vadim-litvak.png` without re-viewing the image.
- [x] Copy Valerio Mirof's explicitly confirmed headshot from `/home/ubuntu/upload/pasted_file_4Qyn6P_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/valerio-mirof.png` without re-viewing the image.
- [x] Copy Geoff Horn's explicitly confirmed headshot from `/home/ubuntu/upload/pasted_file_8K9TvX_image.png` into `/home/ubuntu/webdev-static-assets/team-headshots/geoff-horn.png` without re-viewing the image.
- [x] Upload the copied Vadim Litvak, Valerio Mirof, and Geoff Horn headshots through the web asset workflow and capture the returned `/manus-storage/` paths.
- [x] Update `/home/ubuntu/digital-therapy-website/client/src/pages/Team.tsx` so Vadim Litvak, Valerio Mirof, and Geoff Horn use their correct returned headshot paths.
- [x] Update `/home/ubuntu/digital-therapy-website/team_headshot_mapping.md` with the confirmed mappings for Vadim Litvak, Valerio Mirof, and Geoff Horn.
- [x] Run TypeScript and production build validation.
- [x] Confirm the `/team` page renders the corrected Vadim Litvak, Valerio Mirof, and Geoff Horn cards and that Harry Dublinsky is not duplicated in Alliances & Advisors.
- [ ] Save a new checkpoint and deliver the updated version.
