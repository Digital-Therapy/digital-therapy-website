import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("Home page content updates", () => {
  it("renders the privacy section with the conditional headline and the extended access-model paragraph", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const securitySectionLabelIndex = homeSource.indexOf("<SectionLabel>Security and control</SectionLabel>");
    const headlineIndex = homeSource.indexOf(
      "If privacy &amp; security are top priority..",
      securitySectionLabelIndex,
    );
    const paragraphIndex = homeSource.indexOf(
      "governed by the office\u2019s access model, infrastructure requirements and data privacy policies.",
      headlineIndex,
    );

    expect(securitySectionLabelIndex).toBeGreaterThanOrEqual(0);
    expect(headlineIndex).toBeGreaterThan(securitySectionLabelIndex);
    expect(paragraphIndex).toBeGreaterThan(headlineIndex);

    expect(homeSource).not.toContain("Privacy isn&apos;t a feature. It&apos;s the foundation.");
    expect(homeSource).not.toContain("Privacy is not a feature. It is the foundation.");
    expect(homeSource).not.toContain(
      "governed by the office\u2019s access model and infrastructure requirements.",
    );
  });

  it("makes the Fusion Team Model section lead with the Collaboration headline and an inline Thesis link", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const sectionIndex = homeSource.indexOf('id="fusion-team"');
    const sectionLabelIndex = homeSource.indexOf("<SectionLabel>Fusion Team model</SectionLabel>", sectionIndex);
    const headlineIndex = homeSource.indexOf("Collaboration can\u2019t be an afterthought.", sectionLabelIndex);
    const subheadlineIndex = homeSource.indexOf(
      "Accountants work with accountants &mdash; Engineers with engineers.",
      headlineIndex,
    );
    const inlineLinkLabelIndex = homeSource.indexOf("For more on this topic, view our Thesis", subheadlineIndex);
    const inlineLinkHrefIndex = homeSource.indexOf('href="/thesis"', subheadlineIndex);

    expect(sectionIndex).toBeGreaterThanOrEqual(0);
    expect(sectionLabelIndex).toBeGreaterThan(sectionIndex);
    expect(headlineIndex).toBeGreaterThan(sectionLabelIndex);
    expect(subheadlineIndex).toBeGreaterThan(headlineIndex);
    expect(inlineLinkLabelIndex).toBeGreaterThan(subheadlineIndex);
    expect(inlineLinkHrefIndex).toBeGreaterThan(subheadlineIndex);

    expect(homeSource).toContain('font-display text-[54px] leading-[0.92] tracking-[-0.06em]');
    expect(homeSource).toContain(
      "There\u2019s no organic pathway for these experts to come together &amp; learn to collaborate effectively.",
    );
    expect(homeSource).toContain('text-[18px] font-medium text-[#0A65FF] transition-colors duration-300 hover:text-[#004ed1]');
    expect(homeSource).toContain('text-[30px] font-normal tracking-[-0.02em] text-[#0A65FF]">{String(index + 1).padStart(2, "0")}');

    expect(homeSource).not.toContain("Collaboration cannot be an afterthought.");
    expect(homeSource).not.toContain("text-[clamp(2.6rem,4.7vw,5.3rem)] leading-[0.92] tracking-[-0.06em]");
    expect(homeSource).not.toContain(
      "Accountants work exclusively with accountants. Engineers with engineers. There is no natural mechanism for these experts to come together.",
    );
    expect(homeSource).not.toContain("text-sm font-semibold text-[#0A65FF] transition-colors duration-300 hover:text-[#004ed1]");
    expect(homeSource).not.toContain("text-[0.72rem] font-bold uppercase tracking-[0.22em] text-black/38");
    expect(homeSource).not.toContain("{index + 1} of 3");
    expect(homeSource).not.toContain("The handoff problem is the transformation problem.");
    expect(homeSource).not.toContain(
      "Digital Therapy uses one integrated team with operations, accounting, & technology expertise in the same room, accountable for the outcome end to end.",
    );
    expect(homeSource).not.toContain("Traditional options vs. DT&apos;s Fusion Teams");
    expect(homeSource).not.toContain("For more on this topic, check out our Thesis Page.");
    expect(homeSource).not.toContain("View Our Thesis");
  });

  it("moves the hero booking CTA beneath the image and uses the new hero CTA labels", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const leftCtaGroupIndex = homeSource.indexOf('className="mt-10 flex flex-col gap-3 sm:flex-row"');
    const capabilitiesHrefIndex = homeSource.indexOf('href="/capabilities"', leftCtaGroupIndex);
    const capabilitiesLabelIndex = homeSource.indexOf("See what DT can do", capabilitiesHrefIndex);
    const dtBrainHrefIndex = homeSource.indexOf('href="/dt-brain"', capabilitiesLabelIndex);
    const dtBrainLabelIndex = homeSource.indexOf("What is DT Brain?", dtBrainHrefIndex);
    const heroImageIndex = homeSource.indexOf('alt="Abstract private operating layer visualization"');
    const compactHeroImageIndex = homeSource.indexOf('aspect-[16/8]', heroImageIndex);
    const desktopOffsetIndex = homeSource.indexOf('lg:-mt-24 xl:-mt-16');
    const imageSideBookingIndex = homeSource.indexOf('context="homepage hero image-side booking"');
    const prominentClassIndex = homeSource.indexOf('whitespace-nowrap px-8 py-4 text-base', imageSideBookingIndex);
    const minWidthIndex = homeSource.indexOf('sm:min-w-[300px]', imageSideBookingIndex);

    expect(leftCtaGroupIndex).toBeGreaterThanOrEqual(0);
    expect(capabilitiesHrefIndex).toBeGreaterThan(leftCtaGroupIndex);
    expect(capabilitiesLabelIndex).toBeGreaterThan(capabilitiesHrefIndex);
    expect(dtBrainHrefIndex).toBeGreaterThan(capabilitiesLabelIndex);
    expect(dtBrainLabelIndex).toBeGreaterThan(dtBrainHrefIndex);
    expect(homeSource).not.toContain("Explore the operating layer");
    expect(homeSource).not.toContain("View our capabilities");
    expect(homeSource).not.toContain("Meet DT Brain");
    expect(homeSource).not.toContain("Learn what DT can do");
    expect(desktopOffsetIndex).toBeGreaterThanOrEqual(0);
    expect(compactHeroImageIndex).toBeGreaterThan(heroImageIndex);
    expect(imageSideBookingIndex).toBeGreaterThan(heroImageIndex);
    expect(prominentClassIndex).toBeGreaterThan(imageSideBookingIndex);
    expect(minWidthIndex).toBeGreaterThan(imageSideBookingIndex);
  });

  it("shortens the 'Why the back office breaks' h2 from 'Complexity creates hidden operating costs.' to 'Complexity creates cost.'", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const sectionLabelIndex = homeSource.indexOf("<SectionLabel>Why the back office breaks</SectionLabel>");
    const headlineIndex = homeSource.indexOf("Complexity creates cost.", sectionLabelIndex);

    expect(sectionLabelIndex).toBeGreaterThanOrEqual(0);
    expect(headlineIndex).toBeGreaterThan(sectionLabelIndex);
    expect(homeSource).not.toContain("Complexity creates hidden operating costs.");
  });

  it("replaces the first complexity-points bullet with the legacy-systems framing", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const constIndex = homeSource.indexOf("const complexityPoints = [");
    const newBulletIndex = homeSource.indexOf(
      'Legacy systems can\\u2019t easily send or receive data or files.',
      constIndex,
    );

    expect(constIndex).toBeGreaterThanOrEqual(0);
    expect(newBulletIndex).toBeGreaterThan(constIndex);
    expect(homeSource).not.toContain(
      "Assets, entities, trusts, accounts, and documents live in separate systems.",
    );
  });

  it("renders the new hero headline, paragraph, and tightened font-size clamp", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const headlineIndex = homeSource.indexOf("Tech, Ops &amp; Accounting Solutions for Family Offices.");
    const paragraphLeadIndex = homeSource.indexOf("We deliver the value you wish you got from accounting firms.");
    const ecosystemIndex = homeSource.indexOf("truly comprehend your eco-system and unique nuances", paragraphLeadIndex);
    const collectiveIndex = homeSource.indexOf("Achieving collective understanding is the key to delivery success.", ecosystemIndex);
    const onSiteIndex = homeSource.indexOf("send a team to work on-site the first two&ndash;four weeks of new engagements", collectiveIndex);

    expect(headlineIndex).toBeGreaterThanOrEqual(0);
    expect(paragraphLeadIndex).toBeGreaterThan(headlineIndex);
    expect(ecosystemIndex).toBeGreaterThan(paragraphLeadIndex);
    expect(collectiveIndex).toBeGreaterThan(ecosystemIndex);
    expect(onSiteIndex).toBeGreaterThan(collectiveIndex);
    expect(homeSource).toContain("max-w-4xl font-display text-[60px] leading-[0.92] tracking-[-0.06em] text-[#111111]");
    expect(homeSource).not.toContain("text-[clamp(2.6rem,5.4vw,4.7rem)] leading-[0.92] tracking-[-0.06em]");
    expect(homeSource).not.toContain("Tech, Ops + Accounting Solutions for Family Offices.");
    expect(homeSource).not.toContain("Private data solutions that empower family offices.");
    expect(homeSource).not.toContain("text-[clamp(3.4rem,7vw,7.7rem)]");
  });

  it("removes the engagement-begin section and its three engagement cards", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    expect(homeSource).not.toContain("How engagements begin");
    expect(homeSource).not.toContain("Diagnose first. Then build.");
    expect(homeSource).not.toContain("Diagnostic Briefing");
    expect(homeSource).not.toContain("Diagnostic briefing");
    expect(homeSource).not.toContain("Discovery Sprint");
    expect(homeSource).not.toContain("Discovery sprint");
    expect(homeSource).not.toContain("Focused Pilot");
    expect(homeSource).not.toContain("Focused pilot");
    expect(homeSource).not.toContain("engageSteps");
    expect(homeSource).not.toContain("GitBranch");

    const partnersIndex = homeSource.indexOf('id="partners"');
    const ctaIndex = homeSource.indexOf("Book 20 min. Let\u2019s find the first win !");

    expect(partnersIndex).toBeGreaterThanOrEqual(0);
    expect(ctaIndex).toBeGreaterThan(partnersIndex);
    expect(homeSource).not.toContain("Book 30 minutes to find the first high-value win.");

    // CTA h2 is pinned to 54px to align with the other h2 sizes in the same composition.
    expect(homeSource).toContain(
      '<h2 className="mt-9 font-display text-[54px] leading-[0.92] tracking-[-0.06em]">',
    );
    expect(homeSource).not.toContain(
      '<h2 className="mt-9 font-display text-[clamp(3rem,6vw,6.6rem)] leading-[0.88] tracking-[-0.07em]">',
    );

    // Contact trigger button under the CTA copy is renamed to the new conversational label.
    expect(homeSource).toContain('label="Let\u2019s talk pain points."');
    expect(homeSource).not.toContain('label="Discuss our pain points"');
  });

  it("updates the operating-layer section to the requested Data Empowerment four-step copy", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const sectionIndex = homeSource.indexOf("Four steps to Data Empowerment.");
    const layersIndex = homeSource.indexOf("const operatingLayers = [");
    const stepOneIndex = homeSource.indexOf('eyebrow: "01"', layersIndex);
    const searchFindIndex = homeSource.indexOf('title: "Search + Find"', stepOneIndex);
    const stepTwoIndex = homeSource.indexOf('eyebrow: "02"', searchFindIndex);
    const connectPullIndex = homeSource.indexOf('title: "Connect + Pull"', stepTwoIndex);
    const stepThreeIndex = homeSource.indexOf('eyebrow: "03"', connectPullIndex);
    const cleanStructureIndex = homeSource.indexOf('title: "Format + Clean"', stepThreeIndex);
    const stepFourIndex = homeSource.indexOf('eyebrow: "04"', cleanStructureIndex);
    const analyzeLeverageIndex = homeSource.indexOf('title: "Query + Report"', stepFourIndex);
    const searchFindCopyIndex = homeSource.indexOf(
      "Locate critical records, accounts, entities, and documents across every system before decisions are made.",
      searchFindIndex,
    );
    const connectPullCopyIndex = homeSource.indexOf(
      "Bring approved source data into one governed workflow without forcing teams to chase down files manually.",
      connectPullIndex,
    );
    const cleanStructureCopyIndex = homeSource.indexOf(
      "Format, reconcile & clean data so it can be used as trusted operating intelligence.",
      cleanStructureIndex,
    );
    const analyzeLeverageCopyIndex = homeSource.indexOf(
      "Turn structured data into reporting, automation, and AI-enabled answers leaders can use.",
      analyzeLeverageIndex,
    );

    expect(sectionIndex).toBeGreaterThanOrEqual(0);
    expect(layersIndex).toBeGreaterThanOrEqual(0);
    expect(searchFindIndex).toBeGreaterThan(stepOneIndex);
    expect(connectPullIndex).toBeGreaterThan(stepTwoIndex);
    expect(cleanStructureIndex).toBeGreaterThan(stepThreeIndex);
    expect(analyzeLeverageIndex).toBeGreaterThan(stepFourIndex);
    expect(searchFindCopyIndex).toBeGreaterThan(searchFindIndex);
    expect(connectPullCopyIndex).toBeGreaterThan(connectPullIndex);
    expect(cleanStructureCopyIndex).toBeGreaterThan(cleanStructureIndex);
    expect(analyzeLeverageCopyIndex).toBeGreaterThan(analyzeLeverageIndex);
    expect(homeSource).toContain("mt-10 grid gap-3 sm:mt-12 sm:gap-4 lg:mt-14 lg:grid-cols-4 lg:gap-5");
    expect(homeSource).toContain("min-h-[230px] border border-black/10 bg-white/72 p-5");
    expect(homeSource).toContain("sm:min-h-[270px] sm:p-6 lg:min-h-[330px] lg:p-7");
    expect(homeSource).toContain("mt-10 text-xl font-semibold tracking-[-0.04em] sm:mt-12 sm:text-2xl lg:mt-16");
    expect(homeSource).toContain('text-[30px] font-light uppercase tracking-[0.22em] text-[#0A65FF]');
    expect(homeSource).not.toContain('text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">{layer.eyebrow}');
    expect(homeSource).toContain("mt-3 text-[0.95rem] leading-6 text-black/58 sm:mt-4 sm:leading-7");
    expect(homeSource).toContain('font-display text-[54px] leading-[0.92] tracking-[-0.06em]');
    expect(homeSource).not.toContain("text-[clamp(2.7rem,5vw,5.8rem)] leading-[0.92] tracking-[-0.06em]");
    expect(homeSource).not.toContain("Data Empowerment in four steps.");
    expect(homeSource).not.toContain('title: "Search & Find"');
    expect(homeSource).not.toContain('title: "Connect & Pull"');
    expect(homeSource).not.toContain('title: "Clean & Structure"');
    expect(homeSource).not.toContain('title: "Analyze & Leverage"');
    expect(homeSource).not.toContain("Bring approved source data into one governed workflow without forcing teams to chase files manually.");
    expect(homeSource).not.toContain("Standardize, reconcile, and organize information so it becomes reliable operating intelligence.");
    expect(homeSource).not.toContain("A coherent layer above fragmented systems.");
    expect(homeSource).not.toContain("Data foundation");
    expect(homeSource).not.toContain("Workflow foundation");
    expect(homeSource).not.toContain("Reporting foundation");
    expect(homeSource).not.toContain("Governance foundation");
  });

  it("renders the reconciled automation section with the new growth-focused copy", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const sectionLabelIndex = homeSource.indexOf("<SectionLabel>Automation and AI</SectionLabel>");
    const headlineIndex = homeSource.indexOf("Grow Revenue - Not Headcount.", sectionLabelIndex);
    const introIndex = homeSource.indexOf(
      "Digital Therapy converts fragmented Family Office operations into a coherent, private, and automated operating system.",
      headlineIndex,
    );

    expect(sectionLabelIndex).toBeGreaterThanOrEqual(0);
    expect(headlineIndex).toBeGreaterThan(sectionLabelIndex);
    expect(introIndex).toBeGreaterThan(headlineIndex);

    expect(homeSource).toContain(
      "Connect entities, accounts, investments, ownership stakes, and asset classes into a usable operating view.",
    );
    expect(homeSource).toContain(
      "Pull structured and unstructured information from statements, portals, documents, emails, and internal systems into a trusted data layer (Warehouse).",
    );
    expect(homeSource).toContain(
      "Deliver powerful, insightful dashboards, recurring reports & insight summaries tailored to stakeholder roles & clearance.",
    );
    expect(homeSource).not.toContain(
      "Improve close, reconciliation, accounts payable, accounts receivable, general ledger, and approval workflows.",
    );

    expect(homeSource).not.toContain("Scale the office without scaling headcount.");
    expect(homeSource).not.toContain(
      "Digital Therapy converts manual collection, reconciliation, document processing, and reporting production into governed workflows that remain under the family office\u2019s control.",
    );
    expect(homeSource).not.toContain(
      "AI document agents for capital calls, notices, invoices, statements, and reports.",
    );
    expect(homeSource).not.toContain(
      "Conversational assistants that answer approved stakeholder questions from governed data.",
    );
    expect(homeSource).not.toContain(
      "One-click reconciliation across positions, cash flows, documents, and accounting records.",
    );
    expect(homeSource).not.toContain(
      "Workflow orchestration that routes approvals, exceptions, tasks, and recurring follow-ups.",
    );
  });
});
