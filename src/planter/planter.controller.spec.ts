import { Test, TestingModule } from '@nestjs/testing';
import { PlanterController } from './planter.controller';
import { PlanterService } from './planter.service';

describe('PlanterController', () => {
  let controller: PlanterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanterController],
      providers: [PlanterService],
    }).compile();

    controller = module.get<PlanterController>(PlanterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
