/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from './mocks/prisma.service.mock';

describe('App e2e', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /skus (empty list with pagination)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get('/skus?page=1&limit=10')
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        pages: expect.any(Number),
      }),
    );
  });
});
