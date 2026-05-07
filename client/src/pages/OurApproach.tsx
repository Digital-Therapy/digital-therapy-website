/**
 * Digital Therapy Our Approach page.
 * Introduces the sequential transformation process, beginning with Discovery.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  Database,
  GitBranch,
  KeyRound,
  Layers3,
  Network,
  Settings2,
  Workflow,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/manus-storage/DTLOGO_PICMARKpng_2cf51494.png";
const wealthMapVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_wealth_map_visual-TmSmhqHi8pgacxaNwHMRxs.webp";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

const discoveryParts = [
  {
    number: "01",
    title: "Define Project Priorities",
    copy: "Align stakeholders on key goals: efficiency, growth, risk reduction, reporting visibility, and automation.",
    icon: BadgeCheck,
  },
  {
    number: "02",
    title: "Map Processes",
    copy: "Swim-lane diagrams tracing actions (personnel), transactions (money) & data flows through departments.",
    icon: Workflow,
  },
  {
    number: "03",
    title: "User Identity & Access",
    copy: "Define user roles, access privileges, authorization logic, and compliance controls for governance.",
    icon: KeyRound,
  },
  {
    number: "04",
    title: "Evaluate + Demo Software",
    copy: "Structured evaluation of CRM and relationship platforms — demos, functional comparisons, use-case validation.",
    icon: Layers3,
  },
  {
    number: "05",
    title: "Support Requirements",
    copy: "Assess technical admin needs, internal ownership, training requirements, & maintenance planning.",
    icon: Settings2,
  },
  {
    number: "06",
    title: "Accounting Systems",
    copy: "Full AP/AR & GL workflow analysis with finance optimization planning.",
    icon: ClipboardCheck,
  },
  {
    number: "07",
    title: "Integration Requirements",
    copy: "Cross-system data exchange architecture — CRM, accounting, workflow tools, reporting, & external sources.",
    icon: Network,
  },
  {
    number: "08",
    title: "Establish V1 Spec",
    copy: "Business rules, automation logic, scoring rubrics, and triage methodology to guide system design.",
    icon: GitBranch,
  },
];

const discoveryOutputs = [
  {
    number: "01",
    title: "Graded Priorities List",
    copy: "A ranked operating agenda that clarifies which transformation priorities should move first, why they matter, and how each priority connects to efficiency, growth, risk reduction, reporting visibility, and automation.",
    icon: BadgeCheck,
    details: ["Priority grades tied to stakeholder alignment", "Decision context for sequencing the implementation roadmap"],
  },
  {
    number: "02",
    title: "Visualized Operations | Current State w/ Pain Points Heat Map + New State",
    copy: "A visual operating model that shows how work happens today, where friction concentrates, and how the future-state workflow should operate.",
    icon: Workflow,
    details: [
      "Current State Mapping — comprehensive swim-lane process diagrams documenting every workflow",
      "Operational Heat Map — diagnostic overlay highlighting bottlenecks, silos, and risk areas",
      "Future State Design — optimized workflows with automation, clear ownership, and Kanban checkpoints",
    ],
    note: "The future-state model becomes the blueprint for the implementation phase.",
  },
  {
    number: "03",
    title: "Project Plan | Implementation Roadmap",
    copy: "A practical implementation plan that converts discovery into sequenced workstreams, ownership, timelines, and risk controls.",
    icon: BarChart3,
    details: [
      "Phased roadmap — configuration, workflows, integrations, migration, testing, onboarding",
      "Milestones & timelines aligned with business priorities and stakeholder expectations",
      "Roles & responsibilities — decision-makers, admins, operational owners, technical leads",
      "Risk mitigation — strategies addressing potential implementation risks and contingencies",
    ],
  },
];

const closeRedesignPillars = [
  {
    eyebrow: "Current lag",
    title: "15 to 30+ days behind",
    copy: "Clients often operate 15 to 30+ days behind, which compresses management visibility, delays decisions, and keeps accounting teams in a permanent catch-up cycle.",
    icon: BarChart3,
  },
  {
    eyebrow: "System redesign",
    title: "Redesign close systems & processes",
    copy: "DT helps redesign close systems & processes across AP, AR, reconciliations, approvals, entity workflows, data movement, and exception handling.",
    icon: Workflow,
  },
  {
    eyebrow: "Custom tooling",
    title: "Reduce the monthly close burden",
    copy: "DT often builds custom tools to reduce the monthly close burden, replacing manual follow-up, spreadsheet-heavy reviews, and recurring data cleanup with governed workflows.",
    icon: ClipboardCheck,
  },
];

function PrivateBriefingButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  return <BookingWidgetDialog variant={variant} context="our approach page family-office booking" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

export default function OurApproach() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/8 bg-[#F7F4EE]/84 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="Digital Therapy home">
            <img src={logoUrl} alt="Digital Therapy" className="h-10 w-auto object-contain lg:h-11" />
          </a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            <a href="/" className="text-sm font-medium text-black/60 transition-colors duration-300 hover:text-black">
              Home
            </a>
            <a href="/approach" className="text-sm font-semibold text-[#0A65FF]">
              Approach
            </a>
            <a href="/capabilities" className="text-sm font-medium text-black/60 transition-colors duration-300 hover:text-black">
              Capabilities
            </a>
            <a href="/thesis" className="text-sm font-medium text-black/60 transition-colors duration-300 hover:text-black">
              Thesis
            </a>
            <a href="/dt-brain" className="text-sm font-medium text-black/60 transition-colors duration-300 hover:text-black">
              DT Brain
            </a>
            <a href="/team" className="text-sm font-medium text-black/60 transition-colors duration-300 hover:text-black">
              Team
            </a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <ContactFormDialog
              variant="text"
              label="Contact"
              context="our approach page navigation contact"
              icon="none"
              className="text-sm font-medium transition-colors duration-300 hover:text-black"
            />
            <PrivateBriefingButton />
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-black/8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(10,101,255,0.11),transparent_34%),linear-gradient(115deg,#F7F4EE_0%,#FFFFFF_52%,#EEF4FF_100%)]" />
          <div className="container relative grid min-h-[calc(100vh-5rem)] items-center gap-12 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:py-28">
            <motion.div {...fadeUp}>
              <SectionLabel>Our approach</SectionLabel>
              <h1 className="max-w-4xl font-display text-[clamp(3.3rem,7vw,7.6rem)] leading-[0.88] tracking-[-0.07em] text-[#111111]">
                Transformation begins with diagnostics.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/62">
                Digital Therapy breaks transformation into a sequenced operating process. Section 1 is Discovery: a diagnostics-first assessment that defines priorities, maps workflows, evaluates systems, and establishes the V1 specification before build work begins.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#discovery"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0A65FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(10,101,255,0.22)] transition-all duration-300 hover:bg-[#004ed1]"
                >
                  View Discovery sequence
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a
                  href="/thesis"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/55 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  See the thesis
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-black/10 pt-6">
                {[
                  ["Section 1", "Discovery"],
                  ["8 parts", "diagnosed"],
                  ["V1 spec", "established"],
                ].map(([top, bottom]) => (
                  <div key={top}>
                    <div className="font-display text-2xl leading-none tracking-[-0.04em]">{top}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">{bottom}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 35 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" as const }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2.6rem] bg-[#0A65FF]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white shadow-[0_42px_110px_rgba(16,24,40,0.14)]">
                <img src={wealthMapVisual} alt="Diagnostics map for family-office transformation" className="aspect-[16/12] w-full object-cover" />
                <div className="absolute bottom-5 left-5 right-5 rounded-[1.35rem] border border-white/70 bg-white/78 p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <img src={markUrl} alt="" className="mt-1 h-9 w-9 object-contain" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">Diagnostics-first</p>
                      <p className="mt-2 text-sm leading-6 text-black/66">
                        Priorities, workflows, access, systems, support, accounting, integrations, and V1 specifications are aligned before implementation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="discovery" className="bg-white py-24 lg:py-32">
          <div className="container">
            <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center">
              <SectionLabel>Section 1</SectionLabel>
              <h2 className="font-display text-[clamp(2.8rem,5vw,5.6rem)] leading-[0.9] tracking-[-0.06em] text-[#111111]">
                Discovery
              </h2>
              <p className="mt-6 text-xl font-semibold tracking-[-0.02em] text-[#0A65FF]">Diagnostics-First</p>
              <p className="mt-6 text-lg leading-8 text-black/62">
                Digital Therapy&apos;s Discovery process consists of 8 parts:
              </p>
            </motion.div>

            <div className="mt-16 grid gap-5 lg:grid-cols-2">
              {discoveryParts.map((part) => {
                const Icon = part.icon;
                return (
                  <motion.div
                    key={part.number}
                    {...fadeUp}
                    className="group grid gap-5 border border-black/10 bg-[#F7F4EE] p-7 transition-colors duration-300 hover:border-[#0A65FF]/35 lg:grid-cols-[4.7rem_1fr]"
                  >
                    <div className="flex items-start justify-between gap-4 lg:block">
                      <div className="font-display text-5xl leading-none tracking-[-0.07em] text-[#0A65FF]">{part.number}</div>
                      <div className="mt-1 inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-[#0A65FF] lg:mt-7">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">{part.title}</h3>
                      <p className="mt-4 text-base leading-7 text-black/62">{part.copy}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-black/8 bg-[#111111] py-20 text-white lg:py-24">
          <div className="container">
            <motion.div {...fadeUp} className="grid items-end gap-10 lg:grid-cols-[0.82fr_1.18fr]">
              <div>
                <SectionLabel>Output</SectionLabel>
                <h2 className="font-display text-[clamp(2.6rem,4.8vw,5.2rem)] leading-[0.9] tracking-[-0.06em]">
                  Discovery produces three implementation-ready deliverables.
                </h2>
              </div>
              <p className="max-w-3xl text-lg leading-8 text-white/62">
                The Discovery Process converts interviews, workflow mapping, system evaluation, and governance review into a prioritized operating plan that can guide configuration, automation, integration, migration, testing, and onboarding.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {discoveryOutputs.map((output) => {
                const Icon = output.icon;
                return (
                  <motion.div key={output.number} {...fadeUp} className="flex min-h-full flex-col border border-white/14 bg-white/[0.045] p-7">
                    <div className="flex items-start justify-between gap-5 border-b border-white/14 pb-6">
                      <div>
                        <p className="font-display text-5xl leading-none tracking-[-0.07em] text-[#58B8FF]">{output.number}</p>
                        <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.04em]">{output.title}</h3>
                      </div>
                      <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/8 text-[#58B8FF]">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-6 text-sm leading-7 text-white/64">{output.copy}</p>
                    <div className="mt-6 space-y-4">
                      {output.details.map((detail) => (
                        <div key={detail} className="grid grid-cols-[1rem_1fr] gap-3 text-sm leading-6 text-white/72">
                          <Database className="mt-1 h-3.5 w-3.5 text-[#58B8FF]" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                    {output.note ? (
                      <div className="mt-7 border-t border-white/14 pt-5 text-sm font-semibold leading-6 text-white">
                        “{output.note}”
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="ap-ar-close" className="relative overflow-hidden bg-[#F7F4EE] py-24 lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_16%,rgba(10,101,255,0.1),transparent_30%)]" />
          <div className="container relative">
            <motion.div {...fadeUp} className="grid items-end gap-10 lg:grid-cols-[0.76fr_1.24fr]">
              <div>
                <SectionLabel>Section 2</SectionLabel>
                <h2 className="font-display text-[clamp(2.8rem,5vw,5.6rem)] leading-[0.9] tracking-[-0.06em] text-[#111111]">
                  AP &amp; AR close-system redesign.
                </h2>
              </div>
              <div className="max-w-3xl">
                <p className="text-lg leading-8 text-black/64">
                  After Discovery, Digital Therapy dives into AP &amp; AR. Our clients often operate 15 to 30+ days behind, so we help them redesign close systems &amp; processes and often build custom tools to reduce the monthly close burden.
                </p>
                <div className="mt-7 inline-flex flex-wrap items-center gap-3 border-y border-black/10 py-4">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-black/45">Target close</span>
                  <span className="font-display text-4xl leading-none tracking-[-0.06em] text-[#0A65FF]">3 - 5 days</span>
                  <span className="text-sm font-semibold leading-6 text-black/58">of the next month</span>
                </div>
              </div>
            </motion.div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {closeRedesignPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <motion.div key={pillar.title} {...fadeUp} className="border border-black/10 bg-white/72 p-7 shadow-[0_24px_70px_rgba(16,24,40,0.06)]">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">{pillar.eyebrow}</p>
                        <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#111111]">{pillar.title}</h3>
                      </div>
                      <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#0A65FF]/16 bg-[#0A65FF]/8 text-[#0A65FF]">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-6 text-base leading-7 text-black/62">{pillar.copy}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div {...fadeUp} className="mt-16 grid gap-8 border border-black/10 bg-[#111111] p-8 text-white lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#58B8FF]">Operating outcome</p>
                <h3 className="mt-5 font-display text-[clamp(2.2rem,4vw,4.2rem)] leading-[0.9] tracking-[-0.06em]">
                  Close in the first 3 - 5 days of the next month.
                </h3>
              </div>
              <div className="grid gap-4 text-sm leading-7 text-white/68 sm:grid-cols-2">
                <div className="border-l border-white/18 pl-5">
                  AP and AR workflows are redesigned around clear ownership, recurring checkpoints, approval discipline, and exception visibility.
                </div>
                <div className="border-l border-white/18 pl-5">
                  Custom tools are introduced where off-the-shelf systems leave gaps, reducing manual work and turning the monthly close into a managed operating rhythm.
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="mt-8 border border-black/10 bg-white/78 p-7 shadow-[0_24px_70px_rgba(16,24,40,0.06)] lg:p-9">
              <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Illustrative case example</p>
                  <h3 className="mt-4 font-display text-[clamp(2rem,3vw,3.2rem)] leading-[0.94] tracking-[-0.06em] text-[#111111]">
                    From close backlog to first-week operating rhythm.
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-black/56">
                    Example scenario, not a quoted client result: a multi-entity family office enters each month 20+ days behind, with AP approvals, AR follow-up, reconciliations, and reporting evidence scattered across inboxes, spreadsheets, and accounting exports.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border-l border-black/10 pl-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/42">Before</p>
                    <p className="mt-3 text-sm leading-7 text-black/62">
                      Month-end remains unresolved deep into the following month, limiting timely visibility into cash, vendor obligations, receivables, and entity-level performance.
                    </p>
                  </div>
                  <div className="border-l border-black/10 pl-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/42">DT intervention</p>
                    <p className="mt-3 text-sm leading-7 text-black/62">
                      Digital Therapy maps the close, redesigns ownership and checkpoints, then builds lightweight exception dashboards and approval tooling around the accounting system.
                    </p>
                  </div>
                  <div className="border-l border-[#0A65FF]/35 pl-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0A65FF]">Impact</p>
                    <p className="mt-3 text-sm leading-7 text-black/62">
                      The office shifts from reactive cleanup to a managed close calendar, giving leaders a practical path toward the first 3 - 5 days of the next month target.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#F7F4EE] py-20 lg:py-24">
          <div className="container flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Start with Discovery</p>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.4rem,4.2vw,4.6rem)] leading-[0.92] tracking-[-0.06em]">
                Establish the operating facts before prescribing the system.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrivateBriefingButton />
              <ContactFormDialog variant="secondary" label="Contact" context="our approach page footer contact" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
