import { IsOptional, IsString } from 'class-validator';
export class UpdateSkuDto {
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @IsString() descricaoComercial?: string;
  @IsOptional() @IsString() sku?: string;
}
