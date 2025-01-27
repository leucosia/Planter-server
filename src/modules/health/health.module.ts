import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthResolver } from './health.resolver';
import { HealthService } from './health.service';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [HealthService, HealthResolver],
})
export class HealthModule {}
