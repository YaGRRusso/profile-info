import { Type } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { BaseService } from "@/core/services/base.service";

export function BaseResolver<
  ModelType extends object,
  EntityType extends object,
  CreateInputType extends object,
  UpdateInputType extends object,
  FilterInputType extends object,
>(
  entityRef: Type<EntityType>,
  createInputRef: Type<CreateInputType>,
  updateInputRef: Type<UpdateInputType>,
  filterInputRef: Type<FilterInputType>
) {
  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost {
    protected constructor(
      readonly service: BaseService<ModelType, CreateInputType, UpdateInputType>
    ) {}

    // QUERIES

    @Public()
    @Query(() => entityRef, { name: `findOne${entityRef.name}ById` })
    async findOneById(
      @Args("id", { type: () => ID }) id: string
    ): Promise<ModelType> {
      return await this.service.findOneById(id);
    }

    @Public()
    @Query(() => entityRef, { name: `findOne${entityRef.name}` })
    async findOne(
      @Args("filters", { type: () => filterInputRef, nullable: true })
      filters?: FilterInputType
    ): Promise<ModelType> {
      return await this.service.findOne({ filters: filters as object });
    }

    @Public()
    @Query(() => [entityRef], { name: `findMany${entityRef.name}ById` })
    async findManyById(
      @Args("ids", { type: () => [ID] }) ids: string[]
    ): Promise<ModelType[]> {
      return await this.service.findManyById(ids);
    }

    @Public()
    @Query(() => [entityRef], { name: `findMany${entityRef.name}s` })
    async findMany(
      @Args("filters", { type: () => filterInputRef, nullable: true })
      filters?: FilterInputType,
      @Args("pagination", { type: () => PaginationInput, nullable: true })
      pagination?: PaginationInput
    ): Promise<ModelType[]> {
      return await this.service.findMany({
        filters: filters as object,
        ...pagination,
      });
    }

    // MUTATIONS

    @Mutation(() => entityRef, { name: `createOne${entityRef.name}` })
    async createOne(
      @Args(`create${entityRef.name}Input`, { type: () => createInputRef })
      createInput: CreateInputType
    ): Promise<ModelType> {
      return await this.service.createOne(createInput);
    }

    @Mutation(() => [entityRef], { name: `createMany${entityRef.name}s` })
    async createMany(
      @Args(`create${entityRef.name}Inputs`, { type: () => [createInputRef] })
      createInputs: CreateInputType[]
    ): Promise<ModelType[]> {
      return await this.service.createMany(createInputs);
    }

    @Mutation(() => entityRef, { name: `updateOne${entityRef.name}` })
    async updateOne(
      @Args("id", { type: () => ID }) id: string,
      @Args(`update${entityRef.name}Input`, { type: () => updateInputRef })
      updateInput: UpdateInputType
    ): Promise<ModelType> {
      return await this.service.updateOne(id, updateInput);
    }

    @Mutation(() => BatchEntity, { name: `updateMany${entityRef.name}s` })
    async updateMany(
      @Args("ids", { type: () => [ID] }) ids: string[],
      @Args(`update${entityRef.name}Input`, { type: () => updateInputRef })
      updateInput: UpdateInputType
    ): Promise<BatchEntity> {
      return await this.service.updateMany(ids, updateInput);
    }

    @Mutation(() => entityRef, { name: `removeOne${entityRef.name}` })
    async removeOne(
      @Args("id", { type: () => ID }) id: string
    ): Promise<ModelType> {
      return await this.service.removeOne(id);
    }

    @Mutation(() => BatchEntity, { name: `removeMany${entityRef.name}s` })
    async removeMany(
      @Args("ids", { type: () => [ID] }) ids: string[]
    ): Promise<BatchEntity> {
      return await this.service.removeMany(ids);
    }
  }

  return BaseResolverHost;
}
