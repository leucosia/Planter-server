import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanterModule } from './planter/planter.module';
import { OauthModule } from './oauth/oauth.module';

@Module({
  imports: [PlanterModule, OauthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
