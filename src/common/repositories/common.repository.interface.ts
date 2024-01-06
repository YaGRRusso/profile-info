import { Output } from '@interfaces/output.interface'

export interface CommonRepositoryInterface<Entity> {
  findAll(args?: any): Output<Entity[]>
  findOne(id: string): Output<Entity>
  create(data: Partial<Entity>): Output<Entity>
  remove(id: string): Output<Entity>
  update(id: string, data: Partial<Entity>): Output<Entity>
}
