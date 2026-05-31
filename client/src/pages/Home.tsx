/**
 * Digital Therapy quiet luxury private-banking interface.
 * Preserve light ivory surfaces, charcoal typography, restrained Digital Therapy blue,
 * image-led section rhythm, and concise family-office advisory positioning.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { caseStudies } from "@/data/caseStudies";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Database,
  LockKeyhole,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/dt-mark.png";
const welcomeVisual = "/welcome-hero.png";
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
}[] = [
  {
    eyebrow: "01",
    title: "Search + Find",
    copy: "Locate critical records, accounts, entities, and documents across every system before decisions are made.",
    icon: Database,
    image: "/sigmund-search.png",
    imageAlt: "Sigmund searching for records",
  },
  {
    eyebrow: "02",
    title: "Connect + Pull",
    copy: "Bring approved source data into one governed workflow without forcing teams to chase down files manually.",
    icon: Workflow,
    image: "/sigmund-connect.png",
    imageAlt: "Sigmund connecting and pulling data from multiple sources",
  },
  {
    eyebrow: "03",
    title: "Format + Clean",
    copy: "Format, reconcile & clean data so it can be used as trusted operating intelligence.",
    icon: BarChart3,
    image: "/sigmund-clean.png",
    imageAlt: "Sigmund cleaning and organizing data",
  },
  {
    eyebrow: "04",
    title: "Query + Report",
    copy: "Turn structured data into reporting, automation, and AI-enhanced insights that leaders can use to win.",
    icon: ShieldCheck,
    image: "/sigmund-report.png",
    imageAlt: "Sigmund delivering a report",
  },
];

const fusionTeam = [
  {
    title: "Operations Expert",
    image: "/process-sme.png",
    imageAlt: "Hand-drawn blue sketch of Digital Therapy's Operations & Process SME",
    copy: "The Operations SME focuses on people, process & delivery. This expert prizes efficiency, productivity, playbooks, KPIs & SOPs. They turn swirling chaos into digestible organization and reduce complex systems into the right size bites to plan effectively & ensure collective understanding by visualizing workflows to clarify how a business operation occurs now (Current State), highlighting weaknesses (like bottlenecks & redundancies) and optimizing a new process design (or Future State).",
  },
  {
    title: "Accounting Expert",
    image: "/arap-sme.png",
    imageAlt: "Hand-drawn blue sketch of Hunter, Digital Therapy's Finance & Accounting SME",
    copy: "This SME is not your typical accountant. He does not fear technology & he voraciously embraces automation. They are masters of close acceleration and can tame the most complex AP & AR processes out there. They work intimately with engineers and they’re acutely aware of how they need to support technical team members to assure success as well as what limitations they have and where they need support from tech leaders.",
  },
  {
    title: "Technology Expert",
    image: "/tech-sme.png",
    imageAlt: "Hand-drawn blue sketch of Milton Rodas, Digital Therapy's Technology SME",
    copy: "The Technology SME is not an easy resource to find. They need to be trained for a purpose with intention & vigor to achieve the breadth & depth of skills necessary to fill the shoes of this daunting role — They are full stack engineers, data scientists, artists of Robotic Process Automation and masters of AI of the highest order.",
  },
];

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
  const activeCaseStudy = openCaseStudyIndex !== null ? caseStudies[openCaseStudyIndex] : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        bookingContext="homepage family-office booking"
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
              <h1 className="max-w-4xl font-display text-[70px] leading-[0.92] tracking-[-0.06em] text-[#111111]">
                Family office<br />transformation<br />that works.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/80">
                We spend time to learn your eco-system, unique attributes, people &amp; processes. We believe collective understanding is the key to transformation success. That&rsquo;s why we typically work on-site for the first month of a new engagement.
              </p>
              <p className="mt-10 text-base font-bold leading-7 text-black/90">
                Would you like to learn more about our
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href="/capabilities"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/50 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  Capabilities
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <span className="text-base font-medium text-black/70">or</span>
                <a
                  href="/process"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#0A65FF]/25 bg-[#0A65FF]/8 px-6 py-3 text-sm font-semibold text-[#0A65FF] transition-all duration-300 hover:border-[#0A65FF]/55 hover:bg-[#0A65FF]/12"
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
                <img src={welcomeVisual} alt="Welcome to Digital Therapy" className="aspect-[16/8] w-full object-cover object-[center_58%]" />
              </div>
              <div className="relative mt-5 grid gap-1 overflow-hidden rounded-[1.35rem] border border-black/10 bg-white p-1 shadow-[0_18px_45px_rgba(16,24,40,0.08)] sm:grid-cols-3">
                {caseStudies.map((study, index) => (
                  <button
                    key={study.label}
                    type="button"
                    onClick={() => setOpenCaseStudyIndex(index)}
                    aria-label={`See the ${study.label} case study`}
                    className="group flex items-center justify-center rounded-[1rem] px-3 py-3 text-sm font-bold text-[#111111] transition-colors duration-200 hover:bg-[#0A65FF] hover:text-white focus:outline-none focus-visible:bg-[#0A65FF] focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[#0A65FF]/50 focus-visible:ring-offset-2"
                  >
                    {study.label}
                  </button>
                ))}
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
              <img src={boardroomVisual} alt="Modern family office boardroom" className="aspect-[16/11] w-full object-cover" />
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
            <div className="mt-10 grid gap-3 sm:mt-12 sm:gap-4 lg:mt-14 lg:grid-cols-4 lg:gap-5">
              {operatingLayers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <motion.article
                    key={layer.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                    className="group min-h-[230px] border border-white/12 bg-white/[0.06] p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#58B8FF]/35 hover:bg-white/[0.10] sm:min-h-[270px] sm:p-6 lg:min-h-[330px] lg:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[30px] font-light uppercase tracking-[0.22em] text-[#58B8FF]">{layer.eyebrow}</span>
                      {layer.image ? (
                        <img
                          src={layer.image}
                          alt={layer.imageAlt ?? ""}
                          className="h-14 w-14 shrink-0 rounded-[1rem] border border-white/15 bg-white object-cover sm:h-16 sm:w-16"
                        />
                      ) : (
                        <Icon className="h-5 w-5 text-white/45 transition-colors duration-300 group-hover:text-[#58B8FF] sm:h-6 sm:w-6" />
                      )}
                    </div>
                    <h3 className="mt-10 text-xl font-semibold tracking-[-0.04em] text-white sm:mt-12 sm:text-2xl lg:mt-16">{layer.title}</h3>
                    <p className="mt-3 text-[0.95rem] leading-6 text-white/78 sm:mt-4 sm:leading-7">{layer.copy}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="fusion-team" className="bg-white py-24 lg:py-32">
          <div className="container">
            <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <SectionLabel>Fusion Team Concept</SectionLabel>
                <h2 className="font-display text-[54px] leading-[0.92] tracking-[-0.06em]">
                  Collaboration takes commitment. It can’t be an afterthought.
                </h2>
              </div>
              <div className="max-w-3xl lg:pb-2">
                <p className="text-lg leading-8 text-black/80">
                  Accountants work with accountants &mdash; Engineers with engineers. There’s no organic pathway for these experts to come together &amp; learn to collaborate effectively. So we created the solution ourselves &mdash; a team management nucleus containing three SME leaders who work together as the rule, not the exception.
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
              {fusionTeam.map((member, index) => (
                <motion.div
                  key={member.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                  className="relative min-h-[500px] overflow-hidden bg-[#F7F4EE] p-7 lg:p-8"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#0A65FF]/10 blur-2xl" />
                  <div className="relative flex h-full flex-col">
                    <img
                      src={member.image}
                      alt={member.imageAlt}
                      className="mx-auto h-24 w-24 shrink-0 rounded-[1.4rem] border border-black/10 bg-white object-cover shadow-[0_16px_35px_rgba(10,101,255,0.10)]"
                    />
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
                      <p className="mt-5 text-[0.95rem] leading-7 text-black/82">{member.copy}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] shadow-[0_28px_80px_rgba(16,24,40,0.1)]">
              <img src="/aicutsheads.png" alt="AI automation reducing headcount and growing revenue" className="aspect-[3/2] w-full object-cover" />
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
              <img src={markUrl} alt="Digital Therapy picture mark" className="h-14 w-14 object-contain" />
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
              <img src={heroVisual} alt="Digital Therapy abstract operating layer" className="aspect-[16/11] w-full object-cover" />
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

    </div>
  );
}
