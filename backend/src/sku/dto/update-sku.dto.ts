import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSkuDto {
  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descricaoComercial?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sku?: string;
}