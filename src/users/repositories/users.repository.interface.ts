import { CommonRepositoryInterface } from '@repositories/common.repository.interface'
import { User } from '../entities/user.entity'

export interface UsersRepositoryInterface
  extends CommonRepositoryInterface<User> {}
