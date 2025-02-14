import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthLoginResponse } from './dto/auth.login.response.dto';
import { AuthGoogleLoginBody } from './dto/auth.google.login.body.dto';
import { AuthRefreshTokenBody } from './dto/auth.refresh.token.body.dto';
import { AuthAppleLoginBody } from './dto/auth.apple.login.body.dto';

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
}