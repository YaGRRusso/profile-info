import { Skill } from './Skill'

export class Formation {
  id: string
  course: string
  college: string
  description: string
  status: 'incomplete' | 'complete'
  certificate?: string
  start: Date
  end?: Date

  // n:n
  skillsId: Skill['id'][]
}
