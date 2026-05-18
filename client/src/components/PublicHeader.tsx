import { ChevronLeft, Menu } from "lucide-react";
import { BookingWidgetDialog, ContactFormDialog } from "@/components/ContactBooking";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const logoUrl = "/manus-storage/DTLOGO_OFFICIAL_94b0fe5f.png";

const primaryNavItems = [
  { label: "Thesis", href: "/thesis" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Approach", href: "/approach" },
  { label: "DT Brain", href: "/dt-brain" },
  { label: "Security", href: "/#security", homeHref: "#security" },
  { label: "Team", href: "/team" },
  { label: "Partners", href: "/#partners", homeHref: "#partners" },
] as const;

type PublicHeaderProps = {
  activeLabel?: string;
  bookingContext: string;
  contactContext?: string;
  logoHref?: string;
  useHomeAnchorLinks?: boolean;
  showMainSiteLink?: boolean;
  headerClassName?: string;
};

function navClassName(label: string, activeLabel?: string) {
  return label === activeLabel
    ? "text-sm font-semibold text-[#0A65FF]"
    : "text-sm font-medium text-black/60 transition-colors duration-300 hover:text-black";
}

function getNavHref(item: (typeof primaryNavItems)[number], useHomeAnchorLinks?: boolean) {
  return useHomeAnchorLinks && "homeHref" in item ? item.homeHref : item.href;
}

function MainSiteLink({ mobile = false }: { mobile?: boolean }) {
  const className = mobile
    ? "inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-black/70"
    : "inline-flex items-center gap-2 text-sm font-semibold text-black/60 transition-colors duration-300 hover:text-[#0A65FF]";

  return (
    <a href="/" className={className}>
      <ChevronLeft className="h-4 w-4" />
      Main site
    </a>
  );
}

export default function PublicHeader({
  activeLabel,
  bookingContext,
  contactContext,
  logoHref = "/",
  useHomeAnchorLinks = false,
  showMainSiteLink = false,
  headerClassName = "bg-[#F7F4EE]/84",
}: PublicHeaderProps) {
  return (
    <header className={`fixed left-0 right-0 top-0 z-50 border-b border-black/8 ${headerClassName} backdrop-blur-xl`}>
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-start gap-4 px-4 sm:px-6 lg:justify-between lg:px-8">
        <a href={logoHref} className="flex shrink-0 items-center gap-3" aria-label="Digital Therapy home">
          <img src={logoUrl} alt="Digital Therapy" className="h-[60px] w-auto object-contain lg:h-[66px]" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {primaryNavItems.map((item) => (
            <a key={item.label} href={getNavHref(item, useHomeAnchorLinks)} className={navClassName(item.label, activeLabel)}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {showMainSiteLink ? <MainSiteLink /> : null}
          {contactContext ? (
            <ContactFormDialog
              variant="text"
              label="Contact"
              context={contactContext}
              icon="none"
              className="text-sm font-medium transition-colors duration-300 hover:text-black"
            />
          ) : null}
          <BookingWidgetDialog variant="primary" context={bookingContext} />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-black/12 bg-white/90 px-4 text-sm font-semibold text-black/70 shadow-[0_10px_30px_rgba(16,24,40,0.08)] transition-colors duration-300 hover:border-[#0A65FF]/45 hover:text-[#0A65FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/50 lg:hidden"
              aria-label="Open primary navigation menu"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(92vw,24rem)] border-black/10 bg-[#F7F4EE] px-6 py-8 text-[#111111]">
            <SheetHeader className="sr-only">
              <SheetTitle>Primary navigation</SheetTitle>
              <SheetDescription>Navigate Digital Therapy public pages and contact actions.</SheetDescription>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-8">
              <a href={logoHref} className="inline-flex items-center gap-3" aria-label="Digital Therapy home">
                <img src={logoUrl} alt="Digital Therapy" className="h-[60px] w-auto object-contain" />
              </a>
              <nav className="flex flex-col gap-1" aria-label="Primary mobile navigation">
                {primaryNavItems.map((item) => (
                  <SheetClose key={item.label} asChild>
                    <a
                      href={getNavHref(item, useHomeAnchorLinks)}
                      className={`rounded-2xl px-4 py-3 text-lg tracking-[-0.02em] ${
                        item.label === activeLabel
                          ? "bg-[#0A65FF]/10 font-semibold text-[#0A65FF]"
                          : "font-medium text-black/68 hover:bg-white/70 hover:text-black"
                      }`}
                    >
                      {item.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="flex flex-col gap-3 border-t border-black/10 pt-6">
                {showMainSiteLink ? (
                  <SheetClose asChild>
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-black/70"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Main site
                    </a>
                  </SheetClose>
                ) : null}
                {contactContext ? (
                  <ContactFormDialog
                    variant="secondary"
                    label="Contact"
                    context={contactContext}
                    icon="message"
                    className="w-full justify-center"
                  />
                ) : null}
                <BookingWidgetDialog variant="primary" context={bookingContext} className="w-full justify-center" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
