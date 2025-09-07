import React, { useEffect, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SkuStatusEnum, type Sku } from "../../types";

const schema = z.object({
  descricao: z.string().min(3, "Mínimo de 3 caracteres"),
  descricaoComercial: z.string().min(3, "Mínimo de 3 caracteres"),
  sku: z.string().min(1, "Obrigatório"),
});

type FormData = z.infer<typeof schema>;

type DialogSkuFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  sku?: Sku;
  title?: string;
};

const DialogSkuForm: React.FC<DialogSkuFormProps> = ({
  open,
  onClose,
  onSubmit,
  sku,
  title = "Novo SKU",
}) => {
  const defaultValues = useMemo(
    () => ({
      descricao: sku?.descricao ?? "",
      descricaoComercial: sku?.descricaoComercial ?? "",
      sku: sku?.sku ?? "",
    }),
    [sku]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset, open]);

  const status = sku?.status;
  const editableDescricao = !status || status === SkuStatusEnum.PRE_CADASTRO;
  const editableDescricaoComercial =
    !status ||
    status === SkuStatusEnum.PRE_CADASTRO ||
    status === SkuStatusEnum.CADASTRO_COMPLETO;
  const editableSku = !status || status === SkuStatusEnum.PRE_CADASTRO;

  const handleFormSubmit = handleSubmit((data) => onSubmit(data));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleFormSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="SKU"
                  fullWidth
                  disabled={!editableSku}
                  error={!!errors.sku}
                  helperText={errors.sku?.message}
                  {...register("sku")}
                  variant="outlined"
                  size="small"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  fullWidth
                  disabled={!editableDescricao}
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message}
                  {...register("descricao")}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Descrição Comercial"
                  fullWidth
                  disabled={!editableDescricaoComercial}
                  error={!!errors.descricaoComercial}
                  helperText={errors.descricaoComercial?.message}
                  {...register("descricaoComercial")}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            type="submit"
          >
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default DialogSkuForm;
