import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { AUTH_INVALID_CREDENTIALS } from "@/core/auth/auth.messages";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { RegisterUserInput } from "@/modules/users/dto/register-user.input";
import { UsersService } from "@/modules/users/users.service";
import { UsersValidatorService } from "@/modules/users/users-validator.service";
import { SignInInput } from "./dto/sign-in.input";
import { UpdateMeInput } from "./dto/update-me.input";
import { JwtPayload } from "./entities/jwt.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersValidator: UsersValidatorService,
    private readonly jwtService: JwtService
  ) {}

  private async validate(email: string, password: string) {
    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException(AUTH_INVALID_CREDENTIALS);

    const match = await compare(password, user.password);
    if (!match) throw new UnauthorizedException(AUTH_INVALID_CREDENTIALS);

    this.usersValidator.assertUserEnabled(user);

    return user;
  }

  register(registerInput: RegisterUserInput) {
    return this.usersService.register(registerInput);
  }

  async signIn({ email, password }: SignInInput) {
    const user = await this.validate(email, password);

    const payload: JwtPayload = { role: user.role, sub: user.id };
    return await this.jwtService.signAsync(payload);
  }

  updateMe(ctx: AuthContext, updateMeInput: UpdateMeInput) {
    return this.usersService.updateOne(ctx, ctx.id, updateMeInput);
  }
}
