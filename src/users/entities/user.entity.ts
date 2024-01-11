import { Role } from '@interfaces/role.interface'

export class User {
  id: string
  picture: string
  name: string
  nickname: string
  email: string
  password: string
  phone: string
  birth: Date
  title: string
  presentation: string
  description: string
  address: string
  postal: string
  role: Role | string
}
