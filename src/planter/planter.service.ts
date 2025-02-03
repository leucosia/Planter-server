import { Injectable } from '@nestjs/common';
import { CreatePlanterDto } from './dto/create-planter.dto';
import { UpdatePlanterDto } from './dto/update-planter.dto';

@Injectable()
export class PlanterService {
  create(createPlanterDto: CreatePlanterDto) {
    return 'This action adds a new planter';
  }

  findAll() {
    return `This action returns all planter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planter`;
  }

  update(id: number, updatePlanterDto: UpdatePlanterDto) {
    return `This action updates a #${id} planter`;
  }

  remove(id: number) {
    return `This action removes a #${id} planter`;
  }
}
