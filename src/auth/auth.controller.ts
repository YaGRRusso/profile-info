import { AuthService } from './auth.service'
import { IsPublic } from './decorators/public.decorator'
import { NeedRole } from './decorators/role.decorator'
import { LoginUserDto, MeDto } from './dto/login-user.dto'
import { AuthRequest } from './entities/request.entity'
import { JwtAuthGuard } from './guards/jwt.guard'
import { RoleGuard } from './guards/role.guard'

import { Output } from '@interfaces/output.interface'

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ type: 'string' })
  @IsPublic()
  @Post()
  async login(@Body() { email, password }: LoginUserDto): Output<string> {
    return await this.authService.login(email, password)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: MeDto })
  @Get('me')
  async me(@Req() req: AuthRequest): Output<unknown> {
    return req.user
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: MeDto })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('validate')
  async validate(@Req() req: AuthRequest): Output<unknown> {
    return req.user
  }
}
