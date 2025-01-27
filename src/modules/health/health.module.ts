import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthCheck } from './entities/health.entity';
import { HealthController } from './health.controller';
import { HealthResolver } from './health.resolver';
import { HealthService } from './health.service';

@Module({
  imports: [TypeOrmModule.forFeature([HealthCheck])],
  controllers: [HealthController],
  providers: [HealthService, HealthResolver],
})
export class HealthModule {}
