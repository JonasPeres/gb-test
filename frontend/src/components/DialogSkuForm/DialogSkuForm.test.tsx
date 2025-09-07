import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DialogSkuForm from "./DialogSkuForm";
import { SkuStatusEnum, type Sku } from "../../types";
import { vi } from "vitest";

const mockSku: Sku = {
  id: "123",
  sku: "TEST-SKU-001",
  descricao: "Test Description",
  descricaoComercial: "Test Commercial Description",
  status: SkuStatusEnum.PRE_CADASTRO,
};

const defaultProps = {
  open: false,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe("DialogSkuForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render dialog when open is false", () => {
    render(<DialogSkuForm {...defaultProps} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render dialog when open is true", () => {
    render(<DialogSkuForm {...defaultProps} open={true} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Novo SKU")).toBeInTheDocument();
    expect(screen.getByLabelText("SKU")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição Comercial")).toBeInTheDocument();
  });

  it("should render 'Editar SKU' as title when sku prop is provided", () => {
    render(<DialogSkuForm {...defaultProps} open={true} sku={mockSku} />);

    expect(screen.getByText("Editar SKU")).toBeInTheDocument();
  });

  it("should render 'Novo SKU' as title when sku prop is not provided", () => {
    render(<DialogSkuForm {...defaultProps} open={true} />);

    expect(screen.getByText("Novo SKU")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <DialogSkuForm {...defaultProps} open={true} onClose={onCloseMock} />
    );

    await user.click(screen.getByLabelText("close"));

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("should call onClose when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <DialogSkuForm {...defaultProps} open={true} onClose={onCloseMock} />
    );

    await user.click(screen.getByText("Cancelar"));

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("should call onClose when dialog backdrop is clicked", () => {
    const onCloseMock = vi.fn();

    render(
      <DialogSkuForm {...defaultProps} open={true} onClose={onCloseMock} />
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("should populate form fields when sku prop is provided", () => {
    render(<DialogSkuForm {...defaultProps} open={true} sku={mockSku} />);

    expect(screen.getByDisplayValue("TEST-SKU-001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Test Commercial Description")
    ).toBeInTheDocument();
  });

  it("should show validation errors for empty required fields", async () => {
    const user = userEvent.setup();

    render(<DialogSkuForm {...defaultProps} open={true} />);

    await user.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(screen.getByText("Obrigatório")).toBeInTheDocument();
      expect(screen.getAllByText("Mínimo de 3 caracteres")).toHaveLength(2);
    });
  });

  it("should show validation error for SKU field when empty", async () => {
    const user = userEvent.setup();

    render(<DialogSkuForm {...defaultProps} open={true} />);

    const skuInput = screen.getByLabelText("SKU");
    await user.type(skuInput, "a");
    await user.clear(skuInput);
    await user.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(screen.getByText("Obrigatório")).toBeInTheDocument();
    });
  });

  it("should show validation error for short descriptions", async () => {
    const user = userEvent.setup();

    render(<DialogSkuForm {...defaultProps} open={true} />);

    await user.type(screen.getByLabelText("Descrição"), "ab");
    await user.type(screen.getByLabelText("Descrição Comercial"), "cd");
    await user.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(screen.getAllByText("Mínimo de 3 caracteres")).toHaveLength(2);
    });
  });

  it("should call onSubmit with valid form data", async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(
      <DialogSkuForm {...defaultProps} open={true} onSubmit={onSubmitMock} />
    );

    await user.type(screen.getByLabelText("SKU"), "NEW-SKU-001");
    await user.type(screen.getByLabelText("Descrição"), "New Description");
    await user.type(
      screen.getByLabelText("Descrição Comercial"),
      "New Commercial Description"
    );

    await user.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        sku: "NEW-SKU-001",
        descricao: "New Description",
        descricaoComercial: "New Commercial Description",
      });
    });
  });

  it("should reset form when dialog opens with new sku data", () => {
    const { rerender } = render(
      <DialogSkuForm {...defaultProps} open={true} />
    );

    expect(screen.getByLabelText("SKU")).toHaveValue("");

    rerender(<DialogSkuForm {...defaultProps} open={true} sku={mockSku} />);

    expect(screen.getByLabelText("SKU")).toHaveValue("TEST-SKU-001");
  });

  it("should disable SKU field when status is not PRE_CADASTRO", () => {
    const skuWithStatus = {
      ...mockSku,
      status: SkuStatusEnum.CADASTRO_COMPLETO,
    };

    render(<DialogSkuForm {...defaultProps} open={true} sku={skuWithStatus} />);

    expect(screen.getByLabelText("SKU")).toBeDisabled();
  });

  it("should disable Descrição field when status is not PRE_CADASTRO", () => {
    const skuWithStatus = {
      ...mockSku,
      status: SkuStatusEnum.CADASTRO_COMPLETO,
    };

    render(<DialogSkuForm {...defaultProps} open={true} sku={skuWithStatus} />);

    expect(screen.getByLabelText("Descrição")).toBeDisabled();
  });

  it("should enable Descrição Comercial field when status is CADASTRO_COMPLETO", () => {
    const skuWithStatus = {
      ...mockSku,
      status: SkuStatusEnum.CADASTRO_COMPLETO,
    };

    render(<DialogSkuForm {...defaultProps} open={true} sku={skuWithStatus} />);

    expect(screen.getByLabelText("Descrição Comercial")).not.toBeDisabled();
  });

  it("should disable all fields when status is ATIVO", () => {
    const skuWithStatus = {
      ...mockSku,
      status: SkuStatusEnum.ATIVO,
    };

    render(<DialogSkuForm {...defaultProps} open={true} sku={skuWithStatus} />);

    expect(screen.getByLabelText("SKU")).toBeDisabled();
    expect(screen.getByLabelText("Descrição")).toBeDisabled();
    expect(screen.getByLabelText("Descrição Comercial")).toBeDisabled();
  });

  it("should enable all fields when no status is provided", () => {
    const skuWithoutStatus = {
      ...mockSku,
      status: undefined,
    };

    render(
      <DialogSkuForm {...defaultProps} open={true} sku={skuWithoutStatus} />
    );

    expect(screen.getByLabelText("SKU")).not.toBeDisabled();
    expect(screen.getByLabelText("Descrição")).not.toBeDisabled();
    expect(screen.getByLabelText("Descrição Comercial")).not.toBeDisabled();
  });

  it("should disable Save button when form is submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit: (value: unknown) => void;
    const onSubmitMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <DialogSkuForm {...defaultProps} open={true} onSubmit={onSubmitMock} />
    );

    await user.type(screen.getByLabelText("SKU"), "TEST-SKU");
    await user.type(screen.getByLabelText("Descrição"), "Test Description");
    await user.type(
      screen.getByLabelText("Descrição Comercial"),
      "Test Commercial"
    );

    await user.click(screen.getByText("Salvar"));

    expect(screen.getByText("Salvar")).toBeDisabled();

    resolveSubmit!(undefined);
  });

  describe("Form submission", () => {
    it("should handle form submission via Enter key", async () => {
      const user = userEvent.setup();
      const onSubmitMock = vi.fn();
      render(
        <DialogSkuForm {...defaultProps} open={true} onSubmit={onSubmitMock} />
      );

      await user.type(screen.getByLabelText("SKU"), "TEST-SKU");
      await user.type(screen.getByLabelText("Descrição"), "Test Description");
      await user.type(
        screen.getByLabelText("Descrição Comercial"),
        "Commercial Desc"
      );

      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalled();
      });
    });
  });

  describe("State and props", () => {
    it("should maintain form state when dialog is closed and reopened", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <DialogSkuForm {...defaultProps} open={true} />
      );

      rerender(<DialogSkuForm {...defaultProps} open={false} />);

      rerender(<DialogSkuForm {...defaultProps} open={true} sku={mockSku} />);

      expect(screen.getByDisplayValue("TEST-SKU-001")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
    });
  });

  it("should clear validation errors when valid input is provided", async () => {
    const user = userEvent.setup();

    render(<DialogSkuForm {...defaultProps} open={true} />);

    await user.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(screen.getByText("Obrigatório")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("SKU"), "VALID-SKU");
    await user.type(screen.getByLabelText("Descrição"), "Valid Description");
    await user.type(
      screen.getByLabelText("Descrição Comercial"),
      "Valid Commercial Description"
    );

    await waitFor(() => {
      expect(screen.queryByText("Obrigatório")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Mínimo de 3 caracteres")
      ).not.toBeInTheDocument();
    });
  });

  it("should focus on SKU field when dialog opens", () => {
    render(<DialogSkuForm {...defaultProps} open={true} />);

    expect(screen.getByLabelText("SKU")).toHaveFocus();
  });

  it("should handle special characters in form fields", async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(
      <DialogSkuForm {...defaultProps} open={true} onSubmit={onSubmitMock} />
    );

    await user.type(screen.getByLabelText("SKU"), "SKU-@#$%^&*()_+");
    await user.type(
      screen.getByLabelText("Descrição"),
      "Description with special chars: !@#$%"
    );
    await user.type(
      screen.getByLabelText("Descrição Comercial"),
      "Commercial with unicode: áéíóú"
    );

    await user.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        sku: "SKU-@#$%^&*()_+",
        descricao: "Description with special chars: !@#$%",
        descricaoComercial: "Commercial with unicode: áéíóú",
      });
    });
  });
});
