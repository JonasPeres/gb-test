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
  Button,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TransitionMenu from "../TransitionMenu/TransitionMenu";
import StatusBadge from "../StatusBadge/StatusBadge";
import type { Sku, SkuStatus } from "../../types";

export default function SkuTable({
  items,
  onEdit,
  onDelete,
  onTransition,
}: {
  items: Sku[];
  onEdit: (sku: Sku) => void;
  onDelete: (sku: Sku) => void;
  onTransition: (id: string, status: SkuStatus) => void;
}) {
  if (items.length === 0) {
    return (
      <Typography sx={{ p: 4, textAlign: "center" }}>
        Nenhum SKU encontrado.
      </Typography>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: "none", border: "1px solid #dee2e6" }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="sku table">
        <TableHead>
          <TableRow>
            <TableCell>Descrição</TableCell>
            <TableCell>Descrição Comercial</TableCell>
            <TableCell style={{ width: 160 }}>SKU</TableCell>
            <TableCell style={{ width: 170 }}>Status</TableCell>
            <TableCell style={{ width: 200 }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>{item.descricao}</TableCell>
              <TableCell>{item.descricaoComercial}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell width="240px">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TransitionMenu sku={item} onTransition={onTransition} />
                  <Tooltip title="Editar SKU" placement="top-end">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(item)}
                      aria-label="Editar SKU"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover SKU" placement="top-end">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(item)}
                      color="error"
                      aria-label="Remover SKU"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
