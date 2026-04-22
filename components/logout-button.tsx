"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  const onLogout = async () => {
    await fetch("/api/access/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      className="inline-flex items-center gap-2 rounded-lg border border-[#30363d] px-3 py-2 text-xs text-[#c2cad4] transition hover:border-cyan-300 hover:text-white"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}
