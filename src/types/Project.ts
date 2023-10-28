import { Skill } from './Skill'

export class Project {
  id: string
  name: string
  description: string
  image: string

  // n:n
  skillsId: Skill['id'][]
}
