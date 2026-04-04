import { Type } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { BaseService } from "@/core/services/base.service";
import {
  createPaginatedModel,
  PaginatedModel,
} from "../schemas/paginated.schema";

export function BaseResolver<
  ModelType extends object,
  EntityType extends object,
  CreateInputType extends object,
  UpdateInputType extends object,
  FilterInputType extends object,
  SortInputType extends object,
>(
  entityRef: Type<EntityType>,
  createInputRef: Type<CreateInputType>,
  updateInputRef: Type<UpdateInputType>,
  filterInputRef: Type<FilterInputType>,
  sortInputRef: Type<SortInputType>
) {
  const entityName = entityRef.name.replace("Entity", "");
  const PaginatedEntity = createPaginatedModel(entityRef);

  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost {
    protected constructor(
      readonly service: BaseService<ModelType, CreateInputType, UpdateInputType>
    ) {}

    // QUERIES

    @Public()
    @Query(() => entityRef, { name: `findOne${entityName}ById` })
    async findOneById(
      @Args(`${entityName}Id`, { type: () => ID }) id: string
    ): Promise<ModelType> {
      return await this.service.findOneById(id);
    }

    @Public()
    @Query(() => entityRef, { name: `findOne${entityName}` })
    async findOne(
      @Args(`${entityName}Filters`, {
        type: () => filterInputRef,
        nullable: true,
      })
      filters?: FilterInputType
    ): Promise<ModelType> {
      return await this.service.findOne({ filters });
    }

    @Public()
    @Query(() => [entityRef], { name: `findMany${entityName}ById` })
    async findManyById(
      @Args(`${entityName}Ids`, { type: () => [ID] }) ids: string[]
    ): Promise<ModelType[]> {
      return await this.service.findManyById(ids);
    }

    @Public()
    @Query(() => PaginatedEntity, {
      name: `findMany${entityName}s`,
    })
    async findMany(
      @Args(`${entityName}Filters`, {
        type: () => filterInputRef,
        nullable: true,
      })
      filters?: FilterInputType,
      @Args(`${entityName}Pagination`, {
        type: () => PaginationInput,
        nullable: true,
      })
      pagination?: PaginationInput,
      @Args(`${entityName}Sort`, {
        type: () => sortInputRef,
        nullable: true,
      })
      sort?: SortInputType
    ): Promise<PaginatedModel<ModelType>> {
      return await this.service.findMany({
        filters,
        sort,
        ...pagination,
      });
    }

    // MUTATIONS

    @Mutation(() => entityRef, { name: `createOne${entityName}` })
    async createOne(
      @Args(`create${entityName}Input`, { type: () => createInputRef })
      createInput: CreateInputType
    ): Promise<ModelType> {
      return await this.service.createOne(createInput);
    }

    @Mutation(() => [entityRef], { name: `createMany${entityName}s` })
    async createMany(
      @Args(`create${entityName}Inputs`, { type: () => [createInputRef] })
      createInputs: CreateInputType[]
    ): Promise<ModelType[]> {
      return await this.service.createMany(createInputs);
    }

    @Mutation(() => entityRef, { name: `updateOne${entityName}` })
    async updateOne(
      @Args(`${entityName}Id`, { type: () => ID }) id: string,
      @Args(`update${entityName}Input`, { type: () => updateInputRef })
      updateInput: UpdateInputType
    ): Promise<ModelType> {
      return await this.service.updateOne(id, updateInput);
    }

    @Mutation(() => BatchEntity, { name: `updateMany${entityName}s` })
    async updateMany(
      @Args(`${entityName}Ids`, { type: () => [ID] }) ids: string[],
      @Args(`update${entityName}Input`, { type: () => updateInputRef })
      updateInput: UpdateInputType
    ): Promise<BatchEntity> {
      return await this.service.updateMany(ids, updateInput);
    }

    @Mutation(() => entityRef, { name: `removeOne${entityName}` })
    async removeOne(
      @Args(`${entityName}Id`, { type: () => ID }) id: string
    ): Promise<ModelType> {
      return await this.service.removeOne(id);
    }

    @Mutation(() => BatchEntity, { name: `removeMany${entityName}s` })
    async removeMany(
      @Args(`${entityName}Ids`, { type: () => [ID] }) ids: string[]
    ): Promise<BatchEntity> {
      return await this.service.removeMany(ids);
    }
  }

  return BaseResolverHost;
}
