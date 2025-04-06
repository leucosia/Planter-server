import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user_id: number) {
    try {
      // #이 붙었는지 검사
      if (!createCategoryDto.color?.includes("#")) {
        throw new UnauthorizedException("INVALID_REQUEST")
      }

      // 색상 중복 확인
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
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  async findAll(userId: number) {
    try {
      return await this.prisma.user_categories.findMany({
        where: {
          user_id: userId
        }
      })
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  async findOne(categoryId: number, userId: number) {
    try {
      return await this.prisma.user_categories.findUnique({
        where: {
          user_category_id: categoryId,
          user_id: userId
        }
      });
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
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
      });

      if (category) {
        // 중복된 색상이 있으면 안됨
        let duplicatedColor = await this.prisma.user_categories.findFirst({
          where: {
            user_id: userId,
            color: updateCategoryDto.color,
          }
        })

        if (duplicatedColor) {
          throw new BadRequestException("Duplication Color")
        }

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
      console.log(error);
      throw new UnauthorizedException("INVALID_REQUEST")
    }
  }

  async deleteCategory(categoryId: number, userId: number) {
    try {
      const categoryCount = await this.prisma.user_categories.findMany({
        where: {
          user_id: userId
        }
      })

      const todos = await this.prisma.todos.findMany({
        where: {
          user_id: userId,
          user_category_id: categoryId
        }
      });

      const todoIds = (await todos).map(todo => todo.todo_id);

      this.prisma.todos.updateMany({
        where: {
          user_id: userId,
          user_category_id: {
            in: todoIds
          }
        },
        data: {
          user_category_id: null
        }
      });

      this.prisma.user_categories.delete({
        where: {
          user_id: userId,
          user_category_id: categoryId
        },
      });
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }
}
