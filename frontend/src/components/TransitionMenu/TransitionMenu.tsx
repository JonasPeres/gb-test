import React, { useCallback, useMemo, useState } from "react";
import { Menu, MenuItem, Button, Tooltip } from "@mui/material";
import { ALLOWED_TRANSITIONS, STATUS_LABELS } from "../../state/transition";
import type { Sku, SkuStatus } from "../../types";

type TransitionMenuProps = {
  sku: Sku;
  onTransition: (id: string, status: SkuStatus) => void;
};

const TransitionMenu: React.FC<TransitionMenuProps> = ({
  sku,
  onTransition,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const allowedTransitions = useMemo(
    () => ALLOWED_TRANSITIONS[sku.status] || [],
    [sku.status]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleTransition = useCallback(
    (status: SkuStatus) => {
      onTransition(sku.id, status);
      handleClose();
    },
    [onTransition, sku.id, handleClose]
  );

  return (
    <div>
      <Tooltip
        title={!allowedTransitions.length ? "Sem transições possíveis" : ""}
        disableFocusListener
      >
        <span>
          <Button
            variant="outlined"
            onClick={handleClick}
            endIcon={<span style={{ fontSize: 12 }}>▾</span>}
            size="small"
            disabled={!allowedTransitions.length}
          >
            Mudar status
          </Button>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {allowedTransitions.map((status) => (
          <MenuItem key={status} onClick={() => handleTransition(status)}>
            {STATUS_LABELS[status]}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default TransitionMenu;
