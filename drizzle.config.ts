// Load DATABASE_URL (and friends) from the local .env file so `pnpm db:push`
// and other drizzle-kit commands work without manually exporting the variable.
// The app server already loads dotenv in server/_core/index.ts.
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required to run drizzle commands. Add it to a .env file in this folder " +
      "(see .env.example) or export it in your shell.",
  );
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
