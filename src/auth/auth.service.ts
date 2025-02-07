import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/prisma.client';
import { UserDto } from './dto/user.dto';
import { AuthLoginResponse } from './dto/auth.login.response.dto'
import { JwtService } from '@nestjs/jwt';
import { Payload } from './payload.interface';

@Injectable()
export class AuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(loginUser: UserDto): Promise<AuthLoginResponse> {
    let user = await this.prisma.user.findFirst({
      where: { email: loginUser.email },
    });

    // 회원이 없는 경우 자동 회원가입
    if (!user) {
      user = await this.createUser(loginUser);
    }

    const payload: Payload = {
      id: user.id,
      email: user.email
    }

    return {
      accessToken: this.jwtService.sign(payload)
    }
  }

  async createUser(createUser: UserDto): Promise<User> {
    return await this.prisma.user.create({
      data: {
        email: createUser.email,
        name: createUser.name
      },
    });
  }
}
