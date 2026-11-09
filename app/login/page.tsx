import { LoginForm } from "@/components/login/login-form";

export default function LoginPage() {
  return (
    <main
      data-screen-label="01 Login"
      className="grid min-h-svh flex-1 grid-cols-[minmax(0,560px)_minmax(0,1fr)] bg-background"
    >
      <section
        aria-labelledby="login-hero-title"
        className="flex flex-col justify-between gap-14 bg-[linear-gradient(160deg,#001449_0%,#00102F_60%,#080C1A_100%)] p-14"
      >
        <div className="flex items-center gap-3.5">
          <span className="flex size-[34px] items-center justify-center rounded-lg border border-accent-700 bg-brand">
            <i aria-hidden="true" className="ph ph-package text-[21px] text-accent-300" />
          </span>
          <span className="text-base font-semibold tracking-[0.02em]">EmpresTI</span>
        </div>

        <div className="flex flex-col items-start gap-7">
          <div className="flex flex-col gap-4">
            <p className="text-[11px] tracking-[0.12em] text-accent-400 uppercase">
              Empréstimo de equipamentos
            </p>
            <h1
              id="login-hero-title"
              className="max-w-[20ch] text-[34px] leading-[1.15] font-semibold tracking-[-0.01em] text-pretty"
            >
              Os equipamentos de que você precisa, em um só lugar.
            </h1>
            <p className="max-w-[38ch] text-sm leading-6 text-hero-muted text-pretty">
              Consulte os equipamentos disponíveis, solicite um empréstimo e
              acompanhe suas devoluções.
            </p>
          </div>

          <div aria-hidden="true" className="h-px w-40 bg-[linear-gradient(to_right,#3C5DBE,transparent)]" />

          <dl className="flex gap-10">
            <div className="flex flex-col gap-1.5">
              <dt className="order-2 text-xs text-hero-muted">itens por pessoa</dt>
              <dd className="text-2xl font-semibold tracking-[-0.01em]">3</dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="order-2 text-xs text-hero-muted">dias de prazo</dt>
              <dd className="text-2xl font-semibold tracking-[-0.01em]">14</dd>
            </div>
          </dl>
        </div>

        <p className="text-[11px] text-muted-foreground">Operações · v1</p>
      </section>

      <section aria-labelledby="login-form-title" className="flex items-center justify-center p-14">
        <div className="flex w-full max-w-[372px] flex-col gap-8">
          <div className="flex flex-col items-start gap-3">
            <span className="rounded-full border border-border px-3 py-1 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
              Acesso interno
            </span>
            <div className="flex flex-col gap-2">
              <h2 id="login-form-title" className="text-[22px] font-semibold tracking-[-0.01em]">
                Entrar
              </h2>
              <p className="text-[13px] leading-6 text-muted-foreground">
                Use seu e-mail corporativo para acessar o EmpresTI.
              </p>
            </div>
          </div>

          <LoginForm />

          <div className="flex flex-col gap-5">
            <div aria-hidden="true" className="h-px w-full bg-[linear-gradient(to_right,transparent,#222C4A_48px,#222C4A_calc(100%_-_48px),transparent)]" />
            <p className="text-center text-xs leading-5 text-muted-foreground">
              Precisa de acesso ou esqueceu sua senha?
              <br />
              Entre em contato com a equipe de Operações.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
