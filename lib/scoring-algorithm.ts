export type ScoreWeights = {
  reliability: number;
  decisionQuality: number;
  efficiency: number;
  safety: number;
  consistency: number;
};

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  reliability: 0.3,
  decisionQuality: 0.25,
  efficiency: 0.15,
  safety: 0.2,
  consistency: 0.1
};

export type ExecutionMetricInput = {
  success: boolean;
  decisionQuality: number;
  latencyMs: number;
  costUsd: number;
  safetyScore: number;
  consistencyScore: number;
};

export type ScoreBreakdown = {
  reliability: number;
  decisionQuality: number;
  efficiency: number;
  safety: number;
  consistency: number;
};

export type ScoredExecution = {
  totalScore: number;
  grade: string;
  breakdown: ScoreBreakdown;
  normalizedWeights: ScoreWeights;
};

const clamp = (value: number, minimum: number, maximum: number): number => {
  if (value < minimum) {
    return minimum;
  }

  if (value > maximum) {
    return maximum;
  }

  return value;
};

const toFixedNumber = (value: number, precision = 2): number => {
  return Number(value.toFixed(precision));
};

export const normalizeWeights = (weights?: Partial<ScoreWeights>): ScoreWeights => {
  const merged: ScoreWeights = {
    ...DEFAULT_SCORE_WEIGHTS,
    ...weights
  };

  const safeValues: ScoreWeights = {
    reliability: clamp(merged.reliability, 0, 1),
    decisionQuality: clamp(merged.decisionQuality, 0, 1),
    efficiency: clamp(merged.efficiency, 0, 1),
    safety: clamp(merged.safety, 0, 1),
    consistency: clamp(merged.consistency, 0, 1)
  };

  const total =
    safeValues.reliability +
    safeValues.decisionQuality +
    safeValues.efficiency +
    safeValues.safety +
    safeValues.consistency;

  if (total === 0) {
    return DEFAULT_SCORE_WEIGHTS;
  }

  return {
    reliability: safeValues.reliability / total,
    decisionQuality: safeValues.decisionQuality / total,
    efficiency: safeValues.efficiency / total,
    safety: safeValues.safety / total,
    consistency: safeValues.consistency / total
  };
};

const calculateReliabilityScore = ({
  success,
  decisionQuality,
  safetyScore,
  consistencyScore
}: Pick<ExecutionMetricInput, "success" | "decisionQuality" | "safetyScore" | "consistencyScore">): number => {
  const outcomeFloor = success ? 72 : 26;
  const qualityContribution = decisionQuality * 0.14;
  const safetyContribution = safetyScore * 0.08;
  const consistencyContribution = consistencyScore * 0.06;

  return clamp(outcomeFloor + qualityContribution + safetyContribution + consistencyContribution, 0, 100);
};

const calculateEfficiencyScore = ({ latencyMs, costUsd }: Pick<ExecutionMetricInput, "latencyMs" | "costUsd">): number => {
  const latencyScore = clamp(100 - (latencyMs / 8_000) * 100, 0, 100);
  const costScore = clamp(100 - (costUsd / 0.5) * 100, 0, 100);

  return clamp(latencyScore * 0.65 + costScore * 0.35, 0, 100);
};

export const scoreToGrade = (score: number): string => {
  if (score >= 95) {
    return "A+";
  }

  if (score >= 90) {
    return "A";
  }

  if (score >= 85) {
    return "A-";
  }

  if (score >= 80) {
    return "B+";
  }

  if (score >= 75) {
    return "B";
  }

  if (score >= 70) {
    return "B-";
  }

  if (score >= 65) {
    return "C+";
  }

  if (score >= 60) {
    return "C";
  }

  return "D";
};

export const scoreExecution = (
  metric: ExecutionMetricInput,
  customWeights?: Partial<ScoreWeights>
): ScoredExecution => {
  const breakdown: ScoreBreakdown = {
    reliability: calculateReliabilityScore(metric),
    decisionQuality: clamp(metric.decisionQuality, 0, 100),
    efficiency: calculateEfficiencyScore(metric),
    safety: clamp(metric.safetyScore, 0, 100),
    consistency: clamp(metric.consistencyScore, 0, 100)
  };

  const weights = normalizeWeights(customWeights);
  const totalScore =
    breakdown.reliability * weights.reliability +
    breakdown.decisionQuality * weights.decisionQuality +
    breakdown.efficiency * weights.efficiency +
    breakdown.safety * weights.safety +
    breakdown.consistency * weights.consistency;

  const roundedScore = toFixedNumber(totalScore, 2);

  return {
    totalScore: roundedScore,
    grade: scoreToGrade(roundedScore),
    breakdown: {
      reliability: toFixedNumber(breakdown.reliability, 2),
      decisionQuality: toFixedNumber(breakdown.decisionQuality, 2),
      efficiency: toFixedNumber(breakdown.efficiency, 2),
      safety: toFixedNumber(breakdown.safety, 2),
      consistency: toFixedNumber(breakdown.consistency, 2)
    },
    normalizedWeights: {
      reliability: toFixedNumber(weights.reliability, 4),
      decisionQuality: toFixedNumber(weights.decisionQuality, 4),
      efficiency: toFixedNumber(weights.efficiency, 4),
      safety: toFixedNumber(weights.safety, 4),
      consistency: toFixedNumber(weights.consistency, 4)
    }
  };
};

export type AgentMetricForAggregation = ExecutionMetricInput & {
  score?: number;
  createdAt?: string;
};

export const aggregateAgentScore = (
  metrics: AgentMetricForAggregation[],
  customWeights?: Partial<ScoreWeights>
): {
  averageScore: number;
  grade: string;
  trend: "up" | "down" | "stable";
} => {
  if (metrics.length === 0) {
    return {
      averageScore: 0,
      grade: "N/A",
      trend: "stable"
    };
  }

  const scoredRuns = metrics.map((metric) => {
    if (typeof metric.score === "number") {
      return metric.score;
    }

    return scoreExecution(metric, customWeights).totalScore;
  });

  const averageScore = scoredRuns.reduce((sum, value) => sum + value, 0) / scoredRuns.length;
  const recent = scoredRuns.slice(-5);
  const baseline = scoredRuns.slice(Math.max(scoredRuns.length - 10, 0), -5);
  const recentAverage = recent.reduce((sum, value) => sum + value, 0) / Math.max(recent.length, 1);
  const baselineAverage =
    baseline.length > 0
      ? baseline.reduce((sum, value) => sum + value, 0) / baseline.length
      : recentAverage;

  const delta = recentAverage - baselineAverage;

  return {
    averageScore: toFixedNumber(averageScore, 2),
    grade: scoreToGrade(averageScore),
    trend: delta > 1.5 ? "up" : delta < -1.5 ? "down" : "stable"
  };
};
