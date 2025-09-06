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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkuService } from './sku.service';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';
import { TransitionDto } from './dto/transition.dto';

@ApiTags('SKUs')
@Controller('skus')
export class SkuController {
  constructor(private readonly service: SkuService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um SKU' })
  @ApiResponse({ status: 201, description: 'SKU criado' })
  create(@Body() dto: CreateSkuDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista SKUs com paginação e filtro por status' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: any,
  ) {
    return this.service.findAll({ page, limit, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um SKU por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza campos permitidos conforme status' })
  update(@Param('id') id: string, @Body() dto: UpdateSkuDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/transition')
  @ApiOperation({ summary: 'Transiciona o status do SKU' })
  transition(@Param('id') id: string, @Body() dto: TransitionDto) {
    return this.service.transition(id, dto.target as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um SKU' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}