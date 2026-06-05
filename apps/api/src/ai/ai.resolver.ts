import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AiService } from "./ai.service";
import { AtsSummarizeInput } from "./dto/ats-summarize.input";
import { SummarizeInput } from "./dto/summarize.input";
import { TranslateInput } from "./dto/translate.input";
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

  @Mutation(() => GenericIaEntity)
  summarize(
    @Args("summarizeInput", { type: () => SummarizeInput })
    summarizeInput: SummarizeInput
  ) {
    return this.aiService.summarize(summarizeInput);
  }

  @Mutation(() => GenericIaEntity)
  translate(
    @Args("translateInput", { type: () => TranslateInput })
    translateInput: TranslateInput
  ) {
    return this.aiService.translate(translateInput);
  }
}
