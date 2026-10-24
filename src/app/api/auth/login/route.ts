import { db } from "@/db";
import { orders, plans } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const loginInput = (body.login ?? "").toString().trim();
    const passwordInput = (body.password ?? "").toString().trim();

    if (!loginInput || !passwordInput) {
      return Response.json(
        { error: "Please enter your Login ID / Email and Password" },
        { status: 400 },
      );
    }

    const matchedOrders = await db
      .select({
        id: orders.id,
        ref: orders.ref,
        firstName: orders.firstName,
        lastName: orders.lastName,
        email: orders.email,
        platformLogin: orders.platformLogin,
        platformPassword: orders.platformPassword,
        status: orders.status,
        planName: plans.name,
        accountSize: plans.accountSize,
      })
      .from(orders)
      .innerJoin(plans, eq(orders.planId, plans.id))
      .where(
        or(
          eq(orders.platformLogin, loginInput),
          eq(orders.email, loginInput.toLowerCase()),
        ),
      )
      .limit(1);

    if (matchedOrders.length === 0) {
      return Response.json(
        { error: "Invalid credentials. No active challenge found." },
        { status: 401 },
      );
    }

    const userOrder = matchedOrders[0];

    if (userOrder.platformPassword !== passwordInput) {
      return Response.json(
        { error: "Invalid password for this account." },
        { status: 401 },
      );
    }

    if (userOrder.status !== "active") {
      return Response.json(
        { error: "This challenge account is not active." },
        { status: 403 },
      );
    }

    return Response.json({
      success: true,
      account: {
        id: userOrder.id,
        ref: userOrder.ref,
        traderName: `${userOrder.firstName} ${userOrder.lastName}`,
        email: userOrder.email,
        platformLogin: userOrder.platformLogin,
        planName: userOrder.planName,
        accountSize: userOrder.accountSize,
        status: userOrder.status,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return Response.json(
      { error: "Server error during authentication" },
      { status: 500 },
    );
  }
}