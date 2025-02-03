import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanterModule } from './planter/planter.module';

@Module({
  imports: [PlanterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
