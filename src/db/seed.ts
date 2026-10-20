import "dotenv/config";
import { db } from "@/db";
import { plans, payouts } from "@/db/schema";
import { sql } from "drizzle-orm";

const PLAN_ROWS = [
  {
    slug: "starter-5k",
    name: "Starter",
    accountSize: 5_000,
    price: 49,
    profitTargetPct: 10,
    dailyLossPct: 5,
    maxLossPct: 10,
    minTradingDays: 3,
    profitSplit: 80,
    popular: false,
    sort: 1,
    features: [
      "One-phase evaluation",
      "No time limit",
      "80% profit split",
      "Payouts from day 14",
      "Fee refunded with first payout",
    ],
  },
  {
    slug: "growth-10k",
    name: "Growth",
    accountSize: 10_000,
    price: 89,
    profitTargetPct: 10,
    dailyLossPct: 5,
    maxLossPct: 10,
    minTradingDays: 3,
    profitSplit: 80,
    popular: false,
    sort: 2,
    features: [
      "One-phase evaluation",
      "No time limit",
      "80% profit split",
      "Payouts from day 14",
      "Fee refunded with first payout",
    ],
  },
  {
    slug: "pro-25k",
    name: "Pro",
    accountSize: 25_000,
    price: 179,
    profitTargetPct: 10,
    dailyLossPct: 5,
    maxLossPct: 10,
    minTradingDays: 3,
    profitSplit: 85,
    popular: true,
    sort: 3,
    features: [
      "One-phase evaluation",
      "No time limit",
      "85% profit split",
      "Scaling plan to $400k",
      "Payouts from day 10",
      "Fee refunded with first payout",
    ],
  },
  {
    slug: "elite-50k",
    name: "Elite",
    accountSize: 50_000,
    price: 319,
    profitTargetPct: 10,
    dailyLossPct: 5,
    maxLossPct: 10,
    minTradingDays: 3,
    profitSplit: 85,
    popular: false,
    sort: 4,
    features: [
      "One-phase evaluation",
      "No time limit",
      "85% profit split",
      "Scaling plan to $400k",
      "Payouts from day 10",
      "Dedicated risk manager",
    ],
  },
  {
    slug: "master-100k",
    name: "Master",
    accountSize: 100_000,
    price: 529,
    profitTargetPct: 10,
    dailyLossPct: 5,
    maxLossPct: 10,
    minTradingDays: 3,
    profitSplit: 90,
    popular: false,
    sort: 5,
    features: [
      "One-phase evaluation",
      "No time limit",
      "90% profit split",
      "Scaling plan to $400k",
      "Payouts from day 7",
      "Dedicated risk manager",
      "Priority payout lane",
    ],
  },
  {
    slug: "apex-200k",
    name: "Apex",
    accountSize: 200_000,
    price: 949,
    profitTargetPct: 10,
    dailyLossPct: 5,
    maxLossPct: 10,
    minTradingDays: 3,
    profitSplit: 90,
    popular: false,
    sort: 6,
    features: [
      "One-phase evaluation",
      "No time limit",
      "90% profit split",
      "Scaling plan to $1M",
      "Payouts from day 7",
      "Dedicated risk manager",
      "Priority payout lane",
    ],
  },
];

const PAYOUT_ROWS: Array<{
  trader: string;
  country: string;
  amount: number;
  method: string;
  hoursAgo: number;
}> = [
  { trader: "Dmitri K.", country: "EE", amount: 18_420, method: "USDT · TRC20", hoursAgo: 2 },
  { trader: "Amara O.", country: "NG", amount: 4_150, method: "BTC", hoursAgo: 5 },
  { trader: "Lucas M.", country: "BR", amount: 9_870, method: "Bank wire", hoursAgo: 7 },
  { trader: "Sofia R.", country: "ES", amount: 2_340, method: "USDT · TRC20", hoursAgo: 11 },
  { trader: "Yusuf A.", country: "AE", amount: 26_500, method: "BTC", hoursAgo: 14 },
  { trader: "Elena V.", country: "BG", amount: 6_725, method: "Skrill", hoursAgo: 19 },
  { trader: "Marc B.", country: "FR", amount: 12_040, method: "Bank wire", hoursAgo: 23 },
  { trader: "Keiko T.", country: "JP", amount: 8_910, method: "USDT · ERC20", hoursAgo: 27 },
  { trader: "Daniel S.", country: "ZA", amount: 3_480, method: "BTC", hoursAgo: 31 },
  { trader: "Priya N.", country: "IN", amount: 15_260, method: "USDT · TRC20", hoursAgo: 38 },
  { trader: "Tomasz W.", country: "PL", amount: 5_615, method: "Skrill", hoursAgo: 44 },
  { trader: "Jonas H.", country: "SE", amount: 21_300, method: "Bank wire", hoursAgo: 52 },
  { trader: "Valeria C.", country: "AR", amount: 1_980, method: "USDT · TRC20", hoursAgo: 61 },
  { trader: "Omar F.", country: "EG", amount: 7_440, method: "BTC", hoursAgo: 70 },
  { trader: "Nina P.", country: "RS", amount: 11_075, method: "USDT · ERC20", hoursAgo: 83 },
  { trader: "Gabriel L.", country: "CO", amount: 4_920, method: "Skrill", hoursAgo: 95 },
];

async function main() {
  console.log("Seeding Expiry Capital database…");

  await db.execute(sql`TRUNCATE plans, payouts, leads, orders RESTART IDENTITY CASCADE`);

  await db.insert(plans).values(PLAN_ROWS);

  const now = Date.now();
  await db.insert(payouts).values(
    PAYOUT_ROWS.map((row) => ({
      trader: row.trader,
      country: row.country,
      amount: row.amount,
      method: row.method,
      paidAt: new Date(now - row.hoursAgo * 3_600_000),
    })),
  );

  console.log(`Seeded ${PLAN_ROWS.length} plans and ${PAYOUT_ROWS.length} payouts.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
