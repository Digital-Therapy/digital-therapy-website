/**
 * Digital Therapy Partners page.
 * Dedicated page for the private-bank / multifamily-office / advisory-firm partner model.
 */
import { ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import { UsersRound } from "lucide-react";

const boardroomVisual =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663423043272/KoBQvcXLgm3E62hnyhkGPf/dt_family_office_boardroom-UvecEVLEaVqpouVEhEb9mw.webp";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

const partnerPoints = [
  "Works behind the scenes or in joint delivery models.",
  "Adds operating transformation without competing for the advisory mandate.",
  "Creates diagnostics, pilots, and implementation roadmaps partners can introduce.",
  "Reduces implementation risk through one accountable cross-functional pod.",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

export default function Partners() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        activeLabel="Partners"
        bookingContext="partners page family-office booking"
        contactContext="partners page navigation contact"
      />

      <main className="pt-20">
        <section className="bg-[#F7F4EE] py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div {...fadeUp}>
              <SectionLabel>For private banks and advisors</SectionLabel>
              <h1 className="font-display text-[clamp(2.7rem,5vw,5.6rem)] leading-[0.92] tracking-[-0.06em]">
                A confidential implementation partner for complex clients.
              </h1>
              <p className="mt-6 text-lg leading-8 text-black/80">
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
                {partnerPoints.map((item) => (
                  <div key={item} className="flex gap-3 border-t border-black/10 pt-4">
                    <UsersRound className="mt-1 h-5 w-5 shrink-0 text-[#0A65FF]" />
                    <p className="leading-7 text-black/82">{item}</p>
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
      </main>
    </div>
  );
}
