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

@Injectable()
export class AuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(loginUser: AuthLoginBody): Promise<AuthLoginResponse> {
    let user = await this.prisma.user.findFirst({
      where: { email: loginUser.email },
    });

    // 유저가 있으면 accessToken Return
    if (user) {
      const payload: Payload = {
        id: user.id,
        email: user.email
      }

      return {
        accessToken: this.jwtService.sign(payload)
      }
    }
    else {
      throw new UnauthorizedException('User Not Found');
    }
  }

  async signup(createUser: AuthSignupBody): Promise<AuthSignupResponse> {
    let user = await this.prisma.user.findFirst({
      where: { email: createUser.email },
    });

    if (user) {
      throw new UnauthorizedException("이미 가입된 유저입니다.");
    }
    else {
      let user = await this.prisma.user.create({
        data: {
          email: createUser.email,
          name: createUser.name,
          photo: createUser.imageUrl
        }
      })

      const payload: Payload = {
        id: user.id,
        email: user.email
      }

      return {
        accessToken: this.jwtService.sign(payload)
      }
    }
  }

  private async createAccessToken(user: UserDto) {
    return {
      accessToken: await this.jwtService.signAsync({
        email: user.email
      })
    }
  }
}
