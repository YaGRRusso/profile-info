import { CreateProjectDto } from './create-project.dto'

import { PartialType } from '@nestjs/mapped-types'

export class SearchProjectDto extends PartialType(CreateProjectDto) {}
