import { Injectable } from '@nestjs/common'
import { PrismaService } from '@prisma/prisma.service'
import { ClassConstructor } from 'class-transformer'
import { PrismaPromise } from '@prisma/client'
import { CommonRepositoryInterface } from './common.repository.interface'

@Injectable()
export class PrismaCommonRepository<T extends { id?: string }>
  implements CommonRepositoryInterface<T>
{
  protected readonly table: string

  constructor(
    protected prisma: PrismaService,
    protected entity: ClassConstructor<T>,
  ) {
    this.table = this.entity.name.toLowerCase()
  }

  findAll(): PrismaPromise<T[]> {
    return this.prisma[this.table].findMany()
  }

  findOne(id: string): PrismaPromise<T> {
    return this.prisma[this.table].findUnique({
      where: { id },
    })
  }

  searchAll(search: Partial<T> & Record<string, any>): PrismaPromise<T[]> {
    return this.prisma[this.table].findMany({
      where: { ...search },
    })
  }

  create(data: Partial<T> & Record<string, any>): PrismaPromise<T> {
    return this.prisma[this.table].create({ data })
  }

  remove(id: string): PrismaPromise<T> {
    return this.prisma[this.table].delete({ where: { id } })
  }

  update(id: string, data: Partial<T> & Record<string, any>): PrismaPromise<T> {
    return this.prisma[this.table].update({
      where: { id },
      data,
    })
  }
}
