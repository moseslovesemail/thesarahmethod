import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool; tableReady?: Promise<void> };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("railway.internal") ? false : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export function ensureIntakeTable() {
  if (!globalForDb.tableReady) {
    globalForDb.tableReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS intake_submissions (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          first_name TEXT NOT NULL,
          email TEXT NOT NULL,
          primary_goal TEXT NOT NULL,
          secondary_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
          experience TEXT NOT NULL,
          equipment JSONB NOT NULL DEFAULT '[]'::jsonb,
          reformer_brand TEXT,
          session_minutes INTEGER NOT NULL,
          sessions_per_week INTEGER NOT NULL,
          preferred_days JSONB NOT NULL DEFAULT '[]'::jsonb,
          enjoys TEXT,
          dislikes TEXT,
          has_limitations BOOLEAN NOT NULL DEFAULT FALSE,
          limitation_notes TEXT,
          needs_professional_assessment BOOLEAN NOT NULL DEFAULT FALSE,
          extra_notes TEXT,
          screening_status TEXT NOT NULL DEFAULT 'clear',
          consent BOOLEAN NOT NULL DEFAULT FALSE
        );
        CREATE INDEX IF NOT EXISTS idx_intake_created_at ON intake_submissions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_intake_screening_status ON intake_submissions(screening_status);
      `)
      .then(() => undefined);
  }

  return globalForDb.tableReady;
}
