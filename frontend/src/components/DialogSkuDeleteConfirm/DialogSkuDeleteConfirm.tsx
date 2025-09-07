import React, { useCallback, useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Sku } from "../../types";

type DialogSkuDeleteConfirmProps = {
  confirmDelete: Sku | null;
  onClose: () => void;
  onConfirm: () => void;
};

const DialogSkuDeleteConfirm: React.FC<DialogSkuDeleteConfirmProps> = ({
  confirmDelete,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(() => {
    setIsDeleting(true);
    if (onConfirm) {
      onConfirm();
    }
  }, [onConfirm]);

  useEffect(() => {
    if (confirmDelete === null) {
      setIsDeleting(false);
    }
  }, [confirmDelete]);

  return (
    <Dialog
      open={!!confirmDelete}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Confirmar Exclusão de SKU
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Tem certeza de que deseja excluir o SKU{" "}
          <strong>{confirmDelete?.sku}</strong>? Essa ação não pode ser
          desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isDeleting}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={!confirmDelete || isDeleting}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogSkuDeleteConfirm;
