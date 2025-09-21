import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "@/users/users.service";
import { SignInInput } from "./dto/sign-in.input";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signIn({ email, password }: SignInInput) {
    const user = await this.usersService.findOne({ email, password });
    if (!user) throw new UnauthorizedException();

    const payload = { sub: user.id, username: user.nickname, role: user.role };
    return await this.jwtService.signAsync(payload);
  }
}
