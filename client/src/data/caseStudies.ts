/**
 * Shared case-study data used by the homepage Save Time / Reduce Burn /
 * Make more money pills and by the Capabilities page case-study cards.
 *
 * Names of clients are anonymized in respect of their privacy.
 */
export type CaseStudy = {
  label: string;
  title: string;
  projectDescription: string;
  problemState: string;
  solutionState: string;
  impact: string;
};

export const caseStudies: CaseStudy[] = [
  {
    label: "Save Time",
    title: "Close Acceleration · Invoice Input Automation",
    projectDescription:
      "A close-acceleration program for a multi-entity family office's accounts-payable function — replacing manual invoice intake with an automated extract-to-post pipeline.",
    problemState:
      "The AP team was hand-keying every invoice into the GL — coding entities, validating against POs, chasing approvals, then posting. Two full-time staff spent the bulk of their week on rekey work, which stretched the monthly close & pushed real review work to nights and weekends. Every manual touch was another chance for a miscoded entity or a missed accrual.",
    solutionState:
      "Digital Therapy built an OCR + AI agent workflow that ingests invoices at the inbox, extracts header & line-item data, classifies by entity & GL account, validates against POs & vendor master, then routes for approval and posts to the GL. Exceptions surface to a single review queue instead of clogging the whole pipeline. The AP team now reviews & approves — they don't retype.",
    impact:
      "2,000 hours per year returned to the business — two FTEs freed from invoice rekey & redeployed to vendor management, cash forecasting & close review.",
  },
  {
    label: "Reduce Burn",
    title: "Payment Processing Transformation · Dual Pricing / Cash Discount",
    projectDescription:
      "A payment-processing transformation for a merchant operation paying high credit-card fees on every transaction.",
    problemState:
      "Processing fees were eating into margin on every swipe — a fixed cost of doing business that scaled with revenue instead of shrinking with it. The existing merchant-services arrangement bundled rates opaquely, with no mechanism to pass fees through to customers & no visibility into what was actually being charged line by line.",
    solutionState:
      "Digital Therapy mapped the existing merchant-services stack, redesigned the customer-facing pricing display for a Dual Pricing / Cash Discount model, & integrated the new processing flow into the POS & billing systems. We validated regulatory compliance state by state so the pass-through holds up everywhere the client operates.",
    impact:
      "$1.5M/year in processing costs removed from the P&L — fees compliantly shifted to the customer at the point of sale, with no disruption to checkout or collections.",
  },
  {
    label: "Make more money",
    title: "Payroll Transformation · Paychex → Paylocity + WOTC Capture",
    projectDescription:
      "A payroll platform migration & new-hire onboarding redesign for a family office's portfolio company — moving off Paychex onto Paylocity and wiring tax-credit capture into the hiring workflow.",
    problemState:
      "Payroll ran on Paychex with a clunky onboarding process that treated new hires as a compliance task — get them in the system & move on. No one was screening applicants against federal tax-credit criteria, so qualified hires walked through the door & the credits went uncaptured. Every missed hire was real money left on the table, quarter after quarter.",
    solutionState:
      "Digital Therapy migrated the portfolio company from Paychex to Paylocity & rebuilt the new-hire onboarding flow on the way in. We added targeted fields to the applicant evaluation forms, then stood up an automated workflow that flags eligible candidates & submits them for WOTC credits — no extra work for HR, no manual tracking.",
    impact:
      "$1,200 to $9,600 per qualified hire, captured automatically. WOTC (Work Opportunity Tax Credit) is a federal credit for hiring from targeted groups facing employment barriers — money the company was already eligible for & now actually collects.",
  },
];
