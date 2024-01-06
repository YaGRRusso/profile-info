import { PartialType } from '@nestjs/mapped-types'
import { CreateProjectDto } from './create-project.dto'

export class SearchProjectDto extends PartialType(CreateProjectDto) {}
