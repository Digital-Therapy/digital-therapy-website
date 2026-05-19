import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("Thesis page content updates", () => {
  it("renders the simplified thesis-in-one-line heading and supporting copy", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    const sectionLabelIndex = thesisSource.indexOf("Your fusion team can do it");
    const headingIndex = thesisSource.indexOf(
      "Family offices, you need one team to tackle one fused problem.",
      sectionLabelIndex,
    );
    const supportingCopyIndex = thesisSource.indexOf(
      "Digital Therapy delivers one team, one aligned incentive structure, one operating model, and one shared mission",
      headingIndex,
    );

    expect(sectionLabelIndex).toBeGreaterThanOrEqual(0);
    expect(headingIndex).toBeGreaterThan(sectionLabelIndex);
    expect(supportingCopyIndex).toBeGreaterThan(headingIndex);
  });

  it("removes every legacy thesis closing framing across the Thesis page", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).not.toContain("The thesis in one line");
    expect(thesisSource).not.toContain(
      "Family offices, you need one team to tackle one systems problem.",
    );
    expect(thesisSource).not.toContain(
      "Family offices need one integrated team for one interconnected systems problem.",
    );
    expect(thesisSource).not.toContain(
      "Family offices need one team to tackle one systems problem.",
    );
    expect(thesisSource).not.toContain("one integrated team");
    expect(thesisSource).not.toContain("one integrated Fusion Pod");
    expect(thesisSource).not.toContain("one integrated unit");
    expect(thesisSource).not.toContain("interconnected systems problem");
    expect(thesisSource).not.toContain("interconnected systems problems");
    expect(thesisSource).not.toContain("interconnected operating realities");
  });

  it("locks in the reconciled hero h1 copy and fixed 60px size", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain(
      'className="max-w-4xl font-display text-[60px] leading-[0.88] tracking-[-0.07em] text-[#111111]"',
    );
    expect(thesisSource).toContain("The practice-based firm falls short.");
    expect(thesisSource).not.toContain("The old consulting model is structurally broken.");
    expect(thesisSource).not.toContain("text-[clamp(3.3rem,7vw,7.6rem)]");
  });

  it("locks in the reconciled hero paragraph copy", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain(
      "Most transformation initiatives fail \u2014 not because firms lack smart people \u2014 because firm structure & culture rewards silo behavior & disincentivizes cross-functional collaboration.",
    );
    expect(thesisSource).toContain(
      "Digital Therapy solves this fragmentation with a \u201cFusion Team\u201d \u2014 custom built & trained to understand & overcome complex business & data challenges touching Operations, Accounting, & Technology. These days, that\u2019s just about everything.",
    );
    expect(thesisSource).not.toContain(
      "Digital Therapy replaces that fragmentation with one Fusion Team \u2014 custom built and trained to understand and overcome even the most complex business and data challenges that touch operations, accounting, and technology. And these days, that includes basically everything.",
    );
    expect(thesisSource).not.toContain(
      "Most transformation work fails to reach its potential not because advisory firms lack smart people, but because their organizational structure rewards silo behavior.",
    );
    expect(thesisSource).not.toContain(
      "Digital Therapy replaces that fragmentation with one Fusion Pod built around operations, accounting, and technology.",
    );
  });

  it("renames the problem h2 and the why-family-offices h2 with their new sizes", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain("Firm architecture prevents effective collaboration.");
    expect(thesisSource).not.toContain(
      "Consulting firms are designed to prevent true collaboration.",
    );
    expect(thesisSource).not.toMatch(
      /Firm architecture prevents collaboration\.[\s\S]{0,40}<\/h2>/,
    );

    expect(thesisSource).toContain(
      'className="font-display text-[55px] leading-[0.9] tracking-[-0.06em]"',
    );
    expect(thesisSource).toContain("Fragmented advisors isn\u2019t the road to success.");
    expect(thesisSource).not.toContain(
      "Fragmented advisors cannot solve one shared operating reality.",
    );
    expect(thesisSource).not.toContain("text-[clamp(2.8rem,5vw,5.6rem)]");
  });

  it("renames the solution h2 and the comparison section", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain(
      "One trained team \u2014 Not \u201ccollaborating\u201d practice groups.",
    );
    expect(thesisSource).not.toContain(
      "One trained team \u2014 not \u201ccollaborating\u201d practice groups.",
    );
    expect(thesisSource).not.toContain(
      "One integrated unit \u2014 not \u201ccollaborating\u201d practice groups.",
    );

    expect(thesisSource).toContain(
      "<SectionLabel>Fusion teams by digital therapy</SectionLabel>",
    );
    expect(thesisSource).not.toContain("<SectionLabel>DT's solution</SectionLabel>");

    expect(thesisSource).toContain(
      'className="font-display text-[55px] leading-[0.9] tracking-[-0.065em]"',
    );
    expect(thesisSource).not.toContain("text-[clamp(2.8rem,5.5vw,6.1rem)]");

    expect(thesisSource).toContain("Traditional Advisory vs. Fusion Teams");
    expect(thesisSource).not.toContain("Traditional consulting vs. Fusion Teams");

    expect(thesisSource).toContain(
      'className="font-display text-[54px] leading-[0.9] tracking-[-0.06em]"',
    );
    expect(thesisSource).toContain("Small changes. Big Impact.");
    expect(thesisSource).not.toContain("The structural difference changes everything.");
    expect(thesisSource).not.toContain("text-[clamp(2.7rem,5vw,5.4rem)] leading-[0.9] tracking-[-0.06em]\">\n                  The structural");
  });

  it("locks in the closing call-to-action h2 at fixed 55px", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain(
      'className="font-display text-[55px] leading-[0.88] tracking-[-0.07em]"',
    );
    expect(thesisSource).not.toContain("text-[clamp(3rem,6vw,6.4rem)]");
  });

  it("updates the problem-signal pills and replaces two of the six labels", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain('"Incomplete Discovery"');
    expect(thesisSource).toContain('"Poor adoption"');
    expect(thesisSource).not.toContain('"Weak accountability"');
    expect(thesisSource).not.toContain('"Poor technology adoption"');

    expect(thesisSource).toContain(
      'className="rounded-full border border-black/10 bg-[#F7F4EE] px-4 py-3 text-center text-[14px] font-medium uppercase tracking-[0.14em] text-black/62"',
    );
    expect(thesisSource).not.toContain(
      'className="rounded-full border border-black/10 bg-[#F7F4EE] px-4 py-3 text-center text-[20px] font-normal uppercase tracking-[0.14em] text-black/62"',
    );
    expect(thesisSource).not.toContain(
      'className="rounded-full border border-black/10 bg-[#F7F4EE] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-black/62"',
    );
  });

  it("aligns the supporting Thesis sections with the new framing", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain(
      "predictable delivery failures for clients with one shared systems problem.",
    );
    expect(thesisSource).toContain(
      "Modern family offices no longer have separate technology, operations, and accounting challenges. They have one systems problem.",
    );
    expect(thesisSource).toContain(
      "Accountants, engineers, operations consultants, and finance teams often work beside each other rather than as one unit.",
    );
  });

  it("renames every remaining Fusion Pod reference on the Thesis page to Fusion Team", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).not.toMatch(/Fusion Pod/);
    expect(thesisSource).not.toMatch(/Fusion Pods/);
    expect(thesisSource).toContain("One permanent Fusion Team");
    expect(thesisSource).toContain("Fusion Team model");
    expect(thesisSource).toContain(
      "Digital Therapy\u2019s Fusion Team model was built to eliminate structural failure at the root. Rather than assembling temporary teams from competing departments, the Fusion Team is a permanent leadership layer composed of deeply aligned operations, accounting, and technology disciplines.",
    );
    expect(thesisSource).toContain(
      "The Fusion Team succeeds or fails together, so collaboration is no longer optional; it is the operating model itself.",
    );
    expect(thesisSource).toContain(
      "Traditional firms attempt collaboration between competing departments. Fusion Teams eliminate the competition entirely by creating one shared mission and one accountable delivery structure.",
    );
  });
});
