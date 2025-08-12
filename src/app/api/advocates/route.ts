import { getDb } from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const data = await db.select().from(advocates);
    return Response.json({ data });
  } catch (err: any) {
    console.warn("DB not available, serving local seed data:", err?.message);
    return Response.json({ data: advocateData });
  }
}
