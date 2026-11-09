"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch("/api/trpc/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { email: fields.get("email"), password: fields.get("password") } }),
      });
      if (response.ok) {
        window.location.replace("/catalogo");
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
    <form
      aria-label="Entrar no EmpresTI"
      method="post"
      onSubmit={handleSubmit}
      onChange={() => setFailed(false)}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-xs font-normal text-label">
            E-mail corporativo
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="voce@empresa.com.br"
            maxLength={254}
            required
            className="h-[42px] bg-sunken px-3 text-sm dark:bg-sunken"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-xs font-normal text-label">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
              className="h-[42px] bg-sunken pr-12 pl-3 text-sm dark:bg-sunken"
            />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              aria-controls="password"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex w-[42px] cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <i aria-hidden="true" className={`ph ${showPassword ? "ph-eye-slash" : "ph-eye"} text-lg`} />
            </button>
          </div>
        </div>
      </div>

      <Button type="submit" size="login" className="w-full" disabled={submitting}>
        {submitting ? "Entrando…" : "Entrar"}
        <i aria-hidden="true" className="ph ph-arrow-right text-base" />
      </Button>

      <div aria-live="polite" aria-atomic="true">
        {failed && (
          <p role="status" className="rounded-lg border border-accent-700 bg-sunken p-3 text-xs leading-5 text-accent-300">
            Não foi possível entrar. Confira os dados, tente mais tarde ou procure Operações.
          </p>
        )}
      </div>
    </form>
  );
}
