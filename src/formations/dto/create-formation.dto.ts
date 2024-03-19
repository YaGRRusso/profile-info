import { FormationDto } from './formation.dto'

import { PickType } from '@nestjs/swagger'

export class CreateFormationDto extends PickType(FormationDto, [
  'name',
  'school',
  'description',
  'status',
  'certificate',
  'start',
  'end',
  'skills',
]) {}
