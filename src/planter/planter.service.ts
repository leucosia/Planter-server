import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { logErrorToFile } from 'src/common/module/logger';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class PlanterService {
  constructor(
    private prisma: PrismaService
  ){}

  // User ID를 기반으로 User 식물 정보를 얻는 함수
  async getUserPlant(userId: number, userPlantId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const userPlant = await this.prisma.user_plants.findUnique({
        where: {
          user_id: userId,
          user_plant_id: userPlantId
        }
      })

      if (userPlant) {
        return {
          result: 'success',
          data: userPlant
        }
      }
      else {
        return {
          result: 'fail',
          message: 'DATA_NOT_FOUND'
        }
      }
    } catch(error) {
      console.log(error);
      logErrorToFile(error);

      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }

  // Plant ID를 기반으로 식물 정보를 얻는 함수
  async getPlant(plantId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const plant = await this.prisma.plants.findUnique({
        where: {
          plant_id: plantId
        }
      });

      if (plant) {
        return {
          result: 'success',
          data: plant
        }
      }
      else {
        return {
          result: 'fail',
          message: 'DATA_NOT_FOUND'
        }
      }
    } catch(error) {
      console.log(error);
      logErrorToFile(error);

      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }

  // 모든 식물 정보를 가져오는 함수
  async getAllPlants(): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const plants = await this.prisma.plants.findMany();

      if (plants) {
        return {
          result: 'success',
          data: plants
        }
      }
      else {
        return {
          result: 'fail',
          message: 'DATA_NOT_FOUND'
        }
      }
    } catch (error) {
      console.log(error);
      logErrorToFile(error);

      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }

  // 모든 유저 식물 정보를 가져오는 함수
  async getAllUserPlants(userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const userPlants = await this.prisma.user_plants.findMany({
        where: {
          user_id: userId
        }
      });

      if (userPlants) {
        return {
          result: 'success',
          data: userPlants
        }
      }
      else {
        return {
          result: 'fail',
          message: 'DATA_NOT_FOUND'
        }
      }
    } catch(error) {
      console.log(error);
      logErrorToFile(error);

      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }
}