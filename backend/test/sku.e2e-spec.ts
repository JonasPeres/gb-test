import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from './mocks/prisma.service.mock';

describe('SKU e2e (mocked Prisma)', () => {
  let app: INestApplication;
  let prismaMock: PrismaServiceMock;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prismaMock = app.get(PrismaService) as any;
    prismaMock.__reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /skus valida DTO (400 quando campos faltam)', async () => {
    await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'Apenas um campo' })
      .expect(400);
  });

  it('POST /skus cria e GET pagina', async () => {
    const body = { descricao: 'A', descricaoComercial: 'B', sku: 'SKU-100' };
    const create = await request(app.getHttpServer())
      .post('/skus')
      .send(body)
      .expect(201);
    expect(create.body.id).toBeDefined();

    const list = await request(app.getHttpServer())
      .get('/skus?status=PRE_CADASTRO&page=1&limit=10')
      .expect(200);
    expect(Array.isArray(list.body.items)).toBe(true);
  });

  it('POST /skus retorna 409 em sku duplicado', async () => {
    const body = { descricao: 'A', descricaoComercial: 'B', sku: 'SKU-101' };
    await request(app.getHttpServer()).post('/skus').send(body).expect(201);
    await request(app.getHttpServer()).post('/skus').send(body).expect(409);
  });

  it('Edição em CADASTRO_COMPLETO: só descricaoComercial (sku deve dar 400) e volta para PRE_CADASTRO', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/skus')
      .send({ descricao: 'A', descricaoComercial: 'B', sku: 'SKU-103' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skus/${created.id}/transition`)
      .send({ target: 'CADASTRO_COMPLETO' })
      .expect(201);

    const afterTransition = await request(app.getHttpServer())
      .get(`/skus/${created.id}`)
      .expect(200);
    expect(afterTransition.body.status).toBe('CADASTRO_COMPLETO');

    await request(app.getHttpServer())
      .patch(`/skus/${created.id}`)
      .send({ sku: 'OUTRO' })
      .expect(400);

    const { body: updated } = await request(app.getHttpServer())
      .patch(`/skus/${created.id}`)
      .send({ descricaoComercial: 'Nova' })
      .expect(200);
    expect(updated.status).toBe('PRE_CADASTRO');
  });
});
