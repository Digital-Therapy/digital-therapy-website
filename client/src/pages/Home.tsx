/**
 * Digital Therapy quiet luxury private-banking interface.
 * Preserve light ivory surfaces, charcoal typography, restrained Digital Therapy blue,
 * image-led section rhythm, and concise family-office advisory positioning.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Database,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
  Workflow,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/manus-storage/DTLOGO_PICMARKpng_2cf51494.png";
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
  { label: "Partners", href: "#partners" },
];

const complexityPoints = [
  "Assets, entities, trusts, accounts, and documents live in separate systems.",
  "Lean teams spend too much time collecting, reconciling, and reformatting information.",
  "Principals and advisors expect faster answers without compromising privacy or control.",
];

const operatingLayers = [
  {
    eyebrow: "01",
    title: "Search & Find",
    copy: "Locate critical records, accounts, entities, and documents across every system before decisions are made.",
    icon: Database,
  },
  {
    eyebrow: "02",
    title: "Connect & Pull",
    copy: "Bring approved source data into one governed workflow without forcing teams to chase files manually.",
    icon: Workflow,
  },
  {
    eyebrow: "03",
    title: "Clean & Structure",
    copy: "Standardize, reconcile, and organize information so it becomes reliable operating intelligence.",
    icon: BarChart3,
  },
  {
    eyebrow: "04",
    title: "Analyze & Leverage",
    copy: "Turn structured data into reporting, automation, and AI-enabled answers leaders can use.",
    icon: ShieldCheck,
  },
];

const fusionTeam = [
  {
    title: "Operations Expert",
    copy: "The Operations SME focuses on people, process & delivery. This expert prizes efficiency, productivity, playbooks, KPIs & SOPs. They turn swirling chaos into digestible organization and reduce complex systems into the right size bites to plan effectively & ensure collective understanding by visualizing workflows to clarify how a business operation occurs now (Current State), highlighting weaknesses (like bottlenecks & redundancies) and optimizing a new process design (or Future State).",
  },
  {
    title: "Accounting Expert",
    copy: "This SME is not your typical accountant. He does not fear technology & he voraciously embraces automation. They are masters of close acceleration and can tame the most complex AP & AR processes out there. They work intimately with engineers and they’re acutely aware of how they need to support technical team members to assure success as well as what limitations they have and where they need support from tech leaders.",
  },
  {
    title: "Technology Expert",
    copy: "The Technology SME is not an easy resource to find. They need to be trained for a purpose with intention & vigor to achieve the breadth & depth of skills necessary to fill the shoes of this daunting role — They are full stack engineers, data scientists, artists of Robotic Process Automation and masters of AI of the highest order.",
  },
];

const automationUseCases = [
  "AI document agents for capital calls, notices, invoices, statements, and reports.",
  "Conversational assistants that answer approved stakeholder questions from governed data.",
  "One-click reconciliation across positions, cash flows, documents, and accounting records.",
  "Workflow orchestration that routes approvals, exceptions, tasks, and recurring follow-ups.",
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
              <SectionLabel>Private family-office operating layer</SectionLabel>
              <h1 className="max-w-4xl font-display text-[clamp(2.6rem,5.4vw,4.7rem)] leading-[0.92] tracking-[-0.06em] text-[#111111]">
                Tech, Ops + Accounting Solutions for Family Offices.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/62">
                We deliver the value you wish you got from accounting firms. We spend the time to truly comprehend your eco-system and unique nuances. Achieving collective understanding is the key to delivery success. We&rsquo;ll typically send a team to work on-site the first two&ndash;four weeks of new engagements.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/capabilities"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/50 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  See what DT can do
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a
                  href="/dt-brain"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#0A65FF]/25 bg-[#0A65FF]/8 px-6 py-3 text-sm font-semibold text-[#0A65FF] transition-all duration-300 hover:border-[#0A65FF]/55 hover:bg-[#0A65FF]/12"
                >
                  What is DT Brain?
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-black/10 pt-6">
                {[
                  ["Assets", "mapped"],
                  ["Workflows", "automated"],
                  ["Reporting", "governed"],
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
              className="relative lg:-mt-24 xl:-mt-16"
            >
              <div className="absolute -inset-6 rounded-[2.6rem] bg-[#0A65FF]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white shadow-[0_42px_110px_rgba(16,24,40,0.14)]">
                <img src={heroVisual} alt="Abstract private operating layer visualization" className="aspect-[16/8] w-full object-cover" />
                <div className="absolute bottom-5 left-5 right-5 grid gap-3 rounded-[1.35rem] border border-white/70 bg-white/72 p-4 backdrop-blur-xl sm:grid-cols-3">
                  {[
                    ["Source of truth", "Connected data"],
                    ["AI agents", "Document logic"],
                    ["Owner answers", "Live intelligence"],
                  ].map(([title, copy]) => (
                    <div key={title} className="border-l border-black/10 pl-3 first:border-l-0 first:pl-0">
                      <div className="text-sm font-bold">{title}</div>
                      <div className="mt-1 text-xs text-black/52">{copy}</div>
                    </div>
                  ))}
                </div>
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
              <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black/58 backdrop-blur-xl">
                Modern wealth is an operating company
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <SectionLabel>Why the back office breaks</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.4rem)] leading-[0.92] tracking-[-0.06em]">
                Complexity creates cost.
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/62">
                The most sophisticated family offices now coordinate far more than investments. Digital Therapy targets the everyday friction that compounds across accounting, reporting, technology, and governance.
              </p>
              <div className="mt-9 space-y-4">
                {complexityPoints.map((point) => (
                  <div key={point} className="flex gap-4 border-t border-black/10 pt-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-base leading-7 text-black/70">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="operating-layer" className="relative overflow-hidden bg-[#F7F4EE] py-24 lg:py-32">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(10,101,255,0.12),transparent_44%)]" />
          <div className="container relative">
            <motion.div {...fadeUp} className="max-w-4xl">
              <SectionLabel>What Digital Therapy builds</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.8rem)] leading-[0.92] tracking-[-0.06em]">
                Data Empowerment in four steps.
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
                    className="group min-h-[230px] border border-black/10 bg-white/72 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#0A65FF]/35 hover:bg-white sm:min-h-[270px] sm:p-6 lg:min-h-[330px] lg:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">{layer.eyebrow}</span>
                      <Icon className="h-5 w-5 text-black/48 transition-colors duration-300 group-hover:text-[#0A65FF] sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="mt-10 text-xl font-semibold tracking-[-0.04em] sm:mt-12 sm:text-2xl lg:mt-16">{layer.title}</h3>
                    <p className="mt-3 text-[0.95rem] leading-6 text-black/58 sm:mt-4 sm:leading-7">{layer.copy}</p>
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
                <SectionLabel>Fusion Team model</SectionLabel>
                <h2 className="font-display text-[clamp(2.6rem,4.7vw,5.3rem)] leading-[0.92] tracking-[-0.06em]">
                  Collaboration cannot be an afterthought.
                </h2>
              </div>
              <div className="max-w-3xl lg:pb-2">
                <p className="text-lg leading-8 text-black/62">
                  Accountants work exclusively with accountants. Engineers with engineers. There is no natural mechanism for these experts to come together. Professional bias obstructs collaboration &mdash; CPAs fear that AI and RPA will render the methods they know obsolete and reduce their billable hours or, worse, cost them their clients.
                </p>
                <a
                  href="/thesis"
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0A65FF] transition-colors duration-300 hover:text-[#004ed1]"
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
                    <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-black/38">{index + 1} of 3</div>
                    <div className="mt-14">
                      <h3 className="text-2xl font-semibold tracking-[-0.05em]">{member.title}</h3>
                      <p className="mt-5 text-[0.95rem] leading-7 text-black/64">{member.copy}</p>
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
              <img src={securityVisual} alt="Secure automation and AI workflow visualization" className="aspect-[16/12] w-full object-cover" />
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <SectionLabel>Automation and AI</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.5rem)] leading-[0.92] tracking-[-0.06em]">
                Scale the office without scaling headcount.
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/62">
                Digital Therapy converts manual collection, reconciliation, document processing, and reporting production into governed workflows that remain under the family office’s control.
              </p>
              <div className="mt-8 space-y-3">
                {automationUseCases.map((useCase) => (
                  <div key={useCase} className="flex gap-4 rounded-2xl border border-black/8 bg-[#F7F4EE]/70 p-4">
                    <Bot className="mt-1 h-5 w-5 shrink-0 text-[#0A65FF]" />
                    <p className="leading-7 text-black/66">{useCase}</p>
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
                Privacy isn&apos;t a feature. It&apos;s the foundation.
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/62">
                Digital Therapy designs the operating layer so sensitive family-office data, reports, documents, and workflows remain governed by the office’s access model and infrastructure requirements.
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

        <section id="partners" className="bg-[#F7F4EE] py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div {...fadeUp}>
              <SectionLabel>For private banks and advisors</SectionLabel>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.6rem)] leading-[0.92] tracking-[-0.06em]">
                A confidential implementation partner for complex clients.
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/62">
                Digital Therapy helps private banks, multifamily offices, and wealth advisory firms solve client operating complexity without replacing the trusted advisory relationship.
              </p>
              <div className="mt-8">
                <ContactFormDialog
                  variant="secondary"
                  label="Partner model"
                  context="partner model discussion"
                  icon="message"
                  className="bg-white/74"
                />
              </div>
              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {[
                  "Works behind the scenes or in joint delivery models.",
                  "Adds operating transformation without competing for the advisory mandate.",
                  "Creates diagnostics, pilots, and implementation roadmaps partners can introduce.",
                  "Reduces implementation risk through one accountable cross-functional pod.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 border-t border-black/10 pt-4">
                    <UsersRound className="mt-1 h-5 w-5 shrink-0 text-[#0A65FF]" />
                    <p className="leading-7 text-black/66">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_28px_80px_rgba(16,24,40,0.1)]">
              <img src={boardroomVisual} alt="Advisor partnership discussion setting" className="aspect-[4/5] w-full object-cover" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[1.4rem] border border-white/70 bg-white/78 p-5 backdrop-blur-xl">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">Partner-ready</div>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-black">
                  Introduce Digital Therapy when a client needs a practical operating blueprint, not another abstract strategy deck.
                </p>
              </div>
            </motion.div>
          </div>
        </section>


        <section className="relative overflow-hidden bg-[#F7F4EE] py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div {...fadeUp}>
              <img src={markUrl} alt="Digital Therapy picture mark" className="h-14 w-14 object-contain" />
              <h2 className="mt-9 font-display text-[clamp(3rem,6vw,6.6rem)] leading-[0.88] tracking-[-0.07em]">
                Book 30 minutes to find the first high-value win.
              </h2>
              <p className="mt-7 max-w-2xl text-xl leading-8 text-black/62">
                Family-office leaders and advisors can use one focused conversation to surface pain points, identify where Digital Therapy can deliver meaningful value first, and tour custom operating-layer solutions already deployed for some of New York City’s largest and most discerning family offices.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrivateBriefingButton />
                <ContactFormDialog
                  variant="secondary"
                  label="Discuss our pain points"
                  context="family office pain-point conversation"
                />
              </div>
              <p className="mt-7 font-display text-[clamp(1.45rem,2.2vw,2.35rem)] leading-tight tracking-[-0.045em] text-black/70">hello@digitaltherapy.io · 1 (917) 495-0455</p>
            </motion.div>
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_28px_80px_rgba(16,24,40,0.1)]">
              <img src={heroVisual} alt="Digital Therapy abstract operating layer" className="aspect-[16/11] w-full object-cover" />
            </motion.div>
          </div>
        </section>
      </main>

    </div>
  );
}
