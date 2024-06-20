import { FormationDto } from './dto/formation.dto'

import { CreateFormationDto } from '../formations/dto/create-formation.dto'
import { SearchFormationDto } from '../formations/dto/search-formation.dto'
import { UpdateFormationDto } from '../formations/dto/update-formation.dto'
import { FormationsService } from '../formations/formations.service'

import { AuthRequest } from '@/auth/entities/request.entity'
import { PaginationDto } from '@/common/dto/input.dto'
import { PaginatedResponseDto } from '@/common/dto/output.dto'

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('formations')
@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: PaginatedResponseDto(FormationDto) })
  @Get()
  findAll(@Req() req: AuthRequest, @Query() paginationDto: PaginationDto) {
    return this.formationsService.findAll(req.user.id, paginationDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: PaginatedResponseDto(FormationDto) })
  @Get('/search')
  searchAll(
    @Req() req: AuthRequest,
    @Body() searchFormationDto: SearchFormationDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.formationsService.searchAll(req.user.id, searchFormationDto, paginationDto)
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
  create(@Req() req: AuthRequest, @Body() createFormationDto: CreateFormationDto) {
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
