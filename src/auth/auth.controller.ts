import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthLoginResponse } from './dto/auth.login.response.dto';
import { AuthGoogleLoginBody } from './dto/auth.google.login.body.dto';
import { AuthLoginBody } from './dto/auth.login.body.dto';
import { AuthSignupBody } from './dto/auth.signup.body.dto';
import { AuthRefreshTokenBody } from './dto/auth.refresh.token.body.dto';

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