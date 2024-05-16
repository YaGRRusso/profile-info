import { Role as RoleInterface } from '@/common/interfaces/role.interface'

import { SetMetadata } from '@nestjs/common'

export const ROLE_KEY = 'role'
export const NeedRole = (role: RoleInterface) => {
  return SetMetadata(ROLE_KEY, role)
}
