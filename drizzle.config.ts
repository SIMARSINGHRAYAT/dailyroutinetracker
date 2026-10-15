import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
});
