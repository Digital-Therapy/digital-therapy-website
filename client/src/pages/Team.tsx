/**
 * Digital Therapy quiet luxury private-banking interface.
 * Preserve light ivory surfaces, charcoal typography, restrained Digital Therapy blue,
 * editorial spacing, and fusion-team positioning for family-office audiences.
 */
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  CircleDollarSign,
  Code2,
  Compass,
  Landmark,
  Layers3,
  Paintbrush,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/manus-storage/DTLOGO_PICMARKpng_2cf51494.png";
const boardroomVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_family_office_boardroom-UvecEVLEaVqpouVEhEb9mw.webp";
const wealthMapVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_wealth_map_visual-TmSmhqHi8pgacxaNwHMRxs.webp";

const headshots = {
  harryDublinsky: "/manus-storage/harry-dublinsky_16bc2837.png",
  bruceDitman: "/manus-storage/bruce-ditman_6bc44f86.png",
  lironDavid: "/manus-storage/liron-david_5e58795c.png",
  jonathanKobrin: "/manus-storage/jonathan-kobrin_ccc4cf34.png",
  hunterAtkins: "/manus-storage/hunter-atkins_72901b2f.png",
  miltonRodas: "/manus-storage/milton-rodas_07ab6aa9.png",
  kennedyKraner: "/manus-storage/kennedy-kraner_a4421e21.png",
  rickToussaint: "/manus-storage/rick-toussaint_fcf58b84.png",
  stanGretov: "/manus-storage/stan-gretov_df6e2dbc.png",
  vadimLitvak: "/manus-storage/vadim-litvak_99842098.png",
  valerioMirof: "/manus-storage/valerio-mirof_c4f41ca3.png",
  geoffHorn: "/manus-storage/geoff-horn_7dc6f1b3.png",
};

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

type TeamPerson = {
  name: string;
  role: string;
  specialty?: string;
  bio?: string;
  imageUrl?: string;
};

const leaders: TeamPerson[] = [
  {
    name: "Jonathan Kobrin",
    role: "CEO",
    specialty: "Operating model, transformation strategy, and client leadership.",
    imageUrl: headshots.jonathanKobrin,
  },
  {
    name: "Milton Rodas",
    role: "Chief Solution Engineer",
    specialty: "Systems architecture, integration, and technical execution.",
    imageUrl: headshots.miltonRodas,
  },
  {
    name: "Hunter Atkins, CPA",
    role: "CPA",
    specialty: "Accounting leadership, financial controls, and reporting operations.",
    imageUrl: headshots.hunterAtkins,
  },
];

const groups: Array<{
  label: string;
  description: string;
  icon: typeof CircleDollarSign;
  members: TeamPerson[];
}> = [
  {
    label: "Accounting & Reporting",
    description: "The finance bench brings bookkeeping, tax, public-company reporting, and real-estate accounting expertise into transformation work from day one.",
    icon: CircleDollarSign,
    members: [
      {
        name: "Kennedy Kraner",
        role: "Bookkeeper",
        imageUrl: headshots.kennedyKraner,
        bio: "Kennedy Kraner is a bookkeeper with four years of experience in property management accounting, transaction categorization, and financial record-keeping across multi-property portfolios. She brings proficiency in Rent Manager, QuickBooks, and Microsoft Office, along with additional capabilities in web development and graphic design.",
      },
      { name: "Rick Toussaint, CPA", role: "Tax + Pubco Reporting", imageUrl: headshots.rickToussaint },
      { name: "Harry Dublinsky, CPA", role: "CPA", imageUrl: headshots.harryDublinsky },
    ],
  },
  {
    label: "Engineering & Digital Growth",
    description: "The technology bench supports websites, search visibility, product design, engineering, and digital infrastructure required for durable systems.",
    icon: Code2,
    members: [
      { name: "Stan Gretov", role: "Team Lead: Websites + BPO", imageUrl: headshots.stanGretov },
      { name: "Vadim Litvak", role: "Director of SEO", imageUrl: headshots.vadimLitvak },
      { name: "Daria Shulenko", role: "Designer" },
      { name: "Valerio Mirof", role: "Engineer", imageUrl: headshots.valerioMirof },
    ],
  },
  {
    label: "Transformation & Automation",
    description: "The implementation bench converts operating pain points into workflows, automations, product improvements, and managed delivery routines.",
    icon: Sparkles,
    members: [
      { name: "Abby", role: "Automation" },
      { name: "Jeanne", role: "PM" },
      { name: "David", role: "Developer" },
      { name: "Nestor", role: "Developer" },
      { name: "Valerio", role: "Developer" },
      { name: "Edwin", role: "Developer" },
    ],
  },
];

