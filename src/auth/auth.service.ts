import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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
import { logErrorToFile } from 'src/common/module/logger';

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

  public async refreshToken(refresh_token: string): Promise<SuccessResponse | FailResponse | ErrorResponse> {
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
        return {
          result: 'fail',
          message: 'Invalid Refresh Token'
        }
      }
    } catch(error) {
      console.log(error);
      logErrorToFile(error);
      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }

  // TODO: - 토큰 검증 과정에서 UnauthorizedException에 대한 추가적인 처리가 필요.
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
      logErrorToFile(error);
      throw new UnauthorizedException('Error validating refresh token');
    }
  }

  async login(email: string, name: string, platform: string): Promise<SuccessResponse | FailResponse | ErrorResponse> {
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
            name: this.generateRandomUserName(),
            platform: platform,
          }
        });

        // 기본 식물 생성
        let userPlant = await this.prisma.user_plants.create({
          data: {
            user_id: user.user_id,
          },
        });

        // 유저에게 할당
        await this.prisma.user.update({
          where: {
            user_id: user.user_id
          },
          data: {
            user_plant_id: userPlant.user_plant_id
          }
        });

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
        });
      }

      const accessToken = await this.createAccessToken(user);
      const refreshToken = await this.createRefreshToken(user);

      await this.prisma.user.update({
        where: { email: email },
        data: {
          refreshToken: refreshToken
        }
      });

      return {
        result: 'success',
        data: {
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      }
    }
    catch(error) {
      console.log(error);
      logErrorToFile(error);
      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }

  // TODO: - 토큰 검증 과정에서 UnauthorizedException에 대한 추가적인 처리가 필요.
  async googleLogin(token: string): Promise<SuccessResponse | FailResponse | ErrorResponse> {
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
      logErrorToFile(error);
      return {
        result: 'error',
        message: 'Google token verification failed'
      }
    }
  }

  // TODO: - 토큰 검증 과정에서 UnauthorizedException에 대한 추가적인 처리가 필요.
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
      logErrorToFile(error);
      throw new UnauthorizedException('Google token verification failed: ' + error);
    }
  }

  private generateJti(): string {
    return crypto.getRandomValues(new Uint32Array(16)).join('');
  }

  async appleLogin(token: string): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const verifiedUser = await this.verifyAppleToken(token);

      if (!verifiedUser) {
        throw new InternalServerErrorException('Apple 인증 실패')
      }
      return this.login(
        verifiedUser.email,
        verifiedUser.name,
        "Apple"
      );
    } catch (error) {
      console.log(error);
      logErrorToFile(error);
      return {
        result: 'error',
        message: 'Apple token verification failed'
      }
    }
  }

  // TODO: - 토큰 검증 과정에서 UnauthorizedException에 대한 추가적인 처리가 필요.
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
      logErrorToFile(error);
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
  async getUserInfo(userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      let isVerifiedUser = await this.prisma.user.findUnique({
        where: {
          user_id: userId
        }
      })
      // 유저가 존재한지 체크
      if (isVerifiedUser) {
        return {
          result: 'success',
          data: isVerifiedUser
        }
      } else {
        return {
          result: 'fail',
          message: 'DATA NOT FOUND'
        }
      }
    } catch(error) {
      console.log(error);
      logErrorToFile(error);
      if (error.name == "TokenExpiredError") {
        return {
          result: 'fail',
          message: 'EXPIRED_TOKEN'
        }
      }

      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }

  // 회원 탈퇴
  // TODO: - 유저가 바로 삭제 되는것이 좋은 동작은 아닌 것 같다. 좀 더 좋은 방법이 필요하다.
  // TODO: - Apple이나 구글 자체에 삭제되는 기능이 없다. 이 부분도 추가 구현 필요.
  async withdraw(userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          user_id: userId
        }
      })

      if (!user) {
        return {
          result: 'fail',
          message: 'DATA NOT FOUND'
        }
      }

      // complete_todo를 조회하기 위해 찾기
      const todos = await this.prisma.todos.findMany({
        where: {
          user_id: userId
        }
      });
      const todoIds = (await todos).map(todo => todo.todo_id);

      // 유저 complete_todo 삭제
      await this.prisma.complete_todos.deleteMany({
        where: {
          todo_id: {
            in: todoIds
          }
        }
      });

      // 유저 TODO 삭제
      await this.prisma.todos.deleteMany({
        where: {
          todo_id: {
            in: todoIds
          }
        }
      });

      // 유저 카테고리 삭제
      await this.prisma.user_categories.deleteMany({
        where: {
          user_id: userId
        }
      });

      // 유저 Plants 삭제
      await this.prisma.user_plants.deleteMany({
        where: {
          user_id: userId
        }
      });

      // 유저 삭제
      const deletedUser = await this.prisma.user.delete({
        where: {
          user_id: userId
        }
      });

      // 삭제 된 값이 없으면 에러 반환
      if (!user) {
        return {
          result: 'fail',
          message: 'DATA NOT FOUND'
        }
      }

      // Firebase 회원 탈퇴
      const firebaseUser = await admin.auth().getUserByEmail(user.email);
      await admin.auth().deleteUser(firebaseUser.uid);

      return {
        result: 'success',
        data: deletedUser
      }
    } catch(error) {
      console.log(error);
      logErrorToFile(error);
      return {
        result: 'error',
        message: 'USER DELETE ERROR'
      }
    }
  }

  // 귀여운 랜덤 이름 만드는 함수
  generateRandomUserName(): string {
    const adjectives = [
      '귀여운', '싱그러운', '느긋한', '화려한', '조용한', '햇살 가득한', '활기찬', '수줍은', '포근한', '청조한',
      '기운찬', '부드러운', '엉뚱한', '상큼한', '도도한'
    ]
    const palntName = [
      '선인장', '장미', '튤립', '난초', '해바라기', '무화과나무', '모스', '민트', '바질', '대나무', '라벤더',
      '수국', '소나무', '아레카야자', '꽃양귀비'
    ]

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const name = palntName[Math.floor(Math.random() * palntName.length)]
    

    return `${adj} ${name}`;
  }
}