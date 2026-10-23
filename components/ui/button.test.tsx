import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("test_ca_11_renderiza_o_controle_base_com_nome_acessivel", () => {
    render(<Button>Continuar</Button>);

    expect(
      screen.getByRole("button", { name: "Continuar" }),
    ).toBeInTheDocument();
  });
});
