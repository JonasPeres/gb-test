import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client/wasm';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSkuDto {
  @ApiProperty() @IsString() descricao!: string;
  @ApiProperty() @IsString() descricaoComercial!: string;
  @ApiProperty() @IsString() sku!: string;

  @ApiProperty({
    required: false,
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
