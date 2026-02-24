import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EducationsService } from './educations.service';
import { Education } from './entities/education.entity';
import { CreateEducationInput } from './dto/create-education.input';
import { UpdateEducationInput } from './dto/update-education.input';

@Resolver(() => Education)
export class EducationsResolver {
  constructor(private readonly educationsService: EducationsService) {}

  @Mutation(() => Education)
  createEducation(@Args('createEducationInput') createEducationInput: CreateEducationInput) {
    return this.educationsService.create(createEducationInput);
  }

  @Query(() => [Education], { name: 'educations' })
  findAll() {
    return this.educationsService.findAll();
  }

  @Query(() => Education, { name: 'education' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.educationsService.findOne(id);
  }

  @Mutation(() => Education)
  updateEducation(@Args('updateEducationInput') updateEducationInput: UpdateEducationInput) {
    return this.educationsService.update(updateEducationInput.id, updateEducationInput);
  }

  @Mutation(() => Education)
  removeEducation(@Args('id', { type: () => Int }) id: number) {
    return this.educationsService.remove(id);
  }
}
