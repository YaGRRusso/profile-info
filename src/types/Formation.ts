import { Skill } from './Skill'

export class Formation {
  id: string
  course: string
  college: string
  description: string
  status: 'incomplete' | 'complete'
  certificate?: string
  date: {
    start: Date
    end: Date
  }

  // n:n
  skills: Skill['id'][]
}
