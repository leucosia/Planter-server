import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user_id: number) {
    const category = await this.prisma.user_categories.findFirst({
      where: {
        user_id: user_id,
        color: createCategoryDto.color
      }
    })

    if (!category) {
      return await this.prisma.user_categories.create({
        data: {
          user_id: user_id,
          color: createCategoryDto.color
        }
      })
    }

    return '중복된 카테고리 색상';
  }
}
