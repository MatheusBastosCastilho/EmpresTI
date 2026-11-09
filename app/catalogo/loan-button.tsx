"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const failureMessages: Record<string, string> = {
  CONFLICT: "Este item não está mais disponível.",
  NOT_FOUND: "Este item não está mais disponível.",
  PRECONDITION_FAILED: "Devolva o empréstimo vencido antes de solicitar outro.",
  TOO_MANY_REQUESTS: "Você já tem três empréstimos em aberto.",
  UNAUTHORIZED: "Entre novamente para solicitar.",
};

export function LoanButton({ equipmentId }: { equipmentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function request() {
    setSending(true);
    setMessage("");
    try {
      const response = await fetch("/api/trpc/requestLoan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { equipmentId } }),
      });
      if (response.ok) {
        setConfirming(false);
        router.refresh();
        return;
      }
      const failure = await response.json();
      setMessage(failureMessages[failure.error?.json?.data?.code] ?? "Não foi possível solicitar o item.");
    } catch {
      setMessage("Não foi possível solicitar o item.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {confirming ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={request} disabled={sending}>Confirmar empréstimo</Button>
          <Button type="button" variant="outline" disabled={sending} onClick={() => { setConfirming(false); setMessage(""); }}>Cancelar</Button>
        </div>
      ) : (
        <Button type="button" onClick={() => setConfirming(true)}>Solicitar</Button>
      )}
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
