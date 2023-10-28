import { Skill } from './Skill'

export class Course {
  id: string
  course: string
  college: string
  description: string
  status: 'incomplete' | 'complete'
  hours: number
  certificate?: string

  // n:n
  skillsId: Skill['id'][]
}
