import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { SkuService } from './sku.service';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';
import { TransitionDto } from './dto/transition.dto';

@Controller('skus')
export class SkuController {
  constructor(private readonly service: SkuService) {}

  @Post() create(@Body() dto: CreateSkuDto) {
    return this.service.create(dto);
  }

  @Get() findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('q') q?: string,
  ) {
    return this.service.findAll(+page, +limit, q);
  }

  @Get(':id') findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateSkuDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/transition') transition(
    @Param('id') id: string,
    @Body() dto: TransitionDto,
  ) {
    return this.service.transition(id, dto.target as any);
  }

  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
