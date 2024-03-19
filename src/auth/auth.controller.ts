import { AuthService } from './auth.service'
import { IsPublic } from './decorators/public.decorator'
import { NeedRole } from './decorators/role.decorator'
import { LoginUserDto } from './dto/login-user.dto'
import { AuthRequest } from './entities/request.entity'
import { JwtAuthGuard } from './guards/jwt.guard'
import { RoleGuard } from './guards/role.guard'

import { Output } from '@interfaces/output.interface'
import { UserDto } from '@src/users/dto/user.dto'

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post()
  async login(@Body() { email, password }: LoginUserDto): Output<string> {
    return await this.authService.login(email, password)
  }

  @ApiResponse({ type: UserDto })
  @Get('me')
  async me(@Req() req: AuthRequest): Output<unknown> {
    return req.user
  }

  @ApiResponse({ type: UserDto })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('validate')
  async validate(@Req() req: AuthRequest): Output<unknown> {
    return req.user
  }
}
