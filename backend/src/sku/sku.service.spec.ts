import { SkuService } from './sku.service';

class PrismaServiceMock {
  public sku = {
    create: ({ data }: any) => {
      const row = {
        ...data,
        id: Math.random().toString(36).slice(2),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.skus.push(row);
      return Promise.resolve(row);
    },
    findUnique: ({ where: { id } }: any) =>
      Promise.resolve(db.skus.find((s: any) => s.id === id) || null),
    findMany: ({ where, skip = 0, take = 100 }: any) => {
      let arr = [...db.skus];
      if (where?.status) arr = arr.filter((s) => s.status === where.status);
      arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      return Promise.resolve(arr.slice(skip, skip + take));
    },
    count: ({ where }: any) => {
      if (where?.status) {
        return Promise.resolve(
          db.skus.filter((s: any) => s.status === where.status).length,
        );
      }
      return Promise.resolve(db.skus.length);
    },
    update: ({ where: { id }, data }: any) => {
      const i = db.skus.findIndex((s: any) => s.id === id);
      if (i === -1) throw new Error('not found');
      db.skus[i] = { ...db.skus[i], ...data, updatedAt: new Date() };
      return Promise.resolve(db.skus[i]);
    },
    delete: ({ where: { id } }: any) => {
      const i = db.skus.findIndex((s: any) => s.id === id);
      if (i === -1) throw new Error('not found');
      db.skus.splice(i, 1);
      return Promise.resolve();
    },
  };
}

const db: any = { skus: [] };

describe('SkuService (rules)', () => {
  let svc: SkuService;

  beforeEach(() => {
    db.skus = [];
    // injeta o mock de PrismaService no construtor do SkuService
    // @ts-expect-error tipagem simplificada só para teste
    svc = new SkuService(new PrismaServiceMock());
  });

  it('cria em PRE_CADASTRO por padrão', async () => {
    const created = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X1',
    });
    expect(created.status).toBe('PRE_CADASTRO');
  });

  it('transição válida PRE_CADASTRO -> CADASTRO_COMPLETO', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X2',
    });
    const moved = await svc.transition(s.id, 'CADASTRO_COMPLETO' as any);
    expect(moved.status).toBe('CADASTRO_COMPLETO');
  });

  it('transição inválida PRE_CADASTRO -> ATIVO deve falhar', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X3',
    });
    await expect(svc.transition(s.id, 'ATIVO' as any)).rejects.toThrow(
      /Transição inválida/,
    );
  });

  it('CADASTRO_COMPLETO: só pode editar descricaoComercial e volta para PRE_CADASTRO', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X4',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO' as any);
    const updated = await svc.update(s.id, { descricaoComercial: 'Nova' });
    expect(updated.status).toBe('PRE_CADASTRO');
    expect(updated.descricaoComercial).toBe('Nova');
  });

  it('CADASTRO_COMPLETO: tentar editar sku deve falhar', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X5',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO' as any);
    await expect(svc.update(s.id, { sku: 'NOVO' })).rejects.toThrow(
      /apenas descricaoComercial/,
    );
  });

  it('ATIVO: nenhuma edição permitida', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X6',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO' as any);
    await svc.transition(s.id, 'ATIVO' as any);
    await expect(svc.update(s.id, { descricao: 'Z' })).rejects.toThrow(
      /Edição não permitida/,
    );
  });

  it('DESATIVADO: nenhuma edição permitida', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X7',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO' as any);
    await svc.transition(s.id, 'ATIVO' as any);
    await svc.transition(s.id, 'DESATIVADO' as any);
    await expect(svc.update(s.id, { descricaoComercial: 'Z' })).rejects.toThrow(
      /Edição não permitida/,
    );
  });

  it('CANCELADO: transição/edição não permitidas', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X8',
    });
    await svc.transition(s.id, 'CANCELADO' as any);
    await expect(svc.transition(s.id, 'ATIVO' as any)).rejects.toThrow(
      /definitivo/,
    );
    await expect(svc.update(s.id, { descricao: 'Z' })).rejects.toThrow(
      /Edição não permitida/,
    );
  });

  it('lista com paginação e filtro por status', async () => {
    for (let i = 0; i < 15; i++) {
      await svc.create({
        descricao: 'A' + i,
        descricaoComercial: 'B' + i,
        sku: 'SKU' + i,
      });
    }
    const page1 = await svc.findAll({ page: 1, limit: 10 });
    const page2 = await svc.findAll({ page: 2, limit: 10 });
    expect(page1.items.length).toBe(10);
    expect(page2.items.length).toBe(5);
    expect(page1.total).toBe(15);
  });

  // ---- Extras para elevar branches/linhas ----

  it('remove: exclui e não encontra mais', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'DEL',
    });
    const r = await svc.remove(s.id);
    expect(r).toEqual({ ok: true });
    await expect(svc.findOne(s.id)).rejects.toThrow(/não encontrado/i);
  });

  it('findAll com filtro de status', async () => {
    await svc.create({ descricao: 'A', descricaoComercial: 'B', sku: 'F1' }); // PRE_CADASTRO
    const s2 = await svc.create({
      descricao: 'C',
      descricaoComercial: 'D',
      sku: 'F2',
    });
    await svc.transition(s2.id, 'CADASTRO_COMPLETO' as any);
    const onlyPre = await svc.findAll({
      status: 'PRE_CADASTRO',
      page: 1,
      limit: 10,
    });
    expect(onlyPre.items.every((i) => i.status === 'PRE_CADASTRO')).toBe(true);
  });

  it('transições de DESATIVADO: -> ATIVO e -> PRE_CADASTRO', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'D1',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO' as any);
    await svc.transition(s.id, 'ATIVO' as any);
    const d = await svc.transition(s.id, 'DESATIVADO' as any);
    expect(d.status).toBe('DESATIVADO');
    const backAtivo = await svc.transition(s.id, 'ATIVO' as any);
    expect(backAtivo.status).toBe('ATIVO');
    await svc.transition(s.id, 'DESATIVADO' as any);
    const backPre = await svc.transition(s.id, 'PRE_CADASTRO' as any);
    expect(backPre.status).toBe('PRE_CADASTRO');
  });

  it('update em PRE_CADASTRO cobrindo todos campos', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'UP1',
    });
    const u = await svc.update(s.id, {
      descricao: 'A2',
      descricaoComercial: 'B2',
      sku: 'UP2',
    });
    expect(u.descricao).toBe('A2');
    expect(u.descricaoComercial).toBe('B2');
    expect(u.sku).toBe('UP2');
  });
});
