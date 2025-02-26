import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { AuthJWTGuard } from 'src/auth/auth.jwt.guard';

@Controller('category')
@UseGuards(AuthJWTGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({
    summary: "카테고리 생성 API",
    description: "카테고리 생성 API, 색상 중복 불가능"
  })
  @ApiBody({ type: CreateCategoryDto })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    const userId = req.user.userId
    return this.categoryService.create(createCategoryDto, userId);
  }

  @ApiOperation({
    summary: "카테고리 목록 조회 API",
    description: "카테고리 목록을 가져오는 API 입니다."
  })
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId
    return this.categoryService.findAll(userId)
  }
}
