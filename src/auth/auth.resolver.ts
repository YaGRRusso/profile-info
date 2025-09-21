import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { GqlAuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { SignInInput } from "./dto/sign-in.input";
import { AuthUser } from "./entities/auth.entity";

@Resolver(() => AuthUser)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GqlAuthGuard)
  @Public()
  @Mutation(() => String)
  signIn(@Args("signInInput") signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }
}
