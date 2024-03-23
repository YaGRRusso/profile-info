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
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('formations')
@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @ApiResponse({ type: FormationDto, isArray: true })
  @IsPublic()
  @Get('/from/:id')
  findAllFromUser(@Param('id') id: string) {
    return this.formationsService.findAll(id)
  }

  @ApiResponse({ type: FormationDto, isArray: true })
  @IsPublic()
  @Get('/from/:id/search')
  searchAllFromUser(
    @Param('id') id: string,
    @Body() searchFormationDto: SearchFormationDto,
  ) {
    return this.formationsService.searchAll(id, searchFormationDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: FormationDto, isArray: true })
  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.formationsService.findAll(req.user.id)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: FormationDto, isArray: true })
  @Get('/search')
  searchAll(
    @Req() req: AuthRequest,
    @Body() searchFormationDto: SearchFormationDto,
  ) {
    return this.formationsService.searchAll(req.user.id, searchFormationDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: FormationDto })
  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.formationsService.findOne(req.user.id, id)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: FormationDto })
  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createFormationDto: CreateFormationDto,
  ) {
    return this.formationsService.create(req.user.id, createFormationDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: FormationDto })
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateFormationDto: UpdateFormationDto,
  ) {
    return this.formationsService.update(req.user.id, id, updateFormationDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: FormationDto })
  @Patch(':id/skills/add')
  addSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateFormationDto,
  ) {
    return this.formationsService.addSkills(req.user.id, id, skills)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: FormationDto })
  @Patch(':id/skills/remove')
  removeSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateFormationDto,
  ) {
    return this.formationsService.removeSkills(req.user.id, id, skills)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: FormationDto })
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.formationsService.remove(req.user.id, id)
  }
}
