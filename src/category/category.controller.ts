import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { AuthJWTGuard } from 'src/auth/auth.jwt.guard';
import { Category } from 'src/common/types/category.type';

@Controller('category')
@UseGuards(AuthJWTGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({
    summary: "카테고리 생성 API",
    description: "카테고리 생성 API 입니다. 색상 중복은 불가능 하고, 색상에는 '#'이 들어가야 합니다."
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ type: Category })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    const userId = req.user.userId
    return await this.categoryService.create(createCategoryDto, userId);
  }

  @ApiOperation({
    summary: "카테고리 목록 조회 API",
    description: "카테고리 목록을 가져오는 API 입니다."
  })
  @ApiResponse({ type: [Category] })
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId
    return await this.categoryService.findAll(userId)
  }

  @ApiOperation({
    summary: "카테고리 색상 조회 API",
    description: "category id를 이용하여 해당 색상을 조회하는 API 입니다."
  })
  @ApiResponse({ type: Category })
  @Get(':id')
  async findCategory(@Param('id', ParseIntPipe) categoryId: number, @Request() req) {
    const userId = req.user.userId
    return await this.categoryService.findOne(categoryId, userId)
  }

  @ApiOperation({
    summary: "카테고리 색상 변경 API",
    description: "category id 및 색상을 사용하여 category 색상 변경 API 입니다. 색상에는 '#'이 들어가야 합니다."
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ type: Category })
  @Post(':id')
  async updateCategory(@Param('id', ParseIntPipe) categoryId: number, @Request() req, @Body() updateCategoryDto: UpdateCategoryDto){
    const userId = req.user.userId
    return await this.categoryService.updateCategory(categoryId, userId, updateCategoryDto)
  }

  @ApiOperation({
    summary: "카테고리 삭제 API",
    description: "Category id로 카테고리 삭제 API 입니다."
  })
  @ApiResponse({ type: Category })
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) categoryId: number, @Request() req) {
    const userId = req.user.userId;
    return await this.categoryService.deleteCategory(categoryId, userId);
  }
}