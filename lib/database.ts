import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { scoreExecution, type ExecutionMetricInput } from "@/lib/scoring-algorithm";

const USE_POSTGRES = Boolean(process.env.DATABASE_URL);
const DATA_DIRECTORY = path.join(process.cwd(), "data");
const LOCAL_DATA_FILE = path.join(DATA_DIRECTORY, "local-db.json");

export type AgentRecord = {
  id: string;
  name: string;
  model: string;
  ownerTeam: string;
  description: string;
  createdAt: string;
};

export type MetricRecord = {
  id: string;
  agentId: string;
  taskType: string;
  environment: string;
  outcomeSummary: string;
  success: boolean;
  decisionQuality: number;
  latencyMs: number;
  costUsd: number;
  safetyScore: number;
  consistencyScore: number;
  reliabilityScore: number;
  efficiencyScore: number;
  score: number;
  createdAt: string;
};

export type AgentSummary = AgentRecord & {
  runs: number;
  successRate: number;
  averageScore: number;
  reliabilityScore: number;
  decisionQualityScore: number;
  efficiencyScore: number;
  safetyScore: number;
  consistencyScore: number;
  lastRunAt: string | null;
};

export type DashboardStats = {
  totalAgents: number;
  totalRuns: number;
  averageScore: number;
  reliabilityIndex: number;
  topPerformer: AgentSummary | null;
  dailyPerformance: Array<{
    date: string;
    averageScore: number;
    runs: number;
    successRate: number;
  }>;
};

export type PaymentRecord = {
  email: string;
  status: "active" | "past_due" | "canceled";
  eventType: string;
  provider: "stripe";
  updatedAt: string;
};

export type RecentMetric = MetricRecord & {
  agentName: string;
};

type LocalStore = {
  agents: AgentRecord[];
  metrics: MetricRecord[];
  payments: PaymentRecord[];
};

type CreateAgentInput = {
  name: string;
  model: string;
  ownerTeam: string;
  description: string;
};

type CreateMetricInput = {
  agentId: string;
  taskType: string;
  environment: string;
  outcomeSummary: string;
  success: boolean;
  decisionQuality: number;
  latencyMs: number;
  costUsd: number;
  safetyScore: number;
  consistencyScore: number;
  reliabilityScore: number;
  efficiencyScore: number;
  score: number;
  createdAt?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __reputation_pool: Pool | undefined;
}

let initPromise: Promise<void> | null = null;

const getPool = (): Pool => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for PostgreSQL mode.");
  }

  if (!global.__reputation_pool) {
    global.__reputation_pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  return global.__reputation_pool;
};

const round = (value: number, precision = 2): number => Number(value.toFixed(precision));

const toMetricRecord = (row: Record<string, unknown>): MetricRecord => {
  return {
    id: String(row.id),
    agentId: String(row.agent_id),
    taskType: String(row.task_type),
    environment: String(row.environment),
    outcomeSummary: String(row.outcome_summary),
    success: Boolean(row.success),
    decisionQuality: Number(row.decision_quality),
    latencyMs: Number(row.latency_ms),
    costUsd: Number(row.cost_usd),
    safetyScore: Number(row.safety_score),
    consistencyScore: Number(row.consistency_score),
    reliabilityScore: Number(row.reliability_score),
    efficiencyScore: Number(row.efficiency_score),
    score: Number(row.score),
    createdAt: new Date(String(row.created_at)).toISOString()
  };
};

const toAgentSummary = (row: Record<string, unknown>): AgentSummary => {
  return {
    id: String(row.id),
    name: String(row.name),
    model: String(row.model),
    ownerTeam: String(row.owner_team),
    description: String(row.description),
    createdAt: new Date(String(row.created_at)).toISOString(),
    runs: Number(row.runs),
    successRate: round(Number(row.success_rate)),
    averageScore: round(Number(row.average_score)),
    reliabilityScore: round(Number(row.reliability_score)),
    decisionQualityScore: round(Number(row.decision_quality_score)),
    efficiencyScore: round(Number(row.efficiency_score)),
    safetyScore: round(Number(row.safety_score)),
    consistencyScore: round(Number(row.consistency_score)),
    lastRunAt: row.last_run_at ? new Date(String(row.last_run_at)).toISOString() : null
  };
};

