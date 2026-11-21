import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // CLI (migrate / studio) ใช้ DIRECT_URL (session pooler port 5432)
  datasource: {
    url: env("DIRECT_URL"),
  },
});
