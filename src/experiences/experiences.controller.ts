import { ExperienceDto } from './dto/experience.dto'

import { CreateExperienceDto } from '../experiences/dto/create-experience.dto'
import { SearchExperienceDto } from '../experiences/dto/search-experience.dto'
import { UpdateExperienceDto } from '../experiences/dto/update-experience.dto'
import { ExperiencesService } from '../experiences/experiences.service'

import { AuthRequest } from '@auth/entities/request.entity'

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @ApiResponse({ type: ExperienceDto, isArray: true })
  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.experiencesService.findAll(req.user.id)
  }

  @ApiResponse({ type: ExperienceDto })
  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.experiencesService.findOne(req.user.id, id)
  }

  @ApiResponse({ type: ExperienceDto, isArray: true })
  @Get('/search')
  searchAll(
    @Req() req: AuthRequest,
    @Body() searchExperienceDto: SearchExperienceDto,
  ) {
    return this.experiencesService.searchAll(req.user.id, searchExperienceDto)
  }

  @ApiResponse({ type: ExperienceDto })
  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createExperienceDto: CreateExperienceDto,
  ) {
    return this.experiencesService.create(req.user.id, createExperienceDto)
  }

  @ApiResponse({ type: ExperienceDto })
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ) {
    return this.experiencesService.update(req.user.id, id, updateExperienceDto)
  }

  @ApiResponse({ type: ExperienceDto })
  @Patch(':id/skills/add')
  addSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateExperienceDto,
  ) {
    return this.experiencesService.addSkills(req.user.id, id, skills)
  }

  @ApiResponse({ type: ExperienceDto })
  @Patch(':id/skills/remove')
  removeSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateExperienceDto,
  ) {
    return this.experiencesService.removeSkills(req.user.id, id, skills)
  }

  @ApiResponse({ type: ExperienceDto })
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.experiencesService.remove(req.user.id, id)
  }
}
