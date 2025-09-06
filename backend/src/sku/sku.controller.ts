import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkuService } from './sku.service';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';
import { TransitionDto } from './dto/transition.dto';
import { Sku, Status } from '@prisma/client';

@ApiTags('SKUs')
@Controller('skus')
export class SkuController {
  constructor(private readonly service: SkuService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um SKU' })
  @ApiResponse({ status: 201, description: 'SKU criado' })
  create(@Body() dto: CreateSkuDto): Promise<Sku> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista SKUs com paginação e filtro por status' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: Status,
  ): Promise<{ items: Sku[]; total: number; page: number; pages: number }> {
    return this.service.findAll({
      page,
      limit,
      ...(status !== undefined ? { status } : {}),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um SKU por ID' })
  findOne(@Param('id') id: string): Promise<Sku> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza campos permitidos conforme status' })
  update(@Param('id') id: string, @Body() dto: UpdateSkuDto): Promise<Sku> {
    return this.service.update(id, dto);
  }

  @Post(':id/transition')
  @ApiOperation({ summary: 'Transiciona o status do SKU' })
  transition(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: TransitionDto,
  ): Promise<Sku> {
    return this.service.transition(id, dto.target);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um SKU' })
  remove(@Param('id') id: string): Promise<{ ok: boolean }> {
    return this.service.remove(id);
  }
}
