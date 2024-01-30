import { CreateExperienceDto } from './create-experience.dto'

import { PartialType } from '@nestjs/swagger'

export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}