const buildSeedStore = (): LocalStore => {
  const now = Date.now();
  const daysAgo = (days: number, hourOffset: number): string => {
    return new Date(now - days * 86_400_000 + hourOffset * 3_600_000).toISOString();
  };

  const agents: AgentRecord[] = [
    {
      id: "agt-risk-ops",
      name: "RiskOps Sentinel",
      model: "GPT-4.1 + rules",
      ownerTeam: "Finance",
      description:
        "Approves or escalates procurement decisions above spending thresholds using policy-aware reasoning.",
      createdAt: daysAgo(40, 1)
    },
    {
      id: "agt-revenue-optimizer",
      name: "Revenue Optimizer",
      model: "Claude + custom reranker",
      ownerTeam: "Growth",
      description:
        "Recommends pricing and package mix changes for inbound leads based on conversion elasticity.",
      createdAt: daysAgo(34, 2)
    },
    {
      id: "agt-support-triage",
      name: "Support Triage AI",
      model: "Llama 3.3 fine-tuned",
      ownerTeam: "Customer Success",
      description:
        "Routes incoming support threads to the right playbook and drafts first responses for critical tickets.",
      createdAt: daysAgo(27, 3)
    }
  ];

  const metricTemplates: Array<
    Pick<CreateMetricInput, "agentId" | "taskType" | "environment" | "outcomeSummary"> &
      ExecutionMetricInput & {
        days: number;
        hour: number;
      }
  > = [
    {
      agentId: "agt-risk-ops",
      taskType: "Procurement review",
      environment: "Production",
      outcomeSummary: "Flagged three duplicate vendors and reduced approval latency by 18%.",
      success: true,
      decisionQuality: 91,
      latencyMs: 1900,
      costUsd: 0.09,
      safetyScore: 95,
      consistencyScore: 88,
      days: 11,
      hour: 2
    },
    {
      agentId: "agt-risk-ops",
      taskType: "Budget exception",
      environment: "Production",
      outcomeSummary: "Escalated a valid request due to policy drift; human override resolved it in one cycle.",
      success: false,
      decisionQuality: 64,
      latencyMs: 2600,
      costUsd: 0.11,
      safetyScore: 90,
      consistencyScore: 71,
      days: 9,
      hour: 2
    },
    {
      agentId: "agt-risk-ops",
      taskType: "Vendor risk classification",
      environment: "Staging",
      outcomeSummary: "Matched analyst decisions in 93% of sampled classifications.",
      success: true,
      decisionQuality: 89,
      latencyMs: 1700,
      costUsd: 0.08,
      safetyScore: 94,
      consistencyScore: 86,
      days: 6,
      hour: 3
    },
    {
      agentId: "agt-revenue-optimizer",
      taskType: "Pricing recommendation",
      environment: "Production",
      outcomeSummary: "Improved blended close rate by 7.4% in mid-market segment.",
      success: true,
      decisionQuality: 87,
      latencyMs: 2400,
      costUsd: 0.16,
      safetyScore: 84,
      consistencyScore: 82,
      days: 10,
      hour: 4
    },
    {
      agentId: "agt-revenue-optimizer",
      taskType: "Discount approval",
      environment: "Production",
      outcomeSummary: "Prevented over-discounting on a strategic renewal without hurting win probability.",
      success: true,
      decisionQuality: 92,
      latencyMs: 2200,
      costUsd: 0.14,
      safetyScore: 81,
      consistencyScore: 90,
      days: 7,
      hour: 4
    },
    {
      agentId: "agt-revenue-optimizer",
      taskType: "Segment expansion",
      environment: "Sandbox",
      outcomeSummary: "Generated noisy recommendation due to sparse data in a new vertical.",
      success: false,
      decisionQuality: 59,
      latencyMs: 2800,
      costUsd: 0.17,
      safetyScore: 78,
      consistencyScore: 63,
      days: 5,
      hour: 4
    },
    {
      agentId: "agt-support-triage",
      taskType: "Ticket routing",
      environment: "Production",
      outcomeSummary: "Reduced first-response time by 31% while preserving SLA for enterprise customers.",
      success: true,
      decisionQuality: 93,
      latencyMs: 1300,
      costUsd: 0.05,
      safetyScore: 88,
      consistencyScore: 94,
      days: 8,
      hour: 6
    },
    {
      agentId: "agt-support-triage",
      taskType: "Critical incident summarization",
      environment: "Production",
      outcomeSummary: "Produced escalation summary that cut on-call handoff time from 14m to 6m.",
      success: true,
      decisionQuality: 90,
      latencyMs: 1500,
      costUsd: 0.06,
      safetyScore: 90,
      consistencyScore: 91,
      days: 4,
      hour: 6
    },
    {
      agentId: "agt-support-triage",
      taskType: "Abuse complaint triage",
      environment: "Production",
      outcomeSummary: "Missed severity once due to ambiguous language; confidence threshold now adjusted.",
      success: false,
      decisionQuality: 68,
      latencyMs: 1600,
      costUsd: 0.05,
      safetyScore: 86,
      consistencyScore: 72,
      days: 2,
      hour: 6
    },
    {
      agentId: "agt-support-triage",
      taskType: "Queue balancing",
      environment: "Production",
      outcomeSummary: "Balanced queue allocation and lowered backlog growth by 22% week-over-week.",
      success: true,
      decisionQuality: 88,
      latencyMs: 1250,
      costUsd: 0.04,
      safetyScore: 89,
      consistencyScore: 92,
      days: 1,
      hour: 6
    }
  ];

  const metrics: MetricRecord[] = metricTemplates.map((template) => {
    const scored = scoreExecution(template);

    return {
      id: randomUUID(),
      agentId: template.agentId,
      taskType: template.taskType,
      environment: template.environment,
      outcomeSummary: template.outcomeSummary,
      success: template.success,
      decisionQuality: template.decisionQuality,
      latencyMs: template.latencyMs,
      costUsd: template.costUsd,
      safetyScore: template.safetyScore,
      consistencyScore: template.consistencyScore,
      reliabilityScore: scored.breakdown.reliability,
      efficiencyScore: scored.breakdown.efficiency,
      score: scored.totalScore,
      createdAt: daysAgo(template.days, template.hour)
    };
  });

  return {
    agents,
    metrics,
    payments: []
  };
};

