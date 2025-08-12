import { getDb } from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const db = getDb();
    const records = await db.insert(advocates).values(advocateData).returning();
    return Response.json({ advocates: records });
  } catch (err: any) {
    console.error("Seed error:", err);
    return Response.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
