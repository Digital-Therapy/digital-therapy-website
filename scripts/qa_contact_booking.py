from playwright.sync_api import sync_playwright, expect

BASE_URL = "https://3000-ibhiqf4egke1mzoe64d3i-ab353b9c.us2.manus.computer"
APOLLO_URL = "https://app.apollo.io/#/meet/jonathan_kobrin_67f/30-min"
results: list[str] = []


def assert_no_mailto(page, label: str) -> None:
    mailto_links = page.locator('a[href^="mailto:"]').count()
    if mailto_links != 0:
        raise AssertionError(f"{label}: expected 0 mailto links, found {mailto_links}")
    results.append(f"{label}: no mailto links present")


def verify_booking_dialog(page, path: str, screenshot_name: str) -> None:
    page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
    assert_no_mailto(page, path or "/")
    page.get_by_role("button", name="Book 30 minutes with Digital Therapy").first.click()
    expect(page.get_by_role("heading", name="Schedule a focused 30-minute briefing.")).to_be_visible()
    iframe_src = page.locator('iframe[title="Digital Therapy 30 minute booking calendar"]').get_attribute("src")
    if iframe_src != APOLLO_URL:
        raise AssertionError(f"{path or '/'}: unexpected Apollo iframe src {iframe_src}")
    page.screenshot(path=f"/home/ubuntu/screenshots/{screenshot_name}", full_page=True)
    results.append(f"{path or '/'}: Book 30 Min opens Apollo booking dialog")
    page.keyboard.press("Escape")


def verify_contact_dialog(page, path: str, trigger_name: str, screenshot_name: str) -> None:
    page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
    assert_no_mailto(page, path or "/")
    page.get_by_role("button", name=trigger_name).first.click()
    expect(page.get_by_role("heading", name="Tell us where the friction is.")).to_be_visible()
    page.get_by_placeholder("Your name").fill("QA Visitor")
    page.get_by_placeholder("name@firm.com").fill("qa@example.com")
    page.get_by_placeholder("Family office or firm").fill("QA Family Office")
    page.get_by_placeholder("Leader, advisor, COO...").fill("Advisor")
    page.get_by_placeholder("Briefly describe the pain points, workflows, reporting needs, or first-value opportunity you want to discuss.").fill(
        "We are testing that the contact form stays inside the site instead of opening an email client."
    )
    page.screenshot(path=f"/home/ubuntu/screenshots/{screenshot_name}", full_page=True)
    results.append(f"{path or '/'}: {trigger_name} opens on-site contact form dialog")
    page.keyboard.press("Escape")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1100}, ignore_https_errors=True)
    try:
        verify_booking_dialog(page, "/", "home-booking-dialog.png")
        verify_contact_dialog(page, "/", "Partner model", "home-contact-dialog.png")
        verify_booking_dialog(page, "/team", "team-booking-dialog.png")
        verify_contact_dialog(page, "/team", "Contact", "team-contact-dialog.png")
        verify_booking_dialog(page, "/dt-brain", "dt-brain-booking-dialog.png")
        print("\n".join(results))
    finally:
        browser.close()
