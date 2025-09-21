import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserModel } from "@/schemas/user.schema";
import { UsersService } from "@/users/users.service";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not defined");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<UserModel> {
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
