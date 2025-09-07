import { Chip } from "@mui/material";
import { STATUS_LABELS } from "../../state/transition";
import { SkuStatusEnum } from "../../types";
import type { SkuStatus } from "../../types";

const statusColors: Record<
  SkuStatus,
  "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info"
> = {
  [SkuStatusEnum.PRE_CADASTRO]: "warning",
  [SkuStatusEnum.CADASTRO_COMPLETO]: "info",
  [SkuStatusEnum.ATIVO]: "success",
  [SkuStatusEnum.DESATIVADO]: "default",
  [SkuStatusEnum.CANCELADO]: "error",
};

export default function StatusBadge({ status }: { status: SkuStatus }) {
  return (
    <Chip
      data-testid="status-badge"
      label={STATUS_LABELS[status]}
      color={statusColors[status]}
      size="small"
      variant="outlined"
    />
  );
}
