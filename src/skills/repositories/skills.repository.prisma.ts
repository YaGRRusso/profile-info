import { Injectable } from '@nestjs/common'
import { SkillsRepositoryInterface } from './skills.repository.interface'
import { ClassConstructor } from 'class-transformer'
import { Skill } from '../entities/skill.entity'
import { MapperService } from '@mappers/mapper.service'
import { PrismaService } from '@src/common/prisma/prisma.service'
import { PrismaPromise } from '@prisma/client'

@Injectable()
export class PrismaSkillsRepository implements SkillsRepositoryInterface {
  private readonly entity: ClassConstructor<Skill>
  private readonly mapper: MapperService

  constructor(private prisma: PrismaService) {
    this.mapper = new MapperService()
  }

  findAll(): PrismaPromise<Skill[]> {
    return this.prisma.skill.findMany() as PrismaPromise<Skill[]>
  }

  findOne(id: string): PrismaPromise<Skill> {
    return this.prisma.skill.findUnique({
      where: { id },
    }) as PrismaPromise<Skill>
  }

  searchAll(search: Partial<Skill>): PrismaPromise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { ...search },
    }) as PrismaPromise<Skill[]>
  }

  create(data: Partial<Skill>): PrismaPromise<Skill> {
    const payload = this.mapper.toInstance(data, this.entity)
    return this.prisma.skill.create({
      data: payload,
    }) as PrismaPromise<Skill>
  }

  remove(id: string): PrismaPromise<Skill> {
    return this.prisma.skill.delete({ where: { id } }) as PrismaPromise<Skill>
  }

  update(id: string, data: Partial<Skill>): PrismaPromise<Skill> {
    return this.prisma.skill.update({
      where: { id },
      data,
    }) as PrismaPromise<Skill>
  }
}
