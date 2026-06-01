import { useLocation } from "wouter";
import {
  SITE,
  getRouteMeta,
  canonicalFor,
  absoluteUrl,
  normalizePath,
  ROUTE_META,
} from "@/lib/seo";

/**
 * Build a BreadcrumbList JSON-LD object for a given normalized path.
 * Returns null for the home route (no breadcrumb needed) and for noindex
 * routes (404, etc.) where we don't want to publish trail metadata.
 *
 * All non-home routes get a two-step trail: Home → Current Page. The site
 * has no nested sub-routes today, but if we add /capabilities/entity-mapping
 * (etc.) in the future, this is the spot to extend with intermediate links.
 */
function buildBreadcrumb(pathname: string): unknown | null {
  const path = normalizePath(pathname);
  if (path === "/") return null;
  const meta = ROUTE_META[path];
  if (!meta || meta.noindex) return null;

  // Short, breadcrumb-friendly label — strip the " | Digital Therapy" suffix
  // from the SEO title so the crumb reads naturally in SERP and screen readers.
  const crumbLabel = meta.title.replace(/\s*[|·-]\s*Digital Therapy.*$/i, "").trim();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE.url}/`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": crumbLabel || path,
        "item": `${SITE.url}${path}`,
      },
    ],
  };
}

/**
 * Per-route document metadata. Rendered once (mounted in App), it reads the
 * current wouter location and emits <title>, description, canonical, Open Graph,
 * Twitter tags, AND a per-page BreadcrumbList JSON-LD. React 19 hoists these
 * into <head> automatically -- no react-helmet needed -- and the build-time
 * prerender (scripts/prerender.mjs) captures them into the static HTML for
 * each route so non-JS crawlers and social scrapers see correct per-page tags.
 */
export function RouteSeo() {
  const [pathname] = useLocation();
  const meta = getRouteMeta(pathname);
  const canonical = canonicalFor(pathname);
  const ogImage = absoluteUrl(meta.ogImage ?? SITE.defaultOgImage);
  const type = meta.type ?? "website";
  const breadcrumb = buildBreadcrumb(pathname);

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      {meta.noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content={SITE.twitterCard} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={ogImage} />

      {/* BreadcrumbList JSON-LD — per route. Omitted on home + noindex pages. */}
      {breadcrumb ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        />
      ) : null}
    </>
  );
}
