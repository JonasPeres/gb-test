import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SkuModule } from './sku/sku.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SkuModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
