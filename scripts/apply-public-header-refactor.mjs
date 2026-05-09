import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve("/home/ubuntu/digital-therapy-website");

const replacements = new Map([
  [
    "client/src/pages/Home.tsx",
    `<PublicHeader\n        bookingContext="homepage family-office booking"\n        logoHref="#top"\n        useHomeAnchorLinks\n        headerClassName="bg-[#F7F4EE]/82"\n      />`,
  ],
  [
    "client/src/pages/Capabilities.tsx",
    `<PublicHeader\n        activeLabel="Capabilities"\n        bookingContext="capabilities page family-office booking"\n        contactContext="capabilities page navigation contact"\n      />`,
  ],
  [
    "client/src/pages/Thesis.tsx",
    `<PublicHeader\n        activeLabel="Thesis"\n        bookingContext="thesis page family-office booking"\n        contactContext="thesis page navigation contact"\n      />`,
  ],
  [
    "client/src/pages/OurApproach.tsx",
    `<PublicHeader\n        bookingContext="our approach page family-office booking"\n        contactContext="our approach page navigation contact"\n      />`,
  ],
  [
    "client/src/pages/Team.tsx",
    `<PublicHeader\n        activeLabel="Team"\n        bookingContext="team page family-office booking"\n        contactContext="team page navigation contact"\n      />`,
  ],
  [
    "client/src/pages/DTBrain.tsx",
    `<PublicHeader\n        activeLabel="DT Brain"\n        bookingContext="DT Brain private AI booking"\n        showMainSiteLink\n      />`,
  ],
]);

for (const [relativePath, replacement] of replacements.entries()) {
  const absolutePath = path.join(projectRoot, relativePath);
  let source = readFileSync(absolutePath, "utf8");

  if (!source.includes('import PublicHeader from "@/components/PublicHeader";')) {
    source = source.replace(/(import .*? from .*?;\n)/, '$1import PublicHeader from "@/components/PublicHeader";\n');
  }

  const nextSource = source.replace(/<header className="fixed[\s\S]*?<\/header>/, replacement);
  if (nextSource === source) {
    throw new Error(`No header block replaced in ${relativePath}`);
  }

  writeFileSync(absolutePath, nextSource);
}
