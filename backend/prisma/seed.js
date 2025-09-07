import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.sku.deleteMany();

  await prisma.sku.createMany({
    data: [
      {
        descricao: 'Shampoo 200ml',
        descricaoComercial: 'Shampoo Brilho',
        sku: 'SKU-0001',
        status: 'PRE_CADASTRO',
        createdAt: new Date('2024-06-01T10:00:00Z'),
      },
      {
        descricao: 'Condicionador 200ml',
        descricaoComercial: 'Condicionador Suave',
        sku: 'SKU-0002',
        status: 'CADASTRO_COMPLETO',
        createdAt: new Date('2024-06-02T11:00:00Z'),
      },
      {
        descricao: 'Creme 50g',
        descricaoComercial: 'Creme Facial',
        sku: 'SKU-0003',
        status: 'ATIVO',
        createdAt: new Date('2024-06-03T12:00:00Z'),
      },
      {
        descricao: 'Máscara 30g',
        descricaoComercial: 'Máscara Hidratação',
        sku: 'SKU-0004',
        status: 'DESATIVADO',
        createdAt: new Date('2024-06-04T13:00:00Z'),
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
