import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import StatusBadge from "./StatusBadge";
import { SkuStatusEnum } from "../../types";
import { vi } from "vitest";

vi.mock("../../state/transition", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../../state/transition")>();
  const { SkuStatusEnum } = await import("../../types");
  return {
    ...mod,
    STATUS_LABELS: {
      [SkuStatusEnum.PRE_CADASTRO]: "Pré-cadastro",
      [SkuStatusEnum.CADASTRO_COMPLETO]: "Cadastro Completo",
      [SkuStatusEnum.ATIVO]: "Ativo",
      [SkuStatusEnum.DESATIVADO]: "Desativado",
      [SkuStatusEnum.CANCELADO]: "Cancelado",
    },
  };
});

describe("StatusBadge", () => {
  describe("Rendering", () => {
    it("should render with PRE_CADASTRO status", () => {
      render(<StatusBadge status={SkuStatusEnum.PRE_CADASTRO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Pré-cadastro");
    });

    it("should render with CADASTRO_COMPLETO status", () => {
      render(<StatusBadge status={SkuStatusEnum.CADASTRO_COMPLETO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Cadastro Completo");
    });

    it("should render with ATIVO status", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Ativo");
    });

    it("should render with DESATIVADO status", () => {
      render(<StatusBadge status={SkuStatusEnum.DESATIVADO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Desativado");
    });

    it("should render with CANCELADO status", () => {
      render(<StatusBadge status={SkuStatusEnum.CANCELADO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Cancelado");
    });
  });

  describe("Colors", () => {
    it("should have warning color for PRE_CADASTRO status", () => {
      render(<StatusBadge status={SkuStatusEnum.PRE_CADASTRO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-colorWarning");
    });

    it("should have info color for CADASTRO_COMPLETO status", () => {
      render(<StatusBadge status={SkuStatusEnum.CADASTRO_COMPLETO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-colorInfo");
    });

    it("should have success color for ATIVO status", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-colorSuccess");
    });

    it("should have default color for DESATIVADO status", () => {
      render(<StatusBadge status={SkuStatusEnum.DESATIVADO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-colorDefault");
    });

    it("should have error color for CANCELADO status", () => {
      render(<StatusBadge status={SkuStatusEnum.CANCELADO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-colorError");
    });
  });

  describe("Props", () => {
    it("should apply custom className when provided", () => {
      const customClass = "custom-status-badge";
      render(
        <StatusBadge status={SkuStatusEnum.ATIVO} className={customClass} />
      );

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass(customClass);
    });

    it("should not have custom className when not provided", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).not.toHaveClass("custom-status-badge");
    });
  });

  describe("Chip properties", () => {
    it("should have small size", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-sizeSmall");
    });

    it("should have outlined variant", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-outlined");
    });

    it("should be a MUI Chip component", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-root");
    });
  });

  describe("Edge cases", () => {
    it("should handle unknown status gracefully", () => {
      const unknownStatus = "UNKNOWN_STATUS" as any;

      render(<StatusBadge status={unknownStatus} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("UNKNOWN_STATUS");
      expect(badge).toHaveClass("MuiChip-colorDefault");
    });

    it("should handle null/undefined status labels", () => {
      const mockStatusLabels = {};
      vi.doMock("../../state/transition", () => ({
        STATUS_LABELS: mockStatusLabels,
      }));

      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(new RegExp(SkuStatusEnum.ATIVO, "i"));
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveAttribute("data-testid", "status-badge");
    });

    it("should be readable by screen readers", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Ativo");
      expect(badge.tagName).toBe("DIV");
    });
  });

  describe("Memoization", () => {
    it("should be a memoized component", () => {
      expect(StatusBadge.$$typeof).toBe(Symbol.for("react.memo"));
    });

    it("should have correct displayName", () => {
      expect(StatusBadge.displayName).toBe("StatusBadge");
    });

    it("should not re-render with same props", () => {
      const { rerender } = render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      const initialElement = badge;

      rerender(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      expect(screen.getByTestId("status-badge")).toBe(initialElement);
    });

    it("should re-render when status prop changes", () => {
      const { rerender } = render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      expect(screen.getByTestId("status-badge")).toHaveTextContent("Ativo");

      rerender(<StatusBadge status={SkuStatusEnum.CANCELADO} />);

      expect(screen.getByTestId("status-badge")).toHaveTextContent("Cancelado");
    });

    it("should re-render when className prop changes", () => {
      const { rerender } = render(
        <StatusBadge status={SkuStatusEnum.ATIVO} className="class1" />
      );

      expect(screen.getByTestId("status-badge")).toHaveClass("class1");

      rerender(<StatusBadge status={SkuStatusEnum.ATIVO} className="class2" />);

      expect(screen.getByTestId("status-badge")).toHaveClass("class2");
      expect(screen.getByTestId("status-badge")).not.toHaveClass("class1");
    });
  });

  describe("All status combinations", () => {
    const allStatuses = [
      {
        status: SkuStatusEnum.PRE_CADASTRO,
        label: "Pré-cadastro",
        color: "warning",
      },
      {
        status: SkuStatusEnum.CADASTRO_COMPLETO,
        label: "Cadastro Completo",
        color: "info",
      },
      { status: SkuStatusEnum.ATIVO, label: "Ativo", color: "success" },
      {
        status: SkuStatusEnum.DESATIVADO,
        label: "Desativado",
        color: "default",
      },
      { status: SkuStatusEnum.CANCELADO, label: "Cancelado", color: "error" },
    ];

    it.each(allStatuses)(
      "should render $status with correct label and color",
      ({ status, label, color }) => {
        render(<StatusBadge status={status} />);

        const badge = screen.getByTestId("status-badge");
        expect(badge).toHaveTextContent(label);
        expect(badge).toHaveClass(
          `MuiChip-color${color.charAt(0).toUpperCase() + color.slice(1)}`
        );
      }
    );
  });

  describe("Performance", () => {
    it("should render quickly with multiple instances", () => {
      const startTime = performance.now();

      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <StatusBadge key={i} status={SkuStatusEnum.ATIVO} />
          ))}
        </div>
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getAllByTestId("status-badge")).toHaveLength(100);
    });
  });

  describe("CSS Classes", () => {
    it("should have all required MUI Chip classes", () => {
      render(<StatusBadge status={SkuStatusEnum.ATIVO} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-root");
      expect(badge).toHaveClass("MuiChip-outlined");
      expect(badge).toHaveClass("MuiChip-sizeSmall");
      expect(badge).toHaveClass("MuiChip-colorSuccess");
    });

    it("should maintain class structure with custom className", () => {
      render(
        <StatusBadge status={SkuStatusEnum.ATIVO} className="custom-class" />
      );

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("MuiChip-root");
      expect(badge).toHaveClass("custom-class");
    });
  });
});
