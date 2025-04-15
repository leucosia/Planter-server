import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class CompletedService {
  constructor (
    private prisma: PrismaService
  ){}

  // 오늘 TODO 목록 가져오기
  // 타임존 문제가 있어서 시간이 이상하다. 한국 기준으로 하고 싶은데, 이것을 한국 기준으로 수정해서 하는것이 옳은지 모르겠다.
  async todayTodosGet(user_id: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
    try {
      // 금일 설정
      dayjs.extend(utc);
      dayjs.extend(timezone);
      
      const nowKST = dayjs().tz('Asia/Seoul');
      
      const startOfToday = dayjs().tz('Asia/Seoul').startOf('day');

      const endOfToday = startOfToday.add(1, 'day');

      const startDate = startOfToday.toDate();
      const endDate = endOfToday.toDate();

      // 아직 마감안된 TODO 조회
      let todos = this.prisma.todos.findMany({
        where: {
          user_id: user_id,
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

      // 에러 메시지 별로 반환을 해주는 것이 맞을까? 에러 메시지를 자세하게 반환하는건 보안상 안좋지만, 지금 너무 러프하게 반환하고 있다.
      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }

  // 완료 여부 변경
  async toggleTodoCompletion(complete_todo_id: number, user_id: number): Promise<SuccessResponse | FailResponse | ErrorResponse> {
      try {
        const completed_todo = await this.prisma.complete_todos.findUnique({
          where: {
            complete_todo_id: complete_todo_id
          },
        });

        const todo = await this.prisma.todos.findUnique({
          where: {
            todo_id: completed_todo?.todo_id,
            user_id: user_id
          }
        });

        if (todo && todo?.todo_id == completed_todo?.todo_id) {
          // 식물 경험치 추가
          const exp = (completed_todo.is_done) ? -1 : 1;

          // completed_todo 업데이트
          await this.prisma.complete_todos.update({
            where: {
              complete_todo_id: complete_todo_id
            },
            data: {
              is_done: !completed_todo.is_done
            }
          });

          // 유저 식물 정보 가져오기
          const user_plant = await this.prisma.user_plants.findFirst({
            where: {
              user_id: user_id,
              plants_is_done: false
            }
          });

          // 식물 정보 가져오기
          const plant = await this.prisma.plants.findUnique({
            where: {
              plant_id: user_plant?.plant_id
            }
          });

          // 식물 경험치 다 채운 경우
          if ((plant && user_plant) && (plant.max_exp <= (user_plant.exp + exp))) {
            await this.prisma.user_plants.update({
              where: {
                user_plant_id: user_plant.user_plant_id
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
                user_id: user_id,
                plant_id: plant.next_plant_id
              }
            });

            // 새 식물 유저 테이블에도 업로드
            await this.prisma.user.update({
              where: {
                user_id: user_id
              },
              data: {
                user_plant_id: updatedUserPlant.user_plant_id
              }
            })

            // 새 식물에 대한 데이터
            const updatedPlant  = await this.prisma.plants.findUnique({
              where: {
                plant_id: updatedUserPlant.plant_id
              }
            });

            return {
              result: 'success',
              data: {
                userPlant: updatedUserPlant,
                plant: updatedPlant
              }
            }
          }

          // 식물 경험치 다 채우지 않은 경우
          else {
            const updatedPlant = await this.prisma.user_plants.update({
              where: {
                user_plant_id: user_plant?.user_plant_id
              },
              data: {
                exp: {
                  increment: exp
                }
              }
            });

            return {
              result: 'success',
              data: {
                userPlant: updatedPlant,
                plant: plant
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

      return {
        result: 'error',
        message: 'INVALID_REQUEST'
      }
    }
  }
}