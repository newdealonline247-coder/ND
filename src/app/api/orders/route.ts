import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { leads, orders, plans } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      planSlug?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      country?: string;
    } | null;

    if (!body) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const country = body.country?.trim() ?? "";
    const planSlug = body.planSlug?.trim() ?? "";

    if (!firstName || firstName.length > 60) {
      return Response.json({ error: "Please enter your first name" }, { status: 400 });
    }
    if (!lastName || lastName.length > 60) {
      return Response.json({ error: "Please enter your last name" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (!country) {
      return Response.json({ error: "Please select your country" }, { status: 400 });
    }

    const [plan] = await db.select().from(plans).where(eq(plans.slug, planSlug)).limit(1);
    if (!plan) {
      return Response.json({ error: "Unknown challenge plan" }, { status: 404 });
    }

    const ref = `EXC-${randomBytes(4).toString("hex").toUpperCase()}`;
    const platformLogin = `cap_${randomBytes(3).toString("hex")}`;
    const platformPassword = randomBytes(6).toString("base64url");

    await db.insert(orders).values({
      ref,
      planId: plan.id,
      firstName,
      lastName,
      email,
      country,
      platformLogin,
      platformPassword,
      status: "active",
    });

    await db
      .insert(leads)
      .values({ email, source: "checkout" })
      .onConflictDoNothing({ target: leads.email });

    return Response.json(
      {
        order: {
          ref,
          planName: plan.name,
          accountSize: plan.accountSize,
          price: plan.price,
          platformLogin,
          platformPassword,
          email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/orders", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
