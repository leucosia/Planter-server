import { Module } from '@nestjs/common';
import { PlanterService } from './planter.service';
import { PlanterController } from './planter.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.client';

@Module({
  imports: [AuthModule],
  controllers: [PlanterController],
  providers: [PlanterService, PrismaService],
})
export class PlanterModule {}
