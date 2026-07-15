/**
 * Digital Therapy quiet luxury private-banking interface.
 * Preserve light ivory surfaces, charcoal typography, restrained Digital Therapy blue,
 * image-led section rhythm, and concise family-office advisory positioning.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { caseStudies } from "@/data/caseStudies";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Database,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/dt-mark.webp";
const heroVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_hero_operating_layer-TEdtu9wcNJkxBt4PK2JKyo.webp";
const boardroomVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_family_office_boardroom-UvecEVLEaVqpouVEhEb9mw.webp";
const securityVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_security_automation-Z4CfAdsU9T8pybHF6A7NLi.webp";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

const navItems = [
  { label: "Thesis", href: "/thesis" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "DT Brain", href: "/dt-brain" },
  { label: "Security", href: "#security" },
  { label: "Team", href: "/team" },
];

const complexityPoints = [
  "Legacy systems can\u2019t easily send or receive data or files.",
  "Teams waste time collecting, reconciling, & reformatting data.",
  "Leadership expects fast answers without compromising privacy.",
];

const operatingLayers: {
  eyebrow: string;
  title: string;
  copy: string;
  icon: typeof Database;
  image?: string;
  imageAlt?: string;
  theme: string;
  outcome: string;
}[] = [
  {
    eyebrow: "01",
    title: "Search + Verify",
    copy: "Locate critical records, accounts, entities, and documents across all connected & standalone systems. This includes external storage accounts, back-up systems and legacy systems no matter how old & hard to use.",
    theme: "Know what you have.",
    outcome: "Visibility",
    icon: Database,
    image: "/sigmund-search.webp",
    imageAlt: "Sigmund searching for records",
  },
  {
    eyebrow: "02",
    title: "Connect + Centralize",
    copy: "Aggregate the final list of approved source data into the Warehouse via API, RPA or other workflow automation. All the data must be centralized. If the data is too hard to pull in, we may suggest changing the root system(s).",
    theme: "Create one source of truth.",
    outcome: "Consistency",
    icon: Workflow,
    image: "/sigmund-connect.webp",
    imageAlt: "Sigmund connecting and pulling data from multiple sources",
  },
  {
    eyebrow: "03",
    title: "Clean + Structure",
    copy: "Evaluate integrity and reconcile data across all systems. Understand & troubleshoot discrepancies & redundancies. Then organize into proper table structures. Once properly cleaned & formatted, the data can be made accessible to dashboard & reporting applications and other automation tools.",
    theme: "Make data reliable.",
    outcome: "Confidence",
    icon: BarChart3,
    image: "/sigmund-clean.webp",
    imageAlt: "Sigmund cleaning and organizing data",
  },
  {
    eyebrow: "04",
    title: "Query + Empower",
    copy: "Turn structured data into reporting, automation, and AI-enhanced insights leaders can use to win.",
    theme: "Turn information into action.",
    outcome: "Competitive Advantage",
    icon: ShieldCheck,
    image: "/sigmund-report.webp",
    imageAlt: "Sigmund delivering a report",
  },
];

const fusionTeam = [
  {
    title: "Operations Expert",
    image: "/process-sme.webp",
    imageAlt: "Hand-drawn blue sketch of Digital Therapy's Operations & Process SME",
    copy: "The Operations SME transforms organizational complexity into operational excellence. They specialize in people, process, governance, and execution—building the systems that allow businesses to scale without sacrificing quality or control. They champion efficiency through SOPs, playbooks, KPIs, workflow optimization, and continuous improvement.\n\nBy visualizing how work flows across departments, they establish a collective understanding of the Current State, expose bottlenecks, redundancies, and operational friction, then design a streamlined Future State that improves speed, accountability, and collaboration. Their work creates the operational foundation upon which technology and finance transformation can succeed.",
    shortCopy: "The Operations SME transforms organizational complexity into operational excellence. They specialize in people, process, governance, and execution.",
  },
  {
    title: "Accounting Expert",
    image: "/arap-sme.webp",
    imageAlt: "Hand-drawn blue sketch of Hunter, Digital Therapy's Finance & Accounting SME",
    copy: "The Finance & Accounting SME is not your typical accountant. They are transformation leaders who combine deep accounting expertise with a passion for technology, automation, and continuous improvement. They excel at accelerating the monthly close, optimizing AP and AR workflows, strengthening internal controls, and designing scalable financial processes. Working as equal partners with technology and operations SMEs, they understand both the opportunities and limitations of modern systems, allowing them to bridge the gap between financial accuracy and technical execution.",
    shortCopy: "The Finance & Accounting SME is not your typical accountant. They are transformation leaders who combine deep accounting expertise with a passion for technology, automation, and continuous improvement.",
  },
  {
    title: "Technology Expert",
    image: "/tech-sme.webp",
    imageAlt: "Hand-drawn blue sketch of Milton Rodas, Digital Therapy's Technology SME",
    copy: "The Technology SME is the cornerstone of every Fusion Team. They are extraordinarily difficult to develop because the role demands an uncommon breadth and depth of expertise. They build software, engineer data platforms, orchestrate automation, leverage AI responsibly, secure complex ecosystems, and architect solutions that scale. But their greatest skill isn’t technical—it’s the ability to connect technology to business strategy, turning complexity into clarity and ideas into measurable results.",
    shortCopy: "This role demands an uncommon breadth and depth of expertise. They build software, engineer data platforms, orchestrate automation, leverage AI responsibly, secure complex ecosystems, and architect solutions that scale.",
  },
] as { title: string; image: string; imageAlt: string; copy: string; shortCopy?: string }[];

const automationUseCases = [
  "Custom software & internal tools purpose-built for the work your team actually does — not bloated SaaS retrofitted to fit.",
  "Redesigned process flows that remove bottlenecks, clarify handoffs, and let lean teams handle higher volume without adding headcount.",
  "Targeted automation across intake, reconciliation, reporting & approvals — replacing the repetitive work that would otherwise require another hire.",
];

const securityPrinciples = [
  { title: "Private deployment", copy: "On-premises, offline, or controlled infrastructure options when sensitivity requires it." },
  { title: "Role-based access", copy: "Users see only the data, reports, and workflows appropriate to their mandate." },
  { title: "Auditability", copy: "Key workflows, changes, approvals, and data flows remain documented and reviewable." },
  { title: "Secure integration", copy: "Encrypted access and controlled connection patterns reduce unnecessary exposure." },
];


function PrivateBriefingButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  return <BookingWidgetDialog variant={variant} context="homepage family-office booking" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

export default function Home() {
  const [openCaseStudyIndex, setOpenCaseStudyIndex] = useState<number | null>(null);
  // Controls the contact-form popup launched from the dark "Security and control" section CTA cluster.
  const [contactOpen, setContactOpen] = useState(false);
  // Controls the "Four steps to Data Empowerment" step-detail lightbox.
  const [openStepIndex, setOpenStepIndex] = useState<number | null>(null);
  // Controls the "Read more" popup for Fusion Team member cards that have a short excerpt.
  const [openFusionIndex, setOpenFusionIndex] = useState<number | null>(null);
  const activeCaseStudy = openCaseStudyIndex !== null ? caseStudies[openCaseStudyIndex] : null;
  const activeStep = openStepIndex !== null ? operatingLayers[openStepIndex] : null;
  const activeFusion = openFusionIndex !== null ? fusionTeam[openFusionIndex] : null;

  // Sliding highlight across the three case-study pills to hint that they are
  // clickable. First cycle fires 3s after mount, then repeats every 30s.
  // Per cycle: rest on pill 0 for 2s → slide to pill 1 over 2s → rest for 2s →
  // slide to pill 2 over 2s → rest for 2s → done. The highlight itself is a
  // single absolutely-positioned overlay that translates horizontally; each
  // pill picks up white text when the overlay is over (or sliding through) it.
  // Skipped entirely for prefers-reduced-motion and for viewports below sm
  // (where the pills stack vertically and horizontal sliding is meaningless).
  const [highlightPos, setHighlightPos] = useState<number | null>(null);
  const [whiteSet, setWhiteSet] = useState<Set<number>>(new Set());
  const highlightRanRef = useRef(false);
  useEffect(() => {
    if (highlightRanRef.current) return;
    highlightRanRef.current = true;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 640px)").matches) return;

    const cleanups: Array<() => void> = [];
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      cleanups.push(() => clearTimeout(t));
    };

    const runCycle = () => {
      setHighlightPos(0);
      setWhiteSet(new Set([0]));
      // While highlight is still resting on pill 0, fade text 0 back to black
      // so it looks "original" by the time the slide begins.
      schedule(() => setWhiteSet(new Set()), 1500);
      // Start slide 0 → 1 with text already black on both pills
      schedule(() => setHighlightPos(1), 2000);
      // Slide finished — pill 1 fades to white
      schedule(() => setWhiteSet(new Set([1])), 4000);
      // Fade pill 1 back to black before slide starts
      schedule(() => setWhiteSet(new Set()), 5500);
      // Start slide 1 → 2
      schedule(() => setHighlightPos(2), 6000);
      // Slide finished — pill 2 fades to white
      schedule(() => setWhiteSet(new Set([2])), 8000);
      // Fade pill 2 back to black before cycle ends
      schedule(() => setWhiteSet(new Set()), 9500);
      // Cycle ends — highlight disappears
      schedule(() => setHighlightPos(null), 10000);
    };

    schedule(() => {
      runCycle();
      const iv = setInterval(runCycle, 30000);
      cleanups.push(() => clearInterval(iv));
    }, 3000);

    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        bookingContext="homepage family-office booking"
        contactContext="homepage navigation contact"
        logoHref="#top"
        useHomeAnchorLinks
        headerClassName="bg-[#F7F4EE]/82"
      />

      <main id="top" className="pt-20">
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden border-b border-black/8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(10,101,255,0.09),transparent_32%),linear-gradient(115deg,#F7F4EE_0%,#FFFFFF_50%,#EEF4FF_100%)]" />
          <div className="container relative grid min-h-[calc(100vh-5rem)] items-center gap-10 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:py-28">
            <motion.div {...fadeUp}>
              <SectionLabel>secure family office automation</SectionLabel>
              <h1 className="max-w-4xl font-display text-[70px] leading-[1] tracking-[-0.06em] text-[#111111]">
                Family office<br />transformation<br />that works.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/80">
                We spend time to learn your eco-system, unique attributes, people &amp; processes. We believe in &ldquo;Collective Understanding.&rdquo; That&rsquo;s our secret &mdash; how we achieve transformation success for our clients. That&rsquo;s why we typically work on-site for the first month of a new engagement.
              </p>
              <p className="mt-10 text-base font-bold leading-7 text-black/90">
                Learn more about our
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href="/capabilities"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/50 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF] hover:bg-[#0A65FF] hover:text-white"
                >
                  Capabilities
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <span className="text-base font-medium text-black/70">or</span>
                <a
                  href="/process"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#0A65FF]/25 bg-[#0A65FF]/8 px-6 py-3 text-sm font-semibold text-[#0A65FF] transition-all duration-300 hover:border-[#0A65FF] hover:bg-[#0A65FF] hover:text-white"
                >
                  Process
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <span className="text-base font-medium text-black/70">?</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 35 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" as const }}
              className="relative lg:-mt-24 xl:-mt-16"
            >
              <div className="pointer-events-none absolute -inset-6 rounded-[2.6rem] bg-[#0A65FF]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white shadow-[0_42px_110px_rgba(16,24,40,0.14)]">
                <img
                  src="/welcome-hero-1600.webp"
                  srcSet="/welcome-hero-800.webp 800w, /welcome-hero-1200.webp 1200w, /welcome-hero-1600.webp 1600w"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  alt="Digital Therapy welcome hero — modern family office operating layer surfacing data, workflows, reporting, and automation behind one unified team"
                  className="aspect-[16/8] w-full object-cover object-[center_58%]"
                  width={1536}
                  height={1024}
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <p className="mt-6 text-left text-[11pt] font-medium italic text-black/80">
                Tap the three outcomes below to read sample case studies:
              </p>
              <div className="relative mt-2 grid gap-1 overflow-hidden rounded-[1.35rem] border border-black/10 bg-white p-1 shadow-[0_18px_45px_rgba(16,24,40,0.08)] sm:grid-cols-3">
                {highlightPos !== null && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1 top-1 h-[calc(100%-8px)] w-[calc((100%-16px)/3)] rounded-[1rem] bg-[#0A65FF]/80"
                    style={{
                      transform: `translateX(calc(${highlightPos * 100}% + ${highlightPos * 4}px))`,
                      transition: "transform 2000ms ease-in-out",
                    }}
                  />
                )}
                {caseStudies.map((study, index) => {
                  const isWhite = whiteSet.has(index);
                  return (
                    <Tooltip key={study.label}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setOpenCaseStudyIndex(index)}
                          aria-label={`See the ${study.label} case study`}
                          className={`group relative z-10 flex items-center justify-center gap-2 rounded-[1rem] px-3 py-3 text-sm font-bold transition-colors duration-500 focus:outline-none focus-visible:bg-[#0A65FF] focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[#0A65FF]/50 focus-visible:ring-offset-2 ${
                            isWhite
                              ? "text-white"
                              : "text-[#111111] hover:bg-[#0A65FF] hover:text-white"
                          }`}
                        >
                          <span>{study.label}</span>
                          <Plus
                            aria-hidden="true"
                            className={`h-4 w-4 shrink-0 transition-all duration-500 ${
                              isWhite
                                ? "rotate-90 text-white opacity-100"
                                : "text-[#0A65FF] opacity-60 group-hover:rotate-90 group-hover:text-white group-hover:opacity-100 group-focus-visible:rotate-90 group-focus-visible:text-white group-focus-visible:opacity-100"
                            }`}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8} className="max-w-xs px-4 py-3 text-sm text-balance">
                        <p className="font-semibold">Case Study {index + 1}: {study.label}</p>
                        <p className="mt-1.5 text-white/85">{study.tooltipDescription}</p>
                        <p className="mt-2.5 flex items-center gap-1 text-[#6EA8FF]">
                          View Case Study
                          <ChevronRight className="h-3.5 w-3.5" />
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-center lg:justify-end">
                <BookingWidgetDialog
                  variant="primary"
                  context="homepage hero image-side booking"
                  className="w-full min-w-[260px] whitespace-nowrap px-8 py-4 text-base shadow-[0_26px_70px_rgba(10,101,255,0.32)] sm:w-auto sm:min-w-[300px]"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section id="complexity" className="bg-white py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] shadow-[0_28px_80px_rgba(16,24,40,0.11)]">
              <img src={boardroomVisual} alt="Modern family office boardroom" className="aspect-[16/11] w-full object-cover" width={1920} height={1080}/>
              <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black/78 backdrop-blur-xl">
                Great wealth requires great infrastructure.
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <SectionLabel>Why the back office breaks</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.4rem)] leading-[0.92] tracking-[-0.06em]">
                <span className="text-[1.15em] font-bold text-[#0A65FF]">C</span>
                <span className="font-sans text-[0.78em] italic text-black/55">o</span>
                <span className="font-bold underline decoration-2 underline-offset-4">m</span>
                <span className="text-[1.35em] font-light">p</span>
                <span className="align-super text-[0.55em] italic text-[#0A65FF]">L</span>
                <span className="font-sans text-[0.9em] font-bold italic text-[#58B8FF]">e</span>
                <span className="text-[1.3em] font-light italic">x</span>
                <span className="align-sub text-[0.7em] font-bold">i</span>
                <span className="font-sans font-light underline decoration-2 underline-offset-4">T</span>
                <span className="text-[0.85em] italic text-[#0A65FF]">y</span>
                {" = Cost"}
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/80">
                Mature family offices coordinate more than investments. Digital Therapy targets Complexity Friction that compounds across accounting, reporting, technology, and governance.
              </p>
              <div className="mt-9 space-y-4">
                {complexityPoints.map((point) => (
                  <div key={point} className="flex gap-4 border-t border-black/10 pt-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-base leading-7 text-black/85">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="operating-layer" className="relative overflow-hidden bg-[#111111] py-24 text-white lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(10,101,255,0.32),transparent_35%),linear-gradient(135deg,#111111_0%,#1C1C1C_100%)]" />
          <div className="container relative">
            <motion.div {...fadeUp} className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#58B8FF]">
                <span className="h-px w-8 bg-[#58B8FF]" />
                Data Culture &amp; SOP Transformation
              </div>
              <h2 className="font-display text-[54px] leading-[0.92] tracking-[-0.06em] text-white">
                Four steps to Data Empowerment.
              </h2>
            </motion.div>
            <div className="relative mt-12 flex flex-col gap-4 sm:mt-14 sm:gap-5">
              {/* Vertical dashed rail behind the numerals — desktop only, connects steps 1-4 */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-14 bottom-14 left-[52px] hidden w-px border-l border-dashed border-white/22 lg:block"
              />
              {operatingLayers.map((layer, index) => (
                <motion.button
                  key={layer.title}
                  type="button"
                  onClick={() => setOpenStepIndex(index)}
                  aria-label={`See details for step ${layer.eyebrow}: ${layer.title}`}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                  className="group relative flex w-full flex-col gap-6 border border-white/12 bg-white/[0.06] p-6 text-left backdrop-blur-xl transition-all duration-500 hover:border-[#58B8FF]/40 hover:bg-white/[0.10] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58B8FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] sm:flex-row sm:items-center sm:gap-8 sm:p-7 lg:p-8"
                >
                  <div className="flex items-center gap-5 sm:gap-7 lg:gap-8">
                    <span className="font-display text-[3rem] font-light leading-none tracking-[-0.03em] text-[#58B8FF] sm:text-[3.5rem] lg:min-w-[80px]">
                      {layer.eyebrow}
                    </span>
                    {layer.image && (
                      <img
                        src={layer.image}
                        alt={layer.imageAlt ?? ""}
                        className="h-20 w-20 shrink-0 rounded-[1.1rem] border border-white/15 bg-white object-cover sm:h-24 sm:w-24"
                        width={400}
                        height={400}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-2xl tracking-[-0.03em] text-white sm:text-3xl lg:text-[2rem]">
                      {layer.title}
                    </h3>
                    <p className="mt-2 text-lg italic leading-7 text-white/70 sm:text-xl sm:leading-8">
                      {layer.theme}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <span className="inline-flex items-center rounded-full border border-[#58B8FF]/40 bg-[#58B8FF]/12 px-5 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#6EA8FF] transition-colors duration-300 group-hover:border-[#58B8FF]/70 group-hover:bg-[#58B8FF]/20 group-hover:text-[#8FC4FF] sm:text-[0.8rem]">
                      {layer.outcome}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-white/35 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#58B8FF]"
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section id="fusion-team" className="bg-white py-24 lg:py-32">
          <div className="container">
            <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <SectionLabel>Fusion Team Concept</SectionLabel>
                <h2 className="font-display text-[54px] leading-[0.92] tracking-[-0.06em]">
                  This team didn&rsquo;t happen by accident. It was purpose-built to be the best.
                </h2>
              </div>
              <div className="max-w-3xl lg:pb-2">
                <p className="text-lg leading-8 text-black/80">
                  Accountants work with accountants &mdash; Engineers with engineers. There&rsquo;s no organic pathway for these experts to come together as a team &amp; learn to collaborate effectively. So we made it happen ourselves &mdash; a new structure that teams up Accountants, Engineers &amp; Process Experts into one group to tackle Accounting, Technology &amp; Operations challenges collectively. This team gets things done.
                </p>
                <a
                  href="/thesis"
                  className="group mt-6 inline-flex items-center gap-2 text-[18px] font-medium text-[#0A65FF] transition-colors duration-300 hover:text-[#004ed1]"
                >
                  For more on this topic, view our Thesis
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {fusionTeam.map((member, index) => {
                const hasReadMore = Boolean(member.shortCopy);
                const displayCopy = member.shortCopy ?? member.copy;
                const cardBody = (
                  <>
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#0A65FF]/10 blur-2xl" />
                    <div className="relative flex h-full flex-col">
                      <img
                        src={member.image}
                        alt={member.imageAlt}
                        className="mx-auto h-24 w-24 shrink-0 rounded-[1.4rem] border border-black/10 bg-white object-cover shadow-[0_16px_35px_rgba(10,101,255,0.10)]" width={600} height={600}/>
                      <div className="mt-8">
                        <h3 className="text-center text-2xl font-semibold tracking-[-0.05em]">
                          {(() => {
                            const [firstWord, ...rest] = member.title.split(" ");
                            return (
                              <>
                                <span className="text-[#0A65FF]">{firstWord}</span>
                                {rest.length ? ` ${rest.join(" ")}` : null}
                              </>
                            );
                          })()}
                        </h3>
                        <p className="mt-5 text-[0.95rem] leading-7 text-black/82">{displayCopy}</p>
                        {hasReadMore && (
                          <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0A65FF] transition-transform duration-300 group-hover:translate-x-0.5">
                            Read more
                            <ChevronRight className="h-4 w-4" />
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                );
                if (hasReadMore) {
                  return (
                    <motion.button
                      key={member.title}
                      type="button"
                      onClick={() => setOpenFusionIndex(index)}
                      aria-label={`Read the full ${member.title} description`}
                      {...fadeUp}
                      transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                      className="group relative min-h-[500px] overflow-hidden bg-[#F7F4EE] p-7 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(10,101,255,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF] focus-visible:ring-offset-2 lg:p-8"
                    >
                      {cardBody}
                    </motion.button>
                  );
                }
                return (
                  <motion.div
                    key={member.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                    className="relative min-h-[500px] overflow-hidden bg-[#F7F4EE] p-7 lg:p-8"
                  >
                    {cardBody}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] shadow-[0_28px_80px_rgba(16,24,40,0.1)]">
              <img src="/aicutsheads.webp" alt="AI automation reducing headcount and growing revenue" className="aspect-[3/2] w-full object-cover" loading="lazy" decoding="async" width={1200} height={800}/>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <SectionLabel>Automation and AI</SectionLabel>
              <h2 className="font-display text-[64px] leading-[0.95] tracking-[-0.04em]">
                Grow Revenue.<br />Not Headcount.
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/80">
                Digital Therapy builds software, process flows &amp; automations that multiply the capacity of your workforce.
              </p>
              <div className="mt-8 space-y-3">
                {automationUseCases.map((useCase) => (
                  <div key={useCase} className="flex gap-4 rounded-2xl border border-black/8 bg-[#F7F4EE]/70 p-4">
                    <Bot className="mt-1 h-5 w-5 shrink-0 text-[#0A65FF]" />
                    <p className="leading-7 text-black/82">{useCase}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="security" className="relative overflow-hidden bg-[#111111] py-24 text-white lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(10,101,255,0.32),transparent_35%),linear-gradient(135deg,#111111_0%,#1C1C1C_100%)]" />
          <div className="container relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div {...fadeUp}>
              <SectionLabel>Security and control</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.5rem)] leading-[0.92] tracking-[-0.06em] text-white">
                Privacy &amp; security are top priority.
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/62">
                Digital Therapy builds secure systems to keep family office data private, organized, and accessible only to the right people.
              </p>
              {/*
                CTA cluster matches the Team page closing "Work with us" pattern:
                - Primary brand-blue "Book 30 Min" button (BookingWidgetDialog)
                - Secondary dark-theme glass "Send us a message" that opens a
                  controlled ContactFormDialog mounted just below
              */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <BookingWidgetDialog
                  variant="primary"
                  context="homepage security section booking"
                />
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/14"
                >
                  Send us a message
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
              <ContactFormDialog
                hideTrigger
                open={contactOpen}
                onOpenChange={setContactOpen}
                context="homepage security section — send us a message"
              />
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {securityPrinciples.map((principle, index) => (
                <motion.div
                  key={principle.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                  className="border border-white/12 bg-white/[0.06] p-7 backdrop-blur-xl"
                >
                  <LockKeyhole className="h-6 w-6 text-[#58B8FF]" />
                  <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">{principle.title}</h3>
                  <p className="mt-4 leading-7 text-white/58">{principle.copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#F7F4EE] py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div {...fadeUp}>
              <img src={markUrl} alt="Digital Therapy" className="h-14 w-14 object-contain" width={197} height={227}/>
              <h2 className="mt-9 font-display text-[54px] leading-[0.92] tracking-[-0.06em]">
                Let’s get started.
              </h2>
              <p className="mt-7 max-w-2xl text-xl leading-8 text-black/80">
                In 20 minutes, we can explore current pain points, identify how Digital Therapy can deliver meaningful value, and tour one or two custom solutions deployed for existing clients.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrivateBriefingButton />
                <ContactFormDialog
                  variant="secondary"
                  label="Let’s talk pain points."
                  context="family office pain-point conversation"
                />
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_28px_80px_rgba(16,24,40,0.1)]">
              <img src={heroVisual} alt="Digital Therapy abstract operating layer" className="aspect-[16/11] w-full object-cover" width={1920} height={1080}/>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Case-study lightbox: opens when a Save Time / Reduce Burn / Make more money pill is clicked */}
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

      {/* Step-detail lightbox: opens when one of the four Data Empowerment cards is clicked */}
      <Dialog open={openStepIndex !== null} onOpenChange={(v) => !v && setOpenStepIndex(null)}>
        <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[820px] sm:rounded-[2rem]">
          {activeStep ? (
            <>
              <DialogHeader className="border-b border-black/10 bg-white px-8 pb-7 pt-8 text-left sm:px-10 sm:pt-10">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
                  <span className="font-display text-[3rem] font-light leading-none tracking-[-0.03em] text-[#0A65FF] sm:text-[3.5rem]">
                    {activeStep.eyebrow}
                  </span>
                  {activeStep.image && (
                    <img
                      src={activeStep.image}
                      alt={activeStep.imageAlt ?? ""}
                      className="h-20 w-20 shrink-0 rounded-[1.1rem] border border-black/10 bg-white object-cover sm:h-24 sm:w-24"
                      width={400}
                      height={400}
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                      Four Steps to Data Empowerment
                    </p>
                    <DialogTitle className="mt-2 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-[#111111] sm:text-4xl">
                      {activeStep.title}
                    </DialogTitle>
                    <p className="mt-2 text-lg italic leading-7 text-black/60 sm:text-xl">
                      {activeStep.theme}
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-8 px-8 py-9 sm:px-10 sm:py-10">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                    What we do
                  </p>
                  <p className="mt-3 text-base leading-8 text-black/85 sm:text-lg">
                    {activeStep.copy}
                  </p>
                </div>
                <div className="flex flex-col gap-3 border-t border-black/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                    Outcome
                  </p>
                  <span className="inline-flex items-center self-start rounded-full border border-[#0A65FF]/35 bg-[#0A65FF]/8 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-[#0040c9] sm:self-auto">
                    {activeStep.outcome}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Fusion Team member popup: opens when a card with a short excerpt is clicked */}
      <Dialog open={openFusionIndex !== null} onOpenChange={(v) => !v && setOpenFusionIndex(null)}>
        <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[720px] sm:rounded-[2rem]">
          {activeFusion ? (
            <>
              <DialogHeader className="border-b border-black/10 bg-white px-8 pb-7 pt-8 text-left sm:px-10 sm:pt-10">
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
                  <img
                    src={activeFusion.image}
                    alt={activeFusion.imageAlt}
                    className="h-24 w-24 shrink-0 rounded-[1.4rem] border border-black/10 bg-white object-cover shadow-[0_16px_35px_rgba(10,101,255,0.10)]"
                    width={600}
                    height={600}
                  />
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                      Fusion Team
                    </p>
                    <DialogTitle className="mt-2 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-[#111111] sm:text-4xl">
                      {(() => {
                        const [firstWord, ...rest] = activeFusion.title.split(" ");
                        return (
                          <>
                            <span className="text-[#0A65FF]">{firstWord}</span>
                            {rest.length ? ` ${rest.join(" ")}` : null}
                          </>
                        );
                      })()}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-5 px-8 py-9 sm:px-10 sm:py-10">
                {activeFusion.copy.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-base leading-8 text-black/85 sm:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

    </div>
  );
}
