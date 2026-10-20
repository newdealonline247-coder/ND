import { db } from "@/db";
import { payouts } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import type { BoardEntryDto } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feed = await db
      .select()
      .from(payouts)
      .orderBy(desc(payouts.paidAt))
      .limit(10);

    const board = await db
      .select({
        trader: payouts.trader,
        country: payouts.country,
        total: sql<number>`sum(${payouts.amount})::int`,
      })
      .from(payouts)
      .groupBy(payouts.trader, payouts.country)
      .orderBy(desc(sql`sum(${payouts.amount})`))
      .limit(5);

    return Response.json({
      feed: feed.map((p) => ({ ...p, paidAt: p.paidAt.toISOString() })),
      board: board satisfies BoardEntryDto[],
    });
  } catch (error) {
    console.error("GET /api/payouts", error);
    return Response.json({ error: "Failed to load payouts" }, { status: 500 });
  }
}
