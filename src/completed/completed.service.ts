import { Injectable } from '@nestjs/common';
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
}
