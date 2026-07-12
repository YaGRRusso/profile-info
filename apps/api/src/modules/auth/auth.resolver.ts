import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { Public } from "@/core/decorators/public.decorator";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { RegisterUserInput } from "@/modules/users/dto/register-user.input";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { UsersService } from "@/modules/users/users.service";
import { AuthService } from "./auth.service";
import { SignInInput } from "./dto/sign-in.input";
import { UpdateMeInput } from "./dto/update-me.input";

@Resolver(() => UserEntity)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Public()
  @Mutation(() => String)
  signIn(@Args("signInInput") signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Public()
  @Mutation(() => UserEntity)
  register(@Args("registerInput") registerInput: RegisterUserInput) {
    return this.authService.register(registerInput);
  }

  @Query(() => UserEntity)
  getMe(@Auth() ctx: AuthContext) {
    return this.usersService.findOneById(ctx.id);
  }

  @Mutation(() => UserEntity)
  updateMe(
    @Auth() ctx: AuthContext,
    @Args("updateMeInput") updateMeInput: UpdateMeInput
  ) {
    return this.authService.updateMe(ctx, updateMeInput);
  }
}
