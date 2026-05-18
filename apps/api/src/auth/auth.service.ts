import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { UsersService } from "@/users/users.service";
import { SignInInput } from "./dto/sign-in.input";
import { JwtPayload } from "./entities/jwt.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  private async validate(email: string, password: string) {
    const user = await this.usersService.findOne({ filters: { email } });

    if (user) {
      const match = await compare(password, user.password);
      if (match) return user;
    }

    throw new UnauthorizedException();
  }

  async signIn({ email, password }: SignInInput) {
    const user = await this.validate(email, password);

    const payload: JwtPayload = { sub: user.id, role: user.role };
    return await this.jwtService.signAsync(payload);
  }
}
