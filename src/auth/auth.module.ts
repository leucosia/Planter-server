import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.client';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRETKEY,
      signOptions: { expiresIn: '300s' },
    }),
  ],
  controllers: [
    AuthController,
  ],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
