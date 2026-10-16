import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseVendorRows, renderOfferLetter, type OfferEngagement } from "../shared/offerTemplate";

const queries: { sql: string; params: unknown[] }[] = [];
const fakePool = {
  query: vi.fn(async (sql: string, params: unknown[] = []) => {
    queries.push({ sql, params });
    return { rows: [], rowCount: 1 };
  }),
};
const sendEmailMock = vi.fn(async () => ({ ok: true }));
const findVendorByEmailMock = vi.fn();

vi.mock("./vendors", () => ({ getPool: () => fakePool, findVendorByEmail: findVendorByEmailMock }));
vi.mock("./portal", () => ({ sendEmailViaRelay: sendEmailMock }));
vi.mock("./vendorPaymentInfo", () => ({
  getPaymentInfoSummary: vi.fn(),
  upsertPaymentInfo: vi.fn(),
  verifyVendorNameMatch: vi.fn(),
}));

const { sendOffers } = await import("./offers");

const engagement: OfferEngagement = {
  clientName: "DSquared Ventures, LLC",
  clientObjective: "Examine its financial & business activity over 46 months.",
  projectName: "Forensic Analysis + Reporting",
  kickoffDate: "October 8th, 2026",
  completionDate: "3 - 4 months",
  projectLead: "Aaron Graf",
  responseDeadline: "Friday, 10/16 at Noon",
  paymentTerms: "",
};

describe("renderOfferLetter", () => {
  it("opens with the required Vendor Program wording", () => {
    const body = renderOfferLetter(engagement, {
      vendorName: "Lou Kurpis, CPA",
      vendorEmail: "lou@example.com",
      role: "Forensic Accountant",
      pricingModel: "Fixed fee",
      requested: "$5,000 fixed",
      offered: "$4,500 fixed",
      offeredTotal: "$4,500",
    });
    expect(body[0]).toBe("Hi Lou,");
    expect(body[1]).toBe(
      "Thanks for being a part of Digital Therapy's Vendor Program. We're pleased to invite you to collaborate on our signed engagement with DSquared Ventures, LLC. DSquared Ventures, LLC seeks to examine its financial & business activity over 46 months.",
    );
    const comp = body.find((p) => p.startsWith("Compensation:"))!;
    expect(comp).toContain("Thank you for your estimate of $5,000 fixed");
    expect(comp).toContain("fixed project fee of $4,500 ($4,500 fixed)");
  });

  it("omits the adjustment sentence when the offer matches the request", () => {
    const body = renderOfferLetter(engagement, {
      vendorName: "Matthew Treem",
      vendorEmail: "m@example.com",
      role: "Analyst",
      pricingModel: "Hourly x est. hours",
      requested: "40 h × $90/h",
      offered: "40 h × $90/h",
      offeredTotal: "$3,600",
    });
    const comp = body.find((p) => p.startsWith("Compensation:"))!;
    expect(comp).not.toContain("estimate of");
    expect(comp).toContain("budget for this role is $3,600 (40 h × $90/h)");
  });
});

describe("parseVendorRows", () => {
  it("parses tab-separated rows copied from the doc table and skips the header", () => {
    const rows = parseVendorRows(
      "Vendor (name, email)\tRole on project\tPricing model\tRequested (USD)\tOffered (USD)\tOffered total (USD)\tOffer status\n" +
        "Lou Kurpis, CPA, lou@kurpis.com\tForensic Accountant\tFixed fee\t$5,000 fixed\t$4,500 fixed\t$4,500\tNot sent\n" +
        "\t\t\t\t\t\tNot sent\n",
    );
    expect(rows).toEqual([
      {
        vendorName: "Lou Kurpis, CPA",
        vendorEmail: "lou@kurpis.com",
        role: "Forensic Accountant",
        pricingModel: "Fixed fee",
        requested: "$5,000 fixed",
        offered: "$4,500 fixed",
        offeredTotal: "$4,500",
      },
    ]);
  });

  it("keeps a row with no email so the admin can see it is missing", () => {
    expect(parseVendorRows("Matthew Treem\tAnalyst")[0]).toMatchObject({ vendorName: "Matthew Treem", vendorEmail: "" });
  });
});

describe("sendOffers", () => {
  beforeEach(() => {
    queries.length = 0;
    sendEmailMock.mockClear();
    findVendorByEmailMock.mockReset();
  });

  it("emails matched vendors an accept link and skips unknown ones", async () => {
    findVendorByEmailMock.mockImplementation(async (email: string) =>
      email === "lou@kurpis.com" ? { vendor: { id: "v1", name: "Lou Kurpis, CPA" } } : null,
    );
    const base = { role: "", pricingModel: "Fixed fee", requested: "", offered: "$4,500", offeredTotal: "$4,500" };
    const result = await sendOffers(engagement, [
      { ...base, vendorName: "Lou Kurpis, CPA", vendorEmail: "lou@kurpis.com" },
      { ...base, vendorName: "Stranger", vendorEmail: "who@nowhere.com" },
      { ...base, vendorName: "No Email", vendorEmail: "" },
    ]);
    expect(result!.sent).toHaveLength(1);
    expect(result!.sent[0].link).toMatch(/^https:\/\/www\.digitaltherapy\.io\/offer\/[\w-]{32}$/);
    expect(result!.skipped.map((s) => s.vendorName)).toEqual(["Stranger", "No Email"]);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const mail = (sendEmailMock.mock.calls[0] as unknown as [{ to: string; html: string }])[0];
    expect(mail.to).toBe("lou@kurpis.com");
    expect(mail.html).toContain(">Click to accept offer</a>");
    expect(queries.some((q) => q.sql.includes("INSERT INTO dt_site.vendor_offer") && q.params[1] === "v1")).toBe(true);
  });
});
