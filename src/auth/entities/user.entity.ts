import { Role } from '@interfaces/role.interface'

export class JwtUser {
  id: string
  email: string
  name: string
  role: Role
}
