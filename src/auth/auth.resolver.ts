import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { SignInInput } from "./dto/sign-in.input";
import { AuthUser } from "./entities/auth.entity";

@Resolver(() => AuthUser)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  signIn(@Args("signInInput") signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  signOut() {
    return true;
  }
}
