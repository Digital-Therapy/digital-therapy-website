import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("DT Brain page content updates", () => {
  it("renames the hero h1 from 'Your secure automation hub.' to 'On-prem automation hub.'", () => {
    const dtbrainSource = readProjectFile("client/src/pages/DTBrain.tsx");

    // The new copy is present inside the hero h1.
    expect(dtbrainSource).toContain("On-prem automation hub.");

    // The legacy copy is fully removed (in any form).
    expect(dtbrainSource).not.toContain("Your secure automation hub.");
    expect(dtbrainSource).not.toContain("Your secure automation hub");
  });
});