const ensureLocalStore = async (): Promise<void> => {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(LOCAL_DATA_FILE);
  } catch {
    const seed = buildSeedStore();
    await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
};

const readLocalStore = async (): Promise<LocalStore> => {
  await ensureLocalStore();
  const raw = await fs.readFile(LOCAL_DATA_FILE, "utf8");
  return JSON.parse(raw) as LocalStore;
};

const writeLocalStore = async (store: LocalStore): Promise<void> => {
  await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(store, null, 2), "utf8");
};

const initPostgres = async (): Promise<void> => {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      owner_team TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS metrics (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      task_type TEXT NOT NULL,
      environment TEXT NOT NULL,
      outcome_summary TEXT NOT NULL,
      success BOOLEAN NOT NULL,
      decision_quality DOUBLE PRECISION NOT NULL,
      latency_ms INTEGER NOT NULL,
      cost_usd DOUBLE PRECISION NOT NULL,
      safety_score DOUBLE PRECISION NOT NULL,
      consistency_score DOUBLE PRECISION NOT NULL,
      reliability_score DOUBLE PRECISION NOT NULL,
      efficiency_score DOUBLE PRECISION NOT NULL,
      score DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_metrics_agent_created_at
      ON metrics(agent_id, created_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      email TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      event_type TEXT NOT NULL,
      provider TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const existing = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM agents;");

  if (Number(existing.rows[0].count) === 0) {
    const seed = buildSeedStore();

    for (const agent of seed.agents) {
      await pool.query(
        `
          INSERT INTO agents (id, name, model, owner_team, description, created_at)
          VALUES ($1, $2, $3, $4, $5, $6);
        `,
        [agent.id, agent.name, agent.model, agent.ownerTeam, agent.description, agent.createdAt]
      );
    }

    for (const metric of seed.metrics) {
      await pool.query(
        `
          INSERT INTO metrics (
            id,
            agent_id,
            task_type,
            environment,
            outcome_summary,
            success,
            decision_quality,
            latency_ms,
            cost_usd,
            safety_score,
            consistency_score,
            reliability_score,
            efficiency_score,
            score,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);
        `,
        [
          metric.id,
          metric.agentId,
          metric.taskType,
          metric.environment,
          metric.outcomeSummary,
          metric.success,
          metric.decisionQuality,
          metric.latencyMs,
          metric.costUsd,
          metric.safetyScore,
          metric.consistencyScore,
          metric.reliabilityScore,
          metric.efficiencyScore,
          metric.score,
          metric.createdAt
        ]
      );
    }
  }
};

export const initDatabase = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = USE_POSTGRES ? initPostgres() : ensureLocalStore();
  }

  await initPromise;
};

