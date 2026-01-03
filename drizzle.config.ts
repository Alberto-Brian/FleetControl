import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  // driver: 'turso',
  schema: './src/lib/db/schemas',
  out: './drizzle',
  dbCredentials: {
    url: 'file:./database.db'
  }
});