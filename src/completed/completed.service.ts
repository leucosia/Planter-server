import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.client';

@Injectable()
export class CompletedService {
  constructor (
    private prisma: PrismaService
  ){}

  async todayTodosGet(user_id: number) {
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
          user_id: user_id,
          start_date: {
            lte: startOfToday
          },
          end_date: {
            gt: endOfToday
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
  async toggleTodoCompletion(complete_todo_id: number, user_id: number) {
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
                user_plant_id: user_plant?.user_plant_id
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
  async getTodoByDateRange(start_date_string: Date, end_date_string: Date, userId: number) {
    try {
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
        });
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