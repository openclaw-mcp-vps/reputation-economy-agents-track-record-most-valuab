import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE_NAME, ACCESS_COOKIE_VALUE } from "@/lib/auth";
import { hasActivePayment } from "@/lib/database";

const verifySchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Provide a valid billing email."
      },
      { status: 400 }
    );
  }

  const isPaid = await hasActivePayment(parsed.data.email);

  if (!isPaid) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "No active payment found for this email yet. If you just checked out, wait a few seconds for the webhook to sync."
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    message: "Access granted"
  });

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: ACCESS_COOKIE_VALUE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
