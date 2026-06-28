/**
 * Get Started — hub of intake assessments by discipline.
 *
 * Each card opens a structured assessment dialog (e.g. Outsourced Accounting /
 * Bookkeeping) that collects family-office profile, scale, and current state.
 * Submissions persist to dt_site.needs_assessment and trigger an owner email.
 */
import NeedsAssessmentDialog from "@/components/NeedsAssessmentDialog";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import { ArrowUpRight, Calculator } from "lucide-react";
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
            Intake Assessments
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/65">
            Take 5 – 10 minutes to walk us through your operation. We come back within one business day with what we see and a recommended next step.
          </p>
        </motion.div>

        {/* Assessment cards */}
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
