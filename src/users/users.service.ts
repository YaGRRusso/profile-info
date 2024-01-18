import { Injectable } from '@nestjs/common'
import { PrismaUsersRepository } from './repositories/users.repository.prisma'
import { Output } from '@interfaces/output.interface'
import { User } from './entities/user.entity'
import { SearchUserDto } from './dto/search-user.dto'
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { manyIds } from '@helpers/prisma.helper'

@Injectable()
export class UsersService {
  constructor(private repository: PrismaUsersRepository) {}

  async findAll(): Output<User[]> {
    return await this.repository.findAll()
  }

  async findOne(id: string): Output<User> {
    return await this.repository.findOne({ where: { id } })
  }

  async searchAll(searchUserDto: SearchUserDto): Output<User[]> {
    return await this.repository.findAll({
      where: {
        ...searchUserDto,
        ...(searchUserDto.skills?.length && {
          skills: { some: { id: searchUserDto.skills[0] } },
        }),
      },
    })
  }

  async create({ password, ...createUserDto }: CreateUserDto): Output<User> {
    const hash = await bcrypt.hash(password, 8)
    return await this.repository.create({
      data: {
        ...createUserDto,
        password: hash,
        role: 'USER',
        skills: { connect: manyIds(createUserDto.skills) },
      },
    })
  }

  async update(id: string, updateUserDto: UpdateUserDto): Output<User> {
    return await this.repository.update({
      where: { id },
      data: {
        ...updateUserDto,
        ...(updateUserDto.skills && {
          skills: { set: [], connect: manyIds(updateUserDto.skills) },
        }),
      },
    })
  }

  addSkills(id: string, skills: string[]): Output<User> {
    return this.repository.update({
      where: { id },
      include: { skills: true },
      data: {
        skills: { connect: manyIds(skills) },
      },
    })
  }

  removeSkills(id: string, skills: string[]): Output<User> {
    return this.repository.update({
      where: { id },
      include: { skills: true },
      data: {
        skills: { disconnect: manyIds(skills) },
      },
    })
  }

  async remove(id: string): Output<User> {
    return await this.repository.remove({ where: { id } })
  }
}
