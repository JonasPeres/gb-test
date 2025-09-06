import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class TransitionDto {
  @ApiProperty({
    enum: ['PRE_CADASTRO', 'CADASTRO_COMPLETO', 'ATIVO', 'DESATIVADO', 'CANCELADO'],
  })
  @IsEnum(['PRE_CADASTRO', 'CADASTRO_COMPLETO', 'ATIVO', 'DESATIVADO', 'CANCELADO'] as const)
  target!: any;
}