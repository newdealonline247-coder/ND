import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  accountSize: integer("account_size").notNull(),
  price: integer("price").notNull(),
  profitTargetPct: integer("profit_target_pct").notNull(),
  dailyLossPct: integer("daily_loss_pct").notNull(),
  maxLossPct: integer("max_loss_pct").notNull(),
  minTradingDays: integer("min_trading_days").notNull(),
  profitSplit: integer("profit_split").notNull(),
  popular: boolean("popular").notNull().default(false),
  features: jsonb("features").$type<string[]>().notNull(),
  sort: integer("sort").notNull().default(0),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  ref: text("ref").notNull().unique(),
  planId: integer("plan_id")
    .notNull()
    .references(() => plans.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  country: text("country").notNull(),
  platformLogin: text("platform_login").notNull(),
  platformPassword: text("platform_password").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("cta"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  trader: text("trader").notNull(),
  country: text("country").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
