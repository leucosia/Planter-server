import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.client';
import { CreateTodoBodyDto } from './dto/create.todo.body.dto';
import { CreateTodoResponseDTO } from './dto/create.todo.response.dto';
import { UpdateTodoBodyDto } from './dto/update.todo.body.dto';
import { UpdateTodoResponseDto } from './dto/update.todo.response.dto';

@Injectable()
export class TodosService {
  constructor (
    private prisma: PrismaService
  ) {}

  async create(createTodoDto: CreateTodoBodyDto, userId: number) : Promise<CreateTodoResponseDTO> {
    // 정상적인 user_plants_id인지 체크
    try {
      const userPlant = await this.prisma.user_plants.findUnique({
        where: {
          user_plant_id: createTodoDto.userPlantsId,
          user_id: userId
        }
      })

      // 정상적인 user_category_id인지 체크
      const userCategory = await this.prisma.user_categories.findUnique({
        where: {
          user_category_id: createTodoDto.userCategoryId
        }
      })

      const startDate = new Date(createTodoDto.startDate);
      const endDate = new Date(createTodoDto.endDate);

      if (userPlant && userCategory) {
        const todo = await this.prisma.todos.create({
          data: {
            title: createTodoDto.title,
            description: createTodoDto.description,
            start_date: startDate,
            end_date: endDate,
            user_id: userId,
            user_plant_id: userPlant.user_plant_id,
            user_category_id: userCategory.user_category_id,
          }
        })

        let currentDate = startDate
        while (currentDate <= endDate) {
          await this.prisma.complete_todos.create ({
            data: {
              todo_id: todo.todo_id,
              complete_at: currentDate
            }
          })

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          todoId: todo.todo_id,
          title: todo.title,
          description: todo.description,
          startDate: todo.start_date,
          endDate: todo.end_date,
          isDone: false,
          userPlantsId: todo.user_plant_id,
          userCategoryId: todo.user_category_id
        }; 
      } else {
        throw new UnauthorizedException("Invalid TODO Creation")
      }
    } catch(error) {
      console.log(error)
      throw new UnauthorizedException("Invalid TODO Creation")
    }
  }

  async findAll(userId: number) {
    try {
      return this.prisma.todos.findMany({
        where: {
          user_id: userId
        }
      });
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  async findOne(todoId: number, userId: number) {
    try {
      return this.prisma.todos.findUnique({
        where: {
          user_id: userId,
          todo_id: todoId
        }
      });
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  async update(todoId: number, userId: number, updateTodoDto: UpdateTodoBodyDto): Promise<UpdateTodoResponseDto> {
    try {
      const todo = await this.prisma.todos.findUnique({
        where: {
          todo_id: todoId,
          user_id: userId
        }
      })

      if (todo) {
        const newTodo = await this.prisma.todos.update({
          where: {
            todo_id: todoId,
            user_id: userId
          },
          data: {
            todo_id: todo.todo_id,
            user_id: todo.user_id,
            title: updateTodoDto.title,
            description: updateTodoDto.description,
            start_date: updateTodoDto.startDate,
            end_date: updateTodoDto.endDate,
            user_category_id: updateTodoDto.userCategoryId,
            user_plant_id: todo.user_plant_id
          }
        })
        return {
          todoId: newTodo.todo_id,
          title: newTodo.title,
          description: newTodo.description,
          startDate: newTodo.start_date,
          endDate: newTodo.end_date,
          userCategoryId: newTodo.user_category_id,
          userPlantsId: newTodo.user_plant_id
        }
      } else {
        throw new UnauthorizedException("Invalid TODO Update")
      }
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException("Invalid TODO Update")
    }
  }

  async remove(todoId: number, userId: number) {
    try {
      return this.prisma.todos.delete({
        where: {
          todo_id: todoId,
          user_id: userId
        }
      });
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }
}
