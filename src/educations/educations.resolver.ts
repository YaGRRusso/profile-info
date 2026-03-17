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
import type { EducationModel } from "@/schemas/education.schema";
import { SkillEntity } from "@/skills/entities/skill.entity";
import { CreateEducationInput } from "./dto/create-education.input";
import { FilterEducationInput } from "./dto/filter-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsService } from "./educations.service";
import { EducationEntity } from "./entities/education.entity";

@Resolver(() => EducationEntity)
export class EducationsResolver {
  constructor(private readonly educationsService: EducationsService) {}

  // QUERIES

  @Public()
  @Query(() => EducationEntity)
  findOneEducationById(@Args("id", { type: () => ID }) id: string) {
    return this.educationsService.findOneById(id);
  }

  @Public()
  @Query(() => EducationEntity)
  findOneEducation(
    @Args("filters", {
      type: () => FilterEducationInput,
      nullable: true,
    })
    filters?: FilterEducationInput
  ) {
    return this.educationsService.findOne(filters);
  }

  @Public()
  @Query(() => [EducationEntity])
  findManyEducationById(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.educationsService.findManyById(ids);
  }

  @Public()
  @Query(() => [EducationEntity])
  findManyEducations(
    @Args("filters", {
      type: () => FilterEducationInput,
      nullable: true,
    })
    filters?: FilterEducationInput,
    @Args("pagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput
  ) {
    return this.educationsService.findMany({
      filters,
      ...pagination,
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
    @Args("id", { type: () => ID }) id: string,
    @Args("updateEducationInput", { type: () => UpdateEducationInput })
    updateEducationInput: UpdateEducationInput
  ) {
    return this.educationsService.updateOne(id, updateEducationInput);
  }

  @Mutation(() => BatchEntity)
  updateManyEducations(
    @Args("ids", { type: () => [ID] }) ids: string[],
    @Args("updateEducationInput", { type: () => UpdateEducationInput })
    updateEducationInput: UpdateEducationInput
  ) {
    return this.educationsService.updateMany(ids, updateEducationInput);
  }

  @Mutation(() => EducationEntity)
  removeOneEducation(@Args("id", { type: () => ID }) id: string) {
    return this.educationsService.removeOne(id);
  }

  @Mutation(() => BatchEntity)
  removeManyEducations(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.educationsService.removeMany(ids);
  }

  // RESOLVERS

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
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
