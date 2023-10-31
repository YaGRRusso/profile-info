import { Output } from './output.interface'

export interface CommonRepositoryInterface<Entity> {
  findAll(): Output<Entity>
  findOne(where: object): Output<Entity>
  searchAll(search: Partial<Entity>): Output<Entity>
  create(data: Entity): Output<Entity>
  remove(id: string): Output<Entity>
  update(id: string, data: Partial<Entity>): Output<Entity>
}
