import { db } from "@/db";
import { leads } from "@/db/schema";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      source?: string;
    } | null;

    const email = body?.email?.trim().toLowerCase() ?? "";
    const source = body?.source?.trim() || "cta";

    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    await db
      .insert(leads)
      .values({ email, source })
      .onConflictDoNothing({ target: leads.email });

    return Response.json({ ok: true, discount: "EXPIRY20" });
  } catch (error) {
    console.error("POST /api/leads", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
