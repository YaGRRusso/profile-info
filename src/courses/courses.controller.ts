import { CourseDto } from './dto/course.dto'

import { CoursesService } from '../courses/courses.service'
import { CreateCourseDto } from '../courses/dto/create-course.dto'
import { SearchCourseDto } from '../courses/dto/search-course.dto'
import { UpdateCourseDto } from '../courses/dto/update-course.dto'

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

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiResponse({ type: CourseDto, isArray: true })
  @IsPublic()
  @Get('/from/:id')
  findAllFromUser(@Param('id') id: string) {
    return this.coursesService.findAll(id)
  }

  @ApiResponse({ type: CourseDto, isArray: true })
  @IsPublic()
  @Get('/from/:id/search')
  searchAllFromUser(
    @Param('id') id: string,
    @Body() searchCourseDto: SearchCourseDto,
  ) {
    return this.coursesService.searchAll(id, searchCourseDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: CourseDto, isArray: true })
  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.coursesService.findAll(req.user.id)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: CourseDto, isArray: true })
  @Get('/search')
  searchAll(@Req() req: AuthRequest, @Body() searchCourseDto: SearchCourseDto) {
    return this.coursesService.searchAll(req.user.id, searchCourseDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: CourseDto })
  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.coursesService.findOne(req.user.id, id)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: CourseDto })
  @Post()
  create(@Req() req: AuthRequest, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(req.user.id, createCourseDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: CourseDto })
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(req.user.id, id, updateCourseDto)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: CourseDto })
  @Patch(':id/skills/add')
  addSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateCourseDto,
  ) {
    return this.coursesService.addSkills(req.user.id, id, skills)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: CourseDto })
  @Patch(':id/skills/remove')
  removeSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateCourseDto,
  ) {
    return this.coursesService.removeSkills(req.user.id, id, skills)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: CourseDto })
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.coursesService.remove(req.user.id, id)
  }
}
