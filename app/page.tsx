import Link from "next/link";
import { Activity, ArrowRight, Shield, TrendingUp, Zap } from "lucide-react";

const faqItems = [
  {
    question: "What does the score actually represent?",
    answer:
      "Each score combines reliability, decision quality, efficiency, safety, and consistency into one normalized benchmark. You can change weight profiles to reflect your risk posture."
  },
  {
    question: "Can we ingest production execution logs automatically?",
    answer:
      "Yes. The API accepts per-run metric payloads with task type, environment, outcomes, and timing. Your team can stream these from orchestrators, eval pipelines, or internal tools."
  },
  {
    question: "How fast can a mid-stage company get value?",
    answer:
      "Most teams get useful ranking data in under one sprint by importing the last 2 to 4 weeks of runs and then feeding live traffic continuously."
  },
  {
    question: "Who is this built for?",
    answer:
      "AI product managers and CTOs scaling multiple agents across customer workflows, finance ops, support, and growth decisions where reliability directly impacts revenue and risk."
  }
];

const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

export default function HomePage() {
  return (
    <main className="grid-pattern">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-8 sm:px-8 lg:px-10">
        <header className="mb-16 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Agent Intelligence Platform</p>
            <h1 className="mt-2 text-xl font-semibold">Agent Reputation</h1>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-[#9da6b2]">
            <a href="#problem" className="transition hover:text-white">
              Problem
            </a>
            <a href="#solution" className="transition hover:text-white">
              Solution
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </nav>
        </header>

        <section className="surface-card relative overflow-hidden rounded-3xl px-7 py-10 sm:px-10 sm:py-14">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">The Reputation Economy</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
            Why Your Agent&apos;s Track Record Is Your Most Valuable Asset
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#a7b0bb] sm:text-lg">
            Deploying AI agents without performance history is operational blindfolding. Agent Reputation measures every run,
            scores decision quality, and surfaces which agents are trustworthy enough for high-stakes business decisions.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={stripePaymentLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#052d35] transition hover:bg-cyan-300"
            >
              Start for $15/month
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/unlock"
              className="inline-flex items-center gap-2 rounded-xl border border-[#30363d] px-5 py-3 text-sm font-medium text-[#dbe2ea] transition hover:border-cyan-300 hover:text-white"
            >
              I already purchased
            </Link>
          </div>
        </section>

        <section id="problem" className="mt-16">
          <h3 className="text-2xl font-semibold">The Blind Spot in AI Deployments</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="surface-card rounded-2xl p-6">
              <Shield className="h-5 w-5 text-cyan-300" />
              <h4 className="mt-4 text-lg font-semibold">No reliability baseline</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#9fa9b5]">
                Teams promote agents into critical workflows without hard evidence of long-term consistency.
              </p>
            </article>
            <article className="surface-card rounded-2xl p-6">
              <TrendingUp className="h-5 w-5 text-cyan-300" />
              <h4 className="mt-4 text-lg font-semibold">Outcome quality is fragmented</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#9fa9b5]">
                Metrics are spread across logs, dashboards, and anecdotal reports, making agent comparisons subjective.
              </p>
            </article>
            <article className="surface-card rounded-2xl p-6">
              <Zap className="h-5 w-5 text-cyan-300" />
              <h4 className="mt-4 text-lg font-semibold">Scaling multiplies risk</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#9fa9b5]">
                As more agents automate decisions, one underperforming model can create expensive operational drift.
              </p>
            </article>
          </div>
        </section>

        <section id="solution" className="mt-16">
          <h3 className="text-2xl font-semibold">A Practical Reputation Layer for AI Agents</h3>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="surface-card rounded-2xl p-6">
              <Activity className="h-5 w-5 text-cyan-300" />
              <h4 className="mt-4 text-lg font-semibold">Multi-dimensional scoring</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#9fa9b5]">
                Every run is scored on reliability, decision quality, efficiency, safety, and consistency. Use weighted profiles
                for finance-critical workflows, customer-facing support, or speed-heavy growth operations.
              </p>
            </article>
            <article className="surface-card rounded-2xl p-6">
              <TrendingUp className="h-5 w-5 text-cyan-300" />
              <h4 className="mt-4 text-lg font-semibold">Historical performance intelligence</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#9fa9b5]">
                See trendlines, compare agents by environment, and identify when performance decay starts before it becomes
                production impact.
              </p>
            </article>
          </div>
        </section>

        <section id="pricing" className="mt-16">
          <h3 className="text-2xl font-semibold">Pricing</h3>
          <article className="surface-card mt-6 rounded-2xl p-7 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Single plan</p>
            <h4 className="mt-2 text-3xl font-semibold">
              $15<span className="text-base font-medium text-[#8f98a4]">/month</span>
            </h4>
            <p className="mt-3 max-w-2xl text-sm text-[#9fa9b5]">
              Full access to the dashboard, agent scoring engine, ingestion APIs, and weighted decision profiles for your team.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#cad2dc]">
              <span className="rounded-full border border-[#30363d] px-3 py-1">Unlimited agents</span>
              <span className="rounded-full border border-[#30363d] px-3 py-1">API ingestion endpoints</span>
              <span className="rounded-full border border-[#30363d] px-3 py-1">Real-time scoring analytics</span>
            </div>
            <a
              href={stripePaymentLink}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#052d35] transition hover:bg-cyan-300"
            >
              Buy with Stripe Checkout
              <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        </section>

        <section id="faq" className="mt-16">
          <h3 className="text-2xl font-semibold">FAQ</h3>
          <div className="mt-6 space-y-3">
            {faqItems.map((item) => (
              <article key={item.question} className="surface-card rounded-2xl p-6">
                <h4 className="text-base font-semibold">{item.question}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#9fa9b5]">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