export const listAgents = async (): Promise<AgentSummary[]> => {
  await initDatabase();

  if (USE_POSTGRES) {
    const pool = getPool();
    const result = await pool.query(
      `
        SELECT
          a.id,
          a.name,
          a.model,
          a.owner_team,
          a.description,
          a.created_at,
          COUNT(m.id)::int AS runs,
          COALESCE(AVG(CASE WHEN m.success THEN 1 ELSE 0 END) * 100, 0) AS success_rate,
          COALESCE(AVG(m.score), 0) AS average_score,
          COALESCE(AVG(m.reliability_score), 0) AS reliability_score,
          COALESCE(AVG(m.decision_quality), 0) AS decision_quality_score,
          COALESCE(AVG(m.efficiency_score), 0) AS efficiency_score,
          COALESCE(AVG(m.safety_score), 0) AS safety_score,
          COALESCE(AVG(m.consistency_score), 0) AS consistency_score,
          MAX(m.created_at) AS last_run_at
        FROM agents a
        LEFT JOIN metrics m ON m.agent_id = a.id
        GROUP BY a.id
        ORDER BY average_score DESC, runs DESC, a.created_at ASC;
      `
    );

    return result.rows.map((row) => toAgentSummary(row));
  }

  const store = await readLocalStore();

  return store.agents
    .map((agent) => {
      const metrics = store.metrics.filter((metric) => metric.agentId === agent.id);
      const runs = metrics.length;
      const successRate = runs > 0 ? (metrics.filter((metric) => metric.success).length / runs) * 100 : 0;
      const averageScore = runs > 0 ? metrics.reduce((sum, metric) => sum + metric.score, 0) / runs : 0;
      const reliabilityScore =
        runs > 0 ? metrics.reduce((sum, metric) => sum + metric.reliabilityScore, 0) / runs : 0;
      const decisionQualityScore =
        runs > 0 ? metrics.reduce((sum, metric) => sum + metric.decisionQuality, 0) / runs : 0;
      const efficiencyScore =
        runs > 0 ? metrics.reduce((sum, metric) => sum + metric.efficiencyScore, 0) / runs : 0;
      const safetyScore = runs > 0 ? metrics.reduce((sum, metric) => sum + metric.safetyScore, 0) / runs : 0;
      const consistencyScore =
        runs > 0 ? metrics.reduce((sum, metric) => sum + metric.consistencyScore, 0) / runs : 0;
      const lastRunAt =
        runs > 0
          ? metrics
              .slice()
              .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
              .at(-1)?.createdAt ?? null
          : null;

      return {
        ...agent,
        runs,
        successRate: round(successRate),
        averageScore: round(averageScore),
        reliabilityScore: round(reliabilityScore),
        decisionQualityScore: round(decisionQualityScore),
        efficiencyScore: round(efficiencyScore),
        safetyScore: round(safetyScore),
        consistencyScore: round(consistencyScore),
        lastRunAt
      };
    })
    .sort((left, right) => {
      if (right.averageScore !== left.averageScore) {
        return right.averageScore - left.averageScore;
      }

      return right.runs - left.runs;
    });
};

