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
import { decode } from 'punycode';

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
       expiresIn: '3h',
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
    try {
      const user = await this.prisma.user.findFirst({
        where: { 
          refreshToken: refresh_token 
        },
      })

      if (user && user.name) {
        return this.login(
          user.email,
          user.name,
          user.platform
        )
      } else {
        throw new UnauthorizedException('Invalid Refresh Token');
      }
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
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
      console.log(error);
      throw new UnauthorizedException('Error validating refresh token');
    }
  }

  async login(email: string, name: string, platform: string): Promise<AuthLoginResponse> {
    try {
      let user = await this.prisma.user.findFirst({
        where: { email: email },
      });

      // 유저가 없으면 회원 가입 후 Token Return
      if (!user) {
        // 유저 생성
        user = await this.prisma.user.create({
          data: {
            email: email,
            name: name,
            platform: platform
          }
        })

        // 기본 식물 생성
        await this.prisma.user_plants.create({
          data: {
            user_id: user.user_id,
          },
        })

        // 기본 카테고리 생성
        await this.prisma.user_categories.createMany({
          data: [
            {
              user_id: user.user_id,
              color: "#FFA49B"
            },
            {
              user_id: user.user_id,
              color: "#FFB47D"
            },
            {
              user_id: user.user_id,
              color: "#FFF17D"
            },
            {
              user_id: user.user_id,
              color: "#B9EE85"
            },
            {
              user_id: user.user_id,
              color: "#6EEBB4"
            },
            {
              user_id: user.user_id,
              color: "#A5E2FF"
            },
            {
              user_id: user.user_id,
              color: "#A5B2FF"
            },
            {
              user_id: user.user_id,
              color: "#CBA5FF"
            }
          ]
        })
      }

      const accessToken = await this.createAccessToken(user);
      const refreshToken = await this.createRefreshToken(user);

      await this.prisma.user.update({
        where: { email: email },
        data: {
          refreshToken: refreshToken
        }
      })

      return {
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    }
    catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  async googleLogin(token: string): Promise<AuthLoginResponse> {
    try {
      const verifiedUser = await this.verifyGoogleToken(token);

      // Error 나면 어떻하지?
      return this.login(
        verifiedUser.email,
        verifiedUser.name,
        "Google"
      );
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Google token verification failed: ' + error);
    }
  }

  async verifyGoogleToken(token: string): Promise<{ email: string; name: string}> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken && decodedToken.email) {
        return {
          email: decodedToken.email,
          name: "Google-User"
        }
      } else {
        throw new UnauthorizedException('Google token verification failed');
      }
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Google token verification failed: ' + error);
    }
  }

  private generateJti(): string {
    return crypto.getRandomValues(new Uint32Array(16)).join('');
  }

  async appleLogin(token: string): Promise<AuthLoginResponse> {
    try {
      const verifiedUser = await this.verifyAppleToken(token);

      return this.login(
        verifiedUser.email,
        verifiedUser.name,
        "Apple"
      );
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Apple token verification failed: ' + error);
    }
  }

  async verifyAppleToken(token: string): Promise<{ email: string, name: string}> {
    try {
      // JWT에서 kid 추출
      const decodeToken = this.jwtService.decode(token, { complete: true }) as {
        header: { kid: string; }
        payload: { sub: string };
      };
      const keyIdFromToken = decodeToken.header.kid;

      // 공개 키 가져오기
      const key = await this.getKey(keyIdFromToken);

      // JWT 검증
      const verifiedToken = jwt.verify(token, key, { algorithms: ['RS256'] }) as any;
      
      // 토큰 검증이 성공하면 사용자 이메일과 이름을 반환
      return {
        email: verifiedToken.email,
        name: verifiedToken.name,
      };
    } catch (error) {
      console.log(error);
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

  // 유저 정보 반환해주는 함수
  async getUserInfo(userId: number) {
    try {
      let isVerifiedUser = await this.prisma.user.findUnique({
        where: {
          user_id: userId
        }
      })
      if (isVerifiedUser) {
        const userPlant = await this.prisma.user_plants.findFirst({
          where: {
            user_id: isVerifiedUser.user_id,
            plants_is_done: false
          }
        });

        const plant = await this.prisma.plants.findUnique({
          where: {
            plant_id: userPlant?.plant_id
          }
        });

        return {
          user: isVerifiedUser,
          userPlant: userPlant,
          plant: plant
        }
      } else {
        throw new UnauthorizedException("INVALID_TOKEN")
      }
    } catch(error) {
      console.log(error);
      if (error.name == "TokenExpiredError") {
        throw new UnauthorizedException("EXPIRED_TOKEN")
      }
      throw new UnauthorizedException("INVALID_TOKEN")
    }
  }
}