/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import request from 'supertest';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from './mocks/prisma.service.mock';
import type { Sku } from '@prisma/client';

describe('SKU E2E (mocked Prisma)', () => {
  let app: INestApplication;
  let prismaMock: PrismaServiceMock;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prismaMock = app.get(PrismaService);
    prismaMock.__reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates SKU in PRE_CADASTRO by default', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'X1' })
      .expect(201);
    expect(body.status).toBe('PRE_CADASTRO');
  });

  it('valid transition PRE_CADASTRO -> CADASTRO_COMPLETO', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'X2' });
    const { body: moved } = await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'CADASTRO_COMPLETO' })
      .expect(201);
    expect(moved.status).toBe('CADASTRO_COMPLETO');
  });

  it('invalid transition PRE_CADASTRO -> ATIVO should fail', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'X3' });
    const res = await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'ATIVO' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.message).toMatch(/Transição inválida/i);
  });

  it('should revert to PRE_CADASTRO when editing descricaoComercial in CADASTRO_COMPLETO', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'X4' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'CADASTRO_COMPLETO' })
      .expect(201);
    const { body: updated } = await request(app.getHttpServer())
      .patch(`/skus/${created.id}`)
      .send({ descricaoComercial: 'Nova' })
      .expect(200);
    expect(updated.status).toBe('PRE_CADASTRO');
    expect(updated.descricaoComercial).toBe('Nova');
  });

  it('CADASTRO_COMPLETO: trying to edit sku should fail', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'X5' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'CADASTRO_COMPLETO' });
    const res = await request(app.getHttpServer())
      .patch(`/skus/${created.id}`)
      .send({ sku: 'NOVO' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.message).toMatch(/apenas descricaoComercial/i);
  });

  it('ATIVO: editing not allowed', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'X6' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'CADASTRO_COMPLETO' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'ATIVO' });
    const res = await request(app.getHttpServer())
      .patch(`/skus/${created.id}`)
      .send({ descricao: 'Z' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.message).toMatch(/Edição não permitida/i);
  });

  it('DESATIVADO: editing not allowed', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'X7' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'CADASTRO_COMPLETO' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'ATIVO' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'DESATIVADO' });
    const res = await request(app.getHttpServer())
      .patch(`/skus/${created.id}`)
      .send({ descricaoComercial: 'Z' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.message).toMatch(/Edição não permitida/i);
  });

  it('CANCELADO: transitions and edits not allowed', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'X8' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'CANCELADO' });
    const res1 = await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'ATIVO' });
    expect(res1.status).toBeGreaterThanOrEqual(400);
    expect(res1.body.message).toMatch(/definitivo/i);
    const res2 = await request(app.getHttpServer())
      .patch(`/skus/${created.id}`)
      .send({ descricao: 'Z' });
    expect(res2.status).toBeGreaterThanOrEqual(400);
    expect(res2.body.message).toMatch(/Edição não permitida/i);
  });

  it('list with pagination and status filter', async () => {
    prismaMock.__reset();

    for (let i = 0; i < 15; i++) {
      await request(app.getHttpServer())
        .post('/skus')
        .send({
          descricao: `A${i}`,
          descricaoComercial: `B${i}`,
          sku: `SKU${i}`,
        });
    }
    const { body: page1 } = await request(app.getHttpServer())
      .get('/skus')
      .query({ page: 1, limit: 10 });
    const { body: page2 } = await request(app.getHttpServer())
      .get('/skus')
      .query({ page: 2, limit: 10 });
    expect(page1.items.length).toBe(10);
    expect(page2.items.length).toBe(5);
    expect(page1.total).toBe(15);
  });

  it('remove: deletes and cannot find anymore', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'DEL' });
    await request(app.getHttpServer())
      .delete(`/skus/${created.id}`)
      .expect(200);
    const res = await request(app.getHttpServer()).get(`/skus/${created.id}`);
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.message).toMatch(/não encontrado/i);
  });

  it('findAll with status filter', async () => {
    await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'F1' });
    const { body: s2 } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'C', descricaoComercial: 'D', sku: 'F2' });
    await request(app.getHttpServer())
      .post(`/skus/${s2.id}/transition`)
      .send({ target: 'CADASTRO_COMPLETO' });
    const { body: onlyPre } = await request(app.getHttpServer())
      .get('/skus')
      .query({ status: 'PRE_CADASTRO', page: 1, limit: 10 });
    expect(onlyPre.items.every((i: Sku) => i.status === 'PRE_CADASTRO')).toBe(
      true,
    );
  });

  it('DESATIVADO: transitions to ATIVO and PRE_CADASTRO', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'D1' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'CADASTRO_COMPLETO' });
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'ATIVO' });
    const { body: d } = await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'DESATIVADO' });
    expect(d.status).toBe('DESATIVADO');
    const { body: backAtivo } = await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'ATIVO' });
    expect(backAtivo.status).toBe('ATIVO');
    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'DESATIVADO' });
    const { body: backPre } = await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'PRE_CADASTRO' });
    expect(backPre.status).toBe('PRE_CADASTRO');
  });

  it('update in PRE_CADASTRO covering all fields', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'UP1' });
    const { body: updated } = await request(app.getHttpServer())
      .patch(`/skus/${created.id}`)
      .send({ descricao: 'A2', descricaoComercial: 'B2', sku: 'UP2' });
    expect(updated.descricao).toBe('A2');
    expect(updated.descricaoComercial).toBe('B2');
    expect(updated.sku).toBe('UP2');
  });
});
