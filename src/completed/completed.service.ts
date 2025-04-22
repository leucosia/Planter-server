import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { PrismaService } from 'src/prisma.client';
import { logErrorToFile } from 'src/common/module/logger';

@Injectable()
export class CompletedService {
  constructor (
    private prisma: PrismaService
  ){}

  // 오늘 TODO 목록 가져오기
  // 타임존 문제가 있어서 시간이 이상하다. 한국 기준으로 하고 싶은데, 이것을 한국 기준으로 수정해서 하는것이 옳은지 모르겠다.
  async todayTodosGet(userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      // 금일 설정
      dayjs.extend(utc);
      dayjs.extend(timezone);
      
      const startOfToday = dayjs().tz('Asia/Seoul').startOf('day');
      const endOfToday = startOfToday.add(1, 'day');

      const startDate = startOfToday.toDate();
      const endDate = endOfToday.toDate();

      // 아직 마감안된 TODO 조회
      let todos = await this.prisma.todos.findMany({
        where: {
          user_id: userId,
          start_date: {
            lte: endDate
          },
          end_date: {
            gte: startDate
          }
        },
      });
      const todoIds = (await todos).map(todo => todo.todo_id);

      const todayTodos = await this.prisma.complete_todos.findMany({
        where: {
          todo_id: {
            in: todoIds
          },
          complete_at: {
            gte: startDate,
            lt: endDate
          },
        }
      });
      
      return {
        result: 'success',
        data: todayTodos
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

  // 완료 여부 변경
  async toggleTodoCompletion(completeTodoId: number, userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
      try {
        const completedTodo = await this.prisma.complete_todos.findUnique({
          where: {
            complete_todo_id: completeTodoId
          },
        });

        const todo = await this.prisma.todos.findUnique({
          where: {
            todo_id: completedTodo?.todo_id,
            user_id: userId
          }
        });

        if (todo && todo?.todo_id == completedTodo?.todo_id) {
          // 식물 경험치 추가
          const exp = (completedTodo.is_done) ? -1 : 1;

          // completed_todo 업데이트
          await this.prisma.complete_todos.update({
            where: {
              complete_todo_id: completeTodoId
            },
            data: {
              is_done: !completedTodo.is_done
            }
          });

          // 유저 식물 정보 가져오기
          const userPlant = await this.prisma.user_plants.findFirst({
            where: {
              user_id: userId,
              plants_is_done: false
            }
          });

          // 식물 정보 가져오기
          const plant = await this.prisma.plants.findUnique({
            where: {
              plant_id: userPlant?.plant_id
            }
          });

          // 식물 경험치 다 채운 경우
          if ((plant && userPlant) && (plant.max_exp <= (userPlant.exp + exp))) {
            await this.prisma.user_plants.update({
              where: {
                user_plant_id: userPlant.user_plant_id
              },
              data: {
                exp: {
                  increment: exp
                },
                plants_is_done: true
              }
            });

            // 새 식물 생성 후 전달
            const updatedUserPlant = await this.prisma.user_plants.create({
              data: {
                user_id: userId,
                plant_id: plant.next_plant_id
              }
            });

            // 새 식물 유저 테이블에도 업로드
            await this.prisma.user.update({
              where: {
                user_id: userId
              },
              data: {
                user_plant_id: updatedUserPlant.user_plant_id
              }
            })

            return {
              result: 'success',
              data: {
                type: 'LEVEL_UP',
                next_plant_id: updatedUserPlant.plant_id
              }
            }
          }

          // 식물 경험치 다 채우지 않은 경우
          else {
            return {
              result: 'success',
              data: {
                type: 'SUCCESS'
              }
            }
          }
        } else {
          return {
            result: 'fail',
            message: "INVALID_REQUEST"
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

  // 특정 기간 동안 조회
  async getTodoByDateRange(startDateString: string, endDateString: string, userId: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      if (startDateString && endDateString) {
        const startDate = dayjs(startDateString).startOf('day').toDate();
        const endDate = dayjs(endDateString).add(1, 'day').toDate();

        const todos = await this.prisma.todos.findMany({
          where: {
            user_id: userId,
            start_date: {
              lte: endDate
            },
            end_date: {
              gte: startDate
            }
          }
        });
        const todoIds = (await todos).map(todo => todo.todo_id);

        const completedTodos = await this.prisma.complete_todos.findMany({
          where: {
            todo_id: {
              in: todoIds
            },
            complete_at: {
              gte: startDate,
              lt: endDate
            },
          }
        });

        return {
          result: 'success',
          data: completedTodos
        }
      } else {
        return {
          result: 'fail',
          message: "INVALID_REQUEST"
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