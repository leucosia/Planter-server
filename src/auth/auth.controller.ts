import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthLoginResponse } from './dto/auth.login.response.dto';
import { AuthGoogleLoginBody } from './dto/auth.google.login.body.dto';
import { AuthRefreshTokenBody } from './dto/auth.refresh.token.body.dto';
import { AuthAppleLoginBody } from './dto/auth.apple.login.body.dto';
import { AuthAccessTokenBody } from './dto/auth.access.token.body.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @ApiOperation({
    summary: "구글 로그인",
    description: "구글 로그인 API"
  })
  @Post("google")
  @ApiBody({ type: AuthGoogleLoginBody })
  @ApiResponse({ type: AuthLoginResponse})
  async googleLogin(@Body('idToken') idToken: string) {
    return this.authService.googleLogin(idToken);
  }

  @ApiOperation({
    summary: "Apple 로그인",
    description: "Apple 로그인 API"
  })
  @Post("apple")
  @ApiBody({ type: AuthAppleLoginBody })
  @ApiResponse({ type: AuthLoginResponse })
  async appleLogin(@Body('identityToken') identityToken: string ) {
    return this.authService.appleLogin(identityToken);
  }

  @ApiOperation({
    summary: "Access Token 갱신",
    description: "Refresh Token을 이용하여 Access Token을 갱신받는 API"
  })
  @Post("refresh")
  @ApiBody({ type: AuthRefreshTokenBody })
  @ApiResponse({ type: AuthLoginResponse})
  async login(@Body('refresh_token') refresh_token: string) {
    return this.authService.refreshToken(refresh_token);
  }

  @ApiOperation({
    summary: "Access Token 검증",
    description: "Access Token 검증 API 해당 노션에 메시지 정의 부분에서 관련 오류 메시지 확인이 가능합니다.",
    externalDocs: {
      description: "프로젝트 Notion",
      url: "https://www.notion.so/API-18e08f63f8038029b6beeaeeb19f67a7?pvs=4"
    }
  })
  @Post("verify")
  @ApiBody({ type: AuthAccessTokenBody })
  async verifyToken(@Body('access_token') access_token: string) {
    return this.authService.verifyAccessToken(access_token)
  }
}