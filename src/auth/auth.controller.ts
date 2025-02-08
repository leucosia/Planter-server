import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthLoginBody } from './dto/auth.login.body.dto'
import { AuthLoginResponse } from './dto/auth.login.response.dto';
import { AuthSignupResponse } from './dto/auth.signup.response.dto';
import { AuthSignupBody } from './dto/auth.signup.body.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @ApiOperation({
    summary: "로그인",
    description: "로그인 API"
  })
  @Post("Login")
  @ApiBody({ type: AuthLoginBody })
  @ApiResponse({ type: AuthLoginResponse})
  async login(@Body() loginUser: AuthLoginBody) {
    return this.authService.login(loginUser);
  }

  @ApiOperation({
    summary: "회원가입",
    description: "회원가입 API"
  })
  @ApiResponse({ type: AuthSignupResponse})
  @ApiBody({ type: AuthSignupBody })
  @Post("signup")
  async signup(@Body() user: AuthSignupBody) {
    return this.authService.signup(user);
  }
}
