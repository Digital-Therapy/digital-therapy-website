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
});
