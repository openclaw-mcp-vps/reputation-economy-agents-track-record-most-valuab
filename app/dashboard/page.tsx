import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Gauge, Trophy } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { PerformanceChart } from "@/components/performance-chart";
import { WeightOptimizer } from "@/components/weight-optimizer";
import { getDashboardStats, listAgents, listRecentMetrics } from "@/lib/database";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

export default async function DashboardPage() {
  const [stats, agents, recentRuns] = await Promise.all([
    getDashboardStats(),
    listAgents(),
    listRecentMetrics(8)
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-14 pt-8 sm:px-8 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Protected Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Agent reputation dashboard</h1>
          <p className="mt-2 text-sm text-[#9ca7b4]">
            Compare agents by real performance history before scaling high-impact decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#052d35] transition hover:bg-cyan-300"
          >
            Manage agents
            <ArrowRight className="h-4 w-4" />
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="surface-card rounded-2xl p-5">
          <Bot className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#8f99a5]">Agents tracked</p>
          <p className="mt-1 text-2xl font-semibold">{stats.totalAgents}</p>
        </article>
        <article className="surface-card rounded-2xl p-5">
          <Gauge className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#8f99a5]">Average score</p>
          <p className="mt-1 text-2xl font-semibold">{stats.averageScore}</p>
        </article>
        <article className="surface-card rounded-2xl p-5">
          <CheckCircle2 className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#8f99a5]">Reliability index</p>
          <p className="mt-1 text-2xl font-semibold">{stats.reliabilityIndex}%</p>
        </article>
        <article className="surface-card rounded-2xl p-5">
          <Trophy className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-xs uppercase tracking-[0.1em] text-[#8f99a5]">Top performer</p>
          <p className="mt-1 text-base font-semibold">{stats.topPerformer?.name ?? "No data"}</p>
          <p className="mt-1 text-sm text-[#9ca7b4]">{stats.topPerformer ? `${stats.topPerformer.averageScore} score` : ""}</p>
        </article>
      </section>

      <section className="mt-7 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <PerformanceChart data={stats.dailyPerformance} />
        <article className="surface-card rounded-2xl p-5">
          <h2 className="text-base font-semibold text-white">Recent execution runs</h2>
          <div className="mt-4 space-y-3">
            {recentRuns.map((run) => (
              <div key={run.id} className="rounded-xl border border-[#263244] bg-[#0f172a]/40 p-3">
                <p className="text-sm font-medium text-[#dce3eb]">{run.agentName}</p>
                <p className="mt-1 text-xs text-[#9ca7b4]">
                  {run.taskType} · {run.environment} · {dateFormatter.format(new Date(run.createdAt))}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={run.success ? "text-emerald-300" : "text-rose-300"}>
                    {run.success ? "Successful" : "Escalated"}
                  </span>
                  <span className="text-cyan-300">Score {run.score}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-7">
        <WeightOptimizer agents={agents} />
      </section>
    </main>
  );
}
