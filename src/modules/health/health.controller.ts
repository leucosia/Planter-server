/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Platform } from 'src/common/constants/platform';
import { RequestPlatform } from 'src/common/decorators/platform.decorator';
import AuthGuard from 'src/common/guards/auth.guard';
import { HealthResolver } from './health.resolver';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly HealthService: HealthService,
    private readonly HealthResolver: HealthResolver,
  ) {}

  @Get()
  get(): string {
    return this.HealthService.getHello();
  }

  @UseGuards(AuthGuard())
  @Get('auth')
  getWithGuard(@Query() query: any, @RequestPlatform() platform: Platform) {
    return { ...query, platform };
  }

  @Get(':id')
  async getWithTestParam(
    @Query() query: any,
    @Param('id') id: string,
    @RequestPlatform() platform: Platform,
  ) {
    return [
      ...(await this.HealthResolver.getHealthCheck()),
      { id },
      { platform },
    ];
  }
}
