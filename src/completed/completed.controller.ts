import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CompletedService } from './completed.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthJWTGuard } from 'src/auth/auth.jwt.guard';

@UseGuards(AuthJWTGuard)
@ApiBearerAuth()
@Controller('completed')
export class CompletedController {
  constructor(private readonly completedService: CompletedService) {}

  @ApiOperation({
    summary: "금일 Completed TODO 목록 조회",
    description: "금일 TODO 목록 조회 API 입니다. completed todo를 조회해줍니다."
  })
  @Get()
  async todayTodos(@Request() req) {
    const userId = req.user.userId
    return await this.completedService.todayTodosGet(userId)
  }
}
