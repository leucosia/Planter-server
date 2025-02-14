import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanterDto } from './create-planter.dto';

export class UpdatePlanterDto extends PartialType(CreatePlanterDto) {}
