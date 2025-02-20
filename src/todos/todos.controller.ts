import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TodosService } from './todos.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTodoBodyDto } from './dto/create.todo.body.dto';
import { CreateTodoResponseDTO } from './dto/create.todo.response.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller('todos')
@ApiBearerAuth()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @ApiOperation({
    summary: "TODO 생성",
    description: "TODO 생성 API"
  })
  @ApiBody({ type: CreateTodoBodyDto })
  @ApiResponse({ type: CreateTodoResponseDTO})
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createTodoDto: CreateTodoBodyDto, @Request() req) {
    const userId = req.user.userId
    return await this.todosService.create(createTodoDto, userId);
  }
}
