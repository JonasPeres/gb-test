import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SkuModule } from './sku/sku.module';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, SkuModule],
  controllers: [HealthController]
})
export class AppModule {}
