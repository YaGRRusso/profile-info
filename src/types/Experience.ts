import { Skill } from './Skill'

export class Experience {
  id: string
  organization: string
  roles: {
    name: string
    description: string
    date: {
      start: Date
      end: Date
    }
  }[]

  // n:n
  skillsId: Skill['id'][]
}
