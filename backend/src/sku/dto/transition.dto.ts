import { IsEnum } from 'class-validator';
export class TransitionDto {
  @IsEnum([
    'PRE_CADASTRO',
    'CADASTRO_COMPLETO',
    'ATIVO',
    'DESATIVADO',
    'CANCELADO',
  ] as const)
  target!: any;
}
