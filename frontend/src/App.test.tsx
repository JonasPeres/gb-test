import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AppProvider from "./App";
import * as apiClient from "./api/client";
import { Sku, SkuStatusEnum } from "./types";

const mockSkus: Sku[] = [
  {
    id: "1",
    descricao: "Produto Mock A",
    descricaoComercial: "Produto Mock A 100ml",
    sku: "MOCKA100",
    status: SkuStatusEnum.ATIVO,
  },
];

vi.mock("./api/client", async () => {
  const actual = await vi.importActual("./api/client");
  return {
    ...actual,
    listSkus: vi.fn(),
    createSku: vi.fn(),
  };
});

describe("App Integration Tests", () => {
  it("should render the list of SKUs on initial load", async () => {
    vi.mocked(apiClient.listSkus).mockResolvedValue({
      items: mockSkus,
      total: 1,
    });

    render(<AppProvider />);

    expect(await screen.findByText("Produto Mock A")).toBeInTheDocument();
    expect(screen.getByText("MOCKA100")).toBeInTheDocument();
  });

  it("should allow creating a new SKU", async () => {
    const user = userEvent.setup();
    const newSku = {
      id: "2",
      descricao: "Novo Produto",
      descricaoComercial: "Novo Produto 250ml",
      sku: "NOVO250",
      status: SkuStatusEnum.PRE_CADASTRO,
    };

    vi.mocked(apiClient.listSkus).mockResolvedValue({ items: [], total: 0 });
    vi.mocked(apiClient.createSku).mockResolvedValue(newSku);
    vi.mocked(apiClient.listSkus).mockResolvedValueOnce({
      items: [newSku],
      total: 1,
    });

    render(<AppProvider />);

    await user.click(screen.getByRole("button", { name: /Novo SKU/i }));

    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/Descrição/i),
      newSku.descricao
    );
    await user.type(
      within(dialog).getByLabelText(/Descrição Comercial/i),
      newSku.descricaoComercial
    );
    await user.type(within(dialog).getByLabelText(/SKU/i), newSku.sku);

    await user.click(within(dialog).getByRole("button", { name: /Salvar/i }));

    expect(apiClient.createSku).toHaveBeenCalledTimes(1);
    expect(apiClient.createSku).toHaveBeenCalledWith(
      expect.objectContaining({
        descricao: newSku.descricao,
        sku: newSku.sku,
      })
    );

    expect(
      await screen.findByText("SKU criado com sucesso!")
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
