import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AgentList } from "@/components/agent-list";
import { CreateAgentDialog } from "@/components/create-agent-dialog";
import { listAgents } from "@/lib/database";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await listAgents();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-14 pt-8 sm:px-8 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">Tracked AI agents</h1>
          <p className="mt-2 text-sm text-[#9ca7b4]">
            Register agents, compare reliability profiles, and inspect full run histories by environment.
          </p>
        </div>
        <CreateAgentDialog />
      </header>

      <section className="mt-7">
        <AgentList agents={agents} />
      </section>
    </main>
  );
}
