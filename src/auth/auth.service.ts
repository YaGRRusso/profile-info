import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "@/users/users.service";
import { SignInInput } from "./dto/sign-in.input";
import { JwtPayload } from "./entities/jwt.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signIn({ email, password }: SignInInput) {
    const user = await this.usersService.findOne({ email, password });
    if (!user) throw new UnauthorizedException();

    const payload: JwtPayload = { sub: user.id, role: user.role };
    return await this.jwtService.signAsync(payload);
  }
}
