import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import SkuForm from "./SkuForm";
import { SkuStatusEnum } from "../../types";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

describe("SkuForm", () => {
  it("renders correctly for creating a new SKU", () => {
    render(<SkuForm onSubmit={vi.fn()} onCancel={vi.fn()} />, {
      wrapper: AllTheProviders,
    });
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição Comercial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Salvar/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cancelar/i })
    ).toBeInTheDocument();
  });

  it("renders with initial data for editing", () => {
    const initialData = {
      id: "1",
      descricao: "Test Desc",
      descricaoComercial: "Test Com",
      sku: "TEST01",
      status: SkuStatusEnum.PRE_CADASTRO,
    };
    render(
      <SkuForm onSubmit={vi.fn()} onCancel={vi.fn()} initial={initialData} />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByDisplayValue("Test Desc")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("TEST01")).toBeInTheDocument();
  });

  it("calls onSubmit with form data when creating", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<SkuForm onSubmit={handleSubmit} onCancel={vi.fn()} />, {
      wrapper: AllTheProviders,
    });

    await user.type(screen.getByLabelText(/Descrição/i), "Nova Desc");
    await user.type(screen.getByLabelText(/Descrição Comercial/i), "Nova Com");
    await user.type(screen.getByLabelText(/SKU/i), "NOVO01");
    await user.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      descricao: "Nova Desc",
      descricaoComercial: "Nova Com",
      sku: "NOVO01",
    });
  });
});
