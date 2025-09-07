import {
  Menu,
  MenuItem,
  Button,
  ListItemText,
  Typography,
} from "@mui/material";
import { ALLOWED_TRANSITIONS, STATUS_LABELS } from "../../state/transition";
import type { Sku, SkuStatus } from "../../types";
import { useState } from "react";

export default function TransitionMenu({
  sku,
  onTransition,
}: {
  sku: Sku;
  onTransition: (id: string, status: SkuStatus) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const possible = ALLOWED_TRANSITIONS[sku.status];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<span style={{ fontSize: 12 }}>▾</span>}
        size="small"
      >
        Mudar status
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {possible.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>
              <Typography variant="body2" color="text.secondary">
                Sem transições possíveis
              </Typography>
            </ListItemText>
          </MenuItem>
        ) : (
          possible.map((p) => (
            <MenuItem
              key={p}
              onClick={() => {
                onTransition(sku.id, p);
                handleClose();
              }}
            >
              {STATUS_LABELS[p]}
            </MenuItem>
          ))
        )}
      </Menu>
    </div>
  );
}
