import { CreateProjectDto } from './create-project.dto'

import { PartialType } from '@nestjs/swagger'

export class SearchProjectDto extends PartialType(CreateProjectDto) {}
