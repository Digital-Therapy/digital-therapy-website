import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const contactSubmissions = mysqlTable("contactSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 240 }),
  role: varchar("role", { length: 160 }),
  message: text("message").notNull(),
  context: varchar("context", { length: 240 }),
  sourcePage: varchar("sourcePage", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

/**
 * Vendor (SME resource) profiles — the system of record for the talent
 * inventory the admin searches when assembling project teams. One row per
 * vendor application; searchable tags live in the normalized child tables
 * below (vendorSkills / vendorSectors / vendorCertifications) so the admin
 * can AND-match across many criteria with indexed joins.
 *
 * `varchar` lengths mirror the zod maxes in server/routers.ts
 * (vendorApplicationInput) so the DB never truncates a valid submission.
 */
export const vendorStatusValues = [
  "applied",
  "screening",
  "approved",
  "onboarded",
  "archived",
] as const;

export const vendors = mysqlTable(
  "vendors",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorTypeLabel: varchar("vendorTypeLabel", { length: 160 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    role: varchar("role", { length: 160 }),
    companyName: varchar("companyName", { length: 240 }),
    websiteUrl: varchar("websiteUrl", { length: 500 }),
    personalLinkedin: varchar("personalLinkedin", { length: 500 }),
    companySocial: varchar("companySocial", { length: 500 }),
    personalBio: text("personalBio"),
    companyCv: text("companyCv"),
    /** Raw, as-submitted strings preserved for display ("$150/hr", "negotiable"). */
    hourlyRate: varchar("hourlyRate", { length: 120 }),
    hoursPerMonth: varchar("hoursPerMonth", { length: 120 }),
    /** Best-effort parsed numerics (first integer) powering range filters; null when unparseable. */
    hourlyRateNumeric: int("hourlyRateNumeric"),
    hoursPerMonthNumeric: int("hoursPerMonthNumeric"),
    availabilityNotes: text("availabilityNotes"),
    additionalSkills: text("additionalSkills"),
    teamSize: varchar("teamSize", { length: 40 }),
    marketingConsent: boolean("marketingConsent").default(false).notNull(),
    nameUsageConsent: boolean("nameUsageConsent").default(false).notNull(),
    signature: varchar("signature", { length: 240 }),
    // Third-Party Vendor Confidentiality & Data Protection Agreement snapshot.
    ndaBusinessName: varchar("ndaBusinessName", { length: 240 }),
    ndaEntityDescriptor: varchar("ndaEntityDescriptor", { length: 240 }),
    ndaAddress: varchar("ndaAddress", { length: 500 }),
    ndaSignerName: varchar("ndaSignerName", { length: 160 }),
    ndaSignerTitle: varchar("ndaSignerTitle", { length: 160 }),
    ndaSignerPhone: varchar("ndaSignerPhone", { length: 60 }),
    ndaSignerEmail: varchar("ndaSignerEmail", { length: 320 }),
    ndaSignatureText: varchar("ndaSignatureText", { length: 160 }),
    ndaSignatureDate: varchar("ndaSignatureDate", { length: 40 }),
    ndaEffectiveDate: varchar("ndaEffectiveDate", { length: 40 }),
    ndaRequestCopy: boolean("ndaRequestCopy").default(false).notNull(),
    context: varchar("context", { length: 240 }),
    sourcePage: varchar("sourcePage", { length: 500 }),
    /** Pipeline state: hunt -> interview -> assess -> onboard. */
    status: mysqlEnum("status", vendorStatusValues).default("applied").notNull(),
    statusNotes: text("statusNotes"),
    /** Whether the mirror forward to the DT Portal succeeded at submit time. */
    portalForwarded: boolean("portalForwarded").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("vendors_email_idx").on(table.email), index("vendors_status_idx").on(table.status)],
);

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

export const vendorSkills = mysqlTable(
  "vendorSkills",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorId: int("vendorId").notNull(),
    skill: varchar("skill", { length: 120 }).notNull(),
    /** "form" = checkbox selection; "parsed" = extracted from free-text additionalSkills. */
    source: mysqlEnum("source", ["form", "parsed"]).default("form").notNull(),
  },
  (table) => [
    index("vendorSkills_vendor_idx").on(table.vendorId),
    index("vendorSkills_skill_idx").on(table.skill),
    index("vendorSkills_vendor_skill_idx").on(table.vendorId, table.skill),
  ],
);

export type VendorSkill = typeof vendorSkills.$inferSelect;
export type InsertVendorSkill = typeof vendorSkills.$inferInsert;

export const vendorSectors = mysqlTable(
  "vendorSectors",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorId: int("vendorId").notNull(),
    sector: varchar("sector", { length: 120 }).notNull(),
  },
  (table) => [
    index("vendorSectors_vendor_idx").on(table.vendorId),
    index("vendorSectors_sector_idx").on(table.sector),
  ],
);

export type VendorSector = typeof vendorSectors.$inferSelect;
export type InsertVendorSector = typeof vendorSectors.$inferInsert;

export const vendorCertifications = mysqlTable(
  "vendorCertifications",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorId: int("vendorId").notNull(),
    name: varchar("name", { length: 240 }).notNull(),
    provider: varchar("provider", { length: 240 }),
    isCurrent: boolean("isCurrent").default(true).notNull(),
  },
  (table) => [
    index("vendorCertifications_vendor_idx").on(table.vendorId),
    index("vendorCertifications_name_idx").on(table.name),
  ],
);

