import { Controller, Get, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { PlanterService } from './planter.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthJWTGuard } from 'src/auth/auth.jwt.guard';

@Controller('/planter')
@UseGuards(AuthJWTGuard)
@ApiBearerAuth()
export class PlanterController {
  constructor(private readonly planterService: PlanterService) {}

  @ApiOperation({
    summary: "유저 식물들 정보 API",
    description: "유저의 모든 식물 정보를 반환하는 API 입니다."
  })
  @Get("/userplant/all")
  async getUserPlantFromToken(@Request() req) {
    const userId = req.user.userId;
    return await this.planterService.getAllUserPlants(userId);
  }

  @ApiOperation({
    summary: "유저 식물 정보 API (식물 ID)",
    description: "식물 ID값을 바탕으로 유저 식물 정보를 반환합니다."
  })
  @Get('/userplant/:id')
  async getUserPlant(@Param('id', ParseIntPipe) userPlantId: number, @Request() req) {
    const userId = req.user.userId;
    return await this.planterService.getUserPlant(userId, userPlantId);
  }

  @ApiOperation({
    summary: "모든 식물 정보 API",
    description: "모든 식물 정보를 얻을 수 있는 API 입니다."
  })
  @Get('/plant/all')
  async getAllPlant() {
    return this.planterService.getAllPlants();
  }

  @ApiOperation({
    summary: "식물 정보 API",
    description: "식물 ID를 기반으로 식물 정보를 검색하는 API 입니다."
  })
  @Get('plant/:id')
  async getPlant(@Param('id', ParseIntPipe) plantId: number) {
    return await this.planterService.getPlant(plantId);
  }
}