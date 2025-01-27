import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthCheck } from './entities/health.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthCheck)
    private readonly healthCheckRepository: Repository<HealthCheck>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHealthCheck() {
    return this.healthCheckRepository.find();
  }
}
