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
import { ApiTags } from '@nestjs/swagger'
import { CoursesService } from '../courses/courses.service'
import { CreateCourseDto } from '../courses/dto/create-course.dto'
import { SearchCourseDto } from '../courses/dto/search-course.dto'
import { UpdateCourseDto } from '../courses/dto/update-course.dto'

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @IsPublic()
  @Get()
  findAll() {
    return this.coursesService.findAll()
  }

  @IsPublic()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id)
  }

  @IsPublic()
  @Get('/search')
  searchAll(@Body() searchCourseDto: SearchCourseDto) {
    return this.coursesService.searchAll(searchCourseDto)
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(req.user.id, createCourseDto)
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(req.user.id, id, updateCourseDto)
  }

  @Patch(':id/skills/add')
  addSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateCourseDto,
  ) {
    return this.coursesService.addSkills(req.user.id, id, skills)
  }

  @Patch(':id/skills/remove')
  removeSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateCourseDto,
  ) {
    return this.coursesService.removeSkills(req.user.id, id, skills)
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.coursesService.remove(req.user.id, id)
  }
}
