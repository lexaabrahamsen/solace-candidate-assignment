import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    // Throw only when someone actually asks for the DB
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(url);
  _db = drizzle(client);
  return _db;
}
