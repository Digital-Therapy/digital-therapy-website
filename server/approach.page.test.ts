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

  it("presents Discovery as two parallel tracks led by the Technology and Finance + Accounting SMEs on the Our Approach page", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    expect(approachSource).toContain(
      "Digital Therapy breaks transformation into a sequenced operating process. Phase 1 is Discovery \u2014 and we do it twice (sorry but it&apos;s worth it). We evaluate two parallel functional tracks: Track 1 - Technology Discovery led by a Technology SME, and Track 2 - Finance &amp; Accounting Discovery led by a Finance + Accounting SME. All three Fusion Team SMEs deploy on-site for 2 - 4 weeks.",
    );
    expect(approachSource).toContain(
      'mt-8 max-w-2xl text-[18px] font-light leading-8 text-[#3e3c3c]',
    );
    expect(approachSource).not.toContain(
      "Digital Therapy breaks transformation into a sequenced operating process. Section 1 is Discovery \u2014 and it actually runs as two parallel tracks",
    );
    expect(approachSource).not.toContain(
      'mt-8 max-w-2xl text-xl leading-8 text-black/62',
    );
    expect(approachSource).toContain("Discovery runs as two parallel tracks.");
    expect(approachSource).toContain("Diagnostics-First, on-site for 2\u20134 weeks");

    [
      "Track A",
      "Track B",
      "Technology Discovery",
      "Finance & Accounting Discovery",
      "Lead: Technology SME",
      "Lead: Finance + Accounting SME",
      "Systems, tools, and integrations inventory",
      "User identity, access, and governance controls",
      "Software evaluation and architecture decisions",
      "Integration requirements and data exchange design",
      "AR, AP, and GL workflow analysis",
      "Close-cycle, reconciliation, and approval review",
      "Accounting systems, controls, and reporting evidence",
      "Finance optimization and tooling priorities",
      "View Discovery tracks",
      "Two parallel tracks",
      "2 parallel",
      "2\u20134 weeks",
    ].forEach((trackText) => {
      expect(approachSource).toContain(trackText);
    });

    [
      "Digital Therapy&apos;s Discovery process consists of 8 parts:",
      "View Discovery sequence",
      '["8 parts", "diagnosed"]',
      '["V1 spec", "established"]',
    ].forEach((legacyText) => {
      expect(approachSource).not.toContain(legacyText);
    });
  });

  it("includes the shared Operations & Process SME callout that spans both Discovery tracks", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    [
      "Shared across both tracks",
      "Operations &amp; Process SME splits time across both Discoveries.",
      "As the Technology and Finance + Accounting leads identify complex current-state processes, they call the Operations &amp; Process SME in to collaborate on unpacking and mapping each one with swim lanes \u2014 who is involved, how many people, how many tasks, and where the handoffs break.",
      "Together, all three SMEs then architect the future-state strategy, leveraging the new tools and automation capabilities surfaced by the parallel tracks so the implementation phase inherits one shared operating blueprint.",
    ].forEach((opsText) => {
      expect(approachSource).toContain(opsText);
    });
  });

  it("renders the Output intro paragraph in full white for stronger contrast on the dark deliverables section", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    expect(approachSource).toContain(
      'max-w-3xl text-lg leading-8 text-white">\n                The two Discovery tracks converge into one prioritized operating plan.',
    );
    expect(approachSource).not.toContain(
      'max-w-3xl text-lg leading-8 text-white/62',
    );
  });

  it("includes the Discovery Process output deliverables on the Our Approach page", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    [
      "Discovery produces three implementation-ready deliverables.",
      "The two Discovery tracks converge into one prioritized operating plan. Together, the Technology Discovery, the Finance &amp; Accounting Discovery, and the Operations &amp; Process swim-lane work convert interviews, system mapping, accounting analysis, and future-state architecture into a sequenced roadmap that can guide configuration, automation, integration, migration, testing, and onboarding.",
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

  it("presents the new Approach hero headline 'The difference one month can make.' at a fixed 70px", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    expect(approachSource).toContain("The difference one month can make.");
    expect(approachSource).toContain(
      'max-w-4xl font-display text-[70px] leading-[0.88] tracking-[-0.07em] text-[#111111]',
    );
    expect(approachSource).not.toContain("Transformation begins with diagnostics.");
    expect(approachSource).not.toContain("text-[clamp(3.3rem,7vw,7.6rem)]");
  });

  it("prevents the hero right-side card from being squeezed by giving each grid track a minmax(0,...) base", () => {
    const approachSource = readProjectFile("client/src/pages/OurApproach.tsx");

    expect(approachSource).toContain(
      "lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]",
    );
    expect(approachSource).not.toContain("lg:grid-cols-[0.92fr_1.08fr]");
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
