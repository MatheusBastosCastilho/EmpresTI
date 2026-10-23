import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { LoginForm } from "@/components/login/login-form";

afterEach(cleanup);

describe("LoginForm", () => {
  it("test_ca_09_impede_envio_com_campos_vazios_ou_email_invalido", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const email = screen.getByLabelText("E-mail corporativo");
    const password = screen.getByLabelText("Senha");
    const submit = screen.getByRole("button", { name: "Entrar" });

    await user.click(submit);
    expect(email).toBeInvalid();
    expect(password).toBeInvalid();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.type(email, "email-invalido");
    await user.type(password, "senha-de-demonstracao");
    await user.click(submit);

    expect(email).toBeInvalid();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("test_ca_09_alterna_visibilidade_da_senha_por_teclado_sem_enviar", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const password = screen.getByLabelText("Senha");
    await user.tab();
    expect(screen.getByLabelText("E-mail corporativo")).toHaveFocus();
    await user.tab();
    expect(password).toHaveFocus();
    await user.type(password, "senha-de-demonstracao");
    await user.tab();
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("senha-de-demonstracao");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(password).toHaveAttribute("type", "password");
  });

  it("test_ca_11_envia_por_enter_e_informa_que_o_acesso_e_demonstrativo", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const initialUrl = window.location.href;

    await user.type(screen.getByLabelText("E-mail corporativo"), "marina@empresa.com.br");
    await user.type(screen.getByLabelText("Senha"), "senha-de-demonstracao{Enter}");

    expect(screen.getByRole("status")).toHaveTextContent("O acesso à conta ainda não está habilitado.");
    expect(window.location.href).toBe(initialUrl);

    await user.type(screen.getByLabelText("Senha"), "1");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
