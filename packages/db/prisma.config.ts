import { defineConfig, env } from "prisma/config";
import { config as loadEnv } from "dotenv";

loadEnv(); // load ./.env (Prisma 7 config does not auto-load it)


// Prisma 7: connection URLs live here (schema datasource no longer carries url).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
