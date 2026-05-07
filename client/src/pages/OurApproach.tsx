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
          <div className="container grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
            <motion.div {...fadeUp}>
              <SectionLabel>Output</SectionLabel>
              <h2 className="font-display text-[clamp(2.6rem,4.8vw,5.2rem)] leading-[0.9] tracking-[-0.06em]">
                Discovery turns ambiguity into a build-ready operating specification.
              </h2>
            </motion.div>
            <motion.div {...fadeUp} className="grid gap-4 sm:grid-cols-2">
              {[
                ["Priorities", "Stakeholders align on the transformation goals that matter most."],
                ["Workflows", "Actions, transactions, and data flows are mapped across departments."],
                ["Systems", "Software, accounting, access, and integration requirements are defined."],
                ["V1 Spec", "Rules, automation logic, scoring rubrics, and triage methodology guide design."],
              ].map(([title, copy]) => (
                <div key={title} className="border-t border-white/16 pt-5">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-[#58B8FF]" />
                    <h3 className="text-lg font-semibold tracking-[-0.03em]">{title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/62">{copy}</p>
                </div>
              ))}
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
