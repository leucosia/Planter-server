import { Controller, Post, Body, Get, UseGuards, Request, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthLoginResponse } from './dto/auth.login.response.dto';
import { AuthGoogleLoginBody } from './dto/auth.google.login.body.dto';
import { AuthRefreshTokenBody } from './dto/auth.refresh.token.body.dto';
import { AuthAppleLoginBody } from './dto/auth.apple.login.body.dto';
import { AuthAccessTokenBody } from './dto/auth.access.token.body.dto';
import { AuthUserInfoResponse } from './dto/auth.get.info.response.dto';
import { AuthJWTGuard } from './auth.jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @ApiOperation({
    summary: "구글 로그인",
    description: "구글 로그인 API. firebase auth token 값을 보내줘야합니다."
  })
  @Post("google")
  @ApiBody({ type: AuthGoogleLoginBody })
  @ApiResponse({ type: AuthLoginResponse })
  async googleLogin(@Body('token') token: string) {
    return await this.authService.googleLogin(token);
  }

  @ApiOperation({
    summary: "Apple 로그인",
    description: "Apple 로그인 API. identityToken 값을 보내줘야합니다."
  })
  @Post("apple")
  @ApiBody({ type: AuthAppleLoginBody })
  @ApiResponse({ type: AuthLoginResponse })
  async appleLogin(@Body('token') token: string ) {
    return await this.authService.appleLogin(token);
  }

  @ApiOperation({
    summary: "Access Token 갱신",
    description: "Refresh Token을 이용하여 Access Token을 갱신받는 API"
  })
  @Post("refresh")
  @ApiBody({ type: AuthRefreshTokenBody })
  @ApiResponse({ type: AuthLoginResponse })
  async login(@Body('refreshToken') refresh_token: string) {
    return await this.authService.refreshToken(refresh_token);
  }

  @ApiOperation({
    summary: "유저 정보 반환 API",
    description: "유저 정보 반환 API입니다. 오류 메시지는 Notion에서 확인 가능합니다.",
    externalDocs: {
      description: "프로젝트 Notion",
      url: "https://www.notion.so/API-18e08f63f8038029b6beeaeeb19f67a7?pvs=4"
    }
  })
  @ApiBearerAuth()
  @UseGuards(AuthJWTGuard)
  @Get("info")
  @ApiResponse({ type: AuthUserInfoResponse })
  async verifyToken(@Request() req) {
    const userId = req.user.userId;
    return this.authService.getUserInfo(userId)
  }

  @ApiOperation({
    summary: "회원 탈퇴 API",
    description: "회원 탈퇴 API입니다."
  })
  @ApiBearerAuth()
  @UseGuards(AuthJWTGuard)
  @Delete()
  async withdraw(@Request() req) {
    const userId = req.user.userId;
    return await this.authService.withdraw(userId)
  }
}