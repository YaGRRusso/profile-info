import { Output } from '@/common/interfaces/output.interface'

export interface CommonRepositoryInterface<
  Entity,
  FindMany,
  FindUnique,
  Create,
  Delete,
  Update,
> {
  findAll(args?: FindMany): Output<Entity[]>
  findOne(args?: FindUnique): Output<Entity>
  create(args?: Create): Output<Entity>
  remove(args?: Delete): Output<Entity>
  update(args?: Update): Output<Entity>
}
