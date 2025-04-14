import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class PlanterService {
  constructor(
    private prisma: PrismaService
  ){}

  // User ID를 기반으로 User 식물 정보를 얻는 함수
  async getUserPlant(userId: number, userPlantId: number) {
    try {
      return await this.prisma.user_plants.findUnique({
        where: {
          user_id: userId,
          user_plant_id: userPlantId
        }
      })
    } catch(error) {
      console.log(error);
      throw new BadRequestException('INVALID_REQUEST');
    }
  }

  // Plant ID를 기반으로 식물 정보를 얻는 함수
  async getPlant(plantId: number) {
    try {
      return await this.prisma.plants.findUnique({
        where: {
          plant_id: plantId
        }
      });
    } catch(error) {
      console.log(error);
      throw new BadRequestException('INVALID_REQUEST');
    }
  }

  // 모든 식물 정보를 가져오는 함수
  async getAllPlants() {
    try {
      return await this.prisma.plants.findMany();
    } catch (error) {
      console.log(error);
      throw new BadRequestException("NO_DATA_FOUND")
    }
  }

  // 모든 유저 식물 정보를 가져오는 함수
  async getAllUserPlants(userId: number) {
    try {
      return await this.prisma.user_plants.findMany({
        where: {
          user_id: userId
        }
      });
    } catch(error) {
      console.log(error);
      throw new BadRequestException('INVALID_REQUEST');
    }
  }
}