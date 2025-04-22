import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.client';
import { CreateTodoBodyDto } from './dto/create.todo.body.dto';
import { CreateTodoResponseDTO } from './dto/create.todo.response.dto';
import { UpdateTodoBodyDto } from './dto/update.todo.body.dto';
import { UpdateTodoResponseDto } from './dto/update.todo.response.dto';
import { logErrorToFile } from 'src/common/module/logger';

@Injectable()
export class TodosService {
  constructor (
    private prisma: PrismaService
  ) {}

  async create(createTodoDto: CreateTodoBodyDto, userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    // 정상적인 user_plant_id인지 체크
    try {
      const user_plant = await this.prisma.user_plants.findUnique({
        where: {
          user_plant_id: createTodoDto.user_plant_id,
          user_id: userId
        }
      });

      // 정상적인 user_category_id인지 체크
      const user_category = await this.prisma.user_categories.findUnique({
        where: {
          user_category_id: createTodoDto.user_category_id
        }
      });

      const startDate = new Date(createTodoDto.start_date);
      const endDate = new Date(createTodoDto.end_date);

      if (user_plant && user_category) {
        const todo = await this.prisma.todos.create({
          data: {
            title: createTodoDto.title,
            description: createTodoDto.description,
            start_date: startDate,
            end_date: endDate,
            user_id: userId,
            user_plant_id: user_plant.user_plant_id,
            user_category_id: user_category.user_category_id,
          }
        });

        endDate.setDate(endDate.getDate() + 1)
        let currentDate = startDate
        while (currentDate < endDate) {
          await this.prisma.complete_todos.create ({
            data: {
              todo_id: todo.todo_id,
              complete_at: currentDate
            }
          })

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          result: 'success',
          data: todo
        } 
      } else {
        return {
          result: 'fail',
          message: 'WRONG_APPROACH'
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

  async findAll(user_id: number): Promise<SuccessResponse | FailResponse | ErrorResponse>  {
    try {
      const todos = await this.prisma.todos.findMany({
        where: {
          user_id: user_id
        }
      });

      if (todos) {
        return {
          result: 'success',
          data: todos
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

  async findOne(todo_id: number, user_id: number): Promise<SuccessResponse | FailResponse | ErrorResponse>  {
    try {
      const todo = await this.prisma.todos.findUnique({
        where: {
          user_id: user_id,
          todo_id: todo_id
        }
      });
      
      if (todo) {
        return {
          result: 'success',
          data: todo
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

  async update(todoId: number, userId: number, updateTodoDto: UpdateTodoBodyDto): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const todo = await this.prisma.todos.findUnique({
        where: {
          todo_id: todoId,
          user_id: userId
        }
      });

      if (todo) {
        const updateStartDate = new Date(updateTodoDto.start_date);
        const updateEndDate = new Date(updateTodoDto.end_date);

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
            start_date: updateStartDate,
            end_date: updateEndDate,
            user_category_id: updateTodoDto.user_category_id,
            user_plant_id: todo.user_plant_id
          }
        });

        // 변경된 시작일이 있으면 todo를 제거
        if (todo.start_date < updateStartDate) {
          await this.prisma.complete_todos.deleteMany({
            where: {
              todo_id: todo.todo_id,
              complete_at: {
                gte: todo.start_date,
                lt: updateStartDate,
              }
            }
          });
        }
        // 시작일이 더 빠른 시일로 바뀌면 추가를 해야할까?
        if (todo.start_date > updateStartDate) {
          const differentStartDay = todo.start_date.getDate() - updateStartDate.getDate();
          let completeStartDate = updateStartDate;

          for (let i = 0; i < differentStartDay; i++) {
            await this.prisma.complete_todos.create({
              data: {
                todo_id: todo.todo_id,
                complete_at: completeStartDate
              }
            });

            completeStartDate.setDate(completeStartDate.getDate() + 1);
          }
        }

        // 변경된 마감일이 있으면 todo를 추가
        if (todo.end_date < updateEndDate) {
          const differentEndDay = updateEndDate.getDate() - todo.end_date.getDate();
          let completedEndDate = todo.end_date;

          for (let i = 0; i < differentEndDay; i++) {
            completedEndDate.setDate(completedEndDate.getDate() + 1);

            await this.prisma.complete_todos.create({
              data: {
                todo_id: todo.todo_id,
                complete_at: completedEndDate
              }
            });
          }
        }
        // 변경된 마감일이 빠르면 todo를 제거
        else if (todo.end_date > updateEndDate) {
          await this.prisma.complete_todos.deleteMany({
            where: {
              todo_id: todo.todo_id,
              complete_at: {
                gt: updateEndDate,
                lte: todo.end_date
              }
            }
          });
        }

        if (newTodo) {
          return {
            result: 'success',
            data: newTodo
          }
        }
        else {
          return {
            result: 'fail',
            message: 'TODO_UPDATE_FAILED'
          }
        }
      } else {
        return {
          result: 'fail',
          message: 'TODO_UPDATE_FAILED'
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

  async remove(todo_id: number, user_id: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      const todo = await this.prisma.todos.delete({
        where: {
          todo_id: todo_id,
          user_id: user_id
        }
      });

      if (todo) {
        return {
          result: 'success',
          data: todo
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
