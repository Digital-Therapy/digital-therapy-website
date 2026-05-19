import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("Capabilities page content updates", () => {
  it("locks in the reconciled hero h1 copy and fixed 60px size", () => {
    const source = readProjectFile("client/src/pages/Capabilities.tsx");

    expect(source).toContain(
      'className="max-w-4xl font-display text-[60px] leading-[0.88] tracking-[-0.07em] text-[#111111]"',
    );
    expect(source).toContain("Get real time answers & insights from your data.");
    expect(source).not.toContain(
      "Everything required to answer the owner\u2019s next question.",
    );
    expect(source).not.toContain(
      "Everything required to answer the owner's next question.",
    );
    expect(source).not.toContain(
      'className="max-w-4xl font-display text-[clamp(3.3rem,7vw,7.6rem)] leading-[0.88] tracking-[-0.07em] text-[#111111]"',
    );
  });

  it("locks in the typical-requests h2 copy and fixed 60px size", () => {
    const source = readProjectFile("client/src/pages/Capabilities.tsx");

    expect(source).toContain("Family offices typically want..");
    expect(source).toContain(
      'className="font-display text-[60px] leading-[0.92] tracking-[-0.06em]"',
    );
    expect(source).not.toContain("What sophisticated offices ask for first.");
    expect(source).not.toContain("Family offices typically ask for..");
    expect(source).not.toMatch(
      /text-\[clamp\(2\.7rem,5vw,5\.6rem\)\] leading-\[0\.92\] tracking-\[-0\.06em\]">[\s\S]{0,40}Family offices typically want/,
    );
  });

  it("renames the core-capabilities h2", () => {
    const source = readProjectFile("client/src/pages/Capabilities.tsx");

    expect(source).toContain(
      "Digital Therapy offers a toolbox for complex wealth.",
    );
    expect(source).not.toContain("The operating toolkit for complex wealth.");
  });

  it("renames and rewrites the first three capability tiles", () => {
    const source = readProjectFile("client/src/pages/Capabilities.tsx");

    expect(source).toContain('title: "Entity + Revenue mapping"');
    expect(source).toContain('title: "AI Data-Aggregation"');
    expect(source).toContain('title: "Accounting Systems"');
    expect(source).not.toContain('title: "Global wealth mapping"');
    expect(source).not.toContain('title: "AI aggregation"');
    expect(source).not.toContain('title: "Accounting operations"');

    expect(source).toContain(
      "Entity, trust, account, investment, real-estate, and operating-company views organized into one trusted map.",
    );
    expect(source).not.toContain(
      "Entity, trust, account, investment, real-estate, and operating-company views organized into one trusted map of the family-office universe.",
    );

    expect(source).toContain(
      "Unify your data by connecting every source to your DT On-Prem central warehouse. We can migrate any data repository including legacy mainframe & green screen systems.",
    );
    expect(source).not.toContain(
      "Secure intelligence layers that collect, reconcile, summarize, and answer questions across approved documents, systems, and workflows.",
    );
  });

  it("renames the delivery-architecture h2", () => {
    const source = readProjectFile("client/src/pages/Capabilities.tsx");

    expect(source).toContain(
      "Fully integrated & securely on-prem.",
    );
    expect(source).not.toContain(
      "Built to be fully integrated & securely on-prem.",
    );
    expect(source).not.toContain(
      "Built as a secure operating layer, not another isolated tool.",
    );
  });
});
