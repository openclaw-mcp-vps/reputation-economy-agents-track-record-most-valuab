import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { scoreToGrade } from "@/lib/scoring-algorithm";
import type { AgentSummary } from "@/lib/database";

export function AgentScoreCard({ agent }: { agent: AgentSummary }) {
  const grade = scoreToGrade(agent.averageScore);

  return (
    <article className="surface-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#8f99a5]">
            {agent.model} · {agent.ownerTeam}
          </p>
        </div>
        <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
          Grade {grade}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#9da8b4]">{agent.description}</p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-[#8f99a5]">Composite</p>
          <p className="mt-1 text-base font-semibold text-white">{agent.averageScore}</p>
        </div>
        <div>
          <p className="text-xs text-[#8f99a5]">Success rate</p>
          <p className="mt-1 text-base font-semibold text-white">{agent.successRate}%</p>
        </div>
        <div>
          <p className="text-xs text-[#8f99a5]">Runs</p>
          <p className="mt-1 text-base font-semibold text-white">{agent.runs}</p>
        </div>
      </div>

      <Link
        href={`/agents/${agent.id}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-200 transition hover:text-cyan-100"
      >
        View full track record
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
