export default function Page() {
  const faqs = [
    {
      q: "How does agent reputation scoring work?",
      a: "Each agent is scored across task success rate, decision quality, latency, and outcome consistency. Scores update in real-time as agents execute tasks, giving you a live reputation index from 0–100."
    },
    {
      q: "Can I track multiple agents across different environments?",
      a: "Yes. The dashboard supports unlimited agents across staging, production, and custom environments. Filter and compare reputation scores side-by-side before any critical deployment."
    },
    {
      q: "What happens if my agent's reputation drops?",
      a: "You receive instant alerts when an agent's score falls below your defined threshold. Historical breakdowns show exactly which tasks caused the drop so you can retrain or redeploy with confidence."
    }
  ]

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold bg-[#161b22] border border-[#30363d] text-[#58a6ff] uppercase tracking-widest">
          AI Agent Analytics
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
          The Reputation Economy:<br />
          <span className="text-[#58a6ff]">Your Agent's Track Record</span><br />
          Is Your Most Valuable Asset
        </h1>
        <p className="text-lg text-[#8b949e] max-w-2xl mx-auto mb-10">
          Stop guessing which AI agents to trust with critical tasks. Monitor performance history, score decision quality, and deploy with confidence using data-driven reputation analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={process.env.NEXT_PUBLIC_LS_CHECKOUT_URL || "#"}
            className="inline-block px-8 py-3 rounded-lg bg-[#58a6ff] text-[#0d1117] font-bold text-base hover:bg-[#79b8ff] transition-colors"
          >
            Start Tracking — $15/mo
          </a>
          <a
            href="#faq"
            className="inline-block px-8 py-3 rounded-lg border border-[#30363d] text-[#c9d1d9] font-medium text-base hover:border-[#58a6ff] hover:text-[#58a6ff] transition-colors"
          >
            Learn More
          </a>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { label: "Agents Tracked", value: "10,000+" },
            { label: "Avg Score Accuracy", value: "97.4%" },
            { label: "Deployments Saved", value: "3,200+" }
          ].map((stat) => (
            <div key={stat.label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <div className="text-2xl font-bold text-[#58a6ff]">{stat.value}</div>
              <div className="text-xs text-[#8b949e] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-md mx-auto px-6 pb-20">
        <div className="bg-[#161b22] border border-[#58a6ff] rounded-2xl p-8 text-center shadow-lg shadow-[#58a6ff]/10">
          <div className="text-xs font-semibold text-[#58a6ff] uppercase tracking-widest mb-2">Pro Plan</div>
          <div className="text-5xl font-bold text-white mb-1">$15<span className="text-xl font-normal text-[#8b949e]">/mo</span></div>
          <p className="text-[#8b949e] text-sm mb-8">Everything you need to build trust in your AI agents</p>
          <ul className="text-left space-y-3 mb-8">
            {[
              "Unlimited agent reputation profiles",
              "Real-time performance scoring (0–100)",
              "Decision quality & outcome analytics",
              "Multi-environment tracking",
              "Instant drop alerts & notifications",
              "Historical audit trail & exports"
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <span className="text-[#58a6ff] font-bold mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <a
            href={process.env.NEXT_PUBLIC_LS_CHECKOUT_URL || "#"}
            className="block w-full py-3 rounded-lg bg-[#58a6ff] text-[#0d1117] font-bold text-base hover:bg-[#79b8ff] transition-colors"
          >
            Get Started Now
          </a>
          <p className="text-xs text-[#8b949e] mt-4">Cancel anytime. No contracts.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-[#8b949e] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#21262d] text-center py-8 text-xs text-[#8b949e]">
        © {new Date().getFullYear()} Reputation Economy. All rights reserved.
      </footer>
    </main>
  )
}
