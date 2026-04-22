"use client";

import { useState } from "react";

type RunLogFormProps = {
  agentId: string;
};

export function RunLogForm({ agentId }: RunLogFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    taskType: "",
    environment: "Production",
    success: "true",
    decisionQuality: "85",
    latencyMs: "1500",
    costUsd: "0.08",
    safetyScore: "90",
    consistencyScore: "85",
    outcomeSummary: ""
  });

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/agents/${agentId}/metrics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          taskType: form.taskType,
          environment: form.environment,
          success: form.success === "true",
          decisionQuality: Number(form.decisionQuality),
          latencyMs: Number(form.latencyMs),
          costUsd: Number(form.costUsd),
          safetyScore: Number(form.safetyScore),
          consistencyScore: Number(form.consistencyScore),
          outcomeSummary: form.outcomeSummary
        })
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(payload.message ?? "Unable to ingest run.");
        return;
      }

      setMessage("Run ingested successfully. Refreshing...");
      window.location.reload();
    } catch {
      setMessage("Network error while sending run data.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="surface-card rounded-2xl p-5">
      <h3 className="text-base font-semibold text-white">Log a new execution run</h3>
      <p className="mt-1 text-xs text-[#9ca7b4]">Use this form for manual entries or validation tests before API automation.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          required
          value={form.taskType}
          onChange={(event) => onChange("taskType", event.target.value)}
          placeholder="Task type"
          className="rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
        />
        <input
          required
          value={form.environment}
          onChange={(event) => onChange("environment", event.target.value)}
          placeholder="Environment"
          className="rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
        />

        <select
          value={form.success}
          onChange={(event) => onChange("success", event.target.value)}
          className="rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
        >
          <option value="true">Success</option>
          <option value="false">Failed or escalated</option>
        </select>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          required
          value={form.decisionQuality}
          onChange={(event) => onChange("decisionQuality", event.target.value)}
          placeholder="Decision quality (0-100)"
          className="rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          step={1}
          required
          value={form.latencyMs}
          onChange={(event) => onChange("latencyMs", event.target.value)}
          placeholder="Latency (ms)"
          className="rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          step={0.0001}
          required
          value={form.costUsd}
          onChange={(event) => onChange("costUsd", event.target.value)}
          placeholder="Cost (USD)"
          className="rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          required
          value={form.safetyScore}
          onChange={(event) => onChange("safetyScore", event.target.value)}
          placeholder="Safety score (0-100)"
          className="rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          required
          value={form.consistencyScore}
          onChange={(event) => onChange("consistencyScore", event.target.value)}
          placeholder="Consistency score (0-100)"
          className="rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
        />
      </div>

      <textarea
        required
        value={form.outcomeSummary}
        onChange={(event) => onChange("outcomeSummary", event.target.value)}
        placeholder="Summarize what happened and business impact"
        rows={4}
        className="mt-3 w-full rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#052d35] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Submitting..." : "Submit run"}
        </button>
        {message ? <p className="text-sm text-[#9fc4cf]">{message}</p> : null}
      </div>
    </form>
  );
}
