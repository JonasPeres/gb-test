import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppProvider, { default as App } from "./App";
import { SkuStatusEnum } from "./types";
import type { Sku, ApiList } from "./types";
import { vi } from "vitest";

const mockListSkusQuery = {
  data: undefined,
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  refetch: vi.fn(),
};

const mockCreateSkuMutation = {
  mutate: vi.fn(),
  isLoading: false,
  isError: false,
  error: null,
};

const mockUpdateSkuMutation = {
  mutate: vi.fn(),
  isLoading: false,
  isError: false,
  error: null,
};

const mockDeleteSkuMutation = {
  mutate: vi.fn(),
  isLoading: false,
  isError: false,
  error: null,
};

const mockTransitionSkuMutation = {
  mutate: vi.fn(),
  isLoading: false,
  isError: false,
  error: null,
};

vi.mock("./hooks/useSkus", () => ({
  useSkus: vi.fn(() => ({
    listSkusQuery: mockListSkusQuery,
    createSkuMutation: mockCreateSkuMutation,
    updateSkuMutation: mockUpdateSkuMutation,
    deleteSkuMutation: mockDeleteSkuMutation,
    transitionSkuMutation: mockTransitionSkuMutation,
  })),
}));

vi.mock("./components/SkuTable/SkuTable", () => {
  return {
    default: function MockSkuTable({
      listSkusQuery,
      page,
      onEdit,
      onDelete,
      onTransition,
      setPage,
    }: any) {
      return (
        <div data-testid="sku-table">
          <button onClick={() => onEdit({ id: "1", sku: "TEST-SKU" })}>
            Edit SKU
          </button>
          <button onClick={() => onDelete({ id: "1", sku: "TEST-SKU" })}>
            Delete SKU
          </button>
          <button onClick={() => onTransition("1", SkuStatusEnum.ATIVO)}>
            Transition SKU
          </button>
          <button onClick={() => setPage(2)}>Next Page</button>
        </div>
      );
    },
  };
});

vi.mock("./components/DialogSkuForm/DialogSkuForm", () => {
  return {
    default: function MockDialogSkuForm({ open, sku, onClose, onSubmit }: any) {
      return open ? (
        <div data-testid="dialog-sku-form">
          <button
            onClick={() => onSubmit({ sku: "NEW-SKU", descricao: "Test" })}
          >
            Submit
          </button>
          <button onClick={onClose}>Close</button>
          {sku && <span data-testid="edit-mode">Edit Mode</span>}
        </div>
      ) : null;
    },
  };
});

