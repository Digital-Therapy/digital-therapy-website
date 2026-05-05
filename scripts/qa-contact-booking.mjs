import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL || "https://3000-ibhiqf4egke1mzoe64d3i-ab353b9c.us2.manus.computer";
const results = [];

async function assertNoMailto(page, label) {
  const mailtoLinks = await page.locator('a[href^="mailto:"]').count();
  if (mailtoLinks !== 0) {
    throw new Error(`${label}: expected 0 mailto links, found ${mailtoLinks}`);
  }
  results.push(`${label}: no mailto links present`);
}

async function verifyBookingDialog(page, path, screenshotName) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await assertNoMailto(page, path || "/");
  await page.getByRole("button", { name: /book 30 minutes/i }).first().click();
  await page.getByRole("heading", { name: /schedule a focused 30-minute briefing/i }).waitFor({ state: "visible" });
  const iframeSrc = await page.locator('iframe[title="Digital Therapy 30 minute booking calendar"]').getAttribute("src");
  if (iframeSrc !== "https://app.apollo.io/#/meet/jonathan_kobrin_67f/30-min") {
    throw new Error(`${path || "/"}: unexpected Apollo iframe src ${iframeSrc}`);
  }
  await page.screenshot({ path: `/home/ubuntu/screenshots/${screenshotName}`, fullPage: true });
  results.push(`${path || "/"}: Book 30 Min opens Apollo booking dialog`);
  await page.keyboard.press("Escape");
}

async function verifyContactDialog(page, path, triggerName, screenshotName) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await assertNoMailto(page, path || "/");
  await page.getByRole("button", { name: triggerName }).first().click();
  await page.getByRole("heading", { name: /tell us where the friction is/i }).waitFor({ state: "visible" });
  await page.getByPlaceholder("Your name").fill("QA Visitor");
  await page.getByPlaceholder("name@firm.com").fill("qa@example.com");
  await page.getByPlaceholder("Family office or firm").fill("QA Family Office");
  await page.getByPlaceholder("Leader, advisor, COO...").fill("Advisor");
  await page.getByPlaceholder(/Briefly describe the pain points/i).fill("We are testing that the contact form stays inside the site instead of opening an email client.");
  await page.screenshot({ path: `/home/ubuntu/screenshots/${screenshotName}`, fullPage: true });
  results.push(`${path || "/"}: ${triggerName} opens on-site contact form dialog`);
  await page.keyboard.press("Escape");
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, ignoreHTTPSErrors: true });
try {
  await verifyBookingDialog(page, "/", "home-booking-dialog.png");
  await verifyContactDialog(page, "/", "Partner model", "home-contact-dialog.png");
  await verifyBookingDialog(page, "/team", "team-booking-dialog.png");
  await verifyContactDialog(page, "/team", "Contact", "team-contact-dialog.png");
  await verifyBookingDialog(page, "/dt-brain", "dt-brain-booking-dialog.png");
  console.log(results.join("\n"));
} finally {
  await browser.close();
}
