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

const expectedTopMenuOrder = ["Thesis", "Capabilities", "Process", "DT Brain", "Security", "Team"];

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

  it("orders top-menu page links as Thesis, Capabilities, Process, DT Brain, Security, Team", () => {
    const headerSource = readProjectFile("client/src/components/PublicHeader.tsx");
    const navSource = extractTopMenuSource(headerSource);

    expect(navSource, "PublicHeader should expose a primary top-menu source").toBeTruthy();
    expectTopMenuOrder(navSource);
    expect(navSource).toContain('{ label: "Process", href: "/approach" }');
    expect(navSource).not.toContain('{ label: "Approach", href: "/approach" }');
    expect(navSource).not.toContain("Home");
    expect(navSource).not.toContain("Operating Layer");
    expect(navSource).not.toContain("#operating-layer");
    expect(navSource).not.toContain('label: "Partners"');
    expect(navSource).not.toContain("#partners");

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

  it("renders Book 30 Min and Contact as full button variants under Team in the Company column", () => {
    const footerSource = readProjectFile("client/src/components/SiteFooter.tsx");

    // Standalone button block (previously rendered next to the logo paragraph) is gone.
    expect(footerSource).not.toMatch(
      /<div className="mt-7 flex flex-col gap-3 sm:flex-row">[\s\S]*?<BookingWidgetDialog label="Book 30 Min" icon="arrow" \/>/,
    );
    expect(footerSource).not.toContain(
      '<BookingWidgetDialog label="Book 30 Min" icon="arrow" />',
    );

    // Company-column rows now render the prominent button variants in place of the text link counterparts.
    expect(footerSource).toMatch(
      /if \(link\.href === "#book"\) \{[\s\S]*?<BookingWidgetDialog[\s\S]*?label=\{link\.label\}[\s\S]*?icon="arrow"[\s\S]*?className="w-full justify-center"/,
    );
    expect(footerSource).toMatch(
      /if \(link\.href === "#contact"\) \{[\s\S]*?<ContactFormDialog[\s\S]*?variant="secondary"[\s\S]*?label=\{link\.label\}[\s\S]*?context="footer sitemap inquiry"[\s\S]*?icon="message"[\s\S]*?className="w-full justify-center bg-white\/55"/,
    );

    // Legacy text-link versions of the dialogs are no longer used.
    expect(footerSource).not.toContain('variant="text"');
    expect(footerSource).not.toContain('context="footer sitemap contact link"');
    expect(footerSource).not.toContain("className={footerDialogLinkClasses}");

    // Team still appears immediately before Contact and Book 30 Min in the Company group.
    const companyGroup = footerSource.match(/title: "Company",[\s\S]*?\],/)?.[0] ?? "";
    expect(companyGroup).toBeTruthy();
    const teamIdx = companyGroup.indexOf('label: "Team"');
    const contactIdx = companyGroup.indexOf('label: "Contact"');
    const bookIdx = companyGroup.indexOf('label: "Book 30 Min"');
    expect(teamIdx).toBeGreaterThanOrEqual(0);
    expect(contactIdx).toBeGreaterThan(teamIdx);
    expect(bookIdx).toBeGreaterThan(contactIdx);
  });

  it("includes sitemap groups, primary routes, and footer actions", () => {
    const footerSource = readProjectFile("client/src/components/SiteFooter.tsx");

    [
      "aria-labelledby=\"footer-sitemap-heading\"",
      "Sitemap",
      "Solutions",
      "Company",
      "Home",
      "Process",
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
      "Digital Therapy builds private data, workflow, reporting, and automation systems for modern family offices & family office operated businesses.",
      "Understand our process",
    ].forEach((footerText) => {
      expect(footerSource).toContain(footerText);
    });

    expect(footerSource).not.toContain(
      "Digital Therapy builds private data, workflow, reporting, and automation systems for modern family offices and their advisors.",
    );
    expect(footerSource).not.toContain('{ label: "Our Approach", href: "/approach" }');
    expect(footerSource).not.toContain("Understand our approach");
  });

  it("renders the footer Digital Therapy logo at 4x the previous size (h-40)", () => {
    const footerSource = readProjectFile("client/src/components/SiteFooter.tsx");

    expect(footerSource).toContain(
      '<img src={logoUrl} alt="Digital Therapy" className="h-40 w-auto object-contain" />',
    );
    expect(footerSource).not.toContain(
      '<img src={logoUrl} alt="Digital Therapy" className="h-10 w-auto object-contain" />',
    );
  });

  it("keeps routed public pages free of legacy page-specific footers", () => {
    publicPagePaths.forEach((relativePath) => {
      const pageSource = readProjectFile(relativePath);
      expect(pageSource).not.toContain("<footer");
      expect(pageSource).not.toContain("</footer>");
    });
  });
});