export type VendorCertification = typeof vendorCertifications.$inferSelect;
export type InsertVendorCertification = typeof vendorCertifications.$inferInsert;

export const vendorTeamMembers = mysqlTable(
  "vendorTeamMembers",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorId: int("vendorId").notNull(),
    fullName: varchar("fullName", { length: 160 }),
    title: varchar("title", { length: 160 }),
    roleSkills: varchar("roleSkills", { length: 500 }),
    location: varchar("location", { length: 160 }),
    yearsTogether: varchar("yearsTogether", { length: 60 }),
  },
  (table) => [index("vendorTeamMembers_vendor_idx").on(table.vendorId)],
);

export type VendorTeamMember = typeof vendorTeamMembers.$inferSelect;
export type InsertVendorTeamMember = typeof vendorTeamMembers.$inferInsert;

/**
 * File metadata only — binaries continue to forward to the DT Portal in
 * Phase 1. `storageRef` is reserved for the future object-storage (S3) wiring.
 */
export const vendorFiles = mysqlTable(
  "vendorFiles",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorId: int("vendorId").notNull(),
    field: mysqlEnum("field", ["resume", "w9", "headshot"]).notNull(),
    filename: varchar("filename", { length: 260 }).notNull(),
    mimeType: varchar("mimeType", { length: 160 }),
    sizeBytes: int("sizeBytes"),
    storageRef: varchar("storageRef", { length: 500 }),
  },
  (table) => [index("vendorFiles_vendor_idx").on(table.vendorId)],
);

export type VendorFile = typeof vendorFiles.$inferSelect;
export type InsertVendorFile = typeof vendorFiles.$inferInsert;

/**
 * Relevant case studies per vendor. Modeled now (supports the "relevant case
 * study" search criterion); admin-populated in a later phase.
 */
export const vendorCaseStudies = mysqlTable(
  "vendorCaseStudies",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorId: int("vendorId").notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    summary: text("summary"),
    sector: varchar("sector", { length: 120 }),
    outcome: text("outcome"),
    link: varchar("link", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("vendorCaseStudies_vendor_idx").on(table.vendorId)],
);

export type VendorCaseStudy = typeof vendorCaseStudies.$inferSelect;
export type InsertVendorCaseStudy = typeof vendorCaseStudies.$inferInsert;