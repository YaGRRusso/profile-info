import { PartialType } from '@nestjs/swagger'
import { CreateFormationDto } from './create-formation.dto'

export class SearchFormationDto extends PartialType(CreateFormationDto) {}
