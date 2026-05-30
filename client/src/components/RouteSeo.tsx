import { useLocation } from "wouter";
import {
  SITE,
  getRouteMeta,
  canonicalFor,
  absoluteUrl,
} from "@/lib/seo";

/**
 * Per-route document metadata. Rendered once (mounted in App), it reads the
 * current wouter location and emits <title>, description, canonical, Open Graph
 * and Twitter tags. React 19 hoists these into <head> automatically -- no
 * react-helmet needed -- and the build-time prerender (scripts/prerender.mjs)
 * captures them into the static HTML for each route so non-JS crawlers and
 * social scrapers see correct, per-page tags.
 */
export function RouteSeo() {
  const [pathname] = useLocation();
  const meta = getRouteMeta(pathname);
  const canonical = canonicalFor(pathname);
  const ogImage = absoluteUrl(meta.ogImage ?? SITE.defaultOgImage);
  const type = meta.type ?? "website";

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
    </>
  );
}
