/**
 * Builds a combined PDF — one page per vendor — and triggers a direct download.
 * Pure client-side (jsPDF), so it works identically locally and on the hosted
 * admin with no print dialog. Content is laid out to fit a single US-Letter
 * page per vendor; very long fields are capped.
 */
import { jsPDF } from "jspdf";

export type ExportProfile = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  vendorTypeLabel: string;
  appliedCategory: string | null;
  categories: string[];
  companyName: string | null;
  websiteUrl: string | null;
  personalLinkedin: string | null;
  companySocial: string | null;
  hourlyRate: string | null;
  hoursPerMonth: string | null;
  teamSize: string | null;
  availabilityNotes: string | null;
  status: string;
  skills: string[];
  sectors: string[];
  certifications: { name: string; provider: string | null; isCurrent: boolean }[];
  personalBio: string | null;
};

function truncate(value: string | null | undefined, max: number): string {
  if (!value) return "";
  const v = value.trim();
  return v.length > max ? `${v.slice(0, max).trimEnd()}…` : v;
}

const MARGIN = 40;
const LEFT = MARGIN;
const RIGHT = 612 - MARGIN; // letter width 612pt
const CONTENT_W = RIGHT - LEFT;
const BOTTOM = 792 - MARGIN; // letter height 792pt

function drawProfile(doc: jsPDF, v: ExportProfile) {
  let y = 56;

  // Name + status
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(17);
  doc.text(truncate(v.name, 60), LEFT, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`STATUS: ${(v.status || "").toUpperCase()}`, RIGHT, y, { align: "right" });

  // Categories
  y += 16;
  doc.setFontSize(11);
  doc.setTextColor(70);
  doc.text(truncate(v.categories.length ? v.categories.join("   ·   ") : v.vendorTypeLabel, 90), LEFT, y);

  // Rule
  y += 8;
  doc.setDrawColor(20);
  doc.setLineWidth(1);
  doc.line(LEFT, y, RIGHT, y);
  y += 18;

  // Two-column facts (value wraps to max 2 lines; fixed row height)
  const facts: [string, string | null][] = [
    ["Email", v.email],
    ["Title / role", v.role],
    ["Company", v.companyName],
    ["Website", v.websiteUrl],
    ["Personal LinkedIn", v.personalLinkedin],
    ["Company LinkedIn / Instagram", v.companySocial],
    ["Hourly rate", v.hourlyRate],
    ["Hours / month", v.hoursPerMonth],
    ["Team size", v.teamSize],
    ["Availability", truncate(v.availabilityNotes, 120)],
  ];
  const present = facts.filter(([, val]) => val && String(val).trim());
  const colW = CONTENT_W / 2;
  const rowH = 30;
  present.forEach(([label, val], idx) => {
    const col = idx % 2;
    const rowIdx = Math.floor(idx / 2);
    const x = LEFT + col * colW;
    const cellY = y + rowIdx * rowH;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(label.toUpperCase(), x, cellY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(17);
    const lines = doc.splitTextToSize(String(val), colW - 14).slice(0, 2);
    doc.text(lines, x, cellY + 11);
  });
  y += Math.ceil(present.length / 2) * rowH + 4;

  const section = (title: string, body: string) => {
    if (!body) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(120);
    doc.text(title.toUpperCase(), LEFT, y);
    y += 11;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(17);
    const lines = doc.splitTextToSize(body, CONTENT_W);
    for (const line of lines) {
      if (y > BOTTOM - 24) break; // never spill past one page
      doc.text(line, LEFT, y);
      y += 12;
    }
    y += 6;
  };

  section("Skills", v.skills.length ? truncate(v.skills.join(", "), 900) : "—");
  section("Sector experience", v.sectors.length ? v.sectors.join(", ") : "—");
  section(
    "Certifications",
    v.certifications.length
      ? v.certifications
          .map((c) => `${c.name}${c.provider ? ` (${c.provider})` : ""}${c.isCurrent ? "" : " — expired"}`)
          .join("; ")
      : "—",
  );
  if (v.personalBio) section("Bio", truncate(v.personalBio, 900));

  // Footer
  doc.setDrawColor(210);
  doc.setLineWidth(0.5);
  doc.line(LEFT, BOTTOM - 14, RIGHT, BOTTOM - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Digital Therapy · Vendor Profile", LEFT, BOTTOM - 4);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, RIGHT, BOTTOM - 4, { align: "right" });
}

export function generateVendorPdf(profiles: ExportProfile[]) {
  if (!profiles.length) return;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  profiles.forEach((v, i) => {
    if (i > 0) doc.addPage();
    drawProfile(doc, v);
  });
  const filename =
    profiles.length === 1
      ? `Vendor Profile - ${profiles[0].name.replace(/[^\w\s-]/g, "").trim() || "vendor"}.pdf`
      : `Vendor Profiles (${profiles.length}).pdf`;
  doc.save(filename);
}
