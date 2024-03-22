import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectDto } from './dto/project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectsService } from './projects.service'

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

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiResponse({ type: ProjectDto, isArray: true })
  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.projectsService.findAll(req.user.id)
  }

  @ApiResponse({ type: ProjectDto })
  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.id, id)
  }

  @ApiResponse({ type: ProjectDto, isArray: true })
  @Get('/search')
  searchAll(
    @Req() req: AuthRequest,
    @Body() searchProjectDto: SearchProjectDto,
  ) {
    return this.projectsService.searchAll(req.user.id, searchProjectDto)
  }

  @ApiResponse({ type: ProjectDto })
  @Post()
  create(@Req() req: AuthRequest, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, createProjectDto)
  }

  @ApiResponse({ type: ProjectDto })
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(req.user.id, id, updateProjectDto)
  }

  @ApiResponse({ type: ProjectDto })
  @Patch(':id/skills/add')
  addSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateProjectDto,
  ) {
    return this.projectsService.addSkills(req.user.id, id, skills)
  }

  @ApiResponse({ type: ProjectDto })
  @Patch(':id/skills/remove')
  removeSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateProjectDto,
  ) {
    return this.projectsService.removeSkills(req.user.id, id, skills)
  }

  @ApiResponse({ type: ProjectDto })
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.projectsService.remove(req.user.id, id)
  }
}
