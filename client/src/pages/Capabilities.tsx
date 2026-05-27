/**
 * Digital Therapy Capabilities page.
 * Moves the capabilities narrative out of the Home page and adds the typical customer requests
 * using the established quiet-luxury family-office visual system.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BarChart3,
  Bot,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileSearch,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useState } from "react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/dt-mark.png";
const wealthMapVisual = "/dt-talk-to-your-data.png";
const securityVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_security_automation-Z4CfAdsU9T8pybHF6A7NLi.webp";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

const capabilities = [
  {
    title: "Entity + Revenue mapping",
    copy: "Entity, trust, account, investment, real-estate, and operating-company views organized into one trusted map.",
    icon: Network,
  },
  {
    title: "AI Data-Aggregation",
    copy: "Unify your data by connecting every source to your DT On-Prem central warehouse. We can migrate any data repository including legacy mainframe & green screen systems.",
    icon: Sparkles,
  },
  {
    title: "Accounting Systems",
    copy: "Close acceleration, AP and AR workflow improvement, reporting evidence, control design, and automation-forward accounting support.",
    icon: ClipboardCheck,
  },
  {
    title: "Alternatives workflows",
    copy: "Capital calls, notices, statements, subscriptions, document intake, investment data capture, and exception handling for private investments.",
    icon: Building2,
  },
  {
    title: "Document automation",
    copy: "AI document agents that classify, extract, route, summarize, and preserve source evidence for sensitive family-office materials.",
    icon: FileSearch,
  },
  {
    title: "Custom reporting",
    copy: "Dashboards, ad-hoc owner questions, scheduled reporting, narrative commentary, and self-serve views tailored to each stakeholder.",
    icon: BarChart3,
  },
];

// PLACEHOLDER PROBLEM STATEMENTS — inferred from each solution. Replace with brand-voice copy.
const problemSolutionPairs = [
  {
    problem: "Sensitive data is scattered across systems with no clear source of truth.",
    solution: "A unified, secure system they can trust with their most sensitive data.",
  },
  {
    problem: "Generic SaaS tools force lean teams to wrestle with bloated workflows.",
    solution: "Personalized, flexible solutions enabling lean teams to manage volume and complexity.",
  },
  {
    problem: "Manual, repetitive tasks consume hours that should go to higher-value work.",
    solution: "Automation to supplant tedious processes and dramatically save time.",
  },
  {
    problem: "Big Firm tax & accounting fees keep rising while internal overhead grows.",
    solution: "Reduced Big Firm tax bills and internal accounting burden.",
  },
  {
    problem: "Cloud LLMs expose family-office data to third parties and external risk.",
    solution: "On-premise deployment — LLMs offline, data fully within their control.",
  },
  {
    problem: "Ad-hoc questions require chasing analysts and waiting for one-off reports.",
    solution: "Rich, 24/7 self-serve ad-hoc reporting on any asset, project, or investment.",
  },
];

const deliveryLayers = [
  {
    eyebrow: "01",
    title: "Data foundation",
    copy: "Digital Therapy starts by establishing governed source-of-truth logic across entities, assets, accounts, documents, and roles.",
    icon: Database,
  },
  {
    eyebrow: "02",
    title: "Workflow automation",
    copy: "Manual intake, reconciliation, approvals, reporting cycles, and recurring tasks become controlled operating workflows.",
    icon: Workflow,
  },
  {
    eyebrow: "03",
    title: "AI operating intelligence",
    copy: "LLM-enabled tools are designed around privacy, access rules, retrieval boundaries, and practical owner questions.",
    icon: Bot,
  },
  {
    eyebrow: "04",
    title: "Security and control",
    copy: "Role-based access, private infrastructure options, auditability, and deployment patterns keep the office in control.",
    icon: ShieldCheck,
  },
];

function PrivateBriefingButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  return <BookingWidgetDialog variant={variant} context="capabilities page family-office booking" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

export default function Capabilities() {
  const [openPairIndex, setOpenPairIndex] = useState<number | null>(null);
  const activePair = openPairIndex !== null ? problemSolutionPairs[openPairIndex] : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        activeLabel="Capabilities"
        bookingContext="capabilities page family-office booking"
        contactContext="capabilities page navigation contact"
      />

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-black/8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(10,101,255,0.11),transparent_34%),linear-gradient(115deg,#F7F4EE_0%,#FFFFFF_54%,#EEF4FF_100%)]" />
          <div className="container relative grid min-h-[calc(100vh-5rem)] items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
            <motion.div {...fadeUp}>
              <SectionLabel>Capabilities built for complex wealth</SectionLabel>
              <h1 className="max-w-4xl font-display text-[60px] leading-[0.88] tracking-[-0.07em] text-[#111111]">
                Ask your data anything!
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/80">
                Digital Therapy builds private data, automation, accounting, and reporting capabilities for family offices that need confidence across sensitive information, complex assets, and lean operating teams.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <BookingWidgetDialog variant="primary" context="capabilities page family-office booking" label="Show me!" />
                <a
                  href="#typical-requests"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/55 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  See more solutions
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 35 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" as const }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2.8rem] bg-[#0A65FF]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white shadow-[0_42px_110px_rgba(16,24,40,0.14)]">
                <img src={wealthMapVisual} alt="Executive talking to a dashboard via voice — sales analytics responding in real time" className="aspect-[16/12] w-full object-cover" />
                <div className="absolute bottom-5 left-5 right-5 rounded-[1.35rem] border border-white/70 bg-white/76 p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <img src={markUrl} alt="" className="mt-1 h-10 w-10 object-contain" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">Talk to your data</div>
                      <p className="mt-2 text-sm leading-6 text-black/82">Once your data is unified &amp; configured, query your collective database by just asking questions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="typical-requests" className="bg-white py-24 lg:py-32">
          <div className="container grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <motion.div {...fadeUp}>
              <SectionLabel>Typical Family Office Solutions</SectionLabel>
              <h2 className="font-display text-[60px] leading-[0.92] tracking-[-0.06em]">
                Problems + Solutions
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/80">
                Family offices seek practical outcomes. They tend to choose solutions that prioritize:
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-6 text-lg leading-8 text-black/80 marker:font-semibold marker:text-[#0A65FF]">
                <li>Security</li>
                <li>Privacy</li>
                <li>Control</li>
                <li>Independence</li>
                <li>Reduce operational burden</li>
                <li>Increase speed by automation</li>
              </ol>
              <p className="mt-6 text-lg leading-8 text-black/80">
                As long as their preferences &amp; priorities aren&rsquo;t compromised in the process.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {problemSolutionPairs.map((pair, index) => (
                <motion.button
                  type="button"
                  key={pair.solution}
                  onClick={() => setOpenPairIndex(index)}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                  aria-label={`Open problem and solution detail for: ${pair.problem}`}
                  className="group relative min-h-[190px] overflow-hidden border border-black/10 bg-[#F7F4EE] p-6 text-left transition-all duration-500 hover:-translate-y-1 hover:border-[#0A65FF]/35 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/50"
                >
                  {/* Problem — default state */}
                  <div className="flex items-start gap-4 transition-opacity duration-300 group-hover:opacity-0">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/80 text-white">
                      <AlertCircle className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-black/55">Problem</div>
                      <p className="mt-2 text-base leading-7 text-black/85">{pair.problem}</p>
                    </div>
                  </div>
                  {/* Solution — revealed on hover */}
                  <div className="absolute inset-0 flex items-start gap-4 bg-white p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Solution</div>
                      <p className="mt-2 text-base leading-7 text-black/85">{pair.solution}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <Dialog open={openPairIndex !== null} onOpenChange={(v) => !v && setOpenPairIndex(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="font-display text-3xl tracking-[-0.04em]">Problem &amp; Solution</DialogTitle>
              </DialogHeader>
              {activePair && (
                <div className="mt-2 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-[#F7F4EE] p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/80 text-white">
                        <AlertCircle className="h-4 w-4" />
                      </span>
                      <div className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-black/55">Problem</div>
                    </div>
                    <p className="mt-4 text-lg leading-8 text-black/85">{activePair.problem}</p>
                  </div>
                  <div className="rounded-2xl border border-[#0A65FF]/25 bg-[#0A65FF]/8 p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                        <Check className="h-4 w-4" />
                      </span>
                      <div className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Solution</div>
                    </div>
                    <p className="mt-4 text-lg leading-8 text-black/85">{activePair.solution}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </section>

        <section className="bg-[#F7F4EE] py-24 lg:py-32">
          <div className="container">
            <motion.div {...fadeUp} className="max-w-4xl">
              <SectionLabel>Core capabilities</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.6rem)] leading-[0.92] tracking-[-0.06em]">
                Digital Therapy offers a toolbox for complex wealth.
              </h2>
            </motion.div>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {capabilities.map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <motion.article
                    key={capability.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                    className="group min-h-[330px] border border-black/10 bg-white/72 p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#0A65FF]/35 hover:bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">0{index + 1}</span>
                      <Icon className="h-6 w-6 text-black/48 transition-colors duration-300 group-hover:text-[#0A65FF]" />
                    </div>
                    <h3 className="mt-16 text-2xl font-semibold tracking-[-0.04em]">{capability.title}</h3>
                    <p className="mt-4 leading-7 text-black/78">{capability.copy}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] shadow-[0_28px_80px_rgba(16,24,40,0.1)]">
              <img src={securityVisual} alt="Secure automation and AI workflow visualization" className="aspect-[16/12] w-full object-cover" />
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <SectionLabel>Delivery architecture</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.5rem)] leading-[0.92] tracking-[-0.06em]">
                Fully integrated & securely on-prem.
              </h2>
              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {deliveryLayers.map((layer, index) => {
                  const Icon = layer.icon;
                  return (
                    <motion.div
                      key={layer.title}
                      {...fadeUp}
                      transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                      className="border-t border-black/10 pt-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">{layer.eyebrow}</span>
                        <Icon className="h-5 w-5 text-black/42" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em]">{layer.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-black/80">{layer.copy}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#111111] py-24 text-white lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(10,101,255,0.34),transparent_35%),linear-gradient(135deg,#111111_0%,#1C1C1C_100%)]" />
          <div className="container relative grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div {...fadeUp}>
              <SectionLabel>Private by design</SectionLabel>
              <h2 className="font-display text-[44px] leading-[1.1] tracking-[-0.04em] text-white">
                Privacy &amp; Security are paramount!<br />
                But so is Speed &amp; Intelligence.<br />
                How do you choose?
              </h2>
              <img
                src="/balance-scale.png"
                alt="Balance scale weighing Speed & Intelligence against Security & Privacy, with the message: You need both. And we can give that to you."
                className="mt-10 w-full rounded-2xl border border-white/10"
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="border border-white/12 bg-white/[0.06] p-8 backdrop-blur-xl">
              <p className="text-xl leading-9 text-white/70">
                Digital Therapy works fluently across cloud platforms, but prefers deploying wholly-owned, custom applications on-prem. We run AI models offline by default &mdash; toggled online only for updates or short-lived tasks &mdash; and install identity-based access management that handles permissions by role, project, entity, title, or any attribute you assign.
              </p>
              <p className="mt-6 text-xl leading-9 text-white/70">
                <strong className="font-bold text-[#0A65FF]">Our Mission:</strong> Deliver speed &amp; intelligence to family offices without compromising privacy &amp; security.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <PrivateBriefingButton />
                <ContactFormDialog
                  variant="secondary"
                  label="Discuss requirements"
                  context="capabilities page requirements discussion"
                />
              </div>
            </motion.div>
          </div>
        </section>
      </main>

    </div>
  );
}
