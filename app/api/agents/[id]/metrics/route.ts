import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE_NAME, hasAccessCookie } from "@/lib/auth";
import { createMetric, getAgentById, listAgentMetrics } from "@/lib/database";
import { scoreExecution } from "@/lib/scoring-algorithm";

const metricSchema = z.object({
  taskType: z.string().min(2).max(150),
  environment: z.string().min(2).max(80),
  outcomeSummary: z.string().min(10).max(500),
  success: z.boolean(),
  decisionQuality: z.number().min(0).max(100),
  latencyMs: z.number().min(0),
  costUsd: z.number().min(0),
  safetyScore: z.number().min(0).max(100),
  consistencyScore: z.number().min(0).max(100)
});

const canIngest = (request: NextRequest): boolean => {
  const hasCookie = hasAccessCookie(request.cookies.get(ACCESS_COOKIE_NAME)?.value);

  if (hasCookie) {
    return true;
  }

  const configuredKey = process.env.INGEST_API_KEY;

  if (!configuredKey) {
    return false;
  }

  return request.headers.get("x-ingest-key") === configuredKey;
};

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!hasAccessCookie(request.cookies.get(ACCESS_COOKIE_NAME)?.value)) {
    return NextResponse.json({ message: "Purchase verification required." }, { status: 401 });
  }

  const { id } = await context.params;
  const agent = await getAgentById(id);

  if (!agent) {
    return NextResponse.json({ message: "Agent not found." }, { status: 404 });
  }

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "90");
  const metrics = await listAgentMetrics(id, Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 365) : 90);

  return NextResponse.json({ agent, metrics });
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!canIngest(request)) {
    return NextResponse.json(
      {
        message: "Ingestion requires an active access cookie or a matching x-ingest-key."
      },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const agent = await getAgentById(id);

  if (!agent) {
    return NextResponse.json({ message: "Agent not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = metricSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid metric payload.",
        issues: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const score = scoreExecution(parsed.data);

  const metric = await createMetric({
    agentId: id,
    ...parsed.data,
    reliabilityScore: score.breakdown.reliability,
    efficiencyScore: score.breakdown.efficiency,
    score: score.totalScore
  });

  return NextResponse.json(
    {
      metric,
      score
    },
    { status: 201 }
  );
}
