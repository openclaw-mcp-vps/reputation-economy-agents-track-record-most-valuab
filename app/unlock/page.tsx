import Link from "next/link";
import { UnlockForm } from "@/components/unlock-form";

export default async function UnlockPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams.next?.startsWith("/")
    ? resolvedSearchParams.next
    : "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-14 sm:px-8">
      <section className="surface-card w-full rounded-3xl p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Access Verification</p>
        <h1 className="mt-3 text-3xl font-semibold">Unlock your reputation dashboard</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9ca6b2]">
          Complete checkout with Stripe, then verify using the same billing email. Once verified, this browser receives a
          secure access cookie for the protected dashboard and agent analytics.
        </p>

        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-[#c8d1dc]">
          <li>Purchase with Stripe on the pricing section.</li>
          <li>Wait for webhook confirmation (usually a few seconds).</li>
          <li>Enter your billing email to activate access.</li>
        </ol>

        <div className="mt-7">
          <UnlockForm nextPath={nextPath} />
        </div>

        <div className="mt-6 text-sm text-[#97a1ad]">
          Need to review plan details first?{" "}
          <Link href="/" className="text-cyan-300 underline underline-offset-4">
            Back to landing page
          </Link>
        </div>
      </section>
    </main>
  );
}
