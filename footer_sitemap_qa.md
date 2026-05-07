# Footer Sitemap QA

The site-wide footer sitemap was verified on the live preview for `/approach` after implementation.

## Verification Summary

The browser-captured page text confirms that the footer appears beneath the page CTA and includes the Digital Therapy brand statement, booking/contact actions, and sitemap navigation groups.

## Confirmed Footer Content

| Area | Verified Content |
|---|---|
| Brand context | “Digital Therapy builds private data, workflow, reporting, and automation systems for modern family offices and their advisors.” |
| Primary actions | “Book 30 Min” and “Contact” |
| Sitemap group | “Home,” “Our Approach,” “Capabilities,” and “Thesis” |
| Solutions group | “Operating Layer,” “Security,” “Partner Model,” and “DT Brain” |
| Company group | “Team,” “Contact,” and “Book 30 Min” |
| Copyright line | “© 2026 Digital Therapy. Private operating systems for family offices.” |

## Validation Notes

Vitest, TypeScript checking, and the production build completed successfully before this live-preview verification. The footer is integrated at the app shell level, so it should render consistently across public routes rather than only on the Our Approach page.
