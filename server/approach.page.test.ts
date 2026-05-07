import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("Our Approach page implementation", () => {
  it("registers the /approach route in the app router", () => {
    const appSource = readProjectFile("client/src/App.tsx");

    expect(appSource).toContain('import OurApproach from "./pages/OurApproach";');
    expect(appSource).toContain('<Route path={"/approach"} component={OurApproach} />');
  });

  it("updates the former Meet the team CTA to open the approach page", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain('href="/approach"');
    expect(thesisSource).toContain("Understand our approach.");
    expect(thesisSource).not.toContain("Meet the team");
  });

  it("includes the Discovery diagnostics-first sequence on the Our Approach page", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    expect(approachSource).toContain("Discovery");
    expect(approachSource).toContain("Diagnostics-First");
    expect(approachSource).toContain("Digital Therapy&apos;s Discovery process consists of 8 parts:");

    [
      "Define Project Priorities",
      "Map Processes",
      "User Identity & Access",
      "Evaluate + Demo Software",
      "Support Requirements",
      "Accounting Systems",
      "Integration Requirements",
      "Establish V1 Spec",
    ].forEach((heading) => {
      expect(approachSource).toContain(heading);
    });
  });

  it("includes the Discovery Process output deliverables on the Our Approach page", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    [
      "Discovery produces three implementation-ready deliverables.",
      "Graded Priorities List",
      "Visualized Operations | Current State w/ Pain Points Heat Map + New State",
      "Current State Mapping — comprehensive swim-lane process diagrams documenting every workflow",
      "Operational Heat Map — diagnostic overlay highlighting bottlenecks, silos, and risk areas",
      "Future State Design — optimized workflows with automation, clear ownership, and Kanban checkpoints",
      "The future-state model becomes the blueprint for the implementation phase.",
      "Project Plan | Implementation Roadmap",
      "Phased roadmap — configuration, workflows, integrations, migration, testing, onboarding",
      "Milestones & timelines aligned with business priorities and stakeholder expectations",
      "Roles & responsibilities — decision-makers, admins, operational owners, technical leads",
      "Risk mitigation — strategies addressing potential implementation risks and contingencies",
    ].forEach((deliverableText) => {
      expect(approachSource).toContain(deliverableText);
    });
  });

  it("includes the AP & AR close-system redesign section on the Our Approach page", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    [
      "AP &amp; AR close-system redesign.",
      "After Discovery, Digital Therapy dives into AP &amp; AR.",
      "Clients often operate 15 to 30+ days behind",
      "redesign close systems &amp; processes",
      "build custom tools to reduce the monthly close burden",
      "Close in the first 3 - 5 days of the next month.",
      "Reduce the monthly close burden",
      "Target close",
    ].forEach((closeSystemText) => {
      expect(approachSource).toContain(closeSystemText);
    });
  });

  it("includes the AP & AR illustrative case-study example on the Our Approach page", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    [
      "Illustrative case example",
      "From close backlog to first-week operating rhythm.",
      "Example scenario, not a quoted client result",
      "a multi-entity family office enters each month 20+ days behind",
      "Before",
      "DT intervention",
      "Impact",
      "Digital Therapy maps the close, redesigns ownership and checkpoints",
      "lightweight exception dashboards and approval tooling",
      "a managed close calendar",
      "first 3 - 5 days of the next month target",
    ].forEach((caseStudyText) => {
      expect(approachSource).toContain(caseStudyText);
    });
  });
});
