/**
 * Digital Therapy Vendor Applications portal.
 * Presents vendor-type cards; each opens the contact form with a vendor-type
 * context so submissions are routed appropriately.
 */
import PublicHeader from "@/components/PublicHeader";
import { VendorApplicationDialog } from "@/components/VendorApplicationDialog";
import { motion } from "framer-motion";
import { BarChart3, Briefcase, Code2, Cog, Landmark } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

const vendorTypes = [
  {
    title: "Technology SMEs",
    highlightedWords: ["Technology"],
    summary:
      "Full-stack engineers, AI specialists, RPA builders, systems architects, integration & data engineers.",
    icon: Code2,
    context: "vendor application: Technology SME",
    buttonLabel: "Apply as Technology SME",
  },
  {
    title: "Finance & Accounting SMEs",
    highlightedWords: ["Finance", "Accounting"],
    summary:
      "CPAs, controllers, AP/AR specialists, close-cycle leaders, tax & reporting practitioners.",
    icon: BarChart3,
    context: "vendor application: Finance & Accounting SME",
    buttonLabel: "Apply as Finance & Accounting SME",
  },
  {
    title: "Operations & Process SMEs",
    highlightedWords: ["Operations", "Process"],
    summary:
      "Process architects, SOP designers, workflow & swim-lane specialists, KPI and playbook builders.",
    icon: Cog,
    context: "vendor application: Operations & Process SME",
    buttonLabel: "Apply as Operations & Process SME",
  },
  {
    title: "Marketing SMEs",
    highlightedWords: ["Marketing"],
    summary:
      "Brand strategists, web & SEO specialists, content & campaign operators, marketing automation experts.",
    icon: Briefcase,
    context: "vendor application: Marketing SME",
    buttonLabel: "Apply as Marketing SME",
  },
  {
    title: "Family Office SMEs",
    highlightedWords: ["Family", "Office"],
    summary:
      "Family-office operators, principals' chiefs of staff, governance specialists, private-wealth advisors.",
    icon: Landmark,
    context: "vendor application: Family Office SME",
    buttonLabel: "Apply as Family Office SME",
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

export default function Vendors() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        bookingContext="vendors page family-office booking"
        contactContext="vendors page navigation contact"
      />

      <main className="pt-20">
        <section className="bg-[#F7F4EE] py-24 lg:py-32">
          <div className="container">
            <motion.div {...fadeUp} className="max-w-3xl">
              <SectionLabel>Vendor applications</SectionLabel>
              <h1 className="font-display text-[clamp(2.7rem,5vw,5.6rem)] leading-[0.92] tracking-[-0.06em]">
                Become a Digital Therapy vendor.
              </h1>
              <p className="mt-6 text-lg leading-8 text-black/80">
                We collaborate with specialists across technology, finance, operations, marketing, and family-office leadership to deliver custom solutions for our clients. Choose the discipline that best describes you and submit the right application.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vendorTypes.map((vendor, index) => {
                const Icon = vendor.icon;
                return (
                  <motion.article
                    key={vendor.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                    className="flex min-h-full flex-col rounded-[1.6rem] border border-black/8 bg-white p-7 shadow-[0_18px_50px_rgba(17,17,17,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0A65FF]/35 hover:shadow-[0_28px_70px_rgba(17,17,17,0.10)]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A65FF]/10 text-[#0A65FF]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 font-display text-3xl tracking-[-0.05em]">
                      {vendor.title.split(" ").map((word, wordIndex) => {
                        const isHighlighted = vendor.highlightedWords.includes(word);
                        return (
                          <span key={wordIndex} className={isHighlighted ? "text-[#0A65FF]" : undefined}>
                            {wordIndex > 0 ? " " : ""}
                            {word}
                          </span>
                        );
                      })}
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-black/80">{vendor.summary}</p>
                    <div className="mt-auto pt-7">
                      <VendorApplicationDialog
                        vendorTypeLabel={vendor.title.replace(/s$/, "")}
                        context={vendor.context}
                        triggerLabel={vendor.buttonLabel}
                        variant="secondary"
                        className="w-full justify-center bg-[#F7F4EE]"
                      />
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
