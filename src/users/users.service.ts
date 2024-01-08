import { Injectable } from '@nestjs/common'
import { PrismaUsersRepository } from './repositories/users.repository.prisma'
import { Output } from 'src/common/interfaces/output.interface'
import { User } from './entities/user.entity'
import { SearchUserDto } from './dto/search-user.dto'
import { MapperService } from '@mappers/mapper.service'

@Injectable()
export class UsersService {
  private readonly mapper: MapperService = new MapperService()

  constructor(private repository: PrismaUsersRepository) {}

  async findAll(): Output<User[]> {
    return await this.repository.findAll()
  }

  async findOne(id: string): Output<User> {
    return await this.repository.findOne({ where: { id } })
  }

  async searchAll(searchUserDto: SearchUserDto): Output<User[]> {
    return await this.repository.findAll({ where: { ...searchUserDto } })
  }

  async create(createUserDto: Partial<User>): Output<User> {
    const payload = this.mapper.toInstance(createUserDto, User)
    return await this.repository.create({ data: { ...payload } })
  }

  async update(id: string, updateUserDto: Partial<User>): Output<User> {
    return await this.repository.update({
      where: { id },
      data: { ...updateUserDto },
    })
  }

  async remove(id: string): Output<User> {
    return await this.repository.remove({ where: { id } })
  }
}
