import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/prisma.client';
import { AuthLoginResponse } from './dto/auth.login.response.dto'
import { JwtService } from '@nestjs/jwt';
import { Payload } from './payload.interface';
import * as admin from 'firebase-admin';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';

@Injectable()
export class AuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  private jwksClient: jwksClient.JwksClient;
  
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.jwksClient = jwksClient({
      jwksUri: "https://appleid.apple.com/auth/keys",
    });
    
    if (admin.apps.length == 0) {
      admin.initializeApp({
        credential: admin.credential.cert(
          path.join(__dirname, '../../planter-77541-firebase-adminsdk-fbsvc-29cdca1ce1.json')
        ),
      });
    }
  }

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
      id: payload.user_id,
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
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(decodedToken);
      if (decodedToken && decodedToken.email) {
        return {
          email: decodedToken.email,
          name: "Google-User"
        }
      } else {
        throw new UnauthorizedException('Google token verification failed');
      }
    } catch (error) {
      throw new UnauthorizedException('Google token verification failed: ' + error);
    }
  }

  private generateJti(): string {
    return crypto.getRandomValues(new Uint32Array(16)).join('');
  }

  async appleLogin(identityToken: string): Promise<AuthLoginResponse> {
    try {
      const verifiedUser = await this.verifyAppleToken(identityToken);

      return this.login(
        verifiedUser.email,
        verifiedUser.name
      );
    } catch (error) {
      throw new UnauthorizedException('Apple token verification failed: ' + error);
    }
  }

  async verifyAppleToken(identityToken: string): Promise<{ email: string, name: string}> {
    try {
      // JWT에서 kid 추출
      const decodeToken = this.jwtService.decode(identityToken, { complete: true }) as {
        header: { kid: string; }
        payload: { sub: string };
      };
      const keyIdFromToken = decodeToken.header.kid;

      // 공개 키 가져오기
      const key = await this.getKey(keyIdFromToken);

      // JWT 검증
      const verifiedToken = jwt.verify(identityToken, key, { algorithms: ['RS256'] }) as any;
      
      // 토큰 검증이 성공하면 사용자 이메일과 이름을 반환
      return {
        email: verifiedToken.email,
        name: verifiedToken.name,
      };
    } catch (error) {
      throw new UnauthorizedException('Apple token verification failed: ' + error);
    }
  }

  // kid로 공개 키를 가져오는 함수
  private async getKey(kid: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key?.getPublicKey())
        }
      })
    })
  }
}
