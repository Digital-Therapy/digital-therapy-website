import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

const publicPagePaths = [
  "client/src/pages/Home.tsx",
  "client/src/pages/Capabilities.tsx",
  "client/src/pages/OurApproach.tsx",
  "client/src/pages/DTBrain.tsx",
  "client/src/pages/Team.tsx",
  "client/src/pages/Thesis.tsx",
];

const expectedTopMenuOrder = ["Thesis", "Capabilities", "DT Brain", "Security", "Team", "Partners"];

function extractTopMenuSource(source: string) {
  return source.match(/const primaryNavItems = \[[\s\S]*?\] as const;/)?.[0] ?? "";
}

function expectTopMenuOrder(navSource: string) {
  let cursor = -1;

  expectedTopMenuOrder.forEach((label) => {
    const nextIndex = navSource.indexOf(label, cursor + 1);
    expect(nextIndex, `${label} should appear after the previous top-menu item`).toBeGreaterThan(cursor);
    cursor = nextIndex;
  });
}

describe("Site footer sitemap", () => {
  it("renders the reusable footer across the app shell", () => {
    const appSource = readProjectFile("client/src/App.tsx");

    expect(appSource).toContain('import SiteFooter from "./components/SiteFooter";');
    expect(appSource).toContain("<SiteFooter />");
  });

  it("orders top-menu page links as Thesis, Capabilities, DT Brain, Security, Team, Partners", () => {
    const headerSource = readProjectFile("client/src/components/PublicHeader.tsx");
    const navSource = extractTopMenuSource(headerSource);

    expect(navSource, "PublicHeader should expose a primary top-menu source").toBeTruthy();
    expectTopMenuOrder(navSource);
    expect(navSource).not.toContain("Home");
    expect(navSource).not.toContain("Operating Layer");
    expect(navSource).not.toContain("#operating-layer");

    publicPagePaths.forEach((relativePath) => {
      const pageSource = readProjectFile(relativePath);
      expect(pageSource, `${relativePath} should use the responsive public header`).toContain("<PublicHeader");
    });

    const homeSource = readProjectFile("client/src/pages/Home.tsx");
    expect(homeSource).toContain('id="operating-layer"');
  });

  it("keeps the public menu available at narrower widths through a responsive sheet trigger", () => {
    const headerSource = readProjectFile("client/src/components/PublicHeader.tsx");

    expect(headerSource).toContain('aria-label="Open primary navigation menu"');
    expect(headerSource).toContain("lg:hidden");
    expect(headerSource).toContain("<SheetTrigger asChild>");
    expect(headerSource).toContain("justify-start gap-4");
    expect(headerSource).not.toContain("fixed right-4 top-[1.125rem]");
    expect(headerSource).toContain("Primary mobile navigation");
    expect(headerSource).toContain("<SheetClose key={item.label} asChild>");

    publicPagePaths.forEach((relativePath) => {
      const pageSource = readProjectFile(relativePath);
      expect(pageSource, `${relativePath} should not hide its only navigation behind a desktop-only nav`).not.toContain(
        '<nav className="hidden items-center gap-8 lg:flex"',
      );
    });
  });

  it("moves the Partner model dialog trigger from the header into the Partners section", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");
    const headerSource = homeSource.match(/<PublicHeader[\s\S]*?\/>/)?.[0] ?? "";
    const partnersSource = homeSource.match(/<section id="partners"[\s\S]*?<\/section>/)?.[0] ?? "";

    expect(headerSource).not.toContain('label="Partner model"');
    expect(headerSource).not.toContain('context="partner model discussion"');
    expect(partnersSource).toContain('label="Partner model"');
    expect(partnersSource).toContain('context="partner model discussion"');
  });

  it("renders the Home contact email and phone number with enlarged typography", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    expect(homeSource).toContain("hello@digitaltherapy.io · 1 (917) 495-0455");
    expect(homeSource).toContain("font-display text-[clamp(1.45rem,2.2vw,2.35rem)]");
    expect(homeSource).not.toContain("mt-6 text-sm text-black/48");
  });

  it("includes sitemap groups, primary routes, and footer actions", () => {
    const footerSource = readProjectFile("client/src/components/SiteFooter.tsx");

    [
      "aria-labelledby=\"footer-sitemap-heading\"",
      "Sitemap",
      "Solutions",
      "Company",
      "Home",
      "Our Approach",
      "Capabilities",
      "Thesis",
      "Operating Layer",
      "Security",
      "Partner Model",
      "DT Brain",
      "Team",
      "Contact",
      "Book 30 Min",
      "footer sitemap inquiry",
      "Digital Therapy builds private data, workflow, reporting, and automation systems",
      "Understand our approach",
    ].forEach((footerText) => {
      expect(footerSource).toContain(footerText);
    });
  });

  it("keeps routed public pages free of legacy page-specific footers", () => {
    publicPagePaths.forEach((relativePath) => {
      const pageSource = readProjectFile(relativePath);
      expect(pageSource).not.toContain("<footer");
      expect(pageSource).not.toContain("</footer>");
    });
  });
});
