import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectDto } from './dto/project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectsService } from './projects.service'

import { IsPublic } from '@/auth/decorators/public.decorator'
import { AuthRequest } from '@/auth/entities/request.entity'

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

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiResponse({ type: ProjectDto, isArray: true })
  @IsPublic()
  @Get('/from/:id')
  findAllFromUser(@Param('id') id: string) {
    return this.projectsService.findAll(id)
  }

  @ApiResponse({ type: ProjectDto, isArray: true })
  @IsPublic()
  @Get('/from/:id/search')
  searchAllFromUser(
    @Param('id') id: string,
    @Body() searchProjectDto: SearchProjectDto,
  ) {
    return this.projectsService.searchAll(id, searchProjectDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: ProjectDto, isArray: true })
  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.projectsService.findAll(req.user.id)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: ProjectDto, isArray: true })
  @Get('/search')
  searchAll(
    @Req() req: AuthRequest,
    @Body() searchProjectDto: SearchProjectDto,
  ) {
    return this.projectsService.searchAll(req.user.id, searchProjectDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: ProjectDto })
  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.id, id)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: ProjectDto })
  @Post()
  create(@Req() req: AuthRequest, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, createProjectDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: ProjectDto })
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(req.user.id, id, updateProjectDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: ProjectDto })
  @Patch(':id/skills/add')
  addSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateProjectDto,
  ) {
    return this.projectsService.addSkills(req.user.id, id, skills)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: ProjectDto })
  @Patch(':id/skills/remove')
  removeSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateProjectDto,
  ) {
    return this.projectsService.removeSkills(req.user.id, id, skills)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: ProjectDto })
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.projectsService.remove(req.user.id, id)
  }
}
