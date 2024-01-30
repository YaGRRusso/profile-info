import { CreateFormationDto } from './create-formation.dto'

import { PartialType } from '@nestjs/swagger'

export class UpdateFormationDto extends PartialType(CreateFormationDto) {}
