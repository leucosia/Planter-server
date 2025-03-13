import { Controller, Get, Post, Body, UseGuards, Request, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { TodosService } from './todos.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { CreateTodoBodyDto } from './dto/create.todo.body.dto';
import { CreateTodoResponseDTO } from './dto/create.todo.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateTodoBodyDto } from './dto/update.todo.body.dto';
import { UpdateTodoResponseDto } from './dto/update.todo.response.dto';
import { AuthJWTGuard } from 'src/auth/auth.jwt.guard';


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
  @ApiResponse({ type: CreateTodoResponseDTO})
  @Post()
  async create(@Body() createTodoDto: CreateTodoBodyDto, @Request() req) {
    const userId = req.user.userId
    return await this.todosService.create(createTodoDto, userId);
  }

  @ApiOperation({
    summary: "TODO 목록 조회",
    description: "TODO 목록 조회 API\n현재 유저의 TODO 목록을 가져옵니다."
  })
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId
    return await this.todosService.findAll(userId)
  }

  @ApiOperation({
    summary: "TODO 개별 조회",
    description: "TODO ID 입력 시 TODO를 조회"
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) todoId: number, @Request() req) {
    const userId = req.user.userId
    return await this.todosService.findOne(todoId, userId)
  }

  @ApiOperation({
    summary: "TODO 업데이트",
    description: "TODO 업데이트 API"
  })
  @ApiBody({ type: UpdateTodoBodyDto })
  @ApiResponse({ type: UpdateTodoResponseDto })
  @Post(':id')
  async update(@Param('id', ParseIntPipe) todoId: number, @Request() req, @Body() updateTodoDto: UpdateTodoBodyDto) {
    const userId = req.user.userId
    return await this.todosService.update(todoId, userId, updateTodoDto)
  }

  @ApiOperation({
    summary: "TODO 삭제",
    description: "TODO 삭제 API"
  })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) todoId: number, @Request() req) {
    const userId = req.user.userId
    console.log(req);
    return await this.todosService.remove(todoId, userId)
  }
}