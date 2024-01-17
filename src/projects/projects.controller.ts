import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { ApiTags } from '@nestjs/swagger'
import { IsPublic } from '@auth/decorators/public.decorator'
import { AuthRequest } from '@auth/entities/request.entity'

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Req() req: AuthRequest) {
    return this.projectsService.create({
      userId: req.user.id,
      ...createProjectDto,
    })
  }

  @IsPublic()
  @Get()
  findAll() {
    return this.projectsService.findAll()
  }

  @IsPublic()
  @Get('/search')
  searchAll(@Body() searchProjectDto: SearchProjectDto) {
    return this.projectsService.searchAll(searchProjectDto)
  }

  @IsPublic()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto)
  }

  @Patch(':id/skills/add')
  addSkills(@Param('id') id: string, @Body() { skills }: UpdateProjectDto) {
    return this.projectsService.addSkills(id, skills)
  }

  @Patch(':id/skills/remove')
  removeSkills(@Param('id') id: string, @Body() { skills }: UpdateProjectDto) {
    return this.projectsService.removeSkills(id, skills)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id)
  }
}
