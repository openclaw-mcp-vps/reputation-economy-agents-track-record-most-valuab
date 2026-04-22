"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type ChartDatum = {
  date: string;
  averageScore: number;
  successRate: number;
  runs?: number;
};

export function PerformanceChart({
  data,
  scoreLabel = "Composite score",
  successLabel = "Success rate"
}: {
  data: ChartDatum[];
  scoreLabel?: string;
  successLabel?: string;
}) {
  return (
    <div className="surface-card h-[320px] w-full rounded-2xl p-4 sm:p-5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(139, 148, 158, 0.2)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(value: string) => value.slice(5)}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            stroke="#67e8f9"
            tick={{ fill: "#67e8f9", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.75rem",
              color: "#e2e8f0"
            }}
          />
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="averageScore"
            name={scoreLabel}
            stroke="#22d3ee"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: "#22d3ee" }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="successRate"
            name={successLabel}
            stroke="#38bdf8"
            strokeDasharray="6 4"
            strokeWidth={2}
            dot={{ r: 2, strokeWidth: 0, fill: "#38bdf8" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
