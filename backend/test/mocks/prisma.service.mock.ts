import { ConflictException, Injectable } from '@nestjs/common';

const db: any = { skus: [] };

@Injectable()
export class PrismaServiceMock {
  public sku = {
    create: async ({ data }: any) => {
      if (db.skus.some((s: any) => s.sku === data.sku)) {
        throw new ConflictException('SKU já existe (violação de unicidade)');
      }
      const row = {
        ...data,
        status: data.status ?? 'PRE_CADASTRO',
        id: Math.random().toString(36).slice(2),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.skus.push(row);
      return row;
    },
    findUnique: async ({ where: { id } }: any) =>
      db.skus.find((s: any) => s.id === id) || null,
    findMany: async ({ where, skip = 0, take = 100 }: any) => {
      let arr = [...db.skus];
      if (where?.status) arr = arr.filter((s) => s.status === where.status);
      arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      return arr.slice(skip, skip + take);
    },
    count: async ({ where }: any) => {
      if (where?.status)
        return db.skus.filter((s: any) => s.status === where.status).length;
      return db.skus.length;
    },
    update: async ({ where: { id }, data }: any) => {
      const i = db.skus.findIndex((s: any) => s.id === id);
      if (i === -1) throw new Error('not found');
      db.skus[i] = { ...db.skus[i], ...data, updatedAt: new Date() };
      return db.skus[i];
    },
    delete: async ({ where: { id } }: any) => {
      const i = db.skus.findIndex((s: any) => s.id === id);
      if (i === -1) throw new Error('not found');
      db.skus.splice(i, 1);
    },
  };

  __reset() {
    db.skus = [];
  }
}
