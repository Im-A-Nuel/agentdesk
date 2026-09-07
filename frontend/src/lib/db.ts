// Neon Postgres client (serverless HTTP driver).
// Without DATABASE_URL, reads return empty collections and writes use an in-memory store.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

const sql: NeonQueryFunction<boolean, boolean> | null = connectionString
  ? neon(connectionString)
  : null;

export function isDbConfigured(): boolean {
  return Boolean(sql);
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }
  return (await sql.query(text, params)) as T[];
}
