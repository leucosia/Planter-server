import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/prisma.client';
import { UserDto } from './dto/user.dto';
import { AuthLoginResponse } from './dto/auth.login.response.dto'
import { JwtService } from '@nestjs/jwt';
import { Payload } from './payload.interface';
import { AuthSignupResponse } from './dto/auth.signup.response.dto';
import { Authentication } from './dto/authentication.dto';
import { AuthLoginBody } from './dto/auth.login.body.dto';
import { AuthSignupBody } from './dto/auth.signup.body.dto';
import { access } from 'fs';

@Injectable()
export class AuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  private async createAccessToken(payload: Payload): Promise<string> {
    const accessToken = this.jwtService.sign(payload, {
       expiresIn: '15m',
       secret: process.env.SECRETKEY
      });
    return accessToken
  }

  private async createRefreshToken(payload: Payload): Promise<string> {
    const refreshToken = this.jwtService.sign(payload, { 
      expiresIn: "7d",
      secret: process.env.SECRETKEY
    });
    return refreshToken
  }

  async login(email: string, name: string): Promise<AuthLoginResponse> {
    let user = await this.prisma.user.findFirst({
      where: { email: email },
    });

    // 유저가 없으면 회원 가입 후 Token Return
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: email,
          name: name
        }
      })
    }

    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  }

  async googleLogin(idToken: string): Promise<AuthLoginResponse> {
    try {
      const verifiedUser = await this.verifyGoogleToken(idToken);

      // Error 나면 어떻하지?
      return this.login(
        verifiedUser.email,
        verifiedUser.name
      );
    } catch (error) {
      throw new UnauthorizedException('Google token verification failed: ' + error);
    }
  }

  async verifyGoogleToken(idToken: string): Promise<{ email: string; name: string}> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid token');

      const { email, name } = payload;

      if(!email || !name) {
        throw new UnauthorizedException('Google account missing email or name')
      }

      return { email: email, name: name };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
