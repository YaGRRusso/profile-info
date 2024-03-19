import { CreateSkillDto } from './dto/create-skill.dto'
import { SearchSkillDto } from './dto/search-skill.dto'
import { SkillDto } from './dto/skill.dto'
import { UpdateSkillDto } from './dto/update-skill.dto'
import { SkillsService } from './skills.service'

import { IsPublic } from '@auth/decorators/public.decorator'
import { NeedRole } from '@auth/decorators/role.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt.guard'
import { RoleGuard } from '@auth/guards/role.guard'

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @ApiResponse({ type: SkillDto, isArray: true })
  @IsPublic()
  @Get()
  findAll() {
    return this.skillsService.findAll()
  }

  @ApiResponse({ type: SkillDto })
  @IsPublic()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id)
  }

  @ApiResponse({ type: SkillDto, isArray: true })
  @IsPublic()
  @Get('search')
  searchAll(@Body() searchSkillDto: SearchSkillDto) {
    return this.skillsService.searchAll(searchSkillDto)
  }

  @ApiResponse({ type: SkillDto })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto)
  }

  @ApiResponse({ type: SkillDto })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto)
  }

  @ApiResponse({ type: SkillDto })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id)
  }
}
