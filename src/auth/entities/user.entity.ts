import { Role } from '@/common/interfaces/role.interface'

export class JwtUser {
  id: string
  email: string
  name: string
  role: Role
}
