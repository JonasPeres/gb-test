const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.sku.createMany({
    data: [
      { descricao: 'Sabonete A', descricaoComercial: '90g', sku: 'SAB-90' },
      {
        descricao: 'Hidratante B',
        descricaoComercial: '200ml',
        sku: 'HID-200',
      },
    ],
    skipDuplicates: true,
  });
  console.log('Seed concluído');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(0); // não falha o container por seed
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
