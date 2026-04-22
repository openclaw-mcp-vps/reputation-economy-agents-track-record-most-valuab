import { createHmac, timingSafeEqual } from "node:crypto";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

export type ParsedPaymentEvent = {
  email: string;
  status: "active" | "past_due" | "canceled";
  eventType: string;
  provider: "stripe";
};

const safeCompare = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const verifyStripeSignature = (
  payload: string,
  signatureHeader: string | null,
  webhookSecret: string
): boolean => {
  if (!signatureHeader || !webhookSecret) {
    return false;
  }

  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.replace("t=", "");
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.replace("v1=", ""));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", webhookSecret).update(signedPayload, "utf8").digest("hex");

  return signatures.some((signature) => safeCompare(signature, expected));
};

const extractEmail = (object: Record<string, unknown>): string | null => {
  const customerDetails = object.customer_details as { email?: string } | undefined;
  const candidate =
    customerDetails?.email ??
    (typeof object.customer_email === "string" ? object.customer_email : null) ??
    (typeof object.email === "string" ? object.email : null);

  if (!candidate) {
    return null;
  }

  return candidate.trim().toLowerCase();
};

export const parseStripePaymentEvent = (event: StripeWebhookEvent): ParsedPaymentEvent | null => {
  const object = event.data.object;
  const email = extractEmail(object);

  if (!email) {
    return null;
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "invoice.payment_succeeded" ||
    event.type === "customer.subscription.created"
  ) {
    return {
      email,
      status: "active",
      eventType: event.type,
      provider: "stripe"
    };
  }

  if (event.type === "customer.subscription.updated") {
    const subscriptionStatus =
      typeof object.status === "string" ? object.status.toLowerCase() : "active";

    return {
      email,
      status: subscriptionStatus === "active" || subscriptionStatus === "trialing" ? "active" : "past_due",
      eventType: event.type,
      provider: "stripe"
    };
  }

  if (event.type === "invoice.payment_failed") {
    return {
      email,
      status: "past_due",
      eventType: event.type,
      provider: "stripe"
    };
  }

  if (event.type === "customer.subscription.deleted") {
    return {
      email,
      status: "canceled",
      eventType: event.type,
      provider: "stripe"
    };
  }

  return null;
};

export const setupLemonSqueezyClient = (): void => {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!apiKey) {
    return;
  }

  lemonSqueezySetup({ apiKey });
};
