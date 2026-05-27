/**
 * Digital Therapy Accessibility Statement page.
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

export default function Accessibility() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EE] text-[#111111] selection:bg-[#0A65FF] selection:text-white">
      <PublicHeader
        bookingContext="accessibility page family-office booking"
        contactContext="accessibility page navigation contact"
      />

      <main className="pt-20">
        <section className="bg-[#F7F4EE] py-20 lg:py-28">
          <div className="container max-w-4xl">
            <motion.div {...fadeUp}>
              <SectionLabel>Legal</SectionLabel>
              <h1 className="font-display text-[clamp(2.7rem,5vw,5.4rem)] leading-[0.92] tracking-[-0.06em]">
                Accessibility Statement
              </h1>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-black/55">
                Digital Therapy, LLC
              </p>
            </motion.div>

            <article className="mt-10 border-t border-black/10 pt-2">
              <p className="mt-10 text-base leading-7 text-black/85">
                At Digital Therapy, we are committed to ensuring digital accessibility for all users, including those with disabilities. We strive to improve the user experience for everyone by adhering to accessibility best practices and standards.
              </p>

              <PolicyHeading>Measures to Support Accessibility</PolicyHeading>
              <ul className={bulletListClass}>
                <li>We continuously work to make our website content more accessible and user-friendly.</li>
                <li>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level, as these are widely recognized and accepted standards for web accessibility.</li>
              </ul>

              <PolicyHeading>Accessibility Features</PolicyHeading>
              <p className={paragraphClass}>Our website includes features to improve accessibility, such as:</p>
              <ul className={bulletListClass}>
                <li>Text alternatives for non-text content.</li>
                <li>Logical and consistent navigation.</li>
                <li>Keyboard-accessible functionality.</li>
              </ul>

              <PolicyHeading>Ongoing Efforts</PolicyHeading>
              <p className={paragraphClass}>
                We are committed to ongoing testing and enhancements to ensure our website remains accessible to all users. As part of this commitment, we regularly review our website and update content to meet evolving accessibility standards.
              </p>

              <PolicyHeading>Feedback</PolicyHeading>
              <p className={paragraphClass}>
                We welcome your feedback on the accessibility of our website. If you encounter barriers or have suggestions for improvement, please contact us:
              </p>
              <ul className={bulletListClass}>
                <li>
                  <span className="font-semibold">Email:</span>{" "}
                  <a className="font-semibold text-[#0A65FF] underline" href="mailto:hello@digitaltherapy.io">
                    hello@digitaltherapy.io
                  </a>
                </li>
                <li>
                  <span className="font-semibold">Phone:</span>{" "}
                  <a className="font-semibold text-[#0A65FF] underline" href="tel:+19174950455">
                    917. 495. 0455
                  </a>
                </li>
              </ul>
              <p className={paragraphClass}>
                We take your feedback seriously and will make every effort to address any accessibility concerns.
              </p>

              <PolicyHeading>Third-Party Content</PolicyHeading>
              <p className={paragraphClass}>
                While we strive to ensure that all content on our website meets accessibility standards, we cannot guarantee the accessibility of third-party content or websites linked from our site.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
