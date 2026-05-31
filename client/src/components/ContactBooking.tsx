import { FormEvent, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Loader2, MessageSquareText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const APOLLO_BOOKING_URLS = {
  "30-min": "https://app.apollo.io/#/meet/digitaltherapy",
  "20-min": "https://app.apollo.io/#/meet/digitaltherapy",
} as const;

type BookingDuration = keyof typeof APOLLO_BOOKING_URLS;

const DURATION_LABELS: Record<BookingDuration, { minutes: string; title: string; aria: string }> = {
  "30-min": {
    minutes: "30",
    title: "Schedule a focused 30-minute briefing.",
    aria: "Book 30 minutes with Digital Therapy",
  },
  "20-min": {
    minutes: "20",
    title: "Schedule a focused 20-minute briefing.",
    aria: "Book 20 minutes with Digital Therapy",
  },
};

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
  phone: string;
  website: string;
  organization: string;
  role: string;
  message: string;
};

const initialContactForm: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  website: "",
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
  duration?: BookingDuration;
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

type BookingWidgetDialogProps = ActionButtonProps & {
  // Controlled-mode props mirror ContactFormDialog so callers (PublicHeader,
  // chat widget, page CTAs) can drive open state and supply their own trigger
  // button — useful when the visible button needs styling outside what variants
  // provide (e.g. peer/peer-hover coordination with a neighbor).
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  hideTrigger?: boolean;
};

export function BookingWidgetDialog({
  variant = "primary",
  className = "",
  label = "Book 30 Min",
  icon = "arrow",
  duration = "30-min",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: BookingWidgetDialogProps) {
  const bookingUrl = APOLLO_BOOKING_URLS[duration];
  const labels = DURATION_LABELS[duration];
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) controlledOnOpenChange?.(value);
    else setInternalOpen(value);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {hideTrigger ? null : (
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={labels.aria}
            className={`${buttonBaseClasses} ${variantClasses[variant]} ${className}`}
          >
            {label}
            <ActionIcon icon={icon} />
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[1100px] sm:rounded-[2rem]">
        <div className="grid gap-0 lg:grid-cols-[0.76fr_1.24fr]">
          <div className="border-b border-black/10 bg-white/72 p-8 lg:border-b-0 lg:border-r lg:p-9">
            <DialogHeader>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
              <DialogTitle className="font-display text-4xl leading-[0.94] tracking-[-0.06em] text-[#111111]">
                {labels.title}
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
          <div className="flex flex-col justify-center bg-white p-8 sm:p-10 lg:p-12">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#0A65FF]/8 text-[#0A65FF]">
                <CalendarDays className="h-10 w-10" />
              </div>
              <h3 className="mt-7 font-display text-3xl leading-[1.05] tracking-[-0.04em] text-[#111111]">
                Pick a time on the live calendar.
              </h3>
              <p className="mt-3 text-base leading-7 text-black/75">
                Your {labels.minutes}-minute booking opens in a new tab on Apollo, where you can see real-time availability and confirm instantly.
              </p>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[#0A65FF] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(10,101,255,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#004ed1]"
              >
                <CalendarDays className="h-4 w-4" />
                Open booking calendar
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <p className="mt-5 break-all text-xs leading-5 text-black/50">
                {bookingUrl}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type MessageToMemberDialogProps = ActionButtonProps & {
  memberName: string;
  memberRole?: string;
};

/**
 * Variant of ContactFormDialog used on the Team page for non-leader cards.
 * Pre-tags the submission with a recipient name so the intake inbox knows
 * who the message is addressed to and can notify them directly.
 */
export function MessageToMemberDialog({
  variant = "primary",
  className = "",
  label = "Send a message",
  context = "team page message to team member",
  icon = "message",
  memberName,
  memberRole,
}: MessageToMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ContactFormState>(initialContactForm);
  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setForm(initialContactForm);
      setOpen(false);
      toast.success(`Message received. ${memberName} will be notified that you reached out.`);
    },
    onError: (error) => {
      toast.error(error.message || "We could not send the message. Please try again.");
    },
  });

  const updateField = (field: keyof ContactFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitContact.mutate({
      ...form,
      context: `${context}: ${memberName}`,
      sourcePage: getSourcePage(),
      recipientName: memberName,
      recipientRole: memberRole ?? "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label={`Send a message to ${memberName}`} className={`${buttonBaseClasses} ${variantClasses[variant]} ${className}`}>
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
                Send {memberName.split(" ")[0]} a message.
              </DialogTitle>
              <DialogDescription className="pt-4 text-base leading-7 text-black/80">
                Your message routes to <span className="font-semibold text-[#0A65FF]">intake@digitaltherapy.io</span>, and {memberName.split(" ")[0]} will be notified that you reached out to them directly.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#0A65FF]/25 bg-[#0A65FF]/8 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#0A65FF]" aria-hidden="true" />
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#0A65FF]">
                To · {memberName}
              </span>
              {memberRole ? (
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-black/55">
                  · {memberRole}
                </span>
              ) : null}
            </div>
            <div className="mt-8 space-y-4 text-sm leading-6 text-black/82">
              {[
                "Pick the topic, scope, or question you want to put in front of them",
                "Mention your firm and any timing constraints",
                "Share enough context for a useful first reply",
              ].map((item) => (
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
                  Phone
                  <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} type="tel" autoComplete="tel" inputMode="tel" placeholder="+1 (555) 123-4567" className="h-11" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Website
                  <Input value={form.website} onChange={(event) => updateField("website", event.target.value)} type="url" autoComplete="url" inputMode="url" placeholder="firm.com" className="h-11" />
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
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                Message for {memberName}
              </legend>
              <Textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                required
                minLength={20}
                placeholder={`Briefly describe what you want to put in front of ${memberName.split(" ")[0]} — a question, a project, an introduction, anything specific to their expertise.`}
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs leading-5 text-black/55">
                Minimum 20 characters. For sensitive information, keep it high-level — they can arrange a private follow-up.
              </p>
            </fieldset>
            <button
              type="submit"
              disabled={submitContact.isPending}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0A65FF] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(10,101,255,0.22)] transition-all duration-300 hover:bg-[#004ed1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitContact.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Send message to {memberName.split(" ")[0]}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ContactFormDialogProps = ActionButtonProps & {
  // Controlled-mode props: when these are passed, the parent owns the
  // open/closed state and can drive it programmatically (e.g. from the
  // Sigmund chat widget's "Send a message" button).
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  // When true the default trigger button is not rendered (parent supplies
  // its own trigger or opens the dialog via controlled state).
  hideTrigger?: boolean;
};

export function ContactFormDialog({
  variant = "secondary",
  className = "",
  label = "Contact",
  context = "general inquiry",
  icon = "message",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: ContactFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) controlledOnOpenChange?.(value);
    else setInternalOpen(value);
  };
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
      {hideTrigger ? null : (
        <DialogTrigger asChild>
          <button type="button" className={`${buttonBaseClasses} ${variantClasses[variant]} ${className}`}>
            {label}
            <ActionIcon icon={icon} />
          </button>
        </DialogTrigger>
      )}
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
                  Phone
                  <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} type="tel" autoComplete="tel" inputMode="tel" placeholder="+1 (555) 123-4567" className="h-11" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Website
                  <Input value={form.website} onChange={(event) => updateField("website", event.target.value)} type="url" autoComplete="url" inputMode="url" placeholder="firm.com" className="h-11" />
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
