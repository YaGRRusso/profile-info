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
import { Public } from "@/core/decorators/public-route.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import type { Ctx } from "@/core/interfaces/context.interface";
import { OrganizationEntity } from "@/organizations/entities/organization.entity";
import { EducationModel } from "@/schemas/education.schema";
import { SkillEntity } from "@/skills/entities/skill.entity";
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
    return this.educationsService.findOneById(educationId);
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
    return this.educationsService.findOne({ filters: educationFilters });
  }

  @Public()
  @Query(() => [EducationEntity])
  findManyEducationById(
    @Args("educationIds", { type: () => [ID] }) educationIds: string[]
  ) {
    return this.educationsService.findManyById(educationIds);
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
    return this.educationsService.findMany({
      filters: educationFilters,
      sort: educationSort,
      limit: educationPagination?.limit,
      skip: educationPagination?.skip,
    });
  }

  // MUTATIONS

  @Mutation(() => EducationEntity)
  createOneEducation(
    @Args("createEducationInput", { type: () => CreateEducationInput })
    createEducationInput: CreateEducationInput
  ) {
    return this.educationsService.createOne(createEducationInput);
  }

  @Mutation(() => [EducationEntity])
  createManyEducations(
    @Args("createEducationInputs", { type: () => [CreateEducationInput] })
    createEducationInputs: CreateEducationInput[]
  ) {
    return this.educationsService.createMany(createEducationInputs);
  }

  @Mutation(() => EducationEntity)
  updateOneEducation(
    @Args("educationId", { type: () => ID }) educationId: string,
    @Args("updateEducationInput", { type: () => UpdateEducationInput })
    updateEducationInput: UpdateEducationInput
  ) {
    return this.educationsService.updateOne(educationId, updateEducationInput);
  }

  @Mutation(() => BatchEntity)
  updateManyEducations(
    @Args("educationIds", { type: () => [ID] }) educationIds: string[],
    @Args("updateEducationInput", { type: () => UpdateEducationInput })
    updateEducationInput: UpdateEducationInput
  ) {
    return this.educationsService.updateMany(
      educationIds,
      updateEducationInput
    );
  }

  @Mutation(() => EducationEntity)
  removeOneEducation(
    @Args("educationId", { type: () => ID }) educationId: string
  ) {
    return this.educationsService.removeOne(educationId);
  }

  @Mutation(() => BatchEntity)
  removeManyEducations(
    @Args("educationIds", { type: () => [ID] }) educationIds: string[]
  ) {
    return this.educationsService.removeMany(educationIds);
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
