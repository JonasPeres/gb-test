/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SkuController } from './sku.controller';
import { SkuService } from './sku.service';
import { Status } from '@prisma/client';

describe('SkuController', () => {
  let controller: SkuController;
  let service: jest.Mocked<SkuService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkuController],
      providers: [
        {
          provide: SkuService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            transition: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SkuController>(SkuController);
    service = module.get(SkuService);
  });

  it('create -> delega ao service', async () => {
    service.create.mockResolvedValue({
      id: '1',
      sku: 'X1',
      descricao: 'A',
      descricaoComercial: 'B',
      status: Status.ATIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const dto = { descricao: 'A', descricaoComercial: 'B', sku: 'X1' };
    const res = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({
      id: '1',
      sku: 'X1',
      descricao: 'A',
      descricaoComercial: 'B',
      status: Status.ATIVO,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('findAll -> paginação e status como string', async () => {
    (service.findAll as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pages: 0,
    });
    const res = await controller.findAll(1, 10, Status.ATIVO);
    expect(service.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: Status.ATIVO,
    });
    expect(res.page).toBe(1);
    expect(res.items).toEqual([]);
  });

  it('update -> retorna objeto atualizado', async () => {
    service.update.mockResolvedValue({
      id: '1',
      sku: 'X1',
      descricao: 'A',
      descricaoComercial: 'Nova',
      status: Status.ATIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await controller.update('1', {
      descricaoComercial: 'Nova',
    });
    expect(service.update).toHaveBeenCalledWith('1', {
      descricaoComercial: 'Nova',
    });
    expect(res.descricaoComercial).toBe('Nova');
  });

  it('transition -> retorna status atualizado', async () => {
    service.transition.mockResolvedValue({
      id: '1',
      sku: 'X1',
      descricao: 'A',
      descricaoComercial: 'B',
      status: Status.ATIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await controller.transition('1', { target: Status.ATIVO });
    expect(service.transition).toHaveBeenCalledWith('1', Status.ATIVO);
    expect(res.status).toBe(Status.ATIVO);
  });

  it('findOne -> delega ao service', async () => {
    service.findOne.mockResolvedValue({
      id: '1',
      sku: 'X1',
      descricao: 'A',
      descricaoComercial: 'B',
      status: Status.ATIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(res.id).toBe('1');
  });

  it('update -> respeita DTO', async () => {
    service.update.mockResolvedValue({
      id: '1',
      sku: 'X1',
      descricao: 'A',
      descricaoComercial: 'Nova',
      status: Status.ATIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await controller.update('1', {
      descricaoComercial: 'Nova',
    });
    expect(service.update).toHaveBeenCalledWith('1', {
      descricaoComercial: 'Nova',
    });
    expect(res.descricaoComercial).toBe('Nova');
  });

  it('transition -> chama service', async () => {
    service.transition.mockResolvedValue({
      id: '1',
      sku: 'X1',
      descricao: 'A',
      descricaoComercial: 'B',
      status: Status.ATIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await controller.transition('1', { target: Status.ATIVO });
    expect(service.transition).toHaveBeenCalledWith('1', Status.ATIVO);
    expect(res.status).toBe(Status.ATIVO);
  });

  it('remove -> ok', async () => {
    service.remove.mockResolvedValue({ ok: true });
    const res = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
    expect(res).toEqual({ ok: true });
  });

  it('findAll sem query params usa defaults', async () => {
    (service.findAll as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pages: 0,
    });
    const res = await controller.findAll(undefined, undefined, undefined);
    expect(service.findAll).toHaveBeenCalledWith({
      page: undefined,
      limit: undefined,
      status: undefined,
    });
    expect(res.page).toBe(1);
  });

  it('findAll com status=undefined (ignora filtro)', async () => {
    (service.findAll as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pages: 0,
    });
    await controller.findAll(1, 10, undefined);
    expect(service.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
    });
  });
});
