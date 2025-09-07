import { Sku, Status } from '@prisma/client/wasm';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class SkuService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureExists = async (id: string): Promise<Sku> => {
    const found = await this.prisma['sku'].findUnique({ where: { id } });
    if (!found) throw new NotFoundException('SKU não encontrado');
    return found;
  };

  private allowedTransitions: Record<Status, Status[]> = {
    PRE_CADASTRO: [Status.CADASTRO_COMPLETO, Status.CANCELADO],
    CADASTRO_COMPLETO: [Status.PRE_CADASTRO, Status.ATIVO, Status.CANCELADO],
    ATIVO: [Status.DESATIVADO],
    DESATIVADO: [Status.ATIVO, Status.PRE_CADASTRO],
    CANCELADO: [],
  };

  async create(data: {
    descricao: string;
    descricaoComercial: string;
    sku: string;
    status?: Status;
  }): Promise<Sku> {
    const status = data.status ?? Status.PRE_CADASTRO;
    return this.prisma['sku'].create({ data: { ...data, status } });
  }

  async findAll(params: {
    page?: number | undefined;
    limit?: number | undefined;
    status?: Status;
  }): Promise<{ items: Sku[]; total: number; page: number; pages: number }> {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit ?? 10)));
    const where = params.status ? { status: params.status } : {};
    const [items, total] = await Promise.all([
      this.prisma['sku'].findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma['sku'].count({ where }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Sku> {
    return this.ensureExists(id);
  }

  async update(
    id: string,
    data: Partial<{
      descricao: string;
      descricaoComercial: string;
      sku: string;
    }>,
  ): Promise<Sku> {
    const current = await this.ensureExists(id);
    if (['ATIVO', 'DESATIVADO', 'CANCELADO'].includes(current.status))
      throw new BadRequestException('Edição não permitida neste status');

    if (current.status === 'PRE_CADASTRO') {
      return this.prisma['sku'].update({
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

    return this.prisma['sku'].update({
      where: { id },
      data: {
        descricaoComercial: data.descricaoComercial!,
        status: 'PRE_CADASTRO',
      },
    });
  }

  async transition(id: string, target: Status): Promise<Sku> {
    const current = await this.ensureExists(id);
    if (current.status === 'CANCELADO')
      throw new BadRequestException('CANCELADO é status definitivo');
    const allowed = this.allowedTransitions[current.status];
    if (!allowed.includes(target))
      throw new BadRequestException('Transição inválida para o status atual');
    return this.prisma['sku'].update({
      where: { id },
      data: { status: target },
    });
  }

  async remove(id: string): Promise<{ ok: boolean }> {
    await this.ensureExists(id);
    await this.prisma['sku'].delete({ where: { id } });
    return { ok: true };
  }
}
