import { Test, TestingModule } from '@nestjs/testing';
import { CompletedService } from './completed.service';

describe('CompletedService', () => {
  let service: CompletedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompletedService],
    }).compile();

    service = module.get<CompletedService>(CompletedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
