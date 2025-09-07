import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TransitionMenu from "./TransitionMenu";
import { SkuStatusEnum } from "../../types";
import type { Sku } from "../../types";
import { vi } from "vitest";

vi.mock("../../state/transition", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../../state/transition")>();
  const { SkuStatusEnum } = await import("../../types");
  return {
    ...mod,
    ALLOWED_TRANSITIONS: {
      [SkuStatusEnum.PRE_CADASTRO]: [
        SkuStatusEnum.CADASTRO_COMPLETO,
        SkuStatusEnum.CANCELADO,
      ],
      [SkuStatusEnum.CADASTRO_COMPLETO]: [
        SkuStatusEnum.ATIVO,
        SkuStatusEnum.CANCELADO,
      ],
      [SkuStatusEnum.ATIVO]: [SkuStatusEnum.DESATIVADO],
      [SkuStatusEnum.DESATIVADO]: [SkuStatusEnum.ATIVO],
      [SkuStatusEnum.CANCELADO]: [],
    },
    STATUS_LABELS: {
      [SkuStatusEnum.PRE_CADASTRO]: "Pré-cadastro",
      [SkuStatusEnum.CADASTRO_COMPLETO]: "Cadastro Completo",
      [SkuStatusEnum.ATIVO]: "Ativo",
      [SkuStatusEnum.DESATIVADO]: "Desativado",
      [SkuStatusEnum.CANCELADO]: "Cancelado",
    },
  };
});

const createMockSku = (status: SkuStatusEnum): Sku => ({
  id: "test-id",
  sku: "TEST-SKU-001",
  descricao: "Test Description",
  descricaoComercial: "Test Commercial Description",
  status,
});

const defaultProps = {
  onTransition: vi.fn(),
};

