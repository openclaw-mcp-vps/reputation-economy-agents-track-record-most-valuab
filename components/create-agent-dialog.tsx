"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";

type NewAgentInput = {
  name: string;
  model: string;
  ownerTeam: string;
  description: string;
};

const INITIAL_STATE: NewAgentInput = {
  name: "",
  model: "",
  ownerTeam: "",
  description: ""
};

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState<NewAgentInput>(INITIAL_STATE);

  const updateField = (key: keyof NewAgentInput, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setErrorMessage(payload.message ?? "Unable to create agent.");
        return;
      }

      setOpen(false);
      setForm(INITIAL_STATE);
      window.location.reload();
    } catch {
      setErrorMessage("Network error while creating agent.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#052d35] transition hover:bg-cyan-300"
        >
          <Plus className="h-4 w-4" />
          Add agent
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="surface-card fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold text-white">Create a tracked agent</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[#93a0ad]">
                Register the agent profile before ingesting execution runs.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="rounded-lg p-2 text-[#98a2af] transition hover:bg-[#1f2937] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Agent name"
              className="w-full rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
            />
            <input
              required
              value={form.model}
              onChange={(event) => updateField("model", event.target.value)}
              placeholder="Model stack"
              className="w-full rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
            />
            <input
              required
              value={form.ownerTeam}
              onChange={(event) => updateField("ownerTeam", event.target.value)}
              placeholder="Owner team"
              className="w-full rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
            />
            <textarea
              required
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="What decisions does this agent own?"
              rows={4}
              className="w-full rounded-lg border border-[#30363d] bg-[#0b1220] px-3 py-2 text-sm"
            />

            {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#052d35] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Creating..." : "Create agent"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
