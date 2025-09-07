import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import SkuTable from "./SkuTable";
import { Sku, SkuStatus, SkuStatusEnum } from "../../types";

const mockSkus: Sku[] = [
  {
    id: "1",
    descricao: "Produto A",
    descricaoComercial: "Produto A 100ml",
    sku: "PA100",
    status: SkuStatusEnum.ATIVO,
  },
  {
    id: "2",
    descricao: "Produto B",
    descricaoComercial: "Produto B 200ml",
    sku: "PB200",
    status: SkuStatusEnum.PRE_CADASTRO,
  },
];

vi.mock("./TransitionMenu", () => ({
  default: ({
    sku,
    onTransition,
  }: {
    sku: Sku;
    onTransition: (id: string, status: SkuStatus) => void;
  }) => (
    <button onClick={() => onTransition(sku.id, SkuStatusEnum.ATIVO)}>
      Mudar Status
    </button>
  ),
}));

describe("SkuTable", () => {
  it("renders a list of SKUs", () => {
    render(
      <SkuTable
        items={mockSkus}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTransition={function (id: string, status: SkuStatus): void {
          throw new Error("Function not implemented.");
        }}
      />
    );
    expect(screen.getByText("Produto A")).toBeInTheDocument();
    expect(screen.getByText("PB200")).toBeInTheDocument();
    expect(screen.getAllByRole("row").length).toBe(mockSkus.length + 1);
  });

  it("renders a message when no items are provided", () => {
    render(
      <SkuTable
        items={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTransition={function (id: string, status: SkuStatus): void {
          throw new Error("Function not implemented.");
        }}
      />
    );
    expect(screen.getByText("Nenhum SKU encontrado.")).toBeInTheDocument();
  });

  it("calls onEdit and onDelete when buttons are clicked", async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    render(
      <SkuTable
        items={mockSkus}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTransition={function (id: string, status: SkuStatus): void {
          throw new Error("Function not implemented.");
        }}
      />
    );

    const editButtons = screen.getAllByLabelText("Editar SKU");
    const deleteButtons = screen.getAllByLabelText("Remover SKU");

    await user.click(editButtons[0]);
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(mockSkus[0]);

    await user.click(deleteButtons[1]);
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(mockSkus[1]);
  });
});
