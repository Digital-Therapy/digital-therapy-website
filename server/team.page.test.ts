import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("Team page founder story", () => {
  it("marks Jonathan Kobrin as the founder leader and renders him as a clickable trigger", () => {
    const teamSource = readProjectFile("client/src/pages/Team.tsx");

    expect(teamSource).toContain('name: "Jonathan Kobrin"');
    expect(teamSource).toContain('role: "Founder & CEO"');
    expect(teamSource).toContain("isFounder: true");
    expect(teamSource).toContain('aria-label={`Read founder story: ${leader.name}`}');
    expect(teamSource).toContain('data-testid="founder-card-trigger"');
    expect(teamSource).toContain("Read founder story");
    expect(teamSource).toContain("FounderStoryDialog");
  });

  it("presents the founder story dialog with the confirmed Fusion Team narrative", () => {
    const teamSource = readProjectFile("client/src/pages/Team.tsx");

    expect(teamSource).toContain('data-testid="founder-story-dialog"');
    expect(teamSource).toContain("Founder story");
    expect(teamSource).toContain("Founder &amp; CEO, Digital Therapy");
    expect(teamSource).toContain(
      "Jon Kobrin is the founder of Digital Therapy, a firm often referred to as the accounting firm of the future. With a background in entrepreneurship and software development, Jon brings a unique perspective to transformation projects.",
    );
    expect(teamSource).toContain(
      "From 2021 to 2024, Jon served as Director of Software Solutions &amp; Transformation at EisnerAmper, a Top 20 tax, accounting, and advisory firm. There, he created the beginnings of his Fusion Team concept, which he has since evolved and brought to market through Digital Therapy.",
    );
    expect(teamSource).toContain(
      "Fusion Teams begin with three SMEs &mdash; one Finance &amp; Accounting SME, one Technology SME, and one Operations &amp; Process SME.",
    );
    expect(teamSource).toContain("solves roughly 95% of project friction");
    expect(teamSource).toContain(
      "These three functions used to be siloed departments, each governed by a dedicated leader. But the work has become knotted &mdash; no one function easily separates from another. In this transitional period, all three minds must cooperate and be re-trained to approach projects collectively, so each role can bridge the gaps for the others. It may seem like a small twist, but it makes for an incredibly capable solution team that delivers big &mdash; the type of impact clients deserve but rarely experience.",
    );
    expect(teamSource).toContain('context="team page founder story booking"');
  });

  it("imports shadcn dialog primitives so the founder story renders as an accessible modal", () => {
    const teamSource = readProjectFile("client/src/pages/Team.tsx");

    [
      "Dialog,",
      "DialogContent,",
      "DialogDescription,",
      "DialogHeader,",
      "DialogTitle,",
      "DialogTrigger,",
    ].forEach((primitive) => {
      expect(teamSource).toContain(primitive);
    });
    expect(teamSource).toContain('from "@/components/ui/dialog"');
  });
});
