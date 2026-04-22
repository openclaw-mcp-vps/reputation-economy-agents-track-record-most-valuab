import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12 sm:px-8">
      <section className="surface-card w-full rounded-2xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Not Found</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">This agent page does not exist</h1>
        <p className="mt-3 text-sm text-[#97a3af]">
          The agent may have been removed or the URL is incorrect.
        </p>
        <Link
          href="/agents"
          className="mt-6 inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#052d35] transition hover:bg-cyan-300"
        >
          Return to agents
        </Link>
      </section>
    </main>
  );
}
