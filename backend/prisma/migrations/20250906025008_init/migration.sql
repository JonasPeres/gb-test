-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('PRE_CADASTRO', 'CADASTRO_COMPLETO', 'ATIVO', 'DESATIVADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "public"."Sku" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "descricaoComercial" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'PRE_CADASTRO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sku_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sku_sku_key" ON "public"."Sku"("sku");
