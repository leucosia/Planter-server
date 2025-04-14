import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class PlanterService {
  constructor(
    private prisma: PrismaService
  ){}

  async getUserPlantFromUserId(userId: number) {
    try {
      return await this.prisma.user_plants.findMany({
        where: {
          user_id: userId
        },
        include: {
          plant: true
        }
      });
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  async getUserPlantFromPlantId(userPlantId: number, userId: number) {
    try {
      return await this.prisma.user_plants.findUnique({
        where: {
          user_plant_id: userPlantId,
          user_id: userId
        }
      });
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  async getAllPlanter() {
    try {
      return await this.prisma.plants.findMany();
    } catch (error) {
      console.log(error);
      throw new BadRequestException("NO_DATA_FOUND")
    }
  }
}