# Database setup

This app uses **MySQL**. Everything (admin login, the vendor inventory, the
contact form) talks to one database through a single setting: `DATABASE_URL`.
Setting it up is three steps: **provision a MySQL database → put its URL in
`.env` → create the tables.**

---

## 1. Provision a MySQL database

You need a MySQL database reachable over the internet (so both your Mac and the
live site can connect). Pick one provider:

### Option A — Railway (easiest, recommended to start)
1. Go to <https://railway.app> and sign up (GitHub login is fine).
2. **New Project → Deploy MySQL** (a.k.a. "Add MySQL"). It provisions in ~30s.
3. Open the MySQL service → **Variables / Connect** tab.
4. Copy the **public** connection URL — it looks like:
   `mysql://root:LONGPASSWORD@maglev.proxy.rlwy.net:34567/railway`
   (Use the *public/proxy* URL, not the internal one, so your Mac can reach it.)

Railway is usage-based (a few dollars/month for a tiny DB). No SSL fiddling —
the URL works as-is.

### Option B — PlanetScale / DigitalOcean / AWS RDS (alternatives)
Any managed MySQL works. Create a database, then copy its connection string.
Note: some providers **require SSL**. If so, append this to the URL:
`?ssl={"rejectUnauthorized":true}` — ask and we'll wire it up.

### Option C — Local MySQL (for testing only, via Docker)
```bash
docker run --name dt-mysql -e MYSQL_ROOT_PASSWORD=devpass \
  -e MYSQL_DATABASE=digital_therapy -p 3306:3306 -d mysql:8
```
Then your URL is: `mysql://root:devpass@localhost:3306/digital_therapy`

---

## 2. Put the URL in `.env`

In this folder (`digital-therapy-website`):
```bash
cp .env.example .env
```
Open `.env` and paste your connection string:
```
DATABASE_URL="mysql://root:LONGPASSWORD@maglev.proxy.rlwy.net:34567/railway"
```
`.env` is gitignored — the secret never gets committed.

---

## 3. Create the tables

```bash
npx drizzle-kit migrate
```
This applies all migrations in `drizzle/` (including the vendor tables) to your
database. Re-running it is safe — already-applied migrations are skipped.

You should see it apply `0000`, `0001`, and `0002` (the vendor inventory).

---

## 4. Point the live site at the same database

Your local `.env` only affects your Mac. To make the **live** site use this
database, set the **same** `DATABASE_URL` in your hosting platform's environment
settings (e.g. the Manus dashboard's env vars), then redeploy. The migration
only needs to be run **once** against the database — from anywhere that can
reach it — not separately per environment.

---

## Troubleshooting
- **`DATABASE_URL is required…`** → `.env` is missing or in the wrong folder, or
  the line is commented out.
- **`ECONNREFUSED` / timeout** → wrong host/port, or you used a provider's
  *internal* URL instead of the public one. Use the public/proxy URL.
- **`Access denied`** → wrong user/password in the URL.
- **SSL/TLS errors** → the provider requires SSL; append
  `?ssl={"rejectUnauthorized":true}` to the URL (or ask for help).
- **Verify it worked** → submit a vendor application on `/vendors`, then open
  `/admin/vendors` while logged in as the owner; the vendor should appear.
