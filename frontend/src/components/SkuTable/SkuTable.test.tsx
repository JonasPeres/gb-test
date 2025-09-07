import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SkuTable from "./SkuTable";
import { SkuStatusEnum, ApiList, Sku } from "../../types";
import { UseQueryResult } from "@tanstack/react-query";
import { vi } from "vitest";

vi.mock("../TransitionMenu/TransitionMenu", () => {
  return {
    default: function MockTransitionMenu({ sku, onTransition }: any) {
      return (
        <button
          data-testid={`transition-menu-${sku.id}`}
          onClick={() => onTransition(sku.id, SkuStatusEnum.ATIVO)}
        >
          Transition Menu
        </button>
      );
    },
  };
});

vi.mock("../StatusBadge/StatusBadge", () => {
  return {
    default: function MockStatusBadge({ status }: any) {
      return <span data-testid={`status-badge-${status}`}>{status}</span>;
    },
  };
});

const mockSkus: Sku[] = [
  {
    id: "1",
    sku: "SKU-001",
    descricao: "Produto 1",
    descricaoComercial: "Produto Comercial 1",
    status: SkuStatusEnum.PRE_CADASTRO,
  },
  {
    id: "2",
    sku: "SKU-002",
    descricao: "Produto 2",
    descricaoComercial: "Produto Comercial 2",
    status: SkuStatusEnum.ATIVO,
  },
  {
    id: "3",
    sku: "SKU-003",
    descricao: "Produto 3",
    descricaoComercial: "Produto Comercial 3",
    status: SkuStatusEnum.CANCELADO,
  },
  {
    id: "4",
    sku: "SKU-004",
    descricao: "Produto 4",
    descricaoComercial: "Produto Comercial 4",
    status: SkuStatusEnum.DESATIVADO,
  },
];

const mockApiResponse: ApiList<Sku> = {
  items: mockSkus,
  total: 4,
};

const createMockQuery = (
  data?: ApiList<Sku>,
  isLoading = false,
  isError = false,
  error?: Error
): UseQueryResult<ApiList<Sku>, Error> =>
  ({
    data,
    isLoading,
    isError,
    isSuccess: !isLoading && !isError && !!data,
    error,
    status: isLoading ? "pending" : isError ? "error" : "success",
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: Date.now(),
    failureCount: 0,
    failureReason: null,
    fetchStatus: "idle",
    isInitialLoading: isLoading,
    isFetched: !isLoading,
    isFetchedAfterMount: !isLoading,
    isFetching: false,
    isLoadingError: false,
    isPaused: false,
    isPlaceholderData: false,
    isPreviousData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    refetch: vi.fn(),
    remove: vi.fn(),
  } as unknown as UseQueryResult<ApiList<Sku>, Error>);

const defaultProps = {
  page: 1,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onTransition: vi.fn(),
  setPage: vi.fn(),
};

