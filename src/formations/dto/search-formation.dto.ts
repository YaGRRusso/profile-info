import { CreateFormationDto } from './create-formation.dto'

import { PartialType } from '@nestjs/swagger'

export class SearchFormationDto extends PartialType(CreateFormationDto) {}
