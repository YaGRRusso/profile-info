import { PartialType } from '@nestjs/swagger'
import { CreateExperienceDto } from './create-experience.dto'

export class SearchExperienceDto extends PartialType(CreateExperienceDto) {}
