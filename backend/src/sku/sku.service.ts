import { PrismaService } from '../../prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Status as PrismaStatus } from '@prisma/client';

type Status =
  | 'PRE_CADASTRO'
  | 'CADASTRO_COMPLETO'
  | 'ATIVO'
  | 'DESATIVADO'
  | 'CANCELADO';

@Injectable()
export class SkuService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureExists = async (id: string) => {
    const found = await this.prisma.sku.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('SKU não encontrado');
    return found;
  };

  private allowedTransitions: Record<Status, Status[]> = {
    PRE_CADASTRO: ['CADASTRO_COMPLETO', 'CANCELADO'],
    CADASTRO_COMPLETO: ['PRE_CADASTRO', 'ATIVO', 'CANCELADO'],
    ATIVO: ['DESATIVADO'],
    DESATIVADO: ['ATIVO', 'PRE_CADASTRO'],
    CANCELADO: [],
  };

  async create(data: {
    descricao: string;
    descricaoComercial: string;
    sku: string;
    status?: Status;
  }) {
    const status = (data.status ?? 'PRE_CADASTRO') as PrismaStatus;
    return this.prisma.sku.create({ data: { ...data, status } });
  }

  async findAll(params: { page?: number; limit?: number; status?: Status }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit ?? 10)));
    const where = params.status
      ? { status: params.status as PrismaStatus }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.sku.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sku.count({ where }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    return this.ensureExists(id);
  }

  async update(
    id: string,
    data: Partial<{
      descricao: string;
      descricaoComercial: string;
      sku: string;
    }>,
  ) {
    const current = await this.ensureExists(id);
    if (['ATIVO', 'DESATIVADO', 'CANCELADO'].includes(current.status))
      throw new BadRequestException('Edição não permitida neste status');

    if (current.status === 'PRE_CADASTRO') {
      return this.prisma.sku.update({
        where: { id },
        data: {
          ...(data.descricao !== undefined && { descricao: data.descricao }),
          ...(data.descricaoComercial !== undefined && {
            descricaoComercial: data.descricaoComercial,
          }),
          ...(data.sku !== undefined && { sku: data.sku }),
        },
      });
    }

    const onlyDescricaoComercial =
      data.descricao === undefined &&
      data.sku === undefined &&
      data.descricaoComercial !== undefined;
    if (!onlyDescricaoComercial)
      throw new BadRequestException(
        'Em CADASTRO_COMPLETO apenas descricaoComercial pode ser alterada',
      );

    return this.prisma.sku.update({
      where: { id },
      data: {
        descricaoComercial: data.descricaoComercial!,
        status: 'PRE_CADASTRO',
      },
    });
  }

  async transition(id: string, target: Status) {
    const current = await this.ensureExists(id);
    if (current.status === 'CANCELADO')
      throw new BadRequestException('CANCELADO é status definitivo');
    const allowed = this.allowedTransitions[current.status as Status];
    if (!allowed.includes(target))
      throw new BadRequestException('Transição inválida para o status atual');
    return this.prisma.sku.update({
      where: { id },
      data: { status: target as PrismaStatus },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.sku.delete({ where: { id } });
    return { ok: true };
  }
}
