import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
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

  async findAll(userId: number) {
    return await this.prisma.user_categories.findMany({
      where: {
        user_id: userId
      }
    })
  }

  async findOne(categoryId: number, userId: number) {
    return await this.prisma.user_categories.findUnique({
      where: {
        user_category_id: categoryId,
        user_id: userId
      }
    })
  }

  async updateCategory(categoryId: number, userId: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      // #이 붙었는지 검사
      if (!updateCategoryDto.color?.includes("#")) {
        throw new UnauthorizedException("INVALID_REQUEST")
      }

      const category = await this.prisma.user_categories.findUnique({
        where: {
          user_category_id: categoryId,
          user_id: userId
        }
      })
      if (category) {
        // 기본 카테고리는 변경 안됨
        if (category.color == "#74c270") {
          throw new UnauthorizedException("UNMODIFIABLE_CATEGORY")
        }

        return await this.prisma.user_categories.update({
          where: {
            user_category_id: categoryId,
            user_id: userId
          },
          data: {
            color: updateCategoryDto.color
          }
        })
      } else {
        throw new UnauthorizedException("INVALID_REQUEST")
      }
    } catch (error) {
      throw new UnauthorizedException("INVALID_REQUEST")
    }
  }
}
