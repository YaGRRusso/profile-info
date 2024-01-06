import { CommonRepositoryInterface } from 'src/common/interfaces/repository.interface'
import { Skill } from '../entities/skill.entity'

export interface SkillsRepositoryInterface
  extends CommonRepositoryInterface<Skill> {}
