import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const createContactSubmissionMock = vi.fn();
const notifyOwnerMock = vi.fn();

vi.mock("./db", () => ({
  createContactSubmission: createContactSubmissionMock,
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: notifyOwnerMock,
}));

const { appRouter, formatContactNotification } = await import("./routers");

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("contact.submit", () => {
  beforeEach(() => {
    createContactSubmissionMock.mockReset();
    notifyOwnerMock.mockReset();
    createContactSubmissionMock.mockResolvedValue({ id: 42 });
    notifyOwnerMock.mockResolvedValue(true);
  });

  it("stores a public contact submission and notifies the owner", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.contact.submit({
      name: "Jane Advisor",
      email: "jane@examplefamilyoffice.com",
      organization: "Example Family Office",
      role: "Advisor",
      message: "We want to understand where reporting workflow automation can deliver value first.",
      context: "homepage contact inquiry",
      sourcePage: "/#partners",
    });

    expect(result).toEqual({ success: true, id: 42, notificationDelivered: true });
    expect(createContactSubmissionMock).toHaveBeenCalledWith({
      name: "Jane Advisor",
      email: "jane@examplefamilyoffice.com",
      organization: "Example Family Office",
      role: "Advisor",
      message: "We want to understand where reporting workflow automation can deliver value first.",
      context: "homepage contact inquiry",
      sourcePage: "/#partners",
    });
    expect(notifyOwnerMock).toHaveBeenCalledWith({
      title: "New Digital Therapy contact form: Jane Advisor",
      content: expect.stringContaining("Source page: /#partners"),
    });
  });

  it("normalizes omitted optional fields before saving", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await caller.contact.submit({
      name: "John Principal",
      email: "john@example.com",
      message: "We need help prioritizing the first high-value operating workflow to improve.",
    });

    expect(createContactSubmissionMock).toHaveBeenCalledWith({
      name: "John Principal",
      email: "john@example.com",
      organization: null,
      role: null,
      message: "We need help prioritizing the first high-value operating workflow to improve.",
      context: "general inquiry",
      sourcePage: "unknown",
    });
  });

  it("formats notifications with contact details and message context", () => {
    const notification = formatContactNotification({
      name: "Alex COO",
      email: "alex@example.com",
      organization: "Discerning Office",
      role: "COO",
      message: "Please help us map data, reporting, and workflow priorities.",
      context: "team page family-office booking",
      sourcePage: "/team",
    });

    expect(notification).toContain("Name: Alex COO");
    expect(notification).toContain("Organization: Discerning Office");
    expect(notification).toContain("Context: team page family-office booking");
    expect(notification).toContain("Please help us map data, reporting, and workflow priorities.");
  });
});
