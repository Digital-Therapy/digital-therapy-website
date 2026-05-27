/**
 * ChatWidget — fixed-position DT Bot in the bottom-right corner.
 *
 * Phase 1 (this file):
 *   - Floating button + slide-up panel
 *   - Heuristic keyword routing to existing site pages
 *   - Falls back to a booking link + contact-form submission so leads
 *     are captured in the existing contactSubmissions table
 *
 * Phase 2 (TODO when backend env vars are configured):
 *   - Real Claude / OpenAI completions for natural-language understanding
 *     (currently routes via keyword matching)
 *   - WhatsApp forwarding via WhatsApp Business API / Twilio so the
 *     team can take over conversations
 */
import { FormEvent, useEffect, useRef, useState } from "react";
import { CalendarDays, Send, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const APOLLO_BOOKING_URL = "https://app.apollo.io/#/meet/digitaltherapy";

type BotRoute = {
  keywords: string[];
  reply: string;
  url?: string;
  ctaLabel?: string;
};

// Heuristic routing — every keyword listed here is matched case-insensitively
// against the visitor's message. First matching route wins.
const routes: BotRoute[] = [
  {
    keywords: ["capabilit", "what do you do", "services", "what can", "offerings", "solutions"],
    reply: "We build software, process flows, and automations that multiply the capacity of your workforce. Here's a tour of our Capabilities:",
    url: "/capabilities",
    ctaLabel: "View Capabilities",
  },
  {
    keywords: ["process", "approach", "how it works", "engagement", "deliver", "phase 1", "discovery"],
    reply: "Our process starts with a focused Discovery phase, with Fusion Teams on-site for the first month. Full breakdown here:",
    url: "/process",
    ctaLabel: "See our Process",
  },
  {
    keywords: ["dt brain", "brain", "on-prem", "on prem", "private ai", "local ai", "automation hub"],
    reply: "DT Brain is our on-prem automation hub — your data, your hardware, your rules. Take a look:",
    url: "/dt-brain",
    ctaLabel: "Explore DT Brain",
  },
  {
    keywords: ["team", "who works", "people", "founder", "kobrin", "milton", "hunter", "leaders", "leadership"],
    reply: "Here's our team — leadership, specialist benches, and the alliances we work with:",
    url: "/team",
    ctaLabel: "Meet the Team",
  },
  {
    keywords: ["thesis", "philosophy", "why", "fusion team", "silo", "structural"],
    reply: "Our Thesis lays out why family-office transformation needs one trained team rather than competing practice groups:",
    url: "/thesis",
    ctaLabel: "Read the Thesis",
  },
  {
    keywords: ["partner", "private bank", "advisor", "advisory firm", "multifamily", "white label", "white-label"],
    reply: "Yes — we run a confidential partner model for private banks and advisory firms. More on that here:",
    url: "/partners",
    ctaLabel: "Partner with DT",
  },
  {
    keywords: ["vendor", "apply", "join", "consult", "work with you", "work for you", "sme", "expert", "hire me", "freelance"],
    reply: "We're always looking for specialist vendors. Pick your discipline and apply:",
    url: "/vendors",
    ctaLabel: "Vendor Applications",
  },
  {
    keywords: ["security", "privacy", "compliance", "private", "controlled", "on-premises", "sensitive"],
    reply: "Privacy and security are foundational. Here's how we keep data inside the office:",
    url: "/#security",
    ctaLabel: "Security & Privacy",
  },
  {
    keywords: ["book", "schedule", "meeting", "call", "intro", "30 min", "briefing", "demo"],
    reply: "Of course — pick a time directly with our team:",
    url: APOLLO_BOOKING_URL,
    ctaLabel: "Book 30 minutes",
  },
];

type Message = {
  role: "bot" | "user";
  content: string;
  cta?: { url: string; label: string };
};

const greeting: Message = {
  role: "bot",
  content:
    "Hi — I'm Sigmund, Digital Therapy's bot. Ask me about our Capabilities, Process, DT Brain, Team, or Vendor applications. If I can't help, I'll connect you with one of our team members directly.",
};

function matchRoute(text: string): BotRoute | null {
  const lower = text.toLowerCase();
  for (const route of routes) {
    if (route.keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      return route;
    }
  }
  return null;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Periodic speech bubble next to Sigmund — first nudge ~6s after mount,
  // then every 45s. Each appearance stays for ~8s. Suppressed while chat is open.
  useEffect(() => {
    if (open) {
      setBubbleVisible(false);
      return;
    }
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      setBubbleVisible(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setBubbleVisible(false), 8000);
    };
    const initialTimer = setTimeout(show, 6000);
    const interval = setInterval(show, 45000);
    return () => {
      clearTimeout(initialTimer);
      if (hideTimer) clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, [open]);

  const submitContact = trpc.contact.submit.useMutation({
    onError: (error) => {
      toast.error(error.message || "We couldn't forward that message. Please try again.");
    },
  });

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");

    const route = matchRoute(text);

    // Bot reply — synthesize a reply via heuristic routing for now.
    setTimeout(() => {
      if (route) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: route.reply,
            cta: route.url && route.ctaLabel ? { url: route.url, label: route.ctaLabel } : undefined,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "I don't have an instant answer for that — let's set up a quick call with one of our team members to dig in. I've also passed your message along.",
            cta: { url: APOLLO_BOOKING_URL, label: "Book 30 minutes" },
          },
        ]);
      }
    }, 280);

    // Always log the inbound message to the contact submissions table so it
    // reaches the team. The route match (if any) is included in the context.
    submitContact.mutate({
      name: "Chat visitor",
      email: "chat@digitaltherapy.io",
      organization: "",
      role: "",
      message: text,
      context: route ? `chat widget (matched: ${route.ctaLabel ?? "route"})` : "chat widget (no route match)",
      sourcePage: typeof window === "undefined" ? "/" : window.location.pathname + window.location.search,
    });
  };

  return (
    <>
      {/* Periodic speech bubble (next to Sigmund) */}
      <button
        type="button"
        onClick={() => {
          setBubbleVisible(false);
          setOpen(true);
        }}
        aria-hidden={!bubbleVisible || open}
        tabIndex={bubbleVisible && !open ? 0 : -1}
        className={`fixed bottom-12 right-[124px] z-[59] max-w-[280px] cursor-pointer rounded-[1.2rem] border border-[#0A65FF]/20 bg-white px-4 py-3 text-left text-sm leading-6 text-black/85 shadow-[0_18px_45px_rgba(10,101,255,0.20)] transition-all duration-300 sm:right-[136px] ${
          bubbleVisible && !open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-3 opacity-0"
        }`}
      >
        Hello there! Perhaps I could help you find information or schedule a meeting. Just click me when you&rsquo;re ready.
        <span
          aria-hidden="true"
          className="absolute right-[-9px] top-1/2 h-0 w-0 -translate-y-1/2 border-y-[10px] border-l-[10px] border-y-transparent border-l-white"
        />
      </button>

      {/* Floating bot button */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat with Sigmund"
          className="group fixed bottom-6 right-6 z-[60] inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_18px_45px_rgba(10,101,255,0.45)] ring-[3px] ring-[#0A65FF] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(10,101,255,0.55)] focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[#58B8FF] focus-visible:ring-offset-2"
        >
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#0A65FF]/30 [animation-duration:2.5s]" />
          <img
            src="/sigmund-bot.png"
            alt="Sigmund, the Digital Therapy bot"
            className="relative h-full w-full object-cover"
          />
          <span className="pointer-events-none absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#0A65FF] shadow">
            1
          </span>
        </button>
      ) : null}

      {/* Slide-up chat panel */}
      {open ? (
        <div
          role="dialog"
          aria-label="DT chat"
          className="fixed bottom-6 right-6 z-[60] flex h-[min(560px,calc(100vh-3rem))] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-[0_30px_90px_rgba(17,17,17,0.22)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-[#0A65FF] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white/40">
                <img src="/sigmund-bot.png" alt="" className="h-full w-full object-cover" />
              </span>
              <div>
                <p className="text-sm font-bold">Sigmund · DT Bot</p>
                <p className="text-xs text-white/75">Usually responds within minutes</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors duration-200 hover:bg-white/15 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7F4EE]/60 px-4 py-4 text-sm">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[80%] rounded-[1.1rem] rounded-br-md bg-[#0A65FF] px-4 py-2.5 text-white shadow-[0_8px_20px_rgba(10,101,255,0.20)]"
                      : "max-w-[85%] rounded-[1.1rem] rounded-bl-md border border-black/10 bg-white px-4 py-3 text-black/85 shadow-[0_6px_18px_rgba(17,17,17,0.05)]"
                  }
                >
                  <p className="leading-6">{message.content}</p>
                  {message.cta ? (
                    <a
                      href={message.cta.url}
                      target={message.cta.url.startsWith("http") ? "_blank" : undefined}
                      rel={message.cta.url.startsWith("http") ? "noreferrer" : undefined}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0A65FF] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(10,101,255,0.25)] transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      {message.cta.url === APOLLO_BOOKING_URL ? (
                        <CalendarDays className="h-3.5 w-3.5" />
                      ) : null}
                      {message.cta.label}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-black/10 bg-white px-3 py-3">
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your question…"
              aria-label="Type your question"
              className="flex-1 rounded-full border border-black/10 bg-[#F7F4EE]/70 px-4 py-2.5 text-sm text-black placeholder:text-black/45 focus:border-[#0A65FF]/45 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A65FF] text-white shadow-[0_8px_22px_rgba(10,101,255,0.25)] transition-all duration-200 hover:bg-[#004ed1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
