import { Address } from './Address'
import { Course } from './Course'
import { Experience } from './Experience'
import { Formation } from './Formation'
import { Language } from './Language'
import { Link } from './Link'
import { Project } from './Project'
import { Skill } from './Skill'

export class User {
  picture: string
  name: string
  nickname: string
  email: string
  phone: string
  birth: Date
  title: string
  presentation: string
  description: string
  address: Address
  hobbies: string[]
  formations: Formation[]
  languages: Language[]
  links: Link[]

  experiences: Experience[]
  courses: Course[]
  projects: Project[]
  skills: Skill[]
}
