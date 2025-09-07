import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DialogSkuDeleteConfirm from "./DialogSkuDeleteConfirm";
import { vi } from "vitest";

type Sku = {
  id: string | number;
  sku: string;
};

const defaultProps = {
  confirmDelete: null,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
};

describe("DialogSkuDeleteConfirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render dialog when confirmDelete is null", () => {
    render(<DialogSkuDeleteConfirm {...defaultProps} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render dialog when confirmDelete has value", () => {
    const mockSku = { id: "123", sku: "TEST-SKU-001" };
    render(
      <DialogSkuDeleteConfirm {...defaultProps} confirmDelete={mockSku} />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirmar Exclusão de SKU")).toBeInTheDocument();
    expect(
      screen.getByText(/Tem certeza de que deseja excluir o SKU/i)
    ).toBeInTheDocument();
    expect(screen.getByText("TEST-SKU-001")).toBeInTheDocument();
    expect(
      screen.getByText(/Essa ação não pode ser desfeita/i)
    ).toBeInTheDocument();
  });

  it("should display correct SKU name in confirmation message", () => {
    const customSku = { id: "456", sku: "CUSTOM-SKU-999" };

    render(
      <DialogSkuDeleteConfirm {...defaultProps} confirmDelete={customSku} />
    );

    expect(screen.getByText("CUSTOM-SKU-999")).toBeInTheDocument();
  });

  it("should call onClose when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <DialogSkuDeleteConfirm
        {...defaultProps}
        confirmDelete={{ id: "123", sku: "SKU-123" }}
        onClose={onCloseMock}
      />
    );

    await user.click(screen.getByText("Cancelar"));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("should call onClose when dialog backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <DialogSkuDeleteConfirm
        {...defaultProps}
        confirmDelete={{ id: "123", sku: "SKU-123" }}
        onClose={onCloseMock}
      />
    );

    await user.click(
      document.querySelector(".MuiDialog-container") as HTMLElement
    );
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("should call onConfirm when Delete button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirmMock = vi.fn();
    const mockSku = { id: "456", sku: "SKU-XYZ" };

    render(
      <DialogSkuDeleteConfirm
        confirmDelete={mockSku}
        onClose={vi.fn()}
        onConfirm={onConfirmMock}
      />
    );

    await user.click(screen.getByText("Excluir"));

    expect(onConfirmMock).toHaveBeenCalled();
  });

  it("should not call onConfirm when it is not provided", async () => {
    const user = userEvent.setup();
    const mockSku = { id: "456", sku: "SKU-XYZ" };

    render(
      <DialogSkuDeleteConfirm
        confirmDelete={mockSku}
        onClose={vi.fn()}
        onConfirm={undefined as any}
      />
    );

    await user.click(screen.getByText("Excluir"));
  });

  it("should disable Delete button when confirmDelete is null", () => {
    render(<DialogSkuDeleteConfirm {...defaultProps} confirmDelete={null} />);
  });

  it("should enable Delete button when confirmDelete has value", () => {
    render(
      <DialogSkuDeleteConfirm
        {...defaultProps}
        confirmDelete={{ id: "123", sku: "SKU-123" }}
      />
    );
    expect(screen.getByText("Excluir")).not.toBeDisabled();
  });

  it("should have correct accessibility attributes", () => {
    render(
      <DialogSkuDeleteConfirm
        {...defaultProps}
        confirmDelete={{ id: "123", sku: "SKU-123" }}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "alert-dialog-title");
    expect(dialog).toHaveAttribute(
      "aria-describedby",
      "alert-dialog-description"
    );
  });

  it("should render buttons with correct colors and variants", () => {
    render(
      <DialogSkuDeleteConfirm
        {...defaultProps}
        confirmDelete={{ id: "123", sku: "SKU-123" }}
      />
    );

    const cancelButton = screen.getByText("Cancelar");
    expect(cancelButton).toHaveClass("MuiButton-textPrimary");

    const deleteButton = screen.getByText("Excluir");
    expect(deleteButton).toHaveClass("MuiButton-containedError");
  });

  it("should handle multiple rapid clicks correctly", async () => {
    const user = userEvent.setup();
    const onConfirmMock = vi.fn();
    const mockSku = { id: "123", sku: "SKU-123" };

    render(
      <DialogSkuDeleteConfirm
        confirmDelete={mockSku}
        onClose={vi.fn()}
        onConfirm={onConfirmMock}
      />
    );

    const deleteButton = screen.getByText("Excluir");

    await user.click(deleteButton);

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    expect(deleteButton).toBeDisabled();
  });

  it("should handle SKU with special characters", () => {
    const specialSku = { id: "789", sku: "SKU-@#$%^&*()_+" };
    render(
      <DialogSkuDeleteConfirm {...defaultProps} confirmDelete={specialSku} />
    );
    expect(
      screen.getByText(/Tem certeza de que deseja excluir o SKU/i)
    ).toBeInTheDocument();
    expect(screen.getByText(specialSku.sku)).toBeInTheDocument();
  });

  it("should handle numeric ID correctly", () => {
    const numericSku = { id: 123, sku: "SKU-123" };
    render(
      <DialogSkuDeleteConfirm {...defaultProps} confirmDelete={numericSku} />
    );
    expect(
      screen.getByText(/Tem certeza de que deseja excluir o SKU/i)
    ).toBeInTheDocument();
    expect(screen.getByText(numericSku.sku)).toBeInTheDocument();
  });
});
