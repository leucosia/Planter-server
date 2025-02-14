import { Module } from '@nestjs/common';
import { PlanterService } from './planter.service';
import { PlanterController } from './planter.controller';

@Module({
  controllers: [PlanterController],
  providers: [PlanterService],
})
export class PlanterModule {}
