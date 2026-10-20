import { db } from "@/db";
import { plans } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(plans).orderBy(asc(plans.sort));
    return Response.json({ plans: rows });
  } catch (error) {
    console.error("GET /api/plans", error);
    return Response.json({ error: "Failed to load plans" }, { status: 500 });
  }
}
