import { CommonRepositoryInterface } from '@repositories/common.repository.interface'
import { Project } from '../entities/project.entity'

export interface ProjectsRepositoryInterface
  extends CommonRepositoryInterface<Project> {}
