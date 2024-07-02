import { defineConfig } from 'drizzle-kit';
import * as dotenv from "dotenv"


dotenv.config({
  path: ".env.local",
})

export default defineConfig({
  schema: './server/schema.ts',
  out: './server/migrations',
  dialect: 'postgresql', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
