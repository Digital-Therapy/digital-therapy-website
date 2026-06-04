# Portal DB — follow-ups with Milton

Two open items from wiring the website's vendor admin console to the portal
Postgres database. Below is a ready-to-send message.

---

**To: Milton**
**Subject: Portal DB — vendor admin wired up; two small asks**

Hey Milton — thanks for the portal DB access. I've got the website's new vendor
admin console reading live from it and it's working great. Two things to flag:

**1. We never touch your tables — added one isolated table.**
The admin reads `public."VendorApplication"` (and `File`) read-only. The only
thing it writes is an admin-side pipeline status/notes, which lives in a brand
new, separate schema/table I created: `dt_site.vendor_status` (keyed by
`vendorApplicationId`). Your app's tables are untouched. Shout if you'd prefer a
different schema name or want to review it.

**2. Could you add 4 columns to `VendorApplication`?**
The website's vendor form now collects four new fields, and it already forwards
them in the ingest payload — but the portal drops them since the columns don't
exist yet. Could you add these (all nullable `text`) and map them in the
`/api/ingest/vendor` handler?
- `companyName`
- `websiteUrl`
- `personalLinkedin`
- `companySocial`  (their "Company LinkedIn or Instagram")

Once they're there, the admin will display them automatically.

**3. Hosting question (no rush).**
Right now the admin reads the DB directly over Tailscale, so I run it from my
Mac and it just works. If we ever want it always-on / hosted (e.g. at
`digitaltherapy.io/admin`), the production web host would need to be on the
tailnet too — or you might have a cleaner pattern in mind. Curious what you'd
recommend, whenever you have a minute.

Thanks!
— Jon

---

## Status for our own tracking
- [ ] Milton adds the 4 columns to `VendorApplication` + ingest mapping
- [ ] Decide hosting approach for the admin (local-on-Mac is fine for now)
- [ ] (Later) remove the now-unused MySQL vendor tables + migrations `0002`/`0003`
