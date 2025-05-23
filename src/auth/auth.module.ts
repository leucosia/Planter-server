import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.client';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthJWTGuard } from './auth.jwt.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [
    AuthController,
  ],
  providers: [AuthService, PrismaService, JwtStrategy, AuthJWTGuard],
  exports: [AuthService, AuthJWTGuard]
})
export class AuthModule {}
