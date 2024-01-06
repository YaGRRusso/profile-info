import { CommonRepositoryInterface } from '@repositories/common.repository.interface'
import { Skill } from '../entities/skill.entity'

export interface SkillsRepositoryInterface
  extends CommonRepositoryInterface<Skill> {}
