# Build Task: reputation-economy-agents-track-record-most-valuab

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: reputation-economy-agents-track-record-most-valuab
HEADLINE: The Reputation Economy: Why Your Agent's Track Record Is Your Most Valuable Asset
WHAT: A reputation tracking system that monitors and scores AI agents based on their performance history, decision quality, and outcomes across different tasks and environments.
WHY: As AI agents handle more critical business decisions, there's no standardized way to evaluate their reliability or track record. Companies are deploying agents blindly without knowing which ones consistently deliver results.
WHO PAYS: AI product managers and CTOs at mid-stage companies (50-500 employees) who are scaling AI agent deployments and need data-driven ways to evaluate agent performance before critical implementations.
NICHE: ai-agents
PRICE: $$15/mo

ARCHITECTURE SPEC:
A Next.js application with a dashboard for tracking AI agent performance metrics, integrated scoring algorithms, and historical analytics. Uses PostgreSQL for storing agent execution data and performance scores, with real-time monitoring capabilities.

PLANNED FILES:
- app/page.tsx
- app/dashboard/page.tsx
- app/agents/page.tsx
- app/api/agents/route.ts
- app/api/metrics/route.ts
- app/api/webhooks/lemonsqueezy/route.ts
- components/agent-card.tsx
- components/performance-chart.tsx
- components/reputation-score.tsx
- lib/scoring-engine.ts
- lib/database.ts
- lib/lemonsqueezy.ts
- prisma/schema.prisma

DEPENDENCIES: next, react, tailwindcss, prisma, @prisma/client, recharts, @lemonsqueezy/lemonsqueezy.js, lucide-react, clsx, zod, next-auth

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.


PREVIOUS ATTEMPT FAILED WITH:
Codex exited -9: Reading additional input from stdin...
OpenAI Codex v0.121.0 (research preview)
--------
workdir: /tmp/openclaw-builds/reputation-economy-agents-track-record-most-valuab
model: gpt-5.3-codex
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: xhigh
reasoning summaries: none
session id: 019da792-3b69-7f82-9b69-aa49ba7c3605
--------
user
# Build Task: reputation-economy-agents-track-record-most-valuab

Build a complete, production-ready Next.js 15 App Router application.
Please fix the above errors and regenerate.