import { useState } from "react";
import { ArrowRight, ChevronLeft, Menu } from "lucide-react";
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

const logoUrl = "/dtlogo.png";

const primaryNavItems = [
  { label: "Thesis", href: "/thesis" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Process", href: "/process" },
  { label: "DT Brain", href: "/dt-brain" },
  { label: "Partners", href: "/partners" },
  { label: "Team", href: "/team" },
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
    ? "text-base font-normal text-[#0A65FF]"
    : "text-base font-normal text-black/80 transition-colors duration-300 hover:text-black";
}

function getNavHref(item: (typeof primaryNavItems)[number], useHomeAnchorLinks?: boolean) {
  return useHomeAnchorLinks && "homeHref" in item ? item.homeHref : item.href;
}

function MainSiteLink({ mobile = false }: { mobile?: boolean }) {
  const className = mobile
    ? "inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-black/85"
    : "inline-flex items-center gap-2 text-sm font-semibold text-black/80 transition-colors duration-300 hover:text-[#0A65FF]";

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
  // Both top-right CTAs drive their dialogs via controlled state so the visible
  // buttons can use peer/peer-hover Tailwind utilities to coordinate the
  // "blue pill slides from Book 30 Min to Contact" hover choreography.
  const [contactOpen, setContactOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 border-b border-black/8 ${headerClassName} backdrop-blur-xl`}>
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-start gap-4 px-4 sm:px-6 lg:justify-between lg:px-8">
        <a href={logoHref} className="-ml-3 flex shrink-0 items-center gap-3" aria-label="Digital Therapy home">
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
          {/*
            Coordinated hover choreography for the top-right CTA cluster:
            - Contact button is the `peer`. On hover, it gains the blue pill
              (bg + white text) — making the pill *appear* to slide onto it.
            - Book 30 Min sits after Contact in the DOM, so `peer-hover:` can
              react to Contact's hover state. When Contact is hovered, Book 30
              Min sheds its blue pill — bg becomes transparent, text turns
              black + bold, shadow is removed — so the visual "pill" looks
              like it slid off Book 30 Min and landed on Contact.
            Both buttons drive their dialogs via controlled state so the
            visible triggers are styleable without fighting variant classes.
          */}
          {contactContext ? (
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="peer group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-black/85 transition-all duration-300 hover:bg-[#0A65FF] hover:text-white hover:shadow-[0_14px_32px_rgba(10,101,255,0.28)]"
            >
              Contact
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            aria-label="Book 30 minutes with Digital Therapy"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0A65FF] px-6 py-3 text-base font-normal text-white shadow-[0_18px_45px_rgba(10,101,255,0.22)] transition-all duration-300 hover:bg-[#004ed1] peer-hover:bg-transparent peer-hover:font-bold peer-hover:text-black peer-hover:shadow-none"
          >
            Book 30 Min
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          {/* Hidden controlled dialogs driven by the buttons above */}
          {contactContext ? (
            <ContactFormDialog
              hideTrigger
              open={contactOpen}
              onOpenChange={setContactOpen}
              context={contactContext}
            />
          ) : null}
          <BookingWidgetDialog
            hideTrigger
            open={bookingOpen}
            onOpenChange={setBookingOpen}
            context={bookingContext}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-black/12 bg-white/90 px-4 text-sm font-semibold text-black/85 shadow-[0_10px_30px_rgba(16,24,40,0.08)] transition-colors duration-300 hover:border-[#0A65FF]/45 hover:text-[#0A65FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]/50 lg:hidden"
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
                          : "font-medium text-black/85 hover:bg-white/70 hover:text-black"
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
                      className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-black/85"
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
