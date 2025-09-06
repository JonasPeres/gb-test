import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SkuModule } from './sku/sku.module';

@Module({
  imports: [PrismaModule, SkuModule],
})
export class AppModule {}
