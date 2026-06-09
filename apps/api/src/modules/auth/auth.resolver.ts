import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { AuthService } from "./auth.service";
import { SignInInput } from "./dto/sign-in.input";

@Resolver(() => UserEntity)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => String)
  signIn(@Args("signInInput") signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Query(() => UserEntity)
  getMe(@CurrentUser() user: UserEntity) {
    return user;
  }
}
