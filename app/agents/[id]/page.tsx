import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Cpu, ShieldCheck, Target } from "lucide-react";
import { PerformanceChart } from "@/components/performance-chart";
import { RunLogForm } from "@/components/run-log-form";
import { getAgentById, listAgentMetrics } from "@/lib/database";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

export default async function AgentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) {
    notFound();
  }

  const metrics = await listAgentMetrics(agent.id, 90);
  const chartData = metrics.map((metric) => ({
    date: metric.createdAt.slice(5, 10),
    averageScore: metric.score,
    successRate: metric.success ? 100 : 0
  }));

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-14 pt-8 sm:px-8 lg:px-10">
      <header>
        <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" />
          Back to all agents
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-3xl font-semibold text-white">{agent.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#9ca7b4]">{agent.description}</p>
          </div>
          <div className="rounded-xl border border-[#2a3748] bg-[#0f172a]/60 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8f99a5]">Composite score</p>
            <p className="mt-1 text-2xl font-semibold text-cyan-200">{agent.averageScore}</p>
          </div>
        </div>
      </header>

      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="surface-card rounded-2xl p-5">
          <Cpu className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#8f99a5]">Model stack</p>
          <p className="mt-1 text-base font-semibold">{agent.model}</p>
        </article>
        <article className="surface-card rounded-2xl p-5">
          <Target className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#8f99a5]">Success rate</p>
          <p className="mt-1 text-base font-semibold">{agent.successRate}%</p>
        </article>
        <article className="surface-card rounded-2xl p-5">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#8f99a5]">Safety average</p>
          <p className="mt-1 text-base font-semibold">{agent.safetyScore}</p>
        </article>
        <article className="surface-card rounded-2xl p-5">
          <Clock3 className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#8f99a5]">Total runs</p>
          <p className="mt-1 text-base font-semibold">{agent.runs}</p>
        </article>
      </section>

      <section className="mt-7">
        <PerformanceChart
          data={chartData}
          scoreLabel="Per-run reputation score"
          successLabel="Run success signal"
        />
      </section>

      <section className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <article className="surface-card overflow-hidden rounded-2xl">
          <h2 className="border-b border-[#263244] px-5 py-4 text-base font-semibold text-white">Recent run log</h2>
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f172a] text-xs uppercase tracking-[0.08em] text-[#8f99a5]">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Environment</th>
                  <th className="px-4 py-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {metrics
                  .slice()
                  .reverse()
                  .map((metric) => (
                    <tr key={metric.id} className="border-t border-[#263244]">
                      <td className="px-4 py-3 text-xs text-[#9aa6b2]">{dateFormatter.format(new Date(metric.createdAt))}</td>
                      <td className="px-4 py-3 text-[#dbe3ec]">{metric.taskType}</td>
                      <td className="px-4 py-3 text-[#9aa6b2]">{metric.environment}</td>
                      <td className="px-4 py-3 text-cyan-300">{metric.score}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-4">
          <RunLogForm agentId={agent.id} />

          <article className="surface-card rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white">Ingestion API</h2>
            <p className="mt-2 text-sm text-[#9aa6b2]">
              Post agent run outcomes from your orchestration layer to keep scoring current in near real-time.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-[#263244] bg-[#0f172a] p-3 text-xs text-[#cdd5df]">
{`curl -X POST "$APP_URL/api/agents/${agent.id}/metrics" \\
  -H "Content-Type: application/json" \\
  -H "x-ingest-key: $INGEST_API_KEY" \\
  -d '{
    "taskType": "Invoice dispute resolution",
    "environment": "Production",
    "success": true,
    "decisionQuality": 91,
    "latencyMs": 1400,
    "costUsd": 0.06,
    "safetyScore": 93,
    "consistencyScore": 88,
    "outcomeSummary": "Resolved in one step with no escalation"
  }'`}
            </pre>
          </article>
        </div>
      </section>
    </main>
  );
}
