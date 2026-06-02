/**
 * Digital Therapy Capabilities page.
 * Moves the capabilities narrative out of the Home page and adds the typical customer requests
 * using the established quiet-luxury family-office visual system.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { caseStudies } from "@/data/caseStudies";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Building2,
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
const markUrl = "/dt-mark.webp";
const wealthMapVisual = "/dt-talk-to-your-data.webp";
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
    title: "Entity + Cashflow Mapping",
    copy: "Entity, trust, account, investment, real-estate, and operating-company views organized into one trusted map.",
    icon: Network,
    tool: "/entity-cashflow-mapping.webp",
    toolAlt: "Entity + Cashflow Mapping tool diagram",
  },
  {
    title: "Warehouse & Data-Aggregation",
    copy: "Unify your data by connecting every source to your DT On-Prem central warehouse. We can migrate any data repository including legacy mainframe & green screen systems.",
    icon: Sparkles,
    tool: "/warehouse.webp",
    toolAlt: "Digital Therapy data warehouse diagram",
    toolButtonLabel: "See warehouse diagram",
  },
  {
    title: "Accounting Systems",
    copy: "Close acceleration, AP and AR workflow improvement, reporting evidence, control design, and automation-forward accounting support.",
    icon: ClipboardCheck,
    tool: "/close-faster.webp",
    toolAlt: "Squeeze your month-end-close down to a week — four-phase framework",
    toolButtonLabel: "See close framework",
  },
  {
    title: "Single pane of glass",
    copy: "Capital calls, notices, statements, subscriptions, document intake, investment data capture, and exception handling for private investments.",
    icon: Building2,
    tool: "/consolidated-financials.webp",
    toolAlt: "Single-pane-of-glass consolidated financial view",
    toolButtonLabel: "See consolidated view",
  },
  {
    title: "Document automation",
    copy: "AI document agents that classify, extract, route, summarize, and preserve source evidence for sensitive family-office materials.",
    icon: FileSearch,
    tool: "/invoice-ocr-ai.webp",
    toolAlt: "Invoice OCR + AI document automation case study",
    toolButtonLabel: "See case study",
  },
  {
    title: "Insights & Reporting",
    copy: "Dashboards, ad-hoc owner questions, scheduled reporting, narrative commentary, and self-serve views tailored to each stakeholder.",
    icon: BarChart3,
    tool: "/insights.webp",
    toolAlt: "Digital Therapy insights and reporting tool",
    toolButtonLabel: "More on Insights",
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
  const [openCaseStudyIndex, setOpenCaseStudyIndex] = useState<number | null>(null);
  const [openTool, setOpenTool] = useState<{ src: string; alt: string; title: string } | null>(null);
  const activeCaseStudy = openCaseStudyIndex !== null ? caseStudies[openCaseStudyIndex] : null;

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
                <img src={wealthMapVisual} alt="Executive talking to a dashboard via voice — sales analytics responding in real time" className="aspect-[16/12] w-full object-cover" width={1536} height={1024}/>
                <div className="absolute bottom-5 left-5 right-5 rounded-[1.35rem] border border-white/70 bg-white/76 p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <img src={markUrl} alt="" className="mt-1 h-10 w-10 object-contain" width={197} height={227}/>
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
          <div className="container">
            <motion.div {...fadeUp} className="max-w-4xl">
              <SectionLabel>Outcomes for family offices</SectionLabel>
              <h2 className="font-display text-[60px] leading-[0.92] tracking-[-0.06em]">
                Transformation Case Studies
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/80">
                Three real Digital Therapy engagements — anonymized in respect of client privacy. Click any card for the full Project Description, Problem State, Solution State, and Impact.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {caseStudies.map((study, index) => (
                <motion.button
                  type="button"
                  key={study.label}
                  onClick={() => setOpenCaseStudyIndex(index)}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                  aria-label={`Open ${study.label} case study`}
                  className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-[1.6rem] border border-black/10 bg-[#F7F4EE] p-7 text-left shadow-[0_18px_50px_rgba(17,17,17,0.05)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0A65FF] hover:shadow-[0_28px_70px_rgba(10,101,255,0.30)] focus:outline-none focus-visible:bg-[#0A65FF] focus-visible:ring-2 focus-visible:ring-[#0A65FF]/55 focus-visible:ring-offset-2"
                >
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0A65FF] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white transition-colors duration-300 group-hover:bg-white group-hover:text-[#0A65FF] group-focus-visible:bg-white group-focus-visible:text-[#0A65FF]">
                    {study.label}
                  </span>
                  <h3 className="mt-6 font-display text-2xl leading-[1.2] tracking-[-0.03em] text-[#111111] transition-colors duration-300 group-hover:text-white group-focus-visible:text-white">
                    {study.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-black/80 transition-colors duration-300 group-hover:text-white/90 group-focus-visible:text-white/90">
                    {study.projectDescription}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF] transition-colors duration-300 group-hover:text-white group-focus-visible:text-white">
                    Read case study
                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Case-study modal: 4-quadrant layout (Project Description / Problem State / Solution State / Impact) */}
          <Dialog open={openCaseStudyIndex !== null} onOpenChange={(v) => !v && setOpenCaseStudyIndex(null)}>
            <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[1100px] sm:rounded-[2rem]">
              {activeCaseStudy ? (
                <>
                  <DialogHeader className="border-b border-black/10 bg-white px-8 pb-7 pt-8 text-left sm:px-10 sm:pt-10">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                      Case Study · {activeCaseStudy.label}
                    </p>
                    <DialogTitle className="mt-3 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-[#111111] sm:text-4xl">
                      {activeCaseStudy.title}
                    </DialogTitle>
                    <p className="mt-3 text-xs italic text-black/55">
                      Case studies anonymized in respect of client privacy.
                    </p>
                  </DialogHeader>
                  <div className="grid gap-px overflow-hidden bg-black/10 sm:grid-cols-2">
                    {[
                      { label: "Project Description", body: activeCaseStudy.projectDescription },
                      { label: "Problem State", body: activeCaseStudy.problemState },
                      { label: "Solution State", body: activeCaseStudy.solutionState },
                      { label: "Impact", body: activeCaseStudy.impact },
                    ].map((quadrant, quadrantIndex) => (
                      <div key={quadrant.label} className="bg-[#F7F4EE] px-8 py-7 sm:px-10 sm:py-9">
                        <p className="flex items-center gap-2.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A65FF] text-[0.75rem] font-bold text-white">
                            {quadrantIndex + 1}
                          </span>
                          {quadrant.label}
                        </p>
                        <p className="mt-3 text-base leading-7 text-black/85">{quadrant.body}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </DialogContent>
          </Dialog>
        </section>

        {/* Tool lightbox — opens when "See the tool" is clicked on any capability card */}
        <Dialog open={openTool !== null} onOpenChange={(v) => !v && setOpenTool(null)}>
          <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[1280px] sm:rounded-[2rem]">
            {openTool ? (
              <>
                <DialogHeader className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <DialogTitle className="font-display text-3xl tracking-[-0.04em] sm:text-4xl">{openTool.title}</DialogTitle>
                </DialogHeader>
                <div className="px-8 pb-8 pt-6 sm:px-10 sm:pb-10">
                  <img
                    src={openTool.src}
                    alt={openTool.alt}
                    className="block w-full rounded-2xl border border-black/10 bg-white" width={1536} height={1024}/>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

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
                const tool = "tool" in capability ? (capability as { tool?: string; toolAlt?: string; toolButtonLabel?: string }).tool : undefined;
                const toolAlt = "toolAlt" in capability ? (capability as { tool?: string; toolAlt?: string; toolButtonLabel?: string }).toolAlt : undefined;
                const toolButtonLabel = "toolButtonLabel" in capability ? (capability as { tool?: string; toolAlt?: string; toolButtonLabel?: string }).toolButtonLabel : undefined;
                return (
                  <motion.article
                    key={capability.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                    className="group relative min-h-[330px] border border-black/10 bg-white/72 p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#0A65FF] hover:bg-white hover:ring-2 hover:ring-[#0A65FF] hover:ring-offset-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">0{index + 1}</span>
                      <Icon className="h-6 w-6 text-black/48 transition-colors duration-300 group-hover:text-[#0A65FF]" />
                    </div>
                    <h3 className="mt-16 text-2xl font-semibold tracking-[-0.04em]">{capability.title}</h3>
                    <p className="mt-4 leading-7 text-black/78">{capability.copy}</p>
                    {tool ? (
                      <button
                        type="button"
                        onClick={() => setOpenTool({ src: tool, alt: toolAlt ?? capability.title, title: capability.title })}
                        className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 rounded-full bg-[#0A65FF] px-4 py-2 text-xs font-semibold text-white opacity-0 shadow-[0_12px_30px_rgba(10,101,255,0.30)] transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-[#004ed1] focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#0A65FF]/55 focus-visible:ring-offset-2"
                      >
                        {toolButtonLabel ?? "See the tool"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] shadow-[0_28px_80px_rgba(16,24,40,0.1)]">
              <img src={securityVisual} alt="Secure automation and AI workflow visualization" className="aspect-[16/12] w-full object-cover" width={1920} height={1080}/>
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
                src="/balance-scale.webp"
                alt="Balance scale weighing Speed & Intelligence against Security & Privacy, with the message: You need both. And we can give that to you."
                className="mt-10 w-full rounded-2xl border border-white/10" loading="lazy" decoding="async" width={1200} height={800}/>
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
