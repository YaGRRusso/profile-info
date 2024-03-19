import { FormationDto } from './dto/formation.dto'

import { CreateFormationDto } from '../formations/dto/create-formation.dto'
import { SearchFormationDto } from '../formations/dto/search-formation.dto'
import { UpdateFormationDto } from '../formations/dto/update-formation.dto'
import { FormationsService } from '../formations/formations.service'

import { IsPublic } from '@auth/decorators/public.decorator'
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

@ApiTags('formations')
@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @ApiResponse({ type: FormationDto, isArray: true })
  @IsPublic()
  @Get()
  findAll() {
    return this.formationsService.findAll()
  }

  @ApiResponse({ type: FormationDto })
  @IsPublic()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formationsService.findOne(id)
  }

  @ApiResponse({ type: FormationDto, isArray: true })
  @IsPublic()
  @Get('/search')
  searchAll(@Body() searchFormationDto: SearchFormationDto) {
    return this.formationsService.searchAll(searchFormationDto)
  }

  @ApiResponse({ type: FormationDto })
  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createFormationDto: CreateFormationDto,
  ) {
    return this.formationsService.create(req.user.id, createFormationDto)
  }

  @ApiResponse({ type: FormationDto })
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateFormationDto: UpdateFormationDto,
  ) {
    return this.formationsService.update(req.user.id, id, updateFormationDto)
  }

  @ApiResponse({ type: FormationDto })
  @Patch(':id/skills/add')
  addSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateFormationDto,
  ) {
    return this.formationsService.addSkills(req.user.id, id, skills)
  }

  @ApiResponse({ type: FormationDto })
  @Patch(':id/skills/remove')
  removeSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateFormationDto,
  ) {
    return this.formationsService.removeSkills(req.user.id, id, skills)
  }

  @ApiResponse({ type: FormationDto })
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.formationsService.remove(req.user.id, id)
  }
}
