import { Output } from '@interfaces/output.interface'

export interface CommonRepositoryInterface<Entity> {
  findAll(): Output<Entity[]>
  findOne(id: string): Output<Entity>
  searchAll(search: Partial<Entity>): Output<Entity[]>
  create(data: Partial<Entity>): Output<Entity>
  remove(id: string): Output<Entity>
  update(id: string, data: Partial<Entity>): Output<Entity>
}
