"use client";

import { useState } from "react";

export function UnlockForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/access/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const body = (await response.json()) as { message?: string; ok?: boolean };

      if (!response.ok || !body.ok) {
        setStatusMessage(body.message ?? "Unable to verify purchase email.");
        return;
      }

      window.location.href = nextPath;
    } catch {
      setStatusMessage("Network error while verifying access.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-[#d2dae3]" htmlFor="billingEmail">
        Billing email used at checkout
      </label>
      <input
        id="billingEmail"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-xl border border-[#30363d] bg-[#0b1220] px-4 py-3 text-sm text-[#e6edf3] outline-none ring-cyan-400 transition focus:ring-2"
        placeholder="you@company.com"
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#052d35] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Verifying..." : "Verify and unlock"}
      </button>
      {statusMessage ? <p className="text-sm text-[#fda4af]">{statusMessage}</p> : null}
    </form>
  );
}
