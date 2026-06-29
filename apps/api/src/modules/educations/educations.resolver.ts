import {
  Args,
  Context,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
import type { Ctx } from "@/platform/graphql/context.interface";
import { CreateEducationInput } from "./dto/create-education.input";
import { FilterEducationInput } from "./dto/filter-education.input";
import { SortEducationInput } from "./dto/sort-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsService } from "./educations.service";
import {
  EducationEntity,
  PaginatedEducationEntity,
} from "./entities/education.entity";

@Resolver(() => EducationEntity)
export class EducationsResolver {
  constructor(private readonly educationsService: EducationsService) {}

  // QUERIES

  @Query(() => EducationEntity)
  findOneEducationById(
    @Auth() ctx: AuthContext,
    @Args("educationId", { type: () => ID }) educationId: string
  ) {
    return this.educationsService.findOneById(ctx, educationId);
  }

  @Query(() => EducationEntity)
  findOneEducation(
    @Auth() ctx: AuthContext,
    @Args("educationFilters", {
      type: () => FilterEducationInput,
      nullable: true,
    })
    educationFilters?: FilterEducationInput
  ) {
    return this.educationsService.findOne(ctx, { filters: educationFilters });
  }

  @Query(() => [EducationEntity])
  findManyEducationById(
    @Auth() ctx: AuthContext,
    @Args("educationIds", { type: () => [ID] }) educationIds: string[]
  ) {
    return this.educationsService.findManyById(ctx, educationIds);
  }

  @Query(() => PaginatedEducationEntity)
  findManyEducations(
    @Auth() ctx: AuthContext,
    @Args("educationFilters", {
      type: () => FilterEducationInput,
      nullable: true,
    })
    educationFilters?: FilterEducationInput,
    @Args("educationPagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    educationPagination?: PaginationInput,
    @Args("educationSort", {
      type: () => SortEducationInput,
      nullable: true,
    })
    educationSort?: SortEducationInput
  ) {
    return this.educationsService.findMany(ctx, {
      filters: educationFilters,
      sort: educationSort,
      limit: educationPagination?.limit,
      skip: educationPagination?.skip,
    });
  }

  // MUTATIONS

  @Mutation(() => EducationEntity)
  createOneEducation(
    @Auth() ctx: AuthContext,
    @Args("createEducationInput", { type: () => CreateEducationInput })
    createEducationInput: CreateEducationInput
  ) {
    return this.educationsService.createOne(ctx, createEducationInput);
  }

  @Mutation(() => BatchEntity)
  createManyEducations(
    @Auth() ctx: AuthContext,
    @Args("createEducationInputs", { type: () => [CreateEducationInput] })
    createEducationInputs: CreateEducationInput[]
  ) {
    return this.educationsService.createMany(ctx, createEducationInputs);
  }

  @Mutation(() => EducationEntity)
  updateOneEducation(
    @Auth() ctx: AuthContext,
    @Args("educationId", { type: () => ID }) educationId: string,
    @Args("updateEducationInput", { type: () => UpdateEducationInput })
    updateEducationInput: UpdateEducationInput
  ) {
    return this.educationsService.updateOne(
      ctx,
      educationId,
      updateEducationInput
    );
  }

  @Mutation(() => BatchEntity)
  updateManyEducations(
    @Auth() ctx: AuthContext,
    @Args("educationIds", { type: () => [ID] }) educationIds: string[],
    @Args("updateEducationInput", { type: () => UpdateEducationInput })
    updateEducationInput: UpdateEducationInput
  ) {
    return this.educationsService.updateMany(
      ctx,
      educationIds,
      updateEducationInput
    );
  }

  @Mutation(() => EducationEntity)
  removeOneEducation(
    @Auth() ctx: AuthContext,
    @Args("educationId", { type: () => ID }) educationId: string
  ) {
    return this.educationsService.removeOne(ctx, educationId);
  }

  @Mutation(() => BatchEntity)
  removeManyEducations(
    @Auth() ctx: AuthContext,
    @Args("educationIds", { type: () => [ID] }) educationIds: string[]
  ) {
    return this.educationsService.removeMany(ctx, educationIds);
  }

  @ResolveField(() => UserEntity)
  owner(@Parent() education: EducationEntity, @Context() ctx: Ctx) {
    if (!education?.ownerId) return null;
    return ctx.loaders.batchUsers.load(education.ownerId);
  }

  @ResolveField(() => OrganizationEntity)
  organization(@Parent() education: EducationEntity, @Context() ctx: Ctx) {
    if (!education?.organizationId) return null;
    return ctx.loaders.batchOrganizations.load(education.organizationId);
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() education: EducationEntity, @Context() ctx: Ctx) {
    const ids = education.skillIds;
    if (!ids) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
