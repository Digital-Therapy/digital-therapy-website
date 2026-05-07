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
});
