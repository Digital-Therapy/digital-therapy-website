/**
 * Digital Therapy quiet luxury private-banking interface.
 * Preserve light ivory surfaces, charcoal typography, restrained Digital Therapy blue,
 * editorial spacing, and fusion-team positioning for family-office audiences.
 */
import { useState } from "react";
import { BookingWidgetDialog, ContactFormDialog, MessageToMemberDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Code2,
  Compass,
  Landmark,
  Paintbrush,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/dt-mark.webp";
const boardroomVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_family_office_boardroom-UvecEVLEaVqpouVEhEb9mw.webp";
const headshots = {
  harryDublinsky: "/team/harry.avif",
  bruceDitman: "/team/bruce-blue.webp",
  lironDavid: "/team/liron.avif",
  jonathanKobrin: "/team/jon.avif",
  hunterAtkins: "/team/hunter.webp",
  miltonRodas: "/team/milton.webp",
  kennedyKraner: "/team/kennedy.avif",
  rickToussaint: "/team/rick.avif",
  stanGretov: "/team/stan.webp",
  vadimLitvak: "/team/vadim.avif",
  valerioMirof: "/team/valerio.avif",
  geoffHorn: "/team/geoff-blue.webp",
  dariaShulenko: "/team/daria.avif",
  dougGray: "/team/doug-blue.webp",
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
  isFounder?: boolean;
};

const leaders: TeamPerson[] = [
  {
    name: "Jonathan Kobrin",
    role: "Founder & CEO",
    specialty: "Operating model, transformation strategy, and client leadership.",
    imageUrl: headshots.jonathanKobrin,
    isFounder: true,
  },
  {
    name: "Milton Rodas",
    role: "Chief Solution Engineer",
    specialty: "Systems architecture, integration, and technical execution.",
    imageUrl: headshots.miltonRodas,
    bio: "Former Tesla and Stellantis Lead Project Architect + Automation Engineer.",
  },
  {
    name: "Hunter Atkins, CPA",
    role: "CPA",
    specialty: "Accounting leadership, financial controls, and reporting operations.",
    imageUrl: headshots.hunterAtkins,
    bio: "Hunter Atkins is a licensed CPA and MBA specializing in accounting transformation, process automation, and AI-driven workflow design.\n\nAt Digital Therapy, he leads engagements for family office and small business clients, including ERP migrations, custom-built accounts-payable automation platforms, consolidated investment reporting dashboards, and fractional controllership.\n\nHe has also delivered multiple courses and educational series on AI and automation for accounting professionals.\n\nHunter brings over five years of prior experience in cost accounting, financial reporting, and month-end close management across manufacturing and public accounting environments.",
  },
];

const groups: Array<{
  label: string;
  description: string;
  icon: typeof CircleDollarSign;
  members: TeamPerson[];
}> = [
  {
    label: "Tax & Accounting",
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
      {
        name: "Stan Gretov",
        role: "Team Lead: Websites + BPO",
        imageUrl: headshots.stanGretov,
        bio: "Web design, development and marketing expert with over 10 years of experience in the tech industry.\n\nConstantly looking to expand our reach in the world of web and digital marketing.",
      },
      { name: "Vadim Litvak", role: "Director of SEO", imageUrl: headshots.vadimLitvak },
      { name: "Daria Shulenko", role: "Designer", imageUrl: headshots.dariaShulenko },
      {
        name: "Valerio Mirof",
        role: "Engineer",
        imageUrl: headshots.valerioMirof,
        bio: "Valerio applies his deep knowledge of MES, ERP, & cloud platforms (like AWS) to modernize & automate legacy technology stacks.\n\nValerio's expertise includes REST API development, cross-platform interfaces, and secure infrastructure deployment, enabling clients to scale operations while reducing manual overhead.\n\nValerio is truly a force multiplier.",
      },
    ],
  },
];

const extendedNetwork: Array<
  TeamPerson & { group: string; icon: typeof Landmark; imageClassName?: string; imageContainerClassName?: string }
