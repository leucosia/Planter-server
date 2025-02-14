import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanterService } from './planter.service';
import { CreatePlanterDto } from './dto/create-planter.dto';
import { UpdatePlanterDto } from './dto/update-planter.dto';

@Controller('planter')
export class PlanterController {
  constructor(private readonly planterService: PlanterService) {}

  @Post()
  create(@Body() createPlanterDto: CreatePlanterDto) {
    return this.planterService.create(createPlanterDto);
  }

  @Get()
  findAll() {
    return this.planterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanterDto: UpdatePlanterDto) {
    return this.planterService.update(+id, updatePlanterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planterService.remove(+id);
  }
}
