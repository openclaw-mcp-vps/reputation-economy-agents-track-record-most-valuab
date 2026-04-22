import { NextRequest, NextResponse } from "next/server";
import { parseStripePaymentEvent, verifyStripeSignature, type StripeWebhookEvent } from "@/lib/lemonsqueezy";
import { upsertPaymentStatus } from "@/lib/database";

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is active. Send Stripe events to this URL."
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const stripeSignature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && !verifyStripeSignature(payload, stripeSignature, webhookSecret)) {
    return NextResponse.json({ message: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeWebhookEvent;

  try {
    event = JSON.parse(payload) as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = parseStripePaymentEvent(event);

  if (!parsed) {
    return NextResponse.json({ received: true, processed: false });
  }

  await upsertPaymentStatus(parsed);

  return NextResponse.json({ received: true, processed: true, email: parsed.email });
}
