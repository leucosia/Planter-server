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
       secret: process.env.SECRET_KEY
      });
    return accessToken
  }

  private async createRefreshToken(payload: Payload): Promise<string> {
    const refreshToken = this.jwtService.sign({
      email: payload.email,
      id: payload.id,
      jti: this.generateJti()
    }, { 
      expiresIn: "7d",
      secret: process.env.SECRET_KEY
    });
    return refreshToken
  }

  public async refreshToken(refresh_token: string): Promise<AuthLoginResponse> {
    const user = await this.prisma.user.findFirst({
      where: { 
        refreshToken: refresh_token 
      },
    })

    if (user && user.name) {
      return this.login(
        user.email,
        user.name
      )
    } else {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
  }

  private validateRefreshToken(refresh_token: string): boolean {
    try {
      // 토큰 디코드해서 만료 시간 확인
      const decoded = this.jwtService.decode(refresh_token) as { exp: number };

      if (!decoded || !decoded.exp) {
        throw new UnauthorizedException('Invalid Refresh Token');
      }

      // 현재 시간과 만료 시간을 비교하여 토큰이 만료되었는지 확인
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > decoded.exp) {
        throw new UnauthorizedException('Refresh Token Expired');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Error validating refresh token');
    }
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

    await this.prisma.user.update({
      where: { email },
      data: {
        refreshToken: refreshToken
      }
    })

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

  private generateJti(): string {
    return crypto.getRandomValues(new Uint32Array(16)).join('');
  }
}
