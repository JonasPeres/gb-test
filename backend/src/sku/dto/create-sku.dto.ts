import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSkuDto {
  @ApiProperty() @IsString() descricao!: string;
  @ApiProperty() @IsString() descricaoComercial!: string;
  @ApiProperty() @IsString() sku!: string;

  @ApiProperty({
    required: false,
    enum: ['PRE_CADASTRO', 'CADASTRO_COMPLETO', 'ATIVO', 'DESATIVADO', 'CANCELADO'],
  })
  @IsOptional()
  @IsEnum(['PRE_CADASTRO', 'CADASTRO_COMPLETO', 'ATIVO', 'DESATIVADO', 'CANCELADO'] as const)
  status?: any;
}