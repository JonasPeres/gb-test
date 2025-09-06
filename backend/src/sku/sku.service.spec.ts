import { SkuService } from '../src/sku/sku.service';
test('transição inválida deve falhar', async () => {
  const svc = new SkuService();
  const created = await svc.create({
    descricao: 'A',
    descricaoComercial: 'B',
    sku: 'SKU-1',
  });
  await expect(svc.transition(created.id, 'ATIVO' as any)).rejects.toThrow(
    /Transição inválida/,
  ); // de PRE_CADASTRO p/ ATIVO direto é inválido
});
