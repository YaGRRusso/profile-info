import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Throttle } from "@nestjs/throttler";
import { AiToolsService } from "./ai-tools.service";
import { AtsSummarizeInput } from "./dto/ats-summarize.input";
import { SummarizeInput } from "./dto/summarize.input";
import { TranslateInput } from "./dto/translate.input";
import { AiEntity } from "./entities/ai-response.entity";
import { GqlThrottlerGuard } from "./gql-throttler.guard";

@UseGuards(GqlThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60_000 } })
@Resolver(() => AiEntity)
export class AiToolsResolver {
  constructor(private readonly aiToolsService: AiToolsService) {}

  @Mutation(() => AiEntity)
  atsSummarize(
    @Args("atsSummarizeInput", { type: () => AtsSummarizeInput })
    atsSummarizeInput: AtsSummarizeInput
  ) {
    return this.aiToolsService.atsSummarize(atsSummarizeInput);
  }

  @Mutation(() => AiEntity)
  summarize(
    @Args("summarizeInput", { type: () => SummarizeInput })
    summarizeInput: SummarizeInput
  ) {
    return this.aiToolsService.summarize(summarizeInput);
  }

  @Mutation(() => AiEntity)
  translate(
    @Args("translateInput", { type: () => TranslateInput })
    translateInput: TranslateInput
  ) {
    return this.aiToolsService.translate(translateInput);
  }
}
