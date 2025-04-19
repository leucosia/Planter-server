import { Controller, Get, Post, Body, UseGuards, Request, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { TodosService } from './todos.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { CreateTodoBodyDto } from './dto/create.todo.body.dto';
import { UpdateTodoBodyDto } from './dto/update.todo.body.dto';
import { AuthJWTGuard } from 'src/auth/auth.jwt.guard';
import { Todo } from 'src/common/types/todo.type';


@Controller('todos')
@UseGuards(AuthJWTGuard)
@ApiBearerAuth()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @ApiOperation({
    summary: "TODO 생성",
    description: "TODO 생성 API"
  })
  @ApiBody({ type: CreateTodoBodyDto })
  @Post()
  async create(@Body() createTodoDto: CreateTodoBodyDto, @Request() req) {
    const userId = req.user.userId
    return await this.todosService.create(createTodoDto, userId);
  }

  @ApiOperation({
    summary: "TODO 목록 조회",
    description: "TODO 목록 조회 API\n현재 유저의 TODO 목록을 가져옵니다."
  })
  @ApiResponse({ type: [Todo] })
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId
    return await this.todosService.findAll(userId)
  }

  @ApiOperation({
    summary: "TODO 개별 조회",
    description: "TODO ID 입력 시 TODO를 조회"
  })
  @ApiResponse({ type: Todo })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) todo_id: number, @Request() req) {
    const userId = req.user.userId
    return await this.todosService.findOne(todo_id, userId)
  }

  @ApiOperation({
    summary: "TODO 업데이트",
    description: "TODO 업데이트 API"
  })
  @ApiResponse({ type: Todo })
  @ApiBody({ type: UpdateTodoBodyDto })
  @Post(':id')
  async update(@Param('id', ParseIntPipe) todo_id: number, @Request() req, @Body() updateTodoDto: UpdateTodoBodyDto) {
    const userId = req.user.userId
    return await this.todosService.update(todo_id, userId, updateTodoDto)
  }

  @ApiOperation({
    summary: "TODO 삭제",
    description: "TODO 삭제 API"
  })
  @ApiResponse({ type: Todo })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) todo_id: number, @Request() req) {
    const userId = req.user.userId
    console.log(req);
    return await this.todosService.remove(todo_id, userId)
  }
}