import { db } from "@/db";
import { leads, orders, payouts } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BASE_TRADERS = 38_400;
const BASE_PAID_OUT = 12_480_000;
const COUNTRIES = 189;
const AVG_PAYOUT_HOURS = 9.4;

export async function GET() {
  try {
    const [orderCount] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(orders);
    const [leadCount] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(leads);
    const [payoutSum] = await db
      .select({ total: sql<number>`coalesce(sum(${payouts.amount}), 0)::int` })
      .from(payouts);

    return Response.json({
      stats: {
        traders: BASE_TRADERS + (orderCount?.n ?? 0) + (leadCount?.n ?? 0),
        paidOut: BASE_PAID_OUT + (payoutSum?.total ?? 0),
        countries: COUNTRIES,
        avgPayoutHours: AVG_PAYOUT_HOURS,
      },
    });
  } catch (error) {
    console.error("GET /api/stats", error);
    return Response.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
