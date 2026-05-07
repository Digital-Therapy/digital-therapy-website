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
});
