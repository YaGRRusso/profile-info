import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { Public } from "@/core/decorators/public.decorator";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { AuthService } from "./auth.service";
import { SignInInput } from "./dto/sign-in.input";
import { UpdateMeInput } from "./dto/update-me.input";

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

  @Mutation(() => UserEntity)
  updateMe(
    @Auth() ctx: AuthContext,
    @Args("updateMeInput") updateMeInput: UpdateMeInput
  ) {
    return this.authService.updateMe(ctx, updateMeInput);
  }
}
