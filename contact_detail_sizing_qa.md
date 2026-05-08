# Contact Detail Sizing QA

Live preview URL: https://3000-ibhiqf4egke1mzoe64d3i-ab353b9c.us2.manus.computer/

Date: 2026-05-08

Finding: The Home page booking section displays `hello@digitaltherapy.io · 1 (917) 495-0455` below the Book 30 Min and Discuss our pain points buttons. The contact line now appears materially larger and more prominent than its prior small-caption treatment, using the display typeface and responsive clamp sizing. The top navigation, hero content, and CTA layout remain visible and unaffected in the preview.

Validation evidence:

- Source change confirmed in `client/src/pages/Home.tsx`.
- Regression coverage added in `server/footer.sitemap.test.ts`.
- Validation passed with `pnpm test`, `pnpm check`, and `pnpm build`.
- Development server health check reported running status with no LSP or TypeScript errors.
- Visual preview screenshot captured at `/home/ubuntu/screenshots/3000-ibhiqf4egke1mzo_2026-05-08_00-38-16_9855.webp`.
