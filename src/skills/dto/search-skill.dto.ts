import { CreateSkillDto } from './create-skill.dto'

import { PartialType } from '@nestjs/mapped-types'

export class SearchSkillDto extends PartialType(CreateSkillDto) {}
