import { CreateExperienceDto } from './create-experience.dto'

import { PartialType } from '@nestjs/swagger'

export class SearchExperienceDto extends PartialType(CreateExperienceDto) {}
