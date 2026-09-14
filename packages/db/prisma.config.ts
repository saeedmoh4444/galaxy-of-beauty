import { defineConfig } from 'prisma/config';
import { config as loadEnv } from 'dotenv';

loadEnv(); // load ./.env (Prisma 7 config does not auto-load it)

// Prisma 7: connection URLs live here (schema datasource no longer carries url).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Tolerate missing env: generate/postinstall need no live DB; migrate jobs set it.
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/placeholder',
  },
});
