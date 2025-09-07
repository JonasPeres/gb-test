import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TransitionMenu from "../TransitionMenu/TransitionMenu";
import StatusBadge from "../StatusBadge/StatusBadge";
import { ApiList, SkuStatusEnum, Sku, SkuStatus } from "../../types";
import { STATUS_LABELS } from "../../state/transition";
import { UseQueryResult } from "@tanstack/react-query";

type SkuTableProps = {
  listSkusQuery: UseQueryResult<ApiList<Sku>, Error>;
  page?: number;
  onEdit: (sku: Sku) => void;
  onDelete: (sku: Sku) => void;
  onTransition: (id: string, status: SkuStatus) => void;
  setPage: (page: number) => void;
};

const ROWS_PER_PAGE = 4;

const SkuTable: React.FC<SkuTableProps> = ({
  listSkusQuery,
  page = 1,
  onEdit,
  onDelete,
  onTransition,
  setPage,
}) => {
  const { data, isLoading, isError, isSuccess, error } = listSkusQuery;

  const totalPages = useMemo(
    () => Math.ceil((data?.total ?? 0) / ROWS_PER_PAGE),
    [data?.total]
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Erro ao carregar: {error?.message ?? "verifique a API"}
      </Alert>
    );
  }

  return (
    <div>
      {isSuccess && data?.items && data.items.length > 0 ? (
        <>
          <TableContainer
            component={Paper}
            sx={{ boxShadow: "none", border: "1px solid #dee2e6" }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="sku table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: 160 }}>SKU</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Descrição Comercial</TableCell>
                  <TableCell style={{ width: 170 }}>Status</TableCell>
                  <TableCell style={{ width: 200 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((item) => {
                  const isEditDisabled = [
                    SkuStatusEnum.CANCELADO,
                    SkuStatusEnum.DESATIVADO,
                  ].includes(item.status);

                  return (
                    <TableRow
                      key={item.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>{item.descricaoComercial}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell width="240px">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TransitionMenu
                            sku={item}
                            onTransition={onTransition}
                          />
                          <Tooltip
                            title={
                              isEditDisabled
                                ? `Não é possível editar um SKU com status ${STATUS_LABELS[
                                    item.status
                                  ].toLowerCase()}`
                                : "Editar SKU"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => onEdit(item)}
                                aria-label="Editar SKU"
                                disabled={isEditDisabled}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Excluir SKU">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(item)}
                              color="error"
                              aria-label="Excluir SKU"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Stack alignItems="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          )}
        </>
      ) : (
        <Typography sx={{ p: 4, textAlign: "center" }}>
          Nenhum SKU encontrado.
        </Typography>
      )}
    </div>
  );
};

export default React.memo(SkuTable);
