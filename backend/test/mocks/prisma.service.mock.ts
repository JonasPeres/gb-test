import { ConflictException, Injectable } from '@nestjs/common';
import { Sku } from '@prisma/client/wasm';

const db: { skus: Sku[] } = { skus: [] };

@Injectable()
export class PrismaServiceMock {
  public sku = {
    create: ({
      data,
    }: {
      data: Omit<Sku, 'id' | 'createdAt' | 'updatedAt' | 'status'> &
        Partial<Pick<Sku, 'status'>>;
    }) => {
      if (db.skus.some((s) => s.sku === data.sku)) {
        throw new ConflictException('SKU já existe (violação de unicidade)');
      }
      const row: Sku = {
        ...data,
        status: data.status ?? 'PRE_CADASTRO',
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.skus.push(row);
      return row;
    },
    findUnique: ({ where: { id } }: { where: { id: string } }) =>
      db.skus.find((s) => s.id === id) || null,
    findMany: ({
      where,
      skip = 0,
      take = 10,
    }: {
      where?: Partial<Pick<Sku, 'status'>>;
      skip?: number;
      take?: number;
    }) => {
      let arr = [...db.skus];
      if (where?.status) arr = arr.filter((s) => s.status === where.status);
      arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      return arr.slice(skip, skip + take);
    },
    count: ({ where }: { where?: Partial<Pick<Sku, 'status'>> }) => {
      if (where?.status)
        return db.skus.filter((s) => s.status === where.status).length;
      return db.skus.length;
    },
    update: ({
      where: { id },
      data,
    }: {
      where: { id: string };
      data: Partial<Omit<Sku, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => {
      const i = db.skus.findIndex((s) => s.id === id);
      if (i === -1 || !db.skus[i]) throw new Error('not found');
      db.skus[i] = {
        ...db.skus[i],
        ...data,
        id: db.skus[i].id,
        createdAt: db.skus[i].createdAt,
        status: data.status ?? db.skus[i].status,
        updatedAt: new Date(),
        descricao: data.descricao ?? db.skus[i].descricao,
        descricaoComercial:
          data.descricaoComercial ?? db.skus[i].descricaoComercial,
        sku: data.sku ?? db.skus[i].sku,
      };
      return db.skus[i];
    },
    delete: ({ where: { id } }: { where: { id: string } }) => {
      const i = db.skus.findIndex((s) => s.id === id);
      if (i === -1) throw new Error('not found');
      db.skus.splice(i, 1);
    },
  };

  __reset(): void {
    db.skus = [];
  }
}
