export enum SkuStatusEnum {
  PRE_CADASTRO = "PRE_CADASTRO",
  CADASTRO_COMPLETO = "CADASTRO_COMPLETO",
  ATIVO = "ATIVO",
  DESATIVADO = "DESATIVADO",
  CANCELADO = "CANCELADO",
}

export type SkuStatus =
  | "PRE_CADASTRO"
  | "CADASTRO_COMPLETO"
  | "ATIVO"
  | "DESATIVADO"
  | "CANCELADO";

export interface Sku {
  id: string;
  descricao: string;
  descricaoComercial: string;
  sku: string;
  status: SkuStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiList<T> {
  items: T[];
  total?: number;
}