describe("SkuTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading state", () => {
    it("should display loading spinner when isLoading is true", () => {
      const mockQuery = createMockQuery(undefined, true);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("Error state", () => {
    it("should display error alert when isError is true", () => {
      const error = new Error("API Error");
      const mockQuery = createMockQuery(undefined, false, true, error);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Erro ao carregar: API Error")
      ).toBeInTheDocument();
    });

    it("should display generic error message when error has no message", () => {
      const mockQuery = createMockQuery(undefined, false, true);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(
        screen.getByText("Erro ao carregar: verifique a API")
      ).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("should display empty message when no items are returned", () => {
      const emptyResponse: ApiList<Sku> = { items: [], total: 0 };
      const mockQuery = createMockQuery(emptyResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.getByText("Nenhum SKU encontrado.")).toBeInTheDocument();
    });

    it("should display empty message when items is undefined", () => {
      const mockQuery = createMockQuery({ total: 0 } as ApiList<Sku>);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.getByText("Nenhum SKU encontrado.")).toBeInTheDocument();
    });
  });

  describe("Success state with data", () => {
    it("should render table with correct headers", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(
        screen.getByRole("table", { name: "sku table" })
      ).toBeInTheDocument();
      expect(screen.getByText("SKU")).toBeInTheDocument();
      expect(screen.getByText("Descrição")).toBeInTheDocument();
      expect(screen.getByText("Descrição Comercial")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Ações")).toBeInTheDocument();
    });

    it("should render all SKU items correctly", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      mockSkus.forEach((sku) => {
        expect(screen.getByText(sku.sku)).toBeInTheDocument();
        expect(screen.getByText(sku.descricao)).toBeInTheDocument();
        expect(screen.getByText(sku.descricaoComercial)).toBeInTheDocument();
        expect(
          screen.getByTestId(`status-badge-${sku.status}`)
        ).toBeInTheDocument();
      });
    });

    it("should render action buttons for each item", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      mockSkus.forEach((sku) => {
        expect(
          screen.getByTestId(`transition-menu-${sku.id}`)
        ).toBeInTheDocument();
        expect(screen.getAllByLabelText(`Editar SKU`)[0]).toBeInTheDocument();
        expect(screen.getAllByLabelText(`Excluir SKU`)[0]).toBeInTheDocument();
      });
    });
  });

  describe("Action buttons", () => {
    it("should call onEdit when edit button is clicked", async () => {
      const user = userEvent.setup();
      const onEditMock = vi.fn();
      const mockQuery = createMockQuery(mockApiResponse);

      render(
        <SkuTable
          {...defaultProps}
          listSkusQuery={mockQuery}
          onEdit={onEditMock}
        />
      );

      const editButtons = screen.getAllByRole("button", { name: "Editar SKU" });
      await user.click(editButtons[0]);

      expect(onEditMock).toHaveBeenCalledWith(mockSkus[0]);
    });

    it("should call onDelete when delete button is clicked", async () => {
      const user = userEvent.setup();
      const onDeleteMock = vi.fn();
      const mockQuery = createMockQuery(mockApiResponse);

      render(
        <SkuTable
          {...defaultProps}
          listSkusQuery={mockQuery}
          onDelete={onDeleteMock}
        />
      );

      const deleteButtons = screen.getAllByLabelText("Excluir SKU");
      await user.click(deleteButtons[0]);

      expect(onDeleteMock).toHaveBeenCalledWith(mockSkus[0]);
    });

    it("should call onTransition when transition menu is used", async () => {
      const user = userEvent.setup();
      const onTransitionMock = vi.fn();
      const mockQuery = createMockQuery(mockApiResponse);

      render(
        <SkuTable
          {...defaultProps}
          listSkusQuery={mockQuery}
          onTransition={onTransitionMock}
        />
      );

      const transitionButton = screen.getByTestId("transition-menu-1");
      await user.click(transitionButton);

      expect(onTransitionMock).toHaveBeenCalledWith("1", SkuStatusEnum.ATIVO);
    });
  });

  describe("Edit button disabled states", () => {
    it("should disable edit button for CANCELADO status", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      const editButtons = screen.getAllByRole("button", { name: "Editar SKU" });
      const canceledSkuEditButton = editButtons[2];

      expect(canceledSkuEditButton).toBeDisabled();
    });

    it("should disable edit button for DESATIVADO status", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      const editButtons = screen.getAllByRole("button", { name: "Editar SKU" });
      const deactivatedSkuEditButton = editButtons[3];

      expect(deactivatedSkuEditButton).toBeDisabled();
    });

    it("should enable edit button for other statuses", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      const editButtons = screen.getAllByRole("button", { name: "Editar SKU" });
      const preCadastroEditButton = editButtons[0];
      const ativoEditButton = editButtons[1];

      expect(preCadastroEditButton).not.toBeDisabled();
      expect(ativoEditButton).not.toBeDisabled();
    });
  });

  describe("Tooltips", () => {
    it("should show edit tooltip for enabled buttons", async () => {
      const user = userEvent.setup();
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      const editButtons = screen.getAllByLabelText("Editar SKU");
      await user.hover(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Editar SKU")).toBeInTheDocument();
      });
    });

    it("should show disabled tooltip for CANCELADO status", async () => {
      const user = userEvent.setup();
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      const editButton = screen.getAllByRole("button", {
        name: "Editar SKU",
      })[2];
      await user.hover(editButton.parentElement!);

      await waitFor(() => {
        expect(
          screen.getByText(/Não é possível editar um SKU com status cancelado/)
        ).toBeInTheDocument();
      });
    });

    it("should show disabled tooltip for DESATIVADO status", async () => {
      const user = userEvent.setup();
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      const editButton = screen.getAllByRole("button", {
        name: "Editar SKU",
      })[3];
      await user.hover(editButton.parentElement!);

      await waitFor(() => {
        expect(
          screen.getByText(/Não é possível editar um SKU com status desativado/)
        ).toBeInTheDocument();
      });
    });

    it("should show delete tooltip", async () => {
      const user = userEvent.setup();
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      const deleteButtons = screen.getAllByLabelText("Excluir SKU");
      await user.hover(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Excluir SKU")).toBeInTheDocument();
      });
    });
  });

  describe("Pagination", () => {
    it("should not render pagination when totalPages <= 1", () => {
      const singlePageResponse: ApiList<Sku> = {
        items: [mockSkus[0]],
        total: 1,
      };
      const mockQuery = createMockQuery(singlePageResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("should render pagination when totalPages > 1", () => {
      const multiPageResponse: ApiList<Sku> = {
        items: mockSkus,
        total: 10,
      };
      const mockQuery = createMockQuery(multiPageResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should call setPage when pagination button is clicked", async () => {
      const user = userEvent.setup();
      const setPageMock = vi.fn();
      const multiPageResponse: ApiList<Sku> = {
        items: mockSkus,
        total: 10,
      };
      const mockQuery = createMockQuery(multiPageResponse);

      render(
        <SkuTable
          {...defaultProps}
          listSkusQuery={mockQuery}
          setPage={setPageMock}
        />
      );

      const nextPageButton = screen.getByLabelText("Go to page 2");
      await user.click(nextPageButton);

      expect(setPageMock).toHaveBeenCalledWith(2);
    });

    it("should display correct current page", () => {
      const multiPageResponse: ApiList<Sku> = {
        items: mockSkus,
        total: 10,
      };
      const mockQuery = createMockQuery(multiPageResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} page={2} />);

      expect(screen.getByLabelText("page 2")).toBeInTheDocument();
    });

    it("should calculate total pages correctly", () => {
      const multiPageResponse: ApiList<Sku> = {
        items: mockSkus,
        total: 15,
      };
      const mockQuery = createMockQuery(multiPageResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.getByLabelText("Go to page 4")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined data gracefully", () => {
      const mockQuery = createMockQuery(undefined);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.getByText("Nenhum SKU encontrado.")).toBeInTheDocument();
    });

    it("should handle zero total correctly", () => {
      const zeroTotalResponse: ApiList<Sku> = {
        items: [],
        total: 0,
      };
      const mockQuery = createMockQuery(zeroTotalResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("should handle missing page prop", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(
        <SkuTable
          {...defaultProps}
          listSkusQuery={mockQuery}
          page={undefined}
        />
      );

      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(
        screen.getByRole("table", { name: "sku table" })
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: "Editar SKU" })
      ).toHaveLength(4);
      expect(screen.getAllByLabelText("Excluir SKU")).toHaveLength(4);
    });

    it("should have proper table structure", () => {
      const mockQuery = createMockQuery(mockApiResponse);

      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("columnheader")).toHaveLength(5);
      expect(screen.getAllByRole("row")).toHaveLength(5);
    });
  });

  describe("Memoization", () => {
    it("should be memoized component", () => {
      expect(SkuTable.$$typeof).toBe(Symbol.for("react.memo"));
    });
  });

  describe("Performance", () => {
    it("should handle large datasets efficiently", () => {
      const largeDataset: Sku[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        sku: `SKU-${String(i + 1).padStart(3, "0")}`,
        descricao: `Produto ${i + 1}`,
        descricaoComercial: `Produto Comercial ${i + 1}`,
        status: SkuStatusEnum.PRE_CADASTRO,
      }));

      const largeResponse: ApiList<Sku> = {
        items: largeDataset.slice(0, 4),
        total: 100,
      };
      const mockQuery = createMockQuery(largeResponse);

      const startTime = performance.now();
      render(<SkuTable {...defaultProps} listSkusQuery={mockQuery} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });
});
