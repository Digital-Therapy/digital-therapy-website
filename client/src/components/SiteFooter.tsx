import { useLocation } from "wouter";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { ContactFormDialog } from "@/components/ContactBooking";

const logoUrl = "/dtlogo.webp";
const markUrl = "/dt-mark.webp";

const footerLinkClasses =
  "group flex w-full items-center justify-between gap-4 text-left text-sm font-medium text-black/78 transition-colors duration-300 hover:text-[#0A65FF]";

const footerDialogLinkClasses = `${footerLinkClasses} !justify-between after:h-3.5 after:w-3.5 after:content-['']`;

const sitemapGroups = [
  {
    title: "Sitemap",
    links: [
      { label: "Home", href: "/" },
      { label: "Process", href: "/process" },
      { label: "Capabilities", href: "/capabilities" },
      { label: "Thesis", href: "/thesis" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Partner Model", href: "/partners" },
      { label: "DT Brain", href: "/dt-brain" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Team", href: "/team" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

export default function SiteFooter() {
  // Hide the "Become a Digital Therapy vendor" CTA when the user is already on
  // the Vendors page — the CTA's purpose is to drive them there.
  const [pathname] = useLocation();
  const showVendorCta = pathname !== "/vendors";

  return (
    <footer aria-labelledby="footer-sitemap-heading" className="border-t border-black/10 bg-[#f8f8f7] text-[#111111]">
      {showVendorCta ? (
        <div className="container pt-10 lg:pt-12">
          <a
            href="/vendors"
            className="group flex flex-col items-center justify-between gap-4 rounded-[1.6rem] border border-[#0A65FF]/25 bg-[#0A65FF]/8 px-6 py-6 transition-all duration-300 hover:border-[#0A65FF]/50 hover:bg-[#0A65FF]/12 sm:flex-row sm:gap-6 sm:px-8 sm:py-7"
          >
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">For specialists</p>
              <p className="mt-2 whitespace-nowrap font-display text-[clamp(1.05rem,2.6vw,1.875rem)] leading-tight tracking-[-0.03em] text-[#111111]">
                Become a Digital Therapy vendor.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0A65FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(10,101,255,0.28)] transition-transform duration-300 group-hover:-translate-y-0.5 sm:px-7 sm:py-3.5 sm:text-base">
              Become a vendor
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      ) : null}
      <div className="container pb-14 pt-12 lg:pb-18">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1.35fr] lg:gap-16">
          <div className="flex flex-col">
            <a href="/" className="-mt-3 block leading-none" aria-label="Digital Therapy home">
              <img src={logoUrl} alt="Digital Therapy" className="h-40 w-auto object-contain" width={600} height={192}/>
            </a>
            <p className="mt-3 max-w-md text-base leading-7 text-black/80">
              Digital Therapy builds private data, workflow, reporting, and automation systems for modern family offices & operated businesses.
            </p>
            <div className="mt-7 flex flex-col gap-4 text-base font-semibold text-[#111111]">
              <a
                href="tel:+19174950455"
                className="group inline-flex items-center gap-3 transition-colors duration-300 hover:text-[#0A65FF]"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0A65FF] text-white transition-transform duration-300 group-hover:scale-105">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                917 - 495 - 0455
              </a>
              <a
                href="mailto:hello@digitaltherapy.io"
                className="group inline-flex items-center gap-3 transition-colors duration-300 hover:text-[#0A65FF]"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0A65FF] text-white transition-transform duration-300 group-hover:scale-105">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                hello@digitaltherapy.io
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {sitemapGroups.map((group) => (
              <nav key={group.title} aria-label={`${group.title} footer links`}>
                <h2
                  id={group.title === "Sitemap" ? "footer-sitemap-heading" : undefined}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A65FF]"
                >
                  {group.title}
                </h2>
                <div className="mt-5 space-y-3">
                  {group.links.map((link) => {
                    if (link.href === "#contact") {
                      return (
                        <ContactFormDialog
                          key={link.label}
                          variant="secondary"
                          label={link.label}
                          context="footer sitemap inquiry"
                          icon="message"
                          className="w-full justify-center bg-white/55"
                        />
                      );
                    }

                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        className={footerLinkClasses}
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </a>
                    );
                  })}
                </div>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 items-center gap-4 border-t border-black/10 pt-7 text-sm text-black/70 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3 sm:justify-self-start">
            <img src={markUrl} alt="" aria-hidden="true" className="h-6 w-6 object-contain" width={197} height={227}/>
            <span>© {new Date().getFullYear()} Digital Therapy, LLC. All Rights Reserved.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-black/65">
            <a href="/terms" className="transition-colors duration-200 hover:text-[#0A65FF]">
              Terms &amp; Conditions
            </a>
            <a href="/privacy" className="transition-colors duration-200 hover:text-[#0A65FF]">
              Privacy Policy
            </a>
            <a href="/accessibility" className="transition-colors duration-200 hover:text-[#0A65FF]">
              Accessibility
            </a>
          </div>
          <div aria-hidden="true" className="hidden sm:block" />
        </div>
      </div>
    </footer>
  );
}
