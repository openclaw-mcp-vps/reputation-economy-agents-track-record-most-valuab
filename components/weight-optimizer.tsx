"use client";

import { useMemo, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { AgentSummary } from "@/lib/database";

type WeightState = {
  reliability: number;
  decisionQuality: number;
  efficiency: number;
  safety: number;
  consistency: number;
};

const presets: Record<string, WeightState> = {
  balanced: {
    reliability: 30,
    decisionQuality: 25,
    efficiency: 15,
    safety: 20,
    consistency: 10
  },
  riskSensitive: {
    reliability: 34,
    decisionQuality: 20,
    efficiency: 10,
    safety: 28,
    consistency: 8
  },
  speedFocused: {
    reliability: 25,
    decisionQuality: 18,
    efficiency: 30,
    safety: 17,
    consistency: 10
  }
};

const labels: Array<{ key: keyof WeightState; label: string }> = [
  { key: "reliability", label: "Reliability" },
  { key: "decisionQuality", label: "Decision quality" },
  { key: "efficiency", label: "Efficiency" },
  { key: "safety", label: "Safety" },
  { key: "consistency", label: "Consistency" }
];

export function WeightOptimizer({ agents }: { agents: AgentSummary[] }) {
  const [preset, setPreset] = useState("balanced");
  const [weights, setWeights] = useState<WeightState>(presets.balanced);

  const total =
    weights.reliability +
    weights.decisionQuality +
    weights.efficiency +
    weights.safety +
    weights.consistency;

  const normalized = {
    reliability: weights.reliability / total,
    decisionQuality: weights.decisionQuality / total,
    efficiency: weights.efficiency / total,
    safety: weights.safety / total,
    consistency: weights.consistency / total
  };

  const ranked = useMemo(() => {
    return agents
      .map((agent) => {
        const recalculated =
          agent.reliabilityScore * normalized.reliability +
          agent.decisionQualityScore * normalized.decisionQuality +
          agent.efficiencyScore * normalized.efficiency +
          agent.safetyScore * normalized.safety +
          agent.consistencyScore * normalized.consistency;

        return {
          id: agent.id,
          name: agent.name,
          adjustedScore: Number(recalculated.toFixed(2)),
          baseline: agent.averageScore
        };
      })
      .sort((left, right) => right.adjustedScore - left.adjustedScore)
      .slice(0, 5);
  }, [agents, normalized]);

  return (
    <section className="surface-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Custom scoring weights</h3>
          <p className="mt-1 text-xs text-[#95a0ac]">Change weighting priorities and instantly re-rank top agents.</p>
        </div>
        <Select.Root
          value={preset}
          onValueChange={(value) => {
            setPreset(value);
            setWeights(presets[value]);
          }}
        >
          <Select.Trigger className="inline-flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#0b1320] px-3 py-2 text-xs text-[#dbe3ec]">
            <Select.Value placeholder="Select profile" />
            <Select.Icon>
              <ChevronDown className="h-3.5 w-3.5" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-50 overflow-hidden rounded-lg border border-[#30363d] bg-[#0f172a] text-sm text-[#dbe3ec]">
              <Select.Viewport className="p-1">
                <Select.Item value="balanced" className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-xs outline-none data-[highlighted]:bg-cyan-500/20">
                  <Select.ItemIndicator className="absolute left-2">
                    <Check className="h-3.5 w-3.5" />
                  </Select.ItemIndicator>
                  <Select.ItemText>Balanced</Select.ItemText>
                </Select.Item>
                <Select.Item value="riskSensitive" className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-xs outline-none data-[highlighted]:bg-cyan-500/20">
                  <Select.ItemIndicator className="absolute left-2">
                    <Check className="h-3.5 w-3.5" />
                  </Select.ItemIndicator>
                  <Select.ItemText>Risk-sensitive</Select.ItemText>
                </Select.Item>
                <Select.Item value="speedFocused" className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-xs outline-none data-[highlighted]:bg-cyan-500/20">
                  <Select.ItemIndicator className="absolute left-2">
                    <Check className="h-3.5 w-3.5" />
                  </Select.ItemIndicator>
                  <Select.ItemText>Speed-focused</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {labels.map(({ key, label }) => (
          <label key={key} className="block rounded-xl border border-[#263244] bg-[#0f172a]/70 p-3">
            <div className="flex items-center justify-between text-xs text-[#a6b0bd]">
              <span>{label}</span>
              <span>{weights[key]}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              value={weights[key]}
              onChange={(event) => {
                const next = Number(event.target.value);
                setPreset("custom");
                setWeights((current) => ({
                  ...current,
                  [key]: next
                }));
              }}
              className="mt-3 w-full accent-cyan-400"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-[#263244]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0f172a] text-xs uppercase tracking-[0.08em] text-[#8f99a5]">
            <tr>
              <th className="px-3 py-2">Agent</th>
              <th className="px-3 py-2">Adjusted score</th>
              <th className="px-3 py-2">Baseline score</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((agent) => (
              <tr key={agent.id} className="border-t border-[#263244]">
                <td className="px-3 py-2 text-[#dbe3ec]">{agent.name}</td>
                <td className="px-3 py-2 text-cyan-300">{agent.adjustedScore}</td>
                <td className="px-3 py-2 text-[#96a1ae]">{agent.baseline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
