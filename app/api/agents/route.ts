import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE_NAME, hasAccessCookie } from "@/lib/auth";
import { createAgent, listAgents } from "@/lib/database";

const createAgentSchema = z.object({
  name: z.string().min(2).max(100),
  model: z.string().min(2).max(120),
  ownerTeam: z.string().min(2).max(100),
  description: z.string().min(15).max(500)
});

const isAuthorized = (request: NextRequest): boolean => {
  return hasAccessCookie(request.cookies.get(ACCESS_COOKIE_NAME)?.value);
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Purchase verification required." }, { status: 401 });
  }

  const agents = await listAgents();

  return NextResponse.json({ agents });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Purchase verification required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createAgentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid agent payload.",
        issues: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const agent = await createAgent(parsed.data);

  return NextResponse.json({ agent }, { status: 201 });
}
