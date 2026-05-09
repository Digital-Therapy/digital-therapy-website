/**
 * Digital Therapy Capabilities page.
 * Moves the capabilities narrative out of the Home page and adds the typical customer requests
 * using the established quiet-luxury family-office visual system.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileSearch,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/manus-storage/DTLOGO_PICMARKpng_2cf51494.png";
const wealthMapVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_wealth_map_visual-TmSmhqHi8pgacxaNwHMRxs.webp";
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
    title: "Global wealth mapping",
    copy: "Entity, trust, account, investment, real-estate, and operating-company views organized into one trusted map of the family-office universe.",
    icon: Network,
  },
  {
    title: "AI aggregation",
    copy: "Secure intelligence layers that collect, reconcile, summarize, and answer questions across approved documents, systems, and workflows.",
    icon: Sparkles,
  },
  {
    title: "Accounting operations",
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

const customerRequests = [
  "A unified, secure system they can trust with their most sensitive data.",
  "Personalized, flexible solutions enabling lean teams to manage volume and complexity.",
  "Automation to supplant tedious processes and dramatically save time.",
  "Reduced Big Firm tax bills and internal accounting burden.",
  "On-premise deployment — LLMs offline, data fully within their control.",
  "Rich, 24/7 self-serve ad-hoc reporting on any asset, project, or investment.",
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
              <h1 className="max-w-4xl font-display text-[clamp(3.3rem,7vw,7.6rem)] leading-[0.88] tracking-[-0.07em] text-[#111111]">
                Everything required to answer the owner’s next question.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/62">
                Digital Therapy builds private data, automation, accounting, and reporting capabilities for family offices that need confidence across sensitive information, complex assets, and lean operating teams.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrivateBriefingButton />
                <a
                  href="#typical-requests"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/55 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  View customer requests
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
                <img src={wealthMapVisual} alt="Total wealth map visualization" className="aspect-[16/12] w-full object-cover" />
                <div className="absolute bottom-5 left-5 right-5 rounded-[1.35rem] border border-white/70 bg-white/76 p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <img src={markUrl} alt="" className="mt-1 h-10 w-10 object-contain" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">One governed view</div>
                      <p className="mt-2 text-sm leading-6 text-black/66">Assets, documents, workflows, and owner questions connected through a secure operating layer.</p>
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
              <SectionLabel>Typical customer requests</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.6rem)] leading-[0.92] tracking-[-0.06em]">
                What sophisticated offices ask for first.
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/62">
                These requests show the practical outcomes family offices want: trust, control, self-service intelligence, lower operating burden, and automation that respects the sensitivity of the data.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {customerRequests.map((request, index) => (
                <motion.div
                  key={request}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                  className="group min-h-[190px] border border-black/10 bg-[#F7F4EE] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#0A65FF]/35 hover:bg-white"
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <p className="text-base leading-7 text-black/70">{request}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F7F4EE] py-24 lg:py-32">
          <div className="container">
            <motion.div {...fadeUp} className="max-w-4xl">
              <SectionLabel>Core capabilities</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.6rem)] leading-[0.92] tracking-[-0.06em]">
                The operating toolkit for complex wealth.
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
                    <p className="mt-4 leading-7 text-black/58">{capability.copy}</p>
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
                Built as a secure operating layer, not another isolated tool.
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
                      <p className="mt-3 text-sm leading-6 text-black/60">{layer.copy}</p>
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
              <h2 className="font-display text-[clamp(2.8rem,5.5vw,6rem)] leading-[0.9] tracking-[-0.065em] text-white">
                Sensitive data deserves a controlled deployment model.
              </h2>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="border border-white/12 bg-white/[0.06] p-8 backdrop-blur-xl">
              <LockKeyhole className="h-8 w-8 text-[#58B8FF]" />
              <p className="mt-8 text-xl leading-9 text-white/70">
                Digital Therapy can design for on-premise deployment, offline LLM operation, restricted data movement, role-based access, and governed self-service reporting so family offices do not have to choose between intelligence and control.
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
