import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanterModule } from './planter/planter.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TodosModule } from './todos/todos.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PlanterModule, 
            AuthModule,
            ConfigModule.forRoot({
              isGlobal: true,
              envFilePath: '.${process.env.NODE_ENV}.env',
            }),
            TodosModule
          ],
  controllers: [AppController],
  providers: [AppService,
    JwtService
  ],
})
export class AppModule {}
