import { Injectable } from '@nestjs/common'
import { PrismaService } from '@prisma/prisma.service'
import { Prisma, PrismaPromise } from '@prisma/client'
import { CommonRepositoryInterface } from './common.repository.interface'

@Injectable()
export class PrismaCommonRepository<
  Entity,
  FindMany,
  FindUnique,
  Create,
  Delete,
  Update,
> implements
    CommonRepositoryInterface<
      Entity,
      FindMany,
      FindUnique,
      Create,
      Delete,
      Update
    >
{
  protected readonly table: string

  constructor(
    protected prisma: PrismaService,
    protected entity: Prisma.ModelName,
  ) {
    this.table = this.entity.toLowerCase()
  }

  findAll(args?: FindMany): PrismaPromise<Entity[]> {
    return this.prisma[this.table].findMany(args)
  }

  findOne(args?: FindUnique): PrismaPromise<Entity> {
    return this.prisma[this.table].findUnique(args)
  }

  create(args?: Create): PrismaPromise<Entity> {
    return this.prisma[this.table].create(args)
  }

  remove(args?: Delete): PrismaPromise<Entity> {
    return this.prisma[this.table].delete(args)
  }

  update(args?: Update): PrismaPromise<Entity> {
    return this.prisma[this.table].update(args)
  }
}
