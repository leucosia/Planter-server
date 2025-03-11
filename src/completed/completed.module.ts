import { Module } from '@nestjs/common';
import { CompletedService } from './completed.service';
import { CompletedController } from './completed.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.client';

@Module({
  imports: [AuthModule],
  controllers: [CompletedController],
  providers: [CompletedService, PrismaService],
})
export class CompletedModule {}