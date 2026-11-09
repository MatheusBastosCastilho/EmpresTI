"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function logout() {
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch("/api/trpc/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (response.ok) {
        window.location.replace("/login");
        return;
      }
      setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Button type="button" variant="outline" disabled={submitting} onClick={logout}>Sair</Button>
      {failed && <p role="status">Não foi possível sair. Tente novamente.</p>}
    </div>
  );
}
