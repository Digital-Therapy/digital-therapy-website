/**
 * Digital Therapy Thesis page.
 * Presents the structural consulting problem and Digital Therapy's Fusion Team solution
 * using the established quiet-luxury family-office visual system.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Building2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Code2,
  Database,
  GitBranch,
  Layers3,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
  XCircle,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/dt-mark.png";
const boardroomVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_family_office_boardroom-UvecEVLEaVqpouVEhEb9mw.webp";
const wealthMapVisual = "/fragmented-route.png";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

const problemSignals = [
  "Fragmented delivery",
  "Slow execution",
  "Political friction",
  "Misaligned incentives",
  "Incomplete Discovery",
  "Poor adoption",
];

const structuralFailures = [
  {
    eyebrow: "01",
    title: "Silo culture & professional bias",
    copy: "Accountants, engineers, operations consultants, and finance teams often work beside each other rather than as one unit. Professional bias compounds the divide: CPAs may resist AI and automation, engineers may lack accounting fluency, and operators may lack the technical depth required to architect scalable systems.",
    icon: UsersRound,
  },
  {
    eyebrow: "02",
    title: "Misaligned incentives",
    copy: "“Eat what you kill” compensation models reward partners for bringing in business — not for collaborating. Service line leaders are unmotivated to cross-sell from different departments for fear of losing control over their clients. Cross-selling becomes a reactive scramble for revenue.",
    icon: GitBranch,
  },
  {
    eyebrow: "03",
    title: "Transfer pricing dysfunction",
    copy: "When one practice controls the client and borrows talent from another at discounted internal rates, specialists avoid low-margin assignments, teams compete for profitable work, and delivery quality deteriorates before the client receives a durable outcome.",
    icon: CircleDollarSign,
  },
];

const fusionDisciplines = [
  {
    title: "Operations Expert",
    role: "Process architecture, workflow optimization, SOPs, playbooks, KPI design, delivery systems, and organizational clarity.",
    outcome: "Transforms operational chaos into structured, scalable systems by mapping current-state workflows, identifying bottlenecks, and designing future-state processes.",
    icon: Workflow,
    image: "/process-sme.png",
    imageAlt: "Hand-drawn blue sketch of Digital Therapy's Operations & Process SME",
  },
  {
    title: "Accounting Expert",
    role: "Automation-forward accounting operations, AP and AR transformation, close acceleration, data integrity, workflow sequencing, AI, and RPA.",
    outcome: "Connects finance, operations, and technology so controls, reporting evidence, system dependencies, and implementation realities are designed together.",
    icon: ClipboardCheck,
    image: "/arap-sme.png",
    imageAlt: "Hand-drawn blue sketch of Hunter, Digital Therapy's Finance & Accounting SME",
  },
  {
    title: "Technology Expert",
    role: "Full-stack engineering, data architecture, AI systems, integrations, robotic process automation, and technical execution.",
    outcome: "Acts as a systems architect who understands operational and financial realities alongside engineering requirements.",
    icon: Code2,
    image: "/tech-sme.png",
    imageAlt: "Hand-drawn blue sketch of Milton Rodas, Digital Therapy's Technology SME",
  },
];

const comparisonRows = [
  ["Operating structure", "Competing practice groups", "One permanent Fusion Team"],
  ["Economics", "Transfer pricing and utilization politics", "Shared incentives and unified accountability"],
  ["Delivery rhythm", "Fragmented handoffs across departments", "Integrated execution across operations, accounting, and technology"],
  ["Technology adoption", "Bolted-on tools after advisory work", "Data, automation, AI, and workflow design embedded from day one"],
];

const solutionPrinciples = [
  "No transfer pricing conflict",
  "No talent hoarding",
  "No internal competition",
  "No fragmented accountability",
];

function PrivateBriefingButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  return <BookingWidgetDialog variant={variant} context="thesis page family-office booking" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

export default function Thesis() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        activeLabel="Thesis"
        bookingContext="thesis page family-office booking"
        contactContext="thesis page navigation contact"
      />

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-black/8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(10,101,255,0.11),transparent_34%),linear-gradient(115deg,#F7F4EE_0%,#FFFFFF_52%,#EEF4FF_100%)]" />
          <div className="container relative grid min-h-[calc(100vh-5rem)] items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
            <motion.div {...fadeUp}>
              <SectionLabel>The Digital Therapy thesis</SectionLabel>
              <h1 className="max-w-4xl font-display text-[60px] leading-[0.88] tracking-[-0.07em] text-[#111111]">
                Practice based firms<br />fall short.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/80">
                Most transformation initiatives fail — not because firms lack smart people — because firm structure & culture rewards silo behavior & disincentivizes cross-functional collaboration. Digital Therapy solves this fragmentation with a “Fusion Team” — custom built & trained to overcome complex business & data challenges touching Operations, Accounting, & Technology. These days, that’s just about everything.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrivateBriefingButton />
                <a
                  href="#solution"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/55 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  See the solution
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
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
                <img src={boardroomVisual} alt="Integrated advisory team strategy session" className="aspect-[16/12] w-full object-cover" />
                <div className="absolute bottom-5 left-5 right-5 rounded-[1.35rem] border border-white/70 bg-white/76 p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <img src={markUrl} alt="" className="mt-1 h-9 w-9 object-contain" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">Fusion Team model</p>
                      <p className="mt-2 text-sm leading-6 text-black/82">
                        One accountable unit beneath the CEO: operations, accounting, and technology working from the same mission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="problem" className="bg-white py-24 lg:py-32">
          <div className="container grid items-start gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div {...fadeUp} className="sticky top-28">
              <SectionLabel>The problem</SectionLabel>
              <h2 className="max-w-3xl font-display text-[clamp(2.7rem,5vw,5.4rem)] leading-[0.9] tracking-[-0.06em]">
                Firm architecture prevents effective collaboration.
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-black/80">
                Accounting practices operate independently from engineering teams. Operations consultants work separately from finance. Each group protects its own revenue, utilization, and client control, producing predictable delivery failures for clients with one shared systems problem.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {problemSignals.map((signal) => {
                  const [firstWord, ...restWords] = signal.split(" ");
                  return (
                    <div key={signal} className="rounded-full border border-black/10 bg-[#F7F4EE] px-4 py-3 text-center text-[14px] font-medium uppercase leading-tight tracking-[0.14em] text-black/80">
                      {firstWord}
                      {restWords.length ? (
                        <>
                          <br />
                          {restWords.join(" ")}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <div className="grid gap-5">
              {structuralFailures.map((failure, index) => {
                const Icon = failure.icon;
                return (
                  <motion.article
                    key={failure.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                    className="group relative overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] p-7 shadow-[0_24px_70px_rgba(17,17,17,0.07)]"
                  >
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#0A65FF]/8 blur-2xl" />
                    <div className="relative flex items-start gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] border border-black/8 bg-white text-[#0A65FF]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">{failure.eyebrow}</p>
                        <h3 className="mt-2 font-display text-3xl tracking-[-0.05em]">{failure.title}</h3>
                        <p className="mt-4 text-base leading-7 text-black/80">{failure.copy}</p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="container">
            <motion.div {...fadeUp} className="mx-auto max-w-4xl">
              <SectionLabel>How Digital Therapy works</SectionLabel>
              <h2 className="font-display text-[55px] leading-[0.92] tracking-[-0.065em] text-[#111111]">
                Built to work differently.
              </h2>
              <div className="mt-10 space-y-6 text-lg leading-8 text-black/85">
                <p>
                  Most transformation programs fail because the team doing the work never bothers to learn how the business actually runs. They optimize in a vacuum, automate broken processes, and hand over solutions that don&rsquo;t survive first contact with real operations.
                </p>
                <p>
                  Digital Therapy was built to work differently. We focus on the intersection of technology, operations, and accounting &mdash; three functions that have to move together for transformation to stick. Before we touch a system, we learn the business: how it makes money, where the bottlenecks live, how leadership makes decisions, and what the team on the ground actually deals with day to day.
                </p>
                <p>
                  That diagnostic-first approach is what allows us to deliver outcomes that hold, not just impressive demos that collapse after the first month. Our team brings backgrounds that don&rsquo;t naturally converge in the market: senior technologists, finance operators, and process designers working as a single unit, not siloed workstreams trading handoffs and playing pass the buck.
                </p>
              </div>
              <p className="mt-8 border-l-2 border-[#0A65FF] pl-6 font-display text-2xl leading-[1.3] tracking-[-0.02em] text-[#111111]">
                The result is modernization you control &mdash; with infrastructure, processes, and reporting that scale on your terms.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="solution" className="relative overflow-hidden bg-[#F7F4EE] py-24 lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(10,101,255,0.10),transparent_30%)]" />
          <div className="container relative">
            <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center">
              <SectionLabel>Fusion teams by digital therapy</SectionLabel>
              <h2 className="font-display text-[55px] leading-[0.9] tracking-[-0.065em]">
                One trained team.<br />Not “collaborating” practices.
              </h2>
              <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-black/80">
                Digital Therapy’s Fusion Team model was built to eliminate structural failure at the root. Rather than assembling temporary teams from competing departments, the Fusion Team is a permanent leadership layer composed of deeply aligned operations, accounting, and technology disciplines.
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="mt-14 grid gap-4 md:grid-cols-4">
              {solutionPrinciples.map((principle) => (
                <div key={principle} className="rounded-[1.6rem] border border-black/8 bg-white/70 p-5 text-center shadow-[0_18px_50px_rgba(17,17,17,0.06)] backdrop-blur">
                  <BadgeCheck className="mx-auto h-6 w-6 text-[#0A65FF]" />
                  <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-black/85">{principle}</p>
                </div>
              ))}
            </motion.div>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {fusionDisciplines.map((discipline, index) => {
                return (
                  <motion.article
                    key={discipline.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                    className="rounded-[2rem] border border-black/8 bg-white p-7 shadow-[0_30px_80px_rgba(17,17,17,0.08)]"
                  >
                    <img
                      src={discipline.image}
                      alt={discipline.imageAlt}
                      className="h-24 w-24 shrink-0 rounded-[1.4rem] border border-black/10 bg-white object-cover shadow-[0_16px_35px_rgba(10,101,255,0.10)]"
                    />
                    <h3 className="mt-6 font-display text-3xl tracking-[-0.05em]">
                      {(() => {
                        const [firstWord, ...rest] = discipline.title.split(" ");
                        return (
                          <>
                            <span className="text-[#0A65FF]">{firstWord}</span>
                            {rest.length ? ` ${rest.join(" ")}` : null}
                          </>
                        );
                      })()}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-black/80">{discipline.role}</p>
                    <p className="mt-5 border-t border-black/10 pt-5 text-base leading-7 text-black/85">{discipline.outcome}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2.2rem] border border-black/8 bg-[#F7F4EE] p-3 shadow-[0_30px_90px_rgba(17,17,17,0.10)]">
              <img src={wealthMapVisual} alt="Diagram of the fragmented advisory route family offices take" className="h-[560px] w-full rounded-[1.75rem] object-cover" />
              <div className="absolute bottom-8 left-8 right-8 rounded-[1.45rem] border border-white/70 bg-white/78 p-5 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">One systems problem</p>
                <p className="mt-2 text-sm leading-6 text-black/82">
                  Modern family offices no longer have separate technology, operations, and accounting challenges. They have one systems problem.
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <SectionLabel>Why family offices need this</SectionLabel>
              <h2 className="font-display text-[55px] leading-[0.9] tracking-[-0.06em]">
                Fragmented advisors isn’t the road to success.
              </h2>
              <p className="mt-7 text-lg leading-8 text-black/80">
                Family-office leaders need one team that can see the full architecture: process, controls, data, workflow, automation, AI, integrations, and execution discipline. The Fusion Team succeeds or fails together, so collaboration is no longer optional; it is the operating model itself.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Single operating model", icon: Layers3 },
                  { title: "Aligned incentive structure", icon: ShieldCheck },
                  { title: "Integrated data foundation", icon: Database },
                  { title: "Automation-ready delivery", icon: BrainCircuit },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-3 border-t border-black/10 pt-4">
                      <Icon className="h-5 w-5 text-[#0A65FF]" />
                      <span className="text-sm font-bold uppercase tracking-[0.14em] text-black/85">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#111111] py-24 text-white lg:py-32">
          <div className="container">
            <motion.div {...fadeUp} className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <SectionLabel>Traditional Advisory vs. Fusion Teams</SectionLabel>
                <h2 className="font-display text-[54px] leading-[0.9] tracking-[-0.06em]">
                  Small changes.<br />Big Impact.
                </h2>
                <p className="mt-7 text-lg leading-8 text-white/62">
                  Traditional firms attempt collaboration between competing departments. Fusion Teams eliminate the competition entirely by creating one shared mission and one accountable delivery structure.
                </p>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.04]">
                {comparisonRows.map(([dimension, traditional, fusion], index) => (
                  <div key={dimension} className="grid gap-0 border-b border-white/10 last:border-b-0 md:grid-cols-[0.8fr_1fr_1fr]">
                    <div className="bg-white/[0.04] px-5 py-5 text-xs font-bold uppercase tracking-[0.18em] text-white/58">{dimension}</div>
                    <div className="flex items-start gap-3 px-5 py-5 text-sm leading-6 text-white/58">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-white/34" />
                      {traditional}
                    </div>
                    <div className="flex items-start gap-3 px-5 py-5 text-sm font-semibold leading-6 text-white">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#6EA8FF]" />
                      {fusion}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#F7F4EE] py-24 lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(10,101,255,0.10),transparent_30%)]" />
          <div className="container relative text-center">
            <motion.div {...fadeUp} className="mx-auto max-w-4xl">
              <SectionLabel>Your fusion team can do it</SectionLabel>
              <h2 className="font-display text-[55px] leading-[0.88] tracking-[-0.07em]">
                Family offices need one solution team<br />for one fused problem.
              </h2>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/80">
                Digital Therapy delivers one team, one aligned incentive structure, one operating model, and one shared mission for transformation.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <PrivateBriefingButton />
                <a
                  href="/process"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/60 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  Understand our process.
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
