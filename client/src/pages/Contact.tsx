/**
 * /contact — a dedicated, shareable URL that lands the visitor on a small hero
 * page and auto-opens the contact-form popup. If they close the popup, the
 * page stays put with a big "Send us a message" button to reopen — so the URL
 * remains a stable landing page rather than kicking the user away on dismiss.
 */
import { ContactFormDialog } from "@/components/ContactBooking";
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

export default function Contact() {
  // Auto-open on mount — this URL is meant to drop the visitor straight into
  // the form. They can dismiss and reopen without leaving the page.
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-[#111111]">
      <PublicHeader activeLabel="Contact" bookingContext="contact page booking" />

      <main className="container pt-16 pb-24 lg:pt-24 lg:pb-28">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.24em] text-[#0A65FF]">
            Contact
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,5.6vw,4.25rem)] leading-[1.04] tracking-[-0.045em]">
            Get in touch.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/70">
            Send us a message and we&rsquo;ll be in touch shortly. Quiet questions, full briefs, and everything in
            between are welcome.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4">
          <ContactFormDialog
            open={open}
            onOpenChange={setOpen}
            context="contact page landing"
            label="Send us a message"
            icon="message"
            variant="primary"
            className="h-12 w-full text-base"
          />
          <p className="text-sm text-black/55">or reach us directly</p>
          <div className="flex flex-col items-center gap-2 text-sm">
            <a
              href="mailto:hello@digitaltherapy.io"
              className="group inline-flex items-center gap-2 font-medium text-[#111111] transition-colors hover:text-[#0A65FF]"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                <Mail className="h-3 w-3" />
              </span>
              hello@digitaltherapy.io
            </a>
            <a
              href="tel:+19174950455"
              className="group inline-flex items-center gap-2 font-medium text-[#111111] transition-colors hover:text-[#0A65FF]"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                <Phone className="h-3 w-3" />
              </span>
              917 &ndash; 495 &ndash; 0455
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
