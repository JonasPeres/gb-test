import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client/wasm';
import { IsEnum } from 'class-validator';

export class TransitionDto {
  @ApiProperty({
    enum: Status,
  })
  @IsEnum(Status)
  target!: Status;
}
