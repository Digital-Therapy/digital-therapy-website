import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("PublicHeader logo sizing", () => {
  const headerSource = readProjectFile("client/src/components/PublicHeader.tsx");

  it("scales the desktop top-nav logo to 60px / lg:66px (50% larger than the previous h-10/h-11)", () => {
    expect(headerSource).toContain('className="h-[60px] w-auto object-contain lg:h-[66px]"');
  });

  it("scales the mobile sheet logo to match the new desktop size", () => {
    expect(headerSource).toContain('className="h-[60px] w-auto object-contain"');
  });

  it("does not regress to the previous smaller logo classes", () => {
    expect(headerSource).not.toContain('"h-10 w-auto object-contain lg:h-11"');
    expect(headerSource).not.toContain('"h-10 w-auto object-contain"');
  });
});
