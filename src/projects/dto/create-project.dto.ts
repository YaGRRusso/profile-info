import { ProjectDto } from './project.dto'

import { PickType } from '@nestjs/swagger'

export class CreateProjectDto extends PickType(ProjectDto, [
  'name',
  'description',
  'image',
  'link',
  'skills',
]) {}
