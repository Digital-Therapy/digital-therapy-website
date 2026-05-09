import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("Home page content updates", () => {
  it("adds the Thesis callout after the collaboration section with a Thesis page button", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const headingIndex = homeSource.indexOf("Collaboration cannot be an afterthought.");
    const calloutIndex = homeSource.indexOf("For more on this topic, check out our Thesis Page.");
    const buttonIndex = homeSource.indexOf("View Our Thesis");

    expect(headingIndex).toBeGreaterThanOrEqual(0);
    expect(calloutIndex).toBeGreaterThan(headingIndex);
    expect(buttonIndex).toBeGreaterThan(calloutIndex);
    expect(homeSource).toContain('href="/thesis"');
  });

  it("moves the hero booking CTA beneath the image and renames the capabilities CTA", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const leftCtaGroupIndex = homeSource.indexOf('className="mt-10 flex flex-col gap-3 sm:flex-row"');
    const capabilitiesHrefIndex = homeSource.indexOf('href="/capabilities"', leftCtaGroupIndex);
    const capabilitiesLabelIndex = homeSource.indexOf("View our capabilities", capabilitiesHrefIndex);
    const dtBrainIndex = homeSource.indexOf('href="/dt-brain"', capabilitiesLabelIndex);
    const heroImageIndex = homeSource.indexOf('alt="Abstract private operating layer visualization"');
    const compactHeroImageIndex = homeSource.indexOf('aspect-[16/8]', heroImageIndex);
    const desktopOffsetIndex = homeSource.indexOf('lg:-mt-24 xl:-mt-16');
    const imageSideBookingIndex = homeSource.indexOf('context="homepage hero image-side booking"');
    const prominentClassIndex = homeSource.indexOf('whitespace-nowrap px-8 py-4 text-base', imageSideBookingIndex);
    const minWidthIndex = homeSource.indexOf('sm:min-w-[300px]', imageSideBookingIndex);

    expect(leftCtaGroupIndex).toBeGreaterThanOrEqual(0);
    expect(capabilitiesHrefIndex).toBeGreaterThan(leftCtaGroupIndex);
    expect(capabilitiesLabelIndex).toBeGreaterThan(capabilitiesHrefIndex);
    expect(dtBrainIndex).toBeGreaterThan(capabilitiesLabelIndex);
    expect(homeSource).not.toContain("Explore the operating layer");
    expect(desktopOffsetIndex).toBeGreaterThanOrEqual(0);
    expect(compactHeroImageIndex).toBeGreaterThan(heroImageIndex);
    expect(imageSideBookingIndex).toBeGreaterThan(heroImageIndex);
    expect(prominentClassIndex).toBeGreaterThan(imageSideBookingIndex);
    expect(minWidthIndex).toBeGreaterThan(imageSideBookingIndex);
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
    const ctaIndex = homeSource.indexOf("Book 30 minutes to find the first high-value win.");

    expect(partnersIndex).toBeGreaterThanOrEqual(0);
    expect(ctaIndex).toBeGreaterThan(partnersIndex);
  });

  it("updates the operating-layer section to the requested Data Empowerment four-step copy", () => {
    const homeSource = readProjectFile("client/src/pages/Home.tsx");

    const sectionIndex = homeSource.indexOf("Data Empowerment in four steps.");
    const layersIndex = homeSource.indexOf("const operatingLayers = [");
    const stepOneIndex = homeSource.indexOf('eyebrow: "01"', layersIndex);
    const searchFindIndex = homeSource.indexOf('title: "Search & Find"', stepOneIndex);
    const stepTwoIndex = homeSource.indexOf('eyebrow: "02"', searchFindIndex);
    const connectPullIndex = homeSource.indexOf('title: "Connect & Pull"', stepTwoIndex);
    const stepThreeIndex = homeSource.indexOf('eyebrow: "03"', connectPullIndex);
    const cleanStructureIndex = homeSource.indexOf('title: "Clean & Structure"', stepThreeIndex);
    const stepFourIndex = homeSource.indexOf('eyebrow: "04"', cleanStructureIndex);
    const analyzeLeverageIndex = homeSource.indexOf('title: "Analyze & Leverage"', stepFourIndex);
    const searchFindCopyIndex = homeSource.indexOf(
      "Locate critical records, accounts, entities, and documents across every system before decisions are made.",
      searchFindIndex,
    );
    const connectPullCopyIndex = homeSource.indexOf(
      "Bring approved source data into one governed workflow without forcing teams to chase files manually.",
      connectPullIndex,
    );
    const cleanStructureCopyIndex = homeSource.indexOf(
      "Standardize, reconcile, and organize information so it becomes reliable operating intelligence.",
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
    expect(homeSource).toContain("mt-3 text-[0.95rem] leading-6 text-black/58 sm:mt-4 sm:leading-7");
    expect(homeSource).not.toContain("A coherent layer above fragmented systems.");
    expect(homeSource).not.toContain("Data foundation");
    expect(homeSource).not.toContain("Workflow foundation");
    expect(homeSource).not.toContain("Reporting foundation");
    expect(homeSource).not.toContain("Governance foundation");
  });
});
