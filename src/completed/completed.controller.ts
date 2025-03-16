import { Controller, Get, UseGuards, Request, Patch, Param, ParseIntPipe, Query } from '@nestjs/common';
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

  @ApiOperation({
    summary: "TODO 완료 여부 변경 API",
    description: "complete_todo_id 값을 id값으로 입력하면 해당 completed_todo 완료 여부가 toggle 됩니다."
  })
  @Patch(':id')
  async completedToggle(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return await this.completedService.toggleTodoCompletion(id, userId);
  }

  @ApiOperation({
    summary: "특정 기간 TODO 조회 API",
    description: "시작일~마감일 기간 동안 completed_todo를 조회하는 API"
  })
  @Get('/range')
  async todosByDateRange(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    const userId = req.user.userId;
    return await this.completedService.getTodoByDateRange(startDate, endDate, userId);
  }
}
