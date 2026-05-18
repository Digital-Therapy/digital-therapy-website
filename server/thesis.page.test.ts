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

    const sectionLabelIndex = thesisSource.indexOf("The thesis in one line");
    const headingIndex = thesisSource.indexOf(
      "Family offices need one team to tackle one systems problem.",
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

  it("removes the previous integrated-team and interconnected-systems framing across the Thesis page", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).not.toContain(
      "Family offices need one integrated team for one interconnected systems problem.",
    );
    expect(thesisSource).not.toContain("one integrated team");
    expect(thesisSource).not.toContain("one integrated Fusion Pod");
    expect(thesisSource).not.toContain("one integrated unit");
    expect(thesisSource).not.toContain("interconnected systems problem");
    expect(thesisSource).not.toContain("interconnected systems problems");
    expect(thesisSource).not.toContain("interconnected operating realities");
  });

  it("aligns the supporting Thesis sections with the simplified one-team / one-systems-problem framing", () => {
    const thesisSource = readProjectFile("client/src/pages/Thesis.tsx");

    expect(thesisSource).toContain(
      "Digital Therapy replaces that fragmentation with one Fusion Pod built around operations, accounting, and technology.",
    );
    expect(thesisSource).toContain(
      "predictable delivery failures for clients with one shared systems problem.",
    );
    expect(thesisSource).toContain(
      "Modern family offices no longer have separate technology, operations, and accounting challenges. They have one systems problem.",
    );
    expect(thesisSource).toContain(
      "Fragmented advisors cannot solve one shared operating reality.",
    );
    expect(thesisSource).toContain(
      'Accountants, engineers, operations consultants, and finance teams often work beside each other rather than as one unit.',
    );
  });
});
