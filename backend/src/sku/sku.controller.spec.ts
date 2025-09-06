import { Test, TestingModule } from '@nestjs/testing';
import { SkuController } from './sku.controller';
import { SkuService } from './sku.service';

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
    service.create.mockResolvedValue({ id: '1' } as any);
    const dto = { descricao: 'A', descricaoComercial: 'B', sku: 'X1' };
    const res = await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: '1' });
  });

  it('findAll -> paginação e status como string', async () => {
    service.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pages: 0,
    } as any);
    const res = await controller.findAll(2 as any, 5 as any, 'ATIVO' as any);
    expect(service.findAll).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      status: 'ATIVO',
    });
    expect(res.items).toEqual([]);
  });

  it('findOne -> delega ao service', async () => {
    service.findOne.mockResolvedValue({ id: '1' } as any);
    const res = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(res.id).toBe('1');
  });

  it('update -> respeita DTO', async () => {
    service.update.mockResolvedValue({
      id: '1',
      descricaoComercial: 'Nova',
    } as any);
    const res = await controller.update('1', {
      descricaoComercial: 'Nova',
    } as any);
    expect(service.update).toHaveBeenCalledWith('1', {
      descricaoComercial: 'Nova',
    });
    expect(res.descricaoComercial).toBe('Nova');
  });

  it('transition -> chama service', async () => {
    service.transition.mockResolvedValue({ id: '1', status: 'ATIVO' } as any);
    const res = await controller.transition('1', { target: 'ATIVO' } as any);
    expect(service.transition).toHaveBeenCalledWith('1', 'ATIVO' as any);
    expect(res.status).toBe('ATIVO');
  });

  it('remove -> ok', async () => {
    service.remove.mockResolvedValue({ ok: true } as any);
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
    const res = await controller.findAll(
      undefined as any,
      undefined as any,
      undefined as any,
    );
    expect(service.findAll).toHaveBeenCalledWith({
      page: undefined,
      limit: undefined,
      status: undefined,
    });
    expect(res.page).toBe(1);
  });

  it('findAll com status=ALL (ignora filtro)', async () => {
    (service.findAll as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pages: 0,
    });
    await controller.findAll(1 as any, 10 as any, 'ALL' as any);
    expect(service.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: 'ALL',
    });
  });
});
