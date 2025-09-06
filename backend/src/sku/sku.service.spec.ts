import { SkuService } from './sku.service';
import { PrismaServiceMock } from '../../test/mocks/prisma.service.mock';

describe('SkuService (rules)', () => {
  let svc: SkuService;
  let prismaMock: PrismaServiceMock;

  beforeEach(() => {
    prismaMock = new PrismaServiceMock();
    prismaMock.__reset();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    svc = new SkuService(prismaMock);
  });

  it('creates in PRE_CADASTRO by default', async () => {
    const created = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X1',
    });
    expect(created.status).toBe('PRE_CADASTRO');
  });

  it('valid transition PRE_CADASTRO -> CADASTRO_COMPLETO', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X2',
    });
    const moved = await svc.transition(s.id, 'CADASTRO_COMPLETO');
    expect(moved.status).toBe('CADASTRO_COMPLETO');
  });

  it('invalid transition PRE_CADASTRO -> ATIVO should fail', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X3',
    });
    await expect(svc.transition(s.id, 'ATIVO')).rejects.toThrow(
      /Transição inválida/,
    );
  });

  it('CADASTRO_COMPLETO: only descricaoComercial can be edited and goes back to PRE_CADASTRO', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X4',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO');
    const updated = await svc.update(s.id, { descricaoComercial: 'Nova' });
    expect(updated.status).toBe('PRE_CADASTRO');
    expect(updated.descricaoComercial).toBe('Nova');
  });

  it('CADASTRO_COMPLETO: trying to edit sku should fail', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X5',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO');
    await expect(svc.update(s.id, { sku: 'NOVO' })).rejects.toThrow(
      /apenas descricaoComercial/,
    );
  });

  it('ATIVO: no editing allowed', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X6',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO');
    await svc.transition(s.id, 'ATIVO');
    await expect(svc.update(s.id, { descricao: 'Z' })).rejects.toThrow(
      /Edição não permitida/,
    );
  });

  it('DESATIVADO: no editing allowed', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X7',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO');
    await svc.transition(s.id, 'ATIVO');
    await svc.transition(s.id, 'DESATIVADO');
    await expect(svc.update(s.id, { descricaoComercial: 'Z' })).rejects.toThrow(
      /Edição não permitida/,
    );
  });

  it('CANCELADO: transitions/edits not allowed', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'X8',
    });
    await svc.transition(s.id, 'CANCELADO');
    await expect(svc.transition(s.id, 'ATIVO')).rejects.toThrow(/definitivo/);
    await expect(svc.update(s.id, { descricao: 'Z' })).rejects.toThrow(
      /Edição não permitida/,
    );
  });

  it('list with pagination and status filter', async () => {
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

  it('remove: deletes and cannot find anymore', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'DEL',
    });
    const r = await svc.remove(s.id);
    expect(r).toEqual({ ok: true });
    await expect(svc.findOne(s.id)).rejects.toThrow(/não encontrado/i);
  });

  it('findAll with status filter', async () => {
    await svc.create({ descricao: 'A', descricaoComercial: 'B', sku: 'F1' });
    const s2 = await svc.create({
      descricao: 'C',
      descricaoComercial: 'D',
      sku: 'F2',
    });
    await svc.transition(s2.id, 'CADASTRO_COMPLETO');
    const onlyPre = await svc.findAll({
      status: 'PRE_CADASTRO',
      page: 1,
      limit: 10,
    });
    expect(onlyPre.items.every((i) => i.status === 'PRE_CADASTRO')).toBe(true);
  });

  it('DESATIVADO transitions: -> ATIVO and -> PRE_CADASTRO', async () => {
    const s = await svc.create({
      descricao: 'A',
      descricaoComercial: 'B',
      sku: 'D1',
    });
    await svc.transition(s.id, 'CADASTRO_COMPLETO');
    await svc.transition(s.id, 'ATIVO');
    const d = await svc.transition(s.id, 'DESATIVADO');
    expect(d.status).toBe('DESATIVADO');
    const backAtivo = await svc.transition(s.id, 'ATIVO');
    expect(backAtivo.status).toBe('ATIVO');
    await svc.transition(s.id, 'DESATIVADO');
    const backPre = await svc.transition(s.id, 'PRE_CADASTRO');
    expect(backPre.status).toBe('PRE_CADASTRO');
  });

  it('update in PRE_CADASTRO covering all fields', async () => {
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
