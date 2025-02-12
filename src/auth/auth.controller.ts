import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthLoginResponse } from './dto/auth.login.response.dto';
import { AuthGoogleLoginBody } from './dto/auth.google.login.body.dto';

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
}
