import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AiService } from "./ai.service";
import { AtsSummarizeInput } from "./dto/ats-summarize";
import { GenericIaEntity } from "./entities/ai.entity";

@Resolver(() => GenericIaEntity)
export class AiResolver {
  constructor(readonly aiService: AiService) {}

  @Mutation(() => GenericIaEntity)
  atsSummarize(
    @Args("atsSummarizeInput", { type: () => AtsSummarizeInput })
    atsSummarizeInput: AtsSummarizeInput
  ) {
    return this.aiService.atsSummarize(atsSummarizeInput);
  }
}
