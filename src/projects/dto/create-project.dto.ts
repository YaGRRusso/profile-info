import { IsNotEmpty, IsString } from 'class-validator'
import { Project } from '../entities/project.entity'

export class CreateProjectDto implements Partial<Project> {
  @IsNotEmpty()
  @IsString()
  name?: string

  @IsString()
  description?: string

  @IsString()
  image?: string

  @IsString()
  link?: string
}
