import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class PlanterService {
  constructor(
    private prisma: PrismaService
  ){}

  async getUserPlantFromUserId(userId: number) {
    return await this.prisma.user_plants.findFirst({
      where: {
        user_id: userId,
        plants_is_done: false
      }
    })
  }

  async getUserPlantFromPlantId(userPlantId: number, userId: number) {
    return await this.prisma.user_plants.findUnique({
      where: {
        user_plant_id: userPlantId,
        user_id: userId
      }
    })
  }
}
