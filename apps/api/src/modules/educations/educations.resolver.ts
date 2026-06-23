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
import type { RequestContext } from "@/core/context/request-context.interface";
import { Public } from "@/core/decorators/public-route.decorator";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CurrentRequestContext } from "@/modules/auth/decorators/current-request-context.decorator";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import type { Ctx } from "@/modules/graphql/context.interface";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
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

  @Public()
  @Query(() => EducationEntity)
  findOneEducationById(
    @Args("educationId", { type: () => ID }) educationId: string
  ) {
    return this.educationsService.findOneById(null, educationId);
  }

  @Public()
  @Query(() => EducationEntity)
  findOneEducation(
    @Args("educationFilters", {
      type: () => FilterEducationInput,
      nullable: true,
    })
    educationFilters?: FilterEducationInput
  ) {
    return this.educationsService.findOne(null, { filters: educationFilters });
  }

  @Public()
  @Query(() => [EducationEntity])
  findManyEducationById(
    @Args("educationIds", { type: () => [ID] }) educationIds: string[]
  ) {
    return this.educationsService.findManyById(null, educationIds);
  }

  @Public()
  @Query(() => PaginatedEducationEntity)
  findManyEducations(
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
    return this.educationsService.findMany(null, {
      filters: educationFilters,
      sort: educationSort,
      limit: educationPagination?.limit,
      skip: educationPagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => EducationEntity)
  createOneEducation(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("createEducationInput", { type: () => CreateEducationInput })
    createEducationInput: CreateEducationInput
  ) {
    return this.educationsService.createOne(ctx, createEducationInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  createManyEducations(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("createEducationInputs", { type: () => [CreateEducationInput] })
    createEducationInputs: CreateEducationInput[]
  ) {
    return this.educationsService.createMany(ctx, createEducationInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => EducationEntity)
  updateOneEducation(
    @CurrentRequestContext() ctx: RequestContext,
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

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  updateManyEducations(
    @CurrentRequestContext() ctx: RequestContext,
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

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => EducationEntity)
  removeOneEducation(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("educationId", { type: () => ID }) educationId: string
  ) {
    return this.educationsService.removeOne(ctx, educationId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManyEducations(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("educationIds", { type: () => [ID] }) educationIds: string[]
  ) {
    return this.educationsService.removeMany(ctx, educationIds);
  }

  @ResolveField(() => OrganizationEntity)
  organization(@Parent() education: EducationModel, @Context() ctx: Ctx) {
    if (!education?.organization) return null;
    return ctx.loaders.batchOrganizations.load(
      education.organization.toString()
    );
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() education: EducationModel, @Context() ctx: Ctx) {
    const ids = education.skills?.map((id) => id.toString());
    if (!ids) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
