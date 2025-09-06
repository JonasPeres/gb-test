import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // limpa tabela (apenas para ambientes de dev/test)
  await prisma.sku.deleteMany();

  await prisma.sku.createMany({
    data: [
      {
        descricao: 'Shampoo 200ml',
        descricaoComercial: 'Shampoo Brilho',
        sku: 'SKU-0001',
        status: 'PRE_CADASTRO',
      },
      {
        descricao: 'Condicionador 200ml',
        descricaoComercial: 'Condicionador Suave',
        sku: 'SKU-0002',
        status: 'CADASTRO_COMPLETO',
      },
      {
        descricao: 'Creme 50g',
        descricaoComercial: 'Creme Facial',
        sku: 'SKU-0003',
        status: 'ATIVO',
      },
      {
        descricao: 'Máscara 30g',
        descricaoComercial: 'Máscara Hidratação',
        sku: 'SKU-0004',
        status: 'DESATIVADO',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed concluído');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
