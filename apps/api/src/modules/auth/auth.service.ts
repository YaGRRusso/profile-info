import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { UsersService } from "@/modules/users/users.service";
import { SignInInput } from "./dto/sign-in.input";
import { UpdateMeInput } from "./dto/update-me.input";
import { JwtPayload } from "./entities/jwt.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  private async validate(email: string, password: string) {
    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException();

    const match = await compare(password, user.password);
    if (!match) throw new UnauthorizedException();

    return user;
  }

  async signIn({ email, password }: SignInInput) {
    const user = await this.validate(email, password);

    const payload: JwtPayload = { sub: user.id, role: user.role };
    return await this.jwtService.signAsync(payload);
  }

  updateMe(userId: string, updateMeInput: UpdateMeInput) {
    return this.usersService.updateOne(userId, updateMeInput);
  }
}
