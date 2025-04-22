import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import { PrismaService } from 'src/prisma.client';
import { logErrorToFile } from 'src/common/module/logger';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      // #이 붙었는지 검사
      if (!createCategoryDto.color?.includes("#")) {
        throw new UnauthorizedException("INVALID_REQUEST")
      }

      // 색상 중복 확인
      const category = await this.prisma.user_categories.findFirst({
        where: {
          user_id: userId,
          color: createCategoryDto.color
        }
      })

      if (!category) {
        const newCategory = await this.prisma.user_categories.create({
          data: {
            user_id: userId,
            color: createCategoryDto.color
          }
        });

        return {
          result: 'success',
          data: newCategory
        }
      }

      return {
        result: 'fail',
        message: 'Duplication Category Color'
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

  async findAll(userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const categories = await this.prisma.user_categories.findMany({
        where: {
          user_id: userId
        }
      })

      const extraCategory = {
        user_category_id: null,
        user_id: userId,
        color: null
      }

      return {
        result: 'success',
        data: [...categories, extraCategory]
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

  async findOne(categoryId: number, userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const category = await this.prisma.user_categories.findUnique({
        where: {
          user_category_id: categoryId,
          user_id: userId
        }
      });

      if (!category) {
        return {
          result: 'fail',
          message: 'DATA NOT FOUND'
        }
      }

      return {
        result: 'success',
        data: category
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

  async updateCategory(categoryId: number, userId: number, updateCategoryDto: UpdateCategoryDto): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      // #이 붙었는지 검사
      if (!updateCategoryDto.color?.includes("#")) {
        throw new UnauthorizedException("INVALID_REQUEST")
      }

      // 수정하고자 하는 category 찾기
      const category = await this.prisma.user_categories.findUnique({
        where: {
          user_category_id: categoryId,
          user_id: userId
        }
      });

      // 카테고리가 존재 시
      if (category) {
        // 중복된 색상이 있으면 안됨
        let duplicatedColor = await this.prisma.user_categories.findFirst({
          where: {
            user_id: userId,
            color: updateCategoryDto.color,
          }
        })

        if (duplicatedColor) {
          return {
            result: 'fail',
            message: 'Duplication Color'
          }
        }
      
        const updatedCategory = await this.prisma.user_categories.update({
          where: {
            user_category_id: categoryId,
            user_id: userId
          },
          data: {
            color: updateCategoryDto.color
          }
        });

        return {
          result: 'success',
          data: updatedCategory
        }
      } else {
        return {
          result: 'fail',
          message: 'DATA NOT FOUND'
        }
      }
    } catch (error) {
      console.log(error);
      logErrorToFile(error);
      return {
        result: 'error',
        message: "INVALID_REQUEST"
      }
    }
  }

  async deleteCategory(categoryId: number, userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const category = await this.prisma.user_categories.findUnique({
        where: {
          user_category_id: categoryId
        }
      })

      if (!category) {
        return {
          result: 'fail',
          message: "Category does not exist"
        }
      }

      const categoryCount = await this.prisma.user_categories.count({
        where: {
          user_id: userId
        }
      })

      if (categoryCount < 5) {
        return {
          result: 'fail',
          message: "At least one category must exist."
        }
      }

      await this.prisma.todos.updateMany({
        where: {
          user_id: userId,
          user_category_id: categoryId
        },
        data: {
          user_category_id: null
        }
      })

      const deletedCategory = await this.prisma.user_categories.delete({
        where: {
          user_id: userId,
          user_category_id: categoryId
        },
      });

      return {
        result: 'success',
        data: deletedCategory
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
