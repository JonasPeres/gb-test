import { useMemo, useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSkus } from "./hooks/useSkus";
import SkuTable from "./components/SkuTable/SkuTable";
import DialogSkuForm from "./components/DialogSkuForm/DialogSkuForm";
import type { Sku, SkuStatus } from "./types";
import {
  AppBar,
  Box,
  Button,
  Container,
  TextField,
  Toolbar,
  Typography,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  CardHeader,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { SkuStatusEnum } from "./types";
import DialogSkuDeleteConfirm from "./components/DialogSkuDeleteConfirm/DialogSkuDeleteConfirm";

export default function AppProvider() {
  const client = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  );
}

function App() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SkuStatus | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editSku, setEditSku] = useState<Sku | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<Sku | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const {
    listSkusQuery,
    createSkuMutation,
    updateSkuMutation,
    deleteSkuMutation,
    transitionSkuMutation,
  } = useSkus({
    page,
    status: status || undefined,
  });

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleUpdate = useCallback(
    (data: Partial<Omit<Sku, "id" | "status">>) => {
      if (!editSku) return;

      const payload =
        editSku.status === SkuStatusEnum.CADASTRO_COMPLETO
          ? { descricaoComercial: data.descricaoComercial }
          : data;

      updateSkuMutation.mutate(
        { id: editSku.id, payload },
        {
          onSuccess: () => {
            setEditSku(undefined);
            showSnackbar("SKU atualizado com sucesso!", "success");
          },
          onError: () => showSnackbar("Erro ao atualizar SKU.", "error"),
        }
      );
    },
    [editSku, updateSkuMutation, showSnackbar]
  );

  const handleSubmit = useCallback(
    (data: Partial<Omit<Sku, "id" | "status">>) => {
      if (editSku) {
        handleUpdate(data);
      } else {
        createSkuMutation.mutate(
          { ...data, status: SkuStatusEnum.PRE_CADASTRO },
          {
            onSuccess: () => {
              setCreateOpen(false);
              showSnackbar("SKU criado com sucesso!", "success");
            },
            onError: (error) =>
              showSnackbar(
                error.response.data.message || "Erro ao criar SKU.",
                "error"
              ),
          }
        );
      }
    },
    [editSku, handleUpdate, createSkuMutation, showSnackbar]
  );

  const handleTransition = useCallback(
    (id: string, status: SkuStatus) => {
      transitionSkuMutation.mutate(
        { id, status },
        {
          onSuccess: () => {
            showSnackbar("Status do SKU atualizado com sucesso!", "success");
          },
          onError: () => {
            showSnackbar("Erro ao atualizar status do SKU.", "error");
          },
        }
      );
    },
    [transitionSkuMutation, showSnackbar]
  );

  const handleDelete = useCallback(() => {
    if (confirmDelete) {
      deleteSkuMutation.mutate(confirmDelete.id, {
        onSuccess: () => {
          if (page > 1 && listSkusQuery.data?.items.length === 1) {
            setPage((prev) => Math.max(prev - 1, 1));
          }
          showSnackbar("SKU removido com sucesso!", "success");
          setConfirmDelete(null);
        },
        onError: () => {
          showSnackbar("Erro ao remover SKU.", "error");
          setConfirmDelete(null);
        },
      });
    }
  }, [
    confirmDelete,
    deleteSkuMutation,
    listSkusQuery.data?.items.length,
    page,
    showSnackbar,
  ]);

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStatus(e.target.value as SkuStatus | "");
      setPage(1);
    },
    []
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setCreateOpen(false);
    setEditSku(undefined);
  }, []);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Gestão de SKUs
          </Typography>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardHeader
            titleTypographyProps={{ variant: "h6" }}
            title="Catálogo de SKUs"
            action={
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  select
                  size="small"
                  label="Status"
                  value={status}
                  onChange={handleStatusChange}
                  sx={{ width: 200 }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.values(SkuStatusEnum).map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateOpen(true)}
                >
                  Novo SKU
                </Button>
              </Stack>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <SkuTable
              listSkusQuery={listSkusQuery}
              page={page}
              onEdit={setEditSku}
              onDelete={setConfirmDelete}
              onTransition={handleTransition}
              setPage={setPage}
            />
          </CardContent>
        </Card>
      </Container>

      <DialogSkuForm
        open={createOpen || !!editSku}
        sku={editSku}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <DialogSkuDeleteConfirm
        confirmDelete={confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
