import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSkus } from "./hooks/useSkus";
import SkuTable from "./components/SkuTable/SkuTable";
import SkuForm from "./components/SkuForm/SkuForm";
import type { Sku, SkuStatus } from "./types";
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  CardHeader,
  DialogActions,
  Pagination,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { SkuStatusEnum } from "./types";

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

  const { list, createM, updateM, deleteM, transitionM } = useSkus({
    page,
    status: status || undefined,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<Sku | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<Sku | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpdate = (data: Partial<Omit<Sku, "id" | "status">>) => {
    updateM.mutate(
      { id: edit?.id || "", payload: data },
      {
        onSuccess: () => {
          setEdit(undefined);
          showSnackbar("SKU atualizado com sucesso!", "success");
        },
        onError: () => showSnackbar("Erro ao atualizar SKU.", "error"),
      }
    );
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestão de SKUs
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                  onChange={(e) => setStatus(e.target.value as SkuStatus | "")}
                  sx={{ width: 200 }}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
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
            {list.isLoading && (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            )}
            {list.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Erro ao carregar: {list.error?.message ?? "verifique a API"}
              </Alert>
            )}
            {list.isSuccess && (
              <>
                <SkuTable
                  items={list.data.items ?? []}
                  onEdit={(sku) => setEdit(sku)}
                  onDelete={(sku) => setConfirmDelete(sku)}
                  onTransition={(id, status) =>
                    transitionM.mutate({ id, status })
                  }
                />
                <Stack alignItems="center" mt={3}>
                  <Pagination
                    count={Math.ceil((list.data.total ?? 0) / 4)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Novo SKU
          <IconButton
            aria-label="close"
            onClick={() => setCreateOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <SkuForm
            onSubmit={(data) => {
              createM.mutate(
                { ...data, status: SkuStatusEnum.PRE_CADASTRO },
                {
                  onSuccess: () => {
                    setCreateOpen(false);
                    showSnackbar("SKU criado com sucesso!", "success");
                  },
                  onError: () => showSnackbar("Erro ao criar SKU.", "error"),
                }
              );
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!edit}
        onClose={() => setEdit(undefined)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Editar SKU
          <IconButton
            aria-label="close"
            onClick={() => setEdit(undefined)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <SkuForm
            initial={edit}
            onSubmit={(data) => {
              handleUpdate(data);
            }}
            onCancel={() => setEdit(undefined)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover o SKU <b>{confirmDelete?.sku}</b>?
            Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (confirmDelete) {
                deleteM.mutate(confirmDelete.id, {
                  onSuccess: () => {
                    showSnackbar("SKU removido com sucesso!", "success");
                    setConfirmDelete(null);
                  },
                  onError: () => {
                    showSnackbar("Erro ao remover SKU.", "error");
                    setConfirmDelete(null);
                  },
                });
              }
            }}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
