/**
 * Get Started — single conversion hub for visitors ready to engage.
 *
 * v1 surfaces the three existing on-ramps (book a 30-min intro, send a written
 * message, apply as a vendor) using the existing Booking + Contact + Vendor
 * dialogs so nothing is unique to this page that has to be maintained separately.
 * Copy is intentionally light — iterate from here.
 */
import { BookingWidgetDialog } from "@/components/ContactBooking";
import NeedsAssessmentDialog from "@/components/NeedsAssessmentDialog";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import { ArrowUpRight, Calculator, CalendarClock, ClipboardList } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

export default function GetStarted() {
  const [accountingOpen, setAccountingOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f8f8f7] text-[#111111]">
      <PublicHeader activeLabel="Get Started" bookingContext="get-started page booking" />

      <main className="container pt-16 pb-24 lg:pt-24 lg:pb-28">
        {/* Hero */}
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.24em] text-[#0A65FF]">
            Get started
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,5.6vw,4.25rem)] leading-[1.04] tracking-[-0.045em]">
            Bring Digital Therapy <br className="hidden sm:block" />into your family office.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/65">
            Start with a 30-minute intake session — we will walk through your environment together and come back with one clear next step.
          </p>
        </motion.div>

        {/* Primary CTA */}
        <div className="mx-auto mt-14 max-w-xl">
          <PathCard
            delay={0}
            eyebrow="Intake session"
            icon={CalendarClock}
            title="Book a 30-minute intake session."
            body="Walk us through your environment. We will come back with one clear next step — or tell you straight if we are not the right fit."
            cta={
              <BookingWidgetDialog
                variant="primary"
                context="get-started page booking"
                label="Book 30 min"
              />
            }
          />
        </div>

        {/* Needs Assessments */}
        <section className="mt-24 lg:mt-32">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.24em] text-[#0A65FF]">
              <ClipboardList className="h-4 w-4" />
              Step two
            </div>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.06] tracking-[-0.04em]">
              Needs Assessments
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/65">
              After the intake session, we run targeted assessments to map your current state and surface the highest-impact opportunities.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 max-w-xl">
            <ClickableAssessmentCard
              delay={0}
              eyebrow="Finance & operations"
              icon={Calculator}
              title="Outsourced Accounting / Bookkeeping"
              body="Evaluate your current accounting workflow, close cadence, and reporting cadence to identify what to standardize, automate, and hand off."
              onClick={() => setAccountingOpen(true)}
            />
          </div>
        </section>
      </main>

      <NeedsAssessmentDialog open={accountingOpen} onOpenChange={setAccountingOpen} />
    </div>
  );
}

function ClickableAssessmentCard({
  eyebrow,
  icon: Icon,
  title,
  body,
  onClick,
  delay,
}: {
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay }}
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col rounded-[1.6rem] border border-black/10 bg-white p-7 text-left shadow-[0_2px_24px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A65FF]/35 hover:shadow-[0_18px_45px_rgba(10,101,255,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF] focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A65FF]/10 text-[#0A65FF] transition-colors group-hover:bg-[#0A65FF] group-hover:text-white">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#0040c9]">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-5 font-display text-2xl leading-tight tracking-[-0.03em] text-[#111111]">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-black/68">{body}</p>
      <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A65FF] transition-transform duration-300 group-hover:translate-x-0.5">
        Start assessment
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </motion.button>
  );
}

function PathCard({
  eyebrow,
  icon: Icon,
  title,
  body,
  cta,
  delay,
}: {
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  cta?: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay }}
      className="flex flex-col rounded-[1.6rem] border border-black/10 bg-white p-7 shadow-[0_2px_24px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A65FF]/10 text-[#0A65FF]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#0040c9]">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-5 font-display text-2xl leading-tight tracking-[-0.03em] text-[#111111]">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-black/68">{body}</p>
      {cta ? <div className="mt-7 flex">{cta}</div> : null}
    </motion.div>
  );
}
