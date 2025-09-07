import React, { memo } from "react";
import Chip from "@mui/material/Chip";
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

type StatusBadgeProps = {
  status: SkuStatus;
  className?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = memo(
  ({ status, className }) => {
    const label = STATUS_LABELS[status] ?? status;
    const color = statusColors[status] ?? "default";

    return (
      <Chip
        data-testid="status-badge"
        label={label}
        color={color}
        size="small"
        variant="outlined"
        className={className}
      />
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;
