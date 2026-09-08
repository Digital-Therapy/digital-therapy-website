/**
 * Digital Therapy quiet luxury private-banking interface.
 * Preserve light ivory surfaces, charcoal typography, restrained Digital Therapy blue,
 * editorial spacing, and fusion-team positioning for family-office audiences.
 */
import { useState } from "react";
import {
  BookingWidgetDialog,
  ContactFormDialog,
  MessageToMemberDialog,
} from "@/components/ContactBooking";
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

const headshots = {
  bruceDitman: "/team/bruce-blue.webp",
  lironDavid: "/team/liron.avif",
  jonathanKobrin: "/team/jon.avif",
  miltonRodas: "/team/milton.webp",
  rickToussaint: "/team/rick.avif",
  stanGretov: "/team/stan.webp",
  vadimLitvak: "/team/vadim.avif",
  valerioMirof: "/team/valerio.avif",
  geoffHorn: "/team/geoff-blue.webp",
  dougGray: "/team/doug-blue.webp",
  matthewTreem: "/team/matthew.webp",
  louKurpis: "/team/lou.webp",
  aaronGraf: "/team/aaron.webp",
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

const groups: Array<{
  label: string;
  description: string;
  icon: typeof CircleDollarSign;
  members: TeamPerson[];
}> = [
  {
    label: "Strategy, Operations + Management",
    description:
      "Senior operators who structure capital, run complex programs, and translate strategy into repeatable execution across geographies and stakeholder groups.",
    icon: Compass,
    members: [
      {
        name: "Jonathan Kobrin",
        role: "Founder & CEO",
        specialty:
          "Operating model, transformation strategy, and client leadership.",
        imageUrl: headshots.jonathanKobrin,
        isFounder: true,
      },
      {
        name: "Aaron Graf",
        role: "Strategy, Operations + Management",
        imageUrl: headshots.aaronGraf,
        bio: "Aaron Graf is a senior real-estate executive with two decades of experience originating, financing, and scaling housing platforms. Since 2021 he has been Executive Director of Nehemiah HDFC, moving the organization from junior-partner to senior-partner developer with full P&L responsibility. He has originated a 1,350-unit, $900M pipeline, asset-manages a 680-unit affordable portfolio, and expanded the platform from Brooklyn into Washington, D.C., Maryland, New Jersey, and North Carolina — structuring capital across HPD subsidies, LIHTC equity, construction debt, and credit facilities.\n\nEarlier, Aaron co-founded LG Fairmont, a tech-enabled brokerage built on a proprietary CRM and operations platform. It grew to roughly 300 agents and $3B+ in annual production, made the Inc. 5000 in 2017 and 2018, and exited to Compass (NYSE: COMP) in 2022; it is now the second-highest-producing mega team in Manhattan.\n\nBefore that, he founded AJG Capital Group, developed three gut-rehab condominium projects, placed construction capital for clients, and helped the FDIC wind down more than $500M in REO. He began his career originating and underwriting construction and permanent loans at the Community Preservation Corporation. Aaron holds an MBA in Finance with a real-estate concentration from Columbia Business School and a B.A. in Economics from Kenyon College.",
      },
    ],
  },
  {
    label: "Finance + Accounting",
    description:
      "The finance bench brings bookkeeping, tax, public-company reporting, and real-estate accounting expertise into transformation work from day one.",
    icon: CircleDollarSign,
    members: [
      {
        name: "Rick Toussaint, CPA",
        role: "Tax + Pubco Reporting",
        imageUrl: headshots.rickToussaint,
      },
      {
        name: "Matthew Treem",
        role: "Fractional CFO + Debt Advisory",
        imageUrl: headshots.matthewTreem,
        bio: "Matthew Treem is a finance executive specializing in Fractional CFO and Debt Advisory. He offers 20 years of experience across commercial banking and corporate finance.\n\nMatthew spent eight years at Bank of America Merrill Lynch focused on middle-market commercial clientele. He has advised on more than $500 million of corporate and commercial real-estate financing. His banking background provides a strong foundation in credit underwriting, capital structuring, and lender requirements.\n\nToday, Matthew serves as a fractional CFO and strategic advisor to privately held and lower-middle-market companies, helping management teams improve financial operations, working capital, cash flow, profitability, and access to capital.\n\nHe also advises companies on debt financing, including asset-based lending, bank lines of credit, SBA and acquisition financing, and private credit. Matthew combines the credit discipline of a commercial banker with the hands-on perspective of a CFO to help companies strengthen liquidity, fund growth, and create long-term enterprise value.",
      },
      {
        name: "Lou Kurpis, CPA",
        role: "Tax Advisor + Financial Executive",
        imageUrl: headshots.louKurpis,
        bio: "Lou Kurpis is a seasoned Certified Public Accountant with more than 40 years as a CPA and 50 years of financial and accounting experience. He provides clients with expertise in tax advisory and planning, accounting, financial reporting, business structuring, and strategic financial guidance.\n\nIn addition to his extensive CPA practice experience, Lou has served as a CFO, Controller, and Finance Director, giving him a unique ability to advise clients from both a tax and operational perspective. His experience spans numerous industries, including transportation, CPG, food and beverage, wholesale distribution, and manufacturing.\n\nLou brings decades of practical experience helping business owners and companies navigate complex tax, accounting, and financial decisions.",
      },
      {
        name: "Geoff Horn",
        role: "Payments Partner",
        imageUrl: headshots.geoffHorn,
      },
    ],
  },
  {
    label: "Engineering & Digital Growth",
    description:
      "The technology bench supports websites, search visibility, product design, engineering, and digital infrastructure required for durable systems.",
    icon: Code2,
    members: [
      {
        name: "Milton Rodas",
        role: "CTO",
        imageUrl: headshots.miltonRodas,
        bio: "Former Tesla and Stellantis Lead Project Architect + Automation Engineer.",
      },
      {
        name: "Stan Gretov",
        role: "Team Lead: Websites + BPO",
        imageUrl: headshots.stanGretov,
        bio: "Web design, development and marketing expert with over 10 years of experience in the tech industry.\n\nConstantly looking to expand our reach in the world of web and digital marketing.",
      },
      {
        name: "Vadim Litvak",
        role: "Director of SEO",
        imageUrl: headshots.vadimLitvak,
      },
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
  TeamPerson & {
    group: string;
    icon: typeof Landmark;
    imageClassName?: string;
    imageContainerClassName?: string;
  }
> = [
  {
    name: "Bruce Ditman",
    role: "Advisor",
    group: "Advisor",
    icon: BadgeCheck,
    imageUrl: headshots.bruceDitman,
  },
  {
    name: "Liron David",
    role: "Advisor",
    group: "Advisor",
    icon: BadgeCheck,
    imageUrl: headshots.lironDavid,
  },
  {
    name: "Doug Gray",
    role: "Advisor",
    group: "Advisor",
    icon: BadgeCheck,
    imageUrl: headshots.dougGray,
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

function FounderStoryDialog({
  leader,
  children,
}: {
  leader: TeamPerson;
  children: React.ReactNode;
}) {
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
                  className="aspect-[4/5] w-full object-cover object-top"
                  width={800}
                  height={800}
                />
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
                Jon Kobrin is the founder of Digital Therapy, a firm often
                referred to as the accounting firm of the future. With a
                background in entrepreneurship and software development, Jon
                brings a unique perspective to transformation projects.
              </p>
              <p>
                From 2021 to 2024, Jon served as Director of Software Solutions
                &amp; Transformation at EisnerAmper, a Top 20 tax, accounting,
                and advisory firm. There, he created the beginnings of his
                Fusion Team concept, which he has since evolved and brought to
                market through Digital Therapy.
              </p>
              <p>
                Fusion Teams begin with three SMEs &mdash; one Finance &amp;
                Accounting SME, one Technology SME, and one Operations &amp;
                Process SME. These experts don&apos;t have natural pathways to
                work with one another inside a typical practice-based firm
                architecture. Together, they can tackle and overcome the most
                complex transformation challenges, and the right team mix solves
                roughly 95% of project friction.
              </p>
            </div>
            <p className="mt-6 rounded-[1rem] border border-black/8 bg-white/70 p-4 text-xs leading-6 text-black/95">
              These three functions used to live in separate silos, each with
              its own leader. The work has since knotted them together &mdash;
              no one function separates cleanly from another. Cross-training is
              the only way through: each role learning enough of the others to
              close the gaps no single discipline can close alone. A small
              structural shift &mdash; but it delivers the kind of impact
              clients deserve and rarely receive.
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
  // "booking" → Apollo 30-min calendar.
  // "message" → routed message to intake@digitaltherapy.io tagged to this individual.
  cta?: "booking" | "message";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[88vh] w-full max-w-[95vw] overflow-y-auto rounded-[1.6rem] border-black/10 bg-[#F7F4EE] p-0 text-[#111111] sm:max-w-[920px]">
        <div className="grid gap-0 sm:grid-cols-[320px_1fr]">
          {member.imageUrl ? (
            <div className="self-start">
              <div className="relative bg-[#0A65FF]/8">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="aspect-[4/5] w-full object-cover object-top"
                  width={800}
                  height={800}
                />
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
    .map(part => part[0])
    .join("")
    .replace(/[^A-Z]/gi, "")
    .toUpperCase();

  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.35rem] border border-black/8 bg-white shadow-[0_18px_45px_rgba(17,17,17,0.07)]">
      <div className="absolute inset-2 rounded-[1rem] bg-[radial-gradient(circle_at_25%_20%,rgba(10,101,255,0.16),transparent_45%),linear-gradient(135deg,#FFFFFF,#EEF4FF)]" />
      <span className="relative font-display text-2xl tracking-[-0.05em] text-[#111111]">
        {initials || "DT"}
      </span>
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
        <section
          id="team-cards"
          className="scroll-mt-24 border-b border-black/8 bg-white py-24"
        >
          <div className="container">
            <motion.div
              {...fadeUp}
              className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"
            >
              <div className="max-w-3xl">
                <SectionLabel>Specialist benches</SectionLabel>
                <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.06em]">
                  The right expertise
                  <br />
                  at the right time.
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
                    transition={{
                      ...fadeUp.transition,
                      delay: groupIndex * 0.08,
                    }}
                    className="rounded-[2.2rem] border border-black/8 bg-[#F7F4EE] p-6 shadow-[0_20px_65px_rgba(17,17,17,0.055)] lg:p-8"
                  >
                    <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
                      <div>
                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#0A65FF]/10 text-[#0A65FF]">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mt-7 font-display text-4xl tracking-[-0.055em]">
                          {group.label}
                        </h3>
                        <p className="mt-4 max-w-md text-sm leading-6 text-black/78">
                          {group.description}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.members.map(member => {
                          const cardInner = (
                            <div className="flex items-center gap-4">
                              {member.imageUrl ? (
                                <img
                                  src={member.imageUrl}
                                  alt={member.name}
                                  // Valerio + Matthew get object-top so their
                                  // headshots read with more headroom in the
                                  // small avatar tile (their source frames sit
                                  // tight to the top and would otherwise crop
                                  // hair).
                                  className={`h-20 w-20 shrink-0 rounded-[1.35rem] border border-black/8 object-cover shadow-[0_18px_45px_rgba(17,17,17,0.08)] ${
                                    member.name === "Valerio Mirof" ||
                                    member.name === "Matthew Treem"
                                      ? "object-top"
                                      : "object-center"
                                  }`}
                                  width={800}
                                  height={800}
                                />
                              ) : (
                                <InitialMark name={member.name} />
                              )}
                              <div>
                                <h4 className="font-display text-2xl leading-none tracking-[-0.045em]">
                                  {member.name}
                                </h4>
                                <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-black/44">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                          );

                          // Founder (Jonathan) opens the bespoke Founder story
                          // dialog with the booking CTA — same treatment he had
                          // on the retired Leaders section.
                          if (member.isFounder) {
                            return (
                              <FounderStoryDialog
                                key={`${group.label}-${member.name}-${member.role}`}
                                leader={member}
                              >
                                <button
                                  type="button"
                                  aria-label={`Read bio: ${member.name}`}
                                  data-testid="founder-card-trigger"
                                  className="w-full rounded-[1.4rem] border border-black/7 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A65FF]/35 hover:shadow-[0_18px_45px_rgba(17,17,17,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/55 focus-visible:ring-offset-2"
                                >
                                  {cardInner}
                                </button>
                              </FounderStoryDialog>
                            );
                          }

                          if (member.bio) {
                            return (
                              <MemberBioDialog
                                key={`${group.label}-${member.name}-${member.role}`}
                                member={member}
                              >
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
                            <article
                              key={`${group.label}-${member.name}-${member.role}`}
                              className="rounded-[1.4rem] border border-black/7 bg-white p-5"
                            >
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
              <SectionLabel>Advisors</SectionLabel>
            </motion.div>

            {/*
              Renders every person in extendedNetwork with group === "Advisor".
              (The "Partners" sub-section was retired after Geoff Horn moved into
              Finance + Accounting.)
            */}
            {(() => {
              const cardClasses =
                "w-full max-w-[300px] sm:w-[280px] overflow-hidden rounded-[1.75rem] border border-black/8 bg-white p-6 text-left shadow-[0_18px_45px_rgba(17,17,17,0.05)]";

              const renderPersonCard = (
                person: (typeof extendedNetwork)[number],
                index: number
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
                          className={
                            person.imageClassName ??
                            "h-56 w-full object-cover object-center"
                          }
                          width={800}
                          height={800}
                        />
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A65FF]/10 text-[#0A65FF]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-black/8 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/42">
                        {person.group}
                      </span>
                    </div>
                    <h3 className="mt-7 font-display text-3xl tracking-[-0.05em]">
                      {person.name}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-[#0A65FF]">
                      {person.role}
                    </p>
                  </>
                );

                if (person.bio) {
                  return (
                    <MemberBioDialog
                      key={`${person.group}-${person.name}`}
                      member={person}
                    >
                      <motion.button
                        type="button"
                        aria-label={`Read profile: ${person.name}`}
                        {...fadeUp}
                        transition={{
                          ...fadeUp.transition,
                          delay: index * 0.05,
                        }}
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

              const advisors = extendedNetwork.filter(
                p => p.group === "Advisor"
              );

              return (
                <div className="mt-6">
                  <h2 className="font-display text-[clamp(2.5rem,5vw,4.8rem)] leading-[0.96] tracking-[-0.06em]">
                    Advisors
                  </h2>
                  <div className="mt-12 flex flex-wrap justify-center gap-[42px] sm:justify-start">
                    {advisors.map((person, index) =>
                      renderPersonCard(person, index)
                    )}
                  </div>
                </div>
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
                Transformation starts with a chat.
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/64">
                Bring us your pain points, see game-changing custom solutions
                already deployed for some of New York City’s largest and most
                discerning family offices, and leave with a practical view of
                where technology, operations, and accounting expertise can
                create value first.
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
                {
                  label: "Pain points",
                  icon: Building2,
                  copy: "Surface the reporting, workflow, data, or control issues that are consuming leadership attention.",
                },
                {
                  label: "Solution tour",
                  icon: UsersRound,
                  copy: "See custom systems that have been successfully deployed in demanding family-office environments.",
                },
                {
                  label: "First value",
                  icon: Compass,
                  copy: "Prioritize the best initial place to create measurable impact before broader transformation.",
                },
                {
                  label: "Delivery fit",
                  icon: ShieldCheck,
                  copy: "Align the right Digital Therapy specialists around a practical, secure path forward.",
                },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.label}
                    className="rounded-[1.7rem] border border-white/10 bg-white/8 p-6 backdrop-blur"
                  >
                    <Icon className="h-6 w-6 text-[#7BB2FF]" />
                    <h3 className="mt-6 font-display text-3xl tracking-[-0.05em]">
                      {item.label}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/58">
                      {item.copy}
                    </p>
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
