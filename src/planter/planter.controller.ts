import { Controller, Get, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { PlanterService } from './planter.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthJWTGuard } from 'src/auth/auth.jwt.guard';

@Controller('planter')
@UseGuards(AuthJWTGuard)
@ApiBearerAuth()
export class PlanterController {
  constructor(private readonly planterService: PlanterService) {}

  @ApiOperation({
    summary: "현재 유저 식물 정보 API (토큰)",
    description: "현재 활성화 된 식물의 정보를 토큰값 유저 정보를 바탕으로 반환합니다."
  })
  @Get()
  async getUserPlantFromToken(@Request() req) {
    const userId = req.user.userId;
    return this.planterService.getUserPlantFromUserId(userId);
  }

  @ApiOperation({
    summary: "유저 식물 정보 API (식물 ID)",
    description: "식물 ID값을 바탕으로 유저 식물 정보를 반환합니다."
  })
  @Get(':id')
  async getUserPlantFromId(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.planterService.getUserPlantFromPlantId(id, userId);
  }
}