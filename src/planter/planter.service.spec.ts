import { Test, TestingModule } from '@nestjs/testing';
import { PlanterService } from './planter.service';

describe('PlanterService', () => {
  let service: PlanterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanterService],
    }).compile();

    service = module.get<PlanterService>(PlanterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
