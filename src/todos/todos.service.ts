import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from 'src/prisma.client';
import { CreateTodoBodyDto } from './dto/create.todo.body.dto';
import { Prisma } from '@prisma/client';
import { CreateTodoResponseDTO } from './dto/create.todo.response.dto';

@Injectable()
export class TodosService {
  constructor (
    private prisma: PrismaService
  ) {}

  async create(createTodoDto: CreateTodoBodyDto, userId: number) : Promise<CreateTodoResponseDTO> {
    
    // 정상적인 user_plants_id인지 체크
    try {
      const user_plant = await this.prisma.user_plants.findUnique({
        where: {
          user_plant_id: createTodoDto.user_plants_id,
          plants_is_done: false
        }
      })

      // 정상적인 user_category_id인지 체크
      const user_category = await this.prisma.user_categories.findUnique({
        where: {
          user_category_id: createTodoDto.user_category_id
        }
      })

      if (user_plant && user_category) {
        const todo = await this.prisma.todos.create({
          data: {
            title: createTodoDto.title,
            description: createTodoDto.description,
            start_date: createTodoDto.start_date,
            end_date: createTodoDto.end_date,
            user_id: userId,
            user_plant_id: createTodoDto.user_plants_id,
            user_category_id: createTodoDto.user_category_id,
          }
        })

        return {
          todo_id: todo.todo_id,
          title: todo.title,
          description: todo.description,
          start_date: todo.start_date,
          end_date: todo.end_date,
          is_done: false,
          user_plants_id: todo.user_plant_id,
          user_category_id: todo.user_category_id
        }; 
      } else {
        throw new UnauthorizedException("Invalid TODO Creation")
      }
    } catch(error) {
      throw new UnauthorizedException("Invalid TODO Creation")
    }
  }

  async findAll(user_id: number) {
    return this.prisma.todos.findMany({
      where: {
        user_id: user_id
      }
    })
  }

  async findOne(todo_id: number, user_id: number) {
    return this.prisma.todos.findUnique({
      where: {
        user_id: user_id,
        todo_id: todo_id
      }
    })
  }
}
