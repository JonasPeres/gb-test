import { Controller, Get } from '@nestjs/common';
@Controller('health')
export class HealthController {
  @Get()
  ping(): { ok: boolean; uptime: number } {
    return { ok: true, uptime: process.uptime() };
  }
}
