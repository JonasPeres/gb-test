import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from './health.controller';
import type { App } from 'supertest/types';

describe('HealthController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health -> { ok:true, uptime:number }', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/health')
      .expect(200);
    expect(res.body).toEqual(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ ok: true, uptime: expect.any(Number) }),
    );
  });
});
