import { IsEnum, IsOptional, IsString } from 'class-validator';
export class CreateSkuDto {
  @IsString() descricao!: string;
  @IsString() descricaoComercial!: string;
  @IsString() sku!: string;
  @IsOptional()
  @IsEnum([
    'PRE_CADASTRO',
    'CADASTRO_COMPLETO',
    'ATIVO',
    'DESATIVADO',
    'CANCELADO',
  ] as const)
  status?: any;
}
