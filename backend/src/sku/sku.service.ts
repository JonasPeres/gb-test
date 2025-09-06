import { PrismaClient } from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

type Status =
  | 'PRE_CADASTRO'
  | 'CADASTRO_COMPLETO'
  | 'ATIVO'
  | 'DESATIVADO'
  | 'CANCELADO';

const prisma = new PrismaClient();

const canEditFields = (status: Status) =>
  status === 'PRE_CADASTRO' || status === 'CADASTRO_COMPLETO';

const allowedTransitions: Record<Status, Status[]> = {
  PRE_CADASTRO: ['CADASTRO_COMPLETO', 'CANCELADO'],
  CADASTRO_COMPLETO: ['PRE_CADASTRO', 'ATIVO', 'CANCELADO'],
  ATIVO: ['DESATIVADO'],
  DESATIVADO: ['ATIVO', 'PRE_CADASTRO'],
  CANCELADO: [],
};

@Injectable()
export class SkuService {
  async create(dto: {
    descricao: string;
    descricaoComercial: string;
    sku: string;
    status?: Status;
  }) {
    return prisma.sku.create({ data: { ...dto } });
  }

  async findAll(page = 1, limit = 10, q?: string) {
    const where: any = q
      ? {
          OR: [
            { descricao: { contains: q, mode: 'insensitive' as any } },
            { descricaoComercial: { contains: q, mode: 'insensitive' as any } },
            { sku: { contains: q, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.sku.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sku.count({ where }),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const found = await prisma.sku.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('SKU não encontrado');
    return found;
  }

  async update(
    id: string,
    dto: Partial<{
      descricao: string;
      descricaoComercial: string;
      sku: string;
    }>,
  ) {
    const current = await this.findOne(id);

    if (!canEditFields(current.status as Status)) {
      if (Object.keys(dto).length) {
        throw new BadRequestException('Edição não permitida neste status');
      }
    }

    let nextStatus = current.status as Status;
    if (
      current.status === 'CADASTRO_COMPLETO' &&
      dto.descricaoComercial !== undefined
    ) {
      nextStatus = 'PRE_CADASTRO';
    }

    return prisma.sku.update({
      where: { id },
      data: { ...dto, status: nextStatus as any },
    });
  }

  async transition(id: string, target: Status) {
    const current = await this.findOne(id);
    if (!allowedTransitions[current.status as Status].includes(target)) {
      throw new BadRequestException(
        `Transição inválida de ${current.status} para ${target}`,
      );
    }
    return prisma.sku.update({
      where: { id },
      data: { status: target as any },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await prisma.sku.delete({ where: { id } });
    return { ok: true };
  }
}