> = [
  { name: "Bruce Ditman", role: "Advisor", group: "Advisor", icon: BadgeCheck, imageUrl: headshots.bruceDitman },
  { name: "Liron David", role: "Advisor", group: "Advisor", icon: BadgeCheck, imageUrl: headshots.lironDavid },
  { name: "Doug Gray", role: "Advisor", group: "Advisor", icon: BadgeCheck, imageUrl: headshots.dougGray },
  { name: "Geoff Horn", role: "Payments Partner", group: "Partner", icon: Landmark, imageUrl: headshots.geoffHorn },
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

function FounderStoryDialog({ leader, children }: { leader: TeamPerson; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        data-testid="founder-story-dialog"
        className="max-h-[88vh] w-full max-w-[95vw] overflow-y-auto rounded-[1.6rem] border-black/10 bg-[#F7F4EE] p-0 text-[#111111] sm:max-w-[960px]"
      >
        <div className="grid gap-0 sm:grid-cols-[320px_1fr]">
          {leader.imageUrl ? (
            <div className="self-start">
              <div className="relative bg-[#0A65FF]/8">
                <img
                  src={leader.imageUrl}
                  alt={leader.name}
                  className="aspect-[4/5] w-full object-cover object-top" width={800} height={800}/>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A65FF]/10 via-transparent to-transparent" />
              </div>
              <DialogHeader className="space-y-1 px-6 pb-6 pt-5 text-left sm:px-7">
                <DialogTitle className="font-display text-3xl leading-[1.02] tracking-[-0.04em] text-[#111111]">
                  {leader.name}
                </DialogTitle>
                <DialogDescription className="text-sm font-semibold text-[#0A65FF]">
                  Founder &amp; CEO, Digital Therapy
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : null}
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="mb-5 inline-flex w-fit items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
              <span className="h-px w-8 bg-[#0A65FF]" />
              Founder story
            </div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-black/85">
              <p>
                Jon Kobrin is the founder of Digital Therapy, a firm often referred to as the accounting firm of the future. With a background in entrepreneurship and software development, Jon brings a unique perspective to transformation projects.
              </p>
              <p>
                From 2021 to 2024, Jon served as Director of Software Solutions &amp; Transformation at EisnerAmper, a Top 20 tax, accounting, and advisory firm. There, he created the beginnings of his Fusion Team concept, which he has since evolved and brought to market through Digital Therapy.
              </p>
              <p>
                Fusion Teams begin with three SMEs &mdash; one Finance &amp; Accounting SME, one Technology SME, and one Operations &amp; Process SME. These experts don&apos;t have natural pathways to work with one another inside a typical practice-based firm architecture. Together, they can tackle and overcome the most complex transformation challenges, and the right team mix solves roughly 95% of project friction.
              </p>
            </div>
            <p className="mt-6 rounded-[1rem] border border-black/8 bg-white/70 p-4 text-xs leading-6 text-black/95">
              These three functions used to live in separate silos, each with its own leader. The work has since knotted them together &mdash; no one function separates cleanly from another. Cross-training is the only way through: each role learning enough of the others to close the gaps no single discipline can close alone. A small structural shift &mdash; but it delivers the kind of impact clients deserve and rarely receive.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <BookingWidgetDialog context="team page founder story booking" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MemberBioDialog({
  member,
  children,
  cta = "message",
}: {
  member: TeamPerson;
  children: React.ReactNode;
  // "booking" → Apollo 30-min calendar (leaders only).
  // "message" → routed message to intake@digitaltherapy.io tagged to this individual.
  cta?: "booking" | "message";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-h-[88vh] w-full max-w-[95vw] overflow-y-auto rounded-[1.6rem] border-black/10 bg-[#F7F4EE] p-0 text-[#111111] sm:max-w-[920px]"
      >
        <div className="grid gap-0 sm:grid-cols-[320px_1fr]">
          {member.imageUrl ? (
            <div className="self-start">
              <div className="relative bg-[#0A65FF]/8">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="aspect-[4/5] w-full object-cover object-top" width={800} height={800}/>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A65FF]/10 via-transparent to-transparent" />
              </div>
              <DialogHeader className="space-y-1 px-6 pb-6 pt-5 text-left sm:px-7">
                <DialogTitle className="font-display text-3xl leading-[1.02] tracking-[-0.04em] text-[#111111]">
                  {member.name}
                </DialogTitle>
                <DialogDescription className="text-sm font-semibold text-[#0A65FF]">
                  {member.role}
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : null}
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="mb-5 inline-flex w-fit items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
              <span className="h-px w-8 bg-[#0A65FF]" />
              Team profile
            </div>
            <div className="space-y-4 text-sm leading-7 text-black/95">
              {(member.bio ?? "")
                .split(/\n\s*\n/)
                .map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              {cta === "booking" ? (
                <BookingWidgetDialog context="team page member profile booking" />
              ) : (
                <MessageToMemberDialog
                  memberName={member.name}
                  memberRole={member.role}
                  context="team page member profile message"
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
  // Controls the contact-form popup launched from the dark "Work with us" closing CTA.
  const [contactOpen, setContactOpen] = useState(false);

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
              <h1 className="max-w-4xl font-display text-[70px] leading-[0.95] tracking-[-0.05em] text-[#111111]">
                Purpose-built for<br />family-office transformation.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-black/80">
                Digital Therapy brings technology, operations, and accounting specialists into one coordinated team.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrimaryCta />
                <a
                  href="#team-cards"
                  onClick={(event) => {
                    event.preventDefault();
                    document
                      .getElementById("team-cards")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white/55 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:border-[#0A65FF]/50 hover:text-[#0A65FF]"
                >
                  Meet the team.
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
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
                <img src={boardroomVisual} alt="Digital Therapy team collaboration" className="h-[500px] w-full rounded-[1.75rem] object-cover" width={1920} height={1080}/>
                <div className="absolute bottom-7 left-7 right-7 rounded-[1.45rem] border border-white/60 bg-white/78 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.10)] backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <img src={markUrl} alt="" className="mt-1 h-9 w-9 object-contain" width={197} height={227}/>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]">One accountable team</p>
                      <p className="mt-2 text-sm leading-6 text-black/82">Technology, accounting, operations, automation, and advisors aligned around measurable operating outcomes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="team-cards" className="scroll-mt-24 border-b border-black/8 bg-white py-24">
          <div className="container">
            <motion.div {...fadeUp} className="max-w-3xl">
              <SectionLabel>Leadership</SectionLabel>
              <h2 className="font-display text-[clamp(2.6rem,5vw,5.2rem)] leading-[0.95] tracking-[-0.06em]">
                Leaders
              </h2>
            </motion.div>
            <div className="mt-12 flex flex-wrap justify-center gap-15 sm:justify-start">
              {leaders.map((leader, index) => {
                const cardInner = (
                  <>
                    <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[4rem] bg-[#0A65FF]/8" />
                    {leader.imageUrl ? (
                      <div className="relative -m-3 mb-7 overflow-hidden rounded-[1.6rem] bg-[#0A65FF]/8">
                        <img
                          src={leader.imageUrl}
                          alt={leader.name}
                          // Jonathan + Milton get object-top so their photos read with more
                          // headroom (the top of the original frame stays visible, pushing
                          // the head lower in the card). Hunter stays centered.
                          className={`h-64 w-full object-cover ${
                            leader.name === "Jonathan Kobrin" || leader.name === "Milton Rodas"
                              ? "object-top"
                              : "object-center"
                          }`} width={800} height={800}/>
                      </div>
                    ) : (
                      <InitialMark name={leader.name} />
                    )}
                    <p className={`${leader.imageUrl ? "mt-0" : "mt-8"} text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]`}>{leader.role}</p>
                    <h3 className="mt-3 font-display text-4xl leading-none tracking-[-0.05em]">{leader.name}</h3>
                    <p className="mt-5 text-sm leading-6 text-black/78">{leader.specialty}</p>
                    {leader.isFounder || leader.bio ? (
                      <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0A65FF] transition-transform duration-300 group-hover:translate-x-1">
                        Read bio
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    ) : null}
                  </>
                );

                // Leader cards lock at ~336px wide (20% wider than the Alliance cards) and never grow with the browser.
                const cardBaseClasses =
                  "group relative w-full max-w-[360px] sm:w-[336px] overflow-hidden rounded-[2rem] border border-black/8 bg-[#F7F4EE] p-7 shadow-[0_20px_55px_rgba(17,17,17,0.06)]";

                if (leader.isFounder) {
                  return (
                    <FounderStoryDialog key={leader.name} leader={leader}>
                      <motion.button
                        type="button"
                        aria-label={`Read bio: ${leader.name}`}
                        data-testid="founder-card-trigger"
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                        className={`${cardBaseClasses} text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(17,17,17,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EE]`}
                      >
                        {cardInner}
                      </motion.button>
                    </FounderStoryDialog>
                  );
                }

                if (leader.bio) {
                  return (
                    // Leaders keep the Apollo 30-min booking CTA.
                    <MemberBioDialog key={leader.name} member={leader} cta="booking">
                      <motion.button
                        type="button"
                        aria-label={`Read profile: ${leader.name}`}
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                        className={`${cardBaseClasses} text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(17,17,17,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EE]`}
                      >
                        {cardInner}
                      </motion.button>
                    </MemberBioDialog>
                  );
                }

                return (
                  <motion.article
                    key={leader.name}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                    className={`${cardBaseClasses} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(17,17,17,0.10)]`}
                  >
                    {cardInner}
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
                  The right expertise<br />at the right time.
                </h2>
              </div>
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
                        <p className="mt-4 max-w-md text-sm leading-6 text-black/78">{group.description}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.members.map((member) => {
                          const cardInner = (
                            <div className="flex items-center gap-4">
                              {member.imageUrl ? (
                                <img
                                  src={member.imageUrl}
                                  alt={member.name}
                                  // Valerio gets object-top so his headshot reads with more
                                  // headroom in the small avatar tile, matching the lift on
                                  // Jonathan + Milton's leader cards.
                                  className={`h-20 w-20 shrink-0 rounded-[1.35rem] border border-black/8 object-cover shadow-[0_18px_45px_rgba(17,17,17,0.08)] ${
                                    member.name === "Valerio Mirof" ? "object-top" : "object-center"
                                  }`} width={800} height={800}/>
                              ) : (
                                <InitialMark name={member.name} />
                              )}
                              <div>
                                <h4 className="font-display text-2xl leading-none tracking-[-0.045em]">{member.name}</h4>
                                <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-black/44">{member.role}</p>
                              </div>
                            </div>
                          );

                          if (member.bio) {
                            return (
                              <MemberBioDialog key={`${group.label}-${member.name}-${member.role}`} member={member}>
                                <button
                                  type="button"
                                  aria-label={`Read profile: ${member.name}`}
                                  className="w-full rounded-[1.4rem] border border-black/7 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A65FF]/35 hover:shadow-[0_18px_45px_rgba(17,17,17,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/55 focus-visible:ring-offset-2"
                                >
                                  {cardInner}
                                </button>
                              </MemberBioDialog>
                            );
                          }

                          return (
                            <article key={`${group.label}-${member.name}-${member.role}`} className="rounded-[1.4rem] border border-black/7 bg-white p-5">
                              {cardInner}
                            </article>
                          );
                        })}
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
              <SectionLabel>Advisors &amp; Partners</SectionLabel>
            </motion.div>

            {/*
              Section is now split into TWO sub-sections rendered in this order:
              1. "Advisors" — every person in extendedNetwork with group === "Advisor".
              2. "Partners" — every person in extendedNetwork with group === "Partner".
              The card-rendering loop is shared between both via the renderPersonCard helper
              defined below so behavior (image overrides, hover, dialog wrapping) stays in sync.
            */}
            {(() => {
              const cardClasses =
                "w-full max-w-[300px] sm:w-[280px] overflow-hidden rounded-[1.75rem] border border-black/8 bg-white p-6 text-left shadow-[0_18px_45px_rgba(17,17,17,0.05)]";

              const renderPersonCard = (
                person: (typeof extendedNetwork)[number],
                index: number,
              ) => {
                const Icon = person.icon;
                const cardBody = (
                  <>
                    {person.imageUrl ? (
                      <div
                        className={
                          person.imageContainerClassName ??
                          "-mx-2 -mt-2 mb-5 overflow-hidden rounded-[1.35rem] bg-[#0A65FF]/8"
                        }
                      >
                        <img
                          src={person.imageUrl}
                          alt={person.name}
                          className={person.imageClassName ?? "h-56 w-full object-cover object-center"} width={800} height={800}/>
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
                  </>
                );

                if (person.bio) {
                  return (
                    <MemberBioDialog key={`${person.group}-${person.name}`} member={person}>
                      <motion.button
                        type="button"
                        aria-label={`Read profile: ${person.name}`}
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                        className={`${cardClasses} transition-all duration-300 hover:-translate-y-1 hover:border-[#0A65FF]/35 hover:shadow-[0_28px_70px_rgba(17,17,17,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/55 focus-visible:ring-offset-2`}
                      >
                        {cardBody}
                      </motion.button>
                    </MemberBioDialog>
                  );
                }

                return (
                  <motion.article
                    key={`${person.group}-${person.name}`}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                    className={cardClasses}
                  >
                    {cardBody}
                  </motion.article>
                );
              };

              const advisors = extendedNetwork.filter((p) => p.group === "Advisor");
              const partners = extendedNetwork.filter((p) => p.group === "Partner");

              return (
                <>
                  <div className="mt-6">
                    <h2 className="font-display text-[clamp(2.5rem,5vw,4.8rem)] leading-[0.96] tracking-[-0.06em]">
                      Advisors
                    </h2>
                    <div className="mt-12 flex flex-wrap justify-center gap-[42px] sm:justify-start">
                      {advisors.map((person, index) => renderPersonCard(person, index))}
                    </div>
                  </div>

                  <div className="mt-20">
                    <h2 className="font-display text-[clamp(2.5rem,5vw,4.8rem)] leading-[0.96] tracking-[-0.06em]">
                      Partners
                    </h2>
                    <div className="mt-12 flex flex-wrap justify-center gap-[42px] sm:justify-start">
                      {partners.map((person, index) => renderPersonCard(person, index))}
                    </div>
                  </div>
                </>
              );
            })()}
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
                Book 30 minutes with us. Transformation starts with a chat.
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/64">
                Bring us your pain points, see game-changing custom solutions already deployed for some of New York City’s largest and most discerning family offices, and leave with a practical view of where technology, operations, and accounting expertise can create value first.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrimaryCta />
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/14"
                >
                  Send us a message
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                {/* Hidden controlled contact-form popup launched by the button above */}
                <ContactFormDialog
                  hideTrigger
                  open={contactOpen}
                  onOpenChange={setContactOpen}
                  context="team page closing CTA — send us a message"
                />
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
