import { SkillDto } from './skill.dto'

import { PickType } from '@nestjs/swagger'

export class CreateSkillDto extends PickType(SkillDto, ['name', 'category']) {}
