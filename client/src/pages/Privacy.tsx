/**
 * Digital Therapy Privacy Policy page.
 */
import PublicHeader from "@/components/PublicHeader";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: "easeOut" },
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
      <span className="h-px w-8 bg-[#0A65FF]" />
      {children}
    </div>
  );
}

function PolicyHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-[#111111]">
      {children}
    </h2>
  );
}

const paragraphClass = "mt-4 text-base leading-7 text-black/85";
const bulletListClass = "mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-black/85 marker:text-[#0A65FF]";

export default function Privacy() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        bookingContext="privacy page family-office booking"
        contactContext="privacy page navigation contact"
      />

      <main className="pt-20">
        <section className="bg-[#F7F4EE] py-20 lg:py-28">
          <div className="container max-w-4xl">
            <motion.div {...fadeUp}>
              <SectionLabel>Legal</SectionLabel>
              <h1 className="font-display text-[clamp(2.7rem,5vw,5.4rem)] leading-[0.92] tracking-[-0.06em]">
                Privacy Policy
              </h1>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-black/55">
                Effective Date: July 25, 2024
              </p>
            </motion.div>

            <article className="mt-10 border-t border-black/10 pt-2">
              <PolicyHeading>Introduction</PolicyHeading>
              <p className={paragraphClass}>
                At Digital Therapy, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website, DigitalTherapy.io. By using our site, you agree to the practices described in this policy.
              </p>

              <PolicyHeading>Information We Collect</PolicyHeading>
              <p className={paragraphClass}>We may collect personal and non-personal information, including but not limited to:</p>
              <ul className={bulletListClass}>
                <li>
                  <span className="font-semibold">Personal Information:</span> Name, email address, phone number, and other details you provide via forms or other direct interactions.
                </li>
                <li>
                  <span className="font-semibold">Non-Personal Information:</span> Browser type, IP address, &amp; website usage data collected via cookies or analytics tools.
                </li>
              </ul>

              <PolicyHeading>How We Use Your Information</PolicyHeading>
              <p className={paragraphClass}>We use the information we collect to:</p>
              <ul className={bulletListClass}>
                <li>Respond to inquiries and provide services.</li>
                <li>Improve our website, products, and services.</li>
                <li>Send occasional updates or marketing materials (with your consent).</li>
                <li>Analyze website performance and usage trends.</li>
              </ul>

              <PolicyHeading>Sharing Your Information</PolicyHeading>
              <p className={paragraphClass}>
                We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist in operating our website and delivering services, provided they agree to keep this information confidential.
              </p>

              <PolicyHeading>Cookies and Tracking</PolicyHeading>
              <p className={paragraphClass}>
                Our website may use cookies and similar technologies to enhance user experience and gather data about site performance. You can adjust your browser settings to refuse cookies, though this may affect site functionality.
              </p>
              <p className={paragraphClass}>
                When you visit or log in to our website, cookies and similar technologies may be used by our online data partners or vendors to associate these activities with other personal information they or others have about you, including by association with your email. We (or service providers on our behalf) may then send communications and marketing to these email. You may opt out of receiving this advertising by visiting{" "}
                <a
                  className="font-semibold text-[#0A65FF] underline"
                  href="https://app.retention.com/optout"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://app.retention.com/optout
                </a>
                .
              </p>

              <PolicyHeading>Data Security</PolicyHeading>
              <p className={paragraphClass}>
                We implement appropriate technical and organizational measures to protect your data from unauthorized access, disclosure, alteration, or destruction.
              </p>

              <PolicyHeading>Third-Party Links</PolicyHeading>
              <p className={paragraphClass}>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites.
              </p>

              <PolicyHeading>Your Rights</PolicyHeading>
              <p className={paragraphClass}>You have the right to:</p>
              <ul className={bulletListClass}>
                <li>Access the personal information we hold about you.</li>
                <li>Request corrections to any inaccurate or incomplete information.</li>
                <li>Request deletion of your data, subject to legal or contractual obligations.</li>
              </ul>

              <PolicyHeading>Changes to This Privacy Policy</PolicyHeading>
              <p className={paragraphClass}>
                We may update this Privacy Policy from time to time. Changes will be reflected on this page with a revised &ldquo;Effective Date.&rdquo;
              </p>

              <PolicyHeading>Contact Us</PolicyHeading>
              <p className={paragraphClass}>
                If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us at:
              </p>
              <ul className={bulletListClass}>
                <li>
                  <span className="font-semibold">Email:</span>{" "}
                  <a className="font-semibold text-[#0A65FF] underline" href="mailto:Hello@digitaltherapy.io">
                    Hello@digitaltherapy.io
                  </a>
                </li>
                <li>
                  <span className="font-semibold">Phone:</span>{" "}
                  <a className="font-semibold text-[#0A65FF] underline" href="tel:+19174950455">
                    917. 495. 0455
                  </a>
                </li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