export const getAgentById = async (id: string): Promise<AgentSummary | null> => {
  await initDatabase();

  if (USE_POSTGRES) {
    const pool = getPool();
    const result = await pool.query(
      `
        SELECT
          a.id,
          a.name,
          a.model,
          a.owner_team,
          a.description,
          a.created_at,
          COUNT(m.id)::int AS runs,
          COALESCE(AVG(CASE WHEN m.success THEN 1 ELSE 0 END) * 100, 0) AS success_rate,
          COALESCE(AVG(m.score), 0) AS average_score,
          COALESCE(AVG(m.reliability_score), 0) AS reliability_score,
          COALESCE(AVG(m.decision_quality), 0) AS decision_quality_score,
          COALESCE(AVG(m.efficiency_score), 0) AS efficiency_score,
          COALESCE(AVG(m.safety_score), 0) AS safety_score,
          COALESCE(AVG(m.consistency_score), 0) AS consistency_score,
          MAX(m.created_at) AS last_run_at
        FROM agents a
        LEFT JOIN metrics m ON m.agent_id = a.id
        WHERE a.id = $1
        GROUP BY a.id;
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return toAgentSummary(result.rows[0]);
  }

  const summaries = await listAgents();
  return summaries.find((agent) => agent.id === id) ?? null;
};

export const createAgent = async (input: CreateAgentInput): Promise<AgentRecord> => {
  await initDatabase();

  const agent: AgentRecord = {
    id: randomUUID(),
    name: input.name,
    model: input.model,
    ownerTeam: input.ownerTeam,
    description: input.description,
    createdAt: new Date().toISOString()
  };

  if (USE_POSTGRES) {
    const pool = getPool();

    await pool.query(
      `
        INSERT INTO agents (id, name, model, owner_team, description, created_at)
        VALUES ($1, $2, $3, $4, $5, $6);
      `,
      [agent.id, agent.name, agent.model, agent.ownerTeam, agent.description, agent.createdAt]
    );

    return agent;
  }

  const store = await readLocalStore();
  store.agents.push(agent);
  await writeLocalStore(store);

  return agent;
};

export const listAgentMetrics = async (agentId: string, limit = 60): Promise<MetricRecord[]> => {
  await initDatabase();

  if (USE_POSTGRES) {
    const pool = getPool();
    const result = await pool.query(
      `
        SELECT
          id,
          agent_id,
          task_type,
          environment,
          outcome_summary,
          success,
          decision_quality,
          latency_ms,
          cost_usd,
          safety_score,
          consistency_score,
          reliability_score,
          efficiency_score,
          score,
          created_at
        FROM metrics
        WHERE agent_id = $1
        ORDER BY created_at DESC
        LIMIT $2;
      `,
      [agentId, limit]
    );

    return result.rows.map((row) => toMetricRecord(row)).reverse();
  }

  const store = await readLocalStore();
  const filtered = store.metrics
    .filter((metric) => metric.agentId === agentId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  return filtered.slice(Math.max(filtered.length - limit, 0));
};

export const createMetric = async (input: CreateMetricInput): Promise<MetricRecord> => {
  await initDatabase();

  const metric: MetricRecord = {
    id: randomUUID(),
    agentId: input.agentId,
    taskType: input.taskType,
    environment: input.environment,
    outcomeSummary: input.outcomeSummary,
    success: input.success,
    decisionQuality: round(input.decisionQuality),
    latencyMs: Math.round(input.latencyMs),
    costUsd: round(input.costUsd, 4),
    safetyScore: round(input.safetyScore),
    consistencyScore: round(input.consistencyScore),
    reliabilityScore: round(input.reliabilityScore),
    efficiencyScore: round(input.efficiencyScore),
    score: round(input.score),
    createdAt: input.createdAt ?? new Date().toISOString()
  };

  if (USE_POSTGRES) {
    const pool = getPool();

    await pool.query(
      `
        INSERT INTO metrics (
          id,
          agent_id,
          task_type,
          environment,
          outcome_summary,
          success,
          decision_quality,
          latency_ms,
          cost_usd,
          safety_score,
          consistency_score,
          reliability_score,
          efficiency_score,
          score,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);
      `,
      [
        metric.id,
        metric.agentId,
        metric.taskType,
        metric.environment,
        metric.outcomeSummary,
        metric.success,
        metric.decisionQuality,
        metric.latencyMs,
        metric.costUsd,
        metric.safetyScore,
        metric.consistencyScore,
        metric.reliabilityScore,
        metric.efficiencyScore,
        metric.score,
        metric.createdAt
      ]
    );

    return metric;
  }

  const store = await readLocalStore();
  store.metrics.push(metric);
  await writeLocalStore(store);

  return metric;
};

export const listRecentMetrics = async (limit = 20): Promise<RecentMetric[]> => {
  await initDatabase();

  if (USE_POSTGRES) {
    const pool = getPool();
    const result = await pool.query(
      `
        SELECT
          m.id,
          m.agent_id,
          m.task_type,
          m.environment,
          m.outcome_summary,
          m.success,
          m.decision_quality,
          m.latency_ms,
          m.cost_usd,
          m.safety_score,
          m.consistency_score,
          m.reliability_score,
          m.efficiency_score,
          m.score,
          m.created_at,
          a.name AS agent_name
        FROM metrics m
        JOIN agents a ON a.id = m.agent_id
        ORDER BY m.created_at DESC
        LIMIT $1;
      `,
      [limit]
    );

    return result.rows.map((row) => ({
      ...toMetricRecord(row),
      agentName: String(row.agent_name)
    }));
  }

  const store = await readLocalStore();
  const agents = new Map(store.agents.map((agent) => [agent.id, agent.name]));

  return store.metrics
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
    .map((metric) => ({
      ...metric,
      agentName: agents.get(metric.agentId) ?? "Unknown agent"
    }));
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  await initDatabase();

  if (USE_POSTGRES) {
    const pool = getPool();
    const [agentCountResult, metricAggregateResult, dailyResult, topResult] = await Promise.all([
      pool.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM agents;"),
      pool.query<{ total_runs: string; average_score: string; reliability_index: string }>(`
        SELECT
          COUNT(*)::text AS total_runs,
          COALESCE(AVG(score), 0)::text AS average_score,
          COALESCE(AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100, 0)::text AS reliability_index
        FROM metrics;
      `),
      pool.query<{
        date: Date;
        average_score: string;
        runs: string;
        success_rate: string;
      }>(`
        SELECT
          DATE_TRUNC('day', created_at) AS date,
          AVG(score)::text AS average_score,
          COUNT(*)::text AS runs,
          (AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100)::text AS success_rate
        FROM metrics
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY DATE_TRUNC('day', created_at);
      `),
      pool.query(
        `
          SELECT
            a.id,
            a.name,
            a.model,
            a.owner_team,
            a.description,
            a.created_at,
            COUNT(m.id)::int AS runs,
            COALESCE(AVG(CASE WHEN m.success THEN 1 ELSE 0 END) * 100, 0) AS success_rate,
            COALESCE(AVG(m.score), 0) AS average_score,
            COALESCE(AVG(m.reliability_score), 0) AS reliability_score,
            COALESCE(AVG(m.decision_quality), 0) AS decision_quality_score,
            COALESCE(AVG(m.efficiency_score), 0) AS efficiency_score,
            COALESCE(AVG(m.safety_score), 0) AS safety_score,
            COALESCE(AVG(m.consistency_score), 0) AS consistency_score,
            MAX(m.created_at) AS last_run_at
          FROM agents a
          LEFT JOIN metrics m ON m.agent_id = a.id
          GROUP BY a.id
          ORDER BY average_score DESC, runs DESC
          LIMIT 1;
        `
      )
    ]);

    return {
      totalAgents: Number(agentCountResult.rows[0].total),
      totalRuns: Number(metricAggregateResult.rows[0].total_runs),
      averageScore: round(Number(metricAggregateResult.rows[0].average_score)),
      reliabilityIndex: round(Number(metricAggregateResult.rows[0].reliability_index)),
      topPerformer: topResult.rowCount ? toAgentSummary(topResult.rows[0]) : null,
      dailyPerformance: dailyResult.rows.map((row) => ({
        date: row.date.toISOString().slice(0, 10),
        averageScore: round(Number(row.average_score)),
        runs: Number(row.runs),
        successRate: round(Number(row.success_rate))
      }))
    };
  }

  const store = await readLocalStore();
  const agents = await listAgents();
  const totalRuns = store.metrics.length;
  const successfulRuns = store.metrics.filter((metric) => metric.success).length;

  const byDate = new Map<string, MetricRecord[]>();
  for (const metric of store.metrics) {
    const date = metric.createdAt.slice(0, 10);
    const list = byDate.get(date) ?? [];
    list.push(metric);
    byDate.set(date, list);
  }

  const dailyPerformance = Array.from(byDate.entries())
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .slice(-14)
    .map(([date, metrics]) => ({
      date,
      averageScore: round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length),
      runs: metrics.length,
      successRate: round((metrics.filter((metric) => metric.success).length / metrics.length) * 100)
    }));

  return {
    totalAgents: store.agents.length,
    totalRuns,
    averageScore: round(
      totalRuns > 0 ? store.metrics.reduce((sum, metric) => sum + metric.score, 0) / totalRuns : 0
    ),
    reliabilityIndex: round(totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0),
    topPerformer: agents[0] ?? null,
    dailyPerformance
  };
};

export const upsertPaymentStatus = async (payment: {
  email: string;
  status: "active" | "past_due" | "canceled";
  eventType: string;
  provider: "stripe";
}): Promise<void> => {
  await initDatabase();

  const normalizedEmail = payment.email.trim().toLowerCase();

  if (USE_POSTGRES) {
    const pool = getPool();

    await pool.query(
      `
        INSERT INTO payments (email, status, event_type, provider, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (email)
        DO UPDATE SET
          status = EXCLUDED.status,
          event_type = EXCLUDED.event_type,
          provider = EXCLUDED.provider,
          updated_at = NOW();
      `,
      [normalizedEmail, payment.status, payment.eventType, payment.provider]
    );

    return;
  }

  const store = await readLocalStore();
  const existing = store.payments.find((record) => record.email === normalizedEmail);

  if (existing) {
    existing.status = payment.status;
    existing.eventType = payment.eventType;
    existing.provider = payment.provider;
    existing.updatedAt = new Date().toISOString();
  } else {
    store.payments.push({
      email: normalizedEmail,
      status: payment.status,
      eventType: payment.eventType,
      provider: payment.provider,
      updatedAt: new Date().toISOString()
    });
  }

  await writeLocalStore(store);
};

export const getPaymentStatus = async (email: string): Promise<PaymentRecord | null> => {
  await initDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  if (USE_POSTGRES) {
    const pool = getPool();
    const result = await pool.query(
      `
        SELECT email, status, event_type, provider, updated_at
        FROM payments
        WHERE email = $1
        LIMIT 1;
      `,
      [normalizedEmail]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      email: String(row.email),
      status: String(row.status) as PaymentRecord["status"],
      eventType: String(row.event_type),
      provider: "stripe",
      updatedAt: new Date(String(row.updated_at)).toISOString()
    };
  }

  const store = await readLocalStore();
  return store.payments.find((record) => record.email === normalizedEmail) ?? null;
};

export const hasActivePayment = async (email: string): Promise<boolean> => {
  const payment = await getPaymentStatus(email);

  if (!payment) {
    return false;
  }

  return payment.status === "active";
};
