import { Role } from '@/common/interfaces/role.interface'

export class UserPayload {
  sub: string
  email: string
  name: string
  role: Role
  iat?: number
  exp?: number
}
