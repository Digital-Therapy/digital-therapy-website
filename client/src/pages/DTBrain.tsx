/**
 * Digital Therapy DT Brain page.
 * Preserve quiet luxury private-banking interface: warm ivory surfaces, charcoal typography,
 * precise whitespace, restrained Digital Therapy blue accents, and visual product storytelling.
 */
import { BookingWidgetDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronLeft,
  CloudOff,
  Code2,
  Cpu,
  Database,
  GitBranch,
  HardDrive,
  LockKeyhole,
  Network,
  Server,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/dt-mark.png";
const securityVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_security_automation-Z4CfAdsU9T8pybHF6A7NLi.webp";
const heroVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_hero_operating_layer-TEdtu9wcNJkxBt4PK2JKyo.webp";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

const specs = [
  { value: "12-Core", label: "CPU", icon: Cpu },
  { value: "16-Core", label: "GPU", icon: Cpu },
  { value: "16-Core", label: "Neural Engine", icon: Brain },
  { value: "48 GB", label: "Memory", icon: Server },
  { value: "2 TB", label: "SSD Storage", icon: HardDrive },
  { value: "1 Gbps", label: "Ethernet", icon: Network },
];

const sandboxOne = [
  {
    title: "Ollama",
    label: "Local LLM",
    copy: "Document analysis, AI assistance, and knowledge retrieval stay inside the office environment.",
    icon: Bot,
  },
  {
    title: "GitHub",
    label: "Version Control",
    copy: "Code, workflow scripts, and configuration changes remain trackable and reviewable.",
    icon: GitBranch,
  },
  {
    title: "Testing Environment",
    label: "Workflow Validation",
    copy: "Workflows, APIs, and automations can be tested before they go live.",
    icon: CheckCircle2,
  },
];

const sandboxTwo = [
  {
    title: "n8n",
    label: "Flow Hub",
    copy: "Rapid testing and prototyping of AI workflows and integrations in isolation.",
    icon: Workflow,
  },
  {
    title: "OpenRPA",
    label: "Desktop RPA",
    copy: "Desktop task automation and legacy system bridging for family-office operations.",
    icon: Database,
  },
  {
    title: "Python",
    label: "Scripting",
    copy: "Custom integrations, ETL pipelines, analytics, and specialized automation logic.",
    icon: Code2,
  },
];

const controlPrinciples = [
  { title: "Enhanced privacy", copy: "Data never leaves the premises.", icon: LockKeyhole },
  { title: "Direct control", copy: "The family office retains full stack ownership.", icon: ShieldCheck },
  { title: "No cloud dependency", copy: "Critical automation does not rely on invasive providers.", icon: CloudOff },
  { title: "Predictable costs", copy: "Stable infrastructure and operating expenses.", icon: HardDrive },
];

function PrivateBriefingButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  return <BookingWidgetDialog variant={variant} context="DT Brain private AI booking" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

export default function DTBrain() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        activeLabel="DT Brain"
        bookingContext="DT Brain private AI booking"
        showMainSiteLink
      />

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-black/8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(10,101,255,0.11),transparent_34%),linear-gradient(115deg,#F7F4EE_0%,#FFFFFF_54%,#EEF4FF_100%)]" />
          <div className="container relative grid min-h-[calc(100vh-5rem)] items-center gap-12 py-20 lg:grid-cols-[0.88fr_1.12fr] lg:py-28">
            <motion.div {...fadeUp}>
              <SectionLabel>DT Brain hardware</SectionLabel>
              <h1 className="max-w-4xl font-display text-[64px] leading-[0.95] tracking-[-0.04em] text-[#111111]">
                On-prem automation hub.
              </h1>
              <p className="mt-8 max-w-2xl text-2xl font-semibold leading-9 tracking-[-0.035em] text-[#0A65FF]">
                It runs in your own office. On your own hardware. In your actual control.
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-black/80">
                Digital Therapy sets up a private, on-premises automation environment powered by Apple M4 Pro. No cloud dependency. No data leaves your ecosystem. That is real security and true privacy.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <PrivateBriefingButton />
                <a
                  href="#architecture"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/55 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  View architecture
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
              <div className="mt-12 border-t border-black/10 pt-6 text-sm font-bold uppercase tracking-[0.18em] text-black/75">
                Your data. Your servers. Your rules.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 35 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" as const }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2.8rem] bg-[#0A65FF]/12 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white shadow-[0_42px_110px_rgba(16,24,40,0.14)]">
                <img src={securityVisual} alt="Abstract secure automation environment" className="aspect-[16/11] w-full object-cover" />
                <div className="absolute inset-x-5 bottom-5 rounded-[1.4rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_50px_rgba(16,24,40,0.12)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Secure perimeter</div>
                      <div className="mt-2 text-xl font-semibold tracking-[-0.04em]">On-premises automation environment</div>
                    </div>
                    <div className="hidden rounded-full border border-[#0A65FF]/20 bg-[#0A65FF]/8 px-4 py-2 text-sm font-bold text-[#0A65FF] sm:block">
                      Apple M4 Pro
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-black/8 bg-white py-12">
          <div className="container">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {specs.map((spec) => {
                const Icon = spec.icon;
                return (
                  <motion.div key={`${spec.value}-${spec.label}`} {...fadeUp} className="group border-t border-black/10 pt-5">
                    <Icon className="h-6 w-6 text-[#0A65FF] transition-transform duration-300 group-hover:-translate-y-1" />
                    <div className="mt-4 text-2xl font-bold tracking-[-0.04em] text-black">{spec.value}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-black/45">{spec.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="architecture" className="relative overflow-hidden bg-[#F7F4EE] py-24 lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(10,101,255,0.09),transparent_30%)]" />
          <div className="container relative grid items-start gap-14 lg:grid-cols-[0.78fr_1.22fr]">
            <motion.div {...fadeUp}>
              <SectionLabel>Secure on-premises architecture</SectionLabel>
              <h2 className="max-w-3xl font-display text-[54px] leading-[0.95] tracking-[-0.04em]">
                Secure infrastructure for private automation.
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-black/80">
                DT Brain gives the office a controlled local environment for AI workflows, document intelligence, scripting, robotic process automation, and integration testing before automations touch live operations.
              </p>
              <div className="mt-9 grid gap-3">
                {[
                  "No cloud dependency for core automation workflows.",
                  "No data leaving the family-office ecosystem by design.",
                  "Encrypted access through an identity-based VPN perimeter.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-base font-semibold text-black/72">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#0A65FF]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="relative rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_30px_90px_rgba(16,24,40,0.10)]">
              <div className="rounded-[1.5rem] border border-[#0A65FF]/18 bg-[linear-gradient(145deg,#ffffff_0%,#eef5ff_100%)] p-5 lg:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#0A65FF]">DT Brain core</div>
                    <div className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Apple M4 Pro automation hub</div>
                  </div>
                  <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-bold text-black/78">1 Gbps Ethernet</div>
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-black/8 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-[#0A65FF]" />
                      <div className="text-sm font-bold uppercase tracking-[0.18em] text-black/45">Sandbox 1</div>
                    </div>
                    <div className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Local intelligence lab</div>
                    <div className="mt-4 space-y-4">
                      {sandboxOne.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="border-t border-black/8 pt-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#0A65FF]"><Icon className="h-4 w-4" />{item.label}</div>
                            <div className="mt-1 font-semibold tracking-[-0.02em]">{item.title}</div>
                            <p className="mt-1 text-sm leading-6 text-black/72">{item.copy}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-black/8 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <Workflow className="h-5 w-5 text-[#0A65FF]" />
                      <div className="text-sm font-bold uppercase tracking-[0.18em] text-black/45">Sandbox 2</div>
                    </div>
                    <div className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Automation simulation lab</div>
                    <div className="mt-4 space-y-4">
                      {sandboxTwo.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="border-t border-black/8 pt-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#0A65FF]"><Icon className="h-4 w-4" />{item.label}</div>
                            <div className="mt-1 font-semibold tracking-[-0.02em]">{item.title}</div>
                            <p className="mt-1 text-sm leading-6 text-black/72">{item.copy}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-[#0A65FF]/20 bg-[#0A65FF]/8 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-[#0A65FF]" />
                      <div>
                        <div className="font-semibold tracking-[-0.02em]">VPN via Tailscale</div>
                        <div className="text-sm text-black/72">Encrypted traffic and identity-based access around the secure perimeter.</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#0A65FF]">Secure perimeter</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-black/8 bg-white py-24 lg:py-32">
          <div className="container grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] shadow-[0_30px_90px_rgba(16,24,40,0.10)]">
              <img src={heroVisual} alt="Abstract Digital Therapy automation layer" className="aspect-[16/12] w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(247,244,238,0.92)_100%)]" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[1.35rem] border border-white/70 bg-white/82 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <img src={markUrl} alt="Digital Therapy mark" className="h-9 w-9 object-contain" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A65FF]">DT Brain</div>
                    <div className="text-xl font-semibold tracking-[-0.04em]">Built for controlled family-office automation</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp}>
              <SectionLabel>Control outcomes</SectionLabel>
              <h2 className="max-w-3xl font-display text-[60px] leading-[0.95] tracking-[-0.04em]">
                Your data. Your hardware.<br />
                Your rules.
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-black/80">
                DT Brain is designed for family offices that want the productivity of AI automation without surrendering sensitive documents, workflows, and operational context to uncontrolled infrastructure.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {controlPrinciples.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="border-t border-black/10 pt-5">
                      <Icon className="h-6 w-6 text-[#0A65FF]" />
                      <div className="mt-4 text-xl font-semibold tracking-[-0.04em]">{item.title}</div>
                      <p className="mt-2 text-sm leading-6 text-black/78">{item.copy}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#111111] py-20 text-white lg:py-24">
          <div className="container grid items-center gap-10 lg:grid-cols-[1fr_0.72fr]">
            <motion.div {...fadeUp}>
              <div className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#6DA6FF]">Private deployment conversation</div>
              <h2 className="max-w-4xl font-display text-[clamp(2.7rem,5.3vw,5.8rem)] leading-[0.9] tracking-[-0.06em]">
                Book 30 minutes to see where private automation should create value first.
              </h2>
            </motion.div>
            <motion.div {...fadeUp} className="lg:justify-self-end">
              <p className="max-w-md text-lg leading-8 text-white/66">
                Bring your workflow, reporting, and privacy pain points. We will tour DT Brain and other custom solutions already deployed for discerning New York City family offices, then identify the best place to deliver high-value impact first.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <PrivateBriefingButton />
                <a href="/" className="inline-flex items-center justify-center rounded-full border border-white/18 px-6 py-3 text-sm font-semibold text-white/80 transition-colors duration-300 hover:border-[#6DA6FF]/60 hover:text-white">
                  Return to main site
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
