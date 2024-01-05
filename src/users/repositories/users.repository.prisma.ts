import { Injectable } from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import { User } from '../entities/user.entity'
import { UsersRepositoryInterface } from './users.repository.interface'
import { MapperService } from 'src/common/mappers/mapper.service'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { PrismaPromise } from '@prisma/client'

@Injectable()
export class PrismaUsersRepository implements UsersRepositoryInterface {
  private readonly entity: ClassConstructor<User>
  private readonly mapper: MapperService

  constructor(private prisma: PrismaService) {
    this.mapper = new MapperService()
  }

  findAll(): PrismaPromise<User[]> {
    return this.prisma.user.findMany()
  }

  findOne(id: string): PrismaPromise<User> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  searchAll(search: Partial<User>): PrismaPromise<User[]> {
    return this.prisma.user.findMany({ where: { ...search } })
  }

  create(data: Partial<User>): PrismaPromise<User> {
    const payload = this.mapper.toInstance(data, this.entity)
    return this.prisma.user.create({ data: payload })
  }

  remove(id: string): PrismaPromise<User> {
    return this.prisma.user.delete({ where: { id } })
  }

  update(id: string, data: Partial<User>): PrismaPromise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }
}
