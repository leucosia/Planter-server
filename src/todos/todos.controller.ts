import { Controller, Get, Post, Body, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
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

  @ApiOperation({
    summary: "TODO 목록 조회",
    description: "TODO 목록 조회 API\n현재 유저의 TODO 목록을 가져옵니다."
  })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId
    return await this.todosService.findAll(userId)
  }

  @ApiOperation({
    summary: "TODO 개별 조회",
    description: "TODO ID 입력 시 TODO를 조회"
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) todo_id: number, @Request() req) {
    const user_id = req.user.userId
    return await this.todosService.findOne(todo_id, user_id)
  }
}
