import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class CompletedService {
  constructor (
    private prisma: PrismaService
  ){}

  async todayTodosGet(userId: number) {
    try {
      // 금일 설정
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setDate(endOfToday.getDate() + 1);
      endOfToday.setHours(0, 0, 0, 0);

      // 아직 마감안된 TODO 조회
      let todos = this.prisma.todos.findMany({
        where: {
          user_id: userId,
          start_date: {
            lte: startOfToday
          },
          end_date: {
            gte: endOfToday
          }
        },
      });
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
      });
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  // 완료 여부 변경
  async toggleTodoCompletion(completeTodoId: number, userId: number) {
      try {
        const completed_todo = await this.prisma.complete_todos.findUnique({
          where: {
            complete_todo_id: completeTodoId
          },
        });

        const todo = await this.prisma.todos.findUnique({
          where: {
            todo_id: completed_todo?.todo_id,
            user_id: userId
          }
        });

        if (todo && todo?.todo_id == completed_todo?.todo_id) {
          // 식물 경험치 추가
          const exp = (completed_todo.is_done) ? -1 : 1;

          // completed_todo 업데이트
          await this.prisma.complete_todos.update({
            where: {
              complete_todo_id: completeTodoId
            },
            data: {
              is_done: !completed_todo.is_done
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

            // 새 식물에 대한 데이터
            const updatedPlant  = await this.prisma.plants.findUnique({
              where: {
                plant_id: updatedUserPlant.plant_id
              }
            });

            return {
              userPlant: updatedUserPlant,
              plant: updatedPlant
            }
          }

          // 식물 경험치 다 채우지 않은 경우
          else {
            const updatedPlant = await this.prisma.user_plants.update({
              where: {
                user_plant_id: userPlant?.user_plant_id
              },
              data: {
                exp: {
                  increment: exp
                }
              }
            });

            return {
              userPlant: updatedPlant,
              plant: plant
            }
          }
        } else {
          throw new UnauthorizedException("INVALID_REQUEST");
        }
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }

  // 특정 기간 동안 조회
  async getTodoByDateRange(startDateString: string, endDateString: string, userId: number) {
    try {
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);

      if (startDateString && endDateString && (startDate < endDate)) {
        // 이하여서 제대로 조회하기 위함
        endDate.setHours(23, 59, 59, 999);

        const todos = await this.prisma.todos.findMany({
          where: {
            user_id: userId,
            start_date: {
              lte: startDate
            },
            end_date: {
              gte: endDate
            }
          }
        });
        const todoIds = (await todos).map(todo => todo.todo_id);

        return await this.prisma.complete_todos.findMany({
          where: {
            todo_id: {
              in: todoIds
            },
            complete_at: {
              gte: startDate,
              lte: endDate
            }
          }
        });
      } else {
        throw new UnauthorizedException("INVALID_REQUEST");
      }
    } catch(error) {
      console.log(error);
      throw new UnauthorizedException('INVALID_REQUEST');
    }
  }
}