describe("TransitionMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Button rendering", () => {
    it("should render transition button", () => {
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      expect(
        screen.getByRole("button", { name: /mudar status/i })
      ).toBeInTheDocument();
    });

    it("should show dropdown arrow icon", () => {
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).toHaveTextContent("▾");
    });

    it("should have small size and outlined variant", () => {
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).toHaveClass("MuiButton-sizeSmall");
      expect(button).toHaveClass("MuiButton-outlined");
    });
  });

  describe("Button states", () => {
    it("should enable button when transitions are available", () => {
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).not.toBeDisabled();
    });

    it("should disable button when no transitions are available", () => {
      const mockSku = createMockSku(SkuStatusEnum.CANCELADO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).toBeDisabled();
    });

    it("should disable button for unknown status", () => {
      const mockSku = createMockSku("UNKNOWN_STATUS" as any);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Tooltip behavior", () => {
    it("should show tooltip when no transitions are available", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.CANCELADO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).toBeDisabled();
      await user.hover(button.parentElement!);

      await waitFor(() => {
        expect(
          screen.getByText("Sem transições possíveis")
        ).toBeInTheDocument();
      });
    });

    it("should not show tooltip when transitions are available", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.hover(button);

      await waitFor(() => {
        expect(
          screen.queryByText("Sem transições possíveis")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Menu opening and closing", () => {
    it("should open menu when button is clicked", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should close menu when clicking outside", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      expect(screen.getByRole("menu")).toBeInTheDocument();

      await user.click(
        document.querySelector(".MuiBackdrop-root") as HTMLElement
      );

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    it("should close menu when pressing Escape", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      expect(screen.getByRole("menu")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    it("should not open menu when button is disabled", async () => {
      const mockSku = createMockSku(SkuStatusEnum.CANCELADO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Menu items", () => {
    it("should render correct menu items for PRE_CADASTRO status", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      expect(
        screen.getByRole("menuitem", { name: "Cadastro Completo" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: "Cancelado" })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    });

    it("should render correct menu items for CADASTRO_COMPLETO status", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.CADASTRO_COMPLETO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      expect(
        screen.getByRole("menuitem", { name: "Ativo" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: "Cancelado" })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    });

    it("should render correct menu items for ATIVO status", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.ATIVO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      expect(
        screen.getByRole("menuitem", { name: "Desativado" })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("menuitem")).toHaveLength(1);
    });

    it("should render correct menu items for DESATIVADO status", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.DESATIVADO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      expect(
        screen.getByRole("menuitem", { name: "Ativo" })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("menuitem")).toHaveLength(1);
    });

    it("should not render any menu items for CANCELADO status", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.CANCELADO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Transition execution", () => {
    it("should call onTransition when menu item is clicked", async () => {
      const user = userEvent.setup();
      const onTransitionMock = vi.fn();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu sku={mockSku} onTransition={onTransitionMock} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: "Cadastro Completo",
      });
      await user.click(menuItem);

      expect(onTransitionMock).toHaveBeenCalledWith(
        "test-id",
        SkuStatusEnum.CADASTRO_COMPLETO
      );
    });

    it("should close menu after transition", async () => {
      const user = userEvent.setup();
      const onTransitionMock = vi.fn();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu sku={mockSku} onTransition={onTransitionMock} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: "Cadastro Completo",
      });
      await user.click(menuItem);

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    it("should call onTransition with correct parameters for different transitions", async () => {
      const user = userEvent.setup();
      const onTransitionMock = vi.fn();
      const mockSku = createMockSku(SkuStatusEnum.CADASTRO_COMPLETO);

      render(<TransitionMenu sku={mockSku} onTransition={onTransitionMock} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      const ativoMenuItem = screen.getByRole("menuitem", { name: "Ativo" });
      await user.click(ativoMenuItem);

      expect(onTransitionMock).toHaveBeenCalledWith(
        "test-id",
        SkuStatusEnum.ATIVO
      );
    });
  });

  describe("Menu positioning", () => {
    it("should have correct anchor and transform origins", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle multiple rapid clicks", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should handle sku prop changes", () => {
      const mockSku1 = createMockSku(SkuStatusEnum.PRE_CADASTRO);
      const mockSku2 = createMockSku(SkuStatusEnum.ATIVO);

      const { rerender } = render(
        <TransitionMenu {...defaultProps} sku={mockSku1} />
      );

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).not.toBeDisabled();

      rerender(<TransitionMenu {...defaultProps} sku={mockSku2} />);

      expect(button).not.toBeDisabled();
    });

    it("should handle onTransition prop changes", async () => {
      const user = userEvent.setup();
      const onTransition1 = vi.fn();
      const onTransition2 = vi.fn();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      const { rerender } = render(
        <TransitionMenu sku={mockSku} onTransition={onTransition1} />
      );

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      rerender(<TransitionMenu sku={mockSku} onTransition={onTransition2} />);

      const menuItem = screen.getByRole("menuitem", {
        name: "Cadastro Completo",
      });
      await user.click(menuItem);

      expect(onTransition1).not.toHaveBeenCalled();
      expect(onTransition2).toHaveBeenCalledWith(
        "test-id",
        SkuStatusEnum.CADASTRO_COMPLETO
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      expect(button).toHaveAttribute("type", "button");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });

      button.focus();
      await user.keyboard("{Enter}");

      expect(screen.getByRole("menu")).toBeInTheDocument();

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(defaultProps.onTransition).toHaveBeenCalled();
    });

    it("should work with screen readers", async () => {
      const user = userEvent.setup();
      const mockSku = createMockSku(SkuStatusEnum.PRE_CADASTRO);

      render(<TransitionMenu {...defaultProps} sku={mockSku} />);

      const button = screen.getByRole("button", { name: /mudar status/i });
      await user.click(button);

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();

      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems).toHaveLength(2);
      expect(menuItems[0]).toHaveAccessibleName("Cadastro Completo");
      expect(menuItems[1]).toHaveAccessibleName("Cancelado");
    });
  });

  describe("Performance", () => {
    it("should handle multiple instances efficiently", () => {
      const mockSkus = Array.from({ length: 10 }, (_, i) =>
        createMockSku(SkuStatusEnum.PRE_CADASTRO)
      );

      const startTime = performance.now();

      render(
        <div>
          {mockSkus.map((sku, index) => (
            <TransitionMenu key={index} {...defaultProps} sku={sku} />
          ))}
        </div>
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(
        screen.getAllByRole("button", { name: /mudar status/i })
      ).toHaveLength(10);
    });
  });

  describe("All status transitions", () => {
    const statusTransitions = [
      {
        status: SkuStatusEnum.PRE_CADASTRO,
        expectedTransitions: ["Cadastro Completo", "Cancelado"],
      },
      {
        status: SkuStatusEnum.CADASTRO_COMPLETO,
        expectedTransitions: ["Ativo", "Cancelado"],
      },
      {
        status: SkuStatusEnum.ATIVO,
        expectedTransitions: ["Desativado"],
      },
      {
        status: SkuStatusEnum.DESATIVADO,
        expectedTransitions: ["Ativo"],
      },
      {
        status: SkuStatusEnum.CANCELADO,
        expectedTransitions: [],
      },
    ];

    it.each(statusTransitions)(
      "should show correct transitions for $status",
      async ({ status, expectedTransitions }) => {
        const user = userEvent.setup();
        const mockSku = createMockSku(status);

        render(<TransitionMenu {...defaultProps} sku={mockSku} />);

        const button = screen.getByRole("button", { name: /mudar status/i });

        if (expectedTransitions.length === 0) {
          expect(button).toBeDisabled();
        } else {
          expect(button).not.toBeDisabled();
          await user.click(button);

          const menuItems = screen.getAllByRole("menuitem");
          expect(menuItems).toHaveLength(expectedTransitions.length);

          expectedTransitions.forEach((transition) => {
            expect(
              screen.getByRole("menuitem", { name: transition })
            ).toBeInTheDocument();
          });
        }
      }
    );
  });
});