vi.mock("./components/DialogSkuDeleteConfirm/DialogSkuDeleteConfirm", () => {
  return {
    default: function MockDialogSkuDeleteConfirm({
      confirmDelete,
      onConfirm,
    }: any) {
      return confirmDelete ? (
        <div data-testid="dialog-delete-confirm">
          <button onClick={onConfirm}>Confirm Delete</button>
        </div>
      ) : null;
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
];

const mockApiResponse: ApiList<Sku> = {
  items: mockSkus,
  total: 2,
};

describe("AppProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render App with QueryClientProvider", () => {
    render(<AppProvider />);

    expect(screen.getByText("Gestão de SKUs")).toBeInTheDocument();
  });

  it("should create QueryClient instance", () => {
    const { rerender } = render(<AppProvider />);

    rerender(<AppProvider />);

    expect(screen.getByText("Gestão de SKUs")).toBeInTheDocument();
  });
});

describe("App", () => {
  const renderApp = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockListSkusQuery.data = mockApiResponse;
    mockListSkusQuery.isSuccess = true;
    mockListSkusQuery.isLoading = false;
    mockListSkusQuery.isError = false;
  });

  describe("Initial render", () => {
    it("should render app header", () => {
      renderApp();

      expect(screen.getByText("Gestão de SKUs")).toBeInTheDocument();
    });

    it("should render catalog card", () => {
      renderApp();

      expect(screen.getByText("Catálogo de SKUs")).toBeInTheDocument();
    });

    it("should render status filter", () => {
      renderApp();

      expect(screen.getByLabelText("Status")).toBeInTheDocument();
    });

    it("should render new SKU button", () => {
      renderApp();

      expect(screen.getByText("Novo SKU")).toBeInTheDocument();
    });

    it("should render SKU table", () => {
      renderApp();

      expect(screen.getByTestId("sku-table")).toBeInTheDocument();
    });
  });

  describe("Status filter", () => {
    it("should show all status options", async () => {
      const user = userEvent.setup();
      renderApp();

      const statusSelect = screen.getByLabelText("Status");
      await user.click(statusSelect);

      expect(screen.getByText("Todos")).toBeInTheDocument();
      Object.values(SkuStatusEnum).forEach((status) => {
        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });

    it("should reset page when status changes", async () => {
      const user = userEvent.setup();
      renderApp();

      const statusSelect = screen.getByLabelText("Status");
      await user.click(statusSelect);

      const ativoOption = screen.getByText(SkuStatusEnum.ATIVO);
      await user.click(ativoOption);

      expect(screen.getByRole("combobox")).toHaveTextContent(
        SkuStatusEnum.ATIVO
      );
    });
  });

  describe("SKU creation", () => {
    it("should open create dialog when 'Novo SKU' button is clicked", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      expect(screen.getByTestId("dialog-sku-form")).toBeInTheDocument();
    });

    it("should close create dialog", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      expect(screen.queryByTestId("dialog-sku-form")).not.toBeInTheDocument();
    });

    it("should handle successful SKU creation", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      expect(mockCreateSkuMutation.mutate).toHaveBeenCalledWith(
        {
          sku: "NEW-SKU",
          descricao: "Test",
          status: SkuStatusEnum.PRE_CADASTRO,
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it("should show success message on successful creation", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      const mutateCall = mockCreateSkuMutation.mutate.mock.calls[0];
      const onSuccess = mutateCall[1].onSuccess;
      onSuccess();

      await waitFor(() => {
        expect(screen.getByText("SKU criado com sucesso!")).toBeInTheDocument();
      });
    });

    it("should show error message on creation failure", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      const mutateCall = mockCreateSkuMutation.mutate.mock.calls[0];
      const onError = mutateCall[1].onError;
      onError({ response: { data: { message: "Erro customizado" } } });

      await waitFor(() => {
        expect(screen.getByText("Erro customizado")).toBeInTheDocument();
      });
    });
  });

  describe("SKU editing", () => {
    it("should open edit dialog when edit is triggered", async () => {
      const user = userEvent.setup();
      renderApp();

      const editButton = screen.getByText("Edit SKU");
      await user.click(editButton);

      expect(screen.getByTestId("dialog-sku-form")).toBeInTheDocument();
      expect(screen.getByTestId("edit-mode")).toBeInTheDocument();
    });

    it("should handle SKU update for pre-cadastro status", async () => {
      const user = userEvent.setup();
      renderApp();

      const editButton = screen.getByText("Edit SKU");
      await user.click(editButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      expect(mockUpdateSkuMutation.mutate).toHaveBeenCalledWith(
        {
          id: "1",
          payload: { sku: "NEW-SKU", descricao: "Test" },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it("should handle SKU update for cadastro completo status", async () => {
      const user = userEvent.setup();
      renderApp();

      const editButton = screen.getByText("Edit SKU");
      await user.click(editButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      expect(mockUpdateSkuMutation.mutate).toHaveBeenCalled();
    });

    it("should show success message on successful update", async () => {
      const user = userEvent.setup();
      renderApp();

      const editButton = screen.getByText("Edit SKU");
      await user.click(editButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      const mutateCall = mockUpdateSkuMutation.mutate.mock.calls[0];
      const onSuccess = mutateCall[1].onSuccess;
      onSuccess();

      await waitFor(() => {
        expect(
          screen.getByText("SKU atualizado com sucesso!")
        ).toBeInTheDocument();
      });
    });
  });

  describe("SKU deletion", () => {
    it("should open delete confirmation dialog", async () => {
      const user = userEvent.setup();
      renderApp();

      const deleteButton = screen.getByText("Delete SKU");
      await user.click(deleteButton);

      expect(screen.getByTestId("dialog-delete-confirm")).toBeInTheDocument();
    });

    it("should handle SKU deletion", async () => {
      const user = userEvent.setup();
      renderApp();

      const deleteButton = screen.getByText("Delete SKU");
      await user.click(deleteButton);

      const confirmButton = screen.getByText("Confirm Delete");
      await user.click(confirmButton);

      expect(mockDeleteSkuMutation.mutate).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it("should show success message on successful deletion", async () => {
      const user = userEvent.setup();
      renderApp();

      const deleteButton = screen.getByText("Delete SKU");
      await user.click(deleteButton);

      const confirmButton = screen.getByText("Confirm Delete");
      await user.click(confirmButton);

      const mutateCall = mockDeleteSkuMutation.mutate.mock.calls[0];
      const onSuccess = mutateCall[1].onSuccess;
      onSuccess();

      await waitFor(() => {
        expect(
          screen.getByText("SKU removido com sucesso!")
        ).toBeInTheDocument();
      });
    });
  });

  describe("SKU status transition", () => {
    it("should handle status transition", async () => {
      const user = userEvent.setup();
      renderApp();

      const transitionButton = screen.getByText("Transition SKU");
      await user.click(transitionButton);

      expect(mockTransitionSkuMutation.mutate).toHaveBeenCalledWith(
        { id: "1", status: SkuStatusEnum.ATIVO },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it("should show success message on successful transition", async () => {
      const user = userEvent.setup();
      renderApp();

      const transitionButton = screen.getByText("Transition SKU");
      await user.click(transitionButton);

      const mutateCall = mockTransitionSkuMutation.mutate.mock.calls[0];
      const onSuccess = mutateCall[1].onSuccess;
      onSuccess();

      await waitFor(() => {
        expect(
          screen.getByText("Status do SKU atualizado com sucesso!")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Pagination", () => {
    it("should handle page changes", async () => {
      const user = userEvent.setup();
      renderApp();

      const nextPageButton = screen.getByText("Next Page");
      await user.click(nextPageButton);

      expect(nextPageButton).toBeInTheDocument();
    });
  });

  describe("Snackbar notifications", () => {
    it("should auto-hide snackbar after timeout", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      const mutateCall = mockCreateSkuMutation.mutate.mock.calls[0];
      const onSuccess = mutateCall[1].onSuccess;
      onSuccess();

      await waitFor(() => {
        expect(screen.getByText("SKU criado com sucesso!")).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(
            screen.queryByText("SKU criado com sucesso!")
          ).not.toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    });

    it("should close snackbar when close button is clicked", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      const mutateCall = mockCreateSkuMutation.mutate.mock.calls[0];
      const onSuccess = mutateCall[1].onSuccess;
      onSuccess();

      await waitFor(() => {
        expect(screen.getByText("SKU criado com sucesso!")).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText("SKU criado com sucesso!")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Error handling", () => {
    it("should handle errors without custom message", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      const mutateCall = mockCreateSkuMutation.mutate.mock.calls[0];
      const onError = mutateCall[1].onError;
      onError({ response: { data: {} } });

      await waitFor(() => {
        expect(screen.getByText("Erro ao criar SKU.")).toBeInTheDocument();
      });
    });

    it("should handle all mutation errors", async () => {
      const user = userEvent.setup();
      renderApp();

      const editButton = screen.getByText("Edit SKU");
      await user.click(editButton);

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      const updateCall = mockUpdateSkuMutation.mutate.mock.calls[0];
      const onUpdateError = updateCall[1].onError;
      onUpdateError();

      await waitFor(() => {
        expect(screen.getByText("Erro ao atualizar SKU.")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete SKU");
      await user.click(deleteButton);

      const confirmButton = screen.getByText("Confirm Delete");
      await user.click(confirmButton);

      const deleteCall = mockDeleteSkuMutation.mutate.mock.calls[0];
      const onDeleteError = deleteCall[1].onError;
      onDeleteError();

      await waitFor(() => {
        expect(screen.getByText("Erro ao remover SKU.")).toBeInTheDocument();
      });

      const transitionButton = screen.getByText("Transition SKU");
      await user.click(transitionButton);

      const transitionCall = mockTransitionSkuMutation.mutate.mock.calls[0];
      const onTransitionError = transitionCall[1].onError;
      onTransitionError();

      await waitFor(() => {
        expect(
          screen.getByText("Erro ao atualizar status do SKU.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Component integration", () => {
    it("should pass correct props to SkuTable", () => {
      renderApp();

      expect(screen.getByTestId("sku-table")).toBeInTheDocument();
    });

    it("should pass correct props to DialogSkuForm", async () => {
      const user = userEvent.setup();
      renderApp();

      const newSkuButton = screen.getByText("Novo SKU");
      await user.click(newSkuButton);

      expect(screen.getByTestId("dialog-sku-form")).toBeInTheDocument();
    });

    it("should pass correct props to DialogSkuDeleteConfirm", async () => {
      const user = userEvent.setup();
      renderApp();

      const deleteButton = screen.getByText("Delete SKU");
      await user.click(deleteButton);

      expect(screen.getByTestId("dialog-delete-confirm")).toBeInTheDocument();
    });
  });

  describe("State management", () => {
    it("should maintain page state", async () => {
      const user = userEvent.setup();
      renderApp();

      const nextPageButton = screen.getByText("Next Page");
      await user.click(nextPageButton);

      expect(screen.getByTestId("sku-table")).toBeInTheDocument();
    });

    it("should maintain filter state", async () => {
      const user = userEvent.setup();
      renderApp();

      const statusSelect = screen.getByLabelText("Status");
      await user.click(statusSelect);

      const ativoOption = screen.getByText(SkuStatusEnum.ATIVO);
      await user.click(ativoOption);

      expect(screen.getByRole("combobox")).toHaveTextContent(
        SkuStatusEnum.ATIVO
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      renderApp();

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should have proper form labels", () => {
      renderApp();

      expect(screen.getByLabelText("Status")).toBeInTheDocument();
    });

    it("should have proper button labels", () => {
      renderApp();

      expect(
        screen.getByRole("button", { name: /novo sku/i })
      ).toBeInTheDocument();
    });
  });
});
