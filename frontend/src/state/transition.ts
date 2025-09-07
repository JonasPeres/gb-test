import { SkuStatusEnum } from "../types";
import type { SkuStatus } from "../types";

export const ALLOWED_TRANSITIONS: Record<SkuStatusEnum, SkuStatus[]> = {
  [SkuStatusEnum.PRE_CADASTRO]: [
    SkuStatusEnum.CADASTRO_COMPLETO,
    SkuStatusEnum.CANCELADO,
  ],
  [SkuStatusEnum.CADASTRO_COMPLETO]: [
    SkuStatusEnum.PRE_CADASTRO,
    SkuStatusEnum.ATIVO,
    SkuStatusEnum.CANCELADO,
  ],
  [SkuStatusEnum.ATIVO]: [SkuStatusEnum.DESATIVADO],
  [SkuStatusEnum.DESATIVADO]: [SkuStatusEnum.ATIVO, SkuStatusEnum.PRE_CADASTRO],
  [SkuStatusEnum.CANCELADO]: [],
};

export const STATUS_LABELS: Record<SkuStatus, string> = {
  [SkuStatusEnum.PRE_CADASTRO]: "Pré-cadastro",
  [SkuStatusEnum.CADASTRO_COMPLETO]: "Cadastro completo",
  [SkuStatusEnum.ATIVO]: "Ativo",
  [SkuStatusEnum.DESATIVADO]: "Desativado",
  [SkuStatusEnum.CANCELADO]: "Cancelado",
};
