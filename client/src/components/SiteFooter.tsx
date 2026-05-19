import { ArrowUpRight } from "lucide-react";
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";
const markUrl = "/manus-storage/DTLOGO_PICMARKpng_2cf51494.png";

const footerLinkClasses =
  "group flex w-full items-center justify-between gap-4 text-left text-sm font-medium text-black/58 transition-colors duration-300 hover:text-[#0A65FF]";

const footerDialogLinkClasses = `${footerLinkClasses} !justify-between after:h-3.5 after:w-3.5 after:content-['']`;

const sitemapGroups = [
  {
    title: "Sitemap",
    links: [
      { label: "Home", href: "/" },
      { label: "Process", href: "/approach" },
      { label: "Capabilities", href: "/capabilities" },
      { label: "Thesis", href: "/thesis" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Operating Layer", href: "/#operating-layer" },
      { label: "Security", href: "/#security" },
      { label: "Partner Model", href: "/#partners" },
      { label: "DT Brain", href: "/dt-brain" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Team", href: "/team" },
      { label: "Contact", href: "#contact" },
      { label: "Book 30 Min", href: "#book" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer aria-labelledby="footer-sitemap-heading" className="border-t border-black/10 bg-[#EFEAE1] text-[#111111]">
      <div className="container py-14 lg:py-18">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1.35fr] lg:gap-16">
          <div>
            <a href="/" className="inline-flex items-center" aria-label="Digital Therapy home">
              <img src={logoUrl} alt="Digital Therapy" className="h-40 w-auto object-contain" />
            </a>
            <p className="mt-6 max-w-md text-base leading-7 text-black/62">
              Digital Therapy builds private data, workflow, reporting, and automation systems for modern family offices and their advisors.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <BookingWidgetDialog label="Book 30 Min" icon="arrow" />
              <ContactFormDialog
                variant="secondary"
                label="Contact"
                context="footer sitemap inquiry"
                icon="message"
                className="bg-white/55"
              />
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
                          variant="text"
                          label={link.label}
                          context="footer sitemap contact link"
                          icon="none"
                          className={footerDialogLinkClasses}
                        />
                      );
                    }

                    if (link.href === "#book") {
                      return (
                        <BookingWidgetDialog
                          key={link.label}
                          variant="text"
                          label={link.label}
                          icon="none"
                          className={footerDialogLinkClasses}
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

        <div className="mt-12 flex flex-col gap-5 border-t border-black/10 pt-7 text-sm text-black/46 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={markUrl} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
            <span>© {new Date().getFullYear()} Digital Therapy. Private operating systems for family offices.</span>
          </div>
          <a href="/approach" className="inline-flex items-center gap-2 font-semibold text-black/56 transition-colors duration-300 hover:text-[#0A65FF]">
            Understand our process
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
