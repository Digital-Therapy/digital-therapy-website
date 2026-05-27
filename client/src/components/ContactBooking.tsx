import { FormEvent, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Loader2, MessageSquareText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const APOLLO_BOOKING_URL = "https://app.apollo.io/#/meet/jonathan_kobrin_67f/30-min";

const buttonBaseClasses =
  "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-normal tracking-[-0.01em] transition-all duration-300";

const variantClasses = {
  primary: "bg-[#0A65FF] text-white shadow-[0_18px_45px_rgba(10,101,255,0.22)] hover:bg-[#004ed1]",
  secondary: "border border-black/15 bg-white/60 text-[#111111] hover:border-[#0A65FF]/60 hover:text-[#0A65FF]",
  text: "px-0 py-0 text-black/80 hover:text-[#0A65FF]",
} as const;

type ButtonVariant = keyof typeof variantClasses;

type ContactFormState = {
  name: string;
  email: string;
  organization: string;
  role: string;
  message: string;
};

const initialContactForm: ContactFormState = {
  name: "",
  email: "",
  organization: "",
  role: "",
  message: "",
};

type ActionButtonProps = {
  variant?: ButtonVariant;
  className?: string;
  label?: string;
  context?: string;
  icon?: "arrow" | "calendar" | "message" | "none";
};

function ActionIcon({ icon }: { icon: NonNullable<ActionButtonProps["icon"]> }) {
  if (icon === "none") return null;
  const Icon = icon === "calendar" ? CalendarDays : icon === "message" ? MessageSquareText : ArrowRight;
  return <Icon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />;
}

function getSourcePage() {
  if (typeof window === "undefined") return "server-render";
  return `${window.location.pathname}${window.location.hash}`;
}

export function BookingWidgetDialog({
  variant = "primary",
  className = "",
  label = "Book 30 Min",
  icon = "arrow",
}: ActionButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Book 30 minutes with Digital Therapy"
          className={`${buttonBaseClasses} ${variantClasses[variant]} ${className}`}
        >
          {label}
          <ActionIcon icon={icon} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[1100px] sm:rounded-[2rem]">
        <div className="grid gap-0 lg:grid-cols-[0.76fr_1.24fr]">
          <div className="border-b border-black/10 bg-white/72 p-8 lg:border-b-0 lg:border-r lg:p-9">
            <DialogHeader>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
              <DialogTitle className="font-display text-4xl leading-[0.94] tracking-[-0.06em] text-[#111111]">
                Schedule a focused 30-minute briefing.
              </DialogTitle>
              <DialogDescription className="pt-4 text-base leading-7 text-black/80">
                Choose a time with Jonathan Kobrin to discuss your family-office pain points, identify the first high-value win, and see how Digital Therapy approaches custom solution delivery.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-8 space-y-4 text-sm leading-6 text-black/82">
              {["Pain-point discovery", "First-value prioritization", "Tour of relevant deployed solutions"].map((item) => (
                <div key={item} className="flex gap-3 border-t border-black/10 pt-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0A65FF]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5 lg:p-6">
            <div className="mb-3 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em] text-black/42">
              <span>Apollo booking widget</span>
              <a href={APOLLO_BOOKING_URL} target="_blank" rel="noreferrer" className="text-[#0A65FF] hover:text-[#004ed1]">
                Open full page
              </a>
            </div>
            <div className="overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#F7F4EE]">
              <iframe
                title="Digital Therapy 30 minute booking calendar"
                src={APOLLO_BOOKING_URL}
                className="h-[680px] w-full bg-white"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allow="clipboard-write; fullscreen; payment"
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-black/72">
              If the embedded scheduler is blocked by browser privacy settings, use “Open full page” above. It opens Apollo directly rather than launching email.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ContactFormDialog({
  variant = "secondary",
  className = "",
  label = "Contact",
  context = "general inquiry",
  icon = "message",
}: ActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ContactFormState>(initialContactForm);
  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setForm(initialContactForm);
      setOpen(false);
      toast.success("Your message was received. Digital Therapy will follow up directly.");
    },
    onError: (error) => {
      toast.error(error.message || "We could not submit the form. Please try again.");
    },
  });

  const updateField = (field: keyof ContactFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitContact.mutate({
      ...form,
      context,
      sourcePage: getSourcePage(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={`${buttonBaseClasses} ${variantClasses[variant]} ${className}`}>
          {label}
          <ActionIcon icon={icon} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[1100px] sm:rounded-[2rem]">
        <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="border-b border-black/10 bg-white/72 p-9 lg:border-b-0 lg:border-r lg:p-11">
            <DialogHeader>
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <DialogTitle className="font-display text-4xl leading-[0.94] tracking-[-0.06em] text-[#111111]">
                Tell us where it hurts.
              </DialogTitle>
              <DialogDescription className="pt-4 text-base leading-7 text-black/80">
                Share a few details and Digital Therapy will route the conversation around your operating pain points, urgency, and best first-value opportunity.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-8 space-y-4 text-sm leading-6 text-black/82">
              {["Operating pain points & priorities", "Best first-value opportunity", "Privacy & deployment requirements"].map((item) => (
                <div key={item} className="flex gap-3 border-t border-black/10 pt-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0A65FF]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.35rem] border border-[#0A65FF]/15 bg-[#0A65FF]/8 p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0A65FF]" />
                <p className="text-sm leading-6 text-black/80">
                  This form submits inside the site. It does not open your email client.
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-9 lg:p-11">
            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">About you</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Name
                  <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required minLength={2} placeholder="Your name" className="h-11" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Work email
                  <Input value={form.email} onChange={(event) => updateField("email", event.target.value)} required type="email" placeholder="name@firm.com" className="h-11" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Organization
                  <Input value={form.organization} onChange={(event) => updateField("organization", event.target.value)} placeholder="Family office or firm" className="h-11" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Role
                  <Input value={form.role} onChange={(event) => updateField("role", event.target.value)} placeholder="Leader, advisor, COO..." className="h-11" />
                </label>
              </div>
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">What should we understand first?</legend>
              <Textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                required
                minLength={20}
                placeholder="Briefly describe the pain points, workflows, reporting needs, or first-value opportunity you want to discuss."
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs leading-5 text-black/55">
                Minimum 20 characters. For sensitive information, keep the message high-level — we can arrange a private follow-up.
              </p>
            </fieldset>
            <button
              type="submit"
              disabled={submitContact.isPending}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0A65FF] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(10,101,255,0.22)] transition-all duration-300 hover:bg-[#004ed1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitContact.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Submit contact form
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
