import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginUserDto } from './dto/login-user.dto'
import { Output } from '@interfaces/output.interface'
import { AuthRequest } from './entities/request.entity'
import { NeedRole } from './decorators/role.decorator'
import { IsPublic } from './decorators/public.decorator'
import { JwtAuthGuard } from './guards/jwt.guard'
import { RoleGuard } from './guards/role.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post()
  async login(@Body() { email, password }: LoginUserDto): Output<string> {
    return await this.authService.login(email, password)
  }

  @Get('me')
  async me(@Req() req: AuthRequest): Output<any> {
    return req.user
  }

  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('validate')
  async validate(@Req() req: AuthRequest): Output<any> {
    return req.user
  }
}
