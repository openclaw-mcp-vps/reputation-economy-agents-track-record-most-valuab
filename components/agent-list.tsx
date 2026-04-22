import type { AgentSummary } from "@/lib/database";
import { AgentScoreCard } from "@/components/agent-score-card";

export function AgentList({ agents }: { agents: AgentSummary[] }) {
  if (agents.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center text-sm text-[#9aa4b0]">
        No agents tracked yet. Add your first agent and ingest a few runs to start scoring.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <AgentScoreCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
