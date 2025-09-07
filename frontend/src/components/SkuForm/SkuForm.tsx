import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Sku } from "@/types";
import { Box, Button, Grid, TextField, Alert } from "@mui/material";

const schema = z.object({
  descricao: z.string().min(3, "Mínimo de 3 caracteres"),
  descricaoComercial: z.string().min(3, "Mínimo de 3 caracteres"),
  sku: z.string().min(1, "Obrigatório"),
});

type FormData = z.infer<typeof schema>;

export default function SkuForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Sku;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao: initial?.descricao ?? "",
      descricaoComercial: initial?.descricaoComercial ?? "",
      sku: initial?.sku ?? "",
    },
  });

  const status = initial?.status;
  const editableDescricao = !status || status === "PRE_CADASTRO";
  const editableDescricaoComercial =
    !status || status === "PRE_CADASTRO" || status === "CADASTRO_COMPLETO";
  const editableSku = !status || status === "PRE_CADASTRO";

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
          <TextField
            label="SKU"
            fullWidth
            disabled={!editableSku}
            error={!!errors.sku}
            helperText={errors.sku?.message}
            {...register("sku")}
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>
      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isSubmitting}
        >
          Salvar
        </Button>
      </Box>
      <Box mt={2}>
        {status === "ATIVO" && (
          <Alert severity="info" variant="outlined">
            Itens ATIVOS não permitem edição.
          </Alert>
        )}
        {status === "DESATIVADO" && (
          <Alert severity="info" variant="outlined">
            Itens DESATIVADOS não permitem edição.
          </Alert>
        )}
      </Box>
    </Box>
  );
}
