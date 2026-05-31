/**
 * Digital Therapy Vendor Applications portal.
 * Presents vendor-type cards; each opens the contact form with a vendor-type
 * context so submissions are routed appropriately.
 */
import { Fragment, useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import { VendorApplicationDialog, type SkillGroup } from "@/components/VendorApplicationDialog";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Briefcase, Code2, Landmark } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

const marketingSkillGroups: SkillGroup[] = [
  { label: "CRM", items: ["Salesforce", "Hubspot", "Zoho", "MS Dynamics 365"] },
  { label: "CMS & No-code Web", items: ["Wordpress", "Squarespace", "Shopify", "Bubble"] },
  { label: "Wix Ecosystem", items: ["WiX Studio", "WiX Velo", "WiX Blocks", "WiX Bookings"] },
  { label: "Cold Email", items: ["Instantly", "Lemlist", "Maildoso", "Salesloft", "Gong", "Salesforge", "Smartlead", "Snovio"] },
  { label: "List Building", items: ["List Kit", "Apollo", "Clay", "Zoom Info"] },
  { label: "LinkedIn DM", items: ["Sales Navigator", "Linkedhelper"] },
  { label: "Workflow Automation", items: ["N8N", "Make", "Other"] },
  { label: "SEO / GEO", items: ["Semrush", "AHRef", "Screaming Frog", "SE Ranking", "The Hoth"] },
  { label: "Google", items: ["Google Ads", "Google Maps", "Google Local", "Google Analytics", "Google Tag Manager", "Google Campaign Manager 360"] },
  { label: "Email", items: ["Constant Contact", "Mailchimp", "Honeybook", "Hive"] },
  { label: "Newsletter", items: ["Beehiv"] },
  { label: "Community Monetization", items: ["Circle", "Kajabi"] },
];

const familyOfficeSkillGroups: SkillGroup[] = [
  {
    label: "Family Office Platforms",
    items: ["Addepar", "Mastro", "Canoe", "Asora", "Eton", "Aleta", "Asseta AI", "Copia"],
  },
];

const financeAccountingSkillGroups: SkillGroup[] = [
  { label: "Primary", items: ["Individual Tax Return", "Corporate Tax Return", "Tax Strategy", "Bookkeeping"] },
  { label: "Tax Prep", items: ["Walters Kluwyer", "CCH", "La Certe", "Drake", "Tax Act", "Ultra Tax"] },
  { label: "General Ledger", items: ["QBD", "QBO", "Xero", "Puzzle.io", "Freshbooks", "Zoho Books", "Acumatica"] },
  { label: "Practice Management", items: ["Karbon", "Netsuite", "Sage", "SAP", "Canopy", "Tax Dome", "Keeper", "Campfire", "Client Hub"] },
  { label: "Property Accounting", items: ["Yardi", "Real Pages", "Appfolio", "MRI", "MDS", "Rent Manager"] },
  { label: "Payroll", items: ["Paylocity", "ADP", "Paychex", "UKG", "Insperity", "Iris", "Gusto"] },
  { label: "AI + Automation", items: ["Soraban", "Tax GPT", "CoPilot", "N8N", "Make"] },
  { label: "AP/AR", items: ["Bill.com", "RAMP", "DEEL", "WISE"] },
  { label: "Real Estate Investor Management Portal", items: ["Juniper Square", "Agora", "Appfolio"] },
  { label: "Hosting", items: ["Verito", "Ace Hosting", "Rightworks"] },
  { label: "Sales Tax", items: ["Stripe", "Avalera", "Numeral"] },
];

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
    skillGroups: financeAccountingSkillGroups,
  },
  {
    title: "Marketing SMEs",
    highlightedWords: ["Marketing"],
    summary:
      "Brand strategists, web & SEO specialists, content & campaign operators, marketing automation experts.",
    icon: Briefcase,
    context: "vendor application: Marketing SME",
    buttonLabel: "Apply as Marketing SME",
    skillGroups: marketingSkillGroups,
  },
  {
    title: "Family Office SMEs",
    highlightedWords: ["Family", "Office"],
    summary:
      "Family-office operators, principals' chiefs of staff, governance specialists, private-wealth advisors.",
    icon: Landmark,
    context: "vendor application: Family Office SME",
    buttonLabel: "Apply as Family Office SME",
    skillGroups: familyOfficeSkillGroups,
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
  // Tracks which vendor card's application dialog is open. null = no dialog open.
  // Lets us make the entire card the click target while reusing one
  // VendorApplicationDialog per card driven by controlled state.
  const [openVendorIndex, setOpenVendorIndex] = useState<number | null>(null);

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
                  <Fragment key={vendor.title}>
                    {/*
                      Entire card is the click target. The inner "Apply as..." pill
                      stays for visual affordance, but it's a styled span (not a
                      nested button) so the HTML stays valid. The pill reacts to
                      parent hover via group-hover utilities.
                    */}
                    <motion.button
                      type="button"
                      onClick={() => setOpenVendorIndex(index)}
                      aria-label={`Open ${vendor.title} application form`}
                      {...fadeUp}
                      transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                      className="group flex min-h-full flex-col rounded-[1.6rem] border border-black/8 bg-white p-7 text-left shadow-[0_18px_50px_rgba(17,17,17,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0A65FF]/35 hover:shadow-[0_28px_70px_rgba(17,17,17,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/55 focus-visible:ring-offset-2"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A65FF]/10 text-[#0A65FF] transition-colors duration-300 group-hover:bg-[#0A65FF] group-hover:text-white">
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
                      <span className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-[#F7F4EE] px-6 py-3 text-base font-normal tracking-[-0.01em] text-[#111111] transition-all duration-300 group-hover:border-[#0A65FF] group-hover:bg-[#0A65FF] group-hover:text-white">
                        {vendor.buttonLabel}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </motion.button>
                    <VendorApplicationDialog
                      hideTrigger
                      open={openVendorIndex === index}
                      onOpenChange={(v) => setOpenVendorIndex(v ? index : null)}
                      vendorTypeLabel={vendor.title.replace(/s$/, "")}
                      context={vendor.context}
                      triggerLabel={vendor.buttonLabel}
                      skillGroups={vendor.skillGroups}
                    />
                  </Fragment>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
