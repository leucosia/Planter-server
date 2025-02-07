import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanterModule } from './planter/planter.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PlanterModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