const extendedNetwork: Array<TeamPerson & { group: string; icon: typeof Landmark }> = [
  { name: "Geoff Horn", role: "Payments", group: "Alliances", icon: Landmark, imageUrl: headshots.geoffHorn },
  { name: "Bruce Ditman", role: "Advisor", group: "Advisors", icon: BadgeCheck, imageUrl: headshots.bruceDitman },
  { name: "Liron David", role: "Advisor", group: "Advisors", icon: BadgeCheck, imageUrl: headshots.lironDavid },
];

const principles = [
  {
    title: "Technology",
    copy: "Architecture, automation, secure infrastructure, AI workflows, and integration logic are designed together rather than bolted on later.",
    icon: Code2,
  },
  {
    title: "Operations",
    copy: "Processes, handoffs, approvals, and exception paths are mapped against how the family office actually runs.",
    icon: Layers3,
  },
  {
    title: "Accounting",
    copy: "Financial controls, close routines, reporting evidence, and accounting expertise remain embedded in every transformation decision.",
    icon: CircleDollarSign,
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

function PrimaryCta() {
  return <BookingWidgetDialog context="team page family-office booking" />;
}

function InitialMark({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .replace(/[^A-Z]/gi, "")
    .toUpperCase();

  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.35rem] border border-black/8 bg-white shadow-[0_18px_45px_rgba(17,17,17,0.07)]">
      <div className="absolute inset-2 rounded-[1rem] bg-[radial-gradient(circle_at_25%_20%,rgba(10,101,255,0.16),transparent_45%),linear-gradient(135deg,#FFFFFF,#EEF4FF)]" />
      <span className="relative font-display text-2xl tracking-[-0.05em] text-[#111111]">{initials || "DT"}</span>
    </div>
  );
}

export default function Team() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        activeLabel="Team"
        bookingContext="team page family-office booking"
        contactContext="team page navigation contact"
      />

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-black/8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(10,101,255,0.10),transparent_31%),linear-gradient(115deg,#F7F4EE_0%,#FFFFFF_48%,#EEF4FF_100%)]" />
          <div className="container relative grid min-h-[720px] items-center gap-12 py-20 lg:grid-cols-[0.94fr_1.06fr] lg:py-28">
            <motion.div {...fadeUp}>
              <SectionLabel>Our team</SectionLabel>
              <h1 className="max-w-4xl font-display text-[clamp(3.3rem,7vw,7.3rem)] leading-[0.88] tracking-[-0.07em] text-[#111111]">
                Fusion teams for family-office transformation.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/62">
                Digital Therapy brings technology, operations, and accounting specialists into one coordinated team so family offices can move from diagnostic insight to implemented workflows with fewer handoffs.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrimaryCta />
                <a
                  href="/dt-brain"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/55 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  Explore DT Brain
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
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[#0A65FF]/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/50 p-3 shadow-[0_30px_90px_rgba(17,17,17,0.13)] backdrop-blur">
                <img src={boardroomVisual} alt="Digital Therapy team collaboration" className="h-[500px] w-full rounded-[1.75rem] object-cover" />
                <div className="absolute bottom-7 left-7 right-7 rounded-[1.45rem] border border-white/60 bg-white/78 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.10)] backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <img src={markUrl} alt="" className="mt-1 h-9 w-9 object-contain" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">One accountable team</p>
                      <p className="mt-2 text-sm leading-6 text-black/66">Technology, accounting, operations, automation, and advisors aligned around measurable operating outcomes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-black/8 bg-white py-24">
          <div className="container">
            <motion.div {...fadeUp} className="max-w-3xl">
              <SectionLabel>Leadership</SectionLabel>
              <h2 className="font-display text-[clamp(2.6rem,5vw,5.2rem)] leading-[0.95] tracking-[-0.06em]">
                Senior leads across transformation, technology, and finance.
              </h2>
            </motion.div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {leaders.map((leader, index) => (
                <motion.article
                  key={leader.name}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                  className="group relative overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] p-7 shadow-[0_20px_55px_rgba(17,17,17,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(17,17,17,0.10)]"
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[4rem] bg-[#0A65FF]/8" />
                  {leader.imageUrl ? (
                    <div className="relative -m-3 mb-7 overflow-hidden rounded-[1.6rem] bg-[#0A65FF]/8">
                      <img src={leader.imageUrl} alt={leader.name} className="h-64 w-full object-cover object-center" />
                    </div>
                  ) : (
                    <InitialMark name={leader.name} />
                  )}
                  <p className={`${leader.imageUrl ? "mt-0" : "mt-8"} text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]`}>{leader.role}</p>
                  <h3 className="mt-3 font-display text-4xl leading-none tracking-[-0.05em]">{leader.name}</h3>
                  <p className="mt-5 text-sm leading-6 text-black/58">{leader.specialty}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-black/8 bg-[#F7F4EE] py-24">
          <div className="container grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
            <motion.div {...fadeUp} className="lg:sticky lg:top-28 lg:self-start">
              <SectionLabel>Fusion model</SectionLabel>
              <h2 className="font-display text-[clamp(2.4rem,4.8vw,4.8rem)] leading-[0.95] tracking-[-0.06em]">
                Built for the way family-office work really crosses functions.
              </h2>
              <p className="mt-7 text-lg leading-8 text-black/62">
                The team page source positions Digital Therapy around three core capabilities: Technology, Operations, and Accounting. This page presents that model as a coordinated operating team for family offices and partner firms.
              </p>
              <div className="mt-9 overflow-hidden rounded-[1.8rem] border border-black/8 bg-white p-3 shadow-[0_20px_60px_rgba(17,17,17,0.07)]">
                <img src={wealthMapVisual} alt="Family-office operating map" className="h-64 w-full rounded-[1.35rem] object-cover" />
              </div>
            </motion.div>
            <div className="space-y-5">
              {principles.map((principle, index) => {
                const Icon = principle.icon;
                return (
                  <motion.article
                    key={principle.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                    className="grid gap-6 rounded-[2rem] border border-black/8 bg-white p-7 shadow-[0_18px_50px_rgba(17,17,17,0.05)] sm:grid-cols-[auto_1fr]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A65FF]/10 text-[#0A65FF]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-3xl tracking-[-0.05em]">{principle.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-black/60">{principle.copy}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-black/8 bg-white py-24">
          <div className="container">
            <motion.div {...fadeUp} className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <SectionLabel>Specialist benches</SectionLabel>
                <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.06em]">
                  The right expertise comes into the room at the right time.
                </h2>
              </div>
              <p className="max-w-md text-base leading-7 text-black/58">
                Team members are organized around the disciplines required to modernize close cycles, reporting workflows, automation, digital experiences, and secure family-office operations.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-7">
              {groups.map((group, groupIndex) => {
                const Icon = group.icon;
                return (
                  <motion.section
                    key={group.label}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: groupIndex * 0.08 }}
                    className="rounded-[2.2rem] border border-black/8 bg-[#F7F4EE] p-6 shadow-[0_20px_65px_rgba(17,17,17,0.055)] lg:p-8"
                  >
                    <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
                      <div>
                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#0A65FF]/10 text-[#0A65FF]">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mt-7 font-display text-4xl tracking-[-0.055em]">{group.label}</h3>
                        <p className="mt-4 max-w-md text-sm leading-6 text-black/58">{group.description}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.members.map((member) => (
                          <article key={`${group.label}-${member.name}-${member.role}`} className="rounded-[1.4rem] border border-black/7 bg-white p-5">
                            <div className="flex items-center gap-4">
                              {member.imageUrl ? (
                                <img src={member.imageUrl} alt={member.name} className="h-20 w-20 shrink-0 rounded-[1.35rem] border border-black/8 object-cover object-center shadow-[0_18px_45px_rgba(17,17,17,0.08)]" />
                              ) : (
                                <InitialMark name={member.name} />
                              )}
                              <div>
                                <h4 className="font-display text-2xl leading-none tracking-[-0.045em]">{member.name}</h4>
                                <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-black/44">{member.role}</p>
                              </div>
                            </div>
                            {member.bio ? <p className="mt-4 text-sm leading-6 text-black/56">{member.bio}</p> : null}
                          </article>
                        ))}
                      </div>
                    </div>
                  </motion.section>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-black/8 bg-[#F7F4EE] py-24">
          <div className="container">
            <motion.div {...fadeUp} className="max-w-3xl">
              <SectionLabel>Alliances & advisors</SectionLabel>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4.8rem)] leading-[0.96] tracking-[-0.06em]">
                A broader network for payments, advisory judgment, and specialist context.
              </h2>
            </motion.div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {extendedNetwork.map((person, index) => {
                const Icon = person.icon;
                return (
                  <motion.article
                    key={`${person.group}-${person.name}`}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                    className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_18px_45px_rgba(17,17,17,0.05)]"
                  >
                    {person.imageUrl ? (
                      <div className="-mx-2 -mt-2 mb-5 overflow-hidden rounded-[1.35rem] bg-[#0A65FF]/8">
                        <img src={person.imageUrl} alt={person.name} className="h-56 w-full object-cover object-center" />
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A65FF]/10 text-[#0A65FF]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-black/8 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/42">{person.group}</span>
                    </div>
                    <h3 className="mt-7 font-display text-3xl tracking-[-0.05em]">{person.name}</h3>
                    <p className="mt-2 text-sm font-semibold text-[#0A65FF]">{person.role}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0E1117] py-24 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(10,101,255,0.30),transparent_30%),linear-gradient(120deg,#0E1117,#111827)]" />
          <div className="container relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div {...fadeUp}>
              <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#7BB2FF]">
                <span className="h-px w-8 bg-[#7BB2FF]" />
                Work with us
              </div>
              <h2 className="font-display text-[clamp(2.7rem,5vw,5.5rem)] leading-[0.9] tracking-[-0.07em]">
                Book 30 minutes with the team built to find your first high-value win.
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/64">
                Bring us your pain points, see game-changing custom solutions already deployed for some of New York City’s largest and most discerning family offices, and leave with a practical view of where technology, operations, and accounting expertise can create value first.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrimaryCta />
                <a
                  href="/"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/14"
                >
                  Return to homepage
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Pain points", icon: Building2, copy: "Surface the reporting, workflow, data, or control issues that are consuming leadership attention." },
                { label: "Solution tour", icon: UsersRound, copy: "See custom systems that have been successfully deployed in demanding family-office environments." },
                { label: "First value", icon: Compass, copy: "Prioritize the best initial place to create measurable impact before broader transformation." },
                { label: "Delivery fit", icon: ShieldCheck, copy: "Align the right Digital Therapy specialists around a practical, secure path forward." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="rounded-[1.7rem] border border-white/10 bg-white/8 p-6 backdrop-blur">
                    <Icon className="h-6 w-6 text-[#7BB2FF]" />
                    <h3 className="mt-6 font-display text-3xl tracking-[-0.05em]">{item.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/58">{item.copy}</p>
                  </article>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
