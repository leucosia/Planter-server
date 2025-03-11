import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class CompletedService {
  constructor (
    private prisma: PrismaService
  ){}

  async todayTodosGet(user_id: number) {
    // 금일 설정
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setDate(endOfToday.getDate() + 1)
    endOfToday.setHours(0, 0, 0, 0);

    // 아직 마감안된 TODO 조회
    let todos = this.prisma.todos.findMany({
      where: {
        user_id: user_id,
        start_date: {
          lte: startOfToday
        },
        end_date: {
          gte: endOfToday
        }
      },
    })
    const todoIds = (await todos).map(todo => todo.todo_id);

    return await this.prisma.complete_todos.findMany({
      where: {
        todo_id: {
          in: todoIds
        },
        complete_at: {
          gte: startOfToday,
          lte: endOfToday
        },
      }
    })
  }

  // 완료 여부 변경
  async toggleTodoCompletion(complete_todo_id: number, user_id: number) {
    const completed_todo = await this.prisma.complete_todos.findUnique({
      where: {
        complete_todo_id: complete_todo_id
      },
    })

    const todo = await this.prisma.todos.findUnique({
      where: {
        todo_id: completed_todo?.todo_id,
        user_id: user_id
      }
    })

    if (todo && todo?.todo_id == completed_todo?.todo_id) {
      // 식물 경험치 추가
      const exp = (completed_todo.is_done) ? -1 : 1;

      this.prisma.user_plants.update({
        where: {
          user_plant_id: todo.user_plant_id,
          user_id: user_id
        },
        data: {
          exp: {
            increment: exp
          }
        }
      })

      return await this.prisma.complete_todos.update({
        where: {
          complete_todo_id: complete_todo_id
        },
        data: {
          is_done: !completed_todo.is_done
        }
      })
    } else {
      throw new UnauthorizedException("INVALID_REQUEST");
    }
  }

  // 특정 기간 동안 조회
  async getTodoByDateRange(start_date_string: Date, end_date_string: Date, userId: number) {
    if (start_date_string && end_date_string) {
      const start_date = new Date(start_date_string);
      const end_date = new Date(end_date_string);
      // 이하여서 제대로 조회하기 위함
      end_date.setHours(23, 59, 59, 999);

      const todos = await this.prisma.todos.findMany({
        where: {
          user_id: userId,
          start_date: {
            lte: start_date
          },
          end_date: {
            gte: end_date
          }
        }
      })
      const todoIds = (await todos).map(todo => todo.todo_id);

      return await this.prisma.complete_todos.findMany({
        where: {
          todo_id: {
            in: todoIds
          },
          complete_at: {
            gte: start_date,
            lte: end_date
          }
        }
      })
    } else {
      throw new UnauthorizedException("INVALID_REQUEST");
    }
  }
}