import { CommonRepositoryInterface } from 'src/common/interfaces/repository.interface'
import { User } from '../entities/user.entity'

export interface UsersRepositoryInterface
  extends CommonRepositoryInterface<User> {}
