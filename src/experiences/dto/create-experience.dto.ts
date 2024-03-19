import { ExperienceDto } from './experience.dto'

import { PickType } from '@nestjs/swagger'

export class CreateExperienceDto extends PickType(ExperienceDto, [
  'role',
  'organization',
  'description',
  'start',
  'end',
  'skills',
]) {}
